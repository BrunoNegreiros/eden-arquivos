import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CharacterSheet, DamageType } from '../types/characterSchema';
import { 
  Shield, Brain, Zap, Eye, BicepsFlexed, Ghost, ArrowLeft, Edit2, Save, 
  Footprints, Swords, Backpack, Dice5, Plus, X, BookOpen, Play, User, Users, PenTool 
} from 'lucide-react';
// Componentes
import SheetStatus from '../components/sheet/SheetStatus';
import ConditionsCard from '../components/sheet/ConditionsCard';
import SheetSkills from '../components/sheet/SheetSkills';
import SheetInventory from '../components/sheet/SheetInventory';
import SheetRituals from '../components/sheet/SheetRituals';
import SheetCombat from '../components/sheet/SheetCombat';
import type { CombatState } from '../components/sheet/SheetCombat';
import SheetDescription from '../components/sheet/SheetDescription';
import SheetTeam from '../components/sheet/SheetTeam';
import SheetAbilities from '../components/sheet/SheetAbilities';
import SheetNotes from '../components/sheet/SheetNotes';
import LevelUpModal from '../components/leveling/LevelUpModal';
// Dados
import { DAMAGE_TYPES_INFO } from '../data/referenceData';
import { TRAILS } from '../data/trails';

const ATTR_CONFIG = {
  agi: { label: 'AGI', icon: Zap, color: 'text-yellow-400' },
  for: { label: 'FOR', icon: BicepsFlexed, color: 'text-red-500' },
  int: { label: 'INT', icon: Brain, color: 'text-blue-400' },
  pre: { label: 'PRE', icon: Eye, color: 'text-purple-400' },
  vig: { label: 'VIG', icon: Shield, color: 'text-green-500' },
};
const ATTRIBUTE_ORDER: (keyof typeof ATTR_CONFIG)[] = ['agi', 'for', 'int', 'pre', 'vig'];

// Configuração das Abas
const TABS_CONFIG = [
  { id: 'skills', label: 'Perícias', icon: Dice5 },
  { id: 'inventory', label: 'Inventário', icon: Backpack },
  { id: 'rituals', label: 'Rituais', icon: BookOpen },
  { id: 'combat', label: 'Combate', icon: Swords },
  { id: 'description', label: 'Descrição', icon: User },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'abilities', label: 'Habilidades', icon: Zap },
  { id: 'notes', label: 'Anotações', icon: PenTool },
] as const;

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]; };

