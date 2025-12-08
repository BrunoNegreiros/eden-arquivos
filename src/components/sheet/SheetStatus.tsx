import { useState } from 'react';
import { Heart, Brain, Zap, RefreshCw, Skull } from 'lucide-react';
import type { CharacterSheet, DamageType } from '../../types/characterSchema';

interface SheetStatusProps {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

// IDs corrigidos para bater com DAMAGE_TYPES_INFO (corte, perfuracao, etc.)
const RESISTANCES: DamageType[] = [
    'balistico', 'corte', 'impacto', 'perfuracao', // Físicos
    'fogo', 'frio', 'eletricidade', 'quimico',     // Elementais/Ambiente
    'morte', 'sangue', 'medo', 'conhecimento', 'energia', // Paranormais
    'mental'
];

export default function SheetStatus({ character, onUpdate }: SheetStatusProps) {
  const { status } = character;
  const [transAction, setTransAction] = useState<'damage' | 'heal'>('damage');
  const [transValue, setTransValue] = useState<string>('');
  const [transType, setTransType] = useState<'pv' | 'pv_temp' | 'pe' | 'pe_temp' | 'san' | 'san_temp'>('pv');
  const [applyHalf, setApplyHalf] = useState(false);
  const [applyDouble, setApplyDouble] = useState(false);
  const [selectedResist, setSelectedResist] = useState<string>('');
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const maximizeStat = (stat: 'pv' | 'pe' | 'san') => {
    const max = status[stat].max;
    onUpdate({ status: { ...status, [stat]: { ...status[stat], current: max } } });
  };

  const zeroStat = (stat: 'pv' | 'pe' | 'san') => {
    onUpdate({ status: { ...status, [stat]: { ...status[stat], current: 0 } } });
  };

  // Handler para troca de ação (Reseta o tipo se for inválido para a nova ação)
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAction = e.target.value as 'damage' | 'heal';
    setTransAction(newAction);
    
    // Se mudou para Dano e estava selecionado um Temporário, volta para o base
    if (newAction === 'damage' && transType.includes('_temp')) {
        setTransType(transType.split('_')[0] as any);
    }
  };

  const executeTransaction = () => {
    const val = parseInt(transValue);
    if (isNaN(val) || val <= 0) return;

    let finalValue = val;
    if (applyDouble) finalValue *= 2;
    if (applyHalf) finalValue = Math.floor(finalValue / 2);

    if (selectedResist && transAction === 'damage') {
        const resistValue = character.status.resistances[selectedResist as DamageType] || 0;
        finalValue = Math.max(0, finalValue - resistValue);
    }

    if (finalValue === 0) {
        alert("Dano reduzido a 0!");
        setTransValue('');
        return;
    }

    const newStatus = { ...status };

    if (transAction === 'damage') {
        // Lógica de Dano (Automática: Temp -> Current)
        if (transType.includes('pv')) {
            let remaining = finalValue;
            if (newStatus.pv.temp > 0) {
                const absorved = Math.min(newStatus.pv.temp, remaining);
                newStatus.pv.temp -= absorved;
                remaining -= absorved;
            }
            if (remaining > 0) newStatus.pv.current = Math.max(0, newStatus.pv.current - remaining);
        } else if (transType.includes('pe')) {
             let remaining = finalValue;
             if (newStatus.pe.temp > 0) {
                 const absorved = Math.min(newStatus.pe.temp, remaining);
                 newStatus.pe.temp -= absorved;
                 remaining -= absorved;
             }
             if (remaining > 0) newStatus.pe.current = Math.max(0, newStatus.pe.current - remaining);
        } else if (transType.includes('san')) {
             let remaining = finalValue;
             if (newStatus.san.temp > 0) {
                 const absorved = Math.min(newStatus.san.temp, remaining);
                 newStatus.san.temp -= absorved;
                 remaining -= absorved;
             }
             if (remaining > 0) newStatus.san.current = Math.max(0, newStatus.san.current - remaining);
        }
    } else {
        // Lógica de Ganho/Cura
        if (transType === 'pv') newStatus.pv.current = Math.min(newStatus.pv.max, newStatus.pv.current + finalValue);
        if (transType === 'pv_temp') newStatus.pv.temp += finalValue;
        
        if (transType === 'pe') newStatus.pe.current = Math.min(newStatus.pe.max, newStatus.pe.current + finalValue);
        if (transType === 'pe_temp') newStatus.pe.temp += finalValue;
        
        if (transType === 'san') newStatus.san.current = Math.min(newStatus.san.max, newStatus.san.current + finalValue);
        if (transType === 'san_temp') newStatus.san.temp += finalValue;
    }

    onUpdate({ status: newStatus });
    setTransValue('');
  };

  const handleManualSubmit = (stat: 'pv' | 'pe' | 'san') => {
    const val = parseInt(tempValue);
    if (!isNaN(val)) {
      onUpdate({
        status: {
          ...status,
          [stat]: { ...status[stat], current: val }
        }
      });
    }
    setEditMode(null);
    setTempValue('');
  };

