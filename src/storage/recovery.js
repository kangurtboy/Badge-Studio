// Project Backup, Export, Import and Recovery Manager

export class RecoveryManager {
  /**
   * Export the entire project as a JSON backup file
   */
  static exportProject(projectData, filename = `badge-studio-backup-${new Date().toISOString().slice(0, 10)}.json`) {
    try {
      const jsonString = JSON.stringify(
        {
          version: '1.0',
          app: 'Badge Studio',
          exportedAt: new Date().toISOString(),
          project: projectData,
        },
        null,
        2
      );

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Failed to export project backup:', e);
      return false;
    }
  }

  /**
   * Read and parse an imported JSON backup file
   */
  static async importProject(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Файл не выбран'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.project && Array.isArray(parsed.project.cards)) {
            resolve(parsed.project);
          } else if (Array.isArray(parsed.cards)) {
            resolve(parsed);
          } else {
            reject(new Error('Неверный формат файла резервной копии'));
          }
        } catch (err) {
          reject(new Error('Ошибка чтения JSON: ' + err.message));
        }
      };

      reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
      reader.readAsText(file);
    });
  }

  /**
   * Check IndexedDB storage quota
   */
  static async getStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageMb = Math.round((estimate.usage || 0) / (1024 * 1024) * 10) / 10;
        const quotaMb = Math.round((estimate.quota || 0) / (1024 * 1024) * 10) / 10;
        const percentUsed = quotaMb > 0 ? Math.round((usageMb / quotaMb) * 100) : 0;

        return {
          usageMb,
          quotaMb,
          percentUsed,
          isLowSpace: percentUsed > 90,
        };
      } catch (e) {
        console.warn('Storage estimate failed:', e);
      }
    }

    return {
      usageMb: 0,
      quotaMb: 0,
      percentUsed: 0,
      isLowSpace: false,
    };
  }
}
