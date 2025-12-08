import { useState, useEffect } from 'react';
import { Zap, BicepsFlexed, Brain, Eye, Shield, Edit2, Crown, AlertTriangle, Pencil } from 'lucide-react';
import type { CharacterSheet, AttributeKey, SkillLevel } from '../../types/characterSchema';
import { SKILL_LIST } from '../../data/referenceData';
import { ORIGINS } from '../../data/origins';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

const SKILL_MAP: Record<string, AttributeKey> = {
  'Acrobacia': 'agi', 'Furtividade': 'agi', 'Iniciativa': 'agi', 'Pilotagem': 'agi', 'Pontaria': 'agi', 'Reflexos': 'agi', 'Crime': 'agi',
  'Atletismo': 'for', 'Luta': 'for',
  'Atualidades': 'int', 'Ciências': 'int', 'Investigação': 'int', 'Medicina': 'int', 'Ocultismo': 'int', 'Profissão': 'int', 'Profissão 2': 'int', 'Profissão 3': 'int', 'Sobrevivência': 'int', 'Tática': 'int', 'Tecnologia': 'int',
  'Adestramento': 'pre', 'Artes': 'pre', 'Diplomacia': 'pre', 'Enganação': 'pre', 'Intimidação': 'pre', 'Intuição': 'pre', 'Percepção': 'pre', 'Religião': 'pre', 'Vontade': 'pre',
  'Fortitude': 'vig'
};

const ATTR_ICONS = {
  agi: { icon: Zap, color: 'text-yellow-400' },
  for: { icon: BicepsFlexed, color: 'text-red-500' },
  int: { icon: Brain, color: 'text-blue-400' },
  pre: { icon: Eye, color: 'text-purple-400' },
  vig: { icon: Shield, color: 'text-green-500' },
};

const DEGREE_BONUS = { destreinado: 0, treinado: 5, veterano: 10, expert: 15 };

