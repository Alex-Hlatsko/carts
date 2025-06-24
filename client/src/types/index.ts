export interface Material {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ShelfItem {
  materialId: string;
  quantity: number;
}

export interface Stand {
  id: string;
  number: string;
  theme: string;
  status: 'В зале' | string;
  shelf1: ShelfItem[];
  shelf2: ShelfItem[];
  shelf3: ShelfItem[];
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
  standNumber: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  date: Date;
  answers: ReportAnswer[];
  isServiced: boolean;
  servicedBy?: string;
  servicedDate?: Date;
  servicedNotes?: string;
}

export interface ReportAnswer {
  checklistItemId: string;
  question: string;
  answer: boolean;
  notes?: string;
}

export interface Transaction {
  id: string;
  standId: string;
  standNumber: string;
  type: 'выдача' | 'принятие';
  responsiblePersonId: string;
  responsiblePersonName: string;
  recipientName?: string;
  date: Date;
}
