export const PROJECT_DB_NAME = 'moonwave.projects.v1';
export const PROJECT_DB_VERSION = 1;
export const PROJECT_STORE = 'handles';
export const WORKSPACE_HANDLE_KEY = 'workspace';
export const CURRENT_PROJECT_KEY = 'moonwave.currentProjectId.v1';

const PROJECT_FILE = 'project.json';
const CLIPS_DIR = 'clips';
const MAX_PROJECT_NAME_LENGTH = 80;
const MAX_CLIP_TITLE_LENGTH = 120;

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  const value =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

export function supportsFolderProjects() {
  return (
    typeof window !== 'undefined' &&
    typeof window.showDirectoryPicker === 'function' &&
    typeof indexedDB !== 'undefined'
  );
}

export function normalizeProjectName(name) {
  const clean = String(name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PROJECT_NAME_LENGTH);
  return clean || 'Untitled Project';
}

export function normalizeClipTitle(title) {
  const clean = String(title || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CLIP_TITLE_LENGTH);
  return clean || 'Untitled audio';
}

export function slugifyFilePart(value, fallback = 'item') {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 64);
  return slug || fallback;
}

export function clipBaseName({ createdAt = Date.now(), title = 'audio', id = '' } = {}) {
  const date = new Date(createdAt);
  const stamp = Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
  const compactStamp = stamp
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
    .replace('T', '-')
    .toLowerCase();
  const suffix = String(id || randomId('clip')).slice(-8).replace(/[^A-Za-z0-9]/g, '');
  return `${compactStamp}-${slugifyFilePart(title, 'audio')}-${suffix}`;
}

function openProjectDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROJECT_DB_NAME, PROJECT_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openProjectDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(PROJECT_STORE, mode);
      const store = tx.objectStore(PROJECT_STORE);
      const result = callback(store);

      tx.oncomplete = () => resolve(result?.result ?? result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function saveWorkspaceHandle(handle) {
  await withStore('readwrite', (store) => store.put(handle, WORKSPACE_HANDLE_KEY));
}

export async function readWorkspaceHandle() {
  return withStore('readonly', (store) => store.get(WORKSPACE_HANDLE_KEY));
}

export async function clearWorkspaceHandle() {
  await withStore('readwrite', (store) => store.delete(WORKSPACE_HANDLE_KEY));
}

export async function queryWorkspacePermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission) return 'denied';
  return handle.queryPermission({ mode });
}

export async function ensureWorkspacePermission(handle, mode = 'readwrite') {
  if (!handle) return false;
  const existing = await queryWorkspacePermission(handle, mode);
  if (existing === 'granted') return true;
  if (!handle.requestPermission) return false;
  const requested = await handle.requestPermission({ mode });
  return requested === 'granted';
}

export async function chooseWorkspaceFolder() {
  if (!supportsFolderProjects()) {
    throw new Error('Folder projects are available in Chrome or Edge.');
  }

  const handle = await window.showDirectoryPicker({
    id: 'moonwave-projects',
    mode: 'readwrite',
  });
  const allowed = await ensureWorkspacePermission(handle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to save projects.');
  }
  await saveWorkspaceHandle(handle);
  return handle;
}

async function readJsonFile(directoryHandle, fileName) {
  const fileHandle = await directoryHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return JSON.parse(await file.text());
}

