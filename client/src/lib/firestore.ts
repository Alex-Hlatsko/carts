import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Stand, 
  Transaction, 
  Material, 
  StandTemplate, 
  ResponsiblePerson, 
  ChecklistSettings,
  StandService,
  TemplateWithShelves,
  TransactionWithService
} from '@/types';

// Collections
const COLLECTIONS = {
  STANDS: 'stands',
  TRANSACTIONS: 'transactions', 
  MATERIALS: 'materials',
  TEMPLATES: 'stand_templates',
  TEMPLATE_SHELVES: 'template_shelves',
  RESPONSIBLE_PERSONS: 'responsible_persons',
  CHECKLIST_SETTINGS: 'checklist_settings',
  STAND_SERVICES: 'stand_services'
};

// Utility function to convert Firestore timestamp to ISO string
const timestampToISO = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Materials
export const getMaterials = async (): Promise<Material[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.MATERIALS), orderBy('name'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: timestampToISO(doc.data().created_at),
    updated_at: timestampToISO(doc.data().updated_at)
  })) as Material[];
};

export const createMaterial = async (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.MATERIALS), {
    ...material,
    created_at: now,
    updated_at: now
  });
  
  const newDoc = await getDoc(docRef);
  return {
    id: newDoc.id,
    ...newDoc.data(),
    created_at: timestampToISO(newDoc.data()?.created_at),
    updated_at: timestampToISO(newDoc.data()?.updated_at)
  } as Material;
};

export const updateMaterial = async (id: string, updates: Partial<Material>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MATERIALS, id);
  await updateDoc(docRef, {
    ...updates,
    updated_at: Timestamp.now()
  });
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.MATERIALS, id));
};

// Stand Templates
export const getTemplates = async (): Promise<TemplateWithShelves[]> => {
  const templatesSnapshot = await getDocs(collection(db, COLLECTIONS.TEMPLATES));
  const templates = templatesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: timestampToISO(doc.data().created_at),
    updated_at: timestampToISO(doc.data().updated_at)
  })) as StandTemplate[];

  // Get materials for each template
  const templatesWithShelves: TemplateWithShelves[] = [];
  
  for (const template of templates) {
    const shelvesSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.TEMPLATE_SHELVES),
        where('template_id', '==', template.id)
      )
    );
    
    const shelfMaterialIds = shelvesSnapshot.docs.map(doc => doc.data());
    const materials = await getMaterials();
    
    // Group materials by shelf
    const shelfMap = new Map();
    shelfMaterialIds.forEach(shelf => {
      if (!shelfMap.has(shelf.shelf_number)) {
        shelfMap.set(shelf.shelf_number, []);
      }
      const material = materials.find(m => m.id === shelf.material_id);
      if (material) {
        shelfMap.get(shelf.shelf_number).push(material);
      }
    });
    
    const shelves = [1, 2, 3].map(shelfNumber => ({
      shelf_number: shelfNumber,
      materials: shelfMap.get(shelfNumber) || []
    }));
    
    templatesWithShelves.push({
      ...template,
      shelves
    });
  }
  
  return templatesWithShelves;
};

export const createTemplate = async (template: {
  theme: string;
  shelves: Array<{ shelf_number: number; materials: Material[] }>;
}): Promise<void> => {
  const now = Timestamp.now();
  
  // Create template
  const templateRef = await addDoc(collection(db, COLLECTIONS.TEMPLATES), {
    theme: template.theme,
    created_at: now,
    updated_at: now
  });
  
  // Create shelf materials
  for (const shelf of template.shelves) {
    for (const material of shelf.materials) {
      await addDoc(collection(db, COLLECTIONS.TEMPLATE_SHELVES), {
        template_id: templateRef.id,
        shelf_number: shelf.shelf_number,
        material_id: material.id
      });
    }
  }
};

export const updateTemplate = async (id: string, template: {
  theme: string;
  shelves: Array<{ shelf_number: number; materials: Material[] }>;
}): Promise<void> => {
  // Update template
  await updateDoc(doc(db, COLLECTIONS.TEMPLATES, id), {
    theme: template.theme,
    updated_at: Timestamp.now()
  });
  
  // Delete existing shelves
  const existingShelvesQuery = query(
    collection(db, COLLECTIONS.TEMPLATE_SHELVES),
    where('template_id', '==', id)
  );
  const existingShelves = await getDocs(existingShelvesQuery);
  await Promise.all(existingShelves.docs.map(doc => deleteDoc(doc.ref)));
  
  // Create new shelves
  for (const shelf of template.shelves) {
    for (const material of shelf.materials) {
      await addDoc(collection(db, COLLECTIONS.TEMPLATE_SHELVES), {
        template_id: id,
        shelf_number: shelf.shelf_number,
        material_id: material.id
      });
    }
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  // Delete template shelves first
  const shelvesQuery = query(
    collection(db, COLLECTIONS.TEMPLATE_SHELVES),
    where('template_id', '==', id)
  );
  const shelves = await getDocs(shelvesQuery);
  await Promise.all(shelves.docs.map(doc => deleteDoc(doc.ref)));
  
  // Delete template
  await deleteDoc(doc(db, COLLECTIONS.TEMPLATES, id));
};

// Responsible Persons
export const getResponsiblePersons = async (): Promise<ResponsiblePerson[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.RESPONSIBLE_PERSONS), orderBy('first_name'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: timestampToISO(doc.data().created_at),
    updated_at: timestampToISO(doc.data().updated_at)
  })) as ResponsiblePerson[];
};

