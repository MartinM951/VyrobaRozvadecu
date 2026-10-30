import React, { useState } from 'react';
import { ArrowLeft, Users, Package, Settings, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, Check } from 'lucide-react';
import { getUsers, getCabinets, getOperations, createUser, deactivateUser, activateUser, createCabinet, deleteCabinet, createOperation, deactivateOperation, activateOperation } from '../utils/db';

interface AdminProps {
  onBack: () => void;
}

type Tab = 'users' | 'cabinets' | 'operations';

export default function Admin({ onBack }: AdminProps) {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [refresh, setRefresh] = useState(0);

  const doRefresh = () => setRefresh(r => r + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zpět</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Administrace</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Uživatelé
          </button>
          <button
            onClick={() => setActiveTab('cabinets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'cabinets' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Rozvaděče
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'operations' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Operace
          </button>
        </div>

        {/* Content */}
        {activeTab === 'users' && <UsersPanel key={`users-${refresh}`} onRefresh={doRefresh} />}
        {activeTab === 'cabinets' && <CabinetsPanel key={`cabinets-${refresh}`} onRefresh={doRefresh} />}
        {activeTab === 'operations' && <OperationsPanel key={`operations-${refresh}`} onRefresh={doRefresh} />}
      </div>
    </div>
  );
}

// === PANEL UŽIVATELÉ ===
function UsersPanel({ onRefresh }: { onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'worker' | 'admin'>('worker');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const users = getUsers();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !fullName || !pin) {
      setError('Vyplňte všechna pole');
      return;
    }
    if (pin.length < 4) {
      setError('PIN musí mít alespoň 4 číslice');
      return;
    }

    createUser({ username, fullName, pin, role });
    setUsername('');
    setFullName('');
    setPin('');
    setRole('worker');
    setShowForm(false);
    setSuccess('Uživatel byl vytvořen');
    onRefresh();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Správa uživatelů</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nový uživatel
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-4">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nový uživatel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uživatelské jméno</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="např. novak"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celé jméno</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="např. Jan Novák"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN kód</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setPin(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="4-6 číslic"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'worker' | 'admin')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="worker">Pracovník</option>
                <option value="admin">Administrátor</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Zrušit
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Vytvořit
            </button>
          </div>
        </form>
      )}

      {/* Seznam uživatelů */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Jméno</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Uživatelské jméno</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Stav</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Administrátor' : 'Pracovník'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.active ? 'Aktivní' : 'Deaktivován'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.active ? (
                    <button
                      onClick={() => { deactivateUser(user.id); onRefresh(); }}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm mx-auto"
                    >
                      <ToggleRight className="w-4 h-4" />
                      Deaktivovat
                    </button>
                  ) : (
                    <button
                      onClick={() => { activateUser(user.id); onRefresh(); }}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm mx-auto"
                    >
                      <ToggleLeft className="w-4 h-4" />
                      Aktivovat
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === PANEL ROZVADĚČE ===
function CabinetsPanel({ onRefresh }: { onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cabinets = getCabinets();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!serialNumber) {
      setError('Zadejte sériové číslo');
      return;
    }

    createCabinet(serialNumber);
    setSerialNumber('');
    setShowForm(false);
    setSuccess('Rozvaděč byl přidán');
    onRefresh();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Správa rozvaděčů</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nový rozvaděč
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-4">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nový rozvaděč</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sériové číslo</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="např. R-2026-004"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Zrušit
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Přidat
            </button>
          </div>
        </form>
      )}

      {/* Seznam rozvaděčů */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Sériové číslo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Datum založení</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Stav</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cabinets.map(cabinet => (
              <tr key={cabinet.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cabinet.serialNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(cabinet.createdAt).toLocaleDateString('cs-CZ')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    cabinet.status === 'completed' ? 'bg-green-100 text-green-700' :
                    cabinet.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {cabinet.status === 'completed' ? 'Dokončeno' : cabinet.status === 'in_progress' ? 'Rozpracováno' : 'Čeká'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { if (confirm('Opravdu smazat rozvaděč?')) { deleteCabinet(cabinet.id); onRefresh(); } }}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm mx-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === PANEL OPERACE ===
function OperationsPanel({ onRefresh }: { onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const operations = getOperations();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name) {
      setError('Zadejte název operace');
      return;
    }

    const orderNum = order ? parseInt(order) : operations.length + 1;
    createOperation(name, orderNum);
    setName('');
    setOrder('');
    setShowForm(false);
    setSuccess('Operace byla přidána');
    onRefresh();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Správa výrobních operací</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nová operace
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-4">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nová operace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Název operace</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="např. Montáž DIN lišty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pořadí</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Automaticky"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Zrušit
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Přidat
            </button>
          </div>
        </form>
      )}

      {/* Seznam operací */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Pořadí</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Název</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Stav</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {operations.map(op => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{op.order}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{op.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    op.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {op.active ? 'Aktivní' : 'Deaktivována'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {op.active ? (
                    <button
                      onClick={() => { deactivateOperation(op.id); onRefresh(); }}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm mx-auto"
                    >
                      <ToggleRight className="w-4 h-4" />
                      Deaktivovat
                    </button>
                  ) : (
                    <button
                      onClick={() => { activateOperation(op.id); onRefresh(); }}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm mx-auto"
                    >
                      <ToggleLeft className="w-4 h-4" />
                      Aktivovat
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
