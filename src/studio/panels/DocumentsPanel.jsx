import { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

const MAX_CHARS = 5000;

export default function DocumentsPanel({ onLoadText }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const readFile = (file) => {
    setError('');
    if (!file) return;
    const isText = /\.(txt|md|text)$/i.test(file.name) || file.type.startsWith('text/');
    if (!isText) {
      setError('Only plain-text files (.txt or .md) are supported right now.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '').slice(0, MAX_CHARS);
      onLoadText(content);
    };
    reader.onerror = () => setError('Could not read that file. Please try again.');
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-slate-800">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Load text from a file straight into the editor.
        </p>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          readFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center transition-colors focus-ring ${
          dragOver ? 'border-[#5b8def] bg-[#eaf1ff]' : 'border-slate-300 bg-white/50 hover:bg-white/80'
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef3ff] text-[#5b8def]">
          <UploadCloud size={26} />
        </span>
        <span className="text-base font-medium text-slate-700">
          Drag &amp; drop a document, or click to browse
        </span>
        <span className="text-sm text-slate-400">Supported: .txt, .md</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.text,text/plain"
        className="hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-300/70 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white/60 p-4">
        <FileText size={18} className="mt-0.5 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500">
          Files are read in your browser and never uploaded. Text is trimmed to{' '}
          {MAX_CHARS.toLocaleString()} characters per render.
        </p>
      </div>
    </div>
  );
}
