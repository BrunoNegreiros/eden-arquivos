import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { TEAM_ROLES } from '../../data/teamPowers';
import type { TeamAbility, TeamRoleData } from '../../data/teamPowers';
import { CLASS_POWERS } from '../../data/classPowers';
import type { ClassPower } from '../../data/classPowers';
import { SKILL_LIST } from '../../data/referenceData';
import { 
  Shield, Users, Heart, Crosshair, Search, Brain, Wrench, 
  Ghost, Save, Bomb, Dog, Trash2, Info 
} from 'lucide-react';

const ICONS: Record<string, any> = {
  tanque: Shield, suporte: Users, curandeiro: Heart, oportunista: Crosshair,
  investigador: Search, terapeuta: Brain, sabotador: Bomb, polivalente: Wrench, lobo_solitario: Dog
};

const SHAPE_STYLES: Record<number, string> = {
  1: 'rounded-full',
  2: '[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)] pb-1',
  3: 'rounded-sm',
  4: '[clip-path:polygon(50%_0%,_100%_38%,_82%_100%,_18%_100%,_0%_38%)]',
  5: 'rounded-md'
};

const ACTIVE_COLORS = {
  1: 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110',
  2: 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110',
  3: 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110',
  4: 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-110',
  5: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110'
};

const INACTIVE_STYLE = 'bg-eden-900/40 text-eden-100/10';
const CLICKABLE_STYLE = 'bg-eden-800 text-blue-200 hover:bg-blue-500/20 cursor-pointer';
const ROMAN_NUMERALS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

