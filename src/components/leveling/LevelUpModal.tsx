import { useState, useEffect } from 'react';
import { 
  ArrowRight, Zap, Eye, BicepsFlexed, 
  Ghost, Star, Sparkles, Droplet, Skull, CheckCircle2, Plus, X, Shield, Brain
} from 'lucide-react';
import type { CharacterSheet, AttributeKey } from '../../types/characterSchema';
import { TRAILS } from '../../data/trails';
import { CLASS_POWERS } from '../../data/classPowers';
import { PARANORMAL_POWERS } from '../../data/paranormalPowers';

interface Props {
  character: CharacterSheet;
  targetNex: number;
  onConfirm: (updates: Partial<CharacterSheet>) => void;
  onCancel: () => void;
}

type StepType = 'intro' | 'attributes' | 'trail_choose' | 'trail_power' | 'class_power' | 'team_power' | 'skills' | 'affinity' | 'summary';
const ATTRIBUTE_LIST: AttributeKey[] = ['agi', 'for', 'int', 'pre', 'vig'];

// Configuração Ícones Elementos
const ELEMENT_CONFIG: Record<string, { icon: any, color: string, border: string }> = {
    sangue: { icon: Droplet, color: 'text-red-500', border: 'border-red-500' },
    morte: { icon: Skull, color: 'text-zinc-400', border: 'border-zinc-500' },
    conhecimento: { icon: Eye, color: 'text-amber-400', border: 'border-amber-500' },
    energia: { icon: Zap, color: 'text-violet-400', border: 'border-violet-500' },
};

