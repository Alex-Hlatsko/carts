// Types for the new Firebase structure
export interface MaterialData {
  name: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  data: MaterialData;
}

export interface ShelfData {
  number: number;
  materials: string[]; // Array of material IDs
}

export interface StandData {
  number: string;
  theme: string;
  shelves: ShelfData[];
  status: string;
  qrCode?: string;
}

export interface Stand {
  id: string;
  data: StandData;
}

export interface ChecklistData {
  [key: string]: boolean;
}

export interface ReportData {
  standId: string;
  action: 'receive' | 'issue';
  handledBy: string;
  comments?: string;
  checklist?: ChecklistData;
  timestamp?: string;
  issuedTo?: string;
}

export interface Report {
  id: string;
  data: ReportData;
}

export interface ResponsiblePersonData {
  firstName: string;
  lastName: string;
}

export interface ResponsiblePerson {
  id: string;
  data: ResponsiblePersonData;
}

export interface TemplateData {
  theme: string;
  shelves: ShelfData[];
}

export interface Template {
  id: string;
  data: TemplateData;
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
  transactionId: string;
  responsiblePersonId: string;
  comment?: string;
  servicedAt?: string;
}

export interface StandService {
  id: string;
  data: StandServiceData;
}

export interface TransactionWithService extends Report {
  service?: StandService & {
    responsible_person_name: string;
  };
  stand_number: string;
  stand_name: string;
  stand_image_url?: string;
  type: 'receive' | 'issue';
  date_time: string;
  checklist_data?: string;
  notes?: string;
  issued_to?: string;
  issued_by?: string;
  received_by?: string;
}

// Extended types for UI
export interface StandWithMaterials extends Stand {
  materialsData?: {
    [shelfNumber: number]: Material[];
  };
}

export interface TemplateWithMaterials extends Template {
  materialsData?: {
    [shelfNumber: number]: Material[];
  };
}
