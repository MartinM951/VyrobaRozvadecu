import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardData, getActiveTasksByWorker, getCabinets, getUsers, getOperations, getRecordsByWorker } from '../utils/db';
import { LogOut, Play, Square, Clock, User, Package, Settings, ChevronRight, History, Timer } from 'lucide-react';
import StartWork from './StartWork';
import EndWork from './EndWork';
import CabinetDetail from './CabinetDetail';
import Admin from './Admin';
import MyHistory from './MyHistory';

type Screen = 'dashboard' | 'start' | 'end' | 'detail' | 'admin' | 'history';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Aktualizace dat
  const refreshData = () => {
    setDashboardData(getDashboardData());
    if (user) {
      setMyTasks(getActiveTasksByWorker(user.id));
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      refreshData();
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'ROZPRACOVÁNO';
      case 'completed': return 'DOKONČENO';
      default: return 'ČEKÁ';
    }
  };

  // Renderování jednotlivých obrazovek
  if (screen === 'start') {
    return <StartWork onComplete={() => { refreshData(); setScreen('dashboard'); }} onCancel={() => setScreen('dashboard')} />;
  }

  if (screen === 'end') {
    return <EndWork taskId={selectedTaskId} onComplete={() => { refreshData(); setScreen('dashboard'); }} onCancel={() => setScreen('dashboard')} />;
  }

  if (screen === 'detail') {
    return <CabinetDetail cabinetId={selectedCabinetId} onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'admin' && user?.role === 'admin') {
    return <Admin onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'history') {
    return <MyHistory onBack={() => setScreen('dashboard')} />;
  }

  // Hlavní dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Výroba rozvaděčů</h1>
              <p className="text-xs text-gray-500">Řízení výroby</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrátor' : 'Pracovník'}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Odhlásit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Akční tlačítka */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setScreen('start')}
            className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <Play className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Zahájit práci</p>
              <p className="text-green-100 text-sm">Vybrat rozvaděč</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (myTasks.length > 0) {
                setSelectedTaskId(myTasks[0].id);
                setScreen('end');
              }
            }}
            disabled={myTasks.length === 0}
            className="flex items-center gap-3 p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white disabled:text-gray-500 rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:hover:scale-100"
          >
            <Square className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Dokončit práci</p>
              <p className="text-orange-100 text-sm">{myTasks.length} aktivních</p>
            </div>
          </button>

          <button
            onClick={() => setScreen('history')}
            className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <History className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Moje historie</p>
              <p className="text-blue-100 text-sm">Přehled operací</p>
            </div>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setScreen('admin')}
              className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Settings className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Administrace</p>
                <p className="text-purple-100 text-sm">Správa systému</p>
              </div>
            </button>
          )}
        </div>

        {/* Moje aktivní úkoly */}
        {myTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Moje aktivní úkoly
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTasks.map(task => {
                const cabinets = getCabinets();
                const operations = getOperations();
                const cabinet = cabinets.find(c => c.id === task.cabinetId);
                const taskOps = operations.filter(o => task.operationIds.includes(o.id));
                const duration = currentTime - new Date(task.startedAt).getTime();

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border-2 border-orange-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{cabinet?.serialNumber}</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg">
                        {formatDuration(duration)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Operace: {taskOps.map(o => o.name).join(', ')}</p>
                      <p>Zahájeno: {formatTime(task.startedAt)}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedTaskId(task.id); setScreen('end'); }}
                      className="mt-3 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Dokončit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hlavní výrobní přehled */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            Výrobní přehled – Rozpracovaná výroba
          </h2>

          {dashboardData.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Žádná rozpracovaná výroba</p>
              <p className="text-gray-400 text-sm mt-1">Zahajte práci kliknutím na tlačítko výše</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => { setSelectedCabinetId(task.cabinetId); setScreen('detail'); }}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {task.serialNumber}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{task.workerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{task.operationNames.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Zahájeno: {formatTime(task.startedAt)} • {formatDuration(task.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seznam rozvaděčů */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Všechny rozvaděče</h2>
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
                {getCabinets().map(cabinet => (
                  <tr key={cabinet.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cabinet.serialNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(cabinet.createdAt).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(cabinet.status)}`}>
                        {getStatusLabel(cabinet.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSelectedCabinetId(cabinet.id); setScreen('detail'); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Detail →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
