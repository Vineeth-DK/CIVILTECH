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
    is_deleted: p.isDeleted ?? false,
  };

  // Only append gst_number if it exists to avoid crashing if the DB column is missing
  if (p.gstNumber) {
    (payload as any).gst_number = p.gstNumber;
  }

  return payload;
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
    stages: typeof row.stages === 'string' ? JSON.parse(row.stages) : row.stages,
    isDeleted: row.is_deleted ?? false,
    gstNumber: row.gst_number ?? undefined,
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
  const { error } = await supabase.from('projects').update({ is_deleted: true }).eq('id', id);
  if (error) console.error('Error deleting project', error);
}

export async function permanentlyDeleteProjectDB(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error('Error permanently deleting project', error);
}


export function subscribeProjectsDB(
  onInsert: (p: Project) => void,
  onUpdate: (p: Project) => void,
  onDelete: (id: string) => void
) {
  const channelName = 'projects-changes-' + Math.random().toString(36).substring(7);
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, (payload) => {
      onInsert(fromDB(payload.new));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, (payload) => {
      onUpdate(fromDB(payload.new));
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' }, (payload) => {
      onDelete(payload.old.id);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
