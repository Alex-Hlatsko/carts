export interface Stand {
  id: string;
  number: string;
  name: string;
  image_url: string | null;
  qr_code: string;
  status: 'available' | 'issued';
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  stand_id: string;
  type: 'issue' | 'return';
  issued_to: string | null;
  issued_by: string | null;
  received_by: string | null;
  date_time: string;
  checklist_data: string | null;
  notes: string | null;
  stand_number: string;
  stand_name: string;
  stand_image_url: string | null;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface ChecklistSettings {
  items: ChecklistItem[];
}

export interface Material {
  id: string;
  name: string;
  image_url: string | null;
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

export interface ResponsiblePerson {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface StandService {
  id: string;
  transaction_id: string;
  responsible_person_id: string;
  comment: string | null;
  serviced_at: string;
}

export interface TemplateWithShelves extends StandTemplate {
  shelves: Array<{
    shelf_number: number;
    materials: Material[];
  }>;
}

export interface TransactionWithService extends Transaction {
  service?: StandService & {
    responsible_person_name: string;
  };
}
