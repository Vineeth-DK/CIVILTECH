import { fetchProjectsDB, upsertProjectDB } from './supabaseSync';
import { MOCK_PROJECTS } from './mockData';
import { supabase } from './supabase';

async function seed() {
  const existing = await fetchProjectsDB();
  if (existing.length > 0) {
    console.log('Database has existing data. Wiping...');
    for (const p of existing) {
      await supabase.from('projects').delete().eq('id', p.id);
    }
  }

  console.log('Seeding with mock data...');
  for (const p of MOCK_PROJECTS) {
    await upsertProjectDB(p);
  }
  console.log('Seeding complete!');
}

seed();
