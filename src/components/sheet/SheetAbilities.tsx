import { useState } from 'react';
import { Book, Plus, Trash2, Zap, Ghost, X, Edit2, GraduationCap, Power } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import type { UserAbility } from '../../types/systemData';
import EffectEditor from './EffectEditor';

type AppAbility = UserAbility & { isActive?: boolean; isInjected?: boolean; isOverridden?: boolean; element?: string };

const SOURCE_COLORS: Record<string, string> = {
    'Origem': 'text-emerald-400 border-emerald-500 bg-emerald-500/10',
    'Classe': 'text-blue-400 border-blue-500 bg-blue-500/10',
    'Trilha': 'text-fuchsia-400 border-fuchsia-500 bg-fuchsia-500/10',
    'Paranormal': 'text-purple-400 border-purple-500 bg-purple-500/10',
    'Equipe': 'text-cyan-400 border-cyan-500 bg-cyan-500/10',
    'Outro': 'text-zinc-400 border-zinc-500 bg-zinc-500/10'
};

export const AbilityForm = ({ initialData, onSave, onCancel }: { initialData?: UserAbility, onSave: (a: UserAbility) => void, onCancel: () => void }) => {
    const [data, setData] = useState<any>(initialData || { id: Date.now().toString(), name: '', source: 'Outro', element: 'Sangue', description: '', effects: [], isActive: false });
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
             <div className="bg-eden-900 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-eden-600 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center"><h3 className="font-black text-white text-lg flex items-center gap-2"><Zap className="text-energia"/> {initialData ? 'Editar Habilidade' : 'Nova Habilidade'}</h3><button onClick={onCancel} className="text-eden-100/50 hover:text-white"><X size={24}/></button></div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50">Nome da Habilidade</label><input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-lg p-3 text-white font-bold outline-none focus:border-energia" placeholder="Ex: Golpe Demolidor"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50">Fonte do Poder</label><select value={data.source} onChange={e => setData({...data, source: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-lg p-3 text-sm text-white"><option value="Classe">Classe</option><option value="Trilha">Trilha</option><option value="Origem">Origem</option><option value="Paranormal">Paranormal</option><option value="Equipe">Equipe</option><option value="Outro">Outro</option></select></div>
                        {data.source === 'Paranormal' && (<div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50">Elemento</label><select value={data.element || 'Sangue'} onChange={e => setData({...data, element: e.target.value})} className="w-full bg-purple-950/20 border border-purple-900/50 rounded-lg p-3 text-sm text-purple-100">{['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(el => <option key={el} value={el}>{el}</option>)}</select></div>)}
                    </div>
                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50">Descrição / Regras</label><textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full h-24 bg-eden-950 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 outline-none resize-none" placeholder="Descreva o funcionamento narrativo e mecânico..." /></div>
                    <div className="pt-4 border-t border-eden-700/50">
                        <div className="flex justify-between items-center mb-3"><label className="text-xs font-bold text-eden-100/60 uppercase">Efeitos Mecânicos Atrelados</label><button onClick={() => setData({...data, effects: [...(data.effects || []), { id: Date.now().toString(), category: 'add_fixed', value: {terms:[], operations:[]}, targets: [] }]})} className="bg-eden-800 text-energia px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-eden-700"><Plus size={12}/> Adicionar</button></div>
                        <div className="space-y-3">{(data.effects || []).map((eff: any, idx: number) => (<EffectEditor key={eff.id} effect={eff} onChange={(newEff) => { const n = [...data.effects!]; n[idx] = newEff; setData({...data, effects: n}); }} onRemove={() => { const n = [...data.effects!]; n.splice(idx,1); setData({...data, effects: n}); }} />))}</div>
                    </div>
                </div>
                <div className="p-4 border-t border-eden-700 bg-eden-800 flex justify-end gap-3"><button onClick={onCancel} className="px-4 py-2 text-eden-100 hover:bg-eden-700 rounded-lg text-sm font-bold">Cancelar</button><button onClick={() => onSave(data as UserAbility)} disabled={!data.name} className="px-6 py-2 bg-energia text-eden-900 rounded-lg text-sm font-black hover:bg-yellow-400">Salvar Habilidade</button></div>
             </div>
        </div>
    );
};

export default function SheetAbilities() {
  const { character, vars, updateCharacter } = useCharacter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingAbility, setEditingAbility] = useState<UserAbility | null>(null);

  const allBaseAbilities = [...(character.classPowers || []), ...((character as any).abilities || [])];
  
  
  const allAbilitiesRaw = allBaseAbilities.map(a => vars.OVERRIDDEN_ABILITIES[a.id] ? { ...vars.OVERRIDDEN_ABILITIES[a.id], id: a.id, isActive: a.isActive, isOverridden: true } : a);
  const injectedAbilities = (vars.INJECTED_ABILITIES || []).map((a: any) => ({ ...a, isInjected: true }));
  const finalAbilities = [...allAbilitiesRaw, ...injectedAbilities];

  const deepUpdatePayload = (prev: any, payloadId: string, mutator: (payload: any) => any) => {
      const scan = (items: any[]) => items.map(item => {
          if (item.effects) return { ...item, effects: item.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e) };
          return item;
      });
      let newOrigin = prev.customOrigin;
      if (newOrigin) {
          newOrigin = { ...newOrigin };
          if (newOrigin.effects) newOrigin.effects = newOrigin.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e);
          if (newOrigin.power?.effects) newOrigin.power = { ...newOrigin.power, effects: newOrigin.power.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e) };
      }
      return { ...prev, inventory: scan(prev.inventory||[]), abilities: scan(prev.abilities||[]), classPowers: scan(prev.classPowers||[]), rituals: scan(prev.rituals||[]), conditions: scan(prev.conditions||[]), customOrigin: newOrigin };
  };

  const handleSave = (ability: UserAbility) => {
      if ((ability as any).isInjected) {
          updateCharacter(prev => deepUpdatePayload(prev, ability.id, () => { const copy = {...ability}; delete (copy as any).isInjected; return copy; }));
          setIsCreating(false); setEditingAbility(null); return;
      }
      const isClassPower = character.classPowers?.some(p => p.id === ability.id);
      if (editingAbility) {
          if (isClassPower) updateCharacter(prev => ({ ...prev, classPowers: prev.classPowers?.map(p => p.id === ability.id ? ability : p) }));
          else updateCharacter(prev => ({ ...prev, abilities: (prev as any).abilities.map((a: any) => a.id === ability.id ? ability : a) }));
          setEditingAbility(null);
      } else {
          updateCharacter(prev => ({ ...prev, abilities: [...((prev as any).abilities || []), ability] }));
          setIsCreating(false);
      }
  };

  const handleDelete = (id: string) => {
      if(!confirm("Excluir esta habilidade?")) return;
      const isClassPower = character.classPowers?.some(p => p.id === id);
      if (isClassPower) updateCharacter(prev => ({ ...prev, classPowers: prev.classPowers?.filter(p => p.id !== id) }));
      else updateCharacter(prev => ({ ...prev, abilities: (prev as any).abilities.filter((a: any) => a.id !== id) }));
  };

  const handleToggleAbility = (ability: AppAbility) => {
      
      if (ability.isInjected) {
          updateCharacter(prev => deepUpdatePayload(prev, ability.id, (p) => ({ ...p, isActive: !p.isActive })));
          return;
      }
      const isClassPower = character.classPowers?.some(p => p.id === ability.id);
      if (isClassPower) updateCharacter(prev => ({ ...prev, classPowers: prev.classPowers?.map(p => p.id === ability.id ? { ...p, isActive: !p.isActive } : p) }));
      else updateCharacter(prev => ({ ...prev, abilities: (prev as any).abilities.map((a: any) => a.id === ability.id ? { ...a, isActive: !a.isActive } : a) }));
  };

  
  const toggleActiveEffect = (abilityId: string, effectId: string, isVirtual?: boolean) => {
      if (isVirtual) {
          updateCharacter(prev => deepUpdatePayload(prev, abilityId, (p) => ({ ...p, effects: (p.effects||[]).map((e:any) => e.id === effectId ? { ...e, isActive: e.isActive === false ? true : false } : e) })));
          return;
      }
      const isClassPower = character.classPowers?.some(p => p.id === abilityId);
      if (isClassPower) {
          
          updateCharacter(prev => ({ ...prev, classPowers: prev.classPowers?.map(p => p.id === abilityId ? { ...p, effects: (p.effects||[]).map((e: any) => e.id === effectId ? { ...e, isActive: e.isActive === false ? true : false } : e) } : p) }));
      } else {
          updateCharacter(prev => ({ ...prev, abilities: (prev as any).abilities.map((a: any) => a.id === abilityId ? { ...a, effects: (a.effects||[]).map((e:any) => e.id === effectId ? { ...e, isActive: e.isActive === false ? true : false } : e) } : a) }));
      }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-sm sticky top-0 z-10">
            <h2 className="text-lg font-black text-white flex items-center gap-2"><Zap className="text-energia" /> Habilidades</h2>
            <button onClick={() => setIsCreating(true)} className="bg-energia hover:bg-yellow-400 text-eden-900 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-lg"><Plus size={16}/> Nova Habilidade</button>
        </div>

        <div className="space-y-4">
            {finalAbilities.length === 0 ? (
                <div className="text-center py-10 text-eden-100/30 border-2 border-dashed border-eden-800 rounded-xl">Você não possui habilidades cadastradas.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finalAbilities.map((ability: AppAbility) => {
                        const sourceKey = ability.source || 'Outro';
                        const colors = SOURCE_COLORS[sourceKey] || SOURCE_COLORS['Outro'];
                        
                        return (
                            <div key={ability.id} className={`bg-eden-900/50 border rounded-xl overflow-hidden flex flex-col relative ${ability.isInjected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-eden-700'}`}>
                                {ability.isInjected && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">Concedido por Efeito</div>}

                                <div className={`p-3 border-b border-eden-700/50 flex items-center gap-3 ${colors.replace('border-', 'border-b-').replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 ')}`}>
                                    <div className={`p-2 rounded bg-black/40 ${colors.split(' ')[0]}`}>{ability.source === 'Paranormal' ? <Ghost size={16}/> : ability.source === 'Classe' ? <GraduationCap size={16}/> : <Book size={16}/>}</div>
                                    <div className="flex-1 pr-6">
                                        <h3 className="font-bold text-white leading-tight">{ability.name}</h3>
                                        <span className={`text-[10px] uppercase font-bold ${colors.split(' ')[0]}`}>{ability.source} {ability.source === 'Paranormal' && `• ${ability.element}`}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingAbility(ability)} className="p-1.5 text-eden-100/50 hover:text-white bg-black/20 rounded"><Edit2 size={12}/></button>
                                        {!ability.isInjected && (
                                            <button onClick={() => handleDelete(ability.id)} className="p-1.5 text-eden-100/50 hover:text-red-400 bg-black/20 rounded"><Trash2 size={12}/></button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4 flex-1">
                                    <p className="text-xs text-eden-100/80 leading-relaxed whitespace-pre-wrap">{ability.description}</p>
                                </div>

                                {}
                                {ability.isActive && ability.effects && ability.effects.length > 0 && (
                                    <div className="space-y-1 pt-2 border-t border-eden-700/50 px-4 pb-4 bg-eden-900/30">
                                        <div className="text-[10px] font-bold text-energia uppercase flex items-center gap-1"><Zap size={10}/> Efeitos Ativos</div>
                                        {ability.effects.map((eff: any) => (
                                            <div key={eff.id} className="flex justify-between items-center text-xs bg-eden-950 p-1.5 rounded border border-eden-700">
                                                <span className={eff.isActive === false ? "opacity-50 line-through" : ""}>{eff.name || eff.category.replace('_', ' ')}</span>
                                                <button onClick={() => toggleActiveEffect(ability.id, eff.id, ability.isInjected || ability.isOverridden)} className={`p-1 rounded hover:bg-white/10 ${eff.isActive !== false ? 'text-green-400' : 'text-eden-100/20'}`}><Power size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3 bg-eden-950 border-t border-eden-700 flex justify-between items-center">
                                    <div /> 
                                    <button 
                                        onClick={() => handleToggleAbility(ability)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                                            ability.isActive 
                                            ? 'bg-energia text-eden-900 shadow-[0_0_10px_rgba(250,176,5,0.4)]' 
                                            : 'bg-eden-900 text-eden-100/50 hover:bg-eden-700 hover:text-white border border-eden-700'
                                        }`}
                                    >
                                        <Power size={14} />
                                        {ability.isActive ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {(isCreating || editingAbility) && (
            <AbilityForm initialData={editingAbility || undefined} onSave={handleSave} onCancel={() => { setIsCreating(false); setEditingAbility(null); }} />
        )}
    </div>
  );
}