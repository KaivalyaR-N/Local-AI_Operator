import React from 'react';

interface PreviewDisplayProps {
  htmlContent: string | null;
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({ htmlContent }) => {
  if (!htmlContent) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 bg-slate-950 rounded-lg">
        Generate a project to see the preview here.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden">
      <iframe
        srcDoc={htmlContent}
        title="Project Preview"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0"
      />
    </div>
  );
};
