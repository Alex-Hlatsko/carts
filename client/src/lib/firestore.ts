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
      const data = doc.data();
      materials.push({
        id: doc.id,
        data: {
          name: data.name || '',
          imageUrl: data.imageUrl
        }
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
    const docData: any = {
      name: materialData.name
    };
    if (materialData.imageUrl) {
      docData.imageUrl = materialData.imageUrl;
    }
    
    const docRef = await addDoc(collection(db, 'materials'), docData);
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
    const docData: any = {
      name: materialData.name
    };
    if (materialData.imageUrl) {
      docData.imageUrl = materialData.imageUrl;
    }
    await updateDoc(doc(db, 'materials', id), docData);
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
      const data = doc.data();
      stands.push({
        id: doc.id,
        data: {
          number: data.number || '',
          theme: data.theme || '',
          shelves: data.shelves || [],
          status: data.status || 'В Зале Царства',
          qrCode: data.qrCode
        }
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
    
    const docData: any = {
      number: standData.number,
      theme: standData.theme,
      shelves: standData.shelves,
      status: standData.status,
      qrCode: standData.qrCode
    };
    
    const docRef = await addDoc(collection(db, 'stands'), docData);
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
    const docData: any = {};
    if (standData.number) docData.number = standData.number;
    if (standData.theme) docData.theme = standData.theme;
    if (standData.shelves) docData.shelves = standData.shelves;
    if (standData.status) docData.status = standData.status;
    if (standData.qrCode) docData.qrCode = standData.qrCode;
    
    await updateDoc(doc(db, 'stands', id), docData);
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
      const data = doc.data();
      reports.push({
        id: doc.id,
        data: {
          standId: data.standId || '',
          action: data.action || 'receive',
          handledBy: data.handledBy || '',
          comments: data.comments,
          checklist: data.checklist,
          timestamp: data.timestamp,
          issuedTo: data.issuedTo
        }
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
    const timestamp = new Date().toISOString();
    const docData: any = {
      standId: reportData.standId,
      action: reportData.action,
      handledBy: reportData.handledBy,
      timestamp: timestamp
    };
    
    if (reportData.comments) docData.comments = reportData.comments;
    if (reportData.checklist) docData.checklist = reportData.checklist;
    if (reportData.issuedTo) docData.issuedTo = reportData.issuedTo;
    
    const docRef = await addDoc(collection(db, 'reports'), docData);
    return {
      id: docRef.id,
      data: { ...reportData, timestamp }
    };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Transaction alias for backward compatibility
export const createTransaction = createReport;
export const getTransactions = async (): Promise<TransactionWithService[]> => {
  try {
    const reports = await getReports();
    const stands = await getStands();
    const services = await getStandServices();
    const responsiblePersons = await getResponsiblePersons();
    
    return reports.map(report => {
      const stand = stands.find(s => s.id === report.data.standId);
      const service = services.find(s => s.data.transactionId === report.id);
      
      let serviceWithName = undefined;
      if (service) {
        const person = responsiblePersons.find(p => p.id === service.data.responsiblePersonId);
        serviceWithName = {
          ...service,
          responsible_person_name: person ? `${person.data.firstName} ${person.data.lastName}` : 'Неизвестно'
        };
      }
      
      return {
        ...report,
        service: serviceWithName,
        stand_number: stand?.data.number || '',
        stand_name: stand?.data.theme || '',
        stand_image_url: undefined,
        type: report.data.action,
        date_time: report.data.timestamp || '',
        checklist_data: report.data.checklist ? JSON.stringify(report.data.checklist) : undefined,
        notes: report.data.comments,
        issued_to: report.data.issuedTo,
        issued_by: undefined,
        received_by: report.data.action === 'receive' ? report.data.handledBy : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Responsible persons functions
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'responsiblePersons'));
    const persons: ResponsiblePerson[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      persons.push({
        id: doc.id,
        data: {
          firstName: data.firstName || '',
          lastName: data.lastName || ''
        }
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
    const docData: any = {
      firstName: personData.firstName,
      lastName: personData.lastName
    };
    
    const docRef = await addDoc(collection(db, 'responsiblePersons'), docData);
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
    const docData: any = {
      firstName: personData.firstName,
      lastName: personData.lastName
    };
    await updateDoc(doc(db, 'responsiblePersons', id), docData);
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
      const data = doc.data();
      templates.push({
        id: doc.id,
        data: {
          theme: data.theme || '',
          shelves: data.shelves || []
        }
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
    const docData: any = {
      theme: templateData.theme,
      shelves: templateData.shelves
    };
    
    const docRef = await addDoc(collection(db, 'templates'), docData);
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
    const docData: any = {
      theme: templateData.theme,
      shelves: templateData.shelves
    };
    await updateDoc(doc(db, 'templates', id), docData);
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

// Stand Services functions
export const getStandServices = async (): Promise<StandService[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'standServices'));
    const services: StandService[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      services.push({
        id: doc.id,
        data: {
          transactionId: data.transactionId || '',
          responsiblePersonId: data.responsiblePersonId || '',
          comment: data.comment,
          servicedAt: data.servicedAt || new Date().toISOString()
        }
      });
    });
    
    return services;
  } catch (error) {
    console.error('Error fetching stand services:', error);
    return [];
  }
};

export const createStandService = async (serviceData: {
  transaction_id: string;
  responsible_person_id: string;
  comment?: string | null;
}): Promise<StandService> => {
  try {
    const timestamp = new Date().toISOString();
    const docData: any = {
      transactionId: serviceData.transaction_id,
      responsiblePersonId: serviceData.responsible_person_id,
      servicedAt: timestamp
    };
    
    if (serviceData.comment) {
      docData.comment = serviceData.comment;
    }
    
    const docRef = await addDoc(collection(db, 'standServices'), docData);
    return {
      id: docRef.id,
      data: {
        transactionId: serviceData.transaction_id,
        responsiblePersonId: serviceData.responsible_person_id,
        comment: serviceData.comment || undefined,
        servicedAt: timestamp
      }
    };
  } catch (error) {
    console.error('Error creating stand service:', error);
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
      const data = docSnap.data();
      return {
        items: data.items || []
      };
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
