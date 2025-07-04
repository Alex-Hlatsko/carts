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
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Material, 
  Stand, 
  Transaction,
  ChecklistSettings,
  ResponsiblePerson,
  StandTemplate
} from '@/types';

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    console.log('Fetching materials from Firestore...');
    const materialsCollection = collection(db, 'materials');
    const snapshot = await getDocs(materialsCollection);
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Material[];
    console.log('Materials fetched:', materials);
    return materials;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: { name: string; imageUrl?: string }): Promise<Material> => {
  try {
    console.log('Creating material:', materialData);
    const materialsCollection = collection(db, 'materials');
    const docRef = await addDoc(materialsCollection, { data: materialData });
    const newMaterial = {
      id: docRef.id,
      ...materialData
    } as Material;
    console.log('Material created:', newMaterial);
    return newMaterial;
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

export const updateMaterial = async (id: string, materialData: { name: string; imageUrl?: string }): Promise<void> => {
  try {
    console.log('Updating material:', id, materialData);
    const materialDoc = doc(db, 'materials', id);
    await updateDoc(materialDoc, { data: materialData });
    console.log('Material updated successfully');
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string): Promise<void> => {
  try {
    console.log('Deleting material:', id);
    const materialDoc = doc(db, 'materials', id);
    await deleteDoc(materialDoc);
    console.log('Material deleted successfully');
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    console.log('Fetching stands from Firestore...');
    const standsCollection = collection(db, 'stands');
    const snapshot = await getDocs(standsCollection);
    const stands = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Stand[];
    console.log('Stands fetched:', stands);
    return stands;
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandById = async (id: string): Promise<Stand | null> => {
  try {
    console.log('Fetching stand by ID:', id);
    const standDoc = doc(db, 'stands', id);
    const snapshot = await getDoc(standDoc);
    if (snapshot.exists()) {
      const stand = {
        id: snapshot.id,
        ...snapshot.data().data
      } as Stand;
      console.log('Stand fetched by ID:', stand);
      return stand;
    }
    console.log('Stand not found by ID:', id);
    return null;
  } catch (error) {
    console.error('Error fetching stand by ID:', error);
    return null;
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    console.log('Fetching stand by QR code:', qrCode);
    
    // First try to find by document ID (for backwards compatibility)
    const standById = await getStandById(qrCode);
    if (standById) {
      console.log('Stand found by ID:', standById);
      return standById;
    }
    
    // Try to find by qrCode field
    const standsCollection = collection(db, 'stands');
    const q = query(standsCollection, where('data.qrCode', '==', qrCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      const stand = {
        id: docData.id,
        ...docData.data().data
      } as Stand;
      console.log('Stand found by QR code:', stand);
      return stand;
    }
    
    console.log('Stand not found by QR code:', qrCode);
    return null;
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: Partial<Stand>): Promise<Stand> => {
  try {
    console.log('Creating stand:', standData);
    const standsCollection = collection(db, 'stands');
    const qrCode = standData.qrCode || Math.random().toString(36).substring(2, 15);
    const data = {
      ...standData,
      qrCode,
      status: standData.status || 'available',
      shelves: standData.shelves || []
    };
    const docRef = await addDoc(standsCollection, { data });
    const newStand = {
      id: docRef.id,
      ...data
    } as Stand;
    console.log('Stand created:', newStand);
    return newStand;
  } catch (error) {
    console.error('Error creating stand:', error);
    throw error;
  }
};

export const updateStand = async (id: string, standData: Partial<Stand>): Promise<void> => {
  try {
    console.log('Updating stand:', id, standData);
    const standDoc = doc(db, 'stands', id);
    const currentDoc = await getDoc(standDoc);
    if (currentDoc.exists()) {
      const currentData = currentDoc.data().data;
      await updateDoc(standDoc, { 
        data: {
          ...currentData,
          ...standData
        }
      });
      console.log('Stand updated successfully');
    }
  } catch (error) {
    console.error('Error updating stand:', error);
    throw error;
  }
};

export const deleteStand = async (id: string): Promise<void> => {
  try {
    console.log('Deleting stand:', id);
    const standDoc = doc(db, 'stands', id);
    await deleteDoc(standDoc);
    console.log('Stand deleted successfully');
  } catch (error) {
    console.error('Error deleting stand:', error);
    throw error;
  }
};

// Transactions functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('Fetching transactions from Firestore...');
    const reportsCollection = collection(db, 'reports');
    const q = query(reportsCollection, orderBy('data.timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Transaction[];
    console.log('Transactions fetched:', transactions);
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const createTransaction = async (transactionData: {
  standId: string;
  action: string;
  handledBy?: string;
  issuedTo?: string;
  comments?: string;
  checklist?: any;
}): Promise<Transaction> => {
  try {
    console.log('Creating transaction:', transactionData);
    const reportsCollection = collection(db, 'reports');
    const data = {
      ...transactionData,
      timestamp: new Date().toISOString()
    };
    const docRef = await addDoc(reportsCollection, { data });
    const newTransaction = {
      id: docRef.id,
      ...data
    } as Transaction;
    console.log('Transaction created:', newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    console.log('Fetching responsible persons from Firestore...');
    const personsCollection = collection(db, 'responsiblePersons');
    const snapshot = await getDocs(personsCollection);
    const persons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as ResponsiblePerson[];
    console.log('Responsible persons fetched:', persons);
    return persons;
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: { firstName: string; lastName: string }): Promise<ResponsiblePerson> => {
  try {
    console.log('Creating responsible person:', personData);
    const personsCollection = collection(db, 'responsiblePersons');
    const docRef = await addDoc(personsCollection, { data: personData });
    const newPerson = {
      id: docRef.id,
      ...personData
    } as ResponsiblePerson;
    console.log('Responsible person created:', newPerson);
    return newPerson;
  } catch (error) {
    console.error('Error creating responsible person:', error);
    throw error;
  }
};

export const updateResponsiblePerson = async (id: string, personData: { firstName: string; lastName: string }): Promise<void> => {
  try {
    console.log('Updating responsible person:', id, personData);
    const personDoc = doc(db, 'responsiblePersons', id);
    await updateDoc(personDoc, { data: personData });
    console.log('Responsible person updated successfully');
  } catch (error) {
    console.error('Error updating responsible person:', error);
    throw error;
  }
};

export const deleteResponsiblePerson = async (id: string): Promise<void> => {
  try {
    console.log('Deleting responsible person:', id);
    const personDoc = doc(db, 'responsiblePersons', id);
    await deleteDoc(personDoc);
    console.log('Responsible person deleted successfully');
  } catch (error) {
    console.error('Error deleting responsible person:', error);
    throw error;
  }
};

// Templates functions
export const getTemplates = async (): Promise<StandTemplate[]> => {
  try {
    console.log('Fetching templates from Firestore...');
    const templatesCollection = collection(db, 'templates');
    const snapshot = await getDocs(templatesCollection);
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as StandTemplate[];
    console.log('Templates fetched:', templates);
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const getTemplateById = async (id: string): Promise<StandTemplate | null> => {
  try {
    console.log('Fetching template by ID:', id);
    const templateDoc = doc(db, 'templates', id);
    const snapshot = await getDoc(templateDoc);
    if (snapshot.exists()) {
      const template = {
        id: snapshot.id,
        ...snapshot.data().data
      } as StandTemplate;
      console.log('Template fetched by ID:', template);
      return template;
    }
    console.log('Template not found by ID:', id);
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const createTemplate = async (templateData: { theme: string; shelves: any[] }): Promise<StandTemplate> => {
  try {
    console.log('Creating template:', templateData);
    const templatesCollection = collection(db, 'templates');
    const docRef = await addDoc(templatesCollection, { data: templateData });
    const newTemplate = {
      id: docRef.id,
      ...templateData
    } as StandTemplate;
    console.log('Template created:', newTemplate);
    return newTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (id: string, templateData: { theme: string; shelves: any[] }): Promise<void> => {
  try {
    console.log('Updating template:', id, templateData);
    const templateDoc = doc(db, 'templates', id);
    await updateDoc(templateDoc, { data: templateData });
    console.log('Template updated successfully');
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    console.log('Deleting template:', id);
    const templateDoc = doc(db, 'templates', id);
    await deleteDoc(templateDoc);
    console.log('Template deleted successfully');
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Checklist settings functions
export const getChecklistSettings = async (): Promise<ChecklistSettings> => {
  try {
    console.log('Fetching checklist settings from Firestore...');
    const settingsCollection = collection(db, 'checklistSettings');
    const snapshot = await getDocs(settingsCollection);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const settings = doc.data().data as ChecklistSettings;
      console.log('Checklist settings fetched:', settings);
      return settings;
    }
    
    const defaultSettings = getDefaultChecklistSettings();
    console.log('Using default checklist settings:', defaultSettings);
    return defaultSettings;
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
  try {
    console.log('Updating checklist settings:', settings);
    const settingsCollection = collection(db, 'checklistSettings');
    const snapshot = await getDocs(settingsCollection);
    
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { data: settings });
    } else {
      await addDoc(settingsCollection, { data: settings });
    }
    console.log('Checklist settings updated successfully');
  } catch (error) {
    console.error('Error updating checklist settings:', error);
    throw error;
  }
};

// Helper functions
export const getMaterialsByIds = async (materialIds: string[]): Promise<Material[]> => {
  try {
    if (materialIds.length === 0) return [];
    console.log('Fetching materials by IDs:', materialIds);
    const allMaterials = await getMaterials();
    const filteredMaterials = allMaterials.filter(material => materialIds.includes(material.id));
    console.log('Materials found by IDs:', filteredMaterials);
    return filteredMaterials;
  } catch (error) {
    console.error('Error fetching materials by IDs:', error);
    return [];
  }
};
