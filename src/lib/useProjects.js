import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  chooseWorkspaceFolder,
  createProjectFolder,
  CURRENT_PROJECT_KEY,
  deleteClipFromProject,
  ensureWorkspacePermission,
  listProjects,
  queryWorkspacePermission,
  readClipFiles,
  readWorkspaceHandle,
  renameClipInProject,
  saveClipToProject,
  supportsFolderProjects,
} from './projectStorage.js';

function sortClips(clips = []) {
  return [...clips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function useProjects() {
  const [supported] = useState(supportsFolderProjects);
  const workspaceHandleRef = useRef(null);
  const [workspaceHandle, setWorkspaceHandle] = useState(null);
  const [workspacePermission, setWorkspacePermission] = useState('unknown');
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectIdState] = useState(() => {
    try {
      return localStorage.getItem(CURRENT_PROJECT_KEY) || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId) || null,
    [projects, currentProjectId]
  );

  const currentProjectClips = useMemo(
    () => sortClips(currentProject?.clips || []),
    [currentProject]
  );

  const rememberWorkspaceHandle = useCallback((handle) => {
    workspaceHandleRef.current = handle;
    setWorkspaceHandle(handle);
  }, []);

  const setCurrentProjectId = useCallback((projectId) => {
    setCurrentProjectIdState(projectId);
    try {
      if (projectId) {
        localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
      } else {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch {
      // Local project selection is a convenience; folder files remain the source of truth.
    }
  }, []);

  const refreshProjects = useCallback(
    async (handle = workspaceHandleRef.current) => {
      if (!supported || !handle) return [];
      setLoading(true);
      setError('');
      try {
        const loaded = await listProjects(handle);
        setProjects(loaded);
        setWorkspacePermission('granted');
        setCurrentProjectIdState((previous) => {
          const stillExists = loaded.some((project) => project.id === previous);
          const next = stillExists ? previous : loaded[0]?.id || '';
          try {
            if (next) localStorage.setItem(CURRENT_PROJECT_KEY, next);
            else localStorage.removeItem(CURRENT_PROJECT_KEY);
          } catch {
            // Ignore localStorage failures.
          }
          return next;
        });
        return loaded;
      } catch (err) {
        setError(err.message || String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supported]
  );

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;

    async function restoreWorkspace() {
      try {
        const handle = await readWorkspaceHandle();
        if (!handle || cancelled) return;
        rememberWorkspaceHandle(handle);
        const permission = await queryWorkspacePermission(handle);
        if (cancelled) return;
        setWorkspacePermission(permission);
        if (permission === 'granted') {
          await refreshProjects(handle);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      }
    }

    restoreWorkspace();
    return () => {
      cancelled = true;
    };
  }, [rememberWorkspaceHandle, supported, refreshProjects]);

  const chooseWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const handle = await chooseWorkspaceFolder();
      rememberWorkspaceHandle(handle);
      setWorkspacePermission('granted');
      return await refreshProjects(handle);
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [rememberWorkspaceHandle, refreshProjects]);

  const reconnectWorkspace = useCallback(async () => {
    if (!workspaceHandle) {
      return chooseWorkspace();
    }

    setLoading(true);
    setError('');
    try {
      const allowed = await ensureWorkspacePermission(workspaceHandle);
      setWorkspacePermission(allowed ? 'granted' : 'denied');
      if (!allowed) {
        throw new Error('MoonWave needs folder permission to read and save projects.');
      }
      return await refreshProjects(workspaceHandle);
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chooseWorkspace, refreshProjects, workspaceHandle]);

  const createProject = useCallback(
    async (name) => {
      let handle = workspaceHandleRef.current;
      if (!handle) {
        await chooseWorkspace();
        handle = workspaceHandleRef.current || (await readWorkspaceHandle());
      }
      if (!handle) {
        throw new Error('Choose a projects folder before creating a project.');
      }

      setLoading(true);
      setError('');
      try {
        const project = await createProjectFolder(handle, name);
        const loaded = await refreshProjects(handle);
        setCurrentProjectId(project.id);
        if (!loaded.some((item) => item.id === project.id)) {
          setProjects((previous) => [project, ...previous]);
        }
        return project;
      } catch (err) {
        setError(err.message || String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [chooseWorkspace, refreshProjects, setCurrentProjectId]
  );

  const saveGeneratedClip = useCallback(
    async (payload) => {
      if (!workspaceHandle || !currentProject) {
        return { saved: false, reason: 'No project selected.' };
      }

      setError('');
      try {
        const clip = await saveClipToProject(workspaceHandle, currentProject, payload);
        await refreshProjects(workspaceHandle);
        return { saved: true, clip };
      } catch (err) {
        setError(err.message || String(err));
        throw err;
      }
    },
    [currentProject, refreshProjects, workspaceHandle]
  );

  const loadClipAudio = useCallback(
    async (projectId, clipId) => {
      const project = projects.find((item) => item.id === projectId);
      const clip = project?.clips?.find((item) => item.id === clipId);
      if (!workspaceHandle || !project || !clip) {
        throw new Error('Saved clip could not be found.');
      }

      const files = await readClipFiles(workspaceHandle, project, clip);
      return { project, clip, ...files };
    },
    [projects, workspaceHandle]
  );

  const deleteClip = useCallback(
    async (projectId, clipId) => {
      const project = projects.find((item) => item.id === projectId);
      const clip = project?.clips?.find((item) => item.id === clipId);
      if (!workspaceHandle || !project || !clip) {
        throw new Error('Saved clip could not be found.');
      }

      setError('');
      try {
        await deleteClipFromProject(workspaceHandle, project, clip);
        await refreshProjects(workspaceHandle);
        return { deleted: true, clip };
      } catch (err) {
        setError(err.message || String(err));
        throw err;
      }
    },
    [projects, refreshProjects, workspaceHandle]
  );

  const renameClip = useCallback(
    async (projectId, clipId, title) => {
      const project = projects.find((item) => item.id === projectId);
      const clip = project?.clips?.find((item) => item.id === clipId);
      if (!workspaceHandle || !project || !clip) {
        throw new Error('Saved clip could not be found.');
      }

      setError('');
      try {
        const result = await renameClipInProject(workspaceHandle, project, clip, title);
        await refreshProjects(workspaceHandle);
        return result;
      } catch (err) {
        setError(err.message || String(err));
        throw err;
      }
    },
    [projects, refreshProjects, workspaceHandle]
  );

  return {
    supported,
    workspaceHandle,
    workspaceName: workspaceHandle?.name || '',
    workspacePermission,
    workspaceReady: Boolean(workspaceHandle && workspacePermission === 'granted'),
    projects,
    currentProject,
    currentProjectId,
    currentProjectClips,
    loading,
    error,
    chooseWorkspace,
    reconnectWorkspace,
    refreshProjects,
    createProject,
    setCurrentProjectId,
    saveGeneratedClip,
    loadClipAudio,
    deleteClip,
    renameClip,
  };
}
