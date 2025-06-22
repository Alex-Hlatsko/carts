export interface Stand {
  id: string;
  name: string;
  condition: string;
  inventory: string[];
  dateAdded: Date;
  imageUrl?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  type: 'boolean' | 'text' | 'rating';
  required: boolean;
  options?: string[];
}

export interface Report {
  id: string;
  standId: string;
  standName: string;
  action: 'receive' | 'issue';
  handledBy: string;
  handledTo?: string;
  timestamp: Date;
  comments: string;
  checklist: Record<string, any>;
  imageUrls?: string[];
}

export interface ChecklistConfig {
  id: string;
  name: string;
  items: ChecklistItem[];
  dateModified: Date;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}