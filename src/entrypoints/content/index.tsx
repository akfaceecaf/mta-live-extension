// Content script: injected into every page (see manifest.json "content_scripts").
// The React app renders inside a Shadow DOM so the host page's CSS can't affect it,
// and our CSS can't leak into the page.
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from './style.css?inline';

const HOST_ID = 'mta-live-root';

function mount() {
  if (document.getElementById(HOST_ID)) return; // already injected

  const host = document.createElement('div');
  host.id = HOST_ID;
  document.documentElement.append(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;
  const container = document.createElement('div');
  shadow.append(style, container);

  createRoot(container).render(<App />);
}

mount();
