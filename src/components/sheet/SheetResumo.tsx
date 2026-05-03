import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BookOpen, Plus, Trash2, Edit2, Calendar, Hash, Save, X, Ghost, Scroll, ChevronDown } from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export default function SheetResumo({ mesaId }: { mesaId: string }) {
    const [resumos, setResumos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentResumo, setCurrentResumo] = useState<any>(null);

    
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!mesaId) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'mesas', mesaId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const sorted = (data.resumos || []).sort((a: any, b: any) => b.sessionNumber - a.sessionNumber);
                setResumos(sorted);
                
                
                if (sorted.length > 0 && expandedIds.length === 0) {
                    setExpandedIds([sorted[0].id]);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [mesaId]);

    const handleSave = async () => {
        if (!currentResumo.title || !currentResumo.sessionNumber) {
            return alert("Título e Número da Sessão são obrigatórios.");
        }

        try {
            const isNew = !currentResumo.id;
            const finalResumo = {
                ...currentResumo,
                id: isNew ? generateId() : currentResumo.id,
                updatedAt: Date.now()
            };

            let newResumos = [...resumos];
            if (isNew) {
                newResumos.push(finalResumo);
            } else {
                newResumos = newResumos.map(r => r.id === finalResumo.id ? finalResumo : r);
            }

            await updateDoc(doc(db, 'mesas', mesaId), { resumos: newResumos });
            setIsEditing(false);
            setCurrentResumo(null);
            
            
            if (!expandedIds.includes(finalResumo.id)) {
                setExpandedIds(prev => [...prev, finalResumo.id]);
            }

        } catch (error) {
            alert("Erro ao salvar resumo.");
            console.error(error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (!confirm("Tem certeza que deseja apagar este resumo? Ele sumirá para todos da mesa.")) return;
        try {
            const newResumos = resumos.filter(r => r.id !== id);
            await updateDoc(doc(db, 'mesas', mesaId), { resumos: newResumos });
        } catch (error) {
            alert("Erro ao apagar.");
        }
    };

    const openEdit = (resumo?: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); 
        if (resumo) {
            setCurrentResumo({ ...resumo });
        } else {
            setCurrentResumo({ id: '', title: '', sessionNumber: resumos.length + 1, date: '', content: '' });
        }
        setIsEditing(true);
    };

    
    const toggleExpand = (id: string) => {
        setExpandedIds(prev => 
            prev.includes(id) 
            ? prev.filter(expandedId => expandedId !== id) 
            : [...prev, id]
        );
    };

    if (!mesaId) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30">
                <Ghost size={48} className="mx-auto mb-4 opacity-50"/>
                <p>Esta ficha não está vinculada a uma mesa.</p>
                <p className="text-xs mt-1">Os resumos de campanha só funcionam dentro de Sessões Ativas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><BookOpen className="text-conhecimento" /> Diário de Campanha</h2>                    
                </div>
                <button onClick={() => openEdit()} className="hidden bg-conhecimento text-eden-900 px-4 py-2 rounded-lg text-xs font-black md:flex items-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg">
                    <Plus size={16}/> NOVO RESUMO
                </button>
                <button onClick={() => openEdit()} className="md:hidden bg-conhecimento text-eden-900 px-4 py-2 rounded-lg text-xs font-black items-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg">
                    <Plus size={16}/>
                </button>
            </div>

            {isEditing && currentResumo && (
                <div className="bg-eden-950/80 border border-conhecimento/50 p-4 md:p-6 rounded-xl space-y-4 animate-in slide-in-from-top-4 shadow-2xl relative">
                    <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-eden-100/50 hover:text-white"><X size={20}/></button>
                    <h3 className="text-conhecimento font-black uppercase tracking-widest flex items-center gap-2 border-b border-conhecimento/30 pb-2">
                        <Scroll size={18}/> {currentResumo.id ? 'Editar Resumo' : 'Escrever Resumo'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50">Título da Sessão</label>
                            <input type="text" value={currentResumo.title} onChange={e => setCurrentResumo({...currentResumo, title: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-conhecimento" placeholder="Ex: O Despertar"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50">Sessão Nº</label>
                            <input type="number" value={currentResumo.sessionNumber} onChange={e => setCurrentResumo({...currentResumo, sessionNumber: Number(e.target.value)})} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-conhecimento"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50">Data Real</label>
                            <input type="date" value={currentResumo.date} onChange={e => setCurrentResumo({...currentResumo, date: e.target.value})} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-conhecimento" style={{colorScheme: 'dark'}}/>
                        </div>
                        <div className="md:col-span-4 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-eden-100/50">Resumo dos Acontecimentos</label>
                            <textarea value={currentResumo.content} onChange={e => setCurrentResumo({...currentResumo, content: e.target.value})} className="w-full min-h-[200px] bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 outline-none focus:border-conhecimento resize-none" placeholder="O que aconteceu nesta sessão...?"/>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-eden-700/50">
                        <button onClick={handleSave} className="bg-conhecimento text-eden-900 px-6 py-2.5 rounded-lg text-sm font-black flex items-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg"><Save size={16}/> SALVAR NO DIÁRIO</button>
                    </div>
                </div>
            )}

            {!loading && resumos.length === 0 && !isEditing && (
                <div className="text-center py-20 border-2 border-dashed border-eden-800 rounded-xl text-eden-100/30">Nenhum resumo publicado ainda.</div>
            )}

            <div className="space-y-4">
                {resumos.map((resumo: any) => {
                    const isExpanded = expandedIds.includes(resumo.id);
                    
                    return (
                        <div key={resumo.id} className="bg-eden-900/50 border border-eden-700/50 rounded-xl overflow-hidden shadow-lg group transition-all">
                            {}
                            <div 
                                onClick={() => toggleExpand(resumo.id)}
                                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? 'bg-conhecimento/10 border-b border-conhecimento/20' : 'bg-eden-950 hover:bg-eden-800 border-b border-transparent'}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <div className="flex items-center gap-1.5 text-conhecimento bg-conhecimento/10 px-2 py-1 rounded border border-conhecimento/20 text-xs font-black uppercase tracking-widest"><Hash size={14}/> SESSÃO {resumo.sessionNumber}</div>
                                    <h3 className={`font-black text-lg transition-colors ${isExpanded ? 'text-conhecimento' : 'text-white'}`}>{resumo.title}</h3>
                                    
                                    {}
                                    {!isExpanded && resumo.date && (
                                        <span className="text-[10px] uppercase font-bold text-eden-100/30 ml-2 hidden md:flex items-center gap-1">
                                            <Calendar size={12}/> {new Date(resumo.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-1 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={(e) => openEdit(resumo, e)} className="p-1.5 hover:text-conhecimento hover:bg-conhecimento/10 rounded transition-colors" title="Editar"><Edit2 size={16}/></button>
                                        <button onClick={(e) => handleDelete(resumo.id, e)} className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Excluir"><Trash2 size={16}/></button>
                                    </div>
                                    <div className={`text-eden-100/50 transition-transform ${isExpanded ? 'rotate-180 text-conhecimento' : ''}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                            
                            {}
                            {isExpanded && (
                                <div className="p-5 space-y-4 bg-eden-900/20 animate-in slide-in-from-top-2">
                                    <div className="flex gap-4 text-[10px] uppercase font-bold text-conhecimento/60">
                                        {resumo.date && <span className="flex items-center gap-1"><Calendar size={12}/> Ocorrida em: {new Date(resumo.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                                    </div>
                                    <p className="text-sm md:text-base text-eden-100/80 leading-relaxed whitespace-pre-wrap">{resumo.content}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}