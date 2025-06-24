export interface Material {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Stand {
  id: string;
  number: number;
  theme: string;
  status: string; // "В зале" or person name
  shelf1: Material[];
  shelf2: Material[];
  shelf3: Material[];
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  question: string;
  order: number;
}

export interface ResponsiblePerson {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  standId: string;
  standNumber: number;
  responsiblePerson: string;
  date: Date;
  answers: {
    checklistItemId: string;
    answer: boolean;
    notes?: string;
  }[];
  isServiced?: boolean;
  servicedBy?: string;
  servicedDate?: Date;
  serviceNotes?: string;
}

export interface StandAction {
  id: string;
  standId: string;
  standNumber: number;
  action: 'выдача' | 'принятие';
  responsiblePerson: string;
  recipientName?: string;
  date: Date;
}
