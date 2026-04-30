import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { 
  Shield, Brain, Zap, Eye, BicepsFlexed, ArrowLeft, Save, 
  Swords, Backpack, Dice5, BookOpen, User, PenTool, Loader2, Ghost, RefreshCw, AlertTriangle, Check, Asterisk, Settings, Lock, Users, BookText, Lightbulb, Info
} from 'lucide-react';

import { CharacterProvider, useCharacter } from '../context/CharacterContext';
import type { CharacterSheet } from '../types/characterSchema';
import type { Attribute, Effect } from '../types/systemData'; 
import { solveFormulaNumber, calculateVariables } from '../utils/characterFormulas'; 

import SheetStatus from '../components/sheet/SheetStatus';
import SheetConditions from '../components/sheet/SheetConditions';
import SheetSkills from '../components/sheet/SheetSkills';
import SheetInventory from '../components/sheet/SheetInventory';
import SheetRituals from '../components/sheet/SheetRituals';
import SheetCombat from '../components/sheet/SheetCombat';
import SheetDescription from '../components/sheet/SheetDescription';
import SheetAbilities from '../components/sheet/SheetAbilities';
import SheetNotes from '../components/sheet/SheetNotes';
import SheetResumo from '../components/sheet/SheetResumo';
import SheetDicas from '../components/sheet/SheetDicas';
import LevelUpModal from '../components/leveling/LevelUpModal'; 

const ATTR_CONFIG: Record<string, { label: string, color: string, border: string, icon: any }> = {
  AGI: { label: 'Agilidade', color: 'text-yellow-400', border: 'border-yellow-400', icon: Zap },
  FOR: { label: 'Força', color: 'text-red-500', border: 'border-red-500', icon: BicepsFlexed },
  INT: { label: 'Intelecto', color: 'text-blue-400', border: 'border-blue-400', icon: Brain },
  PRE: { label: 'Presença', color: 'text-purple-400', border: 'border-purple-400', icon: Eye },
  VIG: { label: 'Vigor', color: 'text-green-500', border: 'border-green-500', icon: Shield }
};

const TABS = [
  { id: 'skills', label: 'Perícias', icon: Dice5 },
  { id: 'inventory', label: 'Inventário', icon: Backpack },
  { id: 'combat', label: 'Combate', icon: Swords },
  { id: 'rituals', label: 'Rituais', icon: BookOpen },
  { id: 'abilities', label: 'Habilidades', icon: Zap },
  { id: 'manual', label: 'Efeitos Ocultos', icon: Asterisk },
  { id: 'group', label: 'Grupo', icon: Users },
  { id: 'resumo', label: 'Resumo', icon: BookText },
  { id: 'dicas', label: 'Dicas Mestre', icon: Lightbulb },
  { id: 'notes', label: 'Anotações', icon: PenTool },
  { id: 'description', label: 'Roleplay', icon: User },
  { id: 'settings', label: 'Config.', icon: Settings },
];

