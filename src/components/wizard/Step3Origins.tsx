import { useState, useEffect } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { 
  Plus, Trash2, Edit2, X, HelpCircle, Zap, Shield, Settings
} from 'lucide-react';
import EffectEditor from '../sheet/EffectEditor';

const SKILL_OPTIONS = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
  "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", 
  "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", 
  "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", 
  "Tática", "Tecnologia", "Vontade"
];

interface CustomOriginState {
    id: string;
    name: string;
    source: string;
    description: string;
    trainedSkills: string[];
    power: {
        name: string;
        description: string;
        cost?: number; 
        effects: any[];
    };
}

export default function Step3Origins() {
  const { character, updateCharacter } = useCharacter();
  
  const [origin, setOrigin] = useState<CustomOriginState>({
    id: '', name: '', source: 'Própria', description: '', trainedSkills: [],
    power: { name: '', description: '', cost: 0, effects: [] } 
  });

  useEffect(() => {
    if (character.personal.origin) {
        
        const customOrig = character.customOrigin;
        if (customOrig) {
            setOrigin(customOrig as any);
        } else {
            setOrigin((prev: any) => ({ ...prev, name: character.personal.origin }));
        }
    }
  }, []);

  useEffect(() => {
    const cleanId = origin.name.toLowerCase().trim().replace(/\s+/g, '_');
    updateCharacter((prev: any) => {
        const resetSkills = { ...prev.skills };
        Object.keys(resetSkills).forEach(k => {
            if (resetSkills[k].training === 1 && resetSkills[k].customName === 'Origem') {
                resetSkills[k].training = 0;
                resetSkills[k].customName = undefined;
            }
        });
        origin.trainedSkills.forEach((skill: string) => {
            if (resetSkills[skill]) {
                resetSkills[skill] = { ...resetSkills[skill], training: 1, customName: 'Origem' };
            }
        });
        return {
            ...prev,
            personal: { ...prev.personal, origin: origin.name },
            skills: resetSkills,
            customOrigin: { ...origin, id: cleanId }
        };
    });
  }, [origin]);

  const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);

  const toggleSkill = (skill: string) => {
    setOrigin((prev: CustomOriginState) => {
      if (prev.trainedSkills.includes(skill)) return { ...prev, trainedSkills: prev.trainedSkills.filter((s: string) => s !== skill) };
      if (prev.trainedSkills.length >= 2) return prev; 
      return { ...prev, trainedSkills: [...prev.trainedSkills, skill] };
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <div className="text-center"><h2 className="text-3xl font-black text-eden-100 uppercase">Criar Origem</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-eden-900/50 p-6 rounded-2xl border border-eden-700/50 space-y-4">
             <h3 className="text-energia font-bold uppercase text-sm flex items-center gap-2"><HelpCircle size={16}/> Identidade</h3>
             <input type="text" value={origin.name} onChange={(e) => setOrigin({...origin, name: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-eden-100 font-bold text-lg" placeholder="Nome da Origem..."/>
             <textarea value={origin.description} onChange={(e) => setOrigin({...origin, description: e.target.value})} rows={4} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-eden-100 text-sm resize-none" placeholder="História..."/>
          </div>
          <div className="bg-eden-900/50 p-6 rounded-2xl border border-eden-700/50 space-y-4">
             <h3 className="text-conhecimento font-bold uppercase text-sm flex items-center gap-2"><Shield size={16}/> Perícias ({origin.trainedSkills.length}/2)</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
               {SKILL_OPTIONS.map(skill => (
                   <button key={skill} onClick={() => toggleSkill(skill)} disabled={!origin.trainedSkills.includes(skill) && origin.trainedSkills.length >= 2} className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${origin.trainedSkills.includes(skill) ? 'bg-conhecimento text-eden-950 border-conhecimento' : (!origin.trainedSkills.includes(skill) && origin.trainedSkills.length >= 2) ? 'opacity-30 cursor-not-allowed bg-eden-950 border-eden-800' : 'bg-eden-950 text-eden-100/70 border-eden-800 hover:border-conhecimento/50'}`}>{skill}</button>
               ))}
             </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-eden-900/50 p-6 rounded-2xl border border-eden-700/50 space-y-4 h-full flex flex-col">
             <h3 className="text-sangue font-bold uppercase text-sm flex items-center gap-2"><Zap size={16}/> Poder da Origem</h3>
             
             {}
             <div className="flex gap-3">
                 <input type="text" value={origin.power.name} onChange={(e) => setOrigin({...origin, power: {...origin.power, name: e.target.value}})} className="flex-1 bg-eden-950 border border-eden-700 rounded-xl p-3 text-eden-100 focus:border-sangue outline-none font-bold" placeholder="Nome do poder..."/>
                 <input type="number" value={origin.power.cost || 0} onChange={(e) => setOrigin({...origin, power: {...origin.power, cost: Number(e.target.value)}})} className="w-20 bg-eden-950 border border-eden-700 rounded-xl p-3 text-eden-100 text-center focus:border-sangue outline-none font-bold" title="Custo em PE" placeholder="PE"/>
             </div>

             <textarea value={origin.power.description} onChange={(e) => setOrigin({...origin, power: {...origin.power, description: e.target.value}})} rows={3} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-eden-100 focus:border-sangue outline-none text-sm resize-none" placeholder="Efeito técnico..."/>
             
             <div className="flex-1 bg-eden-950/50 rounded-xl border border-eden-800 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-end border-b border-eden-800 pb-2">
                  <label className="text-[10px] text-eden-100/40 uppercase font-bold tracking-widest">Efeitos (Automação)</label>
                  <button 
                      onClick={() => {
                          const newEffect = { id: Date.now().toString(), name: 'Novo Efeito', category: 'add_fixed', value: { terms: [{ id: '1', type: 'fixed', value: 1 }], operations: [] }, targets: [] } as any;
                          const newEffectsList = [...(origin.power.effects || []), newEffect];
                          setOrigin((prev: any) => ({ ...prev, power: { ...prev.power, effects: newEffectsList } }));
                          setEditingEffectIndex(newEffectsList.length - 1);
                      }} 
                      className="text-xs flex items-center gap-1 bg-eden-800 hover:bg-sangue hover:text-white px-3 py-1.5 rounded-lg transition-all"
                  >
                      <Plus size={14}/> Novo
                  </button>
                </div>
                
                <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                  {origin.power.effects.map((eff: any, idx: number) => (
                    <div key={eff.id} className="bg-eden-900 border border-eden-700 rounded-lg p-3 flex justify-between items-center group hover:border-sangue/50 transition-colors">
                       <div>
                           <span className="text-xs font-bold text-energia block mb-0.5 capitalize">
                               {eff.name ? eff.name : eff.category.replace('_', ' ')}
                           </span>
                           <span className="text-[10px] text-eden-100/70">{eff.targets?.length || 0} alvo(s) configurado(s)</span>
                       </div>
                       <div className="flex gap-1">
                         <button onClick={() => setEditingEffectIndex(idx)} className="p-2 hover:bg-eden-800 rounded text-eden-100/50 hover:text-white"><Edit2 size={14}/></button>
                         <button onClick={() => {
                             const newEffects = [...(origin.power.effects || [])];
                             newEffects.splice(idx, 1);
                             setOrigin((prev: any) => ({ ...prev, power: { ...prev.power, effects: newEffects } }));
                         }} className="p-2 hover:bg-red-900/30 rounded text-eden-100/50 hover:text-red-400"><Trash2 size={14}/></button>
                       </div>
                    </div>
                  ))}
                  {(!origin.power.effects || origin.power.effects.length === 0) && (
                      <p className="text-[10px] text-eden-100/30 italic text-center py-4 border border-dashed border-eden-800 rounded-lg">Poder sem atributos automatizados.</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {editingEffectIndex !== null && origin.power.effects?.[editingEffectIndex] && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0">
                      <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2"><Settings size={16} className="text-energia"/> Configurar Efeito</h3>
                      <button onClick={() => setEditingEffectIndex(null)} className="text-eden-100/50 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                      <EffectEditor
                          effect={origin.power.effects[editingEffectIndex]}
                          onChange={(updatedEffect: any) => {
                              const newEffects = [...(origin.power.effects || [])];
                              newEffects[editingEffectIndex] = updatedEffect;
                              setOrigin((prev: any) => ({ ...prev, power: { ...prev.power, effects: newEffects } }));
                          }}
                          onRemove={() => {
                              const newEffects = [...(origin.power.effects || [])];
                              newEffects.splice(editingEffectIndex, 1);
                              setOrigin((prev: any) => ({ ...prev, power: { ...prev.power, effects: newEffects } }));
                              setEditingEffectIndex(null);
                          }}
                      />
                  </div>

                  <div className="p-4 border-t border-eden-700 bg-eden-800 shrink-0 flex justify-end">
                      <button onClick={() => setEditingEffectIndex(null)} className="bg-energia text-eden-900 font-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(250,176,5,0.3)]">
                          Concluir Edição
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}