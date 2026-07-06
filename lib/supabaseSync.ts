import { Project } from '@/types';
import { supabase } from './supabase';

export function toDB(p: Project) {
  return {
    id: p.id,
    name: p.name,
    client: p.client,
    client_phone: p.clientPhone ?? null,
    location: p.location,
    type: p.type,
    workflow_type: p.workflowType,
    priority: p.priority,
    value: p.value,
    current_stage: p.currentStage,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    scheduled_date: p.scheduledDate ?? null,
    deadline: p.deadline ?? null,
    description: p.description ?? null,
    area: p.area ?? null,
    maps_link: p.mapsLink ?? null,
    stages: p.stages,
  };
}

export function fromDB(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    clientPhone: row.client_phone ?? undefined,
    location: row.location,
    type: row.type,
    workflowType: row.workflow_type,
    priority: row.priority,
    value: Number(row.value),
    currentStage: row.current_stage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledDate: row.scheduled_date ?? undefined,
    deadline: row.deadline ?? undefined,
    description: row.description ?? '',
    area: row.area ? Number(row.area) : undefined,
    mapsLink: row.maps_link ?? undefined,
    stages: row.stages,
  };
}

export async function fetchProjectsDB(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error fetching projects', error);
    return [];
  }
  return data.map(fromDB);
}

export async function upsertProjectDB(p: Project) {
  const { error } = await supabase.from('projects').upsert(toDB(p));
  if (error) console.error('Error upserting project', error);
}

export async function deleteProjectDB(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error('Error deleting project', error);
}