function SheetGroup({ mesaId, currentId }: { mesaId: string, currentId: string }) {
    const [groupChars, setGroupChars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!mesaId) return;
        const q = query(collection(db, 'characters'), where('mesaId', '==', mesaId));
        const unsubscribe = onSnapshot(q, (snap) => {
            const chars: any[] = [];
            snap.forEach(doc => {
                const data = doc.data();
                if (data.isPrivate) return;
                if (doc.id === currentId) return;
                chars.push({ id: doc.id, ...data });
            });
            setGroupChars(chars);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [mesaId, currentId]);

    const getStatusInfo = (current: number, max: number) => {
        if (max <= 0) return { text: 'N/A', class: 'text-eden-100/30' };
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        if (pct <= 0) return { text: 'Crítico', class: 'text-red-500 font-black animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' };
        if (pct <= 25) return { text: 'Grave', class: 'text-orange-500 font-bold drop-shadow-[0_0_3px_rgba(249,115,22,0.5)]' };
        if (pct <= 50) return { text: 'Ruim', class: 'text-yellow-400 font-bold' };
        if (pct <= 75) return { text: 'Moderado', class: 'text-lime-400 font-bold' };
        if (pct <= 90) return { text: 'Ok', class: 'text-green-500 font-bold' };
        return { text: 'Ileso', class: 'text-teal-400 font-black' };
    };

    if (loading) return <div className="py-20 text-center text-eden-100/40 animate-pulse flex flex-col items-center"><Loader2 size={32} className="animate-spin mb-2 text-energia"/> Sincronizando sinais vitais...</div>;

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="text-cyan-400" /> Sinais Vitais da Equipe</h2>
                    <p className="text-[10px] uppercase text-eden-100/50 font-bold mt-1">Monitoramento em tempo real dos agentes públicos na missão.</p>
                </div>
                <div className="text-xs font-black bg-cyan-900/30 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/30">{groupChars.length} AGENTES</div>
            </div>

            {groupChars.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30 text-sm">Nenhum outro agente em campo no momento.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupChars.map(char => {
                        const safeChar = {
                            ...char,
                            inventory: char.inventory || [],
                            abilities: char.abilities || [],
                            classPowers: char.classPowers || [],
                            rituals: char.rituals || [],
                            conditions: char.conditions || [],
                            personal: char.personal || { nex: 5 },
                            attributes: char.attributes || { initial: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 } }
                        };
                        
                        let pvMaxCalc = 1, peMaxCalc = 1, sanMaxCalc = 1;
                        try {
                            const charVars = calculateVariables(safeChar as any);
                            pvMaxCalc = charVars.PV?.max || 1;
                            peMaxCalc = charVars.PE?.max || 1;
                            sanMaxCalc = charVars.SAN?.max || 1;
                        } catch(e) {
                            console.error("Falha ao processar os status de", char.personal?.name);
                        }

                        const pvMax = char.status?.pv?.max ?? pvMaxCalc;
                        const peMax = char.status?.pe?.max ?? peMaxCalc;
                        const sanMax = char.status?.san?.max ?? sanMaxCalc;

                        const currentPV = char.status?.pv?.current ?? pvMax;
                        const currentPE = char.status?.pe?.current ?? peMax;
                        const currentSAN = char.status?.san?.current ?? sanMax;

                        const pvInfo = getStatusInfo(currentPV, pvMax);
                        const peInfo = getStatusInfo(currentPE, peMax);
                        const sanInfo = getStatusInfo(currentSAN, sanMax);
                        const portrait = char.personal?.portraitUrl || char.info?.portraitUrl;

                        return (
                            <div key={char.id} className="bg-eden-950/80 border border-eden-700 rounded-xl p-4 flex gap-4 items-center shadow-lg hover:border-eden-500 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-black border-2 border-eden-600 overflow-hidden shrink-0 shadow-inner">
                                    {portrait ? <img src={portrait} className="w-full h-full object-cover" alt="Portrait"/> : <div className="w-full h-full flex items-center justify-center text-eden-100/20"><Ghost size={24}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-black text-base truncate mb-2">{char.personal?.name || char.info?.name || 'Desconhecido'}</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-black/40 border border-red-900/50 rounded-lg p-1.5 text-center flex flex-col justify-center">
                                            <div className="text-[9px] uppercase font-bold text-red-500/70 mb-0.5 leading-none">PV</div>
                                            <div className={`text-xs leading-none mt-1 ${pvInfo.class}`}>{pvInfo.text}</div>
                                        </div>
                                        <div className="bg-black/40 border border-yellow-900/50 rounded-lg p-1.5 text-center flex flex-col justify-center">
                                            <div className="text-[9px] uppercase font-bold text-yellow-500/70 mb-0.5 leading-none">PE</div>
                                            <div className={`text-xs leading-none mt-1 ${peInfo.class}`}>{peInfo.text}</div>
                                        </div>
                                        <div className="bg-black/40 border border-blue-900/50 rounded-lg p-1.5 text-center flex flex-col justify-center">
                                            <div className="text-[9px] uppercase font-bold text-blue-500/70 mb-0.5 leading-none">SAN</div>
                                            <div className={`text-xs leading-none mt-1 ${sanInfo.class}`}>{sanInfo.text}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="bg-eden-950/50 border border-eden-700/50 rounded-xl p-4 mt-6">
                <h4 className="text-[10px] uppercase font-black text-eden-100/40 mb-3 flex items-center gap-2"><Info size={14}/> Glossário de Monitoramento</h4>
                <div className="flex flex-wrap gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Ileso (100%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] text-eden-100/60 uppercase">Ok (90%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-lime-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Moderado (75%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Ruim (50%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-[10px] text-eden-100/60 uppercase">Grave (25%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><span className="text-[10px] text-eden-100/60 uppercase">Crítico (0%)</span></div>
                </div>
            </div>
        </div>
    );
}

function SheetSettings({ isMestre }: { isMestre: boolean }) {
    const { character, updateCharacter } = useCharacter();

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Settings className="text-energia" /> Configurações da Ficha</h2>
                <p className="text-[10px] uppercase text-eden-100/50 font-bold mt-1">Gerencie preferências, segurança e o acesso desta ficha.</p>
            </div>

            <div className="space-y-4 max-w-xl">
                
                <div className="bg-eden-950/50 p-4 md:p-6 rounded-xl border border-eden-700/50 space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-eden-700 pb-2"><Settings size={16} className="text-energia"/> Preferências</h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-white">Salvamento Automático</h4>
                            <p className="text-[10px] text-eden-100/40 mt-1 max-w-sm">Salva a ficha na nuvem silenciosamente a cada modificação, substituindo o botão manual.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={(character as any).autoSave || false}
                                onChange={e => updateCharacter(prev => ({...prev, autoSave: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-energia"></div>
                        </label>
                    </div>
                </div>

                <div className="bg-eden-950/50 p-4 md:p-6 rounded-xl border border-eden-700/50 space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-eden-700 pb-2"><Lock size={16} className="text-energia"/> Controle de Acesso</h3>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-eden-100/50 uppercase">Senha da Ficha (Opcional)</label>
                        <input
                            type="text"
                            value={(character as any).password || ''}
                            onChange={e => updateCharacter(prev => ({...prev, password: e.target.value}))}
                            placeholder="Deixe em branco para acesso público"
                            className="w-full bg-eden-900 border border-eden-600 rounded-lg p-3 text-sm text-white outline-none focus:border-energia"
                        />
                        <p className="text-[10px] text-eden-100/40">Se definida, qualquer pessoa que não seja você (ou o Mestre) precisará inseri-la para abrir a ficha.</p>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-eden-100/50 uppercase">Dica da Senha (Opcional)</label>
                        <input
                            type="text"
                            value={(character as any).passwordHint || ''}
                            onChange={e => updateCharacter(prev => ({...prev, passwordHint: e.target.value}))}
                            placeholder="Ex: Nome do meu cachorro"
                            className="w-full bg-eden-900 border border-eden-600 rounded-lg p-3 text-sm text-white outline-none focus:border-energia"
                        />
                    </div>
                </div>

                {isMestre && (
                    <div className="bg-red-950/20 p-4 md:p-6 rounded-xl border border-red-900/50 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2"><Shield size={16}/> Tomar Posse (Escudo do Mestre)</h4>
                            <p className="text-xs text-eden-100/50 mt-1 max-w-sm">Oculta essa ficha da área pública da mesa, permitindo que ela seja gerida exclusivamente pelo Mestre (como um NPC ou monstro).</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={(character as any).isPrivate || false}
                                onChange={e => updateCharacter(prev => ({...prev, isPrivate: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>
                )}
            </div>
        </div>
    )
}

function SheetManualEffects() {
    const { character, vars, updateCharacter } = useCharacter();

    let activeEffects: { source: string, effect: Effect }[] = [];
    if (character.customOrigin && (character.customOrigin as any).power?.effects) {
        (character.customOrigin as any).power.effects.forEach((e: any) => activeEffects.push({ effect: e, source: `Origem: ${character.customOrigin?.name}` }));
    }
    character.inventory.filter(i => (i as any).isEquipped).forEach(item => {
        if ((item as any).effects) activeEffects.push(...(item as any).effects.map((e: any) => ({ source: item.name, effect: e })));
    });
    const allAbilities = [...(character.classPowers || []), ...((character as any).abilities || [])];
    allAbilities.filter((p: any) => p.isActive).forEach((p: any) => {
        if (p.effects) activeEffects.push(...p.effects.map((e: Effect) => ({ source: p.name, effect: e })));
    });
    character.rituals.forEach(ritual => {
        if (ritual.normal?.isActive && ritual.normal.effects) activeEffects.push(...ritual.normal.effects.filter((e: any) => e.isActive !== false).map((e: Effect) => ({ source: ritual.name, effect: e })));
        if (ritual.discente?.isActive && ritual.discente.effects) activeEffects.push(...ritual.discente.effects.filter((e: any) => e.isActive !== false).map((e: Effect) => ({ source: ritual.name, effect: e })));
        if (ritual.verdadeiro?.isActive && ritual.verdadeiro.effects) activeEffects.push(...ritual.verdadeiro.effects.filter((e: any) => e.isActive !== false).map((e: Effect) => ({ source: ritual.name, effect: e })));
    });
    (character.conditions || []).filter(c => c.isActive && c.effects).forEach(c => activeEffects.push(...c.effects.map((e: any) => ({ source: c.name, effect: e }))));

    const manualEffects = activeEffects.filter(e => e.effect.category === 'manual');
    const instantEffects = activeEffects.filter(e => e.effect.category === 'instant_heal_damage');
    const gainedPowers = activeEffects.filter(e => e.effect.category === 'gain_power' || e.effect.category === 'override_power');

    const handleApplyInstant = (eff: Effect, source: string) => {
        const val = solveFormulaNumber(eff.value, vars, character, eff.id);
        const target = eff.targets[0]?.type; 
        
        updateCharacter(prev => {
            const newStatus = JSON.parse(JSON.stringify(prev.status)); 
            
            const applyChange = (statKey: 'pv' | 'pe' | 'san', amount: number, max: number) => {
                if (amount < 0) { 
                    let dmg = Math.abs(amount);
                    if (newStatus[statKey].temp > 0) {
                        if (dmg >= newStatus[statKey].temp) {
                            dmg -= newStatus[statKey].temp;
                            newStatus[statKey].temp = 0;
                        } else {
                            newStatus[statKey].temp -= dmg;
                            dmg = 0;
                        }
                    }
                    newStatus[statKey].current = Math.max(0, newStatus[statKey].current - dmg);
                } else { 
                    newStatus[statKey].current = Math.min(max, newStatus[statKey].current + amount);
                }
            };

            if (target === 'pv_current') applyChange('pv', val, vars.PV.max);
            if (target === 'pe_current') applyChange('pe', val, vars.PE.max);
            if (target === 'san_current') applyChange('san', val, vars.SAN.max);
            
            return { ...prev, status: newStatus };
        });
        alert(`Efeito Instantâneo [${source}] aplicado!\nModificação calculada: ${val >= 0 ? '+' : ''}${val} Pontos.`);
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Asterisk className="text-energia" /> Efeitos Ocultos</h2>
                <p className="text-[10px] uppercase text-eden-100/50 font-bold mt-1">Efeitos manuais, poderes extras e curas instantâneas ativos no momento.</p>
            </div>

            {instantEffects.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase border-b border-emerald-900 pb-2">Ações Instantâneas (Cura / Dano)</h3>
                    {instantEffects.map((item, idx) => (
                        <div key={idx} className="bg-emerald-900/10 border border-emerald-500/30 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-white">{item.effect.name || 'Efeito Instantâneo'}</div>
                                <div className="text-[10px] text-eden-100/50">Fonte: {item.source}</div>
                            </div>
                            <button onClick={() => handleApplyInstant(item.effect, item.source)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg">APLICAR</button>
                        </div>
                    ))}
                </div>
            )}

            {manualEffects.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-eden-100 uppercase border-b border-eden-700 pb-2">Efeitos de Texto / Roleplay</h3>
                    {manualEffects.map((item, idx) => (
                        <div key={idx} className="bg-eden-950/50 border border-eden-700/50 p-4 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] text-energia font-bold border border-energia/20">{item.source}</span>
                                <span className="font-bold text-sm text-white">{item.effect.name || 'Efeito Genérico'}</span>
                            </div>
                            <p className="text-xs text-eden-100/80 italic leading-relaxed whitespace-pre-wrap border-l-2 border-eden-600 pl-3">"{item.effect.textDescription}"</p>
                        </div>
                    ))}
                </div>
            )}

            {gainedPowers.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-purple-400 uppercase border-b border-purple-900 pb-2">Poderes / Itens Ganhos via Efeito</h3>
                    {gainedPowers.map((item, idx) => (
                        <div key={idx} className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <span className="bg-purple-900 text-purple-100 px-2 py-0.5 rounded text-[10px] font-bold">{item.source}</span>
                                <span className="font-bold text-sm text-white">{item.effect.payload?.name || 'Poder Desconhecido'}</span>
                            </div>
                            <p className="text-xs text-purple-200/80 mb-3">{item.effect.payload?.description}</p>
                            <div className="text-[10px] bg-black/40 px-2 py-1 rounded inline-block text-purple-300 border border-purple-500/20">{(item.effect.payload?.effects || []).length} efeito(s) mecânico(s) injetado(s) na sua ficha!</div>
                        </div>
                    ))}
                </div>
            )}

            {instantEffects.length === 0 && manualEffects.length === 0 && gainedPowers.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30 text-sm">
                    Nenhum efeito especial ativo no momento.
                </div>
            )}
        </div>
    );
}

function SheetContent() {
  const { id, mesaId } = useParams();
  const navigate = useNavigate();
  const { character, vars, updateCharacter } = useCharacter();
  
  const [activeTab, setActiveTab] = useState('combat');
  const [isSaving, setIsSaving] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [targetLevel, setTargetLevel] = useState(5);

  const [attachedAmmo, setAttachedAmmo] = useState<Record<string, string>>({});
  const [highUsageCounter, setHighUsageCounter] = useState<Record<string, number>>({});
  const [sceneUsageTracker, setSceneUsageTracker] = useState<Record<string, number>>({});

  const [mesa, setMesa] = useState<any>(null);
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveEnabled = (character as any).autoSave;

  useEffect(() => {
      if (mesaId) {
          getDoc(doc(db, 'mesas', mesaId)).then(snap => {
              if(snap.exists()) setMesa(snap.data());
          });
      }
  }, [mesaId]);

  const isMestre = auth.currentUser && mesa && auth.currentUser.uid === mesa.mestreId;

  
  useEffect(() => {
      if (!autoSaveEnabled || !id) return;

      setAutoSaveStatus('saving');
      const timer = setTimeout(async () => {
          try {
              const sanitizeData = (obj: any): any => {
                  if (Array.isArray(obj)) return obj.map(sanitizeData);
                  if (obj !== null && typeof obj === 'object') {
                      return Object.fromEntries( Object.entries(obj).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, sanitizeData(v)]) );
                  }
                  return obj;
              };
              const cleanData = sanitizeData(character);
              await updateDoc(doc(db, 'characters', id), cleanData);
              
              setAutoSaveStatus('saved');
              setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } catch(e) {
              console.error("AutoSave Error:", e);
              setAutoSaveStatus('idle');
          }
      }, 1500); 

      return () => clearTimeout(timer);
  }, [character, id, autoSaveEnabled]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const sanitizeData = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(sanitizeData);
        if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries( Object.entries(obj).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, sanitizeData(v)]) );
        }
        return obj;
      };

      const cleanData = sanitizeData(character);
      await updateDoc(doc(db, 'characters', id), cleanData);
      console.log("Ficha salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a ficha. Verifique o console para detalhes técnicos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndTurn = () => {
      updateCharacter(prev => {
          const newConds = prev.conditions.map(c => {
              if (c.isActive && c.turnsRemaining > 0) {
                  const newTurns = c.turnsRemaining - 1;
                  return { ...c, turnsRemaining: newTurns, isActive: newTurns > 0 };
              }
              return c;
          });
          return { ...prev, conditions: newConds };
      });
  };

  const handleEndScene = () => {
      if (!confirm("Finalizar a cena atual? Isso zerará o Contador de Tiros, processará as munições gastas e desativará Condições com duração de Cena.")) return;
      let updatesLog: string[] = [];

      updateCharacter(prev => {
          const newInventory = prev.inventory.map(item => {
              if (item.type !== 'ammo') return item;
              const ammoItem = item as any; 
              if (ammoItem.ammoDurationType !== 'scenes' && ammoItem.ammoDurationType !== undefined) return item;
              
              const usage = sceneUsageTracker[item.id] || 0;
              if (usage === 0) return item;

              const isCartucho = item.name.toLowerCase().includes('cartucho') || item.name.toLowerCase().includes('combust');
              const leftoversBonus = isCartucho ? 4 : 6;

              let newDuration = ammoItem.durationScenes || 0;
              let newLeftovers = ammoItem.leftovers || 0;

              if (usage <= 1) {
                  if (newDuration > 0) { newDuration -= 1; newLeftovers += leftoversBonus; updatesLog.push(`- ${item.name}: Uso Baixo! +${leftoversBonus} Sobras.`); }
              } else {
                  if (newDuration > 0) { newDuration -= 1; updatesLog.push(`- ${item.name}: Cena concluída. -1 pacote gasto.`); }
              }
              return { ...item, durationScenes: newDuration, leftovers: newLeftovers };
          });

          let conditionsCleared = 0;
          const newConds = prev.conditions.map(c => {
              if (c.isActive && c.durationType === 'cena') {
                  conditionsCleared++;
                  return { ...c, isActive: false };
              }
              return c;
          });
          
          if (conditionsCleared > 0) {
              updatesLog.push(`- ${conditionsCleared} condição(ões) de cena desativada(s).`);
          }

          return { ...prev, inventory: newInventory, conditions: newConds };
      });

      setSceneUsageTracker({}); 
      setHighUsageCounter({});
      
      if (updatesLog.length > 0) {
          alert("Resumo do Fim de Cena:\n\n" + updatesLog.join('\n'));
      }
  };

  const handleBackToHome = () => {
      if (autoSaveEnabled || confirm("Você salvou as suas alterações? Progresso não salvo será perdido. Deseja sair da ficha?")) {
          navigate(mesaId ? `/mesa/${mesaId}` : '/');
      }
  };

  const levelUpTasks = character.levelUpTasks || [];
  const hasPendingTasks = levelUpTasks.length > 0;
  const allTasksDone = levelUpTasks.every(t => t.isDone);

  const toggleTask = (taskId: string) => {
      updateCharacter(prev => ({
          ...prev,
          levelUpTasks: (prev.levelUpTasks || []).map(t => 
              t.id === taskId ? { ...t, isDone: !t.isDone } : t
          )
      }));
  };

  const concludeTasks = () => { updateCharacter(prev => ({ ...prev, levelUpTasks: [] })); };

  return (
    <div className="h-screen bg-eden-800 text-eden-100 flex flex-col font-sans overflow-hidden relative selection:bg-energia selection:text-eden-900">
      
      <header className="bg-eden-900 border-b border-eden-700 p-4 md:p-5 shrink-0 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 justify-between items-center">
          
          <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
            <button onClick={handleBackToHome} className="p-2 md:p-3 hover:bg-eden-800 rounded-xl transition-colors text-eden-100/50 hover:text-energia shrink-0">
                <ArrowLeft size={24} />
            </button>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-eden-600 shrink-0 bg-eden-800 flex items-center justify-center shadow-md">
                {character.personal.portraitUrl ? <img src={character.personal.portraitUrl} className="w-full h-full object-cover" alt="Avatar" /> : <User size={24} className="text-eden-100/50" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 md:gap-3">
                <input type="text" value={character.personal.name} onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, name: e.target.value}}))} placeholder="Nome do Personagem" className="bg-transparent border-b-2 border-transparent hover:border-eden-600 focus:border-energia outline-none text-xl md:text-3xl font-black text-white tracking-wide uppercase truncate flex-1 min-w-[100px] transition-colors" />
                <div className="flex items-center bg-yellow-500/10 border border-yellow-500/50 rounded-lg px-2 py-1 md:px-3 md:py-1.5 shadow-inner shrink-0" title="Pontos de Prestígio">
                    <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase mr-1.5 tracking-widest drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">PP</span>
                    <input type="number" value={character.personal.prestigePoints} onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, prestigePoints: Number(e.target.value)}}))} className="bg-transparent border-none outline-none text-sm md:text-lg text-yellow-400 font-black w-10 md:w-14 text-center"/>
                </div>
              </div>
              <div className="text-[11px] md:text-sm text-eden-100/50 font-mono mt-1 capitalize tracking-widest flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-white font-bold lowercase">@{character.personal.player || 'jogador'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-eden-100/80">{character.personal.origin || 'Sem Origem'}</span>
                <span>•</span>
                <span className="text-white">{character.personal.class || 'Sem Classe'}</span>
                
                {character.personal.nex >= 10 && (
                  <>
                    <span>•</span>
                    <input 
                        type="text" 
                        value={character.personal.trail || ''} 
                        onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, trail: e.target.value}}))} 
                        placeholder="Definir Trilha" 
                        className="bg-transparent border-b border-dashed border-eden-700 hover:border-energia focus:border-energia outline-none text-energia font-bold w-24 md:w-32 transition-colors placeholder:text-eden-100/30"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-3 md:gap-5">
             <div className="flex items-center gap-2 md:gap-3 bg-eden-950/50 border border-eden-700/80 p-1.5 md:p-2 rounded-xl shadow-inner shrink-0">
               <button onClick={() => { setTargetLevel(Math.max(5, character.personal.nex - 5)); setShowLevelUp(true); }} disabled={character.personal.nex <= 5} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-eden-100/30 hover:bg-red-900/30 hover:text-red-400 disabled:opacity-20 transition-all" title="Reduzir NEX"><span className="font-black text-2xl md:text-3xl leading-none mb-1">-</span></button>
               <div className="flex flex-col items-center px-2 md:px-3 min-w-[4rem] md:min-w-[5rem]"><span className="text-[10px] md:text-xs uppercase font-black text-energia/80 tracking-widest">NEX</span><span className="font-black text-xl md:text-2xl leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{character.personal.nex}%</span></div>
               <button onClick={() => { setTargetLevel(Math.min(99, character.personal.nex + 5)); setShowLevelUp(true); }} disabled={character.personal.nex >= 99} className="flex items-center justify-center gap-1.5 bg-energia text-eden-900 hover:bg-yellow-400 px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(250,176,5,0.4)] hover:shadow-[0_0_25px_rgba(250,176,5,0.6)] hover:scale-110 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none" title="Aumentar NEX">UP <Zap size={16} className="fill-eden-900 md:w-4 md:h-4"/></button>
             </div>
             
             {autoSaveEnabled ? (
                 <div className="flex-1 lg:flex-none flex items-center justify-center bg-eden-900/50 border border-eden-700 text-eden-100/50 px-4 py-3 md:px-6 md:py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest gap-2 shadow-inner">
                   {autoSaveStatus === 'saving' && <><Loader2 size={18} className="animate-spin text-energia"/> Salvando...</>}
                   {autoSaveStatus === 'saved' && <><Check size={18} className="text-green-500"/> Salvo na Nuvem</>}
                   {autoSaveStatus === 'idle' && <><Check size={18} className="text-eden-100/30"/> Salvo na Nuvem</>}
                 </div>
             ) : (
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 lg:flex-none justify-center bg-eden-800 border border-eden-600 hover:bg-energia hover:text-eden-900 text-white px-4 py-3 md:px-6 md:py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(250,176,5,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none group">
                   {isSaving ? <><Loader2 size={18} className="animate-spin text-energia"/> Salvando</> : <><Save size={18} className="text-energia group-hover:text-eden-900 transition-colors"/> Salvar Ficha</>}
                 </button>
             )}

          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 bg-eden-900 relative">
        <div className="max-w-7xl mx-auto space-y-6">
            
          {hasPendingTasks && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 md:p-6 rounded-2xl shadow-xl animate-in slide-in-from-top-4">
                  <h3 className="text-yellow-400 font-black flex items-center gap-2 mb-2 text-base md:text-lg uppercase tracking-wider"><AlertTriangle size={20} /> Ações Manuais Pendentes (NEX {character.personal.nex}%)</h3>
                  <p className="text-yellow-200/70 text-xs md:text-sm mb-4 leading-relaxed">Conclua as alterações que você registrou para o seu novo nível antes de prosseguir com a campanha.</p>
                  <div className="space-y-2 mb-6">
                      {levelUpTasks.map(t => (
                          <label key={t.id} className="flex items-center gap-3 cursor-pointer group bg-black/20 p-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all">
                              <div className={`w-5 h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${t.isDone ? 'bg-yellow-500 border-yellow-500 text-eden-900' : 'bg-eden-800 border-yellow-500/50 text-transparent group-hover:border-yellow-400'}`}><Check size={14} className="md:w-4 md:h-4"/></div>
                              <input type="checkbox" className="hidden" checked={t.isDone} onChange={() => toggleTask(t.id)} />
                              <span className={`text-sm md:text-base font-medium transition-colors ${t.isDone ? 'text-yellow-500/40 line-through' : 'text-yellow-100'}`}>{t.text}</span>
                          </label>
                      ))}
                  </div>
                  <button onClick={concludeTasks} disabled={!allTasksDone} className="w-full md:w-auto px-6 md:px-8 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest bg-yellow-500 text-eden-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"><Check size={18}/> CONCLUIR ALTERAÇÕES</button>
              </div>
          )}

          <SheetStatus />
          
          <div className="flex flex-col lg:flex-row gap-6">
            
            <div className="w-full lg:w-72 shrink-0 space-y-6 flex flex-col items-center lg:items-stretch">
               <div className="w-64 h-64 md:w-72 md:h-72 relative shrink-0">
                  <div className="absolute inset-0 bg-eden-800/50 rounded-full border border-eden-700 shadow-inner"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 w-24 h-24 bg-eden-900 rounded-full border-2 border-eden-600 shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-crosshair">
                     <span className="text-[10px] uppercase font-black text-eden-100/50 tracking-widest mb-1">NEX</span>
                     <span className="text-3xl font-black text-energia leading-none" style={{ textShadow: '0 0 15px rgba(250,176,5,0.4)' }}>{character.personal.nex}</span>
                  </div>
                  {Object.entries(ATTR_CONFIG).map(([key, config], i) => {
                     const angle = (i * 72 - 90) * (Math.PI / 180);
                     const radius = 100;
                     const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius;
                     const value = vars.ATTRS[key as Attribute] || 0;
                     return (
                        <div key={key} className="absolute flex flex-col items-center group cursor-pointer transition-all duration-300 hover:z-30" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}>
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-eden-900 border-2 ${config.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center relative group-hover:scale-110 transition-transform overflow-hidden`}><div className={`absolute inset-0 opacity-10 bg-current ${config.color}`}></div><span className={`text-xl md:text-2xl font-black ${config.color}`}>{value}</span></div>
                            <div className="absolute -bottom-6 bg-eden-900 border border-eden-700 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest shadow-lg opacity-80 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">{config.label}</div>
                        </div>
                     )
                  })}
               </div>
               
               <div className="w-full">
                 <div className="flex items-center gap-2 mb-3">
                     <button onClick={handleEndTurn} className="flex-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-eden-800 hover:bg-energia hover:text-eden-900 border border-eden-600 text-white py-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"><RefreshCw size={14}/> Encerrar Turno</button>
                     <button onClick={handleEndScene} className="flex-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-eden-800 hover:bg-yellow-500 hover:text-eden-900 border border-yellow-600/50 text-yellow-500 py-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"><RefreshCw size={14}/> Encerrar Cena</button>
                 </div>

                 {vars.PROFICIENCIAS && vars.PROFICIENCIAS.length > 0 && (
                     <div className="bg-eden-900/50 border border-eden-700/50 rounded-xl p-3 mb-4 shadow-inner">
                         <h4 className="text-[10px] uppercase font-bold text-eden-100/50 mb-2 flex items-center gap-1"><Shield size={12}/> Suas Proficiências</h4>
                         <div className="flex flex-wrap gap-1.5">
                             {Array.from(new Set(vars.PROFICIENCIAS)).map(p => {
                                 const map: any = { simples: 'Armas Simples', taticas: 'Armas Táticas', pesadas: 'Armas Pesadas', leves_armor: 'Proteções Leves', pesadas_armor: 'Proteções Pesadas' };
                                 return <span key={p} className="text-[9px] uppercase font-bold bg-eden-800 text-eden-100 px-2 py-1 rounded border border-eden-700">{map[p] || p}</span>
                             })}
                         </div>
                     </div>
                 )}

                 <SheetConditions />
               </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-4 bg-eden-800 p-2 rounded-xl border border-eden-700 mask-right shadow-sm">
                 {TABS.map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-4 md:px-0 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tighter flex flex-col items-center justify-center gap-1.5 transition-all shrink-0 md:flex-1 md:shrink-1 ${activeTab === tab.id ? 'bg-eden-900 text-white border border-eden-600 shadow-inner' : 'text-eden-100/40 border border-transparent hover:bg-eden-900/50 hover:text-eden-100/80'}`}>
                        <tab.icon size={16} /> <span className="whitespace-nowrap">{tab.label}</span>
                     </button>
                 ))}
              </div>
              
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl min-h-[600px] shadow-lg relative">
                 {activeTab === 'combat' && (
                     <SheetCombat 
                        attachedAmmo={attachedAmmo} setAttachedAmmo={setAttachedAmmo}
                        highUsageCounter={highUsageCounter} setHighUsageCounter={setHighUsageCounter}
                        setSceneUsageTracker={setSceneUsageTracker}
                     />
                 )}
                 {activeTab === 'skills' && <SheetSkills />}
                 {activeTab === 'abilities' && <SheetAbilities />}
                 {activeTab === 'inventory' && <SheetInventory />}
                 {activeTab === 'rituals' && <SheetRituals />}
                 {activeTab === 'description' && <SheetDescription />}
                 {activeTab === 'notes' && <SheetNotes />}
                 {activeTab === 'manual' && <SheetManualEffects />}
                 {activeTab === 'resumo' && <SheetResumo mesaId={mesaId || ''} />}
                 {activeTab === 'dicas' && <SheetDicas isMestre={!!isMestre} />}
                 {activeTab === 'group' && <SheetGroup mesaId={mesaId || ''} currentId={id || ''} />}
                 {activeTab === 'settings' && <SheetSettings isMestre={!!isMestre} />}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {showLevelUp && (
          <LevelUpModal targetNex={targetLevel} onConfirm={() => setShowLevelUp(false)} onCancel={() => setShowLevelUp(false)} />
      )}
    </div>
  );
}

