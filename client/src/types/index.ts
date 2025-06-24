export interface Material {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export interface Stand {
  id: string;
  number: string;
  theme: string;
  status: 'В Зале' | string; // Either "В Зале" or person's name
  shelf1: Material[];
  shelf2: Material[];
  shelf3: Material[];
  createdAt: Date;
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
  checkedItems: { [key: string]: boolean };
  signature: string;
  createdAt: Date;
  type: 'accept' | 'handout';
  handoutTo?: string;
  handoutBy?: string;
}
