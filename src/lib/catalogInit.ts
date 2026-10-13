import { db } from '../firebase';
import { doc, getDoc, setDoc, getDocs, collection, arrayUnion } from 'firebase/firestore';
import { initialCategories, initialProducts } from '../data/defaultCatalog';
import { cleanFirestoreData } from './utils';

let isSeeding = false;

export async function ensureDefaultCatalogSeeded() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const setupDocRef = doc(db, 'configuracoes', 'app_setup');
    const setupSnap = await getDoc(setupDocRef);
    const setupData = setupSnap.exists() ? setupSnap.data() : null;
    const deletedCategoryIds: string[] = setupData?.deletedCategoryIds || [];
    const deletedProductIds: string[] = setupData?.deletedProductIds || [];

    // Check existing categories in Firestore
    const catSnap = await getDocs(collection(db, 'categorias'));
    const existingCatIds = new Set(catSnap.docs.map(d => d.id));

    // For any initial category that does not exist in Firestore and was NOT explicitly deleted, save it to Firestore
    for (const cat of initialCategories) {
      if (!existingCatIds.has(cat.id) && !deletedCategoryIds.includes(cat.id)) {
        await setDoc(doc(db, 'categorias', cat.id), cleanFirestoreData(cat), { merge: true });
      }
    }

    // Check existing products in Firestore
    const prodSnap = await getDocs(collection(db, 'produtos'));
    const existingProdIds = new Set(prodSnap.docs.map(d => d.id));

    // For any initial product that does not exist in Firestore and was NOT explicitly deleted, save it to Firestore
    for (const prod of initialProducts) {
      if (!existingProdIds.has(prod.id) && !deletedProductIds.includes(prod.id)) {
        await setDoc(doc(db, 'produtos', prod.id), cleanFirestoreData(prod), { merge: true });
      }
    }

    // Mark setup as completed
    await setDoc(setupDocRef, {
      seeded: true,
      seededAt: setupData?.seededAt || new Date().toISOString()
    }, { merge: true });

  } catch (err) {
    console.warn('ensureDefaultCatalogSeeded error (will retry next time):', err);
  } finally {
    isSeeding = false;
  }
}

export async function markCategoryAsDeleted(id: string) {
  try {
    await setDoc(doc(db, 'configuracoes', 'app_setup'), {
      deletedCategoryIds: arrayUnion(id)
    }, { merge: true });
  } catch (e) {
    console.warn('Error marking category as deleted:', e);
  }
}

export async function markProductAsDeleted(id: string) {
  try {
    await setDoc(doc(db, 'configuracoes', 'app_setup'), {
      deletedProductIds: arrayUnion(id)
    }, { merge: true });
  } catch (e) {
    console.warn('Error marking product as deleted:', e);
  }
}
