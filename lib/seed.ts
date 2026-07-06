import { fetchProjectsDB, upsertProjectDB } from './supabaseSync';
import { MOCK_PROJECTS } from './mockData';

async function seed() {
  const existing = await fetchProjectsDB();
  if (existing.length === 0) {
    console.log('Database empty. Seeding with mock data...');
    for (const p of MOCK_PROJECTS) {
      await upsertProjectDB(p);
    }
    console.log('Seeding complete!');
  } else {
    console.log('Database already has data. Skipping seed.');
  }
}

seed();
