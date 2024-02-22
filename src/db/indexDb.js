export async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MusicDatabase', 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('music')) {
        db.createObjectStore('music', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('lastplayed')) {
        db.createObjectStore('lastplayed', { keyPath: 'id' });
      }
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}


  export async function getPlaylist() {
    const db = await openDatabase();
    const transaction = db.transaction(['music'], 'readonly');
    const objectStore = transaction.objectStore('music');
    const getRequest = objectStore.getAll();
    return getRequest.result;
  }
  
  export async function addMusicFile(file) {
    const db = await openDatabase();
    const transaction = db.transaction(['music'], 'readwrite');
    const objectStore = transaction.objectStore('music');
    const addRequest = objectStore.add(file);
    return new Promise((resolve, reject) => {
      addRequest.onsuccess = function(event) {
        resolve();
      };
      addRequest.onerror = function(event) {
        reject(event.target.error);
      };
    });
  }
  