export const createResponsiblePerson = async (person: Omit<ResponsiblePerson, 'id' | 'created_at' | 'updated_at'>): Promise<ResponsiblePerson> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.RESPONSIBLE_PERSONS), {
    ...person,
    created_at: now,
    updated_at: now
  });
  
  const newDoc = await getDoc(docRef);
  return {
    id: newDoc.id,
    ...newDoc.data(),
    created_at: timestampToISO(newDoc.data()?.created_at),
    updated_at: timestampToISO(newDoc.data()?.updated_at)
  } as ResponsiblePerson;
};

export const updateResponsiblePerson = async (id: string, updates: Partial<ResponsiblePerson>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.RESPONSIBLE_PERSONS, id), {
    ...updates,
    updated_at: Timestamp.now()
  });
};

export const deleteResponsiblePerson = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.RESPONSIBLE_PERSONS, id));
};

// Stands
export const getStands = async (): Promise<Stand[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.STANDS), orderBy('number'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: timestampToISO(doc.data().created_at),
    updated_at: timestampToISO(doc.data().updated_at)
  })) as Stand[];
};

export const getStandByQR = async (qrCode: string): Promise<Stand | null> => {
  const q = query(
    collection(db, COLLECTIONS.STANDS),
    where('qr_code', '==', qrCode)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    created_at: timestampToISO(doc.data().created_at),
    updated_at: timestampToISO(doc.data().updated_at)
  } as Stand;
};

export const createStand = async (stand: Omit<Stand, 'id' | 'created_at' | 'updated_at'>): Promise<Stand> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.STANDS), {
    ...stand,
    created_at: now,
    updated_at: now
  });
  
  const newDoc = await getDoc(docRef);
  return {
    id: newDoc.id,
    ...newDoc.data(),
    created_at: timestampToISO(newDoc.data()?.created_at),
    updated_at: timestampToISO(newDoc.data()?.updated_at)
  } as Stand;
};

export const updateStand = async (id: string, updates: Partial<Stand>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.STANDS, id), {
    ...updates,
    updated_at: Timestamp.now()
  });
};

export const deleteStand = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.STANDS, id));
};

// Transactions
export const getTransactions = async (): Promise<TransactionWithService[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('date_time', 'desc'))
  );
  
  const transactions = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date_time: timestampToISO(doc.data().date_time)
  })) as Transaction[];
  
  // Get stand info and services for each transaction
  const transactionsWithService: TransactionWithService[] = [];
  
  for (const transaction of transactions) {
    // Get stand info
    const standDoc = await getDoc(doc(db, COLLECTIONS.STANDS, transaction.stand_id));
    const standData = standDoc.data();
    
    // Get service info
    const servicesQuery = query(
      collection(db, COLLECTIONS.STAND_SERVICES),
      where('transaction_id', '==', transaction.id)
    );
    const servicesSnapshot = await getDocs(servicesQuery);
    
    let service = null;
    if (!servicesSnapshot.empty) {
      const serviceDoc = servicesSnapshot.docs[0];
      const serviceData = serviceDoc.data();
      
      // Get responsible person
      const personDoc = await getDoc(doc(db, COLLECTIONS.RESPONSIBLE_PERSONS, serviceData.responsible_person_id));
      const personData = personDoc.data();
      
      service = {
        id: serviceDoc.id,
        ...serviceData,
        serviced_at: timestampToISO(serviceData.serviced_at),
        responsible_person_name: `${personData?.first_name} ${personData?.last_name}`
      };
    }
    
    transactionsWithService.push({
      ...transaction,
      stand_number: standData?.number || '',
      stand_name: standData?.name || '',
      stand_image_url: standData?.image_url || null,
      service
    });
  }
  
  return transactionsWithService;
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'date_time'>): Promise<Transaction> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transaction,
    date_time: Timestamp.now()
  });
  
  const newDoc = await getDoc(docRef);
  return {
    id: newDoc.id,
    ...newDoc.data(),
    date_time: timestampToISO(newDoc.data()?.date_time)
  } as Transaction;
};

// Stand Services
export const createStandService = async (service: Omit<StandService, 'id' | 'serviced_at'>): Promise<StandService> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.STAND_SERVICES), {
    ...service,
    serviced_at: Timestamp.now()
  });
  
  const newDoc = await getDoc(docRef);
  return {
    id: newDoc.id,
    ...newDoc.data(),
    serviced_at: timestampToISO(newDoc.data()?.serviced_at)
  } as StandService;
};

// Checklist Settings
export const getChecklistSettings = async (): Promise<ChecklistSettings> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.CHECKLIST_SETTINGS));
  
  if (querySnapshot.empty) {
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
  
  const doc = querySnapshot.docs[0];
  return doc.data() as ChecklistSettings;
};

export const updateChecklistSettings = async (settings: ChecklistSettings): Promise<void> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.CHECKLIST_SETTINGS));
  
  if (querySnapshot.empty) {
    // Create new settings
    await addDoc(collection(db, COLLECTIONS.CHECKLIST_SETTINGS), {
      ...settings,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
  } else {
    // Update existing settings
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...settings,
      updated_at: Timestamp.now()
    });
  }
};
