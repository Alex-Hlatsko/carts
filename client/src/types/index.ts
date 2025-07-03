// Types for SQLite database structure
export interface MaterialData {
  name: string;
  image_url?: string;
}

export interface Material {
  id: number;
  name: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Stand {
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
  id: number;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateShelf {
  id: number;
  template_id: number;
  shelf_number: number;
  material_id: number;
}

export interface ResponsiblePerson {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
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

export interface ChecklistSettingsDB {
  id: number;
  items: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface ChecklistSettings {
  items: ChecklistItem[];
}

export interface StandServiceData {
  transaction_id: number;
  responsible_person_id: number;
  comment?: string;
  serviced_at?: string;
}

export interface StandService {
  id: number;
  data: StandServiceData;
}

export interface TransactionWithService extends Transaction {
  service?: StandService & {
    responsible_person_name: string;
  };
  stand_number: string;
  stand_name: string;
  stand_image_url?: string;
}

// Legacy compatibility types for Firestore structure (for components that still use them)
export interface MaterialDataLegacy {
  name: string;
  imageUrl?: string;
}

export interface MaterialLegacy {
  id: string;
  data: MaterialDataLegacy;
}

export interface ResponsiblePersonDataLegacy {
  firstName: string;
  lastName: string;
}

export interface ResponsiblePersonLegacy {
  id: string;
  data: ResponsiblePersonDataLegacy;
}

export interface TemplateLegacy {
  id: string;
  data: {
    theme: string;
    shelves: Array<{
      number: number;
      materials: string[];
    }>;
  };
}

export interface StandLegacy {
  id: string;
  data: {
    number: string;
    theme: string;
    shelves: Array<{
      number: number;
      materials: string[];
    }>;
    status: string;
    qrCode?: string;
  };
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
