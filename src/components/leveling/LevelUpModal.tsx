import { useState } from 'react';
import { 
  ArrowRight, Zap, Skull, Droplet, Check, Plus, Trash2, ListChecks
} from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';

interface Props {
  targetNex: number;
  onConfirm: () => void;
  onCancel: () => void;
}


const CLASS_STATS: Record<string, { pvNex: number, peNex: number, sanNex: number }> = {
  'combatente': { pvNex: 4, peNex: 2, sanNex: 3 },
  'especialista': { pvNex: 3, peNex: 3, sanNex: 4 },
  'ocultista': { pvNex: 2, peNex: 4, sanNex: 5 },
  'mundano': { pvNex: 2, peNex: 1, sanNex: 1 },
};

export default function LevelUpModal({ targetNex, onConfirm, onCancel }: Props) {
  const { character, updateCharacter, vars } = useCharacter();
  const [willTranscend, setWillTranscend] = useState(false);
  
  
  const [tasks, setTasks] = useState<{id: string, text: string, isDone: boolean}[]>([]);
  const [taskInput, setTaskInput] = useState('');
  
  const currentNex = character.personal.nex;
  const effectiveCurrent = currentNex === 99 ? 100 : currentNex;
  const effectiveTarget = targetNex === 99 ? 100 : targetNex;
  const steps = (effectiveTarget - effectiveCurrent) / 5;
  const isLevelingUp = steps > 0;

  const stats = CLASS_STATS[character.personal.class] || CLASS_STATS['mundano'];
  const vig = vars.ATTRS.VIG || 0;
  const pre = vars.ATTRS.PRE || 0;
  
  const pvGain = (stats.pvNex + vig) * steps;
  const peGain = (stats.peNex + pre) * steps;
  let sanGain = (stats.sanNex) * steps;
  
  if (isLevelingUp && willTranscend) sanGain -= 2;

  const addTask = () => {
      if (!taskInput.trim()) return;
      setTasks([...tasks, { id: Date.now().toString(), text: taskInput.trim(), isDone: false }]);
      setTaskInput('');
  };

  const removeTask = (id: string) => {
      setTasks(tasks.filter(t => t.id !== id));
  };

  const handleConfirm = () => {
      
      const currentPvMax = (character.status.pv as any).max ?? vars.PV.max;
      const currentPeMax = (character.status.pe as any).max ?? vars.PE.max;
      const currentSanMax = (character.status.san as any).max ?? vars.SAN.max;

      
      const newStatus = { 
          ...character.status,
          pv: { 
              ...character.status.pv, 
              current: character.status.pv.current + pvGain,
              max: currentPvMax + pvGain
          },
          pe: { 
              ...character.status.pe, 
              current: character.status.pe.current + peGain,
              max: currentPeMax + peGain
          },
          san: { 
              ...character.status.san, 
              current: character.status.san.current + sanGain,
              max: currentSanMax + sanGain
          }
      };

      
      const newAbilities = [...(character.abilities || [])];
      
      if (isLevelingUp && willTranscend) {
          newAbilities.push({
              id: 'transcender_' + Date.now(),
              name: `Transcender (${targetNex}%)`,
              description: 'Você transcendeu neste nível, perdendo 2 de Sanidade Máxima permanentemente para acolher o Paranormal.',
              source: 'Paranormal',
              cost: 0,              
              effects: [
                  {
                      id: 'eff_' + Date.now(),
                      name: 'Custo do Paranormal',
                      category: 'add_fixed',
                      targets: [{ id: '1', type: 'san_max' }],
                      value: { terms: [{ id: '1', type: 'fixed', value: -2 }], operations: [] },
                  }
              ]
          });
      }

      updateCharacter(prev => ({
          ...prev,
          personal: { ...prev.personal, nex: targetNex },
          status: newStatus,
          abilities: newAbilities,
          levelUpTasks: tasks
      } as any));

      onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-eden-950/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-eden-900 border border-eden-600 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-eden-800 p-6 border-b border-eden-700 text-center shrink-0">
                <h2 className="text-2xl md:text-3xl font-black text-eden-100 uppercase tracking-widest flex items-center justify-center gap-3">
                    <Zap className={isLevelingUp ? "text-energia" : "text-red-500"} /> 
                    {isLevelingUp ? 'Evolução de NEX' : 'Regressão de NEX'}
                </h2>
                <div className="flex justify-center items-center gap-4 mt-2 text-xl font-mono">
                    <span className="text-eden-100/50">{currentNex}%</span>
                    <ArrowRight className={isLevelingUp ? "text-energia" : "text-red-500"}/>
                    <span className="text-white font-bold text-2xl">{targetNex}%</span>
                </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                <div>
                    <h3 className="text-sm font-bold text-eden-100/50 uppercase tracking-widest mb-3 text-center">
                        {isLevelingUp ? 'Aumento Máximo e Atual' : 'Redução Máxima e Atual'}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                         <div className="bg-eden-950 p-3 rounded-xl border border-eden-700 flex flex-col items-center justify-center shadow-inner">
                             <div className={`font-black text-2xl ${pvGain > 0 ? 'text-red-500' : pvGain < 0 ? 'text-red-800' : 'text-eden-100/30'}`}>{pvGain > 0 ? '+' : ''}{pvGain}</div>
                             <div className="text-[10px] uppercase font-bold text-eden-100/50 mt-1 flex items-center gap-1"><Droplet size={12}/> PV</div>
                         </div>
                         <div className="bg-eden-950 p-3 rounded-xl border border-eden-700 flex flex-col items-center justify-center shadow-inner">
                             <div className={`font-black text-2xl ${peGain > 0 ? 'text-yellow-500' : peGain < 0 ? 'text-yellow-800' : 'text-eden-100/30'}`}>{peGain > 0 ? '+' : ''}{peGain}</div>
                             <div className="text-[10px] uppercase font-bold text-eden-100/50 mt-1 flex items-center gap-1"><Zap size={12}/> PE</div>
                         </div>
                         <div className="bg-eden-950 p-3 rounded-xl border border-eden-700 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                             {willTranscend && <div className="absolute inset-0 bg-violet-900/20 border-2 border-violet-500/50 rounded-xl pointer-events-none"></div>}
                             <div className={`font-black text-2xl ${sanGain > 0 ? 'text-blue-500' : sanGain < 0 ? 'text-blue-800' : 'text-eden-100/30'} ${willTranscend ? 'text-violet-400' : ''}`}>{sanGain > 0 ? '+' : ''}{sanGain}</div>
                             <div className="text-[10px] uppercase font-bold text-eden-100/50 mt-1 flex items-center gap-1"><Skull size={12}/> SAN</div>
                         </div>
                    </div>
                </div>

                {isLevelingUp && (
                    <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-all ${willTranscend ? 'bg-violet-900/20 border-violet-500/50' : 'bg-eden-950/50 border-eden-700 hover:border-violet-500/30'}`}>
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${willTranscend ? 'bg-violet-600 border-violet-500 text-white' : 'bg-eden-900 border-eden-600 text-transparent'}`}><Check size={14} /></div>
                        <input type="checkbox" className="hidden" checked={willTranscend} onChange={e => setWillTranscend(e.target.checked)} />
                        <div>
                            <span className={`text-sm font-bold block ${willTranscend ? 'text-violet-400' : 'text-eden-100'}`}>Transcender neste nível?</span>
                            <span className="text-xs text-eden-100/60 leading-relaxed block mt-1">Você perde <strong>2 de Sanidade Máxima</strong> para acolher o Paranormal.</span>
                        </div>
                    </label>
                )}

                {}
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl shadow-sm">
                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wide flex items-center gap-2 mb-2"><ListChecks size={16}/> Checklist do Mestre</h4>
                    <p className="text-xs text-yellow-200/80 mb-4 leading-relaxed">Insira abaixo as atualizações manuais que você deve fazer (Ex: "+1 de Força", "Novo Poder de Classe"). Elas ficarão salvas na sua ficha para você marcar depois.</p>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={taskInput}
                            onChange={e => setTaskInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTask()}
                            className="flex-1 bg-eden-950/80 border border-yellow-500/30 focus:border-yellow-400 rounded-lg p-2.5 text-sm text-yellow-100 outline-none placeholder-yellow-500/30"
                            placeholder="Descreva a alteração..."
                        />
                        <button onClick={addTask} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-eden-900 px-4 py-2 rounded-lg border border-yellow-500/50 transition-colors font-bold"><Plus size={18}/></button>
                    </div>

                    <div className="space-y-2">
                        {tasks.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-yellow-500/20">
                                <span className="text-sm text-yellow-100 font-medium">{t.text}</span>
                                <button onClick={() => removeTask(t.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-xs text-yellow-500/50 italic text-center py-2">Nenhuma tarefa adicionada.</p>}
                    </div>
                </div>

            </div>

            <div className="p-4 md:p-6 border-t border-eden-700 flex justify-between items-center bg-eden-800 shrink-0">
                <button onClick={onCancel} className="text-eden-100/50 hover:text-white font-bold px-4 py-2 transition-colors">Cancelar</button>
                <button onClick={handleConfirm} className="bg-energia hover:bg-yellow-400 text-eden-900 px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,176,5,0.3)] transition-all hover:scale-105">
                    CONFIRMAR EVOLUÇÃO
                </button>
            </div>
        </div>
    </div>
  );
}