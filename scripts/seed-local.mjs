import { MongoClient } from 'mongodb';
import { pathToFileURL } from 'node:url';

export async function seed() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  try {
    const db = client.db('ComunityBazar-local');
    const photoURL = '/favicon.svg';
    for (const [email, name, role] of [
      ['student@comunitybazar.test', 'Local Student', 'general user'],
      ['admin@comunitybazar.test', 'Local Admin', 'admin'],
    ]) {
      const call = async (method, body) => {
        const response = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:${method}?key=demo-comunity-bazar-key`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const result = await response.json();
        return { response, result };
      };
      let { response, result } = await call('signUp', { email, password: 'Campus123!', returnSecureToken: true });
      if (result.error?.message === 'EMAIL_EXISTS') ({ response, result } = await call('signInWithPassword', { email, password: 'Campus123!', returnSecureToken: true }));
      if (!response.ok) throw new Error(`Test account setup failed: ${result.error?.message}`);
      const update = await call('update', { idToken: result.idToken, displayName: name, photoUrl: photoURL, returnSecureToken: true });
      if (!update.response.ok) throw new Error('Could not set test profile');
      await db.collection('user').updateOne({ email }, { $setOnInsert: { email, name, role, mainImageUrl: photoURL, createdAt: new Date() } }, { upsert: true });
    }
    for (const [key, name, category, price] of [
      ['book', 'Local Test Textbook', 'Accessories', 250],
      ['calculator', 'Local Test Calculator', 'Electronics', 850],
      ['bag', 'Local Test Campus Bag', 'Clothes & Fashion', 500],
    ]) {
      await db.collection('listings').updateOne({ localSeedKey: key }, { $setOnInsert: {
        localSeedKey: key, name, category, price, productType: 'Used', location: 'Test Campus',
        description: 'Sample listing for local testing. No real purchase or payment.',
        image: photoURL, email: 'student@comunitybazar.test', date: '2026-09-05', createdAt: new Date(),
      } }, { upsert: true });
    }
    console.log('Local test accounts and sample listings are ready.');
  } finally { await client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await seed();
