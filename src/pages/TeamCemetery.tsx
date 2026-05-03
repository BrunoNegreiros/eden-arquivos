import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase'; 
import { Skull, Home as HomeIcon, Ghost, Flower2, PenTool, Loader2, Info, Edit2 } from 'lucide-react';

// Cores e estilos para a atmosfera
const STONE_BG = 'bg-[#1a1a1a]';
const STONE_BORDER = 'border-[#333]';
const DEFAULT_EPITAPH = "Aqueles que se sacrificam na luta contra o Outro Lado nunca são esquecidos.";

export default function TeamCemetery() {
    const { mesaId } = useParams();
    const currentUser = auth.currentUser;

    const [mesa, setMesa] = useState<any>(null);
    const [fallenHeroes, setFallenHeroes] = useState<any[]>([]);
    const [myActiveChars, setMyActiveChars] = useState<any[]>([]);
    const [actingCharId, setActingCharId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Estados de interação por personagem
    const [flowersData, setFlowersData] = useState<Record<string, any[]>>({});
    const [tributesData, setTributesData] = useState<Record<string, any[]>>({});
    
    // UI States
    const [expandedCharId, setExpandedCharId] = useState<string | null>(null);
    const [tributeText, setTributeText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Edição do Mestre
    const [editingEpitaphId, setEditingEpitaphId] = useState<string | null>(null);
    const [epitaphDraft, setEpitaphDraft] = useState('');

    // Hoje (para a lógica das flores diárias)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Busca Dados Globais (Mesa e Personagens)
    useEffect(() => {
        if (!mesaId) return;

        getDoc(doc(db, 'mesas', mesaId)).then(snap => {
            if (snap.exists()) setMesa(snap.data());
        });

        const qChars = query(collection(db, 'characters'), where('mesaId', '==', mesaId));

        const unsubChars = onSnapshot(qChars, (snap) => {
            const fallen: any[] = [];
            const activeMine: any[] = [];
            
            snap.forEach(d => {
                const data = { ...d.data(), id: d.id } as any; 
                if (data.isDead && !data.isPrivate) {
                    fallen.push(data);
                } else if (!data.isDead && data.userId === currentUser?.uid) {
                    activeMine.push(data);
                }
            });
            
            setFallenHeroes(fallen);
            setMyActiveChars(activeMine);
            
            // Define o primeiro personagem vivo como padrão para interações
            if (activeMine.length > 0 && !actingCharId) {
                setActingCharId(activeMine[0].id);
            }
            
            setLoading(false);
        });

        return () => unsubChars();
    }, [mesaId, currentUser]);

    // Busca Flores e Tributos
    useEffect(() => {
        if (!mesaId) return;

        // Flores
        const qFlowers = query(collection(db, `mesas/${mesaId}/cemetery_flowers`));
        const unsubFlowers = onSnapshot(qFlowers, (snap) => {
            const flowersByChar: Record<string, any[]> = {};
            snap.forEach(doc => {
                const data = doc.data();
                if (data.date === dateString) {
                    if (!flowersByChar[data.characterId]) flowersByChar[data.characterId] = [];
                    flowersByChar[data.characterId].push({ id: doc.id, ...data });
                }
            });
            setFlowersData(flowersByChar);
        });

        // Tributos (Comentários)
        const qTributes = query(collection(db, `mesas/${mesaId}/cemetery_tributes`));
        const unsubTributes = onSnapshot(qTributes, (snap) => {
            const tributesByChar: Record<string, any[]> = {};
            snap.forEach(doc => {
                const data = doc.data();
                if (!tributesByChar[data.characterId]) tributesByChar[data.characterId] = [];
                tributesByChar[data.characterId].push({ id: doc.id, ...data });
            });
            for (const charId in tributesByChar) {
                 tributesByChar[charId].sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
            }
            setTributesData(tributesByChar);
        });

        return () => { unsubFlowers(); unsubTributes(); }
    }, [mesaId, dateString]);

    const isMestre = currentUser && mesa && currentUser.uid === mesa.mestreId;
    
    // Identifica quem está agindo (O personagem selecionado ou a conta do usuário como fallback)
    const actorId = actingCharId || currentUser?.uid;
    const actorName = myActiveChars.find(c => c.id === actingCharId)?.personal?.name || currentUser?.displayName || 'Agente Anônimo';

    // Ações
    const handleLeaveFlower = async (characterId: string) => {
        if (!actorId || !mesaId) return;
        
        const flowerId = `${actorId}_${characterId}_${dateString}`;
        const docRef = doc(db, `mesas/${mesaId}/cemetery_flowers`, flowerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            await deleteDoc(docRef);
        } else {
            await setDoc(docRef, {
                characterId,
                actorId: actorId,
                userName: actorName,
                date: dateString,
                timestamp: serverTimestamp()
            });
        }
    };

    const handleSubmitTribute = async (characterId: string) => {
        if (!actorId || !mesaId || !tributeText.trim()) return;
        setIsSubmitting(true);

        const tributeId = `${actorId}_${characterId}`;
        const docRef = doc(db, `mesas/${mesaId}/cemetery_tributes`, tributeId);

        try {
            await setDoc(docRef, {
                characterId,
                actorId: actorId,
                userName: actorName,
                text: tributeText.trim(),
                createdAt: serverTimestamp()
            });
            setTributeText('');
        } catch(e) {
            console.error("Erro ao deixar tributo", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTribute = async (tributeId: string) => {
        if (!mesaId || !confirm("Retirar suas palavras deste memorial?")) return;
        await deleteDoc(doc(db, `mesas/${mesaId}/cemetery_tributes`, tributeId));
    };

    const handleSaveEpitaph = async (characterId: string) => {
        if (!mesaId || !isMestre) return;
        try {
            await updateDoc(doc(db, 'characters', characterId), { cemeteryEpitaph: epitaphDraft.trim() });
            setEditingEpitaphId(null);
        } catch(e) {
            console.error("Erro ao salvar epitáfio", e);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-red-500/50"><Loader2 className="animate-spin" size={40}/></div>;
    }

    return (
        <div className="min-h-screen bg-black font-serif text-gray-300 relative overflow-x-hidden selection:bg-red-900 selection:text-white pb-20">
            {/* Efeitos Atmosféricos de Fundo */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)' }}></div>
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="relative z-10 p-4 md:p-8 flex flex-col items-center min-h-screen">
                
                {/* Header */}
                <header className="w-full max-w-5xl flex flex-col md:flex-row gap-6 justify-between items-center mb-12 border-b border-gray-800 pb-6">
                    <Link to={`/mesa/${mesaId}/grupo`} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest text-xs font-sans shrink-0">
                        <HomeIcon size={16}/> Retornar à Base
                    </Link>
                    
                    <h1 className="text-xl md:text-3xl font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 md:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] text-center">
                        <Skull size={24} className="text-red-900 hidden md:block"/> Memorial
                    </h1>

                    <div className="w-full md:w-auto flex justify-center">
                        {myActiveChars.length > 1 ? (
                            <div className="flex flex-col items-center md:items-end gap-1">
                                <span className="text-[9px] uppercase font-bold text-gray-600 tracking-widest">Prestar Homenagens Como:</span>
                                <select 
                                    value={actingCharId} 
                                    onChange={e => setActingCharId(e.target.value)}
                                    className="bg-gray-900 text-gray-300 border border-gray-800 rounded px-2 py-1 text-xs outline-none font-sans"
                                >
                                    {myActiveChars.map(c => <option key={c.id} value={c.id}>{c.personal?.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="text-[10px] uppercase font-bold text-gray-600 tracking-widest text-center md:text-right hidden md:block">
                                Prestando Homenagens como:<br/> <span className="text-gray-400">{actorName}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className="w-full max-w-5xl">
                    {fallenHeroes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-600 opacity-50 space-y-4">
                            <Ghost size={64} className="mb-4" />
                            <p className="text-lg uppercase tracking-widest font-sans font-black">Nenhum Túmulo Encontrado</p>
                            <p className="text-sm font-serif italic text-center max-w-md">"A sorte tem sorrido para esta equipe. Que a terra continue intocada."</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 items-end justify-center">
                            {fallenHeroes.map(char => {
                                const charFlowers = flowersData[char.id] || [];
                                const charTributes = tributesData[char.id] || [];
                                const hasLeftFlowerToday = charFlowers.some(f => f.actorId === actorId);
                                const hasLeftTribute = charTributes.some(t => t.actorId === actorId);
                                const isExpanded = expandedCharId === char.id;
                                const epitaph = char.cemeteryEpitaph || DEFAULT_EPITAPH;

                                return (
                                    // AQUI: Somente aplica o scale (zoom) em telas md ou maiores
                                    <div key={char.id} className={`flex flex-col transform transition-all duration-500 ease-out origin-bottom ${isExpanded ? 'md:scale-105 z-20' : 'md:hover:scale-105 z-10'}`}>
                                        
                                        {/* A LÁPIDE (Tombstone) */}
                                        <div className={`relative ${STONE_BG} rounded-t-full border-t-2 border-x-2 md:border-t-4 md:border-x-4 ${STONE_BORDER} shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.05)] p-6 md:p-8 text-center flex flex-col items-center justify-start min-h-[350px] overflow-hidden`}>
                                            
                                            {/* Textura da Pedra (De volta para o mobile) */}
                                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}></div>
                                            
                                            {/* Retrato */}
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-800 overflow-hidden mb-6 relative z-20 shadow-[0_5px_15px_rgba(0,0,0,0.5)] filter grayscale contrast-75 sepia-[0.3]">
                                                {char.personal?.portraitUrl ? <img src={char.personal.portraitUrl} className="w-full h-full object-cover" alt="Retrato Póstumo"/> : <Ghost className="w-full h-full p-4 text-gray-700 bg-black" />}
                                            </div>

                                            {/* Inscrições (Z-index 20 para o texto não borrar com os overlays do fundo) */}
                                            <div className="relative z-20 space-y-2 w-full drop-shadow-md">
                                                <h2 className="text-xl md:text-2xl font-black text-gray-300 uppercase tracking-widest leading-none font-sans">
                                                    {char.personal?.name}
                                                </h2>
                                                {char.personal?.trail && (
                                                    <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-sans font-bold">
                                                        {char.personal.class} • {char.personal.trail}
                                                    </p>
                                                )}
                                                
                                                {/* ÁREA DO EPITÁFIO EDITÁVEL */}
                                                {editingEpitaphId === char.id ? (
                                                    <div className="py-4 my-4 border-y border-gray-800/50">
                                                        <textarea 
                                                            value={epitaphDraft}
                                                            onChange={e => setEpitaphDraft(e.target.value)}
                                                            className="w-full bg-black/50 text-gray-300 text-sm italic p-3 rounded-lg border border-gray-700 outline-none resize-none"
                                                            rows={3}
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2 font-sans">
                                                            <button onClick={() => setEditingEpitaphId(null)} className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">Cancelar</button>
                                                            <button onClick={() => handleSaveEpitaph(char.id)} className="px-3 py-1 text-[10px] uppercase font-black bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors">Salvar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-4 my-4 border-y border-gray-800/50 relative group">
                                                        <p className="text-sm italic text-gray-400 leading-relaxed px-2">"{epitaph}"</p>
                                                        {isMestre && (
                                                            <button 
                                                                onClick={() => { setEditingEpitaphId(char.id); setEpitaphDraft(epitaph); }} 
                                                                className="absolute top-2 right-0 md:-right-4 opacity-100 md:opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300 bg-black/40 p-1.5 rounded-full transition-all"
                                                                title="Mestre: Editar Frase"
                                                            >
                                                                <Edit2 size={12}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="text-[10px] text-gray-600 font-sans uppercase tracking-widest font-bold mb-3">
                                                    NEX Final: {char.personal?.nex}%
                                                </div>

                                                <Link to={`/mesa/${mesaId}/ficha/${char.id}`} className="mt-4 px-6 py-2 bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest rounded-full border border-gray-700 transition-colors inline-block font-sans">
                                                    Abrir Registros
                                                </Link>
                                            </div>

                                            {/* Base/Chão da lápide simulado */}
                                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
                                        </div>

                                        {/* ÁREA INTERATIVA (Chão/Grama em frente à lápide) */}
                                        <div className="bg-black border border-gray-900 p-4 rounded-b-xl shadow-2xl z-20 relative">
                                            
                                            {/* Exibição de Flores na grama */}
                                            <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[32px] px-2">
                                                {charFlowers.map((f, i) => (
                                                    <span key={f.id} title={`Flor deixada por ${f.userName}`} className="text-xl animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                                        🥀
                                                    </span>
                                                ))}
                                                {charFlowers.length === 0 && <span className="text-xs text-gray-700 italic font-serif flex items-center h-8">Nenhuma flor deixada hoje.</span>}
                                            </div>

                                            {/* Botões de Ação */}
                                            <div className="flex gap-2 font-sans">
                                                <button 
                                                    onClick={() => handleLeaveFlower(char.id)}
                                                    className={`flex-1 py-2.5 rounded-lg border text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all ${hasLeftFlowerToday ? 'bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-950/50' : 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-gray-300'}`}
                                                >
                                                    <Flower2 size={14}/> {hasLeftFlowerToday ? 'Recolher Flor' : 'Deixar Flor'}
                                                </button>
                                                <button 
                                                    onClick={() => setExpandedCharId(isExpanded ? null : char.id)}
                                                    className={`px-4 py-2.5 rounded-lg border text-xs font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-gray-400'}`}
                                                    title="Ver Homenagens"
                                                >
                                                    <PenTool size={14}/>
                                                </button>
                                            </div>

                                            {/* EXPANSÃO DE TRIBUTOS */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-gray-800 animate-in slide-in-from-top-4 fade-in font-sans">
                                                    
                                                    {/* Lista de Comentários */}
                                                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                                        {charTributes.length === 0 ? (
                                                            <div className="text-center text-xs text-gray-600 italic py-4">O silêncio ecoa. Seja o primeiro a prestar homenagens.</div>
                                                        ) : (
                                                            charTributes.map(trib => (
                                                                <div key={trib.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 group/trib relative">
                                                                    <p className="text-gray-300 text-sm italic">"{trib.text}"</p>
                                                                    <div className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mt-2 text-right">
                                                                        — {trib.userName}
                                                                    </div>
                                                                    {(trib.actorId === actorId || trib.userId === currentUser?.uid) && (
                                                                        <button onClick={() => handleDeleteTribute(trib.id)} className="absolute -top-2 -right-2 bg-red-950 text-red-500 border border-red-900 rounded-full p-1 md:opacity-0 md:group-hover/trib:opacity-100 hover:bg-red-900 transition-all shadow-lg">
                                                                            <Skull size={12}/>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* Form de Novo Tributo (Só se ainda não deixou) */}
                                                    {!hasLeftTribute ? (
                                                        <div className="flex flex-col gap-2">
                                                            <textarea 
                                                                value={tributeText}
                                                                onChange={e => setTributeText(e.target.value)}
                                                                placeholder="Escreva algumas palavras de despedida..."
                                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-gray-500 resize-none h-20"
                                                                maxLength={200}
                                                            />
                                                            <button 
                                                                onClick={() => handleSubmitTribute(char.id)}
                                                                disabled={!tributeText.trim() || isSubmitting}
                                                                className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : 'Gravar em Pedra'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold flex items-center justify-center gap-1 bg-gray-900/30 py-2 rounded-lg border border-gray-800">
                                                            <Info size={12}/> {actorName} já prestou homenagens.
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}