import { useState, useMemo } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import type { 
  UserRitual, ElementType, RitualVersion
} from '../../types/systemData';
import { 
  Settings, Zap, Plus, X, Search, Trash2, Ghost,
  Edit2, Book, Dices, StopCircle, Power, RefreshCw, Tag
} from 'lucide-react';
import EffectEditor from './EffectEditor';

const ELEMENTS: ElementType[] = ['Conhecimento', 'Energia', 'Morte', 'Sangue', 'Medo'];

const ELEMENT_STYLES: Record<string, { color: string; border: string; bg: string }> = {
  Conhecimento: { color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-950/30' },
  Energia: { color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-950/30' },
  Morte: { color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-950/30' },
  Sangue: { color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-950/30' },
  Medo: { color: 'text-white', border: 'border-white', bg: 'bg-eden-950' },
};

const DEFAULT_TAGS = [
    { id: 'atk', name: 'Ataque', color: '#8B4513' },
    { id: 'dmg', name: 'Dano', color: '#EF4444' },
    { id: 'def', name: 'Defesa', color: '#3B82F6' },
    { id: 'heal', name: 'Cura', color: '#10B981' }
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const RitualVersionEditor = ({ label, version, onChange, baseVersion }: { label: string; version: RitualVersion; onChange: (v: RitualVersion) => void; baseVersion?: RitualVersion; }) => {
    const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);
    const [showPrereqs, setShowPrereqs] = useState(!!version.requiredCircle || !!version.affinity);

    if (!version.isActive && label !== 'Normal') {
        return (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-eden-700/50 rounded-xl bg-eden-900/20 gap-3">
                <p className="text-eden-100/40 text-sm">Versão {label} não habilitada.</p>
                <button 
                    onClick={() => { const base = baseVersion || version; onChange({ ...base, isActive: true, cost: (base.cost || 1) + (label === 'Discente' ? 2 : 5) }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-eden-800 hover:bg-eden-700 rounded-lg text-xs font-bold text-eden-100 transition-colors"
                ><Plus size={14}/> Habilitar {label}</button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-eden-900/50 p-4 rounded-xl border border-eden-700 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50 block">Custo (PE)</label><input type="number" value={version.cost} onChange={e => onChange({...version, cost: Number(e.target.value)})} className="w-20 bg-eden-950 border border-eden-600 rounded p-1.5 text-center font-bold text-sm text-white focus:border-energia outline-none" /></div>
                    {label !== 'Normal' && (<div className="flex flex-col items-end gap-2"><button onClick={() => onChange({...version, isActive: false})} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"><Trash2 size={12}/> Desabilitar Versão</button><label className="flex items-center gap-2 cursor-pointer text-xs text-eden-100/60 select-none"><input type="checkbox" checked={showPrereqs} onChange={(e) => { setShowPrereqs(e.target.checked); if (!e.target.checked) onChange({...version, requiredCircle: undefined, affinity: undefined}); }} className="rounded bg-eden-950 border-eden-600" /> Definir Pré-requisitos</label></div>)}
                </div>
                {showPrereqs && label !== 'Normal' && (
                    <div className="pt-3 border-t border-eden-700/50 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50 block">Círculo Mínimo</label><select value={version.requiredCircle || 2} onChange={e => onChange({...version, requiredCircle: Number(e.target.value) as any})} className="w-full bg-eden-950 border border-eden-600 rounded p-1.5 text-xs text-white"><option value={2}>2º Círculo</option><option value={3}>3º Círculo</option><option value={4}>4º Círculo</option></select></div>
                        <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-eden-100/50 block">Afinidade</label><div className="flex gap-2"><label className="flex items-center gap-1 cursor-pointer bg-eden-950 border border-eden-600 px-2 rounded w-full"><input type="checkbox" checked={!!version.affinity} onChange={e => onChange({...version, affinity: e.target.checked ? 'Conhecimento' : undefined})} /><span className="text-[10px] uppercase font-bold text-eden-100">Requerer</span></label>{version.affinity && (<select value={version.affinity} onChange={e => onChange({...version, affinity: e.target.value as ElementType})} className="bg-eden-950 border border-eden-600 rounded p-1 text-[10px] text-eden-100 flex-1">{ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}</select>)}</div></div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-eden-100/50">Execução</label><input type="text" value={version.execution} onChange={e => onChange({...version, execution: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" /></div><div className="space-y-1"><label className="text-[9px] uppercase font-bold text-eden-100/50">Alcance</label><input type="text" value={version.range} onChange={e => onChange({...version, range: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" /></div><div className="space-y-1"><label className="text-[9px] uppercase font-bold text-eden-100/50">Alvo/Área</label><input type="text" value={version.target} onChange={e => onChange({...version, target: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" /></div><div className="space-y-1"><label className="text-[9px] uppercase font-bold text-eden-100/50">Duração</label><input type="text" value={version.duration} onChange={e => onChange({...version, duration: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" /></div><div className="space-y-1"><label className="text-[9px] uppercase font-bold text-eden-100/50">Resistência</label><input type="text" value={version.resistance} onChange={e => onChange({...version, resistance: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" /></div>
            </div>

            <div className="space-y-1"><label className="text-xs font-bold text-eden-100/60 uppercase">Descrição & Efeitos</label><textarea value={version.description} onChange={e => onChange({...version, description: e.target.value})} className="w-full h-32 bg-eden-950 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 outline-none resize-none" placeholder={`Descreva o que acontece na versão ${label}...`} /></div>
            
            <div className="bg-black/20 rounded-xl border border-eden-700/50 p-4 space-y-3">
                 <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-eden-100/50 uppercase flex items-center gap-2">Efeitos Mecânicos</h4><button onClick={() => { const newEffect = { id: Date.now().toString(), name: 'Novo Efeito', category: 'add_fixed', value: { terms: [{ id: '1', type: 'fixed', value: 1 }], operations: [] }, targets: [] } as any; const newEffectsList = [...(version.effects || []), newEffect]; onChange({ ...version, effects: newEffectsList }); setEditingEffectIndex(newEffectsList.length - 1); }} className="text-xs bg-eden-800 text-energia px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-eden-700 transition-colors shadow-sm border border-eden-700"><Plus size={12}/> Novo Efeito</button></div>
                 <div className="space-y-2">
                    {(version.effects || []).map((eff: any, idx: number) => (
                       <div key={eff.id} className={`flex justify-between items-center bg-eden-900/50 p-3 rounded-lg border ${eff.isActive !== false ? 'border-eden-700/30 hover:border-eden-600' : 'border-eden-800 opacity-50'} transition-colors`}>
                          <div className="flex flex-col"><span className={`text-xs font-bold capitalize ${eff.isActive !== false ? 'text-white' : 'text-eden-100/50 line-through'}`}>{eff.name ? eff.name : eff.category.replace('_', ' ')}</span><span className="text-[10px] text-eden-100/50">{eff.targets?.length || 0} alvo(s)</span></div>
                          <div className="flex gap-2 items-center">
                             <button title={eff.isActive !== false ? 'Desativar este Efeito' : 'Ativar este Efeito'} onClick={() => { const newEffects = [...(version.effects || [])]; newEffects[idx] = { ...eff, isActive: eff.isActive === false ? true : false }; onChange({ ...version, effects: newEffects }); }} className={`p-1 rounded transition-colors ${eff.isActive !== false ? 'text-energia hover:bg-energia/10' : 'text-eden-100/50 hover:bg-white/10'}`}><Power size={14}/></button>
                             <button onClick={() => setEditingEffectIndex(idx)} className="text-eden-100/50 hover:text-white p-1 hover:bg-white/10 rounded"><Edit2 size={14}/></button>
                             <button onClick={() => { const newEffects = [...(version.effects || [])]; newEffects.splice(idx, 1); onChange({ ...version, effects: newEffects }); }} className="text-eden-100/50 hover:text-red-400 p-1 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    ))}
                    {(!version.effects || version.effects.length === 0) && <p className="text-[10px] text-eden-100/20 italic text-center py-4 border border-dashed border-eden-800 rounded-lg">Sem efeitos configurados para esta versão.</p>}
                 </div>
            </div>

            {editingEffectIndex !== null && version.effects?.[editingEffectIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0"><h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2"><Settings size={16} className="text-energia"/> Configurar Efeito do Ritual</h3><button onClick={() => setEditingEffectIndex(null)} className="text-eden-100/50 hover:text-white"><X size={20}/></button></div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1"><EffectEditor effect={version.effects[editingEffectIndex]} onChange={(updatedEffect: any) => { const newEffects = [...(version.effects || [])]; newEffects[editingEffectIndex] = updatedEffect; onChange({ ...version, effects: newEffects }); }} onRemove={() => { const newEffects = [...(version.effects || [])]; newEffects.splice(editingEffectIndex, 1); onChange({ ...version, effects: newEffects }); setEditingEffectIndex(null); }} /></div>
                        <div className="p-4 border-t border-eden-700 bg-eden-800 shrink-0 flex justify-end"><button onClick={() => setEditingEffectIndex(null)} className="bg-energia text-eden-900 font-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(250,176,5,0.3)]">Concluir Edição</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RitualForm = ({ initialData, onSave, onCancel }: { initialData?: UserRitual, onSave: (r: UserRitual) => void, onCancel: () => void }) => {
    const defaultVersion: RitualVersion = { isActive: false, cost: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Instantânea', resistance: 'Nenhuma', description: '', effects: [] };
    const defaultRitual = { id: '', name: '', element: 'Conhecimento', circle: 1, normal: { ...defaultVersion, isActive: true }, discente: { ...defaultVersion }, verdadeiro: { ...defaultVersion } } as any;
    
    const [data, setData] = useState<UserRitual>(initialData || defaultRitual as any);
    const [activeTab, setActiveTab] = useState<'normal' | 'discente' | 'verdadeiro'>('normal');
    
    const { character } = useCharacter();
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#A855F7');

    const globalTags = useMemo(() => {
        const tagMap = new Map();
        DEFAULT_TAGS.forEach(t => tagMap.set(t.id, t));
        const customOrig = character.customOrigin as any;
        if (customOrig?.power?.tags) customOrig.power.tags.forEach((t: any) => tagMap.set(t.id, t));
        (character.classPowers || []).forEach(a => { if (a.tags) a.tags.forEach((t: any) => tagMap.set(t.id, t)); });
        ((character as any).abilities || []).forEach((a: any) => { if (a.tags) a.tags.forEach((t: any) => tagMap.set(t.id, t)); });
        (character.rituals || []).forEach((r: any) => { if (r.tags) r.tags.forEach((t: any) => tagMap.set(t.id, t)); });
        return Array.from(tagMap.values());
    }, [character]);

    const style = ELEMENT_STYLES[data.element] || ELEMENT_STYLES.Medo;

    const addTag = (tag: {id: string, name: string, color: string}) => {
        if ((data as any).tags?.some((t: any) => t.id === tag.id)) return;
        setData(prev => ({ ...prev, tags: [...((prev as any).tags || []), tag] }) as any);
        setShowTagMenu(false);
    };

    const createAndAddTag = () => {
        if (!newTagName.trim()) return;
        const newTag = { id: generateId(), name: newTagName.trim(), color: newTagColor };
        setData(prev => ({ ...prev, tags: [...((prev as any).tags || []), newTag] }) as any);
        setNewTagName('');
        setShowTagMenu(false);
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className={`bg-eden-900 w-full max-w-4xl max-h-[95vh] rounded-2xl border ${style.border} shadow-2xl flex flex-col`}>
                <div className={`p-4 border-b ${style.border} ${style.bg} rounded-t-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className={`w-12 h-12 p-1.5 rounded-lg bg-black/20 ${style.border} border flex items-center justify-center`}>
                            <img src={`/elementos/${data.element.toLowerCase()}.png`} alt={data.element} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="bg-transparent border-b border-white/20 w-full text-xl font-black text-white placeholder-white/30 focus:border-white outline-none" placeholder="Nome do Ritual" />
                            <div className="flex gap-2">
                                <select value={data.element} onChange={e => setData({...data, element: e.target.value as ElementType})} className="bg-black/20 border border-white/10 rounded text-[10px] uppercase font-bold text-white px-2 py-0.5">{ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}</select>
                                <select value={data.circle} onChange={e => setData({...data, circle: Number(e.target.value) as any})} className="bg-black/20 border border-white/10 rounded text-[10px] uppercase font-bold text-white px-2 py-0.5">{[1,2,3,4].map(c => <option key={c} value={c}>{c}º Círculo</option>)}</select>
                            </div>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-eden-100/50 hover:text-white absolute top-4 right-4 md:static"><X size={24}/></button>
                </div>
                
                <div className={`px-4 pt-3 pb-3 border-b ${style.border} bg-eden-950`}>
                    <label className="text-[10px] font-bold text-eden-100/40 uppercase flex items-center gap-1 mb-1"><Tag size={12}/> Tags do Ritual</label>
                    <div className="flex flex-wrap items-center gap-2">
                        {((data as any).tags || []).map((tag: any) => (
                            <span key={tag.id} className="text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 border border-white/20" style={{ backgroundColor: `${tag.color}30`, color: tag.color, borderColor: `${tag.color}50` }}>
                                {tag.name}
                                <button onClick={() => setData(p => ({...p, tags: (p as any).tags?.filter((t: any) => t.id !== tag.id)}) as any)} className="hover:text-white ml-1"><X size={10}/></button>
                            </span>
                        ))}
                        
                        <div className="relative">
                            <button onClick={() => setShowTagMenu(!showTagMenu)} className="text-[10px] font-bold uppercase text-eden-100/50 hover:text-white bg-eden-900 border border-eden-700 px-2 py-1 rounded-md flex items-center gap-1">
                                <Plus size={12}/> Tag
                            </button>
                            
                            {showTagMenu && (
                                <div className="absolute top-full mt-2 left-0 w-64 bg-eden-800 border border-eden-600 rounded-xl p-3 shadow-xl z-20 space-y-3 animate-in fade-in zoom-in-95">
                                    <div className="flex flex-wrap gap-2 border-b border-eden-700 pb-3">
                                        {globalTags.map((t: any) => (
                                            <button key={t.id} onClick={() => addTag(t)} className="text-[9px] font-bold uppercase px-2 py-1 rounded border border-white/20 hover:scale-105 transition-transform" style={{ backgroundColor: `${t.color}30`, color: t.color }}>{t.name}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] uppercase font-bold text-eden-100/50">Criar Customizada</p>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                                            <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Nome da Tag..." className="flex-1 bg-eden-950 border border-eden-700 rounded-lg p-2 text-xs text-white outline-none" />
                                        </div>
                                        <button onClick={createAndAddTag} disabled={!newTagName} className="w-full bg-energia text-eden-900 font-bold text-[10px] py-1.5 rounded uppercase disabled:opacity-50">Adicionar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-eden-700 bg-eden-900/50 px-4 pt-4 gap-1">
                    <button onClick={() => setActiveTab('normal')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all ${activeTab === 'normal' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}>Normal</button>
                    <button onClick={() => setActiveTab('discente')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'discente' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}>Discente {data.discente.isActive && <span className="w-2 h-2 rounded-full bg-cyan-500"/>}</button>
                    <button onClick={() => setActiveTab('verdadeiro')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'verdadeiro' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}>Verdadeiro {data.verdadeiro.isActive && <span className="w-2 h-2 rounded-full bg-yellow-500"/>}</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-eden-800/30">
                    {activeTab === 'normal' && <RitualVersionEditor label="Normal" version={data.normal} onChange={v => setData({...data, normal: v})} />}
                    {activeTab === 'discente' && <RitualVersionEditor label="Discente" version={data.discente} baseVersion={data.normal} onChange={v => setData({...data, discente: v})} />}
                    {activeTab === 'verdadeiro' && <RitualVersionEditor label="Verdadeiro" version={data.verdadeiro} baseVersion={data.normal} onChange={v => setData({...data, verdadeiro: v})} />}
                </div>
                <div className="p-4 border-t border-eden-700 bg-eden-800 rounded-b-2xl flex justify-end gap-3"><button onClick={onCancel} className="px-4 py-2 text-eden-100 hover:bg-eden-700 rounded-lg text-sm font-bold">Cancelar</button><button onClick={() => onSave(data)} disabled={!data.name} className="px-6 py-2 bg-energia text-eden-900 rounded-lg text-sm font-black hover:bg-yellow-400 shadow-lg">SALVAR RITUAL</button></div>
             </div>
        </div>
    );
};

interface CastingModalProps { ritual: UserRitual; version: 'normal' | 'discente' | 'verdadeiro'; cost: number; occultismBonus: number; occultismDice: number; onConfirm: (roll: number, condition: 'normal' | 'hard' | 'extreme') => void; onCancel: () => void; }

function CastingModal({ ritual, version, cost, occultismBonus, occultismDice, onConfirm, onCancel }: CastingModalProps) {
    const [rollResult, setRollResult] = useState('');
    const [condition, setCondition] = useState<'normal' | 'hard' | 'extreme'>('normal');
    const baseDT = 20 + Number(cost); const finalDT = baseDT + (condition === 'hard' ? 5 : condition === 'extreme' ? 10 : 0);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <div className="p-4 border-b border-eden-700 bg-eden-800 rounded-t-2xl flex justify-between items-center"><h3 className="font-bold text-lg text-white flex items-center gap-2"><Dices className="text-energia" /> Teste de Ocultismo</h3><button onClick={onCancel}><X className="text-eden-100/50 hover:text-white" /></button></div>
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-1"><div className="text-sm text-eden-100/70">Conjurando <strong className="text-white">{ritual.name}</strong></div><div className="text-xs uppercase font-bold text-energia">Versão {version} ({cost} PE)</div></div>
                    <div className="bg-black/30 rounded-xl p-4 border border-eden-700/50 flex justify-between items-center">
                        <div className="text-center"><div className="text-[10px] uppercase font-bold text-eden-100/50">Seu Bônus</div><div className="text-xl font-black text-white">{occultismDice}d20{occultismBonus >= 0 ? '+' : ''}{occultismBonus}</div></div>
                        <div className="h-8 w-px bg-eden-700/50"></div>
                        <div className="text-center"><div className="text-[10px] uppercase font-bold text-eden-100/50">DT Necessária</div><div className="text-2xl font-black text-energia">{finalDT}</div></div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-eden-700 bg-eden-950/50 cursor-pointer hover:border-eden-500 transition-colors"><input type="checkbox" checked={condition === 'hard'} onChange={() => setCondition(condition === 'hard' ? 'normal' : 'hard')} className="w-5 h-5 rounded border-eden-500 bg-eden-900 text-energia focus:ring-energia"/><div className="flex-1"><div className="font-bold text-sm text-white">Condição Difícil (+5 DT)</div><div className="text-[10px] text-eden-100/50">Precisa de gestos/falas complexas.</div></div></label>
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-eden-700 bg-eden-950/50 cursor-pointer hover:border-eden-500 transition-colors"><input type="checkbox" checked={condition === 'extreme'} onChange={() => setCondition(condition === 'extreme' ? 'normal' : 'extreme')} className="w-5 h-5 rounded border-eden-500 bg-eden-900 text-energia focus:ring-energia"/><div className="flex-1"><div className="font-bold text-sm text-white">Condição Extrema (+10 DT)</div><div className="text-[10px] text-eden-100/50">Impedido, agarrado ou sem componentes.</div></div></label>
                    </div>
                    <div className="space-y-2"><label className="text-xs font-bold text-eden-100/70 uppercase">Resultado do Dado</label><input type="number" value={rollResult} onChange={e => setRollResult(e.target.value)} className="w-full bg-eden-950 border border-eden-500 rounded-xl p-3 text-center text-2xl font-black text-white focus:ring-2 focus:ring-energia outline-none" placeholder="0" autoFocus /></div>
                </div>
                <div className="p-4 border-t border-eden-700 bg-eden-800 rounded-b-2xl flex gap-3"><button onClick={onCancel} className="flex-1 py-3 text-eden-100 font-bold hover:bg-eden-700 rounded-lg">Cancelar</button><button onClick={() => onConfirm(parseInt(rollResult) || 0, condition)} disabled={!rollResult} className="flex-[2] py-3 bg-energia text-eden-950 font-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">CONFIRMAR</button></div>
            </div>
        </div>
    );
}

export default function SheetRituals() {
  const { character, vars, updateCharacter } = useCharacter();
  const [searchTerm, setSearchTerm] = useState('');
  const [castingState, setCastingState] = useState<{ritual: UserRitual, version: 'normal'|'discente'|'verdadeiro', cost: number} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRitual, setEditingRitual] = useState<UserRitual | null>(null);

  const [elementFilter, setElementFilter] = useState('all');
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);

  const getOccultismStats = () => {
      const int = character.attributes?.initial?.INT || 0;
      const occultData = character.skills ? (character.skills['Ocultismo'] || character.skills['ocultismo']) : undefined;
      const degree = occultData?.training || 0;
      const bonus = (degree * 5) + (occultData?.otherBonus || 0);
      return { dice: int, bonus };
  };

  const baseRituals = (character.rituals || []).map(r => {
      const over = vars.OVERRIDDEN_RITUALS[r.id];
      if (over) {
          return {
              ...over, id: r.id, isOverridden: true,
              normal: { ...over.normal, isActive: r.normal?.isActive, isSustaining: (r.normal as any)?.isSustaining },
              discente: { ...over.discente, isActive: r.discente?.isActive, isSustaining: (r.discente as any)?.isSustaining },
              verdadeiro: { ...over.verdadeiro, isActive: r.verdadeiro?.isActive, isSustaining: (r.verdadeiro as any)?.isSustaining }
          };
      }
      return r;
  });
  
  const injectedRituals = (vars.INJECTED_RITUALS || []).map((r: any) => ({ ...r, isInjected: true }));
  const allRituals = [...baseRituals, ...injectedRituals];

  const globalTags = useMemo(() => {
    const tagMap = new Map();
    DEFAULT_TAGS.forEach(t => tagMap.set(t.id, t));
    const customOrig = character.customOrigin as any;
    if (customOrig?.power?.tags) customOrig.power.tags.forEach((t: any) => tagMap.set(t.id, t));
    (character.classPowers || []).forEach(a => { if (a.tags) a.tags.forEach((t: any) => tagMap.set(t.id, t)); });
    ((character as any).abilities || []).forEach((a: any) => { if (a.tags) a.tags.forEach((t: any) => tagMap.set(t.id, t)); });
    (character.rituals || []).forEach((r: any) => { if (r.tags) r.tags.forEach((t: any) => tagMap.set(t.id, t)); });
    return Array.from(tagMap.values());
}, [character]);

  const filteredRituals = allRituals.filter(r => {
      if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(r.normal.description || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (elementFilter !== 'all' && r.element !== elementFilter) return false;
      if (selectedTagsFilter.length > 0) {
          if (!(r as any).tags || (r as any).tags.length === 0) return false;
          if (!selectedTagsFilter.some(filterId => (r as any).tags!.some((t: any) => t.id === filterId))) return false;
      }
      return true;
  });

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

  const initiateCast = (ritual: UserRitual, versionKey: 'normal' | 'discente' | 'verdadeiro') => {
      const version = ritual[versionKey]; if (!version) return;
      const pCost = Number(version.cost) || 0;

      if (ritual.element === 'Medo') {
          if (!confirm(`Ritual de Medo! Você perderá ${pCost} PE e sanidade permanente. Deseja continuar?`)) return;
          let sanLoss = versionKey === 'discente' ? 2 : versionKey === 'verdadeiro' ? 3 : 1;

          updateCharacter(prev => {
              const newStatus = JSON.parse(JSON.stringify(prev.status));
              const pe = newStatus.pe; 
              const san = newStatus.san;
              const motorTemp = vars.PE.temp || 0;
              const currentTemp = (Number(pe.temp) || 0) + motorTemp;
              const currentPE = Number(pe.current) || 0;

              if (currentTemp > 0) {
                  if (pCost >= currentTemp) {
                      pe.current = Math.max(0, currentPE - (pCost - currentTemp));
                      pe.temp = (Number(pe.temp) || 0) - currentTemp; 
                  } else { pe.temp = (Number(pe.temp) || 0) - pCost; }
              } else { pe.current = Math.max(0, currentPE - pCost); }

              san.max = Math.max(0, (typeof san.max === 'number' ? san.max : 99) - sanLoss);
              if (san.current > san.max) san.current = san.max;

              if ((ritual as any).isInjected) {
                  return deepUpdatePayload({ ...prev, status: newStatus }, ritual.id, (p) => ({ ...p, normal: { ...p.normal, isActive: false }, discente: { ...p.discente, isActive: false }, verdadeiro: { ...p.verdadeiro, isActive: false }, [versionKey]: { ...p[versionKey], isActive: true } }));
              }
              const updatedRituals = (prev.rituals || []).map((r: UserRitual) => r.id === ritual.id ? { ...r, normal: { ...r.normal, isActive: false }, discente: { ...r.discente, isActive: false }, verdadeiro: { ...r.verdadeiro, isActive: false }, [versionKey]: { ...r[versionKey], isActive: true } } : r);
              return { ...prev, status: newStatus, rituals: updatedRituals };
          });
          return;
      }
      setCastingState({ ritual, version: versionKey, cost: pCost });
  };

  const finalizeCast = (roll: number, condition: 'normal' | 'hard' | 'extreme') => {
      if (!castingState) return;
      const { ritual, version, cost } = castingState;
      const pCost = Number(cost) || 0;
      
      const finalDT = 20 + pCost + (condition === 'hard' ? 5 : condition === 'extreme' ? 10 : 0);
      const isSuccess = roll >= finalDT;
      const shouldActivate = isSuccess || (!isSuccess && condition === 'normal');

      updateCharacter(prev => {
          const newStatus = JSON.parse(JSON.stringify(prev.status));
          const pe = newStatus.pe; 
          const san = newStatus.san;
          const motorTemp = vars.PE.temp || 0;
          const currentTemp = (Number(pe.temp) || 0) + motorTemp;
          const currentPE = Number(pe.current) || 0;

          if (currentTemp > 0) {
              if (pCost >= currentTemp) { pe.current = Math.max(0, currentPE - (pCost - currentTemp)); pe.temp = (Number(pe.temp) || 0) - currentTemp; }
              else { pe.temp = (Number(pe.temp) || 0) - pCost; }
          } else { pe.current = Math.max(0, currentPE - pCost); }

          if (!isSuccess) {
              san.current = Math.max(0, Number(san.current) - pCost);
              if (finalDT - roll >= 5) { san.max = Math.max(0, (typeof san.max === 'number' ? san.max : 99) - 1); if (san.current > san.max) san.current = san.max; }
          }
          if (shouldActivate) {
              if ((ritual as any).isInjected) {
                  return deepUpdatePayload({ ...prev, status: newStatus }, ritual.id, (p) => ({ ...p, normal: { ...p.normal, isActive: false }, discente: { ...p.discente, isActive: false }, verdadeiro: { ...p.verdadeiro, isActive: false }, [version]: { ...p[version], isActive: true } }));
              }
              const updatedRituals = (prev.rituals || []).map((r: UserRitual) => r.id === ritual.id ? { ...r, normal: { ...r.normal, isActive: false }, discente: { ...r.discente, isActive: false }, verdadeiro: { ...r.verdadeiro, isActive: false }, [version]: { ...r[version], isActive: true } } : r);
              return { ...prev, status: newStatus, rituals: updatedRituals };
          }
          return { ...prev, status: newStatus };
      });
      if (!isSuccess) alert(shouldActivate ? `FALHA NO TESTE!\nO ritual funcionou, mas custou ${pCost} de Sanidade.` : `FALHA TOTAL!\nGastou ${pCost} PE e Sanidade. O ritual NÃO foi conjurado.`);
      setCastingState(null);
  };

  const deactivateRitual = (ritualId: string, isInjected?: boolean) => {
      if (isInjected) {
          updateCharacter(prev => deepUpdatePayload(prev, ritualId, (p) => ({ ...p, normal: { ...p.normal, isActive: false }, discente: { ...p.discente, isActive: false }, verdadeiro: { ...p.verdadeiro, isActive: false } })));
          return;
      }
      updateCharacter(prev => ({ ...prev, rituals: (prev.rituals || []).map((r: UserRitual) => r.id === ritualId ? { ...r, normal: { ...r.normal, isActive: false }, discente: { ...r.discente, isActive: false }, verdadeiro: { ...r.verdadeiro, isActive: false } } : r) }));
  };

  const toggleActiveEffect = (ritualId: string, versionKey: 'normal'|'discente'|'verdadeiro', effectId: string, isVirtual?: boolean) => {
      if (isVirtual) {
          updateCharacter(prev => deepUpdatePayload(prev, ritualId, (p) => { const v = p[versionKey]; return { ...p, [versionKey]: { ...v, effects: v.effects.map((e:any) => e.id === effectId ? { ...e, isActive: e.isActive === false ? true : false } : e) } }; }));
          return;
      }
      updateCharacter(prev => ({ ...prev, rituals: prev.rituals.map(r => r.id === ritualId ? { ...r, [versionKey]: { ...r[versionKey], effects: r[versionKey].effects.map(eff => eff.id === effectId ? { ...eff, isActive: eff.isActive === false ? true : false } : eff) } } : r) }));
  };

  const toggleSustain = (ritualId: string, versionKey: 'normal'|'discente'|'verdadeiro', isInjected?: boolean) => {
      const isSustaining = allRituals.some(r => r.id !== ritualId && ((r.normal as any).isSustaining || (r.discente as any).isSustaining || (r.verdadeiro as any).isSustaining));
      if (isSustaining) { alert("Você só pode manter um ritual sustentado por vez!"); return; }
      if (isInjected) {
          updateCharacter(prev => deepUpdatePayload(prev, ritualId, (p) => ({ ...p, [versionKey]: { ...p[versionKey], isSustaining: !(p[versionKey] as any).isSustaining } })));
          return;
      }
      updateCharacter(prev => ({ ...prev, rituals: prev.rituals.map(r => r.id === ritualId ? { ...r, [versionKey]: { ...r[versionKey], isSustaining: !(r[versionKey] as any).isSustaining } } : r) }));
  };

  const paySustainCost = () => { 
      updateCharacter(prev => { 
          const newStatus = JSON.parse(JSON.stringify(prev.status)); 
          const pe = newStatus.pe;
          const motorTemp = vars.PE.temp || 0;
          const currentTemp = (Number(pe.temp) || 0) + motorTemp;
          const currentPE = Number(pe.current) || 0;

          if (currentTemp > 0) pe.temp = (Number(pe.temp) || 0) - 1;
          else pe.current = Math.max(0, currentPE - 1); 

          return { ...prev, status: newStatus }; 
      }); 
  };

  const handleSaveRitual = (ritual: UserRitual) => {
      if ((ritual as any).isInjected) {
          updateCharacter(prev => deepUpdatePayload(prev, ritual.id, () => { const copy = {...ritual}; delete (copy as any).isInjected; return copy; }));
          setIsCreating(false); setEditingRitual(null); return;
      }
      const finalRitual = { ...ritual, id: ritual.id || generateId() };
      if (editingRitual) updateCharacter(prev => ({ ...prev, rituals: prev.rituals.map(r => r.id === finalRitual.id ? finalRitual : r) }));
      else updateCharacter(prev => ({ ...prev, rituals: [...(prev.rituals || []), finalRitual] }));
      setIsCreating(false); setEditingRitual(null);
  };

  const handleDeleteRitual = (id: string) => { if(confirm("Deseja excluir este ritual?")) updateCharacter(prev => ({ ...prev, rituals: prev.rituals.filter(r => r.id !== id) })); };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in h-full relative">
      <div className="bg-eden-800 border border-eden-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex justify-between w-full md:w-auto">
              <div className="flex items-center gap-2"><Book className="text-energia" size={20}/><h2 className="font-bold text-lg text-white">Grimório <span className="text-xs bg-eden-950 px-2 py-0.5 rounded-full text-eden-100/50">{filteredRituals.length}</span></h2></div>
              <button onClick={() => setIsCreating(true)} className="md:hidden bg-energia text-eden-900 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-yellow-400 text-xs shadow-lg"><Plus size={14}/> Novo</button>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <select value={elementFilter} onChange={e => setElementFilter(e.target.value)} className="bg-eden-950 border border-eden-700 rounded-lg px-2 py-1.5 text-xs text-eden-100 outline-none flex-1 md:w-32 shrink-0">
                      <option value="all">Todos Elementos</option>
                      {ELEMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
              </div>
              <div className="relative flex-1 md:w-48 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/30 w-4 h-4"/>
                  <input type="text" placeholder="Buscar ritual..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-eden-950 border border-eden-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:border-energia outline-none"/>
              </div>
              <button onClick={() => setIsCreating(true)} className="hidden md:flex bg-energia text-eden-900 px-4 py-1.5 rounded-lg font-bold items-center gap-2 hover:bg-yellow-400 text-xs shadow-lg shrink-0"><Plus size={16}/> Novo</button>
          </div>
      </div>

      {globalTags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
              <span className="text-[10px] uppercase font-bold text-eden-100/30 mt-1 flex items-center gap-1"><Tag size={10}/> Tags:</span>
              {globalTags.map((tag: any) => {
                  const isSelected = selectedTagsFilter.includes(tag.id);
                  return (
                      <button 
                          key={tag.id}
                          onClick={() => setSelectedTagsFilter(p => isSelected ? p.filter(id => id !== tag.id) : [...p, tag.id])}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border transition-all ${isSelected ? 'opacity-100 scale-105 shadow-md' : 'opacity-40 hover:opacity-80'}`}
                          style={{ backgroundColor: `${tag.color}30`, color: tag.color, borderColor: `${tag.color}50` }}
                      >
                          {tag.name}
                      </button>
                  );
              })}
              {selectedTagsFilter.length > 0 && (
                  <button onClick={() => setSelectedTagsFilter([])} className="text-[9px] font-bold text-eden-100/50 hover:text-white px-2 py-0.5 rounded border border-eden-700">Limpar Filtros</button>
              )}
          </div>
      )}

      {filteredRituals.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30">
              <Ghost size={48} className="mx-auto mb-4 opacity-50"/>
              <p className="text-sm font-bold uppercase tracking-widest">Nenhum ritual encontrado.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filteredRituals.map((ritual: any) => {
                const style = ELEMENT_STYLES[ritual.element] || ELEMENT_STYLES['Conhecimento'];
                const activeVersionKey = ritual.normal.isActive ? 'normal' : ritual.discente.isActive ? 'discente' : ritual.verdadeiro.isActive ? 'verdadeiro' : null;
                const activeVersion = activeVersionKey ? ritual[activeVersionKey] : null;
                const isSustainedDuration = activeVersion && activeVersion.duration.toLowerCase().includes('sustentada');
                const isSustainingState = activeVersion && !!activeVersion.isSustaining;

                return (
                    <div key={ritual.id} className={`group relative bg-eden-900/40 border rounded-xl overflow-hidden transition-all flex flex-col ${activeVersion ? 'ring-1 ring-energia bg-energia/5' : ''} ${ritual.isInjected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-eden-700 hover:border-eden-600'}`}>
                        <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12`}>
                            <img src={`/elementos/${ritual.element.toLowerCase()}.png`} alt={ritual.element} className="w-32 h-32 object-contain grayscale invert opacity-50" />
                        </div>

                        {ritual.isInjected && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase z-10">Concedido por Efeito</div>}
                        
                        <div className={`p-3 border-b flex justify-between items-start relative z-10 ${style.bg} ${style.border.replace('border-', 'border-b-')}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 p-1 rounded-lg border ${style.border} bg-black/20 flex items-center justify-center`}>
                                    <img src={`/elementos/${ritual.element.toLowerCase()}.png`} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="pr-1">
                                    <h3 className="font-bold text-eden-100 leading-none">{ritual.name}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        <span className={`text-[9px] uppercase font-bold opacity-70 ${style.color}`}>{ritual.element} • {ritual.circle}º Círculo</span>
                                        <span className="text-[9px] uppercase font-bold text-eden-100/50 bg-black/20 px-1.5 rounded border border-white/5">DT {vars.DT_RITUAL.global + (vars.DT_RITUAL.specific[ritual.id] || 0)}</span>
                                        {(ritual.tags || []).map((tag: any) => (
                                            <span key={tag.id} className="text-[8px] font-black uppercase px-1 rounded border" style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}>{tag.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 relative z-10 shrink-0">
                                {activeVersion ? ( <div className="px-2 py-0.5 bg-energia text-eden-950 text-[10px] font-black uppercase rounded animate-pulse">Ativo ({activeVersionKey})</div> ) : (
                                    <>
                                        <button onClick={() => setEditingRitual(ritual)} className="p-1 rounded bg-black/20 text-eden-100/50 hover:text-white hover:bg-black/40"><Edit2 size={12}/></button>
                                        {!ritual.isInjected && <button onClick={() => handleDeleteRitual(ritual.id)} className="p-1 rounded bg-black/20 text-eden-100/50 hover:text-red-400 hover:bg-black/40"><Trash2 size={12}/></button>}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-3 flex-1 relative z-10">
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-eden-100/60">
                                <div><span className="font-bold text-eden-100 uppercase">Exec:</span> {ritual.normal.execution || '-'}</div><div><span className="font-bold text-eden-100 uppercase">Alcance:</span> {ritual.normal.range || '-'}</div>
                                <div><span className="font-bold text-eden-100 uppercase">Alvo:</span> {ritual.normal.target || '-'}</div><div><span className="font-bold text-eden-100 uppercase">Duração:</span> {ritual.normal.duration || '-'}</div>
                            </div>
                            <p className="text-xs text-eden-100/80 line-clamp-4 italic bg-black/20 p-2 rounded border border-eden-700/30">"{ritual.normal.description}"</p>
                            
                            {activeVersion && isSustainedDuration && (
                                <div className={`border rounded-lg p-2 flex items-center justify-between gap-2 animate-in slide-in-from-left-2 transition-all ${isSustainingState ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-black/20 border-eden-700/50'}`}>
                                    <div className="flex items-center gap-2"><RefreshCw size={14} className={isSustainingState ? "text-yellow-500 animate-spin-slow" : "text-eden-100/30"}/><label className="flex items-center gap-2 cursor-pointer select-none"><div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isSustainingState ? 'bg-yellow-500' : 'bg-eden-800'}`}><div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${isSustainingState ? 'translate-x-4' : 'translate-x-0'}`}/></div><input type="checkbox" className="hidden" checked={isSustainingState} onChange={() => toggleSustain(ritual.id, activeVersionKey as any, ritual.isInjected)}/><span className={`text-[10px] font-bold uppercase ${isSustainingState ? 'text-yellow-200' : 'text-eden-100/50'}`}>{isSustainingState ? 'Sustentando' : 'Sustentar?'}</span></label></div>
                                    {isSustainingState && <button onClick={paySustainCost} className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 rounded text-[10px] font-bold transition-colors"><RefreshCw size={12}/> -1 PE</button>}
                                </div>
                            )}

                            {activeVersion && activeVersion.effects?.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-eden-700/50 px-2 pb-2">
                                    <div className="text-[10px] font-bold text-energia uppercase flex items-center gap-1"><Zap size={10}/> Efeitos Ativos</div>
                                    {activeVersion.effects.map((eff: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-xs bg-eden-950 p-1.5 rounded border border-eden-700">
                                            <span className={eff.isActive === false ? "opacity-50 line-through" : ""}>{eff.name || eff.category.replace('_', ' ')}</span>
                                            <button onClick={() => activeVersionKey && toggleActiveEffect(ritual.id, activeVersionKey as any, eff.id, ritual.isInjected || ritual.isOverridden)} className={`p-1 rounded hover:bg-white/10 ${eff.isActive !== false ? 'text-green-400' : 'text-eden-100/20'}`}><Power size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 bg-eden-950 border-t border-eden-700 flex flex-col gap-2 relative z-10">
                            {activeVersion ? (
                                <button onClick={() => deactivateRitual(ritual.id, ritual.isInjected)} className="w-full py-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/50 flex items-center justify-center gap-2"><StopCircle size={14}/> Dissipar Ritual</button>
                            ) : (
                                <div className="flex gap-1">
                                    <button onClick={() => initiateCast(ritual, 'normal')} className="flex-1 py-1.5 bg-eden-800 hover:bg-eden-700 border border-eden-600 rounded text-[10px] font-bold text-white transition-colors">Normal ({ritual.normal.cost} PE)</button>
                                    {(ritual.discente?.cost > 0 || (ritual.discente?.description && ritual.discente.description.trim().length > 0) || ritual.circle >= 2) && ( 
                                        <button onClick={() => initiateCast(ritual, 'discente')} className="flex-1 py-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700/50 rounded text-[10px] font-bold text-cyan-200 transition-colors">Discente ({ritual.discente.cost})</button>
                                    )}
                                    {(ritual.verdadeiro?.cost > 0 || (ritual.verdadeiro?.description && ritual.verdadeiro.description.trim().length > 0) || ritual.circle >= 3) && (
                                        <button onClick={() => initiateCast(ritual, 'verdadeiro')} className="flex-1 py-1.5 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-700/50 rounded text-[10px] font-bold text-yellow-200 transition-colors">Verdadeiro ({ritual.verdadeiro.cost})</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {castingState && (
          <CastingModal ritual={castingState.ritual} version={castingState.version} cost={castingState.cost} occultismBonus={getOccultismStats().bonus} occultismDice={getOccultismStats().dice} onConfirm={finalizeCast} onCancel={() => setCastingState(null)} />
      )}
      {(isCreating || editingRitual) && (
          <RitualForm initialData={editingRitual || undefined} onSave={handleSaveRitual} onCancel={() => { setIsCreating(false); setEditingRitual(null); }} />
      )}
    </div>
  );
}