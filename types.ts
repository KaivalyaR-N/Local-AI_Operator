
export enum AgentStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ProjectFile {
  id: string;
  filename: string;
  content: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'OUTPUT' | 'INSTRUCTION';
  message: string;
}