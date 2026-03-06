import React from 'react';

interface EditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCopy?: () => void;
  onClear?: () => void;
  onPost?: () => void;
  heightClass?: string;
}

export const Editor: React.FC<EditorProps> = ({
  label,
  value,
  onChange,
  onCopy,
  onClear,
  onPost,
  heightClass = "h-[160px]"
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">{label}</label>
        <div className="flex space-x-2">
          {onPost && (
            <button onClick={onPost} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
              Post
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
              Copy
            </button>
          )}
          {onClear && (
            <button onClick={onClear} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 ${heightClass}`}
        placeholder={`Enter ${label.toLowerCase()} here...`}
      />
    </div>
  );
};
