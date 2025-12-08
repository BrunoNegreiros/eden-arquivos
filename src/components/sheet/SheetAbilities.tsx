import { useState } from 'react';
import { 
  Book, Plus, Trash2, Info, Star, 
  Hexagon, ChevronUp, ChevronDown, Play, Settings, X, 
  Droplet, Eye, Zap, Skull, Ghost, Shield, Split, GraduationCap
} from 'lucide-react';
import type { CharacterSheet, CustomAbility, CustomEffect } from '../../types/characterSchema';
import { ORIGINS } from '../../data/origins';
import { CORE_CLASS_POWERS } from '../../data/coreClassPowers';
import { CLASS_POWERS } from '../../data/classPowers';
import { PARANORMAL_POWERS } from '../../data/paranormalPowers';
import { TRAILS } from '../../data/trails';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ELEMENT_CONFIG: Record<string, { icon: any, color: string, border: string, bg: string }> = {
    sangue: { icon: Droplet, color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10' },
    morte: { icon: Skull, color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-500/10' },
    conhecimento: { icon: Eye, color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10' },
    energia: { icon: Zap, color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-500/10' },
    medo: { icon: Ghost, color: 'text-white', border: 'border-white', bg: 'bg-white/10' }
};

export default function SheetAbilities({ character, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'class' | 'abilities' | 'paranormal' | 'custom'>('class');
  
  // Modais
  const [showClassPowerModal, setShowClassPowerModal] = useState(false);
  const [showParaPowerModal, setShowParaPowerModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<{ title: string, desc: string } | null>(null);

  // Estado Novo Custom Ability
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newCustom, setNewCustom] = useState<CustomAbility>({
      id: '', name: '', type: 'passive', description: '', effects: []
  });

  const myClassPowers = character.classPowers?.selectedIds || [];
  const myParaPowers = character.paranormalPowers || [];
  const myCustomAbilities = character.customAbilities || [];
  const coreLevel = character.classPowers?.coreLevel || 0;
  const nex = character.progression.nex;

  const originData = ORIGINS.find(o => o.name === character.progression.origin.name);
  const corePowerData = CORE_CLASS_POWERS.find(c => c.class === character.progression.class);
  const trailData = TRAILS.find(t => t.id === character.progression.trail);

  const affinity = character.progression.affinity;
  const affinityStyle = affinity ? ELEMENT_CONFIG[affinity] : null;

  const otherTrailsPowers = TRAILS
    .filter(t => t.id !== character.progression.trail) 
    .flatMap(t => t.abilities.map(a => ({...a, trailName: t.name})));
  const versatilityTrailPower = otherTrailsPowers.find(p => myClassPowers.includes(p.name));

  const isSpecialist = character.progression.class === 'especialista';
  const ecleticoDescription = (() => {
      if (nex < 40) return "Você pode gastar 2 PE para receber os benefícios de ser treinado em uma perícia que não possui até o final da cena.";
      if (nex < 75) return "Você pode gastar 2 PE para receber os benefícios de ser treinado em uma perícia. Se já for treinado, recebe +5 no teste. (NEX 40%)";
      return "Você pode gastar 2 PE para receber os benefícios de ser treinado em uma perícia. Se já for treinado, recebe +10 no teste (Veterano). (NEX 75%)";
  })();

  const allTrailPowerNames = TRAILS.flatMap(t => t.abilities.map(a => a.name));

  // Handlers
  const handleCoreLevelChange = (delta: number) => {
      const newLevel = Math.max(0, Math.min(3, coreLevel + delta));
      onUpdate({ classPowers: { ...character.classPowers, coreLevel: newLevel } });
  };

  const addClassPower = (id: string) => {
      onUpdate({ classPowers: { ...character.classPowers, selectedIds: [...myClassPowers, id] } });
  };

  const addParaPower = (id: string) => {
      onUpdate({ paranormalPowers: [...myParaPowers, id] });
  };

  const removeClassPower = (idx: number) => {
      if(!confirm("Remover habilidade?")) return;
      const newPowers = [...myClassPowers];
      newPowers.splice(idx, 1);
      onUpdate({ classPowers: { ...character.classPowers, selectedIds: newPowers } });
  };

  const removeParaPower = (idx: number) => {
      if(!confirm("Remover poder paranormal?")) return;
      const newPowers = [...myParaPowers];
      newPowers.splice(idx, 1);
      onUpdate({ paranormalPowers: newPowers });
  };

  // Custom Ability Logic
  const addEffectToCustom = () => {
      setNewCustom(prev => ({ ...prev, effects: [...prev.effects, { id: generateId(), name: '', type: 'bonus', target: 'PV' }] }));
  };

  const updateEffect = (idx: number, field: keyof CustomEffect, value: any) => {
      const newEffects = [...newCustom.effects];
      newEffects[idx] = { ...newEffects[idx], [field]: value };
      setNewCustom(prev => ({ ...prev, effects: newEffects }));
  };

  const removeEffect = (idx: number) => {
      const newEffects = newCustom.effects.filter((_, i) => i !== idx);
      setNewCustom(prev => ({ ...prev, effects: newEffects }));
  };

  const saveCustomAbility = () => {
      if (!newCustom.name) return alert("Nome obrigatório!");
      const abilityToSave = { ...newCustom, id: generateId() };
      onUpdate({ customAbilities: [...myCustomAbilities, abilityToSave] });
      setIsCreatingCustom(false);
      setNewCustom({ id: '', name: '', type: 'passive', description: '', effects: [] });
  };

  const removeCustomAbility = (id: string) => {
      if(!confirm("Deletar habilidade customizada?")) return;
      onUpdate({ customAbilities: myCustomAbilities.filter(a => a.id !== id) });
  };

  const useActiveAbility = (cost: number) => {
      if (character.status.pe.current < cost) return alert("PE Insuficiente!");
      onUpdate({ status: { ...character.status, pe: { ...character.status.pe, current: character.status.pe.current - cost } } });
      alert(`Habilidade usada! -${cost} PE`);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
      
      {/* MENU ABAS (Responsivo: Grid no Mobile, Flex no Desktop) */}
      <div className="grid grid-cols-2 md:flex md:gap-2 gap-2 mb-4 shrink-0">
          <button onClick={() => setActiveTab('class')} className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'class' ? 'bg-energia text-eden-900 shadow-md' : 'bg-eden-800 text-eden-100/60 border border-eden-700'}`}>Classe & Origem</button>
          <button onClick={() => setActiveTab('abilities')} className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'abilities' ? 'bg-conhecimento text-eden-900 shadow-md' : 'bg-eden-800 text-eden-100/60 border border-eden-700'}`}>Habilidades</button>
          <button onClick={() => setActiveTab('paranormal')} className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'paranormal' ? 'bg-sangue text-eden-100 shadow-md' : 'bg-eden-800 text-eden-100/60 border border-eden-700'}`}>Paranormal</button>
          <button onClick={() => setActiveTab('custom')} className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'custom' ? 'bg-morte text-white shadow-md' : 'bg-eden-800 text-eden-100/60 border border-eden-700'}`}>Outros / Custom</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          
          {/* TAB 1: CLASSE & ORIGEM */}
          {activeTab === 'class' && (
              <div className="space-y-4 md:space-y-6">
                  {/* AFINIDADE */}
                  {affinityStyle && (
                       <div className={`p-4 rounded-xl border-2 flex items-center justify-between shadow-lg ${affinityStyle.border} ${affinityStyle.bg}`}>
                           <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg bg-black/20 ${affinityStyle.color}`}>
                                    <affinityStyle.icon size={24} className="md:w-7 md:h-7" />
                               </div>
                               <div>
                                   <div className={`font-black text-base md:text-lg uppercase tracking-widest ${affinityStyle.color}`}>Afinidade: {affinity}</div>
                                   <div className="text-xs text-eden-100/80 leading-tight">Seus poderes deste elemento são aprimorados.</div>
                               </div>
                           </div>
                       </div>
                  )}

                  {/* ORIGEM */}
                  {originData && (
                      <div className="bg-eden-800 border border-eden-700 p-4 rounded-xl">
                          <h3 className="text-base md:text-lg font-bold text-eden-100 mb-2 flex items-center gap-2"><Book size={18} className="text-conhecimento"/> {originData.power.name}</h3>
                          <p className="text-xs md:text-sm text-eden-100/70 leading-relaxed">{originData.power.description}</p>
                      </div>
                  )}

                  {/* PODER DE CLASSE PRINCIPAL */}
                  {corePowerData && (
                      <div className="bg-eden-800 border border-eden-700 rounded-xl overflow-hidden">
                          <div className="p-3 md:p-4 bg-eden-900/50 border-b border-eden-700 flex justify-between items-center">
                              <div>
                                  <h3 className="text-base md:text-lg font-bold text-eden-100 flex items-center gap-2"><Star size={18} className="text-energia"/> {corePowerData.name}</h3>
                                  <div className="text-[10px] md:text-xs text-eden-100/50 font-bold uppercase tracking-wide">Habilidade de Classe</div>
                              </div>
                              <div className="flex gap-1 items-center bg-eden-950 p-1 rounded border border-eden-700">
                                  <button onClick={() => handleCoreLevelChange(-1)} disabled={coreLevel === 0} className="p-1 hover:bg-eden-700 disabled:opacity-30 text-eden-100 rounded"><ChevronDown size={14}/></button>
                                  <span className="font-mono text-sm font-bold w-4 text-center">{coreLevel + 1}</span>
                                  <button onClick={() => handleCoreLevelChange(1)} disabled={coreLevel === 3} className="p-1 hover:bg-eden-700 disabled:opacity-30 text-eden-100 rounded"><ChevronUp size={14}/></button>
                              </div>
                          </div>
                          <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                              <div className="relative">
                                  <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed bg-energia/5 border-l-2 border-energia pl-3 py-1">
                                      {corePowerData.levels[coreLevel]?.description}
                                  </p>
                                  {corePowerData.levels[coreLevel]?.cost && (
                                      <div className="text-[10px] md:text-xs font-bold text-energia mt-1">Custo: {corePowerData.levels[coreLevel].cost}</div>
                                  )}
                              </div>
                              {coreLevel < 3 && (
                                  <div className="opacity-50 pt-2 border-t border-eden-700/50 border-dashed">
                                      <div className="text-[10px] text-eden-100/50 font-bold uppercase mb-1">Próximo Nível:</div>
                                      <p className="text-[10px] md:text-xs text-eden-100/60 line-clamp-2">
                                          {corePowerData.levels[coreLevel + 1]?.description}
                                      </p>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  {/* ECLÉTICO */}
                  {isSpecialist && (
                      <div className="bg-eden-800 border border-eden-700 p-4 rounded-xl">
                          <h3 className="text-base md:text-lg font-bold text-eden-100 mb-2 flex items-center gap-2"><GraduationCap size={18} className="text-conhecimento"/> Eclético</h3>
                          <p className="text-xs md:text-sm text-eden-100/70 leading-relaxed">{ecleticoDescription}</p>
                      </div>
                  )}

                  {/* PODERES DE TRILHA */}
                  {trailData && (
                      <div className="bg-eden-800 border border-eden-700 p-4 rounded-xl">
                          <h3 className="text-base md:text-lg font-bold text-eden-100 mb-3 flex items-center gap-2"><Hexagon size={18} className="text-conhecimento"/> Trilha: {trailData.name}</h3>
                          <div className="space-y-3">
                              {trailData.abilities.map(ability => {
                                  const unlocked = character.progression.nex >= ability.nex;
                                  return (
                                      <div key={ability.name} className={`border-l-2 pl-3 ml-1 transition-all ${unlocked ? 'border-eden-500' : 'border-eden-700 opacity-40'}`}>
                                          <div className={`font-bold text-xs md:text-sm ${unlocked ? 'text-white' : 'text-eden-100/50'}`}>{ability.name} <span className="text-[9px] font-normal ml-2 opacity-60">{ability.nex}% NEX</span></div>
                                          <p className="text-[10px] md:text-xs text-eden-100/60 mt-1 leading-relaxed">{ability.description}</p>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )}

                  {/* VERSATILIDADE */}
                  {versatilityTrailPower && (
                      <div className="bg-eden-800 border-2 border-dashed border-energia/50 p-4 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-energia/20 text-energia text-[9px] font-bold px-2 py-1 rounded-bl">VERSATILIDADE</div>
                          <h3 className="text-base md:text-lg font-bold text-eden-100 mb-1 flex items-center gap-2"><Split size={18} className="text-energia"/> {versatilityTrailPower.name}</h3>
                          <p className="text-[10px] text-eden-100/40 font-bold mb-2 uppercase">Trilha: {versatilityTrailPower.trailName}</p>
                          <p className="text-xs md:text-sm text-eden-100/70 leading-relaxed">{versatilityTrailPower.description}</p>
                      </div>
                  )}
              </div>
          )}

          {/* TAB 2: HABILIDADES DE CLASSE */}
          {activeTab === 'abilities' && (
              <div className="space-y-3">
                  <button onClick={() => setShowClassPowerModal(true)} className="w-full py-3 border-2 border-dashed border-eden-700 rounded-xl text-eden-100/50 hover:border-conhecimento hover:text-conhecimento hover:bg-conhecimento/10 transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                      <Plus size={16}/> Adicionar Habilidade de Classe
                  </button>

                  {myClassPowers.map((id, idx) => {
                      if (id === 'transcender') return null;
                      const power = CLASS_POWERS.find(p => p.id === id);
                      const name = power ? power.name : id;
                      if (allTrailPowerNames.includes(name)) return null;
                      const desc = power ? power.description : 'Descrição indisponível.';
                      
                      return (
                          <div key={`${id}-${idx}`} className="bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl flex justify-between items-center group hover:border-conhecimento/50 transition-colors">
                              <div>
                                  <div className="font-bold text-eden-100 capitalize text-sm md:text-base">{name}</div>
                                  <div className="text-[10px] md:text-xs text-eden-100/60 mt-0.5 line-clamp-2">{desc}</div>
                              </div>
                              <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity pl-3">
                                  <button onClick={() => setViewingItem({ title: name, desc: desc })} className="p-1.5 bg-eden-900 rounded text-blue-400 hover:bg-blue-900/20"><Info size={16}/></button>
                                  <button onClick={() => removeClassPower(idx)} className="p-1.5 bg-eden-900 rounded text-red-500 hover:bg-red-900/20"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      )
                  })}
              </div>
          )}

          {/* TAB 3: PODERES PARANORMAIS */}
          {activeTab === 'paranormal' && (
              <div className="space-y-3">
                  <button onClick={() => setShowParaPowerModal(true)} className="w-full py-3 border-2 border-dashed border-eden-700 rounded-xl text-eden-100/50 hover:border-sangue hover:text-sangue hover:bg-sangue/10 transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                      <Plus size={16}/> Adicionar Poder Paranormal
                  </button>

                  {myParaPowers.map((id, idx) => {
                      const power = PARANORMAL_POWERS.find(p => p.id === id);
                      const name = power ? power.name : id;
                      const desc = power ? power.description : '';
                      const element = power?.element || 'medo';
                      const { icon: Icon, color } = ELEMENT_CONFIG[element] || ELEMENT_CONFIG.medo;

                      return (
                          <div key={`${id}-${idx}`} className="bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl flex justify-between items-center group hover:border-sangue/50 transition-colors">
                              <div>
                                  <div className={`font-bold ${color} flex items-center gap-2 text-sm md:text-base`}>
                                      <Icon size={16} /> {name}
                                  </div>
                                  <div className="text-[10px] md:text-xs text-eden-100/60 mt-0.5 line-clamp-2">{desc}</div>
                              </div>
                              <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity pl-3">
                                  <button onClick={() => setViewingItem({ title: name, desc: desc })} className="p-1.5 bg-eden-900 rounded text-blue-400 hover:bg-blue-900/20"><Info size={16}/></button>
                                  <button onClick={() => removeParaPower(idx)} className="p-1.5 bg-eden-900 rounded text-red-500 hover:bg-red-900/20"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      )
                  })}
              </div>
          )}

           {/* TAB 4: CUSTOM */}
           {activeTab === 'custom' && (
              <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-2 gap-3 text-[10px] md:text-xs">
                      <div className="bg-eden-900/50 p-3 rounded border border-eden-700/50">
                          <div className="font-bold text-eden-100/70 mb-1 flex items-center gap-2"><Shield size={12}/> Defesa Extra (Itens)</div>
                          <div className="text-energia font-mono text-base md:text-lg flex items-center gap-1">+0</div>
                      </div>
                      <div className="bg-eden-900/50 p-3 rounded border border-eden-700/50">
                          <div className="font-bold text-eden-100/70 mb-1">Bônus Formação</div>
                          <div className="text-conhecimento font-mono text-base md:text-lg">{character.teamStrategy.isFormationActive ? 'Ativo' : 'Inativo'}</div>
                      </div>
                  </div>

                  <button 
                    onClick={() => setIsCreatingCustom(true)} 
                    className="w-full py-3 md:py-4 bg-morte text-white font-black text-base md:text-lg rounded-xl hover:bg-zinc-400 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                      <Settings size={20}/> CRIAR HABILIDADE CUSTOMIZADA
                  </button>

                  <div className="space-y-3">
                      {myCustomAbilities.map(ability => (
                          <div key={ability.id} className="bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl space-y-2 hover:border-eden-500 transition-colors">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h4 className="font-bold text-eden-100 flex items-center gap-2 text-sm md:text-lg">
                                          {ability.name} 
                                          <span className="text-[9px] px-2 py-0.5 rounded bg-eden-900 text-eden-100/50 uppercase font-bold border border-eden-700">{ability.type}</span>
                                      </h4>
                                      <p className="text-[10px] md:text-sm text-eden-100/70 mt-1 leading-relaxed">{ability.description}</p>
                                  </div>
                                  <button onClick={() => removeCustomAbility(ability.id)} className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={18}/></button>
                              </div>
                              
                              {ability.effects.length > 0 && (
                                  <div className="space-y-1 bg-eden-950/30 p-2 rounded border border-eden-700/30">
                                      {ability.effects.map((ef, idx) => (
                                          <div key={idx} className="text-[10px] md:text-xs flex justify-between border-b border-eden-700/30 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                                              <span className="font-bold text-eden-100">{ef.name}:</span>
                                              <span className="text-energia font-mono text-right">{ef.type === 'other' ? ef.description : `${ef.value} (${ef.target})`}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              {ability.type === 'active' && ability.cost && (
                                  <button onClick={() => useActiveAbility(ability.cost!)} className="w-full py-2 bg-eden-700 hover:bg-energia hover:text-eden-900 text-eden-100 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-eden-600 shadow-sm">
                                      <Play size={12} fill="currentColor"/> Usar ({ability.cost} PE)
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* --- MODAIS (Responsivos e Centralizados) --- */}
      {(showClassPowerModal || showParaPowerModal) && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in zoom-in-95">
              <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                      <h3 className="font-bold text-lg text-eden-100">Selecionar {showClassPowerModal ? 'Habilidade' : 'Poder'}</h3>
                      <button onClick={() => { setShowClassPowerModal(false); setShowParaPowerModal(false); }}><X size={20}/></button>
                  </div>
                  <div className="p-4 overflow-y-auto custom-scrollbar space-y-2">
                      {(showClassPowerModal ? CLASS_POWERS : PARANORMAL_POWERS).map((p: any) => {
                          if (showClassPowerModal && p.class !== 'all' && p.class !== character.progression.class) return null;
                          let Icon = Star;
                          let colorClass = 'text-eden-100';
                          if (!showClassPowerModal) {
                              const config = ELEMENT_CONFIG[p.element];
                              if (config) { Icon = config.icon; colorClass = config.color; }
                          }
                          return (
                              <div key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-eden-700 bg-eden-950/50 hover:bg-eden-800 transition-colors group">
                                  <div className="flex-1 pr-3">
                                      <div className={`font-bold text-sm flex items-center gap-2 ${colorClass}`}>
                                          <Icon size={14} /> {p.name}
                                      </div>
                                      <div className="text-[10px] text-eden-100/60 mt-1 leading-snug">{p.description}</div>
                                  </div>
                                  <button 
                                    onClick={() => { showClassPowerModal ? addClassPower(p.id) : addParaPower(p.id); }}
                                    className="px-3 py-1.5 rounded-lg bg-eden-100 text-eden-900 text-[10px] font-bold hover:bg-white shadow-sm shrink-0"
                                  >
                                      Add
                                  </button>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}

      {viewingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in zoom-in-95">
              <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
                  <button onClick={() => setViewingItem(null)} className="absolute top-4 right-4 hover:text-white text-eden-100/50"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-eden-100 mb-4 border-b border-eden-700 pb-2">{viewingItem.title}</h3>
                  <div className="bg-eden-800 p-4 rounded-xl border border-eden-700">
                      <p className="text-sm text-eden-100/90 leading-relaxed whitespace-pre-line">{viewingItem.desc}</p>
                  </div>
              </div>
          </div>
      )}
      
      {isCreatingCustom && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in zoom-in-95">
              <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                      <h3 className="font-bold text-lg text-eden-100">Criar Habilidade</h3>
                      <button onClick={() => setIsCreatingCustom(false)}><X size={20}/></button>
                  </div>
                  <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
                      <input placeholder="Nome da Habilidade" value={newCustom.name} onChange={e => setNewCustom({...newCustom, name: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded p-3 text-eden-100 outline-none focus:border-energia text-sm" style={{colorScheme:'dark'}}/>
                      
                      <div className="flex gap-3">
                          <select value={newCustom.type} onChange={e => setNewCustom({...newCustom, type: e.target.value as any})} className="bg-eden-950 border border-eden-700 rounded p-2 text-eden-100 w-1/2 text-sm" style={{ colorScheme: 'dark' }}>
                              <option value="passive">Passiva</option>
                              <option value="active">Ativa</option>
                          </select>
                          {newCustom.type === 'active' && (
                              <input type="number" placeholder="Custo PE" value={newCustom.cost || ''} onChange={e => setNewCustom({...newCustom, cost: parseInt(e.target.value)})} className="bg-eden-950 border border-eden-700 rounded p-2 text-eden-100 w-1/2 text-sm" style={{ colorScheme: 'dark' }}/>
                          )}
                      </div>

                      <textarea placeholder="Descrição completa..." value={newCustom.description} onChange={e => setNewCustom({...newCustom, description: e.target.value})} className="w-full h-28 bg-eden-950 border border-eden-700 rounded p-3 text-eden-100 outline-none resize-none focus:border-energia text-sm" style={{colorScheme:'dark'}}/>

                      <div className="border-t border-eden-700 pt-4">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-xs text-eden-100/70 uppercase">Efeitos Mecânicos</h4>
                              <button onClick={addEffectToCustom} className="text-[10px] bg-eden-800 hover:bg-eden-700 px-3 py-1.5 rounded font-bold">+ Adicionar</button>
                          </div>
                          
                          <div className="space-y-2">
                              {newCustom.effects.map((ef, idx) => (
                                  <div key={ef.id} className="bg-eden-950 p-2 rounded border border-eden-700 space-y-2">
                                      <div className="flex gap-2">
                                          <input placeholder="Nome" value={ef.name} onChange={e => updateEffect(idx, 'name', e.target.value)} className="flex-1 bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-eden-100"/>
                                          <select value={ef.type} onChange={e => updateEffect(idx, 'type', e.target.value)} className="bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-eden-100 w-24">
                                              <option value="bonus">Bônus</option>
                                              <option value="penalty">Pena</option>
                                              <option value="other">Outro</option>
                                          </select>
                                          <button onClick={() => removeEffect(idx)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                      </div>

                                      {ef.type !== 'other' ? (
                                          <div className="flex gap-2">
                                              <select value={ef.target || 'PV'} onChange={e => updateEffect(idx, 'target', e.target.value)} className="flex-1 bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-eden-100">
                                                  <option value="PV">PV</option><option value="PE">PE</option><option value="SAN">SAN</option><option value="Defesa">Defesa</option><option value="Pericia">Perícia</option><option value="Resistencia">Resist.</option><option value="Carga">Carga</option>
                                              </select>
                                              <input placeholder="Valor" value={ef.value || ''} onChange={e => updateEffect(idx, 'value', e.target.value)} className="w-20 bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-eden-100"/>
                                          </div>
                                      ) : (
                                          <textarea placeholder="Descrição..." value={ef.description || ''} onChange={e => updateEffect(idx, 'description', e.target.value)} className="w-full h-12 bg-eden-900 border border-eden-700 rounded p-2 text-xs text-eden-100"/>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>

                      <button onClick={saveCustomAbility} className="w-full py-3 bg-energia text-eden-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg text-sm">SALVAR HABILIDADE</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}