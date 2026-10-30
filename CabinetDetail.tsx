import React from 'react';
import { ArrowLeft, Package, User, Clock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCabinetById, getTasks, getOperations, getUsers, getRecordsByCabinet } from '../utils/db';

interface CabinetDetailProps {
  cabinetId: string;
  onBack: () => void;
}

export default function CabinetDetail({ cabinetId, onBack }: CabinetDetailProps) {
  const cabinet = getCabinetById(cabinetId);
  const tasks = getTasks().filter(t => t.cabinetId === cabinetId);
  const records = getRecordsByCabinet(cabinetId);
  const operations = getOperations();
  const users = getUsers();

  if (!cabinet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Rozvaděč nebyl nalezen</p>
          <button onClick={onBack} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl">
            Zpět na přehled
          </button>
        </div>
      </div>
    );
  }

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

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkerName = (workerId: string) => {
    return users.find(u => u.id === workerId)?.fullName || 'Neznámý';
  };

  const getOperationName = (operationId: string) => {
    return operations.find(o => o.id === operationId)?.name || 'Neznámá operace';
  };

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
          <div>
            <h1 className="text-lg font-bold text-gray-900">Detail rozvaděče</h1>
            <p className="text-sm text-gray-500">{cabinet.serialNumber}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Základní info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Sériové číslo</p>
              <p className="font-bold text-gray-900 text-xl">{cabinet.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Datum založení</p>
              <p className="font-semibold text-gray-900">
                {new Date(cabinet.createdAt).toLocaleDateString('cs-CZ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Stav</p>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-lg border mt-1 ${getStatusColor(cabinet.status)}`}>
                {getStatusLabel(cabinet.status)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Celkem úkolů</p>
              <p className="font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        {/* Fotografie */}
        {tasks.some(t => t.photoBefore || t.photoAfter) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Fotografická dokumentace
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {task.photoBefore && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img src={task.photoBefore} alt={`Před - úkol ${index + 1}`} className="w-full h-40 object-cover" />
                      <div className="p-2 bg-gray-50 text-xs text-gray-600">
                        <p className="font-medium">Před zahájením</p>
                        <p>{getWorkerName(task.workerId)} • {formatDateTime(task.startedAt)}</p>
                      </div>
                    </div>
                  )}
                  {task.photoAfter && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img src={task.photoAfter} alt={`Po - úkol ${index + 1}`} className="w-full h-40 object-cover" />
                      <div className="p-2 bg-gray-50 text-xs text-gray-600">
                        <p className="font-medium">Po dokončení</p>
                        <p>{getWorkerName(task.workerId)} • {task.completedAt ? formatDateTime(task.completedAt) : ''}</p>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Historie operací */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Historie operací
          </h2>

          {records.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Zatím žádné záznamy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                .map(record => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-xl border ${
                      record.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {record.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="font-semibold text-gray-900">{getOperationName(record.operationId)}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        record.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {record.status === 'completed' ? 'Dokončeno' : 'Rozpracováno'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{getWorkerName(record.workerId)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Zahájeno: {formatDateTime(record.startedAt)}</span>
                      </div>
                      {record.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-gray-400" />
                          <span>Dokončeno: {formatDateTime(record.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Pracovní úkoly */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Pracovní úkoly
          </h2>

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Zatím žádné úkoly</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => {
                const taskOps = operations.filter(o => task.operationIds.includes(o.id));
                return (
                  <div key={task.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{getWorkerName(task.workerId)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Operace: {taskOps.map(o => o.name).join(', ')}</p>
                      <p>Zahájeno: {formatDateTime(task.startedAt)}</p>
                      {task.completedAt && <p>Dokončeno: {formatDateTime(task.completedAt)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
