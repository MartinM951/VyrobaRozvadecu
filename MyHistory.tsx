import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Camera, Package } from 'lucide-react';
import { getRecordsByWorker, getCabinets, getOperations } from '../utils/db';

interface MyHistoryProps {
  onBack: () => void;
}

export default function MyHistory({ onBack }: MyHistoryProps) {
  const { user } = useAuth();
  const records = getRecordsByWorker(user?.id || '');
  const cabinets = getCabinets();
  const operations = getOperations();

  const sortedRecords = [...records].sort((a, b) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const getCabinetSerial = (cabinetId: string) => {
    return cabinets.find(c => c.id === cabinetId)?.serialNumber || 'Neznámé';
  };

  const getOperationName = (operationId: string) => {
    return operations.find(o => o.id === operationId)?.name || 'Neznámá operace';
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

  const completedCount = records.filter(r => r.status === 'completed').length;
  const inProgressCount = records.filter(r => r.status === 'in_progress').length;

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
          <h1 className="text-lg font-bold text-gray-900">Moje historie</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Statistiky */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">Celkem operací</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{records.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase font-medium">Dokončeno</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-600 uppercase font-medium">Rozpracováno</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">{inProgressCount}</p>
          </div>
        </div>

        {/* Seznam záznamů */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Přehled operací</h2>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Zatím žádné záznamy</p>
              <p className="text-gray-400 text-sm mt-1">Vaše historie operací se zobrazí zde</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedRecords.map(record => (
                <div key={record.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {record.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{getOperationName(record.operationId)}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {getCabinetSerial(record.cabinetId)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status === 'completed' ? 'Dokončeno' : 'Rozpracováno'}
                    </span>
                  </div>

                  <div className="ml-7 text-sm text-gray-600 space-y-1">
                    <p>Zahájeno: {formatDateTime(record.startedAt)}</p>
                    {record.completedAt && <p>Dokončeno: {formatDateTime(record.completedAt)}</p>}
                  </div>

                  {/* Fotografie */}
                  {(record.photoBefore || record.photoAfter) && (
                    <div className="ml-7 mt-2 flex gap-2">
                      {record.photoBefore && (
                        <div className="relative">
                          <img src={record.photoBefore} alt="Před" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/50 text-white rounded-b-lg py-0.5">Před</span>
                        </div>
                      )}
                      {record.photoAfter && (
                        <div className="relative">
                          <img src={record.photoAfter} alt="Po" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/50 text-white rounded-b-lg py-0.5">Po</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
