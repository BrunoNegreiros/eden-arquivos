import { useState } from 'react';
import { Zap, BicepsFlexed, Brain, Eye, Shield, Edit2, Pencil, Info } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import { SKILL_LIST } from '../../data/referenceData';
import type { Attribute } from '../../types/systemData';


const SKILL_MAP: Record<string, Attribute> = {
  'Acrobacia': 'AGI', 'Furtividade': 'AGI', 'Iniciativa': 'AGI', 'Pilotagem': 'AGI', 'Pontaria': 'AGI', 'Reflexos': 'AGI', 'Crime': 'AGI',
  'Atletismo': 'FOR', 'Luta': 'FOR',
  'Atualidades': 'INT', 'Ciências': 'INT', 'Investigação': 'INT', 'Medicina': 'INT', 'Ocultismo': 'INT', 'Profissão': 'INT', 'Sobrevivência': 'INT', 'Tática': 'INT', 'Tecnologia': 'INT',
  'Adestramento': 'PRE', 'Artes': 'PRE', 'Diplomacia': 'PRE', 'Enganação': 'PRE', 'Intimidação': 'PRE', 'Intuição': 'PRE', 'Percepção': 'PRE', 'Religião': 'PRE', 'Vontade': 'PRE',
  'Fortitude': 'VIG'
};

const ATTR_ICONS: Record<Attribute, { icon: any, color: string }> = {
  AGI: { icon: Zap, color: 'text-yellow-400' },
  FOR: { icon: BicepsFlexed, color: 'text-red-500' },
  INT: { icon: Brain, color: 'text-blue-400' },
  PRE: { icon: Eye, color: 'text-purple-400' },
  VIG: { icon: Shield, color: 'text-green-500' },
};

const DEGREE_LABELS: Record<number, string> = { 
  0: 'Destreinado', 
  1: 'Treinado (+5)', 
  2: 'Veterano (+10)', 
  3: 'Expert (+15)' 
};

export default function SheetSkills() {
  const { character, vars, updateCharacter, updateSkill } = useCharacter();
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  const changeLevel = (skill: string, newLevel: number) => {
     const nex = character.personal.nex;
     
     if ((newLevel === 2 && nex < 35) || (newLevel === 3 && nex < 70)) {
         alert("NEX insuficiente para este grau de treinamento.");
         return;
     }
     updateSkill(skill, newLevel);
     setEditingSkill(null);
  };

  const renameSkill = (skill: string) => {
      const currentName = character.skills[skill]?.customName || '';
      const newName = prompt(`Definir especialidade (ex: TI, Medicina Legal) para ${skill}:`, currentName);
      if (newName !== null) {
          updateCharacter(prev => ({
              ...prev,
              skills: {
                  ...prev.skills,
                  [skill]: { ...(prev.skills[skill] || { training: 0, otherBonus: 0 }), customName: newName }
              }
          }));
      }
  };

  return (
    <div className="space-y-4">
      {}
      <div className="flex justify-between items-center px-2 py-1 bg-eden-950/30 rounded-lg border border-eden-700/50">
        <span className="text-[10px] font-bold text-eden-100/40 uppercase tracking-widest">Painel de Perícias</span>
        <span className="text-[10px] font-bold text-energia uppercase">
            {Object.values(character.skills).filter(s => s.training > 0).length} Perícias Treinadas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SKILL_LIST.map(skill => {
            const attrKey = SKILL_MAP[skill] || 'INT';
            const { icon: Icon, color } = ATTR_ICONS[attrKey];
            
            
            const charSkillData = character.skills[skill] || { training: 0, otherBonus: 0 };
            
            
            const calculated = vars.SKILLS[skill] || { total: 0, dice: 0, trainingBonus: 0, otherBonus: 0 };
            
            const isTrained = charSkillData.training > 0;
            const isProfession = skill.includes('Profissão');

            return (
                <div key={skill} className={`relative rounded-xl border transition-all group ${isTrained ? 'bg-eden-800/60 border-eden-600/50' : 'bg-eden-900/20 border-eden-800/30'}`}>
                    <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-eden-900 shadow-inner ${color}`}><Icon size={16} /></div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-black uppercase tracking-tight ${isTrained ? 'text-white' : 'text-eden-100/30'}`}>
                                        {skill}
                                    </span>
                                    {charSkillData.customName && (
                                        <span className="text-[10px] text-energia/70 font-bold bg-energia/5 px-1.5 rounded border border-energia/10">
                                            {charSkillData.customName}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-eden-100/20 uppercase">
                                    {DEGREE_LABELS[charSkillData.training]}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {}
                            <div className="text-center">
                                <div className="text-xs font-black text-eden-100/40 leading-none">{calculated.dice}d20</div>
                                <div className="text-[8px] font-bold text-eden-100/20 uppercase">Dados</div>
                            </div>
                            
                            {}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 ${isTrained ? 'bg-eden-950 text-white border-eden-600 shadow-lg' : 'text-eden-100/10 border-eden-800/50'}`}>
                                {calculated.total >= 0 ? `+${calculated.total}` : calculated.total}
                            </div>
                        </div>
                    </div>
                    
                    {}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isProfession && (
                            <button onClick={() => renameSkill(skill)} className="p-1.5 rounded bg-eden-900 text-eden-100/50 hover:text-energia border border-eden-700" title="Anotar Especialidade"><Pencil size={12} /></button>
                        )}
                        <button onClick={() => setEditingSkill(editingSkill === skill ? null : skill)} className={`p-1.5 rounded bg-eden-900 border border-eden-700 transition-colors ${editingSkill === skill ? 'text-energia border-energia' : 'text-eden-100/50 hover:text-white'}`} title="Mudar Treinamento"><Edit2 size={12} /></button>
                    </div>

                    {}
                    {editingSkill === skill && (
                        <div className="p-3 border-t border-eden-700 bg-eden-950/80 rounded-b-xl animate-in slide-in-from-top-1">
                            <div className="flex justify-between gap-1">
                                {[0, 1, 2, 3].map(lvl => {
                                    const nex = character.personal.nex;
                                    const locked = (lvl === 2 && nex < 35) || (lvl === 3 && nex < 70);
                                    
                                    return (
                                    <button 
                                        key={lvl} 
                                        disabled={locked} 
                                        onClick={() => changeLevel(skill, lvl)} 
                                        className={`px-1 py-1 rounded text-[9px] uppercase font-black flex-1 border transition-all ${charSkillData.training === lvl ? 'bg-energia text-eden-900 border-energia' : locked ? 'opacity-20 cursor-not-allowed border-transparent' : 'bg-eden-900 text-eden-100/40 border-eden-700 hover:border-eden-500'}`}
                                    >
                                        {DEGREE_LABELS[lvl].split(' ')[0]}
                                    </button>
                                )})}
                            </div>
                        </div>
                    )}
                </div>
            )
        })}
      </div>

      <div className="mt-4 p-3 bg-eden-950/20 border border-eden-800 rounded-lg flex items-start gap-2">
        <Info size={14} className="text-eden-100/30 mt-0.5" />
        <p className="text-[10px] text-eden-100/40 leading-relaxed italic">
            Os bônus exibidos já incluem bônus de treinamento, itens equipados e poderes ativos. Clique no ícone de lápis para alterar o nível de treinamento ou anotar especialidades em "Profissão".
        </p>
      </div>
    </div>
  );
}