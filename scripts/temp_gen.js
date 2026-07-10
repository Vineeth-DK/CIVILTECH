const fs = require('fs');

const offsets = [2, 3, 5, 10, 14, 18, 21, 24, 28, 45, 50, 65, 75, 85, 150, 200];

function generateDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

let out = `import { Project, WorkflowType, Priority } from '@/types';

const bp = (status: 'bypassed') => ({ status, completedAt: '2026-01-01T00:00:00Z' });

export const MOCK_PROJECTS: Project[] = [\n`;

const workflows = ['marking', 'mapping', 'survey', 'drawing', 'visualization', 'qs_boq'];

for(let i=0; i<offsets.length; i++) {
  const daysAgo = offsets[i];
  const dateStr = generateDate(daysAgo);
  const wf = workflows[i % workflows.length];
  
  out += `  {
    id: 'PRJ-10${i}',
    name: 'Mock Project ${i}',
    client: 'Mock Client ${i}',
    clientPhone: '+91 99999 9999${i % 10}',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: '${wf}' as WorkflowType,
    priority: 'medium' as Priority,
    value: ${100000 + i * 10000},
    description: 'Generated project ${i}',
    createdAt: '${dateStr}',
    updatedAt: '${dateStr}',
    scheduledDate: '${dateStr}',
    currentStage: 'accounts',
    stages: {
      sales: { status: 'completed', completedAt: '${dateStr}', assignedTo: 'Admin' },
      survey: { status: 'completed', completedAt: '${dateStr}', assignedTo: 'Admin', scheduledDate: '${dateStr}' },
      mapping: { status: 'completed', completedAt: '${dateStr}', assignedTo: 'Admin', scheduledDate: '${dateStr}' },
      drawing: bp('bypassed'),
      visualization: bp('bypassed'),
      qs_boq: bp('bypassed'),
      accounts: { status: 'pending' }
    }
  },\n`;
}

out += '];\n';

fs.writeFileSync('lib/mockData.ts', out);
