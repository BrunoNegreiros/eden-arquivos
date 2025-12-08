import { useState } from 'react';
import { Skull, Plus, X, Clock, AlertTriangle, Heart, Brain } from 'lucide-react'; 
import { CONDITIONS_LIST } from '../../data/referenceData';
import type { CharacterSheet, ActiveCondition } from '../../types/characterSchema';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

export default function ConditionsCard({ character, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS_LIST[0].name);
  const [durationType, setDurationType] = useState<'turnos' | 'cena' | 'indefinida'>('cena');
  const [durationValue, setDurationValue] = useState(1);

  const isMachucado = character.status.pv.current <= (character.status.pv.max / 2) && character.status.pv.current > 0;
  const isPerturbado = character.status.san.current <= (character.status.san.max / 2) && character.status.san.current > 0;
  const isMorrendo = character.status.pv.current <= 0;

  const addCondition = () => {
    const refCond = CONDITIONS_LIST.find(c => c.name === selectedCondition);
    if (!refCond) return;

    const newCondition: ActiveCondition = {
      id: Date.now().toString(),
      name: refCond.name,
      description: refCond.description,
      durationType,
      durationValue: durationType === 'turnos' ? durationValue : undefined,
      effects: refCond.effects
    };

    onUpdate({
      status: {
        ...character.status,
        conditions: [...character.status.conditions, newCondition]
      }
    });
    setIsAdding(false);
  };

  const removeCondition = (id: string) => {
    onUpdate({
      status: {
        ...character.status,
        conditions: character.status.conditions.filter(c => c.id !== id)
      }
    });
  };

  return (
    <div className="bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3 border-b border-eden-700 pb-2">
        <h3 className="text-xs md:text-sm font-bold text-eden-100/50 uppercase flex items-center gap-2 tracking-wider">
          <Skull size={14} className="md:w-4 md:h-4" /> Condições
        </h3>
        <div className="flex gap-2">
             <button onClick={() => setIsAdding(!isAdding)} className="p-1 bg-eden-700 rounded hover:bg-eden-600 text-eden-100 transition-colors">
                <Plus size={14} />
             </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-3 p-2 md:p-3 bg-eden-900/50 rounded border border-eden-600 space-y-2 animate-in fade-in slide-in-from-top-2">
          <select 
            value={selectedCondition} 
            onChange={e => setSelectedCondition(e.target.value)}
            className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-1.5 text-xs md:text-sm outline-none focus:border-energia"
            style={{ colorScheme: 'dark' }}
          >
            {CONDITIONS_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          
          <div className="flex gap-2">
            <select 
                value={durationType} 
                onChange={e => setDurationType(e.target.value as any)}
                className="bg-eden-900 text-eden-100 border border-eden-700 rounded p-1.5 text-xs md:text-sm outline-none flex-1 focus:border-energia"
                style={{ colorScheme: 'dark' }}
            >
                <option value="turnos">Turnos</option>
                <option value="cena">Cena</option>
                <option value="indefinida">Indefinida</option>
            </select>
            {durationType === 'turnos' && (
                <input 
                    type="number" 
                    value={durationValue} 
                    onChange={e => setDurationValue(parseInt(e.target.value))}
                    className="w-12 md:w-16 bg-eden-900 text-eden-100 border border-eden-700 rounded p-1.5 text-xs md:text-sm outline-none focus:border-energia text-center"
                    min="1"
                    style={{ colorScheme: 'dark' }}
                />
            )}
          </div>
          <button onClick={addCondition} className="w-full py-1.5 bg-conhecimento text-eden-900 font-bold rounded text-xs uppercase tracking-wide hover:bg-yellow-500 shadow-md transition-all">
            Adicionar
          </button>
        </div>
      )}

      <div className="space-y-2">
        
        {/* CONDIÇÕES AUTOMÁTICAS */}
        {isMorrendo && (
             <div className="bg-red-950/50 border border-red-600/50 p-2 rounded-lg flex items-center gap-2 animate-pulse">
                <AlertTriangle size={14} className="text-red-500 md:w-4 md:h-4" />
                <div>
                    <div className="font-black text-red-400 text-xs md:text-sm uppercase">Morrendo</div>
                    <div className="text-[9px] md:text-[10px] text-red-300/60">Com 0 PV. Precisa ser estabilizado.</div>
                </div>
             </div>
        )}

        {isMachucado && !isMorrendo && (
             <div className="bg-red-900/20 border border-red-500/30 p-2 rounded-lg flex items-center gap-2">
                <Heart size={14} className="text-red-500 md:w-4 md:h-4" />
                <div>
                    <div className="font-bold text-red-400 text-xs md:text-sm">Machucado</div>
                    <div className="text-[9px] md:text-[10px] text-red-200/50">Menos da metade dos PV.</div>
                </div>
             </div>
        )}

        {isPerturbado && (
             <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded-lg flex items-center gap-2">
                <Brain size={14} className="text-blue-500 md:w-4 md:h-4" />
                <div>
                    <div className="font-bold text-blue-400 text-xs md:text-sm">Perturbado</div>
                    <div className="text-[9px] md:text-[10px] text-blue-200/50">Menos da metade da Sanidade.</div>
                </div>
             </div>
        )}

        {character.status.conditions.map(cond => (
            <div key={cond.id} className="bg-eden-900/60 border border-eden-700/50 p-2 rounded-lg flex justify-between items-start group hover:border-red-500/50 transition-colors">
                <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-red-400 text-xs md:text-sm mb-0.5 truncate">{cond.name}</div>
                    <div className="text-[9px] md:text-[10px] text-eden-100/60 leading-tight line-clamp-2">{cond.description}</div>
                    <div className="text-[8px] md:text-[9px] text-energia mt-1 flex items-center gap-1 uppercase tracking-widest font-bold">
                        <Clock size={8} className="md:w-2.5 md:h-2.5" /> 
                        {cond.durationType === 'turnos' ? `${cond.durationValue} RODADAS` : cond.durationType}
                    </div>
                </div>
                <button onClick={() => removeCondition(cond.id)} className="text-eden-100/20 hover:text-red-500 transition-colors p-0.5">
                    <X size={14} />
                </button>
            </div>
        ))}

        {character.status.conditions.length === 0 && !isMachucado && !isPerturbado && !isMorrendo && (
            <p className="text-xs text-eden-100/30 text-center italic py-2">Nenhuma condição ativa.</p>
        )}
      </div>
    </div>
  );
}