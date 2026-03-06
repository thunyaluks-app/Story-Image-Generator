
import React from 'react';

interface EditorProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onCopy: () => void;
  onClear: () => void;
  onPost?: () => void;
  heightClass?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onCopy, 
  onClear, 
  onPost,
  heightClass = "h-[120px]"
}) => {
  return (
    <div className="w-full flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Label Area */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
          {label}
        </label>
        <span className="text-slate-400 text-xs italic">
          Editable Notepad
        </span>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          className={`w-full ${heightClass} p-6 text-lg text-slate-800 font-handwriting bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none leading-[24px] transition-colors relative z-10`}
          placeholder={placeholder || "Type here..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
        {/* Visual Notepad Lines */}
        <div className="absolute inset-0 pointer-events-none border-b border-slate-200 z-0" style={{ backgroundImage: 'linear-gradient(transparent 23px, #e2e8f0 24px)', backgroundSize: '100% 24px' }}></div>
      </div>

      {/* Button Toolbar */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
          onClick={onClear}
          className="px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 016.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
        
        {onPost && (
          <button
            onClick={onPost}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all text-sm font-medium flex items-center shadow-md shadow-indigo-100"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Post
          </button>
        )}

        <button
          onClick={onCopy}
          className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-all text-sm font-medium flex items-center shadow-md shadow-slate-200"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </button>
      </div>
    </div>
  );
};
