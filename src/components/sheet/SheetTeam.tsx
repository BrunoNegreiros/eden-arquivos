import { useState, useEffect } from 'react';
import { 
  Shield, Users, Heart, Crosshair, Search, Brain, Wrench, 
  Ghost, Save, Bomb, Dog, Trash2, Info, LayoutGrid, Lock, KeyRound, Square, CheckSquare 
} from 'lucide-react';
import type { CharacterSheet, TeamRole } from '../../types/characterSchema';
import { TEAM_ROLES, type TeamAbility } from '../../data/teamPowers';
import { CLASS_POWERS, type ClassPower } from '../../data/classPowers';
import { SKILL_LIST } from '../../data/referenceData';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

const ICONS: Record<string, any> = {
  tanque: Shield, suporte: Users, curandeiro: Heart, oportunista: Crosshair,
  investigador: Search, terapeuta: Brain, sabotador: Bomb, polivalente: Wrench, lobo_solitario: Dog
};

const SHAPE_STYLES: Record<number, string> = {
  1: 'rounded-full',
  2: 'rounded-full',
  3: 'rounded-full',
  4: 'rounded-full',
  5: 'rounded-md'
};

const ACTIVE_COLORS = {
  1: 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110',
  2: 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110',
  3: 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110',
  4: 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-110',
  5: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110'
};

const INACTIVE_STYLE = 'bg-eden-900/40 text-eden-100/10 border border-eden-700/30 hover:border-eden-500 cursor-pointer';
const ROMAN_NUMERALS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

