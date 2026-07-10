const fs = require('fs');

const offsets = [2, 3, 5, 10, 14, 18, 21, 24, 28, 45, 50, 65, 75, 85, 150, 200];

function generateDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

let out = `import { Project, WorkflowType, Priority, PipelineStage, StageStatus, StageRecord } from '@/types';

const bp = (status: 'bypassed'): StageRecord => ({ status, completedAt: '2026-01-01T00:00:00Z' });

export const MOCK_PROJECTS: Project[] = [\n`;

const workflows = ['survey', 'marking', 'drawing', 'visualization', 'qs_boq'];

for(let i=0; i<offsets.length; i++) {
  const daysAgo = offsets[i];
  const dateStr = generateDate(daysAgo);
  const wf = workflows[i % workflows.length];
  const stateType = i % 3; // 0: Sales, 1: Active Dept, 2: Accounts/Done
  
  let currentStage = 'sales';
  let stages = {
    sales: { status: 'pending' },
    survey: { status: 'pending' },
    mapping: { status: 'pending' },
    drawing: { status: 'pending' },
    visualization: { status: 'pending' },
    qs_boq: { status: 'pending' },
    accounts: { status: 'pending' }
  };

  const comp = (assignedTo = 'Admin') => ({ status: 'completed', completedAt: dateStr, assignedTo });
  const inProg = (assignedTo = 'Admin') => ({ status: 'in_progress', assignedTo, scheduledDate: dateStr });
  const pend = () => ({ status: 'pending' });
  const bp = () => ({ status: 'bypassed', completedAt: '2026-01-01T00:00:00Z' });

  // Baseline workflow setup
  if (wf === 'survey') {
    stages = { sales: pend(), survey: pend(), mapping: pend(), drawing: bp(), visualization: bp(), qs_boq: bp(), accounts: pend() };
  } else if (wf === 'marking') {
    stages = { sales: pend(), survey: pend(), mapping: pend(), drawing: bp(), visualization: bp(), qs_boq: bp(), accounts: pend() };
  } else if (wf === 'drawing') {
    stages = { sales: pend(), survey: bp(), mapping: bp(), drawing: pend(), visualization: bp(), qs_boq: bp(), accounts: pend() };
  } else if (wf === 'visualization') {
    stages = { sales: pend(), survey: bp(), mapping: bp(), drawing: bp(), visualization: pend(), qs_boq: bp(), accounts: pend() };
  } else if (wf === 'qs_boq') {
    stages = { sales: pend(), survey: bp(), mapping: bp(), drawing: bp(), visualization: bp(), qs_boq: pend(), accounts: pend() };
  }

  // Apply stateType
  if (stateType === 0) {
    // In Sales
    currentStage = 'sales';
    stages.sales = inProg('Priya Sharma');
  } else if (stateType === 1) {
    // Active in Dept
    stages.sales = comp('Priya Sharma');
    if (wf === 'survey') {
      // 50% survey, 50% mapping
      if (i % 2 === 0) { currentStage = 'survey'; stages.survey = inProg('Ravi Kumar'); }
      else { currentStage = 'mapping'; stages.survey = comp('Ravi Kumar'); stages.mapping = inProg('Sneha Patel'); }
    } else if (wf === 'marking') {
      currentStage = 'survey'; stages.survey = inProg('Ravi Kumar'); stages.mapping = inProg('Sneha Patel');
    } else if (wf === 'drawing') {
      currentStage = 'drawing'; stages.drawing = inProg('Arjun Singh');
    } else if (wf === 'visualization') {
      currentStage = 'visualization'; stages.visualization = inProg('Arjun Singh');
    } else if (wf === 'qs_boq') {
      currentStage = 'qs_boq'; stages.qs_boq = inProg('Neha Gupta');
    }
  } else if (stateType === 2) {
    // Accounts or Done
    stages.sales = comp('Priya Sharma');
    if (wf === 'survey') { stages.survey = comp('Ravi Kumar'); stages.mapping = comp('Sneha Patel'); }
    if (wf === 'marking') { stages.survey = comp('Ravi Kumar'); stages.mapping = comp('Sneha Patel'); }
    if (wf === 'drawing') { stages.drawing = comp('Arjun Singh'); }
    if (wf === 'visualization') { stages.visualization = comp('Arjun Singh'); }
    if (wf === 'qs_boq') { stages.qs_boq = comp('Neha Gupta'); }
    
    currentStage = 'accounts';
    if (daysAgo > 60) {
      stages.accounts = comp('Kavitha Nair');
    } else {
      stages.accounts = inProg('Kavitha Nair');
    }
  }

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
    currentStage: '${currentStage}' as PipelineStage,
    stages: ${JSON.stringify(stages, null, 6).replace(/"/g, "'")}
  },\n`;
}

out += '];\n';

fs.writeFileSync('lib/mockData.ts', out);
