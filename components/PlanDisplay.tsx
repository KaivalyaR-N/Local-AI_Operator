import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { CodeBracketIcon } from './icons';

interface ProjectFileDisplayProps {
  files: ProjectFile[];
}

const ProjectFileItem: React.FC<{ file: ProjectFile }> = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-left"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-slate-100">{file.filename}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isExpanded && (
         <div className="p-4 border-t border-slate-700">
            <div className="mt-2 p-3 bg-slate-900 rounded-md">
                <div className="flex items-center text-xs text-slate-400 mb-2">
                    <CodeBracketIcon className="w-4 h-4 mr-2"/>
                    <span>File Content</span>
                </div>
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto max-h-80">
                    <code>{file.content}</code>
                </pre>
            </div>
        </div>
      )}
    </div>
  );
};


export const ProjectFileDisplay: React.FC<ProjectFileDisplayProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Generated project files will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <ProjectFileItem key={file.id} file={file} />
      ))}
    </div>
  );
};