export default function SheetTeam({ character, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'role' | 'formation' | 'selector'>('role');
  
  // Estados para Lobo Solitário
  const [selectedClassPowerId, setSelectedClassPowerId] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Estados para Formação
  const [currentFormation, setCurrentFormation] = useState<(string | null)[]>(Array(25).fill(null));
  const [selectedTool, setSelectedTool] = useState<'C' | 'E' | 'O' | 'X'>('C');
  
  // Info Hover
  const [hoveredInfo, setHoveredInfo] = useState<{ title: string, desc: string, level?: string } | null>(null);

  // Estados de Segurança (Senha)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Carregar formação salva
  useEffect(() => {
    if (character.teamStrategy.favoriteFormations && character.teamStrategy.favoriteFormations[0]) {
        const saved = character.teamStrategy.favoriteFormations[0].split(',');
        const parsed = saved.map(s => s === '' ? null : s);
        if (parsed.length === 25) setCurrentFormation(parsed);
    }
  }, []);

  const updateTeamStrategy = (updates: Partial<typeof character.teamStrategy>) => {
    onUpdate({
        teamStrategy: {
            ...character.teamStrategy,
            ...updates
        }
    });
  };

  const getMaxAbilityPoints = () => {
      return Math.floor((character.progression.nex + 5) / 10);
  };

  const getCurrentPointsUsed = () => {
      return character.teamStrategy.roleAbilities.reduce((acc, ab) => acc + ab.currentLevel, 0);
  };

  const handleRoleSelect = (roleId: string) => {
    if (confirm("ATENÇÃO: Mudar de função resetará todas as suas habilidades de equipe atuais. Deseja continuar?")) {
        updateTeamStrategy({ role: roleId as TeamRole, roleAbilities: [] });
        setSelectedClassPowerId('');
        setSelectedSkills([]);
        setActiveTab('role');
        setShowPasswordModal(false);
        setPasswordInput('');
    }
  };

  const handleAbilityChange = (abilityId: string, abilityName: string, newLevel: number) => {
    const currentAbilities = [...character.teamStrategy.roleAbilities];
    const existingIndex = currentAbilities.findIndex(a => a.id === abilityId);
    const currentLevel = existingIndex !== -1 ? currentAbilities[existingIndex].currentLevel : 0;

    if (newLevel > currentLevel) {
        const pointsUsed = getCurrentPointsUsed();
        const maxPoints = getMaxAbilityPoints();
        const cost = newLevel - currentLevel;

        if (pointsUsed + cost > maxPoints) {
            alert(`Limite de pontos atingido! Você tem ${pointsUsed}/${maxPoints} níveis alocados (Baseado em NEX ${character.progression.nex}%).`);
            return;
        }
    }

    if (newLevel === 0) {
        if (existingIndex !== -1) currentAbilities.splice(existingIndex, 1);
    } else {
        if (existingIndex !== -1) {
            currentAbilities[existingIndex].currentLevel = newLevel as any;
        } else {
            currentAbilities.push({ id: abilityId, name: abilityName, currentLevel: newLevel as any });
        }
    }
    updateTeamStrategy({ roleAbilities: currentAbilities });
  };

  const handleUnlockSelector = () => {
      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1; 
      const year = date.getFullYear();
      
      const magicNumber = day + month + year;

      if (passwordInput === magicNumber.toString()) {
          setActiveTab('selector');
          setShowPasswordModal(false);
          setPasswordInput('');
      } else {
          alert("Código de acesso incorreto. Acesso negado.");
      }
  };

  const availableClassPowers = CLASS_POWERS.filter((p: ClassPower) => 
    (p.class === character.progression.class || p.class === 'all') && p.id !== 'transcender'
  );

  const addLoneWolfPower = () => {
      if (!selectedClassPowerId) return;
      const power = CLASS_POWERS.find(p => p.id === selectedClassPowerId);
      if (!power) return;
      
      if (power.needsSelection === 'skills' && selectedSkills.length !== 2) {
          alert("Selecione exatamente 2 perícias.");
          return;
      }

      const newPowerEntry = {
          nexSource: character.progression.nex,
          powerId: power.id,
          powerName: power.name + (selectedSkills.length ? ` (${selectedSkills.join(', ')})` : '')
      };

      updateTeamStrategy({
          loneWolf: {
              ...character.teamStrategy.loneWolf,
              isActive: true,
              extraPowersChosen: [...character.teamStrategy.loneWolf.extraPowersChosen, newPowerEntry]
          }
      });
      
      setSelectedClassPowerId('');
      setSelectedSkills([]);
  };

  const removeLoneWolfPower = (index: number) => {
      const newPowers = [...character.teamStrategy.loneWolf.extraPowersChosen];
      newPowers.splice(index, 1);
      updateTeamStrategy({
          loneWolf: { ...character.teamStrategy.loneWolf, extraPowersChosen: newPowers }
      });
  };

  const handleGridClick = (index: number) => {
    const newGrid = [...currentFormation];
    if (selectedTool === 'X') newGrid[index] = null;
    else newGrid[index] = selectedTool;
    setCurrentFormation(newGrid);
  };

  const saveFormation = (slot: 1 | 2) => {
    const formationString = currentFormation.map(c => c || '').join(',');
    const newFavs = [...(character.teamStrategy.favoriteFormations || [])];
    while(newFavs.length < 2) newFavs.push(""); 
    
    if (slot === 1) newFavs[0] = formationString;
    else newFavs[1] = formationString;

    updateTeamStrategy({ favoriteFormations: newFavs });
    alert(`Formação salva no Slot ${slot}!`);
  };

  const loadFormation = (slot: 1 | 2) => {
      const favs = character.teamStrategy.favoriteFormations || [];
      const target = slot === 1 ? favs[0] : favs[1];
      
      if (!target) {
          alert("Slot vazio.");
          return;
      }

      const parsed = target.split(',').map(s => s === '' ? null : s);
      if (parsed.length === 25) setCurrentFormation(parsed);
  };

  const toggleFormationActive = () => {
      updateTeamStrategy({ isFormationActive: !character.teamStrategy.isFormationActive });
  };

  const currentRoleData = TEAM_ROLES.find(r => r.id === character.teamStrategy.role);
  const RoleIcon = currentRoleData ? (ICONS[currentRoleData.id] || Shield) : Shield;
  const isLoneWolf = character.teamStrategy.role === 'lobo_solitario';

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
      
      {/* MENU DE ABAS (Mobile: Grid, Desktop: Flex) */}
      <div className="grid grid-cols-2 md:flex md:justify-center gap-2 md:gap-4 mb-4 md:mb-6 shrink-0">
        <button onClick={() => setActiveTab('role')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'role' ? 'bg-energia text-eden-900 shadow-md' : 'bg-eden-800 text-eden-100 border border-eden-700'}`}>
            <Users size={14} className="md:w-4 md:h-4"/> Habilidades
        </button>
        <button onClick={() => setActiveTab('formation')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'formation' ? 'bg-conhecimento text-eden-900 shadow-md' : 'bg-eden-800 text-eden-100 border border-eden-700'}`}>
            <LayoutGrid size={14} className="md:w-4 md:h-4"/> Formação
        </button>
        <button onClick={() => setShowPasswordModal(true)} className={`col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'selector' ? 'bg-red-500 text-white shadow-md' : 'bg-eden-900/50 text-eden-100/50 border border-eden-700 hover:text-red-400 hover:border-red-500/50'}`}>
            <Lock size={12} className="md:w-3.5 md:h-3.5"/> Alterar Função
        </button>
      </div>

      {/* MODAL DE SENHA */}
      {showPasswordModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in zoom-in-95">
              <div className="bg-eden-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                          <Lock size={32} className="text-red-500" />
                      </div>
                      <h3 className="text-2xl font-black text-eden-100 mb-2">Área Restrita</h3>
                      <p className="text-xs text-red-200/80">Requer autorização do Mestre.</p>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-eden-100/50 uppercase mb-1 block">Código de Autorização</label>
                          <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/30" size={16} />
                              <input 
                                  type="number" 
                                  autoFocus
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleUnlockSelector()}
                                  className="w-full bg-eden-950 border border-eden-700 rounded-lg py-3 pl-10 text-eden-100 outline-none focus:border-red-500 font-mono text-center tracking-widest text-lg"
                                  placeholder="0000"
                                  style={{ colorScheme: 'dark' }}
                              />
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }} className="flex-1 py-3 rounded-lg font-bold text-eden-100/50 hover:bg-eden-800 transition-colors">Cancelar</button>
                          <button onClick={handleUnlockSelector} className="flex-1 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg">Acessar</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CONTEÚDO DA ABA FUNÇÃO (ÁRVORE) */}
      {activeTab === 'role' && (
        <div className="flex flex-col h-full">
            <div className="bg-eden-800 border border-eden-700 rounded-xl p-4 md:p-6 flex flex-col h-full relative">
                {currentRoleData ? (
                    <>
                        <div className="flex items-start gap-4 mb-4 md:mb-6 border-b border-eden-700 pb-4 shrink-0">
                            <div className="p-3 md:p-4 bg-eden-900 rounded-2xl border border-eden-600">
                                <RoleIcon className="text-energia w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <h2 className="text-2xl md:text-3xl font-black text-eden-100 truncate">{currentRoleData.name}</h2>
                                    {!isLoneWolf && (
                                        <div className="text-left md:text-right mt-1 md:mt-0">
                                            <div className="text-[9px] md:text-[10px] text-eden-100/40 uppercase font-bold">Pontos</div>
                                            <div className={`text-lg md:text-xl font-black ${getCurrentPointsUsed() >= getMaxAbilityPoints() ? 'text-red-500' : 'text-energia'}`}>
                                                {getCurrentPointsUsed()} / {getMaxAbilityPoints()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-eden-100/70 text-xs md:text-sm mt-1 leading-relaxed line-clamp-2">{currentRoleData.description}</p>
                            </div>
                        </div>

                        {isLoneWolf ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 md:space-y-6 pr-1">
                                <div className="p-3 md:p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
                                    <h3 className="font-bold mb-2 flex items-center gap-2 text-sm md:text-base"><Ghost size={16} className="md:w-[18px]"/> Passiva: Caminho Solitário</h3>
                                    <p className="text-xs md:text-sm leading-relaxed">{currentRoleData.passive}</p>
                                </div>

                                {character.teamStrategy.loneWolf.extraPowersChosen.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold uppercase text-eden-100/50 tracking-wider">Poderes Adquiridos</h4>
                                        {character.teamStrategy.loneWolf.extraPowersChosen.map((p, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-eden-900/50 p-2 md:p-3 rounded border border-eden-700">
                                                <span className="text-xs md:text-sm font-bold text-eden-100">{p.powerName}</span>
                                                <button onClick={() => removeLoneWolfPower(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-eden-900/30 p-3 md:p-4 rounded-xl border border-eden-700">
                                    <h3 className="font-bold text-eden-100 mb-3 text-xs md:text-sm uppercase tracking-wide">Adicionar Poder de Classe</h3>
                                    <div className="flex gap-2 mb-3 flex-col md:flex-row">
                                        <select 
                                            value={selectedClassPowerId} 
                                            onChange={e => setSelectedClassPowerId(e.target.value)} 
                                            className="flex-1 bg-eden-950 border border-eden-600 rounded-lg p-2 text-xs md:text-sm text-eden-100 outline-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {availableClassPowers.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={addLoneWolfPower} disabled={!selectedClassPowerId} className="px-4 py-2 bg-energia text-eden-900 font-bold rounded-lg text-xs hover:bg-yellow-400 disabled:opacity-50 transition-colors shadow-sm">
                                            Adicionar
                                        </button>
                                    </div>
                                    
                                    {selectedClassPowerId && CLASS_POWERS.find(p => p.id === selectedClassPowerId)?.needsSelection === 'skills' && (
                                        <div className="p-3 bg-eden-950 rounded border border-conhecimento/30 animate-in fade-in">
                                            <div className="text-xs text-conhecimento font-bold mb-2">Selecione 2 Perícias:</div>
                                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                                {SKILL_LIST.map(s => (
                                                    <button 
                                                        key={s} 
                                                        onClick={() => {
                                                            if (selectedSkills.includes(s)) setSelectedSkills(prev => prev.filter(sk => sk !== s));
                                                            else if (selectedSkills.length < 2) setSelectedSkills(prev => [...prev, s]);
                                                        }}
                                                        className={`text-[10px] p-1.5 rounded border transition-colors ${selectedSkills.includes(s) ? 'bg-conhecimento text-eden-900 border-conhecimento font-bold' : 'border-eden-700 text-eden-100/50'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-right mt-1 text-eden-100/50">{selectedSkills.length}/2</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* ÁRVORE DE HABILIDADES (Responsiva) */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 items-start pb-20 md:pb-0 overflow-y-auto custom-scrollbar pr-1">
                                    {currentRoleData.abilities?.map((ability: TeamAbility) => {
                                        const userAbility = character.teamStrategy.roleAbilities.find(a => a.id === ability.id);
                                        const currentLevel = userAbility ? userAbility.currentLevel : 0;

                                        return (
                                            <div key={ability.id} className="flex flex-col items-center relative group min-h-[180px]">
                                                <div className={`text-center text-[10px] md:text-xs font-bold mb-4 h-8 flex items-center justify-center border-b w-full pb-1 ${currentLevel > 0 ? 'text-energia border-energia' : 'text-eden-100/50 border-eden-700/50'}`}>
                                                    {ability.name}
                                                </div>

                                                <div className="absolute top-12 bottom-0 w-0.5 bg-eden-700/30 -z-0 rounded-full left-1/2 -translate-x-1/2" />

                                                <div className="flex flex-col justify-between h-full w-full py-1 z-10 items-center gap-3">
                                                    {[1, 2, 3, 4, 5].map((level) => {
                                                        const isUnlocked = currentLevel >= level;
                                                        let shapeClass = SHAPE_STYLES[level as keyof typeof SHAPE_STYLES] + ' w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold font-mono text-xs md:text-sm transition-all duration-300 shadow-sm ';
                                                        
                                                        if (isUnlocked) {
                                                            shapeClass += ACTIVE_COLORS[level as keyof typeof ACTIVE_COLORS] + ' z-20';
                                                        } else {
                                                            shapeClass += INACTIVE_STYLE;
                                                        }

                                                        return (
                                                            <button
                                                                key={level}
                                                                onClick={() => handleAbilityChange(ability.id, ability.name, currentLevel === level ? level - 1 : level)}
                                                                // Mobile: Touch para ver info
                                                                onTouchStart={() => setHoveredInfo({ title: ability.name, level: `Nível ${ROMAN_NUMERALS[level as keyof typeof ROMAN_NUMERALS]}`, desc: ability.levels[level] })}
                                                                onMouseEnter={() => setHoveredInfo({ title: ability.name, level: `Nível ${ROMAN_NUMERALS[level as keyof typeof ROMAN_NUMERALS]}`, desc: ability.levels[level] })}
                                                                onMouseLeave={() => setHoveredInfo(null)}
                                                                className={shapeClass}
                                                            >
                                                                {ROMAN_NUMERALS[level as keyof typeof ROMAN_NUMERALS]}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PAINEL DE INFORMAÇÃO FIXO (Rodapé) */}
                                <div className="mt-4 shrink-0 min-h-[80px] bg-eden-900/80 border border-eden-700 rounded-xl p-3 md:p-4 transition-all shadow-lg backdrop-blur-sm z-20 relative">
                                    {hoveredInfo ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-1">
                                            <div className="flex items-center gap-2 mb-1 text-energia border-b border-eden-700/50 pb-1">
                                                <Info size={14} className="md:w-4 md:h-4" />
                                                <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">
                                                    {hoveredInfo.title} <span className="text-eden-100/50 ml-2 text-[10px] normal-case font-mono border border-eden-700 px-1.5 rounded bg-black/20">{hoveredInfo.level}</span>
                                                </h4>
                                            </div>
                                            <p className="text-xs md:text-sm text-eden-100/90 leading-relaxed">{hoveredInfo.desc}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-eden-100/30 text-[10px] md:text-xs italic">
                                            Toque em um nível para ver detalhes.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-eden-100/30 flex-col gap-4">
                        <Shield size={48} strokeWidth={1} className="opacity-50"/>
                        <p className="text-sm">Nenhuma função selecionada. Vá em "Alterar Função".</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA SELETOR */}
      {activeTab === 'selector' && (
          <div className="bg-eden-800/50 border border-eden-700 rounded-xl p-4 h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4 border-b border-eden-700 pb-4">
                  <div>
                      <h3 className="text-lg md:text-xl font-bold text-eden-100">Seletor de Função</h3>
                      <p className="text-[10px] md:text-xs text-eden-100/50">Redefine sua estratégia.</p>
                  </div>
                  <button onClick={() => setActiveTab('role')} className="text-xs md:text-sm text-eden-100/50 hover:text-white underline">Voltar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {TEAM_ROLES.map(role => {
                    const Icon = ICONS[role.id] || Shield;
                    const isSelected = character.teamStrategy.role === role.id;
                    return (
                        <button key={role.id} onClick={() => !isSelected && handleRoleSelect(role.id)} className={`text-left p-3 md:p-4 rounded-xl border flex flex-col gap-2 transition-all hover:scale-[1.02] ${isSelected ? 'bg-energia/20 border-energia text-eden-100 ring-1 ring-energia' : 'bg-eden-900/50 border-eden-700 hover:bg-eden-800'}`}>
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg bg-eden-950 ${isSelected ? 'text-energia' : 'text-eden-100/50'}`}><Icon size={20} /></div>
                                {isSelected && <span className="text-[9px] bg-energia text-eden-900 px-2 py-0.5 rounded font-bold uppercase">Atual</span>}
                            </div>
                            <div>
                                <div className={`font-bold text-sm md:text-lg ${isSelected ? 'text-white' : 'text-eden-100/80'}`}>{role.name}</div>
                                <div className="text-[10px] md:text-xs text-eden-100/40 mt-0.5 leading-relaxed line-clamp-2">{role.description}</div>
                            </div>
                        </button>
                    )
                })}
              </div>
          </div>
      )}

      {/* CONTEÚDO DA ABA FORMAÇÃO */}
      {activeTab === 'formation' && (
        <div className="flex flex-col lg:flex-row gap-6 h-auto items-start justify-center p-2 md:p-4 overflow-y-auto custom-scrollbar">
            
            {/* Ferramentas (Topo no Mobile, Lateral no Desktop) */}
            <div className="flex flex-col gap-3 bg-eden-800 p-3 md:p-4 rounded-xl border border-eden-700 w-full lg:max-w-xs shadow-md shrink-0">
                <h3 className="font-bold text-eden-100 text-center mb-1 text-xs md:text-sm flex items-center justify-center gap-2"><Wrench size={14}/> Ferramentas</h3>
                
                {/* Grid de Ferramentas */}
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => setSelectedTool('C')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${selectedTool === 'C' ? 'bg-red-500/20 border-red-500 text-white' : 'bg-eden-900/50 border-eden-700 text-eden-100/50'}`}>
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow">C</div>
                    </button>
                    <button onClick={() => setSelectedTool('E')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${selectedTool === 'E' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-eden-900/50 border-eden-700 text-eden-100/50'}`}>
                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow">E</div>
                    </button>
                    <button onClick={() => setSelectedTool('O')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${selectedTool === 'O' ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-eden-900/50 border-eden-700 text-eden-100/50'}`}>
                        <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow">O</div>
                    </button>
                    <button onClick={() => setSelectedTool('X')} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${selectedTool === 'X' ? 'bg-eden-100/20 border-eden-100 text-white' : 'bg-eden-900/50 border-eden-700 text-eden-100/50'}`}>
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="h-px bg-eden-700 my-1"></div>

                <div className="flex gap-2">
                    <div className="flex-1 flex gap-1">
                         <button onClick={() => saveFormation(1)} className="flex-1 py-1.5 bg-eden-900 hover:bg-eden-700 border border-eden-600 rounded text-[10px] font-bold flex flex-col items-center justify-center"><Save size={10}/> Salvar 1</button>
                         <button onClick={() => loadFormation(1)} className="flex-1 py-1.5 bg-eden-900 hover:bg-eden-700 border border-eden-600 rounded text-[10px] font-bold flex flex-col items-center justify-center">Carregar 1</button>
                    </div>
                    <div className="flex-1 flex gap-1">
                         <button onClick={() => saveFormation(2)} className="flex-1 py-1.5 bg-eden-900 hover:bg-eden-700 border border-eden-600 rounded text-[10px] font-bold flex flex-col items-center justify-center"><Save size={10}/> Salvar 2</button>
                         <button onClick={() => loadFormation(2)} className="flex-1 py-1.5 bg-eden-900 hover:bg-eden-700 border border-eden-600 rounded text-[10px] font-bold flex flex-col items-center justify-center">Carregar 2</button>
                    </div>
                </div>
            </div>

            {/* GRID 5x5 */}
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                <div className="relative p-1 md:p-2 bg-eden-900/50 rounded-2xl border border-eden-700 shadow-2xl aspect-square">
                    <div className="grid grid-cols-5 grid-rows-5 gap-1 md:gap-2 h-full">
                        {currentFormation.map((cell, index) => (
                            <div 
                                key={index} 
                                onClick={() => handleGridClick(index)} 
                                className="w-full h-full bg-eden-800 rounded border border-eden-700 hover:border-eden-500 cursor-pointer flex items-center justify-center transition-all active:scale-95 shadow-inner"
                            >
                                {cell === 'C' && <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs md:text-sm border border-red-400">C</div>}
                                {cell === 'E' && <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs md:text-sm border border-emerald-400">E</div>}
                                {cell === 'O' && <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs md:text-sm border border-violet-400">O</div>}
                            </div>
                        ))}
                    </div>
                    
                    {/* Checkbox Bônus */}
                    <div className="absolute top-2 right-2 z-20">
                          <button 
                             onClick={toggleFormationActive}
                             className={`flex items-center gap-1 text-[9px] md:text-xs font-bold px-2 py-1 rounded border shadow-lg transition-colors ${character.teamStrategy.isFormationActive ? 'text-conhecimento border-conhecimento bg-eden-900' : 'text-eden-100/50 border-eden-700 bg-eden-900/80'}`}
                          >
                             {character.teamStrategy.isFormationActive ? <CheckSquare size={12} /> : <Square size={12} />}
                             Ativo
                          </button>
                    </div>

                    <div className="absolute -bottom-6 left-0 w-full text-center text-[9px] text-eden-100/30 font-mono uppercase tracking-widest">
                        Grid Tático 5x5 (1,5m/q)
                    </div>
                </div>

                <div className="bg-conhecimento/10 border border-conhecimento/30 rounded-xl p-3 text-[10px] md:text-xs text-eden-100/90 leading-relaxed shadow-sm mt-4">
                    <div className="flex items-center gap-2 mb-1 text-conhecimento font-bold uppercase tracking-wider">
                        <Info size={12} /> Bônus de Formação
                    </div>
                    <p>Se a equipe estiver na formação exata: <strong>+2 Testes, +1 Dano, +1 Defesa</strong>.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}