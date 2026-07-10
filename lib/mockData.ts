import { Project, WorkflowType, Priority, PipelineStage, StageStatus, StageRecord } from '@/types';

const bp = (status: 'bypassed'): StageRecord => ({ status, completedAt: '2026-01-01T00:00:00Z' });

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-100',
    name: 'Mock Project 0',
    client: 'Mock Client 0',
    clientPhone: '+91 99999 99990',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'survey' as WorkflowType,
    priority: 'medium' as Priority,
    value: 100000,
    description: 'Generated project 0',
    createdAt: '2026-07-08T04:34:23.372Z',
    updatedAt: '2026-07-08T04:34:23.372Z',
    scheduledDate: '2026-07-08T04:34:23.372Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2026-07-08T04:34:23.372Z'
      },
      'survey': {
            'status': 'pending'
      },
      'mapping': {
            'status': 'pending'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-101',
    name: 'Mock Project 1',
    client: 'Mock Client 1',
    clientPhone: '+91 99999 99991',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'marking' as WorkflowType,
    priority: 'medium' as Priority,
    value: 110000,
    description: 'Generated project 1',
    createdAt: '2026-07-07T04:34:23.374Z',
    updatedAt: '2026-07-07T04:34:23.374Z',
    scheduledDate: '2026-07-07T04:34:23.374Z',
    currentStage: 'survey' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-07-07T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'in_progress',
            'assignedTo': 'Ravi Kumar',
            'scheduledDate': '2026-07-07T04:34:23.374Z'
      },
      'mapping': {
            'status': 'in_progress',
            'assignedTo': 'Sneha Patel',
            'scheduledDate': '2026-07-07T04:34:23.374Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-102',
    name: 'Mock Project 2',
    client: 'Mock Client 2',
    clientPhone: '+91 99999 99992',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'drawing' as WorkflowType,
    priority: 'medium' as Priority,
    value: 120000,
    description: 'Generated project 2',
    createdAt: '2026-07-05T04:34:23.374Z',
    updatedAt: '2026-07-05T04:34:23.374Z',
    scheduledDate: '2026-07-05T04:34:23.374Z',
    currentStage: 'accounts' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-07-05T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'completed',
            'completedAt': '2026-07-05T04:34:23.374Z',
            'assignedTo': 'Arjun Singh'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'in_progress',
            'assignedTo': 'Kavitha Nair',
            'scheduledDate': '2026-07-05T04:34:23.374Z'
      }
}
  },
  {
    id: 'PRJ-103',
    name: 'Mock Project 3',
    client: 'Mock Client 3',
    clientPhone: '+91 99999 99993',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'visualization' as WorkflowType,
    priority: 'medium' as Priority,
    value: 130000,
    description: 'Generated project 3',
    createdAt: '2026-06-30T04:34:23.374Z',
    updatedAt: '2026-06-30T04:34:23.374Z',
    scheduledDate: '2026-06-30T04:34:23.374Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2026-06-30T04:34:23.374Z'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'pending'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-104',
    name: 'Mock Project 4',
    client: 'Mock Client 4',
    clientPhone: '+91 99999 99994',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'qs_boq' as WorkflowType,
    priority: 'medium' as Priority,
    value: 140000,
    description: 'Generated project 4',
    createdAt: '2026-06-26T04:34:23.374Z',
    updatedAt: '2026-06-26T04:34:23.374Z',
    scheduledDate: '2026-06-26T04:34:23.374Z',
    currentStage: 'qs_boq' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-06-26T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'in_progress',
            'assignedTo': 'Neha Gupta',
            'scheduledDate': '2026-06-26T04:34:23.374Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-105',
    name: 'Mock Project 5',
    client: 'Mock Client 5',
    clientPhone: '+91 99999 99995',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'survey' as WorkflowType,
    priority: 'medium' as Priority,
    value: 150000,
    description: 'Generated project 5',
    createdAt: '2026-06-22T04:34:23.374Z',
    updatedAt: '2026-06-22T04:34:23.374Z',
    scheduledDate: '2026-06-22T04:34:23.374Z',
    currentStage: 'accounts' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-06-22T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'completed',
            'completedAt': '2026-06-22T04:34:23.374Z',
            'assignedTo': 'Ravi Kumar'
      },
      'mapping': {
            'status': 'completed',
            'completedAt': '2026-06-22T04:34:23.374Z',
            'assignedTo': 'Sneha Patel'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'in_progress',
            'assignedTo': 'Kavitha Nair',
            'scheduledDate': '2026-06-22T04:34:23.374Z'
      }
}
  },
  {
    id: 'PRJ-106',
    name: 'Mock Project 6',
    client: 'Mock Client 6',
    clientPhone: '+91 99999 99996',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'marking' as WorkflowType,
    priority: 'medium' as Priority,
    value: 160000,
    description: 'Generated project 6',
    createdAt: '2026-06-19T04:34:23.374Z',
    updatedAt: '2026-06-19T04:34:23.374Z',
    scheduledDate: '2026-06-19T04:34:23.374Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2026-06-19T04:34:23.374Z'
      },
      'survey': {
            'status': 'pending'
      },
      'mapping': {
            'status': 'pending'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-107',
    name: 'Mock Project 7',
    client: 'Mock Client 7',
    clientPhone: '+91 99999 99997',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'drawing' as WorkflowType,
    priority: 'medium' as Priority,
    value: 170000,
    description: 'Generated project 7',
    createdAt: '2026-06-16T04:34:23.374Z',
    updatedAt: '2026-06-16T04:34:23.374Z',
    scheduledDate: '2026-06-16T04:34:23.374Z',
    currentStage: 'drawing' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-06-16T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'in_progress',
            'assignedTo': 'Arjun Singh',
            'scheduledDate': '2026-06-16T04:34:23.374Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-108',
    name: 'Mock Project 8',
    client: 'Mock Client 8',
    clientPhone: '+91 99999 99998',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'visualization' as WorkflowType,
    priority: 'medium' as Priority,
    value: 180000,
    description: 'Generated project 8',
    createdAt: '2026-06-12T04:34:23.374Z',
    updatedAt: '2026-06-12T04:34:23.374Z',
    scheduledDate: '2026-06-12T04:34:23.374Z',
    currentStage: 'accounts' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-06-12T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'completed',
            'completedAt': '2026-06-12T04:34:23.374Z',
            'assignedTo': 'Arjun Singh'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'in_progress',
            'assignedTo': 'Kavitha Nair',
            'scheduledDate': '2026-06-12T04:34:23.374Z'
      }
}
  },
  {
    id: 'PRJ-109',
    name: 'Mock Project 9',
    client: 'Mock Client 9',
    clientPhone: '+91 99999 99999',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'qs_boq' as WorkflowType,
    priority: 'medium' as Priority,
    value: 190000,
    description: 'Generated project 9',
    createdAt: '2026-05-26T04:34:23.374Z',
    updatedAt: '2026-05-26T04:34:23.374Z',
    scheduledDate: '2026-05-26T04:34:23.374Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2026-05-26T04:34:23.374Z'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'pending'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-1010',
    name: 'Mock Project 10',
    client: 'Mock Client 10',
    clientPhone: '+91 99999 99990',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'survey' as WorkflowType,
    priority: 'medium' as Priority,
    value: 200000,
    description: 'Generated project 10',
    createdAt: '2026-05-21T04:34:23.374Z',
    updatedAt: '2026-05-21T04:34:23.374Z',
    scheduledDate: '2026-05-21T04:34:23.374Z',
    currentStage: 'survey' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-05-21T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'in_progress',
            'assignedTo': 'Ravi Kumar',
            'scheduledDate': '2026-05-21T04:34:23.374Z'
      },
      'mapping': {
            'status': 'pending'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-1011',
    name: 'Mock Project 11',
    client: 'Mock Client 11',
    clientPhone: '+91 99999 99991',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'marking' as WorkflowType,
    priority: 'medium' as Priority,
    value: 210000,
    description: 'Generated project 11',
    createdAt: '2026-05-06T04:34:23.374Z',
    updatedAt: '2026-05-06T04:34:23.374Z',
    scheduledDate: '2026-05-06T04:34:23.374Z',
    currentStage: 'accounts' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-05-06T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'completed',
            'completedAt': '2026-05-06T04:34:23.374Z',
            'assignedTo': 'Ravi Kumar'
      },
      'mapping': {
            'status': 'completed',
            'completedAt': '2026-05-06T04:34:23.374Z',
            'assignedTo': 'Sneha Patel'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'completed',
            'completedAt': '2026-05-06T04:34:23.374Z',
            'assignedTo': 'Kavitha Nair'
      }
}
  },
  {
    id: 'PRJ-1012',
    name: 'Mock Project 12',
    client: 'Mock Client 12',
    clientPhone: '+91 99999 99992',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'drawing' as WorkflowType,
    priority: 'medium' as Priority,
    value: 220000,
    description: 'Generated project 12',
    createdAt: '2026-04-26T04:34:23.374Z',
    updatedAt: '2026-04-26T04:34:23.374Z',
    scheduledDate: '2026-04-26T04:34:23.374Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2026-04-26T04:34:23.374Z'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'pending'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-1013',
    name: 'Mock Project 13',
    client: 'Mock Client 13',
    clientPhone: '+91 99999 99993',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'visualization' as WorkflowType,
    priority: 'medium' as Priority,
    value: 230000,
    description: 'Generated project 13',
    createdAt: '2026-04-16T04:34:23.374Z',
    updatedAt: '2026-04-16T04:34:23.374Z',
    scheduledDate: '2026-04-16T04:34:23.374Z',
    currentStage: 'visualization' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-04-16T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'in_progress',
            'assignedTo': 'Arjun Singh',
            'scheduledDate': '2026-04-16T04:34:23.374Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
  {
    id: 'PRJ-1014',
    name: 'Mock Project 14',
    client: 'Mock Client 14',
    clientPhone: '+91 99999 99994',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'qs_boq' as WorkflowType,
    priority: 'medium' as Priority,
    value: 240000,
    description: 'Generated project 14',
    createdAt: '2026-02-10T04:34:23.374Z',
    updatedAt: '2026-02-10T04:34:23.374Z',
    scheduledDate: '2026-02-10T04:34:23.374Z',
    currentStage: 'accounts' as PipelineStage,
    stages: {
      'sales': {
            'status': 'completed',
            'completedAt': '2026-02-10T04:34:23.374Z',
            'assignedTo': 'Priya Sharma'
      },
      'survey': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'mapping': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'completed',
            'completedAt': '2026-02-10T04:34:23.374Z',
            'assignedTo': 'Neha Gupta'
      },
      'accounts': {
            'status': 'completed',
            'completedAt': '2026-02-10T04:34:23.374Z',
            'assignedTo': 'Kavitha Nair'
      }
}
  },
  {
    id: 'PRJ-1015',
    name: 'Mock Project 15',
    client: 'Mock Client 15',
    clientPhone: '+91 99999 99995',
    location: 'Bangalore',
    type: 'Survey',
    workflowType: 'survey' as WorkflowType,
    priority: 'medium' as Priority,
    value: 250000,
    description: 'Generated project 15',
    createdAt: '2025-12-22T04:34:23.374Z',
    updatedAt: '2025-12-22T04:34:23.374Z',
    scheduledDate: '2025-12-22T04:34:23.374Z',
    currentStage: 'sales' as PipelineStage,
    stages: {
      'sales': {
            'status': 'in_progress',
            'assignedTo': 'Priya Sharma',
            'scheduledDate': '2025-12-22T04:34:23.374Z'
      },
      'survey': {
            'status': 'pending'
      },
      'mapping': {
            'status': 'pending'
      },
      'drawing': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'visualization': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'qs_boq': {
            'status': 'bypassed',
            'completedAt': '2026-01-01T00:00:00Z'
      },
      'accounts': {
            'status': 'pending'
      }
}
  },
];
