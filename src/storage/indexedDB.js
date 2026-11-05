// IndexedDB wrapper for Badge Studio projects and cards

const DB_NAME = 'BadgeStudioDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_CARDS = 'cards';
const STORE_ASSETS = 'assets';

let dbInstance = null;

export async function openDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        const cardStore = db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
        cardStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

export async function saveProject(project) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROJECTS], 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    const request = store.put({
      ...project,
      updatedAt: Date.now()
    });

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function loadProject(id = 'current-project') {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROJECTS], 'readonly');
    const store = tx.objectStore(STORE_PROJECTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveAsset(id, dataUrlOrBlob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ASSETS], 'readwrite');
    const store = tx.objectStore(STORE_ASSETS);
    const request = store.put({ id, data: dataUrlOrBlob, updatedAt: Date.now() });

    request.onsuccess = () => resolve(id);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getAsset(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ASSETS], 'readonly');
    const store = tx.objectStore(STORE_ASSETS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = (e) => reject(e.target.error);
  });
}
