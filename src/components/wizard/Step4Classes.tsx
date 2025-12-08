import { useState, useEffect } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { Sword, Book, Eye, Check, AlertTriangle, Pencil } from 'lucide-react';
import { SKILL_LIST } from '../../data/referenceData';
import { ORIGINS } from '../../data/origins';

export default function Step4Classes() {
  const { character, updateProgression } = useCharacter();
  
  const [selectedClass, setSelectedClass] = useState<'combatente' | 'especialista' | 'ocultista' | null>(
    character.progression.class !== 'mundano' ? character.progression.class : null
  );

  const [combatenteFightChoice, setCombatenteFightChoice] = useState<'Luta' | 'Pontaria' | null>(null);
  const [combatenteResistChoice, setCombatenteResistChoice] = useState<'Fortitude' | 'Reflexos' | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [, setForceUpdate] = useState(0);

  const originName = character.progression.origin.name;
  const originData = ORIGINS.find(o => o.name === originName);
  const originSkills = originData?.skills || [];
  
  const normalizedOriginSkills = originSkills.map(s => s === 'Profissão' ? 'Profissão' : s);

  const calculateRequirements = () => {
      const int = character.attributes.int;
      let freeSlots = int;
      let needsFightChoice = false;
      let needsResistChoice = false;

      if (selectedClass === 'combatente') {
          const hasLuta = normalizedOriginSkills.includes('Luta');
          const hasPontaria = normalizedOriginSkills.includes('Pontaria');
          if (hasLuta || hasPontaria) freeSlots += 1; 
          else needsFightChoice = true;

          const hasFort = normalizedOriginSkills.includes('Fortitude');
          const hasRef = normalizedOriginSkills.includes('Reflexos');
          if (hasFort || hasRef) freeSlots += 1;
          else needsResistChoice = true;
          
          freeSlots += 1;
      } 
      else if (selectedClass === 'especialista') {
          freeSlots += 7;
      } 
      else if (selectedClass === 'ocultista') {
          if (normalizedOriginSkills.includes('Ocultismo')) freeSlots += 1;
          if (normalizedOriginSkills.includes('Vontade')) freeSlots += 1;
          freeSlots += 3;
      }
      return { freeSlots, needsFightChoice, needsResistChoice };
  };

  const { freeSlots, needsFightChoice, needsResistChoice } = calculateRequirements();

  const handleClassSelect = (cls: 'combatente' | 'especialista' | 'ocultista') => {
    setSelectedClass(cls);
    setSelectedSkills([]);
    setCombatenteFightChoice(null);
    setCombatenteResistChoice(null);
    updateProgression('class', cls);
    
    const statsMap = {
        combatente: { pv: 20, pe: 2, san: 12 },
        especialista: { pv: 16, pe: 3, san: 16 },
        ocultista: { pv: 12, pe: 4, san: 20 }
    };
    
    const stats = statsMap[cls];
    character.status.pv.max = stats.pv + character.attributes.vig;
    character.status.pv.current = character.status.pv.max;
    character.status.pe.max = stats.pe + character.attributes.pre;
    character.status.pe.current = character.status.pe.max;
    character.status.san.max = stats.san;
    character.status.san.current = stats.san;
  };

  const toggleSkill = (skill: string) => {
    if (normalizedOriginSkills.includes(skill)) return;
    if (selectedClass === 'ocultista' && (skill === 'Ocultismo' || skill === 'Vontade')) return;

    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < freeSlots) {
        setSelectedSkills(prev => [...prev, skill]);
      }
    }
  };

  const renameSkill = (skillKey: string) => {
      const currentData = character.skills[skillKey];
      const initialValue = currentData?.customName || (normalizedOriginSkills.includes(skillKey) && skillKey === 'Profissão' ? originName : '');
      const newName = prompt(`Nome da ${skillKey}:`, initialValue);
      
      if (newName !== null) {
          if (!character.skills[skillKey]) {
              character.skills[skillKey] = { level: 'destreinado', isTrained: false, miscBonus: 0 };
          }
          character.skills[skillKey].customName = newName;
          setForceUpdate(prev => prev + 1);
      }
  };

  useEffect(() => {
      if (!selectedClass) return;

      SKILL_LIST.forEach(s => {
          if (!normalizedOriginSkills.includes(s)) {
              if (character.skills[s]) {
                  character.skills[s].isTrained = false;
                  character.skills[s].level = 'destreinado';
              }
          } else {
               if (!character.skills[s]) character.skills[s] = { level: 'treinado', isTrained: true, miscBonus: 0 };
               else { 
                   character.skills[s].isTrained = true; 
                   character.skills[s].level = 'treinado';
                   if (s === 'Profissão' && !character.skills[s].customName) {
                       character.skills[s].customName = originName;
                   }
               }
          }
      });

      if (selectedClass === 'ocultista') {
          ['Ocultismo', 'Vontade'].forEach(s => {
               if (!character.skills[s]) character.skills[s] = { level: 'treinado', isTrained: true, miscBonus: 0 };
               else { character.skills[s].isTrained = true; character.skills[s].level = 'treinado'; }
          });
      }

      if (selectedClass === 'combatente') {
          [combatenteFightChoice, combatenteResistChoice].forEach(s => {
              if (s) {
                if (!character.skills[s]) character.skills[s] = { level: 'treinado', isTrained: true, miscBonus: 0 };
                else { character.skills[s].isTrained = true; character.skills[s].level = 'treinado'; }
          
              }
          });
      }

      selectedSkills.forEach(s => {
          if (!character.skills[s]) character.skills[s] = { level: 'treinado', isTrained: true, miscBonus: 0 };
          else { character.skills[s].isTrained = true; character.skills[s].level = 'treinado'; }
      });
  }, [selectedClass, selectedSkills, combatenteFightChoice, combatenteResistChoice, originName]);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-4">
      
      <div className="text-center mb-2 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Classe</h2>
        <p className="text-xs md:text-base text-eden-100/50">Como você enfrenta o Paranormal?</p>
      </div>

      {/* Grid de Classes (1 col mobile, 3 col desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        {/* COMBATENTE */}
        <button
          onClick={() => handleClassSelect('combatente')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'combatente' ? 'bg-red-600/10 border-red-500' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-red-500`}>
              <Sword size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Combatente</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                A linha de frente. Especialistas em armas, resistência e proteção física.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block">
                <p>PV: 20 (+4) | PE: 2 (+2) | SAN: 12 (+3)</p>
                <p><strong className="text-red-400">Ataque Especial:</strong> Gaste PE para +Ataque ou +Dano.</p>
            </div>
          </div>
        </button>

        {/* ESPECIALISTA */}
        <button
          onClick={() => handleClassSelect('especialista')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'especialista' ? 'bg-emerald-600/10 border-emerald-500' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-emerald-500`}>
              <Book size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Especialista</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                O cérebro da equipe. Versátil, usa perícias e táticas para resolver problemas.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block">
                <p>PV: 16 (+3) | PE: 3 (+3) | SAN: 16 (+4)</p>
                <p><strong className="text-emerald-400">Perito:</strong> +1d6 em perícias.</p>
                <p><strong className="text-emerald-400">Eclético:</strong> Usa perícias não treinadas.</p>
            </div>
          </div>
        </button>

        {/* OCULTISTA */}
        <button
          onClick={() => handleClassSelect('ocultista')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'ocultista' ? 'bg-violet-600/10 border-violet-500' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-violet-500`}>
              <Eye size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Ocultista</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                Mestres do Outro Lado. Frágeis fisicamente, mas manipulam a Realidade com rituais.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block">
                <p>PV: 12 (+2) | PE: 4 (+4) | SAN: 20 (+5)</p>
                <p><strong className="text-violet-400">Escolhido:</strong> Inicia com rituais.</p>
            </div>
          </div>
        </button>
      </div>

      {/* Área de Seleção de Perícias */}
      {selectedClass && (
        <div className="flex-1 bg-eden-800/50 border border-eden-700 rounded-xl p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center border-b border-eden-700 pb-2 shrink-0">
                <h3 className="font-bold text-eden-100 text-sm md:text-base">Perícias Treinadas</h3>
                <span className={`text-[10px] md:text-xs px-2 py-1 rounded font-mono ${selectedSkills.length === freeSlots ? 'bg-green-500/20 text-green-400' : 'bg-eden-900 text-eden-100/50'}`}>
                    Livres: {selectedSkills.length} / {freeSlots}
                </span>
            </div>

            {selectedClass === 'combatente' && (needsFightChoice || needsResistChoice) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 shrink-0">
                    {needsFightChoice && (
                        <div className="bg-eden-900/50 p-3 rounded border border-red-500/30">
                            <span className="text-[10px] font-bold text-red-400 block mb-2 uppercase">Estilo de Combate</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCombatenteFightChoice('Luta')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteFightChoice === 'Luta' ? 'bg-red-500 text-white border-red-500' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Luta</button>
                                <button onClick={() => setCombatenteFightChoice('Pontaria')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteFightChoice === 'Pontaria' ? 'bg-red-500 text-white border-red-500' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Pontaria</button>
                            </div>
                        </div>
                    )}
                    {needsResistChoice && (
                        <div className="bg-eden-900/50 p-3 rounded border border-red-500/30">
                            <span className="text-[10px] font-bold text-red-400 block mb-2 uppercase">Resistência</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCombatenteResistChoice('Fortitude')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteResistChoice === 'Fortitude' ? 'bg-red-500 text-white border-red-500' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Fortitude</button>
                                <button onClick={() => setCombatenteResistChoice('Reflexos')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteResistChoice === 'Reflexos' ? 'bg-red-500 text-white border-red-500' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Reflexos</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LISTA DE PERÍCIAS - GRID RESPONSIVO (2 col mobile / 4 col desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {SKILL_LIST.map(skill => {
                    const isOrigin = normalizedOriginSkills.includes(skill);
                    const isAuto = selectedClass === 'ocultista' && (skill === 'Ocultismo' || skill === 'Vontade');
                    const isSelected = selectedSkills.includes(skill);
                    const isCombatChoice = (combatenteFightChoice === skill) || (combatenteResistChoice === skill);
                    const isProfession = skill.startsWith('Profissão');
                    const currentName = character.skills[skill]?.customName;
                    let stateClass = 'border-eden-700 text-eden-100/40 hover:border-eden-500 hover:bg-eden-700/30'; 
                    let icon = null;

                    if (isOrigin) {
                        stateClass = 'bg-amber-500/10 border-amber-500/50 text-amber-200 cursor-default';
                        icon = <span className="text-[8px] uppercase font-bold opacity-70">Origem</span>;
                    } else if (isAuto) {
                        stateClass = 'bg-violet-500/10 border-violet-500/50 text-violet-200 cursor-default';
                        icon = <span className="text-[8px] uppercase font-bold opacity-70">Classe</span>;
                    } else if (isCombatChoice) {
                        stateClass = 'bg-red-500/10 border-red-500/50 text-red-200 cursor-default';
                        icon = <Check size={12}/>;
                    } else if (isSelected) {
                        stateClass = 'bg-eden-100 text-eden-900 border-eden-100 font-bold shadow-md';
                        icon = <Check size={12}/>;
                    }

                    return (
                        <div key={skill} className="relative group">
                            <button
                                onClick={() => toggleSkill(skill)}
                                disabled={isOrigin || isAuto || isCombatChoice}
                                className={`w-full text-left px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs flex justify-between items-center border transition-all ${stateClass}`}
                            >
                                <span className="truncate pr-2">
                                    {skill} 
                                    {currentName && <span className="block text-[8px] md:text-[9px] italic opacity-70 truncate max-w-[80px]">({currentName})</span>}
                                </span>
                                {icon}
                            </button>
                            
                            {isProfession && (isOrigin || isSelected) && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); renameSkill(skill); }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-eden-900/80 text-eden-100 hover:text-energia border border-eden-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                                    title="Definir Profissão"
                                >
                                    <Pencil size={10} />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      {selectedClass && selectedSkills.length < freeSlots && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs justify-center animate-pulse shrink-0 mb-2">
              <AlertTriangle size={14} />
              Escolha mais {freeSlots - selectedSkills.length} perícias.
          </div>
      )}

    </div>
  );
}