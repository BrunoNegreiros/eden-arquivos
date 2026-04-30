import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import type { UserRitual, ElementType, RitualVersion } from '../../types/systemData';
import { Plus, X, Search, Settings, Trash2, AlertCircle, Edit2, Power } from 'lucide-react';
import EffectEditor from '../sheet/EffectEditor';

const ELEMENTS: ElementType[] = ['Conhecimento', 'Energia', 'Morte', 'Sangue', 'Medo'];

const ELEMENT_STYLES: Record<string, { color: string; border: string; bg: string }> = {
  Conhecimento: { color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-950/30' },
  Energia: { color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-950/30' },
  Morte: { color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-950/30' },
  Sangue: { color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-950/30' },
  Medo: { color: 'text-white', border: 'border-white', bg: 'bg-eden-950' },
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const RitualVersionEditor = ({ label, version, onChange, baseVersion }: { label: string; version: RitualVersion; onChange: (v: RitualVersion) => void; baseVersion?: RitualVersion; }) => {
    const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);
    const [showPrereqs, setShowPrereqs] = useState(!!version.requiredCircle || !!version.affinity);
    
    // Agora avaliamos se está ativa
    if (!version.isActive && label !== 'Normal') {
        return (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-eden-700/50 rounded-xl bg-eden-900/20 gap-3">
                <p className="text-eden-100/40 text-sm">Versão {label} não habilitada.</p>
                <button 
                    onClick={() => {
                        const base = baseVersion || version;
                        onChange({ ...base, isActive: true, cost: (base.cost || 1) + (label === 'Discente' ? 2 : 5) });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-eden-800 hover:bg-eden-700 rounded-lg text-xs font-bold text-eden-100 transition-colors"
                >
                    <Plus size={14}/> Habilitar {label}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-eden-900/50 p-4 rounded-xl border border-eden-700 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-eden-100/50 block">Custo (PE)</label>
                        <input 
                            type="number" value={version.cost} onChange={e => onChange({...version, cost: Number(e.target.value)})}
                            className="w-20 bg-eden-950 border border-eden-600 rounded p-1.5 text-center font-bold text-sm text-white focus:border-energia outline-none"
                        />
                    </div>
                    
                    {label !== 'Normal' && (
                        <div className="flex flex-col items-end gap-2">
                            <button onClick={() => onChange({...version, isActive: false})} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors">
                                <Trash2 size={12}/> Desabilitar Versão
                            </button>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-eden-100/60 select-none">
                                <input type="checkbox" checked={showPrereqs} onChange={(e) => {
                                    setShowPrereqs(e.target.checked);
                                    if (!e.target.checked) onChange({...version, requiredCircle: undefined, affinity: undefined});
                                }} className="rounded bg-eden-950 border-eden-600" />
                                Definir Pré-requisitos
                            </label>
                        </div>
                    )}
                </div>

                {showPrereqs && label !== 'Normal' && (
                    <div className="pt-3 border-t border-eden-700/50 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50 block">Círculo Mínimo</label>
                            <select 
                                value={version.requiredCircle || 2} 
                                onChange={e => onChange({...version, requiredCircle: Number(e.target.value) as any})}
                                className="w-full bg-eden-950 border border-eden-600 rounded p-1.5 text-xs text-white"
                            >
                                <option value={2}>2º Círculo</option><option value={3}>3º Círculo</option><option value={4}>4º Círculo</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50 block">Afinidade</label>
                            <div className="flex gap-2">
                                <label className="flex items-center gap-1 cursor-pointer bg-eden-950 border border-eden-600 px-2 rounded w-full">
                                    <input type="checkbox" checked={!!version.affinity} onChange={e => onChange({...version, affinity: e.target.checked ? 'Conhecimento' : undefined})} />
                                    <span className="text-[10px] uppercase font-bold text-eden-100">Requerer</span>
                                </label>
                                {version.affinity && (
                                    <select 
                                        value={version.affinity}
                                        onChange={e => onChange({...version, affinity: e.target.value as ElementType})}
                                        className="bg-eden-950 border border-eden-600 rounded p-1 text-[10px] text-eden-100 flex-1"
                                    >
                                        {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-eden-100/50">Execução</label>
                    <input type="text" value={version.execution} onChange={e => onChange({...version, execution: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-eden-100/50">Alcance</label>
                    <input type="text" value={version.range} onChange={e => onChange({...version, range: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-eden-100/50">Alvo/Área</label>
                    <input type="text" value={version.target} onChange={e => onChange({...version, target: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-eden-100/50">Duração</label>
                    <input type="text" value={version.duration} onChange={e => onChange({...version, duration: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-eden-100/50">Resistência</label>
                    <input type="text" value={version.resistance} onChange={e => onChange({...version, resistance: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded p-1.5 text-xs text-white" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-eden-100/60 uppercase">Descrição & Efeitos</label>
                <textarea 
                    value={version.description} onChange={e => onChange({...version, description: e.target.value})}
                    className="w-full h-32 bg-eden-950 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 outline-none resize-none"
                    placeholder={`Descreva o que acontece na versão ${label}...`}
                />
            </div>
            
            <div className="bg-black/20 rounded-xl border border-eden-700/50 p-4 space-y-3">
                 <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-eden-100/50 uppercase flex items-center gap-2">Efeitos Mecânicos</h4>
                    <button 
                        onClick={() => {
                            const newEffect = { id: Date.now().toString(), name: 'Novo Efeito', category: 'add_fixed', value: { terms: [{ id: '1', type: 'fixed', value: 1 }], operations: [] }, targets: [] } as any;
                            const newEffectsList = [...(version.effects || []), newEffect];
                            onChange({ ...version, effects: newEffectsList });
                            setEditingEffectIndex(newEffectsList.length - 1);
                        }} 
                        className="text-xs bg-eden-800 text-energia px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-eden-700 transition-colors shadow-sm border border-eden-700"
                    >
                        <Plus size={12}/> Novo Efeito
                    </button>
                 </div>
                 
                 <div className="space-y-2">
                    {(version.effects || []).map((eff: any, idx: number) => (
                       <div key={eff.id} className={`flex justify-between items-center bg-eden-900/50 p-3 rounded-lg border ${eff.isActive !== false ? 'border-eden-700/30 hover:border-eden-600' : 'border-eden-800 opacity-50'} transition-colors`}>
                          <div className="flex flex-col">
                              <span className={`text-xs font-bold capitalize ${eff.isActive !== false ? 'text-white' : 'text-eden-100/50 line-through'}`}>
                                  {eff.name ? eff.name : eff.category.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-eden-100/50">{eff.targets?.length || 0} alvo(s) configurado(s)</span>
                          </div>
                          <div className="flex gap-2 items-center">
                             <button 
                                 title={eff.isActive !== false ? 'Desativar este Efeito' : 'Ativar este Efeito'}
                                 onClick={() => {
                                     const newEffects = [...(version.effects || [])];
                                     newEffects[idx] = { ...eff, isActive: eff.isActive === false ? true : false };
                                     onChange({ ...version, effects: newEffects });
                                 }} 
                                 className={`p-1 rounded transition-colors ${eff.isActive !== false ? 'text-energia hover:bg-energia/10' : 'text-eden-100/50 hover:bg-white/10'}`}
                             >
                                 <Power size={14}/>
                             </button>
                             <button onClick={() => setEditingEffectIndex(idx)} className="text-eden-100/50 hover:text-white p-1 hover:bg-white/10 rounded"><Edit2 size={14}/></button>
                             <button onClick={() => {
                                 const newEffects = [...(version.effects || [])];
                                 newEffects.splice(idx, 1);
                                 onChange({ ...version, effects: newEffects });
                             }} className="text-eden-100/50 hover:text-red-400 p-1 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    ))}
                    {(!version.effects || version.effects.length === 0) && <p className="text-[10px] text-eden-100/20 italic text-center py-4 border border-dashed border-eden-800 rounded-lg">Sem efeitos configurados para esta versão.</p>}
                 </div>
            </div>

            {editingEffectIndex !== null && version.effects?.[editingEffectIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">Configurar Efeito do Ritual</h3>
                            <button onClick={() => setEditingEffectIndex(null)} className="text-eden-100/50 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                            <EffectEditor
                                effect={version.effects[editingEffectIndex]}
                                onChange={(updatedEffect: any) => {
                                    const newEffects = [...(version.effects || [])];
                                    newEffects[editingEffectIndex] = updatedEffect;
                                    onChange({ ...version, effects: newEffects });
                                }}
                                onRemove={() => {
                                    const newEffects = [...(version.effects || [])];
                                    newEffects.splice(editingEffectIndex, 1);
                                    onChange({ ...version, effects: newEffects });
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
};

export const RitualForm = ({ initialData, onSave, onCancel }: { initialData?: UserRitual, onSave: (r: UserRitual) => void, onCancel: () => void }) => {
    // ATUALIZADO: Valores Padrão ("Nenhuma" para resistência, e isActive false para todos)
    const defaultVersion: RitualVersion = { 
        isActive: false, cost: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Instantânea', resistance: 'Nenhuma', description: '', effects: [] 
    };
    
    const defaultRitual: UserRitual = {
        id: '', name: '', element: 'Conhecimento', circle: 1,
        normal: { ...defaultVersion, isActive: true }, // O normal começa ativo
        discente: { ...defaultVersion },
        verdadeiro: { ...defaultVersion }
    };

    const [data, setData] = useState<UserRitual>(initialData || defaultRitual);
    const [activeTab, setActiveTab] = useState<'normal' | 'discente' | 'verdadeiro'>('normal');
    
    const style = ELEMENT_STYLES[data.element] || ELEMENT_STYLES.Medo;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className={`bg-eden-900 w-full max-w-4xl max-h-[95vh] rounded-2xl border ${style.border} shadow-2xl flex flex-col`}>
                
                <div className={`p-4 border-b ${style.border} ${style.bg} rounded-t-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                    <div className="flex items-center gap-3 w-full">
                        {/* ATUALIZADO: Imagem do Elemento no Header */}
                        <div className={`w-12 h-12 p-1.5 rounded-lg bg-black/20 ${style.border} border flex items-center justify-center`}>
                            <img src={`/elementos/${data.element.toLowerCase()}.png`} alt={data.element} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <input 
                                type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})}
                                className="bg-transparent border-b border-white/20 w-full text-xl font-black text-white placeholder-white/30 focus:border-white outline-none"
                                placeholder="Nome do Ritual"
                            />
                            <div className="flex gap-2">
                                <select 
                                    value={data.element} onChange={e => setData({...data, element: e.target.value as ElementType})}
                                    className="bg-black/20 border border-white/10 rounded text-[10px] uppercase font-bold text-white px-2 py-0.5"
                                >
                                    {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                                </select>
                                <select 
                                    value={data.circle} onChange={e => setData({...data, circle: Number(e.target.value) as any})}
                                    className="bg-black/20 border border-white/10 rounded text-[10px] uppercase font-bold text-white px-2 py-0.5"
                                >
                                    {[1,2,3,4].map(c => <option key={c} value={c}>{c}º Círculo</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-eden-100/50 hover:text-white absolute top-4 right-4 md:static"><X size={24}/></button>
                </div>

                <div className="flex border-b border-eden-700 bg-eden-900/50 px-4 pt-4 gap-1">
                    <button 
                        onClick={() => setActiveTab('normal')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all ${activeTab === 'normal' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}
                    >
                        Normal
                    </button>
                    <button 
                        onClick={() => setActiveTab('discente')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'discente' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}
                    >
                        Discente {!data.discente.isActive && <span className="w-2 h-2 rounded-full bg-eden-700"/>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('verdadeiro')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'verdadeiro' ? 'bg-eden-800 text-white border-t border-x border-eden-700' : 'text-eden-100/50 hover:text-eden-100 hover:bg-eden-800/50'}`}
                    >
                        Verdadeiro {!data.verdadeiro.isActive && <span className="w-2 h-2 rounded-full bg-eden-700"/>}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-eden-800/30">
                    {activeTab === 'normal' && <RitualVersionEditor label="Normal" version={data.normal} onChange={v => setData({...data, normal: v})} />}
                    {activeTab === 'discente' && <RitualVersionEditor label="Discente" version={data.discente} baseVersion={data.normal} onChange={v => setData({...data, discente: v})} />}
                    {activeTab === 'verdadeiro' && <RitualVersionEditor label="Verdadeiro" version={data.verdadeiro} baseVersion={data.normal} onChange={v => setData({...data, verdadeiro: v})} />}
                </div>

                <div className="p-4 border-t border-eden-700 bg-eden-800 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-eden-100 hover:bg-eden-700 rounded-lg text-sm font-bold">Cancelar</button>
                    <button onClick={() => onSave(data)} disabled={!data.name} className="px-6 py-2 bg-energia text-eden-900 rounded-lg text-sm font-black hover:bg-yellow-400 shadow-lg">SALVAR RITUAL</button>
                </div>
             </div>
        </div>
    );
};

export default function Step7Rituals() {
  const { character, updateCharacter } = useCharacter();
  const rituals = (character.rituals || []) as unknown as UserRitual[];
  const isOcultista = character.personal.class === 'ocultista';
  const limit = isOcultista ? 3 : 0; 

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingRitual, setEditingRitual] = useState<UserRitual | null>(null);

  const handleSave = (ritual: UserRitual) => {
      const finalRitual = { ...ritual, id: ritual.id || generateId() };
      
      updateCharacter(prev => ({ 
          ...prev, 
          rituals: editingRitual ? rituals.map(r => r.id === finalRitual.id ? finalRitual : r) : [...rituals, finalRitual] 
      }));
      setIsCreating(false);
      setEditingRitual(null);
  };

  const handleDelete = (id: string) => {
      if (confirm("Remover este ritual?")) {
           updateCharacter(prev => ({ ...prev, rituals: rituals.filter(r => r.id !== id) }));
      }
  };

  const filteredRituals = rituals.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderNonOcultistWarning = () => (
     <div className="bg-eden-900/50 border border-yellow-500/30 p-4 rounded-xl flex gap-3 items-start mb-4">
         <AlertCircle className="text-yellow-500 shrink-0" />
         <div>
             <h4 className="text-yellow-500 font-bold text-sm">Atenção: Classe Mundana</h4>
             <p className="text-xs text-eden-100/70 mt-1">Seu personagem não é Ocultista. Adicione rituais apenas se possuir <strong>Aprender Ritual</strong>.</p>
         </div>
     </div>
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-500 h-full relative">
      <div className="shrink-0 text-center space-y-2">
          <h2 className="text-3xl font-bold text-eden-100">Grimório</h2>
          <div className="inline-flex items-center gap-2 bg-eden-900 border border-eden-700 px-3 py-1 rounded-full text-xs font-mono">
              <span className="text-eden-100/50">Rituais:</span>
              <span className="text-white font-bold">{rituals.length}</span>
              {limit > 0 && <span className="text-eden-100/30">/ {limit}</span>}
          </div>
      </div>

      {!isOcultista && filteredRituals.length === 0 && renderNonOcultistWarning()}

      <div className="flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/40 w-4 h-4" />
             <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-eden-800 border border-eden-700 rounded-xl py-2 pl-9 pr-4 text-sm text-eden-100 focus:border-eden-100 outline-none" />
          </div>
          <button onClick={() => setIsCreating(true)} className="bg-energia text-eden-900 px-4 rounded-xl font-bold text-sm hover:bg-yellow-400 shadow-lg flex items-center gap-2">
             <Plus size={18} /> Novo Ritual
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-1 pb-4 flex-1 min-h-[400px]">
          {filteredRituals.map(ritual => {
              const style = ELEMENT_STYLES[ritual.element] || ELEMENT_STYLES.Medo;
              return (
                  <div key={ritual.id} className={`group relative bg-eden-800/40 border ${style.border} rounded-xl p-4 overflow-hidden hover:bg-eden-800 transition-all`}>
                      
                      {/* ATUALIZADO: Imagem do Elemento gigante de fundo */}
                      <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12`}>
                          <img src={`/elementos/${ritual.element.toLowerCase()}.png`} alt={ritual.element} className="w-32 h-32 object-contain grayscale invert opacity-50" />
                      </div>

                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className={`font-bold text-lg leading-tight ${style.color}`}>{ritual.name}</h4>
                              <div className="flex gap-1">
                                  <button onClick={() => { setEditingRitual(ritual); setIsCreating(true); }} className="p-1.5 hover:bg-eden-900/50 rounded text-eden-100/50 hover:text-white"><Settings size={14}/></button>
                                  <button onClick={() => handleDelete(ritual.id)} className="p-1.5 hover:bg-eden-900/50 rounded text-eden-100/50 hover:text-red-400"><Trash2 size={14}/></button>
                              </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3 items-center">
                              {/* ATUALIZADO: Imagem Pequena ao lado do nome do elemento */}
                              <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${style.border} ${style.bg} ${style.color}`}>
                                  <img src={`/elementos/${ritual.element.toLowerCase()}.png`} alt="" className="w-3 h-3 object-contain" />
                                  {ritual.element}
                              </div>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-eden-600 text-eden-100/70">{ritual.circle}º Círculo</span>
                          </div>
                          <p className="text-xs text-eden-100/70 line-clamp-3 italic">"{ritual.normal.description}"</p>
                          
                          <div className="flex gap-2 mt-3 pt-2 border-t border-eden-700/30">
                              <span className="text-[9px] font-mono text-eden-100/50">{ritual.normal.cost} PE</span>
                              {ritual.discente.isActive && <span className="text-[9px] font-mono text-cyan-400">Discente ({ritual.discente.cost} PE)</span>}
                              {ritual.verdadeiro.isActive && <span className="text-[9px] font-mono text-yellow-400">Verdadeiro ({ritual.verdadeiro.cost} PE)</span>}
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      {(isCreating || editingRitual) && <RitualForm initialData={editingRitual || undefined} onSave={handleSave} onCancel={() => { setIsCreating(false); setEditingRitual(null); }} />}
    </div>
  );
}