export default function SheetSkills({ character, onUpdate }: Props) {
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<{ skill: string, result: number, dice: number[], bonus: number, isCrit: boolean } | null>(null);

  const currentLoad = character.inventory.items.reduce((acc, item) => acc + (item.space * item.quantity), 0);
  const maxLoad = (character.attributes.for === 0 ? 2 : character.attributes.for * 5) + (character.progression.class === 'combatente' ? 0 : 0); 
  const isOverburdened = currentLoad > maxLoad;

  const trainedCount = Object.values(character.skills).filter(s => s.isTrained).length;
  
  const getRequiredSkills = () => {
     const cls = character.progression.class;
     const int = character.attributes.int;
     let base = 0;
     if (cls === 'combatente') base = 3;
     if (cls === 'ocultista') base = 5;
     if (cls === 'especialista') base = 7;
     return base + int + 2;
  };

  const requiredSkills = getRequiredSkills();
  const isSetupMode = trainedCount < requiredSkills;

  // --- AUTOMATIZAÇÃO DE ORIGEM (CORRIGIDA) ---
  useEffect(() => {
    const originName = character.progression.origin.name;
    if (!originName) return;

    const originData = ORIGINS.find(o => o.name === originName);
    if (!originData) return;

    const newSkills = { ...character.skills };
    let hasUpdates = false;

    originData.skills.forEach(skillName => {
        // Normaliza o nome (remove acentos ou variações se necessário, mas vamos focar no exato)
        // Se a origem dá "Profissão", procuramos o slot 'Profissão'
        let targetKey = skillName;
        
        if (skillName.includes('Profissão')) {
            targetKey = 'Profissão';
            // Se Profissão já está ocupada por outra coisa (e não é essa origem), tenta a 2
            if (newSkills['Profissão']?.isTrained && newSkills['Profissão']?.customName !== originName) {
                targetKey = 'Profissão 2';
            }
        }

        const currentData = newSkills[targetKey];
        
        // Se não está treinado OU se é Profissão e o nome não está definido
        if (!currentData || !currentData.isTrained || (targetKey.includes('Profissão') && currentData.customName !== originName)) {
            newSkills[targetKey] = {
                level: 'treinado',
                isTrained: true,
                miscBonus: currentData?.miscBonus || 0,
                // Se for profissão, forçamos o nome da origem (ex: Chef)
                customName: targetKey.includes('Profissão') ? originName : currentData?.customName
            };
            hasUpdates = true;
        }
    });

    if (hasUpdates) {
        console.log("Aplicando perícias de origem (Correção)...", newSkills);
        onUpdate({ skills: newSkills });
    }
  }, [character.progression.origin.name]); // Executa sempre que a origem muda (ou no carregamento inicial com origem definida)

  const getAutoBonus = (skill: string) => {
    let bonus = 0;
    const sources: string[] = [];
    const attrKey = SKILL_MAP[skill] || 'int';

    if (isOverburdened && ['for', 'agi', 'vig'].includes(attrKey)) {
        bonus -= 5;
        sources.push('Sobrecarga (-5)');
    }

    character.inventory.items.forEach(item => {
        if (!item.isEquipped) return;
        if (item.name.toLowerCase().includes(skill.toLowerCase())) {
            let itemBonus = 0;
            if (item.type === 'accessory') itemBonus = 2;
            if (item.subType === 'kit') itemBonus = 0; 
            if (item.modifications.some(m => m.id === 'aprimorado')) itemBonus = 5;
            if (itemBonus > 0) { bonus += itemBonus; sources.push(`${item.name} (+${itemBonus})`); }
        }
    });

    character.teamStrategy.roleAbilities.forEach((ability: any) => {
        if (ability.id === 'olheiro' && skill === 'Iniciativa') {
             const levelBonus = [0, 2, 4, 6, 8, 10][ability.currentLevel];
             if (levelBonus > 0) { bonus += levelBonus; sources.push(`Olheiro (+${levelBonus})`); }
        }
    });

    return { value: bonus, sources };
  };

  const rollSkill = (skillName: string) => {
    if (isSetupMode) return;
    const attrKey = SKILL_MAP[skillName] || 'int';
    const attrValue = character.attributes[attrKey];
    const skillData = character.skills[skillName] || { level: 'destreinado', isTrained: false, miscBonus: 0 };
    const autoBonus = getAutoBonus(skillName);
    
    const totalBonus = DEGREE_BONUS[skillData.level] + skillData.miscBonus + autoBonus.value;
    const diceCount = Math.max(1, attrValue);
    const rolls = Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 20));
    const bestDice = attrValue <= 0 ? Math.min(...rolls) : Math.max(...rolls);
    
    const displayName = skillData.customName ? `${skillName} (${skillData.customName})` : skillName;
    setLastRoll({ skill: displayName, result: bestDice + totalBonus, dice: rolls, bonus: totalBonus, isCrit: bestDice === 20 });
  };

  const toggleTraining = (skill: string) => {
      const isTrained = character.skills[skill]?.isTrained;
      if (isSetupMode && !isTrained && trainedCount >= requiredSkills) return;

      onUpdate({
         skills: {
             ...character.skills,
             [skill]: {
                 ...(character.skills[skill] || { miscBonus: 0 }),
                 level: isTrained ? 'destreinado' : 'treinado',
                 isTrained: !isTrained
             }
         }
      });
  };

  const changeLevel = (skill: string, newLevel: SkillLevel) => {
     const nex = character.progression.nex;
     if ((newLevel === 'veterano' && nex < 35) || (newLevel === 'expert' && nex < 70)) return;

     onUpdate({
         skills: {
             ...character.skills,
             [skill]: { ...(character.skills[skill] || { miscBonus: 0 }), level: newLevel, isTrained: newLevel !== 'destreinado' }
         }
     });
     setEditingSkill(null);
  };

  const renameSkill = (skill: string) => {
      const currentName = character.skills[skill]?.customName || '';
      const newName = prompt(`Definir especialidade para ${skill}:`, currentName);
      if (newName !== null) {
          onUpdate({
              skills: {
                  ...character.skills,
                  [skill]: { ...(character.skills[skill] || { level: 'destreinado', isTrained: false, miscBonus: 0 }), customName: newName }
              }
          });
      }
  };

  return (
    <div className="space-y-6">
      
      {isSetupMode && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-4 flex items-start gap-4 animate-pulse">
              <AlertTriangle size={32} className="text-red-500 shrink-0" />
              <div>
                  <h3 className="text-lg font-bold text-red-100">ATENÇÃO: Ficha Incompleta</h3>
                  <p className="text-sm text-red-200/80 mb-2">
                      Você precisa selecionar suas perícias iniciais antes de usar a ficha.
                  </p>
                  <div className="text-xs font-mono bg-black/30 p-2 rounded text-red-300">
                      Treinadas: {trainedCount} / {requiredSkills}
                  </div>
              </div>
          </div>
      )}

      {lastRoll && (
        <div className={`border p-4 rounded-xl animate-in slide-in-from-top-2 shadow-2xl relative overflow-hidden ${lastRoll.isCrit ? 'bg-yellow-900/40 border-yellow-500/50' : 'bg-eden-900 border-eden-600'}`}>
            {lastRoll.isCrit && <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none"><Crown size={100} className="text-yellow-400" /></div>}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-eden-100/50 uppercase font-bold">Resultado: {lastRoll.skill}</div>
                    {lastRoll.isCrit && <div className="text-xs font-black text-yellow-400 uppercase tracking-widest animate-pulse">Sucesso Crítico</div>}
                </div>
                <div className="flex items-end gap-3">
                    <span className={`text-5xl font-black ${lastRoll.isCrit ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-white'}`}>{lastRoll.result}</span>
                    <div className="text-sm text-eden-100/60 pb-2 font-mono">
                        Dados: [{lastRoll.dice.map((d, i) => <span key={i} className={d === 20 ? "text-yellow-400 font-bold" : ""}>{d}{i < lastRoll.dice.length - 1 ? ', ' : ''}</span>)}] + {lastRoll.bonus}
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-100 transition-opacity">
        {SKILL_LIST.map(skill => {
            const attrKey = SKILL_MAP[skill] || 'int';
            const { icon: Icon, color } = ATTR_ICONS[attrKey];
            const data = character.skills[skill] || { level: 'destreinado', miscBonus: 0 };
            const autoBonus = getAutoBonus(skill);
            const totalBonus = DEGREE_BONUS[data.level] + data.miscBonus + autoBonus.value;
            const isTrained = data.level !== 'destreinado';
            const isProfession = skill.startsWith('Profissão');

            return (
                <div key={skill} className={`relative rounded-lg border transition-all group ${isTrained ? 'bg-eden-800/40 border-eden-600' : 'bg-eden-900/20 border-eden-700/30'}`}>
                    <button 
                        onClick={() => isSetupMode ? toggleTraining(skill) : rollSkill(skill)}
                        className="w-full flex justify-between items-center p-2.5 pl-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded bg-eden-900 ${color}`}><Icon size={14} /></div>
                            <div>
                                <span className={`text-sm font-bold block ${isTrained ? 'text-eden-100' : 'text-eden-100/40'}`}>
                                    {skill} {data.customName && <span className="text-eden-100/60 font-normal italic">({data.customName})</span>}
                                </span>
                                <span className="text-[10px] uppercase text-eden-100/30 font-bold tracking-wider">{data.level}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {autoBonus.value !== 0 && (
                                <div className={`text-[10px] px-1.5 py-0.5 rounded border ${autoBonus.value > 0 ? 'text-cyan-400 border-cyan-900 bg-cyan-950/30' : 'text-red-400 border-red-900 bg-red-950/30'}`} title={autoBonus.sources.join('\n')}>
                                    {autoBonus.value > 0 ? '+' : ''}{autoBonus.value}
                                </div>
                            )}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${isTrained ? 'bg-eden-900 text-white border border-eden-600 shadow-inner' : 'text-eden-100/20'}`}>
                                {totalBonus >= 0 ? `+${totalBonus}` : totalBonus}
                            </div>
                        </div>
                    </button>
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Botão Renomear Profissão */}
                        {isProfession && isTrained && (
                            <button onClick={(e) => { e.stopPropagation(); renameSkill(skill); }} className="p-1.5 rounded bg-eden-950 text-eden-100 hover:bg-energia hover:text-eden-900 border border-eden-700 transition-colors"><Pencil size={12} /></button>
                        )}
                        {!isSetupMode && (
                            <button onClick={(e) => { e.stopPropagation(); setEditingSkill(skill === editingSkill ? null : skill); }} className={`p-1.5 rounded bg-eden-950 text-eden-100 hover:bg-eden-700 border border-eden-700 transition-colors ${editingSkill === skill ? 'bg-eden-700 text-white' : ''}`}><Edit2 size={12} /></button>
                        )}
                    </div>

                    {editingSkill === skill && !isSetupMode && (
                        <div className="p-3 border-t border-eden-700 bg-eden-900/80 rounded-b-lg animate-in slide-in-from-top-1 z-20 relative">
                            <div className="flex justify-between gap-1">
                                {(['destreinado', 'treinado', 'veterano', 'expert'] as SkillLevel[]).map(lvl => {
                                    const nex = character.progression.nex;
                                    const locked = (lvl === 'veterano' && nex < 35) || (lvl === 'expert' && nex < 70);
                                    return (
                                    <button key={lvl} disabled={locked} onClick={() => changeLevel(skill, lvl)} className={`px-2 py-1 rounded text-[10px] uppercase font-bold flex-1 border transition-all ${data.level === lvl ? 'bg-energia text-eden-900 border-energia' : locked ? 'bg-eden-950/50 text-eden-100/10 border-eden-800 cursor-not-allowed' : 'bg-eden-950 text-eden-100/50 border-eden-700 hover:border-eden-500'}`}>
                                        {lvl.slice(0, 3)}
                                    </button>
                                )})}
                            </div>
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}