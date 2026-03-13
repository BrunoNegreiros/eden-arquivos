import { useState } from 'react';
import { Skull, Plus, Clock, AlertTriangle, Heart, Brain, Power, Trash2, ShieldAlert, X } from 'lucide-react'; 
import { CONDITIONS_LIST } from '../../data/referenceData';
import { useCharacter } from '../../context/CharacterContext';
import type { Effect } from '../../types/systemData'; 
import type { CharacterCondition } from '../../types/characterSchema';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export default function SheetConditions() {
  const { character, vars, updateCharacter } = useCharacter();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS_LIST[0]?.name || '');
  const [durationType, setDurationType] = useState<'turnos' | 'cena' | 'indefinida'>('cena');
  const [durationValue, setDurationValue] = useState(1);

  
  const currentPV = character.status.pv?.current ?? 0;
  const currentSAN = character.status.san?.current ?? 0;
  
  const isMachucado = currentPV <= (vars.PV.max / 2) && currentPV > 0;
  const isPerturbado = currentSAN <= (vars.SAN.max / 2) && currentSAN > 0;
  const isMorrendo = currentPV <= 0;

  
  const isImmuneToSelected = (vars.IMUNIDADES || []).includes(selectedCondition.toLowerCase());

  const handleAddCondition = () => {
    if (!selectedCondition) return;
    
    if (isImmuneToSelected) {
        alert(`O personagem é imune à condição: ${selectedCondition}!`);
        setIsAdding(false);
        return;
    }

    const conditionDef = CONDITIONS_LIST.find(c => c.name === selectedCondition);
    if (!conditionDef) return;

    
    const clonedEffects = conditionDef.effects ? JSON.parse(JSON.stringify(conditionDef.effects)) : [];
    const renewedEffects = clonedEffects.map((e: any) => ({
        ...e,
        id: generateId() 
    }));

    
    const newCond: any = {
      id: generateId(),
      name: conditionDef.name,
      description: conditionDef.description,
      isActive: true,
      durationType,
      durationValue: durationType === 'turnos' ? durationValue : 0,
      turnsRemaining: durationType === 'turnos' ? durationValue : 0,
      effects: renewedEffects
    };

    updateCharacter(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCond as CharacterCondition]
    }));
    
    setIsAdding(false);
  };

  const removeCondition = (conditionId: string) => {
    updateCharacter(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }));
  };

  const toggleCondition = (conditionId: string) => {
    updateCharacter(prev => ({
        ...prev,
        conditions: prev.conditions.map(c => 
            c.id === conditionId ? { ...c, isActive: !c.isActive } : c
        )
    }));
  };

  return (
    <div className="bg-eden-900/50 border border-eden-700/50 rounded-xl p-3 md:p-4 shadow-inner">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h4 className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 flex items-center gap-1 md:gap-2">
          <Skull size={14} className="text-red-400" /> Condições & Status
        </h4>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 md:p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${isAdding ? 'bg-red-500/20 text-red-400' : 'bg-eden-800 text-eden-100 hover:bg-eden-700'}`}
        >
            {isAdding ? <X size={14}/> : <><Plus size={14} /> Adicionar</>}
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 md:p-4 bg-eden-950/80 rounded-xl border border-eden-700 space-y-3 animate-in fade-in slide-in-from-top-2">
          
          {isImmuneToSelected && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/30 p-2 rounded border border-red-900">
                  <ShieldAlert size={14}/> O personagem tem Imunidade a esta condição e os efeitos não funcionarão.
              </div>
          )}

          <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-eden-100/50">Condição</label>
              <select 
                value={selectedCondition} 
                onChange={e => setSelectedCondition(e.target.value)}
                className="w-full bg-eden-900 border border-eden-600 rounded p-2 text-sm text-white outline-none focus:border-red-500"
              >
                {CONDITIONS_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
              <div className="space-y-1 flex-1">
                  <label className="text-[10px] uppercase font-bold text-eden-100/50">Duração</label>
                  <select 
                    value={durationType} 
                    onChange={e => setDurationType(e.target.value as any)}
                    className="w-full bg-eden-900 border border-eden-600 rounded p-2 text-sm text-white outline-none"
                  >
                    <option value="cena">Até o Fim da Cena</option>
                    <option value="turnos">Turnos Específicos</option>
                    <option value="indefinida">Indefinida / Permanente</option>
                  </select>
              </div>
              {durationType === 'turnos' && (
                  <div className="space-y-1 w-full sm:w-24">
                      <label className="text-[10px] uppercase font-bold text-eden-100/50">Turnos</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={durationValue} 
                        onChange={e => setDurationValue(Number(e.target.value))}
                        className="w-full bg-eden-900 border border-eden-600 rounded p-2 text-sm text-white outline-none text-center"
                      />
                  </div>
              )}
          </div>

          <button 
            onClick={handleAddCondition}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg"
          >
            Aplicar Condição
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        
        {}
        {isMorrendo && (
            <div className="flex items-start gap-3 p-2.5 md:p-3 rounded-lg border bg-red-950/40 border-red-500/50">
                <div className="p-1.5 md:p-2 rounded bg-red-500/20 text-red-500 shrink-0"><Skull size={18} /></div>
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs md:text-sm text-red-400 truncate">Morrendo</h5>
                    <p className="text-[10px] md:text-xs text-eden-100/60 leading-relaxed mt-0.5">Personagem está com 0 PV. Faça um teste de Constituição para não morrer no início de cada turno.</p>
                </div>
            </div>
        )}
        
        {isMachucado && !isMorrendo && (
            <div className="flex items-start gap-3 p-2.5 md:p-3 rounded-lg border bg-orange-950/30 border-orange-500/30">
                <div className="p-1.5 md:p-2 rounded bg-orange-500/20 text-orange-400 shrink-0"><Heart size={18} /></div>
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs md:text-sm text-orange-400 truncate">Machucado</h5>
                    <p className="text-[10px] md:text-xs text-eden-100/60 leading-relaxed mt-0.5">Personagem está com menos da metade dos PV totais.</p>
                </div>
            </div>
        )}

        {isPerturbado && (
            <div className="flex items-start gap-3 p-2.5 md:p-3 rounded-lg border bg-purple-950/30 border-purple-500/30">
                <div className="p-1.5 md:p-2 rounded bg-purple-500/20 text-purple-400 shrink-0"><Brain size={18} /></div>
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs md:text-sm text-purple-400 truncate">Perturbado</h5>
                    <p className="text-[10px] md:text-xs text-eden-100/60 leading-relaxed mt-0.5">Personagem está com menos da metade da SAN total.</p>
                </div>
            </div>
        )}

        {}
        {character.conditions.map((cond: any) => (
            <div 
                key={cond.id} 
                className={`flex items-start justify-between gap-3 p-2.5 md:p-3 rounded-lg border transition-colors ${cond.isActive ? 'bg-eden-950/80 border-eden-600 shadow-md' : 'bg-eden-900/30 border-eden-800 opacity-60'}`}
            >
                <div className="flex gap-3 flex-1 min-w-0">
                    <div className={`p-1.5 md:p-2 rounded shrink-0 ${cond.isActive ? 'bg-red-500/10 text-red-400' : 'bg-eden-800 text-eden-100/30'}`}>
                        <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h5 className={`font-bold text-xs md:text-sm truncate ${cond.isActive ? 'text-white' : 'text-eden-100/50 line-through'}`}>{cond.name}</h5>
                            
                            {}
                            {(cond.effects || []).length > 0 && (
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${cond.isActive ? 'border-energia/50 text-energia bg-energia/10' : 'border-eden-700 text-eden-100/40 bg-eden-800'}`}>
                                    Automação
                                </span>
                            )}
                        </div>

                        <p className="text-[10px] md:text-xs text-eden-100/60 leading-relaxed mt-1">
                            {(cond.effects || []).filter((e: Effect) => e.category === 'manual').map((e: Effect) => e.textDescription).join(' ') || cond.description}
                        </p>
                        
                        {cond.durationType !== 'indefinida' && (
                            <div className="flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-widest text-energia">
                                <Clock size={10} />
                                {cond.durationType === 'cena' ? 'Até o fim da cena' : `${cond.turnsRemaining} Turno(s) Restante(s)`}
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="flex flex-col gap-1 shrink-0 ml-2">
                    <button 
                        onClick={() => toggleCondition(cond.id)} 
                        className={`p-1.5 rounded transition-colors ${cond.isActive ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-eden-800 text-eden-100/30 hover:text-eden-100'}`}
                        title={cond.isActive ? "Desativar" : "Ativar"}
                    >
                        <Power size={14} />
                    </button>
                    <button 
                        onClick={() => removeCondition(cond.id)} 
                        className="p-1.5 rounded bg-eden-800/50 text-eden-100/30 hover:text-red-500 hover:bg-red-900/20 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        ))}

        {character.conditions.length === 0 && !isMachucado && !isPerturbado && !isMorrendo && (
            <div className="text-center py-6 border-2 border-dashed border-eden-800 rounded-lg">
                <p className="text-[10px] md:text-xs text-eden-100/30 uppercase font-bold tracking-widest">Nenhuma condição ativa</p>
            </div>
        )}
      </div>
    </div>
  );
}