export default function Step8Team() {
  const { character, updateProgression } = useCharacter();
  const [activeTab, setActiveTab] = useState<'role' | 'formation'>('role');
  
  const [selectedClassPowerId, setSelectedClassPowerId] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<{ title: string, desc: string, level?: string } | null>(null);
  const [currentFormation, setCurrentFormation] = useState<(string | null)[]>(Array(25).fill(null));
  const [selectedTool, setSelectedTool] = useState<'C' | 'E' | 'O' | 'X'>('C');

  const updateTeamStrategy = (updates: Partial<typeof character.teamStrategy>) => {
    Object.assign(character.teamStrategy, updates);
    updateProgression('nex', character.progression.nex);
  };

  const handleRoleSelect = (roleId: string) => {
    updateTeamStrategy({ role: roleId as any, roleAbilities: [] });
    setSelectedClassPowerId('');
    setSelectedSkills([]);
    setHoveredInfo(null);
  };

  const handleAbilitySelect = (ability: TeamAbility) => {
    const newAbilities = [{
        id: ability.id,
        name: ability.name,
        currentLevel: 1 as const
    }];
    updateTeamStrategy({ roleAbilities: newAbilities });
  };

  const checkRequirements = (power: ClassPower) => {
    if (!power.req) return true;
    const { attr, skill, nex } = power.req;
    
    if (nex && character.progression.nex < nex) return false;
    if (attr) {
        for (const [key, val] of Object.entries(attr)) {
            if (character.attributes[key as keyof typeof character.attributes] < val) return false;
        }
    }
    if (skill) {
        const hasSkill = skill.some(s => character.skills[s]?.isTrained);
        if (!hasSkill) return false;
    }
    return true;
  };

  const handleClassPowerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const powerId = e.target.value;
    setSelectedClassPowerId(powerId);
    
    const power = CLASS_POWERS.find((p: ClassPower) => p.id === powerId);
    if (power?.needsSelection === 'skills') {
        setShowSkillModal(true);
        setSelectedSkills([]);
    } else {
        setShowSkillModal(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
        setSelectedSkills(prev => prev.filter(s => s !== skillName));
    } else {
        if (selectedSkills.length < 2) setSelectedSkills(prev => [...prev, skillName]);
    }
  };

  const confirmLoneWolfPower = () => {
    if (!selectedClassPowerId) return;
    const power = CLASS_POWERS.find((p: ClassPower) => p.id === selectedClassPowerId);
    if (power) {
        if (power.needsSelection === 'skills' && selectedSkills.length !== 2) {
            alert("Selecione exatamente 2 perícias.");
            return;
        }

        updateTeamStrategy({
            loneWolf: {
                isActive: true,
                extraPowersChosen: [{
                    nexSource: 5,
                    powerId: power.id,
                    powerName: power.name + (selectedSkills.length ? ` (${selectedSkills.join(', ')})` : '')
                }]
            }
        });
    }
  };

  const handleGridClick = (index: number) => {
    const newGrid = [...currentFormation];
    if (selectedTool === 'X') newGrid[index] = null;
    else newGrid[index] = selectedTool;
    setCurrentFormation(newGrid);
  };

  const saveFormation = (slot: 1 | 2) => {
    const formationString = currentFormation.join(',');
    const newFavs = [...(character.teamStrategy.favoriteFormations || [])];
    if (slot === 1) newFavs[0] = formationString;
    else newFavs[1] = formationString;
    updateTeamStrategy({ favoriteFormations: newFavs });
    alert(`Formação ${slot} salva!`);
  };

  const currentRoleData = TEAM_ROLES.find((r: TeamRoleData) => r.id === character.teamStrategy.role);
  const isLoneWolf = character.teamStrategy.role === 'lobo_solitario';
  const RoleIcon = currentRoleData ? (ICONS[currentRoleData.id] || Shield) : Shield;
  
  const availableClassPowers = CLASS_POWERS.filter((p: ClassPower) => 
    (p.class === character.progression.class || p.class === 'all') && 
    p.id !== 'transcender'
  );

  const getDisplayInfo = () => {
    if (hoveredInfo) return hoveredInfo;
    
    if (character.teamStrategy.roleAbilities.length > 0 && currentRoleData) {
        const selected = character.teamStrategy.roleAbilities[0];
        const abilitiesList: TeamAbility[] = currentRoleData.abilities || [];
        const abilityData = abilitiesList.find((a: TeamAbility) => a.id === selected.id);
        
        if (abilityData) {
            return {
                title: abilityData.name,
                level: 'Nível I',
                desc: abilityData.levels[1]
            };
        }
    }

    return {
        title: 'Detalhes da Habilidade',
        desc: 'Toque em um nível ou selecione uma habilidade para ver os detalhes completos.',
        level: ''
    };
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-4">
      
      <div className="flex justify-center gap-4 mb-2 shrink-0">
        <button onClick={() => setActiveTab('role')} className={`px-6 py-2 rounded-full text-sm md:text-base font-bold transition-all ${activeTab === 'role' ? 'bg-energia text-eden-900' : 'bg-eden-800 text-eden-100'}`}>Função</button>
        <button onClick={() => setActiveTab('formation')} className={`px-6 py-2 rounded-full text-sm md:text-base font-bold transition-all ${activeTab === 'formation' ? 'bg-conhecimento text-eden-900' : 'bg-eden-800 text-eden-100'}`}>Formação</button>
      </div>

      {activeTab === 'role' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
            {/* Lista de Funções */}
            <div className="lg:col-span-1 bg-eden-800/50 border border-eden-700 rounded-xl p-4 overflow-y-auto custom-scrollbar space-y-2 h-48 lg:h-full">
                {TEAM_ROLES.map(role => {
                    const Icon = ICONS[role.id] || Shield;
                    const isSelected = character.teamStrategy.role === role.id;
                    return (
                        <button key={role.id} onClick={() => handleRoleSelect(role.id)} className={`w-full text-left p-2 md:p-3 rounded-lg border flex items-center gap-3 transition-all ${isSelected ? 'bg-energia/20 border-energia text-eden-100' : 'bg-eden-900/50 border-eden-700 hover:bg-eden-800'}`}>
                            <div className={`p-1.5 md:p-2 rounded bg-eden-900 ${isSelected ? 'text-energia' : 'text-eden-100/50'}`}><Icon size={18} className="md:w-5 md:h-5" /></div>
                            <div><div className="font-bold text-sm md:text-base">{role.name}</div></div>
                        </button>
                    )
                })}
            </div>

            {/* Detalhes */}
            <div className="lg:col-span-2 bg-eden-800 border border-eden-700 rounded-xl p-4 md:p-6 flex flex-col overflow-y-auto custom-scrollbar relative">
                {currentRoleData ? (
                    <>
                        <div className="flex items-center gap-4 mb-4 md:mb-6 border-b border-eden-700 pb-4 shrink-0">
                            <RoleIcon className="text-energia w-10 h-10 md:w-12 md:h-12" />
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-eden-100">{currentRoleData.name}</h2>
                                <p className="text-eden-100/70 text-xs md:text-base">{currentRoleData.description}</p>
                            </div>
                        </div>

                        {isLoneWolf ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
                                    <h3 className="font-bold mb-2 flex items-center gap-2 text-sm md:text-base"><Ghost size={18}/> Passiva: Caminho Solitário</h3>
                                    <p className="text-xs md:text-sm leading-relaxed">{currentRoleData.passive}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-eden-100 mb-3 text-sm md:text-base">Escolha seu Poder de Classe Extra (NEX 5%)</h3>
                                    <select value={selectedClassPowerId} onChange={handleClassPowerSelect} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-xs md:text-sm text-eden-100 outline-none mb-4">
                                        <option value="">Selecione um poder...</option>
                                        {availableClassPowers.map(p => {
                                            const meetsReq = checkRequirements(p);
                                            return (
                                                <option key={p.id} value={p.id} disabled={!meetsReq} className={!meetsReq ? 'text-eden-100/30' : ''}>
                                                    {p.name} {!meetsReq ? '(Requisitos não atendidos)' : ''}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    
                                    {selectedClassPowerId && (
                                        <div className="p-4 bg-eden-900/50 rounded-lg border border-eden-700 mb-4">
                                            <p className="text-xs md:text-sm text-eden-100/80">{CLASS_POWERS.find((p: ClassPower) => p.id === selectedClassPowerId)?.description}</p>
                                        </div>
                                    )}

                                    {showSkillModal && selectedClassPowerId && (
                                        <div className="p-4 bg-eden-900 border border-conhecimento/50 rounded-lg mb-4 animate-in fade-in">
                                            <h4 className="text-conhecimento font-bold mb-2 text-sm">Selecione 2 Perícias:</h4>
                                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                {SKILL_LIST.map(skill => (
                                                    <button key={skill} onClick={() => toggleSkill(skill)} className={`text-[10px] md:text-xs p-2 rounded border ${selectedSkills.includes(skill) ? 'bg-conhecimento text-eden-900 border-conhecimento' : 'bg-eden-800 text-eden-100/70 border-eden-700'}`}>
                                                        {skill}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-right mt-2 text-eden-100/50">{selectedSkills.length}/2 selecionadas</p>
                                        </div>
                                    )}

                                    <button onClick={confirmLoneWolfPower} disabled={!selectedClassPowerId || (showSkillModal && selectedSkills.length !== 2)} className="w-full py-3 bg-energia text-eden-900 font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
                                        Confirmar Escolha
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="mb-4 md:mb-6 p-3 bg-conhecimento/10 border border-conhecimento/30 rounded-lg text-xs md:text-sm text-conhecimento text-center shrink-0">
                                    Escolha <strong>1 Habilidade</strong> para iniciar no <strong>Nível I</strong>.
                                </div>

                                {/* ÁRVORE DE HABILIDADES */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 h-full items-start pb-24 lg:pb-0">
                                    {currentRoleData.abilities?.map((ability: TeamAbility) => {
                                        const isSelected = character.teamStrategy.roleAbilities.some((a: { id: string }) => a.id === ability.id);
                                        return (
                                            <div key={ability.id} className="flex flex-col items-center relative group h-full min-h-[200px]">
                                                <h4 className={`text-center text-[10px] md:text-xs font-bold mb-2 md:mb-4 h-8 flex items-center justify-center ${isSelected ? 'text-energia' : 'text-eden-100/50'}`}>
                                                    {ability.name}
                                                </h4>

                                                <div className="absolute top-10 md:top-12 bottom-4 w-0.5 bg-eden-700/20 -z-0 rounded-full" />

                                                <div className="flex flex-col justify-between h-full w-full py-2 z-10 items-center gap-2 md:gap-3">
                                                    {[1, 2, 3, 4, 5].map((level) => {
                                                        const isClickable = level === 1;
                                                        const isActive = isSelected && level === 1;
                                                        
                                                        let shapeClass = SHAPE_STYLES[level as keyof typeof SHAPE_STYLES] + ' w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-bold font-mono text-xs md:text-sm transition-all duration-300 ';
                                                        
                                                        if (isActive) {
                                                            shapeClass += ACTIVE_COLORS[level as keyof typeof ACTIVE_COLORS] + ' z-20';
                                                        } else if (isClickable) {
                                                            shapeClass += CLICKABLE_STYLE;
                                                        } else {
                                                            shapeClass += INACTIVE_STYLE;
                                                        }

                                                        return (
                                                            <button
                                                                key={level}
                                                                disabled={!isClickable}
                                                                onClick={() => isClickable && handleAbilitySelect(ability)}
                                                                onMouseEnter={() => setHoveredInfo({ title: ability.name, level: `Nível ${ROMAN_NUMERALS[level as keyof typeof ROMAN_NUMERALS]}`, desc: ability.levels[level] })}
                                                                onTouchStart={() => setHoveredInfo({ title: ability.name, level: `Nível ${ROMAN_NUMERALS[level as keyof typeof ROMAN_NUMERALS]}`, desc: ability.levels[level] })}
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

                                {/* PAINEL DE INFORMAÇÃO FIXO */}
                                <div className="mt-auto sticky bottom-0 shrink-0 min-h-[80px] bg-eden-900/95 border border-eden-700 rounded-xl p-3 md:p-4 transition-all animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm shadow-2xl z-30">
                                    <div className="flex items-center gap-2 mb-1 text-energia">
                                        <Info size={14} className="md:w-4 md:h-4" />
                                        <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">
                                            {displayInfo.title} {displayInfo.level && <span className="text-eden-100/50 ml-2 text-[10px] normal-case font-mono border border-eden-700 px-1.5 rounded">{displayInfo.level}</span>}
                                        </h4>
                                    </div>
                                    <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed pl-5 md:pl-6">
                                        {displayInfo.desc}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-eden-100/30">Selecione uma função.</div>
                )}
            </div>
        </div>
      )}

      {/* Formação Tática */}
      {activeTab === 'formation' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 items-center justify-center overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
            
            {/* Painel de Ferramentas (Grid 2x2 no mobile) */}
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 w-full lg:w-64 shrink-0">
                <h3 className="font-bold text-eden-100 text-center mb-4 text-sm md:text-base hidden lg:block">Ferramentas</h3>
                
                {/* Grid Mobile */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                    <button onClick={() => setSelectedTool('C')} className={`p-3 rounded-lg border flex items-center justify-center lg:justify-start gap-2 transition-all ${selectedTool === 'C' ? 'bg-red-500 text-white border-white shadow-md' : 'bg-eden-900 border-red-900/50 text-red-500 hover:bg-eden-700'}`}>
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">C</div>
                        <span className="text-xs font-bold">Combatente</span>
                    </button>
                    
                    <button onClick={() => setSelectedTool('E')} className={`p-3 rounded-lg border flex items-center justify-center lg:justify-start gap-2 transition-all ${selectedTool === 'E' ? 'bg-emerald-500 text-white border-white shadow-md' : 'bg-eden-900 border-emerald-900/50 text-emerald-500 hover:bg-eden-700'}`}>
                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">E</div>
                        <span className="text-xs font-bold">Especialista</span>
                    </button>
                    
                    <button onClick={() => setSelectedTool('O')} className={`p-3 rounded-lg border flex items-center justify-center lg:justify-start gap-2 transition-all ${selectedTool === 'O' ? 'bg-violet-500 text-white border-white shadow-md' : 'bg-eden-900 border-violet-900/50 text-violet-500 hover:bg-eden-700'}`}>
                        <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">O</div>
                        <span className="text-xs font-bold">Ocultista</span>
                    </button>
                    
                    <button onClick={() => setSelectedTool('X')} className={`p-3 rounded-lg border flex items-center justify-center lg:justify-start gap-2 transition-all ${selectedTool === 'X' ? 'bg-eden-600 text-white border-white shadow-md' : 'bg-eden-900 border-eden-700 text-eden-100/50 hover:bg-eden-700'}`}>
                        <Trash2 size={18} />
                        <span className="text-xs font-bold">Borracha</span>
                    </button>
                </div>

                <div className="h-px bg-eden-700 my-4 hidden lg:block"></div>

                <div className="flex lg:flex-col gap-2 mt-2 lg:mt-0">
                    <button onClick={() => saveFormation(1)} className="flex-1 py-2 bg-conhecimento hover:bg-yellow-400 text-eden-900 font-bold rounded-lg flex items-center justify-center gap-2 text-xs shadow-lg transition-transform active:scale-95"><Save size={14}/> Salvar 1</button>
                    <button onClick={() => saveFormation(2)} className="flex-1 py-2 bg-conhecimento hover:bg-yellow-400 text-eden-900 font-bold rounded-lg flex items-center justify-center gap-2 text-xs shadow-lg transition-transform active:scale-95"><Save size={14}/> Salvar 2</button>
                </div>
            </div>

            {/* Grid */}
            <div className="relative w-full max-w-md aspect-square shrink-0">
                {/* CORREÇÃO AQUI: grid-rows-5 para travar a altura das linhas e garantir quadrado perfeito */}
                <div className="bg-eden-900 border-4 border-eden-700 rounded-lg p-1 lg:p-2 grid grid-cols-5 grid-rows-5 gap-1 lg:gap-2 shadow-2xl h-full">
                    {currentFormation.map((cell, index) => (
                        <div key={index} onClick={() => handleGridClick(index)} className="w-full h-full bg-eden-800/50 rounded border border-eden-700/50 hover:border-eden-500 cursor-pointer flex items-center justify-center transition-all active:scale-95">
                            {cell === 'C' && <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs lg:text-lg animate-in zoom-in">C</div>}
                            {cell === 'E' && <div className="w-8 h-8 lg:w-12 lg:h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs lg:text-lg animate-in zoom-in">E</div>}
                            {cell === 'O' && <div className="w-8 h-8 lg:w-12 lg:h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs lg:text-lg animate-in zoom-in">O</div>}
                        </div>
                    ))}
                </div>
                
                {/* Centro Marcado */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/20 rounded-full pointer-events-none blur-sm"></div>
                
                <p className="text-center text-eden-100/40 text-[10px] lg:text-xs mt-4">
                    Grade 5x5 (1,5m cada). O centro é o alvo/ponto zero.
                </p>
            </div>
        </div>
      )}
    </div>
  );
}