
import React, { useEffect, useRef } from 'react';
import { ExecutionLog } from '../types';

interface ExecutionLogsProps {
  logs: ExecutionLog[];
}

const getLogTypeClass = (type: ExecutionLog['type']) => {
  switch (type) {
    case 'INFO':
      return 'text-slate-400';
    case 'SUCCESS':
      return 'text-green-400';
    case 'ERROR':
      return 'text-red-400';
    case 'OUTPUT':
      return 'text-cyan-400';
    case 'INSTRUCTION':
      return 'text-yellow-400';
    default:
      return 'text-slate-400';
  }
};

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs }) => {
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm h-full overflow-y-auto">
      {logs.length === 0 ? (
        <div className="text-slate-500">Execution logs will appear here...</div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="flex items-start">
            <span className="text-slate-600 mr-4">{log.timestamp}</span>
            <span className={`font-bold w-24 flex-shrink-0 ${getLogTypeClass(log.type)}`}>
              [{log.type}]
            </span>
            <span className={`whitespace-pre-wrap break-words ${getLogTypeClass(log.type)}`}>
              {log.message}
            </span>
          </div>
        ))
      )}
      <div ref={logsEndRef} />
    </div>
  );
};