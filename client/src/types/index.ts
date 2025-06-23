export interface Material {
  id: string;
  name: string;
  imageUrl: string;
  dateAdded: Date;
}

export interface Shelf {
  id: string;
  number: 1 | 2 | 3;
  materials: string[]; // Array of material IDs
}

export interface Stand {
  id: string;
  number: string;
  theme: string;
  shelves: Shelf[];
  dateAdded: Date;
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