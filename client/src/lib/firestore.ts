// Mock implementation for SQLite - these functions should call API endpoints
import { 
  Material, 
  Stand, 
  StandTemplate, 
  TemplateShelf,
  ResponsiblePerson,
  Transaction,
  ChecklistSettings,
  ChecklistItem
} from '@/types';

const API_BASE = '';

async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    return await apiCall('/api/materials');
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: { name: string; image_url?: string }): Promise<Material> => {
  return await apiCall('/api/materials', {
    method: 'POST',
    body: JSON.stringify(materialData),
  });
};

export const updateMaterial = async (id: number, materialData: { name: string; image_url?: string }): Promise<void> => {
  await apiCall(`/api/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(materialData),
  });
};

export const deleteMaterial = async (id: number): Promise<void> => {
  await apiCall(`/api/materials/${id}`, {
    method: 'DELETE',
  });
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    return await apiCall('/api/stands');
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandById = async (id: number): Promise<Stand | null> => {
  try {
    return await apiCall(`/api/stands/${id}`);
  } catch (error) {
    console.error('Error fetching stand by ID:', error);
    return null;
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    return await apiCall(`/api/stands/qr/${encodeURIComponent(qrCode)}`);
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: Partial<Stand>): Promise<Stand> => {
  return await apiCall('/api/stands', {
    method: 'POST',
    body: JSON.stringify(standData),
  });
};

export const updateStand = async (id: number, standData: Partial<Stand>): Promise<void> => {
  await apiCall(`/api/stands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(standData),
  });
};

export const deleteStand = async (id: number): Promise<void> => {
  await apiCall(`/api/stands/${id}`, {
    method: 'DELETE',
  });
};

// Templates functions
export const getTemplates = async (): Promise<StandTemplate[]> => {
  try {
    return await apiCall('/api/templates');
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const getTemplateById = async (id: number): Promise<StandTemplate | null> => {
  try {
    return await apiCall(`/api/templates/${id}`);
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const createTemplate = async (templateData: { theme: string }): Promise<StandTemplate> => {
  return await apiCall('/api/templates', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
};

export const updateTemplate = async (id: number, templateData: { theme: string }): Promise<void> => {
  await apiCall(`/api/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(templateData),
  });
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await apiCall(`/api/templates/${id}`, {
    method: 'DELETE',
  });
};

// Template shelves functions
export const getTemplateShelves = async (templateId: number): Promise<TemplateShelf[]> => {
  try {
    return await apiCall(`/api/templates/${templateId}/shelves`);
  } catch (error) {
    console.error('Error fetching template shelves:', error);
    return [];
  }
};

export const updateTemplateShelves = async (templateId: number, shelves: { shelf_number: number; material_ids: number[] }[]): Promise<void> => {
  await apiCall(`/api/templates/${templateId}/shelves`, {
    method: 'PUT',
    body: JSON.stringify({ shelves }),
  });
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    return await apiCall('/api/responsible-persons');
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: { first_name: string; last_name: string }): Promise<ResponsiblePerson> => {
  return await apiCall('/api/responsible-persons', {
    method: 'POST',
    body: JSON.stringify(personData),
  });
};

export const updateResponsiblePerson = async (id: number, personData: { first_name: string; last_name: string }): Promise<void> => {
  await apiCall(`/api/responsible-persons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(personData),
  });
};

export const deleteResponsiblePerson = async (id: number): Promise<void> => {
  await apiCall(`/api/responsible-persons/${id}`, {
    method: 'DELETE',
  });
};

// Transactions functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    return await apiCall('/api/transactions');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const createTransaction = async (transactionData: {
  stand_id: number;
  type: string;
  issued_to?: string;
  issued_by?: string;
  received_by?: string;
  checklist_data?: string;
  notes?: string;
}): Promise<Transaction> => {
  return await apiCall('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};

// Checklist settings functions
export const getChecklistSettings = async (): Promise<ChecklistSettings> => {
  try {
    const result = await apiCall('/api/checklist-settings');
    return result || getDefaultChecklistSettings();
  } catch (error) {
    console.error('Error fetching checklist settings:', error);
    return getDefaultChecklistSettings();
  }
};

const getDefaultChecklistSettings = (): ChecklistSettings => ({
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
});

export const updateChecklistSettings = async (settings: ChecklistSettings): Promise<void> => {
  await apiCall('/api/checklist-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// Helper functions for compatibility
export const getMaterialsByIds = async (materialIds: number[]): Promise<Material[]> => {
  try {
    if (materialIds.length === 0) return [];
    const allMaterials = await getMaterials();
    return allMaterials.filter(material => materialIds.includes(material.id));
  } catch (error) {
    console.error('Error fetching materials by IDs:', error);
    return [];
  }
};

// Legacy compatibility functions
export const createReport = createTransaction;
export const getReports = getTransactions;
