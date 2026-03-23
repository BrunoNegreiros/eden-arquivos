import { useState } from 'react';
import { Book, Plus, Trash2, Zap, Ghost, X, Edit2, GraduationCap, Power, Settings } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import type { UserAbility } from '../../types/systemData';
import EffectEditor from './EffectEditor';

type AppAbility = UserAbility & { isActive?: boolean; isInjected?: boolean; isOverridden?: boolean; element?: string; cost?: number; isOrigin?: boolean };

const SOURCE_COLORS: Record<string, string> = {
    'Origem': 'text-emerald-400 border-emerald-500 bg-emerald-500/10',
    'Classe': 'text-blue-400 border-blue-500 bg-blue-500/10',
    'Trilha': 'text-fuchsia-400 border-fuchsia-500 bg-fuchsia-500/10',
    'Paranormal': 'text-purple-400 border-purple-500 bg-purple-500/10',
    'Equipe': 'text-cyan-400 border-cyan-500 bg-cyan-500/10',
    'Outro': 'text-zinc-400 border-zinc-500 bg-zinc-500/10'
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export const AbilityForm = ({ initialData, onSave, onCancel }: { initialData?: AppAbility, onSave: (a: AppAbility) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<AppAbility>(initialData || {
        id: generateId(),
        name: '',
        description: '',
        source: 'Outro',
        effects: [],
        isActive: true,
        cost: 0
    });

    const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);

    const handleSave = () => {
        if (!formData.name.trim()) return alert("O nome é obrigatório!");
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2"><Book size={16} className="text-energia"/> {initialData ? 'Editar Habilidade' : 'Nova Habilidade'}</h3>
                    <button onClick={onCancel} className="text-eden-100/50 hover:text-white"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-eden-100/40 uppercase">Nome da Habilidade</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-sm text-white outline-none focus:border-energia font-bold" placeholder="Ex: Ataque Especial"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-eden-100/40 uppercase">Fonte</label>
                            <select disabled={formData.isOrigin} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value as any})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-sm text-white outline-none focus:border-energia disabled:opacity-50">
                                <option value="Outro">Outro</option>
                                <option value="Classe">Classe</option>
                                <option value="Trilha">Trilha</option>
                                <option value="Origem">Origem</option>
                                <option value="Paranormal">Paranormal</option>
                                <option value="Equipe">Equipe</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-eden-100/40 uppercase">Custo (PE) - Opcional</label>
                            <input type="number" value={formData.cost || 0} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-sm text-white outline-none focus:border-energia" placeholder="0"/>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-eden-100/40 uppercase">Descrição / Efeito Técnico</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-sm text-white outline-none focus:border-energia resize-none" placeholder="O que esta habilidade faz na prática?"/>
                    </div>

                    <div className="bg-eden-950/50 rounded-xl border border-eden-800 p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-end border-b border-eden-800 pb-2">
                            <label className="text-[10px] text-eden-100/40 uppercase font-bold tracking-widest">Efeitos Automáticos</label>
                            <button onClick={() => {
                                const newEffect = { id: generateId(), name: 'Novo Efeito', category: 'add_fixed', value: { terms: [{ id: '1', type: 'fixed', value: 1 }], operations: [] }, targets: [] };
                                setFormData(prev => ({ ...prev, effects: [...(prev.effects || []), newEffect as any] }));
                                setEditingEffectIndex((formData.effects || []).length);
                            }} className="text-xs flex items-center gap-1 bg-eden-800 hover:bg-energia hover:text-eden-900 px-3 py-1.5 rounded-lg transition-all font-bold"><Plus size={14}/> Novo</button>
                        </div>

                        <div className="space-y-2">
                            {(formData.effects || []).map((eff: any, idx: number) => (
                                <div key={eff.id} className="bg-eden-900 border border-eden-700 rounded-lg p-3 flex justify-between items-center group hover:border-energia/50 transition-colors">
                                    <div>
                                        <span className="text-xs font-bold text-white block mb-0.5 capitalize">{eff.name || eff.category.replace('_', ' ')}</span>
                                        <span className="text-[10px] text-eden-100/50">{eff.targets?.length || 0} alvo(s) configurado(s)</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingEffectIndex(idx)} className="p-2 hover:bg-eden-800 rounded text-eden-100/50 hover:text-white"><Edit2 size={14}/></button>
                                        <button onClick={() => {
                                            const newEffects = [...(formData.effects || [])];
                                            newEffects.splice(idx, 1);
                                            setFormData(prev => ({ ...prev, effects: newEffects }));
                                        }} className="p-2 hover:bg-red-900/30 rounded text-eden-100/50 hover:text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.effects || formData.effects.length === 0) && (
                                <p className="text-[10px] text-eden-100/30 italic text-center py-2">Nenhum efeito automatizado.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-eden-700 bg-eden-800 shrink-0 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg text-eden-100/60 hover:bg-eden-700 hover:text-white text-sm font-bold transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="bg-energia text-eden-900 font-black px-8 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">Salvar</button>
                </div>
            </div>

            {editingEffectIndex !== null && formData.effects?.[editingEffectIndex] && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2"><Settings size={16} className="text-energia"/> Configurar Efeito</h3>
                            <button onClick={() => setEditingEffectIndex(null)} className="text-eden-100/50 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                            <EffectEditor
                                effect={formData.effects[editingEffectIndex]}
                                onChange={(updatedEffect: any) => {
                                    const newEffects = [...(formData.effects || [])];
                                    newEffects[editingEffectIndex] = updatedEffect;
                                    setFormData(prev => ({ ...prev, effects: newEffects }));
                                }}
                                onRemove={() => {
                                    const newEffects = [...(formData.effects || [])];
                                    newEffects.splice(editingEffectIndex, 1);
                                    setFormData(prev => ({ ...prev, effects: newEffects }));
                                    setEditingEffectIndex(null);
                                }}
                            />
                        </div>
                        <div className="p-4 border-t border-eden-700 bg-eden-800 shrink-0 flex justify-end">
                            <button onClick={() => setEditingEffectIndex(null)} className="bg-energia text-eden-900 font-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">Concluir Efeito</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SheetAbilities() {
    const { character, vars, updateCharacter } = useCharacter();
    const [isCreating, setIsCreating] = useState(false);
    const [editingAbility, setEditingAbility] = useState<AppAbility | null>(null);

    let allAbilities: AppAbility[] = [...(character.classPowers || []), ...((character as any).abilities || [])];

    const customOrig = character.customOrigin as any;
    if (customOrig && customOrig.power && customOrig.power.name) {
        allAbilities.unshift({
            id: 'origin_power_virtual',
            name: customOrig.power.name,
            description: customOrig.power.description,
            cost: Number(customOrig.power.cost) || 0,
            source: 'Origem',
            isActive: customOrig.power.isActive !== false,
            isInjected: false, 
            isOrigin: true,
            effects: customOrig.power.effects || []
        } as unknown as AppAbility);
    }

    const injectedAbilities = (vars.INJECTED_ABILITIES || []).map((a: any) => ({ ...a, isInjected: true }));
    const allAbilitiesRaw = allAbilities.map(a => vars.OVERRIDDEN_ABILITIES[a.id] ? { ...vars.OVERRIDDEN_ABILITIES[a.id], id: a.id, isActive: a.isActive, isOverridden: true } : a);
    const finalAbilities = [...allAbilitiesRaw, ...injectedAbilities];

    const deepUpdatePayload = (prev: any, payloadId: string, mutator: (payload: any) => any) => {
        const scan = (items: any[]) => items.map(item => {
            if (item.effects) return { ...item, effects: item.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e) };
            return item;
        });
        let newOrigin = prev.customOrigin as any;
        if (newOrigin) {
            newOrigin = { ...newOrigin };
            if (newOrigin.effects) newOrigin.effects = newOrigin.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e);
            if (newOrigin.power?.effects) newOrigin.power = { ...newOrigin.power, effects: newOrigin.power.effects.map((e: any) => e.payload?.id === payloadId ? { ...e, payload: mutator(e.payload) } : e) };
        }
        return { ...prev, inventory: scan(prev.inventory||[]), abilities: scan((prev as any).abilities||[]), classPowers: scan(prev.classPowers||[]), rituals: scan(prev.rituals||[]), conditions: scan(prev.conditions||[]), customOrigin: newOrigin };
    };

    const handleSave = (ability: AppAbility) => {
        if (ability.id === 'origin_power_virtual') {
            updateCharacter(prev => ({
                ...prev,
                customOrigin: {
                    ...((prev as any).customOrigin || {}),
                    power: { name: ability.name, description: ability.description, cost: ability.cost, effects: ability.effects, isActive: ability.isActive }
                }
            }));
            setIsCreating(false); setEditingAbility(null); return;
        }
        if (ability.isInjected) {
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
        if (confirm('Tem certeza que deseja apagar esta habilidade?')) {
            if (id === 'origin_power_virtual') {
                updateCharacter(prev => ({ ...prev, customOrigin: { ...((prev as any).customOrigin || {}), power: { name: '', description: '', effects: [], cost: 0 } } }));
                return;
            }
            const isClassPower = character.classPowers?.some(p => p.id === id);
            if (isClassPower) updateCharacter(prev => ({ ...prev, classPowers: prev.classPowers?.filter(p => p.id !== id) }));
            else updateCharacter(prev => ({ ...prev, abilities: (prev as any).abilities.filter((a: any) => a.id !== id) }));
        }
    };

    const handleToggleAbility = (ability: AppAbility) => {
        const pCost = Number(ability.cost) || 0;
        const isTurningOn = !ability.isActive;
        
        if (isTurningOn && pCost > 0) {
            if (!confirm(`Ativar "${ability.name}" consumirá ${pCost} PE. Continuar?`)) return;
        }

        updateCharacter(prev => {
            const newStatus = JSON.parse(JSON.stringify(prev.status));
            const pe = newStatus.pe;
            
            // CORREÇÃO: Gasto de PE incluindo os temporários gerados pelo Motor
            if (isTurningOn && pCost > 0) {
                const motorTemp = vars.PE.temp || 0;
                const currentTemp = (Number(pe.temp) || 0) + motorTemp;
                const currentPE = Number(pe.current) || 0;

                if (currentTemp > 0) {
                    if (pCost >= currentTemp) {
                        pe.current = Math.max(0, currentPE - (pCost - currentTemp));
                        pe.temp = (Number(pe.temp) || 0) - currentTemp;
                    } else {
                        pe.temp = (Number(pe.temp) || 0) - pCost;
                    }
                } else {
                    pe.current = Math.max(0, currentPE - pCost);
                }
            }

            if (ability.isOrigin) {
                const cOrig = prev.customOrigin as any;
                return { ...prev, status: newStatus, customOrigin: { ...cOrig, power: { ...cOrig.power, isActive: isTurningOn } } };
            }
            if (ability.isInjected) {
                return deepUpdatePayload({...prev, status: newStatus}, ability.id, (p) => ({ ...p, isActive: isTurningOn }));
            }
            const isClassPower = prev.classPowers?.some(p => p.id === ability.id);
            if (isClassPower) {
                return { ...prev, status: newStatus, classPowers: prev.classPowers?.map(p => p.id === ability.id ? { ...p, isActive: isTurningOn } : p) };
            } else {
                return { ...prev, status: newStatus, abilities: (prev as any).abilities.map((a: any) => a.id === ability.id ? { ...a, isActive: isTurningOn } : a) };
            }
        });
    };

    const toggleActiveEffect = (abilityId: string, effectId: string, isVirtual?: boolean, isOrigin?: boolean) => {
        if (isOrigin) {
            updateCharacter(prev => {
                const cOrig = prev.customOrigin as any;
                if (!cOrig || !cOrig.power) return prev;
                return {
                    ...prev,
                    customOrigin: { ...cOrig, power: { ...cOrig.power, effects: (cOrig.power.effects || []).map((e: any) => e.id === effectId ? { ...e, isActive: e.isActive === false ? true : false } : e) } }
                };
            });
            return;
        }
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
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><Zap className="text-energia" /> Habilidades</h2>
                    <p className="text-[10px] uppercase text-eden-100/50 font-bold mt-1">Gerencie poderes e características especiais.</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-energia text-eden-900 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg">
                    <Plus size={16}/> <span className="hidden md:inline">NOVA HABILIDADE</span><span className="md:hidden">NOVA</span>
                </button>
            </div>

            {finalAbilities.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30">
                    <Ghost size={48} className="mx-auto mb-4 opacity-50"/>
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhuma habilidade registrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finalAbilities.map(ability => {
                        const sourceKey = ability.source || 'Outro';
                        const colors = SOURCE_COLORS[sourceKey] || SOURCE_COLORS['Outro'];
                        
                        return (
                            <div key={ability.id} className={`bg-eden-900/50 border rounded-xl overflow-hidden shadow-lg transition-all ${ability.isActive ? 'border-eden-600' : 'border-eden-800 opacity-60 grayscale-[0.5]'}`}>
                                {ability.isInjected && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase z-10">Concedido por Efeito</div>}

                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-white text-lg leading-tight">{ability.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${colors}`}>
                                                    {ability.source}
                                                </span>
                                                {ability.cost && ability.cost > 0 ? (
                                                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded border border-energia/50 bg-energia/10 text-energia">
                                                        Custo: {ability.cost} PE
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                                            {/* CORREÇÃO: O lápis de edição agora aparece para a Origem! */}
                                            {(!ability.isInjected || ability.isOrigin) && (
                                                <>
                                                    <button onClick={() => setEditingAbility(ability)} className="p-1.5 hover:text-energia hover:bg-energia/10 rounded transition-colors"><Edit2 size={16}/></button>
                                                    <button onClick={() => handleDelete(ability.id)} className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16}/></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-eden-100/80 leading-relaxed whitespace-pre-wrap">{ability.description}</p>
                                    
                                    {ability.isActive && (ability.effects || []).length > 0 && (
                                        <div className="space-y-1 pt-2 border-t border-eden-700/50 px-4 pb-4 bg-eden-900/30">
                                            <div className="text-[10px] font-bold text-energia uppercase flex items-center gap-1"><Zap size={10}/> Efeitos Ativos</div>
                                            {ability.effects!.map((eff: any) => (
                                                <div key={eff.id} className="flex justify-between items-center text-xs bg-eden-950 p-1.5 rounded border border-eden-700">
                                                    <span className={eff.isActive === false ? "opacity-50 line-through" : ""}>{eff.name || eff.category.replace('_', ' ')}</span>
                                                    {/* CORREÇÃO: Respeita ativação e desativação de efeitos individuais na Origem */}
                                                    <button onClick={() => toggleActiveEffect(ability.id, eff.id, ability.isInjected || ability.isOverridden, ability.isOrigin)} className={`p-1 rounded hover:bg-white/10 ${eff.isActive !== false ? 'text-green-400' : 'text-eden-100/20'}`}><Power size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-eden-950 border-t border-eden-700 flex justify-between items-center">
                                    <div className="text-[10px] text-eden-100/40 uppercase font-bold flex items-center gap-2">
                                        {ability.source === 'Paranormal' ? <Ghost size={14}/> : ability.source === 'Classe' ? <GraduationCap size={14}/> : <Book size={14}/>}
                                        {ability.isInjected && !ability.isOrigin ? 'Habilidade Automática' : ability.isOrigin ? 'Poder da Origem' : 'Personalizada'}
                                    </div> 
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

            {(isCreating || editingAbility) && (
                <AbilityForm initialData={editingAbility || undefined} onSave={handleSave} onCancel={() => { setIsCreating(false); setEditingAbility(null); }} />
            )}
        </div>
    );
}