export default function LevelUpModal({ character, targetNex, onConfirm, onCancel }: Props) {
  // 1. ESTADOS
  const [selectedAttr, setSelectedAttr] = useState<AttributeKey | null>(null);
  const [selectedTrail, setSelectedTrail] = useState(character.progression.trail);
  const [autoTrailPower, setAutoTrailPower] = useState<string | null>(null);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  
  // Transcender / Poderes Paranormais
  const [transcendedPowers, setTranscendedPowers] = useState<string[]>([]); 
  const [showTranscendModal, setShowTranscendModal] = useState(false);
  
  // Afinidade / Versatilidade
  const [affinityChoice, setAffinityChoice] = useState<'none' | 'transcender' | 'versatility'>('none');
  const [selectedElement, setSelectedElement] = useState<string>('');
  const [affinityPower, setAffinityPower] = useState<string>(''); 
  const [showAffinityPowerModal, setShowAffinityPowerModal] = useState(false);
  
  // Versatilidade Específica
  const [versatilityType, setVersatilityType] = useState<'power' | 'trail' | null>(null);
  const [versatilitySelection, setVersatilitySelection] = useState<string>('');

  const [homebrewPlayer1, setHomebrewPlayer1] = useState(false);
  
  // Contagem prévia de transcender (histórico da ficha)
  const [prevTranscendenceCount] = useState(
      character.classPowers.selectedIds.filter(id => id === 'transcender').length
  );

  // --- CÁLCULO DE SLOTS ---
  const getAvailablePowerSlots = () => {
      const powerLevels = [15, 30, 45, 60, 75, 90];
      if (powerLevels.includes(targetNex)) {
          return homebrewPlayer1 ? 2 : 1;
      }
      return 0;
  };
  
  const slotsAvailable = getAvailablePowerSlots();

  // 2. GET STEPS
  const getSteps = () => {
      const steps: StepType[] = ['intro'];
      if ([20, 50, 80, 95].includes(targetNex)) steps.push('attributes');
      if (targetNex === 10 && !character.progression.trail) steps.push('trail_choose');
      if ([10, 40, 65, 99].includes(targetNex) && (character.progression.trail || selectedTrail)) steps.push('trail_power');
      if (getAvailablePowerSlots() > 0) steps.push('class_power');
      if (targetNex === 35 || targetNex === 70) steps.push('skills');
      if (targetNex === 50) steps.push('affinity');
      if (targetNex >= 15 && (targetNex - 5) % 10 === 0) steps.push('team_power');
      steps.push('summary');
      return steps.filter((v, i, a) => a.indexOf(v) === i);
  };

  const STEPS_ORDER = getSteps();
  const [step, setStep] = useState<StepType>('intro');
  const [history, setHistory] = useState<StepType[]>([]);

  // --- DETECTAR PODER DE TRILHA AUTOMÁTICO ---
  useEffect(() => {
      if ([10, 40, 65, 99].includes(targetNex)) {
          const trailId = selectedTrail || character.progression.trail;
          const trailData = TRAILS.find(t => t.id === trailId);
          const power = trailData?.abilities.find(a => a.nex === targetNex);
          if (power) setAutoTrailPower(power.name);
      }
  }, [targetNex, selectedTrail, character.progression.trail]);

  // --- CÁLCULOS DE STATUS (CORRIGIDO) ---
  const calculateAutoIncreases = () => {
      const levelsGained = (targetNex - character.progression.nex) / 5;
      
      // Valores Base por Nível
      let baseSan = 3;
      let pvGain = 2 + character.attributes.vig;
      let peGain = 2 + character.attributes.pre;
      
      if (character.progression.class === 'combatente') { 
          pvGain = 4 + character.attributes.vig; 
          peGain = 2 + character.attributes.pre; 
          baseSan = 3; 
      }
      if (character.progression.class === 'especialista') { 
          pvGain = 3 + character.attributes.vig; 
          peGain = 3 + character.attributes.pre; 
          baseSan = 4; 
      }
      if (character.progression.class === 'ocultista') { 
          pvGain = 2 + character.attributes.vig; 
          peGain = 4 + character.attributes.pre; 
          baseSan = 5; 
      }

      // Lógica de Sanidade
      let finalSanGain = baseSan * levelsGained;

      // Quantas vezes estou transcendendo NESTE level up?
      const currentTranscendingCount = transcendedPowers.length + (affinityChoice === 'transcender' ? 1 : 0);

      if (currentTranscendingCount > 0) {
          // Regra 1: Se transcender, não ganha a sanidade base.
          finalSanGain = 0;

          // Regra 2 (Homebrew): Se for a 2ª vez ou mais na vida, perde SAN.
          if (homebrewPlayer1) {
              const totalLifetimeCount = prevTranscendenceCount + currentTranscendingCount;
              
              if (totalLifetimeCount >= 2) {
                  // Perde o equivalente ao que ganharia (ex: -5)
                  finalSanGain = -(baseSan * levelsGained);
              }
          }
      }
      
      return {
          pv: Math.round(pvGain * levelsGained),
          pe: Math.round(peGain * levelsGained),
          san: Math.round(finalSanGain)
      };
  };

  const autoStats = calculateAutoIncreases();

  // --- ACTIONS ---
  const handleOpenTranscend = () => {
      if (selectedPowers.length + transcendedPowers.length >= slotsAvailable) return;
      setShowTranscendModal(true);
  };

  const handleRemoveTranscend = (index: number) => {
      // Ao remover, o estado muda, o componente re-renderiza e calculateAutoIncreases roda novamente
      // com transcendedPowers.length menor, corrigindo a SAN automaticamente.
      setTranscendedPowers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectParanormalPower = (powerId: string, isAffinityStep = false) => {
      if (isAffinityStep) {
          setAffinityPower(powerId);
          setShowAffinityPowerModal(false);
      } else {
          setTranscendedPowers(prev => [...prev, powerId]);
          setShowTranscendModal(false);
      }
  };

  const handlePowerSelect = (powerId: string) => {
      const maxPowers = slotsAvailable - transcendedPowers.length;
      if (selectedPowers.includes(powerId)) {
          setSelectedPowers(prev => prev.filter(id => id !== powerId));
      } else {
          if (selectedPowers.length < maxPowers) {
              setSelectedPowers(prev => [...prev, powerId]);
          }
      }
  };

  // --- NAVEGAÇÃO ---
  const nextStep = () => {
      if (step === 'attributes' && !selectedAttr) return alert("Escolha um atributo!");
      if (step === 'trail_choose' && !selectedTrail) return alert("Escolha uma trilha!");
      
      if (step === 'class_power') {
          const totalSelected = selectedPowers.length + transcendedPowers.length;
          if (totalSelected !== slotsAvailable) {
              return alert(`Você precisa preencher exatamente ${slotsAvailable} slot(s). Atualmente: ${totalSelected}.`);
          }
      }
      
      if (step === 'affinity') {
          if (affinityChoice === 'transcender') {
              if (!selectedElement) return alert("Escolha um elemento!");
              if (!affinityPower) return alert("Você precisa escolher um Poder Paranormal (ou Aprimoramento) ao despertar sua Afinidade!");
          }
          if (affinityChoice === 'versatility') {
              if (!versatilityType) return alert("Escolha o tipo de versatilidade!");
              if (!versatilitySelection) return alert("Escolha a habilidade/poder!");
          }
      }

      const currentStepIndex = STEPS_ORDER.indexOf(step);
      if (currentStepIndex < STEPS_ORDER.length - 1) {
          setHistory([...history, step]);
          setStep(STEPS_ORDER[currentStepIndex + 1]);
      } else {
          finalizeLevelUp();
      }
  };

  const finalizeLevelUp = () => {
      const updates: any = {
          progression: { ...character.progression, nex: targetNex },
          status: {
              ...character.status,
              pv: { ...character.status.pv, max: character.status.pv.max + autoStats.pv, current: character.status.pv.current + autoStats.pv },
              pe: { ...character.status.pe, max: character.status.pe.max + autoStats.pe, current: character.status.pe.current + autoStats.pe },
              san: { ...character.status.san, max: character.status.san.max + autoStats.san, current: character.status.san.current + autoStats.san },
          },
          attributes: character.attributes,
          classPowers: { ...character.classPowers, selectedIds: [...character.classPowers.selectedIds] },
          paranormalPowers: [...character.paranormalPowers]
      };

      if (selectedAttr) {
          updates.attributes = { 
              ...character.attributes, 
              [selectedAttr]: character.attributes[selectedAttr] + 1 
          };
          updates.progression.attributeIncreases = {
              ...(character.progression.attributeIncreases || {}),
              [targetNex]: selectedAttr
          };
      }

      if (selectedTrail) updates.progression.trail = selectedTrail;
      if (autoTrailPower) updates.classPowers.selectedIds.push(autoTrailPower);
      if (selectedPowers.length > 0) updates.classPowers.selectedIds.push(...selectedPowers);
      
      transcendedPowers.forEach(powerId => {
          updates.classPowers.selectedIds.push('transcender');
          if (!updates.paranormalPowers.includes(powerId)) {
               updates.paranormalPowers.push(powerId);
          }
      });

      if (targetNex === 25 && character.progression.nex === 20) {
          updates.classPowers.coreLevel = (character.classPowers.coreLevel || 0) + 1;
      }
      
      if (targetNex === 50) {
          if (affinityChoice === 'transcender') {
              updates.progression.affinity = selectedElement;
              updates.classPowers.selectedIds.push('transcender');
              if (!updates.paranormalPowers.includes(affinityPower)) {
                   updates.paranormalPowers.push(affinityPower);
              }
          } else if (affinityChoice === 'versatility') {
              updates.classPowers.selectedIds.push(versatilitySelection);
          }
      }

      onConfirm(updates);
  };
  
  const currentClass = character.progression.class;
  const ATTR_CONFIG: Record<AttributeKey, string> = { agi: 'AGI', for: 'FOR', int: 'INT', pre: 'PRE', vig: 'VIG' };
  const ATTR_ICONS: Record<AttributeKey, any> = { agi: Zap, for: BicepsFlexed, int: Brain, pre: Eye, vig: Shield };

  const availablePowers = CLASS_POWERS.filter(p => {
      const isClassMatch = p.class === 'all' || p.class === currentClass;
      const alreadyHas = character.classPowers.selectedIds.includes(p.id);
      const isRepeatable = p.id === 'treinamento_pericia' || p.id === 'aprender_ritual';
      return isClassMatch && (!alreadyHas || isRepeatable);
  });

  const versatilityPowers = availablePowers.filter(p => p.id !== 'transcender');

  const versatilityTrails = TRAILS.filter(t => 
      t.class === currentClass && 
      t.id !== (character.progression.trail || selectedTrail)
  );

  return (
    <div className="fixed inset-0 bg-eden-950/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-eden-900 border border-eden-600 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-eden-800 p-6 border-b border-eden-700 text-center relative shrink-0">
                <h2 className="text-3xl font-black text-eden-100 uppercase tracking-widest flex items-center justify-center gap-3">
                    <Sparkles className="text-energia" /> Subindo de NEX
                </h2>
                <div className="flex justify-center items-center gap-4 mt-2 text-xl font-mono">
                    <span className="text-eden-100/50">{character.progression.nex}%</span>
                    <ArrowRight className="text-energia"/>
                    <span className="text-white font-bold text-2xl">{targetNex}%</span>
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                 
                {step === 'intro' && (
                    <div className="text-center space-y-6">
                        <p className="text-eden-100/80 text-lg">O NEX está subindo. Seu corpo e mente se adaptam ao impossível.</p>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-4">
                             <div className="bg-eden-950 p-4 rounded border border-eden-700"><div className="text-red-500 font-black text-2xl">+{autoStats.pv}</div><div className="text-xs uppercase">PV Máx</div></div>
                             <div className="bg-eden-950 p-4 rounded border border-eden-700"><div className="text-yellow-500 font-black text-2xl">+{autoStats.pe}</div><div className="text-xs uppercase">PE Máx</div></div>
                             <div className="bg-eden-950 p-4 rounded border border-eden-700"><div className={`font-black text-2xl ${autoStats.san < 0 ? 'text-red-500' : 'text-blue-500'}`}>{autoStats.san > 0 ? '+' : ''}{autoStats.san}</div><div className="text-xs uppercase">SAN Máx</div></div>
                        </div>
                        <label className="flex items-center justify-center gap-2 cursor-pointer mt-4 bg-eden-950/50 p-3 rounded-lg border border-eden-700/50 hover:border-energia/50 transition-colors">
                            <input type="checkbox" checked={homebrewPlayer1} onChange={e => setHomebrewPlayer1(e.target.checked)} className="accent-energia w-5 h-5"/>
                            <div className="text-left">
                                <span className="text-sm font-bold text-white block">Ativar Homebrew "Jogador 1"</span>
                                <span className="text-xs text-eden-100/50">Permite 2 poderes/nível e transcender múltiplo (com custo de SAN).</span>
                            </div>
                        </label>
                    </div>
                )}
                {step === 'attributes' && (
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-6">Aprimoramento de Atributo</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {ATTRIBUTE_LIST.map((attr) => {
                                const Icon = ATTR_ICONS[attr];
                                const currentValue = character.attributes[attr];
                                const isMaxed = currentValue >= 5;
                                return (
                                    <button 
                                        key={attr} 
                                        onClick={() => setSelectedAttr(attr)} 
                                        disabled={isMaxed}
                                        className={`p-6 rounded-xl border-2 transition-all w-28 flex flex-col items-center gap-2 ${selectedAttr === attr ? 'border-energia bg-energia/20 text-white' : isMaxed ? 'border-eden-800 bg-eden-900 text-eden-100/20 cursor-not-allowed' : 'border-eden-700 bg-eden-800 text-eden-100/50 hover:border-eden-500'}`}
                                    >
                                        <Icon size={24}/>
                                        <span className="uppercase font-black text-sm">{ATTR_CONFIG[attr]}</span>
                                        <span className="text-3xl font-black">{currentValue + (selectedAttr === attr ? 1 : 0)}</span>
                                        {isMaxed && <span className="text-[10px] uppercase font-bold text-red-500">Máx</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {step === 'trail_choose' && (
                    <div>
                         <h3 className="text-xl font-bold text-white mb-4">Escolha sua Trilha</h3>
                         <div className="space-y-3">
                             {TRAILS.filter(t => t.class === currentClass).map(trail => (
                                 <button key={trail.id} onClick={() => setSelectedTrail(trail.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTrail === trail.id ? 'bg-energia/20 border-energia' : 'bg-eden-950 border-eden-700 hover:bg-eden-800'}`}>
                                     <span className="font-bold text-lg text-white">{trail.name}</span>
                                     <div className="text-xs text-eden-100/60 mt-1 line-clamp-2">{trail.abilities[0]?.description}</div>
                                 </button>
                             ))}
                         </div>
                    </div>
                )}
                 {step === 'trail_power' && (
                    <div>
                         <h3 className="text-xl font-bold text-white mb-4">Poder de Trilha ({targetNex}%)</h3>
                         <div className="bg-eden-950/50 p-6 rounded-xl border border-eden-700">
                              <div className="text-energia font-black text-lg mb-2 flex items-center gap-2">
                                  <Star size={20}/> {autoTrailPower || "Habilidade de Trilha"}
                              </div>
                              <div className="text-eden-100/80 text-sm">
                                  {TRAILS.find(t => t.id === (character.progression.trail || selectedTrail))?.abilities.find(a => a.nex === targetNex)?.description || "Descrição indisponível."}
                              </div>
                         </div>
                    </div>
                 )}

                {step === 'class_power' && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">Poderes de Classe ({targetNex}%)</h3>
                        
                        <div className="flex justify-between items-center p-4 bg-eden-950/50 rounded border border-eden-700">
                             <div>
                                <div className="font-bold text-white mb-1 flex items-center gap-2"><Ghost size={14} className="text-violet-400"/> Transcender</div>
                                <div className="text-xs text-eden-100/50">Ocupa 1 slot. Escolha um poder paranormal (ou ritual).</div>
                             </div>
                             <div className="flex items-center gap-2 flex-wrap justify-end">
                                 {transcendedPowers.map((pId, idx) => (
                                     <div key={idx} className="bg-violet-900/50 border border-violet-500 text-xs px-2 py-1 rounded flex items-center gap-1 animate-in fade-in zoom-in">
                                         {PARANORMAL_POWERS.find(p => p.id === pId)?.name || pId}
                                         <button onClick={() => handleRemoveTranscend(idx)}><X size={12} className="hover:text-red-500"/></button>
                                     </div>
                                 ))}
                                 <button onClick={handleOpenTranscend} className="p-1.5 bg-violet-600 hover:bg-violet-500 rounded text-white font-bold text-xs flex items-center gap-1 disabled:opacity-30" disabled={selectedPowers.length + transcendedPowers.length >= slotsAvailable}>
                                     <Plus size={14}/> Transcender
                                 </button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                             {availablePowers.filter(p => p.id !== 'transcender').map(p => (
                                <button key={p.id} onClick={() => handlePowerSelect(p.id)} className={`text-left p-3 rounded border transition-all ${selectedPowers.includes(p.id) ? 'bg-energia/20 border-energia' : 'bg-eden-950 border-eden-700'}`}>
                                    <div className="font-bold text-white">{p.name}</div>
                                    <div className="text-xs text-eden-100/50 line-clamp-1">{p.description}</div>
                                </button>
                             ))}
                        </div>
                        <div className="text-right text-xs font-bold mt-2 text-energia">
                            Slots usados: {selectedPowers.length + transcendedPowers.length} / {slotsAvailable}
                        </div>
                    </div>
                )}

                {step === 'skills' && <div className="bg-eden-950 p-6 rounded-xl border border-eden-700 text-center"><h3 className="text-xl font-bold text-white mb-2">Grau de Treinamento</h3><p className="text-eden-100/70 mb-4">Você pode aumentar o grau de {5 + character.attributes.int} perícias.</p><div className="text-xs text-energia bg-energia/10 p-2 rounded">Acesse a aba Perícias para aplicar manualmente.</div></div>}
                {step === 'team_power' && <div className="bg-eden-950 p-6 rounded-xl border border-eden-700 text-center"><h3 className="text-xl font-bold text-white mb-2">Ponto de Equipe</h3><p className="text-eden-100/70 mb-4">+1 Nível em Habilidade de Equipe.</p><div className="text-xs text-energia bg-energia/10 p-2 rounded">Acesse a aba Equipe para aplicar manualmente.</div></div>}
                
                {step === 'affinity' && (
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Escolha seu Caminho (NEX 50%)</h3>
                        <div className="flex justify-center gap-6 mb-6">
                             <button onClick={() => setAffinityChoice('transcender')} className={`p-4 md:p-6 rounded-xl border-2 w-36 md:w-40 flex flex-col items-center gap-2 transition-all ${affinityChoice === 'transcender' ? 'border-violet-500 bg-violet-500/20' : 'border-eden-700 hover:bg-eden-800'}`}>
                                 <Ghost size={24} className={affinityChoice === 'transcender' ? "text-violet-400" : "text-eden-100/30"}/>
                                 <span className="font-bold">AFINIDADE</span>
                             </button>
                            <button onClick={() => setAffinityChoice('versatility')} className={`h-auto p-4 md:p-6 rounded-xl border-2 w-36 md:w-40 flex flex-col items-center gap-2 transition-all break-words ${affinityChoice === 'versatility' ? 'border-energia bg-energia/20' : 'border-eden-700 hover:bg-eden-800'}`}>
                                <Star size={24} className={affinityChoice === 'versatility' ? "text-energia" : "text-eden-100/30"}/>
                                <span className="font-bold text-sm">VERSATILIDADE</span>
                            </button>
                        </div>

                        {affinityChoice === 'transcender' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-eden-100/60 mb-3">1. Escolha um elemento para criar afinidade:</p>
                                <div className="flex justify-center gap-2 flex-wrap mb-4">
                                  {['conhecimento', 'energia', 'morte', 'sangue'].map(el => {
                                    const config = ELEMENT_CONFIG[el];
                                    const isSelected = selectedElement === el;
                                    return <button key={el} onClick={() => setSelectedElement(el)} className={`px-4 py-2 rounded border uppercase text-sm flex items-center gap-2 transition-all ${isSelected ? `${config.color} ${config.border} bg-white/10 font-black` : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}>{config && <config.icon size={14}/>} {el}</button>
                                  })}
                                </div>
                                <p className="text-sm text-eden-100/60 mb-3">2. Escolha um poder (Conta como Transcender):</p>
                                <button 
                                    onClick={() => setShowAffinityPowerModal(true)} 
                                    className="px-6 py-3 bg-eden-900 border border-eden-600 rounded-lg hover:bg-eden-800 text-sm font-bold flex items-center justify-center gap-2 mx-auto w-full max-w-sm"
                                >
                                    {affinityPower ? (
                                        <>
                                            <CheckCircle2 size={16} className="text-green-500"/>
                                            {PARANORMAL_POWERS.find(p => p.id === affinityPower)?.name || affinityPower}
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16}/> Selecionar Poder / Aprimoramento
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {affinityChoice === 'versatility' && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 text-left max-w-lg mx-auto bg-eden-950/50 p-4 rounded-xl border border-eden-700">
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => { setVersatilityType('power'); setVersatilitySelection(''); }} className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${versatilityType === 'power' ? 'bg-eden-100 text-eden-900' : 'border-eden-700 text-eden-100/50'}`}>Poder de Classe</button>
                                    <button onClick={() => { setVersatilityType('trail'); setVersatilitySelection(''); }} className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${versatilityType === 'trail' ? 'bg-eden-100 text-eden-900' : 'border-eden-700 text-eden-100/50'}`}>Poder de Trilha</button>
                                </div>

                                {versatilityType === 'power' && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {versatilityPowers.map(p => (
                                            <button key={p.id} onClick={() => setVersatilitySelection(p.id)} className={`w-full text-left p-2 rounded border text-xs transition-all ${versatilitySelection === p.id ? 'bg-energia/20 border-energia' : 'bg-eden-900 border-eden-700'}`}>
                                                <div className="font-bold text-white">{p.name}</div>
                                                <div className="opacity-60 line-clamp-1">{p.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {versatilityType === 'trail' && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {versatilityTrails.map(t => {
                                            const firstPower = t.abilities.find(a => a.nex === 10);
                                            if (!firstPower) return null;
                                            return (
                                                <button key={t.id} onClick={() => setVersatilitySelection(firstPower.name)} className={`w-full text-left p-2 rounded border text-xs transition-all ${versatilitySelection === firstPower.name ? 'bg-energia/20 border-energia' : 'bg-eden-900 border-eden-700'}`}>
                                                    <div className="font-bold text-white">{t.name}: {firstPower.name}</div>
                                                    <div className="opacity-60 line-clamp-1">{firstPower.description}</div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 'summary' && (
                    <div className="text-center space-y-4">
                        <Ghost size={48} className="mx-auto text-energia"/>
                        <h3 className="text-2xl font-black text-white">Evolução Completa</h3>
                        <div className="text-left bg-eden-950 p-4 rounded border border-eden-700 text-sm space-y-2">
                            <div>• NEX: {targetNex}%</div>
                            <div>• Status: +{autoStats.pv} PV, +{autoStats.pe} PE, {autoStats.san >= 0 ? '+' : ''}{autoStats.san} SAN</div>
                            {selectedAttr && <div>• Atributo: {ATTR_CONFIG[selectedAttr].toUpperCase()} +1</div>}
                            {autoTrailPower && <div>• Poder Trilha: {autoTrailPower}</div>}
                            {selectedPowers.length > 0 && <div>• Poderes Classe: {selectedPowers.map(id => CLASS_POWERS.find(p => p.id === id)?.name).join(', ')}</div>}
                            {transcendedPowers.length > 0 && <div>• Transcender: {transcendedPowers.map(id => PARANORMAL_POWERS.find(p => p.id === id)?.name).join(', ')}</div>}
                            {affinityChoice === 'transcender' && <div>• Afinidade: {selectedElement.toUpperCase()} (+ Poder: {PARANORMAL_POWERS.find(p => p.id === affinityPower)?.name || affinityPower})</div>}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-eden-700 flex justify-between bg-eden-800">
                <button onClick={onCancel} className="text-eden-100/50 hover:text-white font-bold px-4">Cancelar</button>
                <button onClick={nextStep} className="bg-energia hover:bg-yellow-400 text-eden-900 px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50" disabled={
                    (step === 'attributes' && !selectedAttr) ||
                    (step === 'trail_choose' && !selectedTrail) ||
                    (step === 'class_power' && (selectedPowers.length + transcendedPowers.length) !== slotsAvailable) ||
                    (step === 'affinity' && affinityChoice === 'none') ||
                    (step === 'affinity' && affinityChoice === 'transcender' && (!selectedElement || !affinityPower)) ||
                    (step === 'affinity' && affinityChoice === 'versatility' && (!versatilityType || !versatilitySelection))
                }>
                    {step === 'summary' ? 'CONFIRMAR EVOLUÇÃO' : 'PRÓXIMO'} <ArrowRight size={18}/>
                </button>
            </div>
        </div>

        {/* MODAL SELEÇÃO DE PODER PARANORMAL */}
        {(showTranscendModal || showAffinityPowerModal) && (
            <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
                 <div className="bg-eden-900 border border-eden-600 w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                     <div className="p-4 border-b border-eden-700 flex justify-between items-center">
                         <h3 className="font-bold text-white">Escolha um Poder Paranormal</h3>
                         <button onClick={() => { setShowTranscendModal(false); setShowAffinityPowerModal(false); }}><X/></button>
                     </div>
                     <div className="p-4 overflow-y-auto custom-scrollbar space-y-2">
                         {PARANORMAL_POWERS.map(p => {
                             const config = ELEMENT_CONFIG[p.element];
                             const Icon = config ? config.icon : Ghost;
                             
                             const alreadyHas = character.paranormalPowers.includes(p.id) || transcendedPowers.includes(p.id);
                             const elementMatch = character.progression.affinity === p.element || selectedElement === p.element;
                             
                             if (alreadyHas && !elementMatch) return null;

                             return (
                                 <button key={p.id} onClick={() => handleSelectParanormalPower(p.id, showAffinityPowerModal)} className={`w-full text-left p-3 rounded border flex justify-between items-center ${config?.border} bg-eden-950 hover:bg-eden-800`}>
                                     <div className="flex items-center gap-3">
                                         <div className={`${config?.color}`}><Icon/></div>
                                         <div>
                                             <div className={`font-bold ${config?.color}`}>{p.name} {alreadyHas && "(Aprimorar)"}</div>
                                             <div className="text-[10px] text-eden-100/60 line-clamp-1">{p.description}</div>
                                         </div>
                                     </div>
                                     <Plus size={16} className={config?.color}/>
                                 </button>
                             )
                         })}
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
}