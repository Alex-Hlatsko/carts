export interface Material {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export interface Shelf {
  id: string;
  materials: Material[];
}

export interface Stand {
  id: string;
  number: string;
  theme: string;
  status: string;
  shelves: Shelf[];
  createdAt: Date;
  lastReportId?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  order: number;
}

export interface Report {
  id: string;
  standId: string;
  standNumber: string;
  type: 'accept' | 'issue';
  checklist: { [itemId: string]: boolean };
  signature: string;
  issuedTo?: string;
  issuedBy?: string;
  createdAt: Date;
}

export interface ResponsiblePerson {
  id: string;
  name: string;
}
