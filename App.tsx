import React, { useState, useCallback, useEffect } from 'react';
import { ProjectFile, ExecutionLog, AgentStatus } from './types';
import { generateProjectFromGoal } from './services/geminiService';
import { ProjectFileDisplay } from './components/PlanDisplay';
import { ExecutionLogs } from './components/ExecutionLogs';
import { PreviewDisplay } from './components/PreviewDisplay';
import { ClearIcon, LoadingSpinner, DownloadIcon, FolderOpenIcon, EyeIcon, DocumentTextIcon } from './components/icons';

// Declare JSZip for TypeScript since it's loaded from a CDN
declare var JSZip: any;

const App: React.FC = () => {
  const [goal, setGoal] = useState<string>('');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'logs' | 'preview'>('logs');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const addLog = useCallback((type: ExecutionLog['type'], message: string) => {
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
    ]);
  }, []);

  const buildPreview = useCallback((files: ProjectFile[]) => {
    const htmlFile = files.find(f => f.filename.endsWith('.html'));
    if (!htmlFile) {
        setPreviewHtml(null);
        addLog('INFO', 'No HTML file found to generate a preview.');
        return;
    }

    addLog('INFO', `Building preview from ${htmlFile.filename}...`);
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlFile.content, 'text/html');

        // Inline stylesheets
        doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // Handle absolute vs relative paths simply
                const cssFile = files.find(f => f.filename.endsWith(href.replace('./', '')));
                if (cssFile) {
                    const style = document.createElement('style');
                    style.textContent = cssFile.content;
                    link.parentNode?.replaceChild(style, link);
                }
            }
        });

        // Inline scripts
        doc.querySelectorAll<HTMLScriptElement>('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            if (src) {
                const jsFile = files.find(f => f.filename.endsWith(src.replace('./', '')));
                if (jsFile) {
                    const newScript = document.createElement('script');
                    newScript.textContent = jsFile.content;
                    // To maintain execution order for modules, etc.
                    if (script.type) newScript.type = script.type;
                    script.parentNode?.replaceChild(newScript, script);
                }
            }
        });

        const serializer = new XMLSerializer();
        const finalHtml = serializer.serializeToString(doc);
        setPreviewHtml(finalHtml);
        addLog('SUCCESS', 'Preview generated successfully.');
        setRightPanelTab('preview'); // Switch to preview tab automatically
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error building preview.';
        addLog('ERROR', `Failed to build preview: ${message}`);
        setPreviewHtml(null);
    }
}, [addLog]);

  useEffect(() => {
    if (projectFiles.length > 0) {
        buildPreview(projectFiles);
    } else {
        setPreviewHtml(null); // Clear preview when project is cleared
    }
  }, [projectFiles, buildPreview]);


  const handleClear = useCallback(() => {
    setGoal('');
    setProjectFiles([]);
    setLogs([]);
    setStatus(AgentStatus.IDLE);
    setError(null);
    setRightPanelTab('logs');
  }, []);

  const handleGenerateProject = useCallback(async () => {
    if (!goal.trim()) {
      setError('Please enter a goal.');
      return;
    }
    // Reset previous state but keep goal
    setProjectFiles([]);
    setLogs([]);
    setStatus(AgentStatus.IDLE);
    setError(null);
    setRightPanelTab('logs');
    
    setStatus(AgentStatus.GENERATING);
    addLog('INFO', `Generating project for goal: "${goal}"`);
    try {
      const generatedFiles = await generateProjectFromGoal(goal);
      const newProjectFiles: ProjectFile[] = generatedFiles.map(file => ({
        ...file,
        id: crypto.randomUUID(),
      }));
      
      setProjectFiles(newProjectFiles);
      addLog('SUCCESS', `Successfully generated ${newProjectFiles.length} project files.`);

      // Check for dependency files and add instructions
      const hasPackageJson = newProjectFiles.some(f => f.filename.endsWith('package.json'));
      const hasRequirementsTxt = newProjectFiles.some(f => f.filename.endsWith('requirements.txt'));

      if (hasPackageJson) {
          addLog('INSTRUCTION', 'Project contains a `package.json`. To install dependencies, run `npm install` in the project directory.');
      }

      if (hasRequirementsTxt) {
          addLog('INSTRUCTION', 'Project contains `requirements.txt`. To install dependencies, run `pip install -r requirements.txt`.');
      }

      setStatus(AgentStatus.COMPLETED);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      addLog('ERROR', errorMessage);
      setStatus(AgentStatus.ERROR);
    }
  }, [goal, addLog]);
  
  const handleDownloadZip = () => {
    if (projectFiles.length === 0) return;

    addLog('INFO', 'Creating zip archive...');
    try {
      const zip = new JSZip();
      projectFiles.forEach(file => {
        zip.file(file.filename, file.content);
      });

      zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_generated_project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog('SUCCESS', 'Project zip file downloaded.');
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred creating the zip file.';
      setError(errorMessage);
      addLog('ERROR', errorMessage);
    }
  };

  const isGenerating = status === AgentStatus.GENERATING;
  const isDone = status === AgentStatus.COMPLETED || projectFiles.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          AI Project Generator
        </h1>
        <p className="text-center text-slate-400 mt-2 max-w-2xl mx-auto">
          I am your AI operational agent. Describe the application or script you want to build, and I will generate the complete project structure and files for you.
        </p>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg flex flex-col">
            <label htmlFor="goal" className="text-lg font-semibold mb-2 text-slate-300">Your Project Goal</label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., 'A simple to-do list app using React and Tailwind CSS'"
              className="w-full bg-slate-700 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow resize-none"
              rows={3}
              disabled={isGenerating}
            />
             {error && <p className="text-red-400 mt-2">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleGenerateProject}
                disabled={isGenerating || !goal.trim()}
                className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? <LoadingSpinner className="w-5 h-5" /> : <><FolderOpenIcon className="w-5 h-5"/> Generate Project</>}
              </button>
              {isDone && (
                <button
                  onClick={handleDownloadZip}
                  className="flex-1 min-w-[150px] bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <DownloadIcon className="w-5 h-5"/> Download Project (.zip)
                </button>
              )}
               <button
                onClick={handleClear}
                disabled={isGenerating}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ClearIcon className="w-5 h-5"/> Clear
              </button>
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg flex-grow flex flex-col min-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-slate-300">Generated Project Files</h2>
            <div className="flex-grow overflow-y-auto pr-2">
              <ProjectFileDisplay files={projectFiles} />
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg flex flex-col min-h-[500px] lg:min-h-0">
            <div className="flex border-b border-slate-700 mb-4">
                 <button 
                    onClick={() => setRightPanelTab('logs')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        rightPanelTab === 'logs' 
                        ? 'border-b-2 border-blue-400 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    Logs
                </button>
                 <button 
                    onClick={() => setRightPanelTab('preview')} 
                    disabled={!previewHtml}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        rightPanelTab === 'preview' 
                        ? 'border-b-2 border-blue-400 text-white' 
                        : 'text-slate-400 hover:text-white'
                    } disabled:text-slate-600 disabled:cursor-not-allowed`}
                >
                    <EyeIcon className="w-5 h-5" />
                    Preview
                </button>
            </div>
            <div className="flex-grow overflow-hidden">
                {rightPanelTab === 'logs' && <ExecutionLogs logs={logs} />}
                {rightPanelTab === 'preview' && <PreviewDisplay htmlContent={previewHtml} />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;