export interface Stand {
  id: string;
  number: number;
  theme: string;
  status: string; // "В зале" or person name
  shelves: Shelf[];
  createdAt: Date;
}

export interface Shelf {
  id: string;
  position: number; // 1, 2, 3
  materials: Material[];
}

export interface Material {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  question: string;
  order: number;
}

export interface Responsible {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  standId: string;
  standNumber: number;
  responsibleId: string;
  responsibleName: string;
  date: Date;
  answers: ReportAnswer[];
  isServiced: boolean;
  servicedBy?: string;
  servicedDate?: Date;
  serviceNotes?: string;
}

export interface ReportAnswer {
  checklistItemId: string;
  question: string;
  answer: boolean;
  notes?: string;
}
