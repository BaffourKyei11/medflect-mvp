// Groq Prompt: UI Banner for Conflict Warnings
// Tool: ConflictBanner
import React, { useEffect, useState } from 'react';
import { conflictEmitter } from './conflictTagger';

export default function ConflictBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onConflict() { setVisible(true); }
    conflictEmitter.on('conflict:tagged', onConflict);
    return () => conflictEmitter.off('conflict:tagged', onConflict);
  }, []);
  if (!visible) return null;
  return (
    <div style={{ background: '#ffe066', color: '#222', padding: 12, textAlign: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
      ⚠ Some records were updated offline; please review conflicts.
      <button style={{ marginLeft: 16 }} onClick={() => setVisible(false)}>Dismiss</button>
    </div>
  );
}
