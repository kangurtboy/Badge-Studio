// Undo / Redo History Stack for Badge Studio

export class HistoryManager {
  constructor({ limit = 30, onStateChange } = {}) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this.isApplying = false;
    this.onStateChange = onStateChange || (() => {});
  }

  push(state) {
    if (this.isApplying) return;

    // Deep clone the state JSON
    const serialized = JSON.stringify(state);
    
    // Avoid duplicate pushes if state hasn't changed
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === serialized) {
      return;
    }

    this.undoStack.push(serialized);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }

    // Clear redo when a new user action is performed
    this.redoStack = [];
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;

    this.isApplying = true;
    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);

    const previousStateJson = this.undoStack[this.undoStack.length - 1];
    const state = JSON.parse(previousStateJson);
    this.isApplying = false;

    this.notify();
    return state;
  }

  redo() {
    if (!this.canRedo()) return null;

    this.isApplying = true;
    const stateJson = this.redoStack.pop();
    this.undoStack.push(stateJson);

    const state = JSON.parse(stateJson);
    this.isApplying = false;

    this.notify();
    return state;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  notify() {
    this.onStateChange({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    });
  }
}
