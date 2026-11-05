import { saveProject } from './indexedDB.js';

let saveTimeout = null;
const DEBOUNCE_DELAY_MS = 600;

export class AutoSaveManager {
  constructor(statusCallback) {
    this.statusCallback = statusCallback || (() => {});
    this.status = 'saved';
  }

  setStatus(status, message) {
    this.status = status;
    this.statusCallback(status, message);
  }

  schedule(projectData) {
    this.setStatus('saving', 'Сохранение...');

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      try {
        await saveProject(projectData);
        this.setStatus('saved', 'Сохранено');
      } catch (err) {
        console.error('Autosave failed:', err);
        this.setStatus('error', 'Ошибка сохранения');
      }
    }, DEBOUNCE_DELAY_MS);
  }

  async saveNow(projectData) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    this.setStatus('saving', 'Сохранение...');
    try {
      await saveProject(projectData);
      this.setStatus('saved', 'Сохранено');
      return true;
    } catch (err) {
      console.error('Explicit save failed:', err);
      this.setStatus('error', 'Ошибка сохранения');
      return false;
    }
  }
}
