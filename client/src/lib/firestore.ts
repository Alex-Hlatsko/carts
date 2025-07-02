import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// New Firestore structure interfaces
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

// Helper function to generate QR code
const generateQRCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Materials functions
export const getMaterials = async (): Promise<Material[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'materials'));
    const materials: Material[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        id: doc.id,
        data: doc.data() as MaterialData
      });
    });
    
    return materials.sort((a, b) => a.data.name.localeCompare(b.data.name));
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const createMaterial = async (materialData: MaterialData): Promise<Material> => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), materialData);
    return {
      id: docRef.id,
      data: materialData
    };
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

export const updateMaterial = async (id: string, materialData: MaterialData): Promise<void> => {
  try {
    await updateDoc(doc(db, 'materials', id), materialData);
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Stands functions
export const getStands = async (): Promise<Stand[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stands'));
    const stands: Stand[] = [];
    
    querySnapshot.forEach((doc) => {
      stands.push({
        id: doc.id,
        data: doc.data() as StandData
      });
    });
    
    return stands.sort((a, b) => parseInt(a.data.number) - parseInt(b.data.number));
  } catch (error) {
    console.error('Error fetching stands:', error);
    return [];
  }
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  try {
    const stands = await getStands();
    return stands.find(stand => stand.data.qrCode === qrCode) || null;
  } catch (error) {
    console.error('Error fetching stand by QR:', error);
    return null;
  }
};

export const createStand = async (standData: StandData): Promise<Stand> => {
  try {
    if (!standData.qrCode) {
      standData.qrCode = generateQRCode();
    }
    
    const docRef = await addDoc(collection(db, 'stands'), standData);
    return {
      id: docRef.id,
      data: standData
    };
  } catch (error) {
    console.error('Error creating stand:', error);
    throw error;
  }
};

export const updateStand = async (id: string, standData: Partial<StandData>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'stands', id), standData);
  } catch (error) {
    console.error('Error updating stand:', error);
    throw error;
  }
};

export const deleteStand = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'stands', id));
  } catch (error) {
    console.error('Error deleting stand:', error);
    throw error;
  }
};

// Reports functions
export const getReports = async (): Promise<Report[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    const reports: Report[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        data: doc.data() as ReportData
      });
    });
    
    return reports.sort((a, b) => {
      const aTime = a.data.timestamp || '0';
      const bTime = b.data.timestamp || '0';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const createReport = async (reportData: ReportData): Promise<Report> => {
  try {
    reportData.timestamp = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'reports'), reportData);
    return {
      id: docRef.id,
      data: reportData
    };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'responsiblePersons'));
    const persons: ResponsiblePerson[] = [];
    
    querySnapshot.forEach((doc) => {
      persons.push({
        id: doc.id,
        data: doc.data() as ResponsiblePersonData
      });
    });
    
    return persons.sort((a, b) => a.data.firstName.localeCompare(b.data.firstName));
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return [];
  }
};

export const createResponsiblePerson = async (personData: ResponsiblePersonData): Promise<ResponsiblePerson> => {
  try {
    const docRef = await addDoc(collection(db, 'responsiblePersons'), personData);
    return {
      id: docRef.id,
      data: personData
    };
  } catch (error) {
    console.error('Error creating responsible person:', error);
    throw error;
  }
};

export const updateResponsiblePerson = async (id: string, personData: ResponsiblePersonData): Promise<void> => {
  try {
    await updateDoc(doc(db, 'responsiblePersons', id), personData);
  } catch (error) {
    console.error('Error updating responsible person:', error);
    throw error;
  }
};

export const deleteResponsiblePerson = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'responsiblePersons', id));
  } catch (error) {
    console.error('Error deleting responsible person:', error);
    throw error;
  }
};

// Templates functions
export const getTemplates = async (): Promise<Template[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'templates'));
    const templates: Template[] = [];
    
    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        data: doc.data() as TemplateData
      });
    });
    
    return templates.sort((a, b) => a.data.theme.localeCompare(b.data.theme));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const createTemplate = async (templateData: TemplateData): Promise<Template> => {
  try {
    const docRef = await addDoc(collection(db, 'templates'), templateData);
    return {
      id: docRef.id,
      data: templateData
    };
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (id: string, templateData: TemplateData): Promise<void> => {
  try {
    await updateDoc(doc(db, 'templates', id), templateData);
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'templates', id));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Helper function to get materials by IDs
export const getMaterialsByIds = async (materialIds: string[]): Promise<Material[]> => {
  try {
    const allMaterials = await getMaterials();
    return allMaterials.filter(material => materialIds.includes(material.id));
  } catch (error) {
    console.error('Error fetching materials by IDs:', error);
    return [];
  }
};

// Checklist settings (stored as a single document)
export const getChecklistSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'checklist');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
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
    }
  } catch (error) {
    console.error('Error fetching checklist settings:', error);
    return { items: [] };
  }
};

export const updateChecklistSettings = async (settings: any): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'checklist');
    await setDoc(docRef, settings);
  } catch (error) {
    console.error('Error updating checklist settings:', error);
    throw error;
  }
};