async function writeTextFile(directoryHandle, fileName, content) {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function writeBlobFile(directoryHandle, fileName, blob) {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function normalizeProjectRecord(record, folderName) {
  const clips = Array.isArray(record?.clips) ? record.clips : [];
  return {
    id: typeof record?.id === 'string' ? record.id : randomId('project'),
    name: normalizeProjectName(record?.name),
    folderName,
    createdAt: typeof record?.createdAt === 'string' ? record.createdAt : nowIso(),
    updatedAt: typeof record?.updatedAt === 'string' ? record.updatedAt : nowIso(),
    clips: clips
      .filter((clip) => clip && typeof clip.id === 'string')
      .map((clip) => ({
        ...clip,
        projectId: typeof clip.projectId === 'string' ? clip.projectId : record?.id,
      })),
  };
}

export async function listProjects(workspaceHandle) {
  if (!workspaceHandle) return [];
  const allowed = await ensureWorkspacePermission(workspaceHandle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to read projects.');
  }

  const projects = [];
  for await (const [folderName, entry] of workspaceHandle.entries()) {
    if (entry.kind !== 'directory') continue;
    try {
      const record = await readJsonFile(entry, PROJECT_FILE);
      projects.push(normalizeProjectRecord(record, folderName));
    } catch {
      // Ignore ordinary folders in the selected workspace.
    }
  }

  return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function directoryExists(parentHandle, folderName) {
  try {
    await parentHandle.getDirectoryHandle(folderName);
    return true;
  } catch {
    return false;
  }
}

async function uniqueProjectFolderName(workspaceHandle, name) {
  const base = slugifyFilePart(name, 'project');
  let candidate = base;
  let index = 2;
  while (await directoryExists(workspaceHandle, candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

export async function createProjectFolder(workspaceHandle, name) {
  if (!workspaceHandle) {
    throw new Error('Choose a projects folder before creating a project.');
  }

  const allowed = await ensureWorkspacePermission(workspaceHandle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to create projects.');
  }

  const displayName = normalizeProjectName(name);
  const folderName = await uniqueProjectFolderName(workspaceHandle, displayName);
  const projectHandle = await workspaceHandle.getDirectoryHandle(folderName, { create: true });
  await projectHandle.getDirectoryHandle(CLIPS_DIR, { create: true });

  const project = {
    id: randomId('project'),
    name: displayName,
    folderName,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    clips: [],
  };

  await writeTextFile(projectHandle, PROJECT_FILE, `${JSON.stringify(project, null, 2)}\n`);
  return project;
}

async function getProjectHandle(workspaceHandle, project) {
  if (!workspaceHandle || !project?.folderName) {
    throw new Error('Project folder is unavailable.');
  }
  return workspaceHandle.getDirectoryHandle(project.folderName);
}

export async function saveClipToProject(workspaceHandle, project, payload) {
  const allowed = await ensureWorkspacePermission(workspaceHandle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to save audio.');
  }

  const projectHandle = await getProjectHandle(workspaceHandle, project);
  const clipsHandle = await projectHandle.getDirectoryHandle(CLIPS_DIR, { create: true });
  const createdAt = nowIso();
  const clipId = randomId('clip');
  const title = normalizeClipTitle(payload.title || 'Generated audio');
  const format = payload.format || 'mp3';
  const ext = payload.ext || format;
  const baseName = clipBaseName({ createdAt, title, id: clipId });
  const audioFileName = `${baseName}.${ext}`;
  const ssmlFileName = payload.ssml ? `${baseName}.ssml` : null;
  const metadataFileName = `${baseName}.json`;

  await writeBlobFile(clipsHandle, audioFileName, payload.audioBlob);
  if (payload.ssml) {
    await writeTextFile(clipsHandle, ssmlFileName, payload.ssml);
  }

  const clip = {
    id: clipId,
    projectId: project.id,
    title,
    text: payload.text || '',
    textSnippet: payload.textSnippet || title,
    voiceId: payload.voiceId,
    voiceName: payload.voiceName,
    locale: payload.locale,
    style: payload.style,
    styleDegree: payload.styleDegree,
    stylePrompt: payload.stylePrompt,
    hdParameters: payload.hdParameters,
    ratePercent: payload.ratePercent,
    pitchPercent: payload.pitchPercent,
    format,
    ext,
    mime: payload.mime,
    durationSec: payload.durationSec,
    createdAt,
    audioFileName,
    ssmlFileName,
    metadataFileName,
  };

  await writeTextFile(clipsHandle, metadataFileName, `${JSON.stringify(clip, null, 2)}\n`);

  const latestProject = normalizeProjectRecord(
    await readJsonFile(projectHandle, PROJECT_FILE),
    project.folderName
  );
  const updatedProject = {
    ...latestProject,
    updatedAt: createdAt,
    clips: [clip, ...latestProject.clips.filter((item) => item.id !== clip.id)],
  };

  await writeTextFile(projectHandle, PROJECT_FILE, `${JSON.stringify(updatedProject, null, 2)}\n`);
  return clip;
}

export async function readClipFiles(workspaceHandle, project, clip) {
  const allowed = await ensureWorkspacePermission(workspaceHandle, 'read');
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to read audio.');
  }

  const projectHandle = await getProjectHandle(workspaceHandle, project);
  const clipsHandle = await projectHandle.getDirectoryHandle(CLIPS_DIR);
  const audioHandle = await clipsHandle.getFileHandle(clip.audioFileName);
  const audioFile = await audioHandle.getFile();
  let ssml = '';

  if (clip.ssmlFileName) {
    try {
      const ssmlHandle = await clipsHandle.getFileHandle(clip.ssmlFileName);
      ssml = await (await ssmlHandle.getFile()).text();
    } catch {
      ssml = '';
    }
  }

  return {
    blob: audioFile,
    ssml,
  };
}

async function removeFileIfExists(directoryHandle, fileName) {
  if (!fileName) return;
  try {
    await directoryHandle.removeEntry(fileName);
  } catch (error) {
    if (error?.name !== 'NotFoundError') {
      throw error;
    }
  }
}

export async function deleteClipFromProject(workspaceHandle, project, clip) {
  const allowed = await ensureWorkspacePermission(workspaceHandle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to delete audio.');
  }

  const projectHandle = await getProjectHandle(workspaceHandle, project);
  const clipsHandle = await projectHandle.getDirectoryHandle(CLIPS_DIR);

  await removeFileIfExists(clipsHandle, clip.audioFileName);
  await removeFileIfExists(clipsHandle, clip.ssmlFileName);
  await removeFileIfExists(clipsHandle, clip.metadataFileName);

  const latestProject = normalizeProjectRecord(
    await readJsonFile(projectHandle, PROJECT_FILE),
    project.folderName
  );
  const updatedProject = {
    ...latestProject,
    updatedAt: nowIso(),
    clips: latestProject.clips.filter((item) => item.id !== clip.id),
  };

  await writeTextFile(projectHandle, PROJECT_FILE, `${JSON.stringify(updatedProject, null, 2)}\n`);
  return updatedProject;
}

export async function renameClipInProject(workspaceHandle, project, clip, title) {
  const allowed = await ensureWorkspacePermission(workspaceHandle);
  if (!allowed) {
    throw new Error('MoonWave needs folder permission to rename clips.');
  }

  const projectHandle = await getProjectHandle(workspaceHandle, project);
  const clipsHandle = await projectHandle.getDirectoryHandle(CLIPS_DIR);
  const latestProject = normalizeProjectRecord(
    await readJsonFile(projectHandle, PROJECT_FILE),
    project.folderName
  );
  const latestClip = latestProject.clips.find((item) => item.id === clip.id);

  if (!latestClip) {
    throw new Error('Saved clip could not be found.');
  }

  const updatedAt = nowIso();
  const updatedClip = {
    ...latestClip,
    title: normalizeClipTitle(title),
    updatedAt,
  };

  if (!updatedClip.metadataFileName) {
    throw new Error('Saved clip metadata could not be found.');
  }

  await writeTextFile(clipsHandle, updatedClip.metadataFileName, `${JSON.stringify(updatedClip, null, 2)}\n`);

  const updatedProject = {
    ...latestProject,
    updatedAt,
    clips: latestProject.clips.map((item) => (item.id === clip.id ? updatedClip : item)),
  };

  await writeTextFile(projectHandle, PROJECT_FILE, `${JSON.stringify(updatedProject, null, 2)}\n`);
  return { project: updatedProject, clip: updatedClip };
}
