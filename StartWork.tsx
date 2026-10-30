import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCabinets, getActiveOperations, createTask } from '../utils/db';
import { ArrowLeft, Camera, Check, Package, AlertCircle } from 'lucide-react';

interface StartWorkProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function StartWork({ onComplete, onCancel }: StartWorkProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select_cabinet' | 'select_operations' | 'photo' | 'confirm'>('select_cabinet');
  const [selectedCabinetId, setSelectedCabinetId] = useState('');
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [photoBefore, setPhotoBefore] = useState<string | undefined>();
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cabinets = getCabinets();
  const operations = getActiveOperations();
  const selectedCabinet = cabinets.find(c => c.id === selectedCabinetId);

  const handleCabinetSelect = (id: string) => {
    setSelectedCabinetId(id);
    setError('');
  };

  const handleOperationToggle = (opId: string) => {
    setSelectedOperations(prev =>
      prev.includes(opId) ? prev.filter(id => id !== opId) : [...prev, opId]
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoBefore(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!user || !selectedCabinetId || selectedOperations.length === 0) {
      setError('Vyplňte všechna povinná pole');
      return;
    }

    createTask(selectedCabinetId, user.id, selectedOperations, photoBefore);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={step === 'select_cabinet' ? onCancel : () => {
              if (step === 'select_operations') setStep('select_cabinet');
              else if (step === 'photo') setStep('select_operations');
              else if (step === 'confirm') setStep('photo');
            }}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zpět</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Zahájení práce</h1>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-6">
          {['Rozvaděč', 'Operace', 'Fotografie', 'Potvrzení'].map((label, index) => {
            const steps = ['select_cabinet', 'select_operations', 'photo', 'confirm'];
            const currentStepIndex = steps.indexOf(step);
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCurrent ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isActive && !isCurrent ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${isCurrent ? 'text-blue-600' : ''}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && <div className={`flex-1 h-0.5 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Krok 1: Výběr rozvaděče */}
        {step === 'select_cabinet' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vyberte rozvaděč</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cabinets.map(cabinet => (
                <button
                  key={cabinet.id}
                  onClick={() => handleCabinetSelect(cabinet.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCabinetId === cabinet.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className={`w-8 h-8 ${selectedCabinetId === cabinet.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-bold text-gray-900">{cabinet.serialNumber}</p>
                      <p className="text-sm text-gray-500">
                        {cabinet.status === 'pending' ? 'Čeká' : cabinet.status === 'in_progress' ? 'Rozpracováno' : 'Dokončeno'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedCabinetId && (
              <button
                onClick={() => setStep('select_operations')}
                className="mt-6 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Pokračovat →
              </button>
            )}
          </div>
        )}

        {/* Krok 2: Výběr operací */}
        {step === 'select_operations' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vyberte operace</h2>
            <p className="text-gray-600 mb-4">
              Rozvaděč: <strong>{selectedCabinet?.serialNumber}</strong> • Vyberte jednu nebo více operací
            </p>

            <div className="space-y-3">
              {operations.map(op => (
                <button
                  key={op.id}
                  onClick={() => handleOperationToggle(op.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    selectedOperations.includes(op.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    selectedOperations.includes(op.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}>
                    {selectedOperations.includes(op.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-medium text-gray-900">{op.name}</span>
                </button>
              ))}
            </div>

            {selectedOperations.length > 0 && (
              <button
                onClick={() => setStep('photo')}
                className="mt-6 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Pokračovat →
              </button>
            )}
          </div>
        )}

        {/* Krok 3: Fotografie */}
        {step === 'photo' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Fotografie před zahájením</h2>
            <p className="text-gray-600 mb-4">
              Pořiďte fotografii rozvaděče <strong>{selectedCabinet?.serialNumber}</strong> před zahájením práce
            </p>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
              {photoBefore ? (
                <div>
                  <img src={photoBefore} alt="Fotografie rozvaděče" className="max-h-64 mx-auto rounded-lg mb-4" />
                  <p className="text-green-600 font-medium mb-3">✓ Fotografie pořízena</p>
                  <button
                    onClick={() => setPhotoBefore(undefined)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Pořídit znovu
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Klikněte na tlačítko pro pořízení fotografie</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Camera className="w-5 h-5 inline mr-2" />
                    Pořídit fotografii
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="mt-6 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Pokračovat →
            </button>
          </div>
        )}

        {/* Krok 4: Potvrzení */}
        {step === 'confirm' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Potvrzení zahájení práce</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Pracovník</p>
                  <p className="font-semibold text-gray-900">{user?.fullName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Rozvaděč</p>
                  <p className="font-semibold text-gray-900">{selectedCabinet?.serialNumber}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Operace</p>
                <div className="flex flex-wrap gap-2">
                  {operations.filter(o => selectedOperations.includes(o.id)).map(op => (
                    <span key={op.id} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                      {op.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Fotografie</p>
                {photoBefore ? (
                  <img src={photoBefore} alt="Foto" className="mt-2 max-h-32 rounded-lg" />
                ) : (
                  <p className="text-gray-500 text-sm mt-1">Bez fotografie</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 uppercase font-medium">Datum a čas</p>
                <p className="font-semibold text-blue-900">
                  {new Date().toLocaleString('cs-CZ')}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep('photo')}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                ← Zpět
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
              >
                ✓ Zahájit práci
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
