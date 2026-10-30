// === DATABÁZOVÁ VRSTVA (localStorage) ===
// Připraveno pro budoucí migraci na Supabase

import { User, Cabinet, Operation, WorkTask, OperationRecord } from '../types';

const KEYS = {
  USERS: 'rozvadec_users',
  CABINETS: 'rozvadec_cabinets',
  OPERATIONS: 'rozvadec_operations',
  TASKS: 'rozvadec_tasks',
  RECORDS: 'rozvadec_records',
  INITIALIZED: 'rozvadec_initialized',
};

// Pomocné funkce
function getItem<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// === INICIALIZACE ===
export function initializeDatabase(): void {
  const initialized = localStorage.getItem(KEYS.INITIALIZED);
  if (initialized) return;

  // Výchozí administrátor
  const defaultAdmin: User = {
    id: generateId(),
    username: 'admin',
    fullName: 'Administrátor',
    pin: '1234',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
  };

  // Výchozí pracovníci
  const defaultWorkers: User[] = [
    {
      id: generateId(),
      username: 'novak',
      fullName: 'Jan Novák',
      pin: '1111',
      role: 'worker',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      username: 'svoboda',
      fullName: 'Petr Svoboda',
      pin: '2222',
      role: 'worker',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      username: 'dvorak',
      fullName: 'Martin Dvořák',
      pin: '3333',
      role: 'worker',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // Výchozí rozvaděče
  const defaultCabinets: Cabinet[] = [
    {
      id: generateId(),
      serialNumber: 'R-2026-001',
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: generateId(),
      serialNumber: 'R-2026-002',
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: generateId(),
      serialNumber: 'R-2026-003',
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
  ];

  // Výchozí operace
  const defaultOperations: Operation[] = [
    { id: generateId(), name: 'Montáž DIN lišty', order: 1, active: true },
    { id: generateId(), name: 'Montáž kabelových kanálů', order: 2, active: true },
    { id: generateId(), name: 'Osazení přístrojů', order: 3, active: true },
    { id: generateId(), name: 'Popis přístrojů', order: 4, active: true },
    { id: generateId(), name: 'Zapojování', order: 5, active: true },
    { id: generateId(), name: 'Funkční zkouška', order: 6, active: true },
    { id: generateId(), name: 'Příprava pro export', order: 7, active: true },
  ];

  setItem(KEYS.USERS, [defaultAdmin, ...defaultWorkers]);
  setItem(KEYS.CABINETS, defaultCabinets);
  setItem(KEYS.OPERATIONS, defaultOperations);
  setItem(KEYS.TASKS, []);
  setItem(KEYS.RECORDS, []);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
}

// === UŽIVATELÉ ===
export function getUsers(): User[] {
  return getItem<User>(KEYS.USERS);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function authenticateUser(username: string, pin: string): User | null {
  const user = getUserByUsername(username);
  if (!user || !user.active) return null;
  if (user.pin !== pin) return null;
  return user;
}

export function createUser(data: { username: string; fullName: string; pin: string; role: 'worker' | 'admin' }): User {
  const users = getUsers();
  const newUser: User = {
    id: generateId(),
    ...data,
    active: true,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setItem(KEYS.USERS, users);
  return newUser;
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  setItem(KEYS.USERS, users);
  return users[index];
}

export function deactivateUser(id: string): boolean {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index].active = false;
  setItem(KEYS.USERS, users);
  return true;
}

export function activateUser(id: string): boolean {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index].active = true;
  setItem(KEYS.USERS, users);
  return true;
}

// === ROZVADĚČE ===
export function getCabinets(): Cabinet[] {
  return getItem<Cabinet>(KEYS.CABINETS);
}

export function getCabinetById(id: string): Cabinet | undefined {
  return getCabinets().find(c => c.id === id);
}

export function getCabinetBySerial(serial: string): Cabinet | undefined {
  return getCabinets().find(c => c.serialNumber.toLowerCase() === serial.toLowerCase());
}

export function createCabinet(serialNumber: string, notes?: string): Cabinet {
  const cabinets = getCabinets();
  const newCabinet: Cabinet = {
    id: generateId(),
    serialNumber,
    createdAt: new Date().toISOString(),
    status: 'pending',
    notes,
  };
  cabinets.push(newCabinet);
  setItem(KEYS.CABINETS, cabinets);
  return newCabinet;
}

export function updateCabinetStatus(id: string, status: Cabinet['status']): boolean {
  const cabinets = getCabinets();
  const index = cabinets.findIndex(c => c.id === id);
  if (index === -1) return false;
  cabinets[index].status = status;
  setItem(KEYS.CABINETS, cabinets);
  return true;
}

export function deleteCabinet(id: string): boolean {
  const cabinets = getCabinets();
  const filtered = cabinets.filter(c => c.id !== id);
  if (filtered.length === cabinets.length) return false;
  setItem(KEYS.CABINETS, filtered);
  return true;
}

// === OPERACE ===
export function getOperations(): Operation[] {
  return getItem<Operation>(KEYS.OPERATIONS).sort((a, b) => a.order - b.order);
}

export function getActiveOperations(): Operation[] {
  return getOperations().filter(o => o.active);
}

export function createOperation(name: string, order: number): Operation {
  const operations = getOperations();
  const newOp: Operation = {
    id: generateId(),
    name,
    order,
    active: true,
  };
  operations.push(newOp);
  setItem(KEYS.OPERATIONS, operations);
  return newOp;
}

export function updateOperation(id: string, data: Partial<Operation>): boolean {
  const operations = getOperations();
  const index = operations.findIndex(o => o.id === id);
  if (index === -1) return false;
  operations[index] = { ...operations[index], ...data };
  setItem(KEYS.OPERATIONS, operations);
  return true;
}

export function deactivateOperation(id: string): boolean {
  return updateOperation(id, { active: false });
}

export function activateOperation(id: string): boolean {
  return updateOperation(id, { active: true });
}

// === PRACOVNÍ ÚKOLY ===
export function getTasks(): WorkTask[] {
  return getItem<WorkTask>(KEYS.TASKS);
}

export function getActiveTasks(): WorkTask[] {
  return getTasks().filter(t => t.status === 'in_progress');
}

export function getTasksByWorker(workerId: string): WorkTask[] {
  return getTasks().filter(t => t.workerId === workerId);
}

export function getActiveTasksByWorker(workerId: string): WorkTask[] {
  return getTasks().filter(t => t.workerId === workerId && t.status === 'in_progress');
}

export function getTasksByCabinet(cabinetId: string): WorkTask[] {
  return getTasks().filter(t => t.cabinetId === cabinetId);
}

export function createTask(
  cabinetId: string,
  workerId: string,
  operationIds: string[],
  photoBefore?: string
): WorkTask {
  const tasks = getTasks();
  const newTask: WorkTask = {
    id: generateId(),
    cabinetId,
    workerId,
    operationIds,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    photoBefore,
  };
  tasks.push(newTask);
  setItem(KEYS.TASKS, tasks);

  // Aktualizovat stav rozvaděče
  updateCabinetStatus(cabinetId, 'in_progress');

  // Vytvořit záznamy pro každou operaci
  const records = getRecords();
  operationIds.forEach(opId => {
    records.push({
      id: generateId(),
      taskId: newTask.id,
      cabinetId,
      workerId,
      operationId: opId,
      startedAt: newTask.startedAt,
      status: 'in_progress',
      photoBefore,
    });
  });
  setItem(KEYS.RECORDS, records);

  return newTask;
}

export function completeTask(taskId: string, photoAfter?: string): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return false;

  tasks[index].status = 'completed';
  tasks[index].completedAt = new Date().toISOString();
  tasks[index].photoAfter = photoAfter;
  setItem(KEYS.TASKS, tasks);

  // Aktualizovat záznamy operací
  const records = getRecords();
  records.forEach(r => {
    if (r.taskId === taskId && r.status === 'in_progress') {
      r.status = 'completed';
      r.completedAt = new Date().toISOString();
      r.photoAfter = photoAfter;
    }
  });
  setItem(KEYS.RECORDS, records);

  // Zkontrolovat, zda jsou všechny úkoly pro rozvaděč dokončeny
  const cabinetTasks = tasks.filter(t => t.cabinetId === tasks[index].cabinetId);
  const allCompleted = cabinetTasks.every(t => t.status === 'completed');
  if (allCompleted) {
    updateCabinetStatus(tasks[index].cabinetId, 'completed');
  }

  return true;
}

// === ZÁZNAMY OPERACÍ ===
export function getRecords(): OperationRecord[] {
  return getItem<OperationRecord>(KEYS.RECORDS);
}

export function getRecordsByCabinet(cabinetId: string): OperationRecord[] {
  return getRecords().filter(r => r.cabinetId === cabinetId);
}

export function getRecordsByWorker(workerId: string): OperationRecord[] {
  return getRecords().filter(r => r.workerId === workerId);
}

// === STATISTIKY ===
export function getDashboardData() {
  const activeTasks = getActiveTasks();
  const users = getUsers();
  const operations = getOperations();
  const cabinets = getCabinets();

  return activeTasks.map(task => {
    const worker = users.find(u => u.id === task.workerId);
    const cabinet = cabinets.find(c => c.id === task.cabinetId);
    const taskOperations = operations.filter(o => task.operationIds.includes(o.id));

    return {
      ...task,
      workerName: worker?.fullName || 'Neznámý',
      serialNumber: cabinet?.serialNumber || 'Neznámé',
      operationNames: taskOperations.map(o => o.name),
      duration: Date.now() - new Date(task.startedAt).getTime(),
    };
  });
}
