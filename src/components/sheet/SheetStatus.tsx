import { useState } from 'react';
import { Heart, Brain, Zap, RefreshCw, Skull, Shield, Footprints } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import { CONDITIONS_LIST } from '../../data/referenceData';
import type { DamageType } from '../../types/systemData';

export default function SheetStatus() {
  const { character, vars, updateCharacter } = useCharacter();
  const { status } = character;

  const [damageType, setDamageType] = useState<DamageType | ''>('');
  const [transAction, setTransAction] = useState<'damage' | 'heal'>('damage');
  const [transValue, setTransValue] = useState<string>('');
  const [transType, setTransType] = useState<'pv' | 'pe' | 'san'>('pv');
  const [targetPool, setTargetPool] = useState<'current' | 'max' | 'temp'>('current');
  const [applyHalf, setApplyHalf] = useState(false);
  const [applyDouble, setApplyDouble] = useState(false);
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const executeTransaction = () => {
    const val = parseInt(transValue);
    if (isNaN(val) || val <= 0) return;

    let finalValue = val;
    if (applyDouble) finalValue *= 2;
    if (applyHalf) finalValue = Math.floor(finalValue / 2);

    if (transAction === 'damage' && damageType && targetPool !== 'max') {
      const dmgKey = damageType.toLowerCase();
      if (vars.IMUNIDADES?.includes(dmgKey)) finalValue = 0;
      else if (vars.VULNERABILIDADES?.includes(dmgKey)) finalValue *= 2;
      else {
          const totalRd = (vars.RD?.[dmgKey] || 0) + (character.resistances.find((r: any) => r.name.toLowerCase() === dmgKey)?.value || 0);
          if (totalRd > 0) finalValue = Math.max(0, finalValue - totalRd);
      }
    }

    if (finalValue === 0 && transAction === 'damage') {
      alert("O dano foi totalmente absorvido pelas suas resistências/imunidades!");
      setTransValue('');
      return;
    }

    updateCharacter((prev) => {
      const newStatus = { ...prev.status };
      const poolKey = transType;
      let currentPool = { ...newStatus[poolKey] } as any;
      const motorTemp = vars[poolKey.toUpperCase() as 'PV'|'PE'|'SAN'].temp || 0;
            
      const maxReal = vars[poolKey.toUpperCase() as 'PV'|'PE'|'SAN'].max;

      if (transAction === 'damage') {
        if (targetPool === 'max') {            
            const savedMax = currentPool.max !== undefined ? currentPool.max : maxReal;
            currentPool.max = Math.max(0, savedMax - finalValue);
            if (currentPool.current > currentPool.max) currentPool.current = currentPool.max;
        } 
        else {
            let remainingDamage = finalValue;
            
            const totalTemp = (currentPool.temp || 0) + motorTemp;
            if (totalTemp > 0) {
                if (remainingDamage >= totalTemp) {
                    remainingDamage -= totalTemp;
                    currentPool.temp = -motorTemp; 
                } else {
                    currentPool.temp = (currentPool.temp || 0) - remainingDamage;
                    remainingDamage = 0;
                }
            }
            if (remainingDamage > 0) currentPool.current = Math.max(0, currentPool.current - remainingDamage);
        }
      } else {
        if (targetPool === 'max') {             
            const savedMax = currentPool.max !== undefined ? currentPool.max : maxReal;
            currentPool.max = savedMax + finalValue;
        } else if (targetPool === 'temp') {
            currentPool.temp = (currentPool.temp || 0) + finalValue;
        } else {            
            currentPool.current = Math.min(maxReal, currentPool.current + finalValue);
        }
      }

      return { ...prev, status: { ...newStatus, [poolKey]: currentPool } };
    });

    setTransValue(''); setApplyHalf(false); setApplyDouble(false); setDamageType('');
  };

  const handleManualSubmit = (stat: 'pv' | 'pe' | 'san') => {
    const val = parseInt(tempValue);
    if (!isNaN(val)) {
        updateCharacter(prev => {
            const maxReal = vars[stat.toUpperCase() as 'PV'|'PE'|'SAN'].max;            
            const safeVal = Math.max(0, Math.min(maxReal, val));
            return {
              ...prev,
              status: { ...prev.status, [stat]: { ...prev.status[stat], current: safeVal } }
            };
        });
    }
    setEditMode(null); setTempValue('');
  };

  const StatRow = ({ label, type, icon: Icon, color, bg }: any) => {
    const statData = status[type as 'pv' | 'pe' | 'san'] as any;
    const calculatedMax = vars[type.toUpperCase() as 'PV' | 'PE' | 'SAN'].max;
    const motorTemp = vars[type.toUpperCase() as 'PV' | 'PE' | 'SAN'].temp || 0;

    const displayMax = calculatedMax;
    const displayTemp = Math.max(0, (statData.temp || 0) + motorTemp);

    return (
        <div className="mb-4 bg-eden-900/50 p-3 rounded-xl border border-eden-700/50 group relative">
          <div className="flex justify-between items-center mb-2">
              <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-eden-900 border border-eden-700 rounded-full px-2 py-0.5 z-10">
                {}
                <button onClick={() => updateCharacter(prev => ({ ...prev, status: { ...prev.status, [type]: { ...prev.status[type as 'pv'|'pe'|'san'], current: displayMax } } }))} className="text-green-400 p-1"><RefreshCw size={12}/></button>
                <button onClick={() => updateCharacter(prev => ({ ...prev, status: { ...prev.status, [type]: { ...prev.status[type as 'pv'|'pe'|'san'], current: 0 } } }))} className="text-red-400 p-1"><Skull size={12}/></button>
              </div>
              <span className={`font-bold flex items-center gap-2 ${color}`}><Icon size={16} /> {label}</span>
              {editMode === type ? (
                  <input autoFocus type="number" className="w-16 bg-eden-950 border border-eden-600 rounded px-1 text-right text-sm text-white outline-none" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={() => handleManualSubmit(type)} onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit(type)} />
              ) : (
                  <div className="text-right cursor-pointer" onClick={() => { setEditMode(type); setTempValue(statData.current.toString()); }}>
                      <span className="text-xl font-black">{statData.current}</span>
                      <span className="text-xs text-eden-100/40">/{displayMax}</span>
                      {displayTemp > 0 && <span className="ml-2 text-xs font-bold text-cyan-400">+{displayTemp}</span>}
                  </div>
              )}
          </div>
          <div className="h-2.5 bg-eden-950 rounded-full overflow-hidden relative">
              <div className={`h-full transition-all duration-500 ${bg}`} style={{ width: `${displayMax > 0 ? Math.min(100, (statData.current / displayMax) * 100) : 0}%` }} />
              {displayTemp > 0 && (<div className="h-full bg-cyan-500/50 absolute top-0 left-0" style={{ width: `${displayMax > 0 ? Math.min(100, (displayTemp / displayMax) * 100) : 0}%` }} />)}
          </div>
        </div>
    );
  };

  const getResistColor = (type: string, category: 'imunidade' | 'resistencia' | 'vulnerabilidade') => {
      const t = type.toLowerCase();
      const isParanormal = ['energia', 'sangue', 'morte', 'conhecimento', 'medo'].includes(t);
      const isMental = t === 'mental';
      const isCondition = !isParanormal && !isMental && CONDITIONS_LIST.some(c => c.name.toLowerCase() === t);

      if (category === 'vulnerabilidade') {
          if (isParanormal) return 'bg-black text-white border-white/30';
          return 'bg-red-900/30 text-red-400 border-red-700';
      }
      if (isParanormal) return 'bg-purple-900/30 text-purple-400 border-purple-700';
      if (isMental) return 'bg-blue-900/30 text-blue-400 border-blue-700';
      if (category === 'imunidade' && isCondition) return 'bg-green-900/30 text-green-400 border-green-700';
      
      return 'bg-eden-900 text-eden-100/80 border-eden-700'; 
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-eden-800 border border-eden-700 p-5 rounded-xl shadow-sm">
        <StatRow label="PV" type="pv" icon={Heart} color="text-red-500" bg="bg-red-600" />
        <StatRow label="PE" type="pe" icon={Zap} color="text-yellow-400" bg="bg-yellow-500" />
        <StatRow label="SAN" type="san" icon={Brain} color="text-blue-400" bg="bg-blue-600" />
      </div>

      <div className="bg-eden-800 border border-eden-700 p-4 rounded-xl shadow-sm">
        <h4 className="text-[10px] font-bold text-eden-100/30 uppercase mb-4 tracking-widest text-center">Calculadora de Fluxo</h4>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-sm font-medium">
            <span className="text-eden-100/60">Eu</span>
            <select value={transAction} onChange={e => { const act = e.target.value as 'damage' | 'heal'; setTransAction(act); if (act === 'damage' && targetPool === 'temp') setTargetPool('current'); }} className={`bg-eden-800 border-b-2 border-eden-700 px-1 py-0.5 font-black outline-none transition-colors ${transAction === 'damage' ? 'text-red-500 border-red-900' : 'text-green-500 border-green-900'}`}>
                <option value="damage">perdi</option><option value="heal">ganhei</option>
            </select>
            <input type="number" placeholder="0" value={transValue} onChange={(e) => setTransValue(e.target.value)} className="w-12 bg-eden-900 border border-eden-700 rounded px-1 py-1 text-center font-black text-white outline-none focus:border-energia" />
            <span className="text-eden-100/60">pontos</span>
            <select value={targetPool} onChange={e => setTargetPool(e.target.value as any)} className="bg-eden-800 border-b-2 border-eden-700 px-1 py-0.5 font-black text-white outline-none">
                <option value="current">Atuais</option><option value="max">Máximos</option>{transAction === 'heal' && <option value="temp">Temporários</option>}
            </select>
            <span className="text-eden-100/60">de</span>
            <select value={transType} onChange={e => setTransType(e.target.value as any)} className="bg-eden-800 border-b-2 border-eden-700 px-1 py-0.5 font-black text-white outline-none">
                <option value="pv">PV</option><option value="pe">PE</option><option value="san">SAN</option>
            </select>
            {transAction === 'damage' && (
                <>
                    <span className="text-eden-100/60">por</span>
                    <select value={damageType} onChange={e => setDamageType(e.target.value as DamageType)} className="bg-eden-800 border-b-2 border-eden-700 px-1 py-0.5 font-black text-red-400 outline-none">
                        <option value="">Dano Comum</option><option value="balistico">Balístico</option><option value="corte">Corte</option><option value="impacto">Impacto</option><option value="perfuracao">Perfuração</option><option value="fogo">Fogo</option><option value="frio">Frio</option><option value="eletricidade">Eletricidade</option><option value="quimico">Químico</option><option value="sangue">Sangue</option><option value="morte">Morte</option><option value="conhecimento">Conhecimento</option><option value="energia">Energia</option><option value="medo">Medo</option><option value="mental">Mental</option>
                    </select>
                </>
            )}
        </div>
        <div className="mt-6 flex flex-col gap-4">
            <div className="flex justify-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase text-eden-100/40 hover:text-white transition-colors"><input type="checkbox" checked={applyHalf} onChange={e => setApplyHalf(e.target.checked)} className="accent-energia w-3 h-3" /> Metade</label>
                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase text-eden-100/40 hover:text-white transition-colors"><input type="checkbox" checked={applyDouble} onChange={e => setApplyDouble(e.target.checked)} className="accent-energia w-3 h-3" /> Dobro</label>
            </div>            
            <button onClick={executeTransaction} className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${transAction === 'damage' ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20'}`}>Confirmar Alteração</button>
        </div>
      </div>
      
      <div className="bg-eden-800 border border-eden-700 p-4 md:p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-eden-700">
                 <div className="flex items-center gap-3"><div className="p-2 bg-eden-950 rounded-lg border border-eden-600 text-eden-100"><Shield size={20}/></div><div><div className="text-xl md:text-3xl font-black text-white leading-none">{vars.DEF}</div><div className="text-[8px] md:text-[10px] font-bold text-eden-100/40 uppercase mt-1">Defesa</div></div></div>
                 <div className="flex items-center gap-3 text-right"><div><div className="text-xl md:text-3xl font-black text-white leading-none">{vars.DESLOCAMENTO}m</div><div className="text-[8px] md:text-[10px] font-bold text-eden-100/40 uppercase mt-1">Deslocamento</div></div><div className="p-2 bg-eden-950 rounded-lg border border-eden-600 text-eden-100"><Footprints size={20}/></div></div>
              </div>
              
              <div className="text-xs">
                 <div className="flex justify-between items-center mb-2"><span className="text-[8px] md:text-[10px] font-bold text-eden-100/30 uppercase tracking-widest">Resistências (Automáticas)</span></div>
                 <div className="flex flex-wrap gap-1">
                     {(vars.IMUNIDADES || []).map((im: string) => (
                         <span key={`im_${im}`} className={`px-2 py-1 rounded border text-[9px] md:text-[10px] flex items-center gap-1 font-bold uppercase ${getResistColor(im, 'imunidade')}`}>{im} (IMUNE)</span>
                     ))}
                     {(vars.VULNERABILIDADES || []).map((vul: string) => (
                         <span key={`vul_${vul}`} className={`px-2 py-1 rounded border text-[9px] md:text-[10px] flex items-center gap-1 font-bold uppercase ${getResistColor(vul, 'vulnerabilidade')}`}>{vul} (VULNERÁVEL)</span>
                     ))}
                     {Object.keys(vars.RD || {}).map(rdKey => {
                         if (vars.RD[rdKey] <= 0) return null;
                         return <span key={`rd_${rdKey}`} className={`px-2 py-1 rounded border text-[9px] md:text-[10px] flex items-center gap-1 font-bold uppercase ${getResistColor(rdKey, 'resistencia')}`}>{rdKey} {vars.RD[rdKey]}</span>
                     })}
                     {character.resistances.filter((r: any) => !(vars.IMUNIDADES || []).includes(r.name.toLowerCase()) && !(vars.RD || {})[r.name.toLowerCase()]).map((r: any) => (
                         <span key={`man_${r.name}`} className={`px-2 py-1 rounded border text-[9px] md:text-[10px] flex items-center gap-1 font-bold uppercase ${getResistColor(r.name, r.type === "1" ? 'imunidade' : 'resistencia')}`}>{r.name} {r.type === "1" ? '(IMUNE)' : r.value}</span>
                     ))}
                     {(!vars.IMUNIDADES?.length && !vars.VULNERABILIDADES?.length && Object.keys(vars.RD || {}).length === 0 && character.resistances.length === 0) && (<span className="text-[10px] text-eden-100/30 italic">Nenhuma resistência ativa.</span>)}
                 </div>
              </div>
              {(vars.IMUNIDADES || []).some(im => CONDITIONS_LIST.some(c => c.name.toLowerCase() === im)) && (
                 <div className="text-[9px] text-green-400/70 italic border-t border-eden-700/50 pt-2">
                     * Suas imunidades a condições atuarão como lembretes visuais durante o combate.
                 </div>
              )}
      </div>      
    </div>
  );
}