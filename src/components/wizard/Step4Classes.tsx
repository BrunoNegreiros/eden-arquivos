import { useState, useEffect } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { Sword, Book, Eye, Check, AlertTriangle, Pencil } from 'lucide-react';

const CLASSES_DATA = [
  { id: 'combatente', name: 'Combatente', initialHP: 20, initialPE: 2, initialSAN: 12, pvPerLevel: 4, pePerLevel: 2, sanPerLevel: 3 },
  { id: 'especialista', name: 'Especialista', initialHP: 16, initialPE: 3, initialSAN: 16, pvPerLevel: 3, pePerLevel: 3, sanPerLevel: 4 },
  { id: 'ocultista', name: 'Ocultista', initialHP: 12, initialPE: 4, initialSAN: 20, pvPerLevel: 2, pePerLevel: 4, sanPerLevel: 5 }
] as const;


const REFERENCE_SKILLS = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
  "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", 
  "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", 
  "Pontaria", "Profissão 1", "Profissão 2", "Profissão 3", "Reflexos", 
  "Religião", "Sobrevivência", "Tática", "Tecnologia", "Vontade"
];

export default function Step4Classes() {
  const { character, updateCharacter } = useCharacter();
  
  const currentClass = character.personal.class;
  const [selectedClass, setSelectedClass] = useState<'combatente' | 'especialista' | 'ocultista' | null>(
    currentClass !== 'mundano' ? (currentClass as any) : null
  );

  const [combatenteFightChoice, setCombatenteFightChoice] = useState<'Luta' | 'Pontaria' | null>(null);
  const [combatenteResistChoice, setCombatenteResistChoice] = useState<'Fortitude' | 'Reflexos' | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [, setForceUpdate] = useState(0);

  const originName = character.personal.origin;
  const customOrigin = (character as any).customOrigin;
  const originSkills: string[] = customOrigin?.trainedSkills || [];
  
  
  const normalizedOriginSkills: string[] = originSkills.map((s: string) => s.startsWith('Profissão') ? 'Profissão 1' : s);

  const int = character.attributes.initial.INT;

  const calculateRequirements = () => {
      let freeSlots = int; 
      let needsFightChoice = false;
      let needsResistChoice = false;

      const originSkillCount = originSkills.length;
      if (originSkillCount < 2) freeSlots += (2 - originSkillCount);

      if (selectedClass === 'combatente') freeSlots += 1; 
      if (selectedClass === 'especialista') freeSlots += 7;
      if (selectedClass === 'ocultista') freeSlots += 3;

      if (selectedClass === 'combatente') {
          const hasLuta = normalizedOriginSkills.includes('Luta');
          const hasPontaria = normalizedOriginSkills.includes('Pontaria');
          if (hasLuta || hasPontaria) freeSlots += 1; else needsFightChoice = true;

          const hasFort = normalizedOriginSkills.includes('Fortitude');
          const hasRef = normalizedOriginSkills.includes('Reflexos');
          if (hasFort || hasRef) freeSlots += 1; else needsResistChoice = true;
      } 
      
      if (selectedClass === 'ocultista') {
          if (normalizedOriginSkills.includes('Ocultismo')) freeSlots += 1;
          if (normalizedOriginSkills.includes('Vontade')) freeSlots += 1;
      }

      return { freeSlots, needsFightChoice, needsResistChoice };
  };

  const { freeSlots, needsFightChoice, needsResistChoice } = calculateRequirements();

  const handleClassSelect = (cls: 'combatente' | 'especialista' | 'ocultista') => {
    setSelectedClass(cls);
    setSelectedSkills([]);
    setCombatenteFightChoice(null);
    setCombatenteResistChoice(null);
    
    const classData = CLASSES_DATA.find(c => c.id === cls);
    if (!classData) return;

    const vig = character.attributes.initial.VIG;
    const pre = character.attributes.initial.PRE;

    updateCharacter(prev => ({
        ...prev,
        personal: { ...prev.personal, class: cls },
        status: {
            ...prev.status,
            pv: { ...prev.status.pv, current: classData.initialHP + vig },
            pe: { ...prev.status.pe, current: classData.initialPE + pre },
            san: { ...prev.status.san, current: classData.initialSAN }
        }
    }));
  };

  const toggleSkill = (skill: string) => {
    if (normalizedOriginSkills.includes(skill)) return;
    if (selectedClass === 'ocultista' && (skill === 'Ocultismo' || skill === 'Vontade')) return;
    if (selectedClass === 'combatente' && (skill === combatenteFightChoice || skill === combatenteResistChoice)) return;

    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < freeSlots) setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const renameSkill = (skillKey: string) => {
      const currentData = character.skills[skillKey];
      const defaultName = (normalizedOriginSkills.includes(skillKey) && skillKey.startsWith('Profissão')) ? originName : '';
      const initialValue = currentData?.customName || defaultName;
      
      const newName = prompt(`Nome da ${skillKey}:`, initialValue);
      
      if (newName !== null) {
          updateCharacter(prev => ({
              ...prev,
              skills: {
                  ...prev.skills,
                  [skillKey]: {
                      ...prev.skills[skillKey],
                      training: prev.skills[skillKey]?.training || 0,
                      otherBonus: prev.skills[skillKey]?.otherBonus || 0,
                      customName: newName
                  }
              }
          }));
          setForceUpdate(prev => prev + 1);
      }
  };

  useEffect(() => {
      if (!selectedClass) return;

      const newSkills = { ...character.skills };
      let hasChanges = false;

      const isOriginSkill = (key: string) => normalizedOriginSkills.includes(key);

      Object.keys(newSkills).forEach(k => {
          if (!isOriginSkill(k)) {
             if (newSkills[k].training === 1) { 
                 newSkills[k] = { ...newSkills[k], training: 0 };
                 hasChanges = true;
             }
          }
      });

      normalizedOriginSkills.forEach((s: string) => {
           if (!newSkills[s] || newSkills[s].training !== 1) {
               newSkills[s] = { ...newSkills[s], training: 1, customName: 'Origem' };
               hasChanges = true;
           }
      });

      const setTraining = (skill: string) => {
          const current = newSkills[skill] || { training: 0, otherBonus: 0 };
          if (current.training !== 1) {
              newSkills[skill] = { ...current, training: 1 };
              hasChanges = true;
          }
      };

      if (selectedClass === 'ocultista') { setTraining('Ocultismo'); setTraining('Vontade'); }
      if (selectedClass === 'combatente') {
          if (combatenteFightChoice) setTraining(combatenteFightChoice);
          if (combatenteResistChoice) setTraining(combatenteResistChoice);
      }

      selectedSkills.forEach(s => setTraining(s));

      if (hasChanges) { updateCharacter(prev => ({ ...prev, skills: newSkills })); }
  }, [selectedClass, selectedSkills, combatenteFightChoice, combatenteResistChoice, originName]); 

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-4">
      
      <div className="text-center mb-2 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Classe</h2>
        <p className="text-xs md:text-base text-eden-100/50">Como você enfrenta o Paranormal?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        <button
          onClick={() => handleClassSelect('combatente')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'combatente' ? 'bg-red-600/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-red-500 border border-eden-700 group-hover:scale-110 transition-transform`}>
              <Sword size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Combatente</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                A linha de frente. Especialistas em armas, resistência e proteção física.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block border border-white/5">
                <p>PV: 20 (+4) | PE: 2 (+2) | SAN: 12 (+3)</p>
                <p><strong className="text-red-400">Ataque Especial:</strong> Gaste PE para +Ataque ou +Dano.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleClassSelect('especialista')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'especialista' ? 'bg-emerald-600/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-emerald-500 border border-eden-700 group-hover:scale-110 transition-transform`}>
              <Book size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Especialista</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                O cérebro da equipe. Versátil, usa perícias e táticas para resolver problemas.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block border border-white/5">
                <p>PV: 16 (+3) | PE: 3 (+3) | SAN: 16 (+4)</p>
                <p><strong className="text-emerald-400">Perito:</strong> +1d6 em perícias.</p>
                <p><strong className="text-emerald-400">Eclético:</strong> Usa perícias não treinadas.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleClassSelect('ocultista')}
          className={`p-4 md:p-6 rounded-2xl border-2 flex flex-row lg:flex-col items-center lg:items-start gap-4 md:gap-6 transition-all text-left group ${selectedClass === 'ocultista' ? 'bg-violet-600/10 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-eden-800 border-eden-700 hover:border-eden-500'}`}
        >
          <div className={`p-3 md:p-4 rounded-full bg-eden-900 shrink-0 text-violet-500 border border-eden-700 group-hover:scale-110 transition-transform`}>
              <Eye size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Ocultista</h3>
            <p className="text-[10px] md:text-xs text-eden-100/80 mb-2 leading-relaxed">
                Mestres do Outro Lado. Frágeis fisicamente, mas manipulam a Realidade com rituais.
            </p>
            <div className="text-[9px] md:text-[10px] text-eden-100/50 space-y-1 font-mono bg-black/20 p-2 rounded hidden sm:block border border-white/5">
                <p>PV: 12 (+2) | PE: 4 (+4) | SAN: 20 (+5)</p>
                <p><strong className="text-violet-400">Escolhido:</strong> Inicia com 3 rituais.</p>
            </div>
          </div>
        </button>
      </div>

      {selectedClass && (
        <div className="flex-1 bg-eden-800/50 border border-eden-700 rounded-xl p-4 md:p-6 flex flex-col gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex justify-between items-center border-b border-eden-700 pb-2 shrink-0">
                <h3 className="font-bold text-eden-100 text-sm md:text-base flex items-center gap-2">
                    <Check size={16} className="text-energia"/> Perícias Treinadas
                </h3>
                <span className={`text-[10px] md:text-xs px-2 py-1 rounded font-mono font-bold border ${
                    selectedSkills.length === freeSlots 
                    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                    : 'bg-eden-900 text-eden-100/50 border-eden-700'
                }`}>
                    SELECIONADAS: {selectedSkills.length} / {freeSlots}
                </span>
            </div>

            {selectedClass === 'combatente' && (needsFightChoice || needsResistChoice) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 shrink-0">
                    {needsFightChoice && (
                        <div className="bg-eden-900/50 p-3 rounded-lg border border-red-500/30 animate-pulse">
                            <span className="text-[10px] font-bold text-red-400 block mb-2 uppercase tracking-wider">Estilo de Combate (Escolha 1)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCombatenteFightChoice('Luta')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteFightChoice === 'Luta' ? 'bg-red-500 text-white border-red-500 shadow-md' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Luta</button>
                                <button onClick={() => setCombatenteFightChoice('Pontaria')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteFightChoice === 'Pontaria' ? 'bg-red-500 text-white border-red-500 shadow-md' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Pontaria</button>
                            </div>
                        </div>
                    )}
                    {needsResistChoice && (
                        <div className="bg-eden-900/50 p-3 rounded-lg border border-red-500/30 animate-pulse">
                            <span className="text-[10px] font-bold text-red-400 block mb-2 uppercase tracking-wider">Resistência (Escolha 1)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCombatenteResistChoice('Fortitude')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteResistChoice === 'Fortitude' ? 'bg-red-500 text-white border-red-500 shadow-md' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Fortitude</button>
                                <button onClick={() => setCombatenteResistChoice('Reflexos')} className={`flex-1 py-2 text-xs rounded border transition-colors ${combatenteResistChoice === 'Reflexos' ? 'bg-red-500 text-white border-red-500 shadow-md' : 'border-eden-600 text-eden-100/50 hover:bg-eden-800'}`}>Reflexos</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-2 pb-2">
                {REFERENCE_SKILLS.map(skill => {
                    const isOrigin = normalizedOriginSkills.includes(skill);
                    const isAuto = selectedClass === 'ocultista' && (skill === 'Ocultismo' || skill === 'Vontade');
                    const isSelected = selectedSkills.includes(skill);
                    const isCombatChoice = (combatenteFightChoice === skill) || (combatenteResistChoice === skill);
                    const isProfession = skill.startsWith('Profissão');
                    const currentName = character.skills[skill]?.customName;
                    
                    let stateClass = 'border-eden-700 bg-eden-900/30 text-eden-100/40 hover:border-eden-500 hover:bg-eden-700/50'; 
                    let icon = null;

                    if (isOrigin) {
                        stateClass = 'bg-amber-500/10 border-amber-500/50 text-amber-200 cursor-default shadow-[0_0_10px_rgba(245,158,11,0.1)]';
                        icon = <span className="text-[8px] uppercase font-bold opacity-70 tracking-wider">Origem</span>;
                    } else if (isAuto) {
                        stateClass = 'bg-violet-500/10 border-violet-500/50 text-violet-200 cursor-default shadow-[0_0_10px_rgba(139,92,246,0.1)]';
                        icon = <span className="text-[8px] uppercase font-bold opacity-70 tracking-wider">Classe</span>;
                    } else if (isCombatChoice) {
                        stateClass = 'bg-red-500/10 border-red-500/50 text-red-200 cursor-default shadow-[0_0_10px_rgba(239,68,68,0.1)]';
                        icon = <Check size={12}/>;
                    } else if (isSelected) {
                        stateClass = 'bg-eden-100 text-eden-900 border-eden-100 font-bold shadow-md transform scale-[1.02]';
                        icon = <Check size={12}/>;
                    }

                    return (
                        <div key={skill} className="relative group">
                            <button
                                onClick={() => toggleSkill(skill)}
                                disabled={isOrigin || isAuto || isCombatChoice}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-[10px] md:text-xs flex justify-between items-center border transition-all ${stateClass}`}
                            >
                                <span className="truncate pr-2 flex flex-col">
                                    <span>{skill}</span>
                                    {currentName && <span className="text-[8px] opacity-70 truncate max-w-[80px] font-normal italic">({currentName})</span>}
                                </span>
                                {icon}
                            </button>
                            
                            {isProfession && (isOrigin || isSelected) && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); renameSkill(skill); }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-eden-800 text-eden-100 hover:text-energia hover:bg-eden-700 border border-eden-600 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
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
          <div className="flex items-center gap-2 text-yellow-400 text-xs justify-center animate-pulse shrink-0 bg-yellow-400/10 p-2 rounded border border-yellow-400/20">
              <AlertTriangle size={14} />
              <span className="font-bold uppercase tracking-wider">Atenção:</span> Escolha mais {freeSlots - selectedSkills.length} perícias.
          </div>
      )}

    </div>
  );
}