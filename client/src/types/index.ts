// Legacy compatibility types for Firestore structure
export interface MaterialData {
  name: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  data: MaterialData;
}

export interface ResponsiblePersonData {
  firstName: string;
  lastName: string;
}

export interface ResponsiblePerson {
  id: string;
  data: ResponsiblePersonData;
}

export interface Template {
  id: string;
  data: {
    theme: string;
    shelves: Array<{
      number: number;
      materials: string[];
    }>;
  };
}

export interface Stand {
  id: string;
  data: {
    number: string;
    name: string;
    theme: string;
    shelves: Array<{
      number: number;
      materials: string[];
    }>;
    status: string;
    qrCode?: string;
  };
}

export interface Transaction {
  id: string;
  data: {
    standId: string;
    type: string;
    issuedTo?: string;
    issuedBy?: string;
    receivedBy?: string;
    dateTime: any;
    checklistData?: string;
    notes?: string;
  };
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

export interface TemplateWithMaterials extends Template {
  materialsData?: {
    [shelfNumber: number]: Material[];
  };
}

// Legacy SQLite types for components that might reference them
export interface MaterialDataLegacy {
  name: string;
  image_url?: string;
}

export interface MaterialLegacy {
  id: number;
  name: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StandLegacy {
  id: number;
  number: string;
  name: string;
  image_url?: string;
  qr_code: string;
  status: string;
  template_id?: number;
  created_at: string;
  updated_at: string;
}

export interface StandTemplate {
  id: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateShelf {
  id: string;
  template_id: string;
  shelf_number: number;
  material_id: string;
}

export interface ResponsiblePersonLegacy {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionLegacy {
  id: number;
  stand_id: number;
  type: string;
  issued_to?: string;
  issued_by?: string;
  received_by?: string;
  date_time: string;
  checklist_data?: string;
  notes?: string;
}
