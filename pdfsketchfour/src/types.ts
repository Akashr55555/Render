export interface Tool {
  id: string;
  title: string;
  desc: string;
  icon: string;
  cat: 'workflows' | 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'intelligence';
  isNew?: boolean;
  keywords?: string[];
}

export interface ToolCategory {
  id: string;
  label: string;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  provider?: 'email' | 'google' | 'facebook' | 'sso' | 'microsoft';
}


