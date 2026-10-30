// === DATOVÉ TYPY APLIKACE ===

export interface User {
  id: string;
  username: string;
  fullName: string;
  pin: string; // 4-6 číselný PIN
  role: 'worker' | 'admin';
  active: boolean;
  createdAt: string;
}

export interface Cabinet {
  id: string;
  serialNumber: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface Operation {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface WorkTask {
  id: string;
  cabinetId: string;
  workerId: string;
  operationIds: string[];
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
  photoBefore?: string; // base64 data URL
  photoAfter?: string;
}

export interface OperationRecord {
  id: string;
  taskId: string;
  cabinetId: string;
  workerId: string;
  operationId: string;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
  photoBefore?: string;
  photoAfter?: string;
}

// Typy pro formuláře
export interface LoginFormData {
  username: string;
  pin: string;
}

export interface NewCabinetFormData {
  serialNumber: string;
  notes?: string;
}

export interface NewUserFormData {
  username: string;
  fullName: string;
  pin: string;
  role: 'worker' | 'admin';
}

export interface NewOperationFormData {
  name: string;
  order: number;
}
