import { useEffect, useState } from 'react';
import { sendMessage } from '@/lib/messaging';

// Placeholder that confirms the content script ↔ background wiring works.
export default function App() {
  const [status, setStatus] = useState('connecting…');

  useEffect(() => {
    sendMessage({ type: 'PING' })
      .then(() => setStatus('connected'))
      .catch((err: Error) => setStatus(`error: ${err.message}`));
  }, []);

  return <div className="mta-live">MTA Live ({status})</div>;
}
