// This file now uses SQLite database instead of Firestore
// The data structure is adapted to work with the existing SQLite schema

// SQLite interfaces based on the schema
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

export interface ChecklistSettings {
  id: number;
  items: string;
  created_at: string;
  updated_at: string;
}

// API base URL - adjust as needed
const API_BASE = '/api';

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    return await apiCall('/materials');
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: MaterialData): Promise<Material> => {
  return await apiCall('/materials', {
    method: 'POST',
    body: JSON.stringify(materialData),
  });
};

export const updateMaterial = async (id: number, materialData: MaterialData): Promise<void> => {
  await apiCall(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(materialData),
  });
};

export const deleteMaterial = async (id: number): Promise<void> => {
  await apiCall(`/materials/${id}`, {
    method: 'DELETE',
  });
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    return await apiCall('/stands');
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandById = async (id: number): Promise<Stand | null> => {
  try {
    return await apiCall(`/stands/${id}`);
  } catch (error) {
    console.error('Error fetching stand by ID:', error);
    return null;
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    return await apiCall(`/stands/qr/${encodeURIComponent(qrCode)}`);
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: Partial<Stand>): Promise<Stand> => {
  return await apiCall('/stands', {
    method: 'POST',
    body: JSON.stringify(standData),
  });
};

export const updateStand = async (id: number, standData: Partial<Stand>): Promise<void> => {
  await apiCall(`/stands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(standData),
  });
};

export const deleteStand = async (id: number): Promise<void> => {
  await apiCall(`/stands/${id}`, {
    method: 'DELETE',
  });
};

// Templates functions
export const getTemplates = async (): Promise<StandTemplate[]> => {
  try {
    return await apiCall('/templates');
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const getTemplateById = async (id: number): Promise<StandTemplate | null> => {
  try {
    return await apiCall(`/templates/${id}`);
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const getTemplateShelves = async (templateId: number): Promise<TemplateShelf[]> => {
  try {
    return await apiCall(`/templates/${templateId}/shelves`);
  } catch (error) {
    console.error('Error fetching template shelves:', error);
    return [];
  }
};

export const createTemplate = async (templateData: { theme: string }): Promise<StandTemplate> => {
  return await apiCall('/templates', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
};

export const updateTemplate = async (id: number, templateData: { theme: string }): Promise<void> => {
  await apiCall(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(templateData),
  });
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await apiCall(`/templates/${id}`, {
    method: 'DELETE',
  });
};

// Template shelves functions
export const updateTemplateShelves = async (templateId: number, shelves: { shelf_number: number; material_ids: number[] }[]): Promise<void> => {
  await apiCall(`/templates/${templateId}/shelves`, {
    method: 'PUT',
    body: JSON.stringify({ shelves }),
  });
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    return await apiCall('/responsible-persons');
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: { first_name: string; last_name: string }): Promise<ResponsiblePerson> => {
  return await apiCall('/responsible-persons', {
    method: 'POST',
    body: JSON.stringify(personData),
  });
};

export const updateResponsiblePerson = async (id: number, personData: { first_name: string; last_name: string }): Promise<void> => {
  await apiCall(`/responsible-persons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(personData),
  });
};

export const deleteResponsiblePerson = async (id: number): Promise<void> => {
  await apiCall(`/responsible-persons/${id}`, {
    method: 'DELETE',
  });
};

// Transactions functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    return await apiCall('/transactions');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  return await apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};

// Checklist settings functions
export const getChecklistSettings = async () => {
  try {
    const settings = await apiCall('/checklist-settings');
    if (settings && settings.items) {
      return {
        items: typeof settings.items === 'string' ? JSON.parse(settings.items) : settings.items
      };
    }
    
    // Return default settings
    return {
      items: [
        {
          id: 'poster_condition',
          label: 'Постер в надлежащем состоянии?',
          required: true
        },
        {
          id: 'literature_complete',
          label: 'На всех ли полках есть хотя бы по одному экземпляру на польском и украинском языках?',
          required: true
        },
        {
          id: 'stand_clean',
          label: 'Чистый ли стенд (полки и колёсики)?',
          required: true
        },
        {
          id: 'inventory_complete',
          label: 'Инвентарь в полном комплекте? (тряпка, влажные салфетки, скребок, папка, чехлы)',
          required: true
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching checklist settings:', error);
    return { items: [] };
  }
};

export const updateChecklistSettings = async (settings: any): Promise<void> => {
  await apiCall('/checklist-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// Helper functions for compatibility
export const getMaterialsByIds = async (materialIds: number[]): Promise<Material[]> => {
  try {
    const allMaterials = await getMaterials();
    return allMaterials.filter(material => materialIds.includes(material.id));
  } catch (error) {
    console.error('Error fetching materials by IDs:', error);
    return [];
  }
};

// Service functions
export const createStandService = async (serviceData: {
  transaction_id: number;
  responsible_person_id: number;
  comment?: string | null;
}): Promise<void> => {
  await apiCall('/stand-services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

// Legacy compatibility functions
export const createReport = createTransaction;
export const getReports = getTransactions;
