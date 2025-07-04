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
  StandTemplate,
  TemplateShelf
} from '@/types';

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    const materialsCollection = collection(db, 'materials');
    const snapshot = await getDocs(materialsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Material[];
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: { name: string; imageUrl?: string }): Promise<Material> => {
  const materialsCollection = collection(db, 'materials');
  const docRef = await addDoc(materialsCollection, { data: materialData });
  return {
    id: docRef.id,
    ...materialData
  } as Material;
};

export const updateMaterial = async (id: string, materialData: { name: string; imageUrl?: string }): Promise<void> => {
  const materialDoc = doc(db, 'materials', id);
  await updateDoc(materialDoc, { data: materialData });
};

export const deleteMaterial = async (id: string): Promise<void> => {
  const materialDoc = doc(db, 'materials', id);
  await deleteDoc(materialDoc);
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    const standsCollection = collection(db, 'stands');
    const snapshot = await getDocs(standsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Stand[];
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandById = async (id: string): Promise<Stand | null> => {
  try {
    const standDoc = doc(db, 'stands', id);
    const snapshot = await getDoc(standDoc);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data().data
      } as Stand;
    }
    return null;
  } catch (error) {
    console.error('Error fetching stand by ID:', error);
    return null;
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    const standsCollection = collection(db, 'stands');
    const q = query(standsCollection, where('data.qrCode', '==', qrCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data().data
      } as Stand;
    }
    return null;
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: Partial<Stand>): Promise<Stand> => {
  const standsCollection = collection(db, 'stands');
  const qrCode = standData.qrCode || Math.random().toString(36).substring(2, 15);
  const data = {
    ...standData,
    qrCode,
    status: standData.status || 'available'
  };
  const docRef = await addDoc(standsCollection, { data });
  return {
    id: docRef.id,
    ...data
  } as Stand;
};

export const updateStand = async (id: string, standData: Partial<Stand>): Promise<void> => {
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
  }
};

export const deleteStand = async (id: string): Promise<void> => {
  const standDoc = doc(db, 'stands', id);
  await deleteDoc(standDoc);
};

// Reports/Transactions functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const reportsCollection = collection(db, 'reports');
    const q = query(reportsCollection, orderBy('data.timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as Transaction[];
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
  const reportsCollection = collection(db, 'reports');
  const data = {
    ...transactionData,
    timestamp: new Date().toISOString()
  };
  const docRef = await addDoc(reportsCollection, { data });
  return {
    id: docRef.id,
    ...data
  } as Transaction;
};

// Responsible persons functions (simulated for Firebase)
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    const personsCollection = collection(db, 'responsiblePersons');
    const snapshot = await getDocs(personsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as ResponsiblePerson[];
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: { firstName: string; lastName: string }): Promise<ResponsiblePerson> => {
  const personsCollection = collection(db, 'responsiblePersons');
  const docRef = await addDoc(personsCollection, { data: personData });
  return {
    id: docRef.id,
    ...personData
  } as ResponsiblePerson;
};

export const updateResponsiblePerson = async (id: string, personData: { firstName: string; lastName: string }): Promise<void> => {
  const personDoc = doc(db, 'responsiblePersons', id);
  await updateDoc(personDoc, { data: personData });
};

export const deleteResponsiblePerson = async (id: string): Promise<void> => {
  const personDoc = doc(db, 'responsiblePersons', id);
  await deleteDoc(personDoc);
};

// Templates functions (simulated for Firebase)
export const getTemplates = async (): Promise<StandTemplate[]> => {
  try {
    const templatesCollection = collection(db, 'templates');
    const snapshot = await getDocs(templatesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data
    })) as StandTemplate[];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const getTemplateById = async (id: string): Promise<StandTemplate | null> => {
  try {
    const templateDoc = doc(db, 'templates', id);
    const snapshot = await getDoc(templateDoc);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data().data
      } as StandTemplate;
    }
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

export const createTemplate = async (templateData: { theme: string; shelves: any[] }): Promise<StandTemplate> => {
  const templatesCollection = collection(db, 'templates');
  const docRef = await addDoc(templatesCollection, { data: templateData });
  return {
    id: docRef.id,
    ...templateData
  } as StandTemplate;
};

export const updateTemplate = async (id: string, templateData: { theme: string; shelves: any[] }): Promise<void> => {
  const templateDoc = doc(db, 'templates', id);
  await updateDoc(templateDoc, { data: templateData });
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const templateDoc = doc(db, 'templates', id);
  await deleteDoc(templateDoc);
};

// Template shelves functions (extracted from template data)
export const getTemplateShelves = async (templateId: string): Promise<TemplateShelf[]> => {
  try {
    const template = await getTemplateById(templateId);
    if (template && template.shelves) {
      const shelves: TemplateShelf[] = [];
      template.shelves.forEach((shelf: any) => {
        shelf.materials.forEach((materialId: string) => {
          shelves.push({
            id: `${templateId}_${shelf.number}_${materialId}`,
            template_id: templateId,
            shelf_number: shelf.number,
            material_id: materialId
          });
        });
      });
      return shelves;
    }
    return [];
  } catch (error) {
    console.error('Error fetching template shelves:', error);
    return [];
  }
};

export const updateTemplateShelves = async (templateId: string, shelves: { shelf_number: number; material_ids: string[] }[]): Promise<void> => {
  const templateDoc = doc(db, 'templates', templateId);
  const currentDoc = await getDoc(templateDoc);
  
  if (currentDoc.exists()) {
    const currentData = currentDoc.data().data;
    const shelvesData = shelves.map(shelf => ({
      number: shelf.shelf_number,
      materials: shelf.material_ids
    }));
    
    await updateDoc(templateDoc, { 
      data: {
        ...currentData,
        shelves: shelvesData
      }
    });
  }
};

// Checklist settings functions
export const getChecklistSettings = async (): Promise<ChecklistSettings> => {
  try {
    const settingsCollection = collection(db, 'checklistSettings');
    const snapshot = await getDocs(settingsCollection);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return doc.data().data as ChecklistSettings;
    }
    
    return getDefaultChecklistSettings();
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
  const settingsCollection = collection(db, 'checklistSettings');
  const snapshot = await getDocs(settingsCollection);
  
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, { data: settings });
  } else {
    await addDoc(settingsCollection, { data: settings });
  }
};

// Helper functions for compatibility
export const getMaterialsByIds = async (materialIds: string[]): Promise<Material[]> => {
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