export default function Sheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterSheet | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<typeof TABS_CONFIG[number]['id']>('skills');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPlayer, setTempPlayer] = useState('');

  const [showResistModal, setShowResistModal] = useState(false);
  const [selectedDmgType, setSelectedDmgType] = useState<string>(DAMAGE_TYPES_INFO[0].id);
  const [resistValue, setResistValue] = useState<string>('5');
  const [isImmune, setIsImmune] = useState(false);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [targetLevel, setTargetLevel] = useState(0);
  
  const [combatState, setCombatState] = useState<CombatState>({
      expandedWeapon: null,
      attackMode: {},
      unbridledMode: {},
      rollResult: null,
      damageMode: 'roll',
      attachedAmmo: {},
      ammoCounters: {},
      ammoLeftovers: {},
      ammoSceneTracker: {}
  });

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    async function fetchSheet() {
      try {
        const docRef = doc(db, "characters", id!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CharacterSheet;
          if (!data.status.sustainedIds) data.status.sustainedIds = [];
          if (data.progression.nex > 99) data.progression.nex = 99;
          
          setCharacter(data);
          setTempName(data.info.name);
          setTempPlayer(data.info.player);
        } else {
          alert("Ficha não encontrada!");
          navigate('/');
        }
      } catch (error) { console.error("Erro:", error); } finally { setLoading(false); }
    }
    fetchSheet();
  }, [id, navigate]);

  const handleUpdate = useCallback(async (updates: DeepPartial<CharacterSheet>) => {
    if (!character || !id) return;
    const updatedChar = { ...character, ...updates } as CharacterSheet;
    setCharacter(updatedChar);
    try { await updateDoc(doc(db, "characters", id), updates as any); } catch (e) { console.error(e); }
  }, [character, id]);

  const saveHeader = () => {
    handleUpdate({ info: { ...character!.info, name: tempName, player: tempPlayer } });
    setIsEditingHeader(false);
  };

  const handleNextTurn = () => {
      if (!character) return;
      const sustainedCount = character.status.sustainedIds?.length || 0;
      const peLoss = sustainedCount; 
      const newPE = Math.max(0, character.status.pe.current - peLoss);

      const updatedConditions = character.status.conditions.map(c => {
        if (c.durationType === 'turnos' && c.durationValue !== undefined) {
          return { ...c, durationValue: c.durationValue - 1 };
        }
        return c;
      }).filter(c => c.durationType !== 'turnos' || (c.durationValue !== undefined && c.durationValue > 0));

      handleUpdate({
          status: {
              ...character.status,
              pe: { ...character.status.pe, current: newPE },
              conditions: updatedConditions
          }
      });
      
      let msg = "Novo turno iniciado.";
      if (sustainedCount > 0) msg += `\n-${sustainedCount} PE por sustentação (${sustainedCount} ativos).`;
      if (character.status.conditions.length > 0) msg += `\nLembre-se de calcular efeitos das condições!`;
      alert(msg);
  };

  // --- LÓGICA DE REDUÇÃO DE NEX ---
  const handleUndoLevel = () => {
    if(!character) return;
    const currentNex = character.progression.nex;
    const prevNex = Math.max(5, currentNex - 5);
    
    if (currentNex === 5) return;

    if(!confirm(`ATENÇÃO: Você está prestes a rebaixar o NEX para ${prevNex}%.
    Isso reverterá status e removerá os últimos poderes adquiridos.`)) {
        return;
    }

    const updates: any = { 
        progression: { ...character.progression, nex: prevNex },
        status: { ...character.status },
        classPowers: { ...character.classPowers, selectedIds: [...character.classPowers.selectedIds] },
        attributes: { ...character.attributes },
        paranormalPowers: [...character.paranormalPowers]
    };

    const powerLevels = [15, 30, 45, 50, 60, 75, 90];
    if (powerLevels.includes(currentNex)) {
        if (updates.classPowers.selectedIds.length > 0) {
             const removedId = updates.classPowers.selectedIds.pop();
             if (removedId === 'transcender') {
                 const newLastIndex = updates.classPowers.selectedIds.length - 1;
                 if (newLastIndex >= 0 && updates.classPowers.selectedIds[newLastIndex] === 'transcender') {
                     updates.classPowers.selectedIds.pop(); 
                     if (updates.paranormalPowers.length > 0) updates.paranormalPowers.pop();
                 }
                 if (updates.paranormalPowers.length > 0) updates.paranormalPowers.pop();
             }
        }
    }

    let startPV = 20; let pvPerNex = 4;
    let startPE = 2;  let pePerNex = 2;
    let startSAN = 12; let sanPerNex = 3;

    if (character.progression.class === 'especialista') { 
        startPV = 16; pvPerNex = 3; startPE = 3; pePerNex = 3; startSAN = 16; sanPerNex = 4;
    }
    if (character.progression.class === 'ocultista') { 
        startPV = 12; pvPerNex = 2; startPE = 4; pePerNex = 4; startSAN = 20; sanPerNex = 5;
    }

    const attrHistory = character.progression.attributeIncreases || {};
    const attrAtThisLevel = attrHistory[currentNex];
    const currentVig = character.attributes.vig - (attrAtThisLevel === 'vig' ? 1 : 0);
    const currentPre = character.attributes.pre - (attrAtThisLevel === 'pre' ? 1 : 0);

    if (attrAtThisLevel) {
        updates.attributes[attrAtThisLevel] -= 1;
        const newHistory = { ...attrHistory };
        delete newHistory[currentNex];
        updates.progression.attributeIncreases = newHistory;
    }

    const levelsGained = (prevNex - 5) / 5; 
    
    const targetMaxPV = (startPV + currentVig) + (levelsGained * (pvPerNex + currentVig));
    const targetMaxPE = (startPE + currentPre) + (levelsGained * (pePerNex + currentPre));
    
    const totalTranscendCount = updates.classPowers.selectedIds.filter((id: string) => id === 'transcender').length;
    const targetMaxSAN = startSAN + (levelsGained * sanPerNex) - (totalTranscendCount * sanPerNex);

    updates.status.pv.max = targetMaxPV;
    updates.status.pv.current = Math.min(character.status.pv.current, targetMaxPV); 

    updates.status.pe.max = targetMaxPE;
    updates.status.pe.current = Math.min(character.status.pe.current, targetMaxPE);

    updates.status.san.max = targetMaxSAN;
    updates.status.san.current = Math.min(character.status.san.current, targetMaxSAN);

    if (currentNex === 50) updates.progression.affinity = null;
    if (currentNex === 10) {
        updates.progression.trail = '';
        const trailData = TRAILS.find(t => t.id === character.progression.trail);
        if (trailData) {
            const p10 = trailData.abilities.find(a => a.nex === 10);
            if (p10) updates.classPowers.selectedIds = updates.classPowers.selectedIds.filter((id: string) => id !== p10.name);
        }
    }
    if ([40, 65, 99].includes(currentNex)) {
         const trailData = TRAILS.find(t => t.id === character.progression.trail);
         if (trailData) {
             const ability = trailData.abilities.find(a => a.nex === currentNex);
             if (ability) updates.classPowers.selectedIds = updates.classPowers.selectedIds.filter((id: string) => id !== ability.name);
         }
    }
    if (currentNex === 25) updates.classPowers.coreLevel = Math.max(0, (character.classPowers.coreLevel || 0) - 1);

    handleUpdate(updates);
  };

  const calculateStats = () => {
    if (!character) return { def: 0, esquiva: 0, move: 0, movimentacoes: 0, peLimit: 0 };
    let def = 10 + character.attributes.agi + character.status.defense.passiveMod + character.status.defense.tempMod;
    let move = character.status.displacement.baseMetres + character.status.displacement.tempMod;
    let peLimit = Math.ceil(character.progression.nex / 5);

    character.status.conditions.forEach(c => {
        if (['Vulnerável', 'Caído', 'Atordoado', 'Desprevenido', 'Cego', 'Agarrado'].includes(c.name)) {
             const val = c.effects?.[0]?.value || 0;
             def -= val * -1; 
        }
        if (['Lento'].includes(c.name)) move /= 2;
        if (['Imóvel', 'Paralisado'].includes(c.name)) move = 0;
    });
    const movimentacoes = Math.floor(move / 1.5);
    return { def, move, movimentacoes, peLimit };
  };

  const handleAddResistance = () => {
    if (!character) return;
    const type = selectedDmgType as DamageType;
    const value = parseInt(resistValue) || 0;
    const newResistances = { ...character.status.resistances };
    let newImmunities = [...character.status.immunities];

    if (isImmune) {
        if (!newImmunities.includes(type)) newImmunities.push(type);
        delete newResistances[type];
    } else {
        newResistances[type] = value;
        newImmunities = newImmunities.filter(i => i !== type);
    }
    handleUpdate({ status: { ...character.status, resistances: newResistances, immunities: newImmunities } });
    setShowResistModal(false);
  };

  const removeResistance = (type: DamageType, isImmunity: boolean) => {
      if (!character) return;
      if (isImmunity) {
          handleUpdate({ status: { ...character.status, immunities: character.status.immunities.filter(i => i !== type) } });
      } else {
          const newRes = { ...character.status.resistances };
          delete newRes[type];
          handleUpdate({ status: { ...character.status, resistances: newRes } });
      }
  };

  if (loading || !character) return <div className="min-h-screen bg-eden-900 flex items-center justify-center text-eden-100">Carregando...</div>;

  const stats = calculateStats();
  const INPUT_STYLE = "w-full bg-eden-950 text-eden-100 border border-eden-700 rounded p-2 text-sm outline-none focus:border-energia placeholder-eden-100/30";

  return (
    <div className="min-h-screen bg-eden-900 text-eden-100 pb-20 font-sans selection:bg-energia selection:text-eden-900 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-eden-800/90 backdrop-blur-md border-b border-eden-700 p-2 md:p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto w-full">
            
            {/* LINHA 1: DISTRIBUIÇÃO */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-2 md:gap-6 w-full">
                
                {/* 1. ESQUERDA: IDENTIDADE */}
                <div className="flex items-center gap-2 md:gap-5 shrink-0 self-start xl:self-center w-full xl:w-auto justify-between xl:justify-start">
                    <button onClick={() => navigate('/')} className="p-1.5 md:p-2 hover:bg-eden-700 rounded-full transition-colors shrink-0 text-eden-100/50 hover:text-white"><ArrowLeft size={20} className="md:w-7 md:h-7" /></button>
                    
                    <div className="flex items-center gap-3 flex-1 xl:flex-none min-w-0">
                        <div className="relative group cursor-pointer shrink-0">
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-eden-500 bg-eden-900 shadow-lg">
                                {character.info.portraitUrl ? <img src={character.info.portraitUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Ghost size={24} className="md:w-8 md:h-8 text-eden-700"/></div>}
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            {isEditingHeader ? (
                                <div className="flex flex-col gap-1 md:gap-2 animate-in fade-in">
                                    <input value={tempName} onChange={e => setTempName(e.target.value)} className="bg-eden-950 border border-eden-600 rounded px-2 py-0.5 md:px-3 md:py-1 text-sm md:text-xl font-bold w-full text-eden-100 outline-none focus:border-energia" placeholder="Nome" style={{ colorScheme: 'dark' }} />
                                    <div className="flex gap-1 md:gap-2">
                                        <input value={tempPlayer} onChange={e => setTempPlayer(e.target.value)} className="bg-eden-950 border border-eden-600 rounded px-2 py-0.5 text-xs md:text-sm w-full text-eden-100 outline-none focus:border-energia" placeholder="Jogador" style={{ colorScheme: 'dark' }} />
                                        <button onClick={saveHeader} className="bg-energia text-eden-900 text-[10px] md:text-xs font-bold rounded px-2 py-0.5 flex items-center gap-1 hover:bg-yellow-400"><Save size={12}/> OK</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group relative">
                                    <h1 className="text-lg md:text-4xl font-black uppercase tracking-wide leading-none flex items-center gap-2 truncate text-white">
                                        {character.info.name || "Sem Nome"}
                                        <button onClick={() => setIsEditingHeader(true)} className="opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity p-0.5 hover:bg-eden-700 rounded text-eden-100/50"><Edit2 size={14} className="md:w-5 md:h-5"/></button>
                                    </h1>
                                    <div className="text-[10px] md:text-sm text-eden-100/60 font-mono flex flex-wrap gap-2 items-center mt-0.5 font-bold">
                                        <span className="truncate max-w-[100px]">{character.info.player || "Jogador"}</span>
                                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-eden-600"/>
                                        <span className="text-energia font-black uppercase tracking-wider truncate">{character.progression.class}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. CENTRO: ATRIBUTOS */}
                <div className="flex items-center justify-between w-full xl:w-auto bg-eden-950/60 px-4 py-2 md:px-8 md:py-3 rounded-xl border border-eden-700/50 shadow-inner backdrop-blur-sm shrink-0 gap-2 md:gap-6 xl:gap-10">
                    {ATTRIBUTE_ORDER.map((key) => {
                        const { color, label, icon: Icon } = ATTR_CONFIG[key];
                        return (
                            <div key={key} className="flex flex-col items-center gap-0.5 md:gap-1 min-w-[32px]">
                                <span className={`text-[8px] md:text-[10px] font-black tracking-widest ${color} flex items-center gap-0.5 uppercase opacity-80`}><Icon size={10} className="md:w-3 md:h-3" /> {label}</span>
                                <div className="text-xl md:text-4xl font-black text-eden-100 leading-none drop-shadow-lg">{character.attributes[key]}</div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. DIREITA: BOTÕES */}
                <div className="flex gap-2 md:gap-3 shrink-0 w-full xl:w-auto">
                     <button 
                          onClick={handleNextTurn}
                          className="h-10 md:h-16 px-3 md:px-6 flex-1 bg-eden-800 hover:bg-eden-700 text-eden-100 border-2 border-eden-600 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm flex flex-row xl:flex-col items-center justify-center gap-2 md:gap-1 transition-all hover:scale-105 shadow-lg active:scale-95"
                          title="Passar Turno"
                      >
                         <Play size={14} className="md:w-5 md:h-5" fill="currentColor" /> <span className="whitespace-nowrap">PRÓXIMO TURNO</span>
                      </button>
                      
                      {character.progression.nex < 99 && (
                          <button 
                              onClick={() => { setTargetLevel(character.progression.nex + 5); setShowLevelUp(true); }}
                              className="h-10 md:h-16 px-3 md:px-6 flex-1 bg-energia hover:bg-yellow-400 text-eden-900 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm flex flex-row xl:flex-col items-center justify-center gap-2 md:gap-1 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all hover:scale-105 active:scale-95"
                          >
                              <Plus size={16} className="md:w-6 md:h-6" strokeWidth={4} /> <span className="whitespace-nowrap">LEVEL UP</span>
                          </button>
                      )}
                </div>
            </div>

            {/* LINHA 2: STATUS SECUNDÁRIOS (GRID no Mobile para evitar overflow) */}
            <div className="w-full grid grid-cols-2 md:flex items-center md:justify-between bg-eden-950/40 border border-eden-700/50 rounded-xl px-2 py-2 md:px-8 md:py-3 mt-2 gap-2 md:gap-0">
                {/* NEX */}
                <div className="flex flex-col items-center justify-center relative group cursor-help md:flex-1 border-r border-eden-700/50 md:border-none">
                     <span className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-wider text-center mb-0.5">NEX</span>
                     <div className="text-lg md:text-2xl font-black text-white leading-none text-center relative">
                         {character.progression.nex}%
                         <button onClick={handleUndoLevel} className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:underline font-bold transition-opacity whitespace-nowrap bg-eden-900 px-1 rounded z-10">DESFAZER</button>
                     </div>
                </div>
                <div className="hidden md:block w-px h-8 bg-eden-700/50"></div>

                {/* PP */}
                <div className="flex flex-col items-center justify-center cursor-pointer hover:bg-eden-800/50 rounded px-2 md:px-4 transition-colors md:flex-1" onClick={() => {
                    const newPP = prompt("Novo valor de Prestígio:", character.progression.prestigePoints.toString());
                    if (newPP && !isNaN(parseInt(newPP))) handleUpdate({ progression: { ...character.progression, prestigePoints: parseInt(newPP) } });
                }}>
                     <span className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-wider text-center mb-0.5">PP</span>
                     <div className="text-lg md:text-2xl font-black text-conhecimento leading-none text-center">{character.progression.prestigePoints}</div>
                </div>
                <div className="hidden md:block w-px h-8 bg-eden-700/50"></div>

                {/* Limite PE */}
                <div className="flex flex-col items-center justify-center md:flex-1 border-t border-eden-700/50 md:border-none pt-2 md:pt-0 border-r md:border-r-0">
                     <span className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-wider text-center mb-0.5">Lim. PE</span>
                     <div className="text-lg md:text-2xl font-black text-yellow-500 leading-none text-center">{stats.peLimit}</div>
                </div>
                <div className="hidden md:block w-px h-8 bg-eden-700/50"></div>

                {/* Campanha */}
                <div className="flex flex-col items-center justify-center md:flex-1 min-w-0 border-t border-eden-700/50 md:border-none pt-2 md:pt-0">
                     <span className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-wider text-center mb-0.5">Missão</span>
                     <div className="text-xs md:text-sm font-bold text-white leading-none truncate w-full text-center py-1">{character.info.campaign || "-"}</div>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-2 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl flex justify-between items-center shadow-sm text-xs md:text-base">
             <div><div className="text-[8px] md:text-[10px] text-eden-100/50 uppercase tracking-wider font-bold">Trilha</div><div className="font-bold text-energia capitalize text-sm md:text-base">{character.progression.trail || 'Nenhuma'}</div></div>
             <div><div className="text-[8px] md:text-[10px] text-eden-100/50 uppercase tracking-wider font-bold text-right">Origem</div><div className="font-bold text-white capitalize text-sm md:text-base text-right">{character.progression.origin.name}</div></div>
          </div>
          
          <SheetStatus character={character} onUpdate={handleUpdate} />
          
          <div className="bg-eden-800 border border-eden-700 p-4 md:p-5 rounded-xl shadow-sm space-y-3 md:space-y-4">
             <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-eden-700">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-eden-950 rounded-lg border border-eden-600 text-eden-100 shadow-inner"><Shield size={20} className="md:w-6 md:h-6"/></div>
                    <div><div className="text-2xl md:text-3xl font-black leading-none text-white">{stats.def}</div><div className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-widest">Defesa</div></div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-right">
                    <div><div className="text-2xl md:text-3xl font-black leading-none text-white">{stats.move}m</div><div className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/40 tracking-widest">{stats.movimentacoes} Movimentos</div></div>
                    <div className="p-1.5 md:p-2 bg-eden-950 rounded-lg border border-eden-600 text-eden-100 shadow-inner"><Footprints size={20} className="md:w-6 md:h-6"/></div>
                </div>
             </div>
             
             <div className="text-[10px] md:text-xs text-eden-100/60">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-eden-100/30 tracking-widest">Resistências & Imunidades</span>
                    <button onClick={() => setShowResistModal(true)} className="p-1 hover:bg-eden-700 rounded text-eden-100/50 hover:text-energia transition-colors" title="Adicionar Resistência"><Plus size={12} className="md:w-3.5 md:h-3.5" /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                    {Object.entries(character.status.resistances).map(([k, v]) => v > 0 && (
                        <span key={k} className="group relative px-1.5 py-0.5 md:px-2 md:py-1 bg-eden-900 rounded border border-eden-700 capitalize text-[9px] md:text-xs font-medium text-eden-100 shadow-sm flex items-center gap-1">
                            {k} {v}
                            <button onClick={() => removeResistance(k as DamageType, false)} className="hidden group-hover:block ml-1 text-red-500 hover:text-red-400"><X size={10}/></button>
                        </span>
                    ))}
                    {character.status.immunities.map(i => (
                        <span key={i} className="group relative px-1.5 py-0.5 md:px-2 md:py-1 bg-energia/10 text-energia rounded border border-energia/30 capitalize text-[9px] md:text-xs font-bold shadow-sm flex items-center gap-1">
                             {i}
                            <button onClick={() => removeResistance(i, true)} className="hidden group-hover:block ml-1 text-red-500 hover:text-red-400"><X size={10}/></button>
                        </span>
                    ))}
                </div>
             </div>
          </div>
          <ConditionsCard character={character} onUpdate={handleUpdate} />
        </div>

        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* NAVEGAÇÃO DE ABAS (GRID) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 md:gap-2 bg-eden-800 p-1.5 md:p-2 rounded-xl border border-eden-700">
             {TABS_CONFIG.map((tab) => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    className={`w-full py-2 px-1 rounded-lg text-[10px] md:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 md:gap-1.5 transition-all ${activeTab === tab.id ? 'bg-eden-900 text-white shadow-sm border border-eden-600' : 'text-eden-100/50 hover:bg-eden-700/50 border border-transparent'}`}
                 >
                    <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                 </button>
             ))}
          </div>

          <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl min-h-[500px]">
             {activeTab === 'skills' && <SheetSkills character={character} onUpdate={handleUpdate} />}
             {activeTab === 'inventory' && <SheetInventory character={character} onUpdate={handleUpdate} />}
             {activeTab === 'rituals' && <SheetRituals character={character} onUpdate={handleUpdate} />}
             {activeTab === 'combat' && <SheetCombat character={character} onUpdate={handleUpdate} combatState={combatState} setCombatState={setCombatState} />}
             {activeTab === 'description' && <SheetDescription character={character} onUpdate={handleUpdate} />}
             {activeTab === 'team' && <SheetTeam character={character} onUpdate={handleUpdate} />}
             {activeTab === 'abilities' && <SheetAbilities character={character} onUpdate={handleUpdate} />}
             {activeTab === 'notes' && <SheetNotes character={character} onUpdate={handleUpdate} />}
          </div>
        </div>
      </main>

      {/* ... Modais ... (Código dos modais mantido igual ao anterior, pois já está responsivo) */}
      {showResistModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800/50">
                    <h3 className="font-bold text-eden-100">Adicionar Resistência</h3>
                    <button onClick={() => setShowResistModal(false)}><X size={20} className="text-eden-100/50 hover:text-eden-100"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-eden-100/50 uppercase font-bold mb-2">Tipo de Dano</label>
                        <select value={selectedDmgType} onChange={(e) => setSelectedDmgType(e.target.value)} className={INPUT_STYLE} style={{ colorScheme: 'dark' }}>
                            {DAMAGE_TYPES_INFO.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
              
                    <div className="flex items-center justify-between bg-eden-950 p-3 rounded border border-eden-700">
                        <label className="flex items-center gap-2 text-sm text-eden-100 cursor-pointer">
                            <input type="checkbox" checked={isImmune} onChange={e => setIsImmune(e.target.checked)} className="accent-energia w-4 h-4" /> Imunidade Total
                        </label>
                        {!isImmune && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-eden-100/50 font-bold uppercase">Valor</span>
                                <input type="number" value={resistValue} onChange={e => setResistValue(e.target.value)} className="w-16 bg-eden-900 text-eden-100 border border-eden-600 rounded p-1 text-center font-bold outline-none focus:border-energia" />
                            </div>
                        )}
                    </div>
                    <button onClick={handleAddResistance} className="w-full py-2 bg-energia text-eden-900 font-bold rounded hover:bg-yellow-400 transition-colors">Confirmar</button>
                </div>
            </div>
        </div>
      )}
      
      {showLevelUp && (
          <LevelUpModal 
              character={character} 
              targetNex={targetLevel}
              onConfirm={(updates) => {
                  handleUpdate(updates);
                  setShowLevelUp(false);
                  alert("NÍVEL AUMENTADO! Atualize seus PV/PE/SAN e verifique novos poderes.");
              }}
              onCancel={() => setShowLevelUp(false)}
          />
      )}
    </div>
  );
}