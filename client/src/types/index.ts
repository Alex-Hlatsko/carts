export interface Stand {
  id: string;
  number: string;
  theme: string;
  status: string; // "В зале" or person name
  shelves: Shelf[];
  qrCode: string;
  createdAt: Date;
}

export interface Shelf {
  id: string;
  materials: Material[];
}

export interface Material {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export interface Responsible {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  question: string;
  order: number;
  createdAt: Date;
}

export interface Report {
  id: string;
  standId: string;
  standNumber: string;
  responsibleId: string;
  responsibleName: string;
  date: Date;
  answers: ChecklistAnswer[];
  isServiced: boolean;
  servicedBy?: string;
  servicedAt?: Date;
  serviceNotes?: string;
  createdAt: Date;
}

export interface ChecklistAnswer {
  questionId: string;
  question: string;
  answer: boolean;
  notes?: string;
}
