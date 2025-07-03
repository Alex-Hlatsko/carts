import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    dateTime: Timestamp;
    checklistData?: string;
    notes?: string;
  };
}

export interface ChecklistSettings {
  items: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
}

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    const materialsRef = collection(db, 'materials');
    const snapshot = await getDocs(materialsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as MaterialData
    }));
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: MaterialData): Promise<Material> => {
  const materialsRef = collection(db, 'materials');
  const docRef = await addDoc(materialsRef, materialData);
  return {
    id: docRef.id,
    data: materialData
  };
};

export const updateMaterial = async (id: string, materialData: MaterialData): Promise<void> => {
  const materialRef = doc(db, 'materials', id);
  await updateDoc(materialRef, materialData);
};

export const deleteMaterial = async (id: string): Promise<void> => {
  const materialRef = doc(db, 'materials', id);
  await deleteDoc(materialRef);
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    const standsRef = collection(db, 'stands');
    const snapshot = await getDocs(standsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as Stand['data']
    }));
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandById = async (id: string): Promise<Stand | null> => {
  try {
    const standRef = doc(db, 'stands', id);
    const snapshot = await getDoc(standRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        data: snapshot.data() as Stand['data']
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stand by ID:', error);
    return null;
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    const standsRef = collection(db, 'stands');
    const q = query(standsRef, where('qrCode', '==', qrCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        data: doc.data() as Stand['data']
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: Partial<Stand['data']>): Promise<Stand> => {
  const standsRef = collection(db, 'stands');
  const dataWithDefaults = {
    ...standData,
    status: standData.status || 'available',
    qrCode: standData.qrCode || Math.random().toString(36).substring(2, 15),
    shelves: standData.shelves || []
  };
  const docRef = await addDoc(standsRef, dataWithDefaults);
  return {
    id: docRef.id,
    data: dataWithDefaults as Stand['data']
  };
};

export const updateStand = async (id: string, standData: Partial<Stand['data']>): Promise<void> => {
  const standRef = doc(db, 'stands', id);
  await updateDoc(standRef, standData);
};

export const deleteStand = async (id: string): Promise<void> => {
  const standRef = doc(db, 'stands', id);
  await deleteDoc(standRef);
};

// Templates functions
export const getTemplates = async (): Promise<Template[]> => {
  try {
    const templatesRef = collection(db, 'templates');
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as Template['data']
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const getTemplateById = async (id: string): Promise<Template | null> => {
  try {
    const templateRef = doc(db, 'templates', id);
    const snapshot = await getDoc(templateRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        data: snapshot.data() as Template['data']
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const createTemplate = async (templateData: Template['data']): Promise<Template> => {
  const templatesRef = collection(db, 'templates');
  const docRef = await addDoc(templatesRef, templateData);
  return {
    id: docRef.id,
    data: templateData
  };
};

export const updateTemplate = async (id: string, templateData: Template['data']): Promise<void> => {
  const templateRef = doc(db, 'templates', id);
  await updateDoc(templateRef, templateData);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const templateRef = doc(db, 'templates', id);
  await deleteDoc(templateRef);
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    const personsRef = collection(db, 'responsiblePersons');
    const snapshot = await getDocs(personsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as ResponsiblePersonData
    }));
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: ResponsiblePersonData): Promise<ResponsiblePerson> => {
  const personsRef = collection(db, 'responsiblePersons');
  const docRef = await addDoc(personsRef, personData);
  return {
    id: docRef.id,
    data: personData
  };
};

export const updateResponsiblePerson = async (id: string, personData: ResponsiblePersonData): Promise<void> => {
  const personRef = doc(db, 'responsiblePersons', id);
  await updateDoc(personRef, personData);
};

export const deleteResponsiblePerson = async (id: string): Promise<void> => {
  const personRef = doc(db, 'responsiblePersons', id);
  await deleteDoc(personRef);
};

// Transactions functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, orderBy('data.dateTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as Transaction['data']
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const createTransaction = async (transactionData: Omit<Transaction['data'], 'dateTime'> & { dateTime?: Timestamp }): Promise<Transaction> => {
  const transactionsRef = collection(db, 'transactions');
  const dataWithTimestamp = {
    ...transactionData,
    dateTime: transactionData.dateTime || serverTimestamp()
  };
  const docRef = await addDoc(transactionsRef, dataWithTimestamp);
  return {
    id: docRef.id,
    data: dataWithTimestamp as Transaction['data']
  };
};

// Checklist settings functions
export const getChecklistSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'checklist');
    const snapshot = await getDoc(settingsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.items ? { items: data.items } : getDefaultChecklistSettings();
    }
    
    return getDefaultChecklistSettings();
  } catch (error) {
    console.error('Error fetching checklist settings:', error);
    return getDefaultChecklistSettings();
  }
};

const getDefaultChecklistSettings = () => ({
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
  const settingsRef = doc(db, 'settings', 'checklist');
  await updateDoc(settingsRef, settings).catch(async () => {
    // If document doesn't exist, create it
    await addDoc(collection(db, 'settings'), settings);
  });
};

// Helper functions for compatibility
export const getMaterialsByIds = async (materialIds: string[]): Promise<Material[]> => {
  try {
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

// New adapter functions for template shelves compatibility
export const getTemplateShelves = async (templateId: string) => {
  const template = await getTemplateById(templateId);
  if (!template) return [];
  
  // Convert template shelves to the expected format
  const shelves: any[] = [];
  template.data.shelves.forEach(shelf => {
    shelf.materials.forEach(materialId => {
      shelves.push({
        id: `${templateId}_${shelf.number}_${materialId}`,
        template_id: templateId,
        shelf_number: shelf.number,
        material_id: materialId
      });
    });
  });
  
  return shelves;
};

export const updateTemplateShelves = async (templateId: string, shelves: { shelf_number: number; material_ids: string[] }[]): Promise<void> => {
  const template = await getTemplateById(templateId);
  if (!template) return;
  
  // Convert to template format
  const templateShelves = shelves.map(shelf => ({
    number: shelf.shelf_number,
    materials: shelf.material_ids
  }));
  
  await updateTemplate(templateId, {
    ...template.data,
    shelves: templateShelves
  });
};
