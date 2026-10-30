import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, getCabinets, getOperations, completeTask, getUserById } from '../utils/db';
import { ArrowLeft, Camera, Lock, Check, AlertCircle, Package } from 'lucide-react';

interface EndWorkProps {
  taskId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EndWork({ taskId, onComplete, onCancel }: EndWorkProps) {
  const { user, verifyPin } = useAuth();
  const [step, setStep] = useState<'verify' | 'photo' | 'confirm'>('verify');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [photoAfter, setPhotoAfter] = useState<string | undefined>();
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const task = getTasks().find(t => t.id === taskId);
  const cabinet = task ? getCabinets().find(c => c.id === task.cabinetId) : null;
  const operations = task ? getOperations().filter(o => task.operationIds.includes(o.id)) : [];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pin)) {
      setPinError('');
      setStep('photo');
    } else {
      setPinError('Nesprávný PIN kód');
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoAfter(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!task) {
      setError('Úkol nebyl nalezen');
      return;
    }
    completeTask(task.id, photoAfter);
    onComplete();
  };

  if (!task || !cabinet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Úkol nebyl nalezen</p>
          <button onClick={onCancel} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl">
            Zpět na přehled
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={step === 'verify' ? onCancel : () => {
              if (step === 'photo') setStep('verify');
              else if (step === 'confirm') setStep('photo');
            }}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zpět</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Dokončení práce</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Informace o úkolu */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Rozvaděč</p>
              <p className="font-bold text-gray-900 text-lg">{cabinet.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Pracovník</p>
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Operace</p>
              <p className="font-medium text-gray-700">{operations.map(o => o.name).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Krok 1: Ověření PIN */}
        {step === 'verify' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ověření identity</h2>
              <p className="text-gray-600 mt-1">Zadejte svůj PIN kód pro potvrzení dokončení práce</p>
            </div>

            <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto">
              <div className="mb-4">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                      setPin(e.target.value);
                      setPinError('');
                    }
                  }}
                  className="w-full text-center text-3xl tracking-widest py-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  placeholder="••••"
                  autoFocus
                  inputMode="numeric"
                />
              </div>

              {pinError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pin.length === 0}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold text-lg rounded-xl transition-colors"
              >
                Ověřit
              </button>
            </form>
          </div>
        )}

        {/* Krok 2: Fotografie po dokončení */}
        {step === 'photo' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Fotografie po dokončení</h2>
            <p className="text-gray-600 mb-6 text-center">Pořiďte fotografii dokončené práce</p>

            <div className="max-w-md mx-auto">
              {photoAfter ? (
                <div className="text-center">
                  <img src={photoAfter} alt="Dokončená práce" className="max-h-64 mx-auto rounded-lg mb-4" />
                  <p className="text-green-600 font-medium mb-3">✓ Fotografie pořízena</p>
                  <button
                    onClick={() => setPhotoAfter(undefined)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Pořídit znovu
                  </button>
                </div>
              ) : (
                <div className="text-center">
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

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('confirm')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Pokračovat →
              </button>
            </div>
          </div>
        )}

        {/* Krok 3: Potvrzení */}
        {step === 'confirm' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Potvrzení dokončení</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Rozvaděč</p>
                  <p className="font-semibold text-gray-900">{cabinet.serialNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Pracovník</p>
                  <p className="font-semibold text-gray-900">{user?.fullName}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Dokončené operace</p>
                <div className="flex flex-wrap gap-2">
                  {operations.map(op => (
                    <span key={op.id} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {op.name}
                    </span>
                  ))}
                </div>
              </div>

              {photoAfter && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Fotografie po dokončení</p>
                  <img src={photoAfter} alt="Foto" className="mt-2 max-h-32 rounded-lg" />
                </div>
              )}

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 uppercase font-medium">Datum a čas dokončení</p>
                <p className="font-semibold text-green-900">
                  {new Date().toLocaleString('cs-CZ')}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
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
                ✓ Dokončit práci
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
