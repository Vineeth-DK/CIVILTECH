import { Role } from '@/types';

export interface Credential {
  password: string;
  role: Role;
  name: string;
  dept: string;
}

/**
 * Mock credential table. Username → credential.
 * In production this would be replaced by a real auth service.
 */
export const CREDENTIALS: Record<string, Credential> = {
  admin:    { password: 'Admin@123',    role: 'admin',    name: 'Arjun Mehta',    dept: 'Administration' },
  sales:    { password: 'Sales@123',    role: 'sales',    name: 'Priya Sharma',   dept: 'Sales & Business Dev.' },
  survey:   { password: 'Survey@123',   role: 'survey',   name: 'Ravi Kumar',     dept: 'Field Survey' },
  mapping:  { password: 'Map@123',      role: 'mapping',  name: 'Sneha Patel',    dept: 'GIS & Mapping' },
  drafting: { password: 'Draft@123',    role: 'drafting', name: 'Anil Desai',     dept: 'CAD & Drafting' },
  accounts: { password: 'Accts@123',    role: 'accounts', name: 'Kavitha Nair',   dept: 'Accounts & Billing' },
};
