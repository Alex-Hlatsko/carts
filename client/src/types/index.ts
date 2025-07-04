// Firebase Firestore types
export interface MaterialData {
  name: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface StandData {
  number: string;
  theme: string;
  shelves: Array<{
    number: number;
    materials: string[];
  }>;
  status: string;
  qrCode?: string;
}

export interface Stand {
  id: string;
  number: string;
  theme: string;
  shelves: Array<{
    number: number;
    materials: string[];
  }>;
  status: string;
  qrCode?: string;
}

export interface StandTemplate {
  id: string;
  theme: string;
  shelves: Array<{
    number: number;
    materials: string[];
  }>;
}

export interface TemplateShelf {
  id: string;
  template_id: string;
  shelf_number: number;
  material_id: string;
}

export interface ResponsiblePersonData {
  firstName: string;
  lastName: string;
}

export interface ResponsiblePerson {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TransactionData {
  standId: string;
  action: string;
  handledBy?: string;
  issuedTo?: string;
  comments?: string;
  checklist?: any;
  timestamp: string;
}

export interface Transaction {
  id: string;
  standId: string;
  action: string;
  handledBy?: string;
  issuedTo?: string;
  comments?: string;
  checklist?: any;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface ChecklistSettings {
  items: ChecklistItem[];
}

// Extended types for UI
export interface StandWithTemplate extends Stand {
  templateName?: string;
}

export interface TemplateWithMaterials extends StandTemplate {
  materialsData?: {
    [shelfNumber: number]: Material[];
  };
}
