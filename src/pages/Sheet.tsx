import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { 
  Shield, Brain, Zap, Eye, BicepsFlexed, ArrowLeft, Save, 
  Swords, Backpack, Dice5, BookOpen, User, PenTool, Loader2, Ghost, RefreshCw, AlertTriangle, ChevronLeft, Check, Asterisk, Settings, Lock, Users, BookText, Lightbulb, Info
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
                if (data.isDead) return; 
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
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="text-cyan-400" /> Sinais Vitais da Equipe</h2>                    
                </div>                
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
                <h4 className="text-[10px] uppercase font-black text-eden-100/40 mb-3 flex items-center gap-2"><Info size={14}/> Legendas </h4>
                <div className="flex flex-wrap gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Ileso (100%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] text-eden-100/60 uppercase">Ok (90%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-lime-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Moderado (75%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div><span className="text-[10px] text-eden-100/60 uppercase">Ruim (50%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-[10px] text-eden-100/60 uppercase">Grave (1%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><span className="text-[10px] text-eden-100/60 uppercase">Crítico (0%)</span></div>
                </div>
            </div>
        </div>
    );
}

function SheetSettings({ isMestre }: { isMestre: boolean }) {
    const { character, updateCharacter } = useCharacter();
    const { mesaId } = useParams();
    const [mesa, setMesa] = useState<any>(null);
    
    useEffect(() => {
        if (mesaId) {
            getDoc(doc(db, 'mesas', mesaId)).then(snap => {
                if(snap.exists()) setMesa(snap.data());
            });
        }
    }, [mesaId]);

    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const isDead = (character as any).isDead ?? false;

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isHolding) {
            let currentProgress = 0;
            interval = setInterval(() => {
                currentProgress += 1;
                setHoldProgress(currentProgress);
                
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    setIsHolding(false);
                    
                    if (isDead) {
                        
                        updateCharacter(c => ({ 
                            ...c, 
                            isDead: false,
                            isPrivate: false 
                        }));
                        alert("O personagem retornou do mundo dos mortos.");
                    } else {
                        
                        updateCharacter(c => ({ 
                            ...c, 
                            isDead: true,
                            isPrivate: false, 
                            userId: mesa?.mestreId || c.userId 
                        }));
                        alert("Sua visão escurece. A ficha foi selada e enviada ao Cemitério da equipe.");
                    }
                }
            }, 100);
        } else {
            setHoldProgress(0);
        }
        return () => clearInterval(interval);
    }, [isHolding, updateCharacter, mesa, isDead]);

    const socialEnabled = (character as any).socialEnabled ?? true;
    const dashboardEnabled = (character as any).dashboardEnabled ?? true;

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Settings className="text-energia" /> Configurações da Ficha</h2>                
            </div>

            <div className="space-y-4 max-w-xl">
                
                <div className="bg-eden-950/50 p-4 md:p-6 rounded-xl border border-eden-700/50 space-y-5 shadow-inner">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-eden-700 pb-2"><Settings size={16} className="text-energia"/> Preferências e Privacidade</h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-white">Salvamento Automático</h4>
                            <p className="text-[10px] text-eden-100/40 mt-1 max-w-xs md:max-w-sm">Salva a ficha na nuvem silenciosamente a cada modificação, substituindo o botão manual.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={(character as any).autoSave || false}
                                onChange={e => updateCharacter(prev => ({...prev, autoSave: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-energia"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-t border-eden-800 pt-4">
                        <div>
                            <h4 className="text-sm font-bold text-white">Sincronizar com Dashboard</h4>
                            <p className="text-[10px] text-eden-100/40 mt-1 max-w-xs md:max-w-sm">Permite que a matemática da sua ficha seja lida e avaliada na aba de Nível Real do Cantinho da Equipe.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={dashboardEnabled}
                                onChange={e => updateCharacter(prev => ({...prev, dashboardEnabled: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-energia"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-t border-eden-800 pt-4">
                        <div>
                            <h4 className="text-sm font-bold text-white">Modo Social</h4>
                            <p className="text-[10px] text-eden-100/40 mt-1 max-w-xs md:max-w-sm">Habilita a participação do personagem no Chat estilo WhatsApp e os headers na página inicial da equipe.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={socialEnabled}
                                onChange={e => updateCharacter(prev => ({...prev, socialEnabled: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-energia"></div>
                        </label>
                    </div>
                </div>

                <div className="bg-eden-950/50 p-4 md:p-6 rounded-xl border border-eden-700/50 space-y-5 shadow-inner">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-eden-700 pb-2"><Lock size={16} className="text-energia"/> Controle de Acesso</h3>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-eden-100/50 uppercase">Senha da Ficha (Opcional)</label>
                        <input
                            type="text"
                            value={(character as any).password || ''}
                            onChange={e => updateCharacter(prev => ({...prev, password: e.target.value}))}
                            placeholder="Deixe em branco para acesso público"
                            className="w-full bg-eden-900 border border-eden-600 rounded-lg p-3 text-sm text-white outline-none focus:border-energia transition-colors"
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
                            className="w-full bg-eden-900 border border-eden-600 rounded-lg p-3 text-sm text-white outline-none focus:border-energia transition-colors"
                        />
                    </div>
                </div>

                {isMestre && (
                    <div className="bg-blue-950/20 p-4 md:p-6 rounded-xl border border-blue-900/50 flex items-center justify-between shadow-lg">
                        <div>
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><Shield size={16}/> Tomar Posse (Escudo do Mestre)</h4>
                            <p className="text-xs text-eden-100/50 mt-1 max-w-sm">
                                {isDead 
                                    ? 'Oculta esta ficha do Cemitério e transfere a guarda dela exclusivamente para o Escudo do Mestre.'
                                    : 'Oculta essa ficha da área pública da mesa, permitindo que ela seja gerida exclusivamente pelo Mestre.'}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={(character as any).isPrivate || false}
                                onChange={e => updateCharacter(prev => ({...prev, isPrivate: e.target.checked}))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-eden-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eden-100 after:border-eden-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                )}

                {isDead ? (
                    <div className="bg-green-950/20 p-4 md:p-6 rounded-xl border border-green-900/50 flex flex-col gap-4 mt-6 shadow-lg">
                        <div>
                            <h4 className="text-sm font-black text-green-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={18} /> Protocolo Lázaro (Ressurreição)</h4>
                            <p className="text-xs text-eden-100/50 mt-1 max-w-md">Retira a ficha do Cemitério e devolve o personagem à vida, restaurando seu status público e de combate na Base.</p>
                        </div>
                        <button 
                            onMouseDown={() => setIsHolding(true)}
                            onMouseUp={() => setIsHolding(false)}
                            onMouseLeave={() => setIsHolding(false)}
                            onTouchStart={() => setIsHolding(true)}
                            onTouchEnd={() => setIsHolding(false)}
                            className="relative w-full h-14 bg-green-950 border border-green-900 rounded-xl overflow-hidden group select-none shadow-md"
                        >
                            <div className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-100 ease-linear" style={{ width: `${holdProgress}%` }}></div>
                            <span className="relative z-10 font-black text-white uppercase text-xs md:text-sm tracking-widest flex items-center justify-center h-full drop-shadow-md">
                                {holdProgress > 0 ? `Segurando... ${Math.floor(holdProgress)}%` : 'Segure por 10s para Ressuscitar Personagem'}
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-red-950/20 p-4 md:p-6 rounded-xl border border-red-900/50 flex flex-col gap-4 mt-6 shadow-lg">
                        <div>
                            <h4 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={18} /> Área de Risco Fatal</h4>
                            <p className="text-xs text-eden-100/50 mt-1 max-w-md">Ao matar o personagem, a ficha será selada e ele é enviado ao Cemitério da equipe. Esta ação exige confirmação contínua.</p>
                        </div>
                        <button 
                            onMouseDown={() => setIsHolding(true)}
                            onMouseUp={() => setIsHolding(false)}
                            onMouseLeave={() => setIsHolding(false)}
                            onTouchStart={() => setIsHolding(true)}
                            onTouchEnd={() => setIsHolding(false)}
                            className="relative w-full h-14 bg-red-950 border border-red-900 rounded-xl overflow-hidden group select-none shadow-md"
                        >
                            <div className="absolute left-0 top-0 h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${holdProgress}%` }}></div>
                            <span className="relative z-10 font-black text-white uppercase text-xs md:text-sm tracking-widest flex items-center justify-center h-full drop-shadow-md">
                                {holdProgress > 0 ? `Segure para matar... ${Math.floor(holdProgress)}%` : 'Segure por 10s para Matar Personagem'}
                            </span>
                        </button>
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
  
  const [activeTab, setActiveTab] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [targetLevel, setTargetLevel] = useState(5);

  const [mesa, setMesa] = useState<any>(null);
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveEnabled = (character as any).autoSave;

  const isDead = (character as any).isDead ?? false;
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

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
    } catch (error) {
      alert("Erro ao salvar a ficha.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndTurn = () => {
      updateCharacter(prev => ({
          ...prev,
          conditions: prev.conditions.map(c => (c.isActive && c.turnsRemaining > 0) ? { ...c, turnsRemaining: c.turnsRemaining - 1, isActive: c.turnsRemaining - 1 > 0 } : c)
      }));
  };

  const handleEndScene = () => {
      if (!confirm("Finalizar cena?")) return;
      updateCharacter(prev => ({
          ...prev,
          inventory: prev.inventory.map(item => {
              if (item.type !== 'ammo') return item;
              const ammoItem = item as any;
              
              if (ammoItem.ammoDurationType !== 'scenes') return item;
              
              if ((ammoItem.durationScenes || 0) > 0) {
                  return { 
                      ...item, 
                      durationScenes: (ammoItem.durationScenes || 0) - 1, 
                      leftovers: (ammoItem.leftovers || 0) + (item.name.toLowerCase().includes('cartucho') ? 4 : 6),
                      sceneUsageCount: 0
                  };
              }
              return { ...item, sceneUsageCount: 0 };
          }),
          conditions: prev.conditions.map(c => (c.isActive && c.durationType === 'cena') ? { ...c, isActive: false } : c)
      }));
  };

  const handleBackToHome = () => {
      if (autoSaveEnabled || confirm("Sair da ficha?")) navigate(mesaId ? `/mesa/${mesaId}` : '/');
  };

  const concludeTasks = () => updateCharacter(prev => ({ ...prev, levelUpTasks: [] }));
  const toggleTask = (taskId: string) => updateCharacter(prev => ({ ...prev, levelUpTasks: (prev.levelUpTasks || []).map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t) }));

  
  const fullName = character.personal.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  let displayMobileName = fullName;
  if (nameParts.length > 1 && fullName.length > 10) {
      const initials = nameParts.slice(1).map((n: string) => n.charAt(0).toUpperCase() + '.').join(' ');
      displayMobileName = `${nameParts[0]} ${initials}`;
  }

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden relative ${isDead ? 'bg-red-950/20 text-red-100 selection:bg-red-500 selection:text-white' : 'bg-eden-800 text-eden-100 selection:bg-energia selection:text-eden-900'}`}>
      
      <header className={`${isDead ? 'bg-red-950 border-red-900' : 'bg-eden-900 border-eden-700'} border-b p-3 md:p-5 shrink-0 shadow-lg z-5 relative`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center lg:items-center gap-2 lg:gap-6 relative">
          
          <div className="hidden lg:flex items-center absolute -left-16 xl:-left-20 top-1/2 -translate-y-1/2">
              <button onClick={handleBackToHome} className="p-3 bg-eden-950 hover:bg-eden-800 rounded-xl transition-colors text-eden-100/50 hover:text-energia border border-eden-700/50 shadow-md">
                  <ArrowLeft size={24} />
              </button>
          </div>

          <div className="flex flex-row items-center gap-3 w-full lg:w-auto min-w-0 flex-1 justify-start h-full">
              {}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-eden-600 shrink-0 bg-eden-800 flex items-center justify-center shadow-md">
                  {character.personal.portraitUrl ? <img src={character.personal.portraitUrl} className={`${isDead ? 'filter grayscale sepia' : ''} w-full h-full object-cover`} alt="Avatar" /> : <User size={24} className="text-eden-100/50" />}
              </div>
              
              <div className="flex flex-col justify-center min-w-0 flex-1 lg:text-left relative py-1">
                  <div className="flex items-center justify-between lg:justify-start gap-2 relative group w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isDead && <span className="bg-red-900/50 border border-red-500 text-red-400 text-[8px] md:text-xs px-1.5 py-0.5 rounded uppercase font-black tracking-widest shadow-md shrink-0">Falecido</span>}
                          <div className="relative flex items-center justify-start min-w-0 flex-1">
                              <input 
                                  type="text" 
                                  value={character.personal.name} 
                                  onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, name: e.target.value}}))} 
                                  className="absolute inset-0 opacity-0 cursor-text w-full z-10 lg:hidden" 
                              />
                              <span className="lg:hidden text-xl md:text-xl font-black text-white tracking-wide uppercase truncate block">
                                  {displayMobileName}
                              </span>
                              <input 
                                  type="text" 
                                  value={character.personal.name} 
                                  onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, name: e.target.value}}))} 
                                  className="hidden lg:block bg-transparent border-b-2 border-transparent hover:border-eden-600 focus:border-energia outline-none text-2xl font-black text-white tracking-wide uppercase truncate w-full transition-colors relative z-5" 
                              />
                          </div>
                      </div>
                      
                      <button 
                          onClick={() => setIsInfoExpanded(!isInfoExpanded)} 
                          className="lg:hidden p-1.5 bg-eden-950 border border-eden-800 rounded-lg text-eden-100/50 hover:text-white shrink-0 z-20 flex items-center justify-center transition-colors"
                      >
                          <ChevronLeft size={16} className={`transition-transform duration-200 ${isInfoExpanded ? 'rotate-90' : '-rotate-90'}`} />
                      </button>
                  </div>
                  
                  {}
                  <div className={`overflow-x-auto whitespace-nowrap custom-scrollbar gap-3 items-center justify-start text-[12px] md:text-sm text-eden-100/50 font-mono mt-1 pb-1 w-full ${isInfoExpanded ? 'flex' : 'hidden lg:flex'}`}>
                      <span className="text-white font-bold shrink-0">{character.personal.player || 'Agente'}</span>
                      <span className="text-eden-700 shrink-0">|</span>
                      <span className="text-eden-100/80 shrink-0">{character.personal.origin || 'Sem Origem'}</span>
                      <span className="text-eden-700 shrink-0">|</span>
                      <span className="text-white shrink-0">{(character.personal.class || 'Mundano').charAt(0).toUpperCase() + (character.personal.class || 'Mundano').slice(1)}</span>
                      {character.personal.nex >= 10 && (
                          <><span className="text-eden-700 shrink-0">|</span><input type="text" value={character.personal.trail || ''} onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, trail: e.target.value}}))} placeholder="Trilha" className="bg-transparent hover:text-energia focus:text-energia outline-none text-energia/70 font-bold w-24 transition-colors placeholder:text-eden-100/30 shrink-0 text-left relative z-5" /></>
                      )}
                  </div>
              </div>
          </div>

          {}
          <div className="flex flex-row w-full lg:w-auto gap-0 lg:gap-3 pb-1 shrink-0 items-center justify-center lg:justify-end mt-1 lg:mt-0 pt-2 lg:pt-0 border-t border-eden-800 lg:border-none">
              
              {}
              <div className="flex flex-1 lg:flex-none flex-col lg:flex-row items-center justify-center lg:justify-between gap-1 lg:gap-4 lg:bg-eden-950/50 lg:border lg:border-eden-700/80 lg:p-2 lg:rounded-xl lg:shadow-inner">
                  <span className="text-[10px] lg:text-[10px] uppercase font-black text-energia/60 lg:text-energia/80 tracking-widest leading-none mb-1 lg:mb-0 lg:hidden">NEX</span>
                  
                  <div className="flex items-center justify-center gap-4 lg:gap-4 w-full lg:w-auto">
                      <button onClick={() => { setTargetLevel(Math.max(5, character.personal.nex - 5)); setShowLevelUp(true); }} className="text-eden-100/20 hover:text-red-400 transition-all shrink-0 lg:w-10 lg:h-10 lg:flex lg:items-center lg:justify-center lg:rounded">
                          <span className="font-black text-xl lg:text-3xl leading-none mb-1">-</span>
                      </button>

                      <div className="flex flex-col items-center lg:px-3">
                          <span className="hidden lg:block text-[10px] uppercase font-black text-energia/80 tracking-widest leading-none mb-0.5">NEX</span>
                          <span className="font-black text-2xl lg:text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] leading-none">{character.personal.nex}%</span>
                      </div>

                      {}
                      <button 
                        onClick={() => { setTargetLevel(Math.min(99, character.personal.nex + 5)); setShowLevelUp(true); }} 
                        className="text-energia hover:text-yellow-400 lg:hover:text-eden-900 transition-colors shrink-0 lg:bg-energia lg:text-eden-900 lg:px-4 lg:py-2.5 lg:rounded-lg lg:hover:bg-yellow-400 lg:shadow-[0_0_10px_rgba(250,176,5,0.4)]"
                      >
                          <span className="font-black text-2xl lg:hidden leading-none">+</span>
                          <div className="hidden lg:flex items-center gap-1.5 font-black text-xs uppercase tracking-widest">
                            UP <Zap size={14} className="fill-current"/>
                          </div>
                      </button>
                  </div>
              </div>

              {}
              <div className="w-[1px] h-8 bg-eden-700 lg:hidden mx-0"></div>

              {}
              <div className="flex flex-col flex-1 lg:flex-none items-center lg:justify-center lg:bg-yellow-500/10 lg:border lg:border-yellow-500/50 lg:rounded-xl lg:px-4 lg:py-2" title="Pontos de Prestígio">
                  {}
                  <span className="text-[10px] font-black text-yellow-500/60 lg:text-yellow-500 uppercase tracking-widest leading-none mb-1.5">PP</span>
                  {}
                  <input 
                    type="number" 
                    value={character.personal.prestigePoints} 
                    onChange={e => updateCharacter(prev => ({...prev, personal: {...prev.personal, prestigePoints: Number(e.target.value)}}))} 
                    className="bg-transparent border-none outline-none text-2xl lg:text-2xl text-yellow-400 font-black w-12 lg:w-16 text-center leading-none p-0"
                  />
              </div>
          </div>

        </div>
      </header>

      <button onClick={handleBackToHome} className="lg:hidden fixed bottom-6 left-4 w-12 h-12 flex items-center justify-center bg-eden-950 border border-eden-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl z-50 text-eden-100/50 active:scale-95 transition-all"><ArrowLeft size={24} /></button>
      <div className="fixed bottom-6 right-4 z-50 flex items-center">
          {autoSaveEnabled ? (
              <div className={`px-4 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] font-black text-[11px] md:text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${autoSaveStatus === 'saving' ? 'bg-eden-950 text-eden-100/50 border border-eden-800' : autoSaveStatus === 'saved' ? 'bg-green-950 text-green-500 border border-green-900' : 'opacity-0 pointer-events-none'}`}>
                 {autoSaveStatus === 'saving' ? <Loader2 size={14} className="animate-spin text-eden-100/30"/> : <Check size={14} />} {autoSaveStatus === 'saving' ? 'Salvando' : 'Salvo'}
              </div>
          ) : (
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-3 bg-eden-950 text-eden-100/50 border border-eden-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] font-black text-[11px] md:text-xs uppercase tracking-widest flex items-center gap-2 hover:text-energia active:scale-95 transition-all disabled:opacity-50">
                 {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Salvar
              </button>
          )}
      </div>

      <main className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 bg-eden-900 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {(character.levelUpTasks || []).length > 0 && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 md:p-6 rounded-2xl animate-in slide-in-from-top-4">
                  <h3 className="text-yellow-400 font-black flex items-center gap-2 mb-2 text-base md:text-lg uppercase"><AlertTriangle size={20} /> Ações NEX {character.personal.nex}%</h3>
                  <div className="space-y-2 mb-4">
                      {(character.levelUpTasks || []).map(t => (
                          <label key={t.id} className="flex items-center gap-3 cursor-pointer group bg-black/20 p-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${t.isDone ? 'bg-yellow-500 border-yellow-500 text-eden-900' : 'bg-eden-800 border-yellow-500/50'}`}><Check size={14}/></div>
                              <input type="checkbox" className="hidden" checked={t.isDone} onChange={() => toggleTask(t.id)} />
                              <span className={`text-sm ${t.isDone ? 'text-yellow-500/40 line-through' : 'text-yellow-100'}`}>{t.text}</span>
                          </label>
                      ))}
                  </div>
                  <button onClick={concludeTasks} disabled={!(character.levelUpTasks || []).every(t => t.isDone)} className="w-full md:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase bg-yellow-500 text-eden-900 disabled:opacity-50">Concluir Alterações</button>
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
              <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-4 bg-eden-800 p-2 rounded-xl border border-eden-700 mask-right shadow-sm pb-2">
                 {TABS.map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-4 md:px-0 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tighter flex flex-col items-center justify-center gap-1.5 transition-all shrink-0 md:flex-1 md:shrink-1 ${activeTab === tab.id ? 'bg-eden-900 text-white border border-eden-600 shadow-inner' : 'text-eden-100/40 border border-transparent hover:bg-eden-900/50 hover:text-eden-100/80'}`}>
                        <tab.icon size={16} /> <span className="whitespace-nowrap">{tab.label}</span>
                     </button>
                 ))}
              </div>
              
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl min-h-[600px] shadow-lg relative">
                 {activeTab === 'combat' && <SheetCombat />}
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