export default function Sheet() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<CharacterSheet | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchChar = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'characters', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) setInitialData(snap.data() as CharacterSheet);
      } catch (e) {
        console.error("Erro ao buscar:", e);
      } finally { setLoading(false); }
    };
    fetchChar();
  }, [id]);

  if (loading) {
    return (
        <div className="h-screen bg-eden-900 flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="text-energia animate-spin" />
            <span className="text-eden-100/50 font-bold uppercase tracking-widest text-sm animate-pulse">Sincronizando Ficha...</span>
        </div>
    );
  }
  
  if (!initialData) {
    return (
        <div className="h-screen bg-eden-900 flex flex-col items-center justify-center gap-4 text-center">
            <Ghost size={64} className="text-red-500/50" />
            <h2 className="text-2xl font-black text-white">Personagem Não Encontrado</h2>
            <p className="text-eden-100/50">O documento foi apagado ou o link está incorreto.</p>
        </div>
    );
  }

  return (
    <CharacterProvider>
      <InitialDataInjector data={initialData} />
      <SheetContent />
    </CharacterProvider>
  );
}

function InitialDataInjector({ data }: { data: CharacterSheet }) {
  const { updateCharacter } = useCharacter();
  useEffect(() => { updateCharacter(data); }, []);
  return null;
}