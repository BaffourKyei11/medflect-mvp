// Groq Prompt: Conflict Detection & Tagging
// Tool: conflictTagger
const { db } = require('./clientSync');
const EventEmitter = require('events');
const conflictEmitter = new EventEmitter();

db.changes({ live: true, include_docs: true, conflicts: true })
  .on('change', async change => {
    if (change.doc._conflicts) {
      const latest = change.doc._rev;
      for (const rev of change.doc._conflicts) {
        const staleDoc = await db.get(change.id, { rev });
        staleDoc._conflictFlag = 'updated_on_device';
        await db.put(staleDoc);
      }
      conflictEmitter.emit('conflict:tagged', { id: change.id, conflicts: change.doc._conflicts });
    }
  });

module.exports = { conflictEmitter };