  const StatRow = ({ label, type, icon: Icon, color, bg, current, max, temp }: any) => (
    <div className="mb-4 bg-eden-900/50 p-3 rounded-xl border border-eden-700/50 group relative">
      <div className="flex justify-between items-center mb-2">
        {/* Botões de Controle Rápido */}
      <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-eden-900 border border-eden-700 rounded-full px-2 py-0.5 shadow-lg z-10">
         <button onClick={() => maximizeStat(type)} className="text-green-400 hover:text-green-300 p-1" title="Recuperar Tudo"><RefreshCw size={10}/></button>
         <div className="w-px bg-eden-700 h-3 self-center"></div>
         <button onClick={() => zeroStat(type)} className="text-red-400 hover:text-red-300 p-1" title="Zerar"><Skull size={10}/></button>
      </div>

        <span className={`font-bold flex items-center gap-2 ${color}`}><Icon size={16} /> {label}</span>
        
        {editMode === type ? (
            <div className="flex items-center gap-1">
                <input 
                  autoFocus
                  type="number" 
                  className="w-16 bg-eden-900 text-eden-100 border border-eden-600 rounded px-1 text-right text-sm outline-none focus:border-energia"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleManualSubmit(type)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit(type)}
                  style={{ colorScheme: 'dark' }}
                />
                <span className="text-xs text-eden-100/50">/ {max}</span>
            </div>
        ) : (
            <div className="text-right cursor-pointer hover:opacity-80" onClick={() => { setEditMode(type); setTempValue(current.toString()); }}>
                <span className="text-xl font-black">{current}</span>
                <span className="text-xs text-eden-100/40">/{max}</span>
                {temp > 0 && <span className="ml-2 text-xs font-bold text-cyan-400">+{temp}</span>}
            </div>
        )}
      </div>

      <div className="h-3 bg-eden-950 rounded-full overflow-hidden relative">
          <div className={`h-full transition-all duration-500 ${bg}`} style={{ width: `${max > 0 ? Math.min(100, (current / max) * 100) : 0}%` }} />
          {temp > 0 && (
              <div className="h-full bg-cyan-500/50 absolute top-0 left-0 transition-all" style={{ width: `${max > 0 ? Math.min(100, (temp / max) * 100) : 0}%` }} />
          )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      
      {/* Status Bars */}
      <div className="bg-eden-800 border border-eden-700 p-5 rounded-xl shadow-sm">
        <StatRow label="PV" type="pv" icon={Heart} color="text-red-500" bg="bg-red-600" current={status.pv.current} max={status.pv.max} temp={status.pv.temp} />
        <StatRow label="PE" type="pe" icon={Zap} color="text-yellow-400" bg="bg-yellow-500" current={status.pe.current} max={status.pe.max} temp={status.pe.temp} />
        <StatRow label="SAN" type="san" icon={Brain} color="text-blue-400" bg="bg-blue-600" current={status.san.current} max={status.san.max} temp={status.san.temp} />
      </div>

      {/* Card de Transação */}
      <div className="bg-eden-800 border border-eden-700 p-4 rounded-xl shadow-sm">
        <h4 className="text-xs font-bold text-eden-100/50 uppercase mb-3 tracking-wider">Registrar Evento</h4>
        <div className="flex items-center gap-2 text-sm mb-3 flex-wrap">
            <span className="text-eden-100/70">Eu</span>
            <select 
                value={transAction} 
                onChange={handleActionChange}
                className={`bg-eden-900 text-eden-100 border border-eden-700 rounded px-2 py-1 font-bold outline-none focus:border-energia ${transAction === 'damage' ? 'text-red-400' : 'text-green-400'}`}
                style={{ colorScheme: 'dark' }}
            >
                <option value="damage">perdi</option>
                <option value="heal">recebi</option>
            </select>
            <input 
                type="number" 
                placeholder="0"
                value={transValue}
                onChange={(e) => setTransValue(e.target.value)}
                className="w-16 bg-eden-900 text-eden-100 border border-eden-700 rounded px-2 py-1 text-center font-bold outline-none focus:border-energia"
                style={{ colorScheme: 'dark' }}
            />
            <select 
                value={transType} 
                onChange={(e) => setTransType(e.target.value as any)}
                className="bg-eden-900 text-eden-100 border border-eden-700 rounded px-2 py-1 outline-none flex-1 focus:border-energia"
                style={{ colorScheme: 'dark' }}
            >
                <option value="pv">PV</option>
                {transAction === 'heal' && <option value="pv_temp">PV Temp</option>}
                
                <option value="pe">PE</option>
                {transAction === 'heal' && <option value="pe_temp">PE Temp</option>}
                
                <option value="san">SAN</option>
                {transAction === 'heal' && <option value="san_temp">SAN Temp</option>}
            </select>
        </div>

        <div className="space-y-3 mb-3">
            <div className="flex gap-4 text-xs text-eden-100/70">
                <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
                    <input type="checkbox" checked={applyHalf} onChange={e => setApplyHalf(e.target.checked)} className="accent-energia w-3 h-3" /> Metade
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
                    <input type="checkbox" checked={applyDouble} onChange={e => setApplyDouble(e.target.checked)} className="accent-energia w-3 h-3" /> Dobro
                </label>
            </div>
            
            {transAction === 'damage' && (
                 <select 
                    value={selectedResist} 
                    onChange={e => setSelectedResist(e.target.value)}
                    className="w-full text-xs bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia"
                    style={{ colorScheme: 'dark' }}
                >
                    <option value="">-- Aplicar Resistência --</option>
                    {RESISTANCES.map(r => {
                        const val = character.status.resistances[r] || 0;
                        if (val > 0) return <option key={r} value={r}>{r.toUpperCase()} ({val})</option>;
                        return null;
                    })}
                </select>
            )}
        </div>

        <button onClick={executeTransaction} className={`w-full py-2 rounded font-bold transition-all shadow-md ${transAction === 'damage' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
            Confirmar
        </button>
      </div>
    </div>
  );
}