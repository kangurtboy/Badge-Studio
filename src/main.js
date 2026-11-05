import './styles/global.css';
import './styles/editor.css';
import './printing/printStyles.css';

import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    const app = new App(root);
    app.init();
  }
});
