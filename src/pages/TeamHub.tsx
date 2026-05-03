import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase'; 
import { 
    MessageSquare, BarChart2, Gamepad2, Skull, Edit3, Palette, Check, X, Plus, ThumbsUp, ThumbsDown, Trash2, Users, Ghost, Home as HomeIcon, Link as LinkIcon, Upload, Image as ImageIcon
} from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export default function TeamHub() {
    const { mesaId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados Globais
    const [characters, setCharacters] = useState<any[]>([]);
    const [myChars, setMyChars] = useState<any[]>([]);
    const [activeCharId, setActiveCharId] = useState<string>('');
    const [mesaMembers, setMesaMembers] = useState<string[]>([]);
    const [mesa, setMesa] = useState<any>(null);
    const [rankings, setRankings] = useState<any[]>([]);
    
    // Estados da Edição Orgânica
    const [isEditing, setIsEditing] = useState(false);
    const [headerDraft, setHeaderDraft] = useState<any>({});
    const [isSavingHeader, setIsSavingHeader] = useState(false);

    // Modal de Criação de Top
    const [showTopModal, setShowTopModal] = useState(false);
    const [topDraft, setTopDraft] = useState<{title: string, items: string[]}>({ title: '', items: [''] });

    useEffect(() => {
        if (!mesaId) return;

        getDoc(doc(db, 'mesas', mesaId)).then(snap => {
            if(snap.exists()) {
                const data = snap.data();
                setMesa(data);
                setMesaMembers(data.members || []);
            }
        });

        const qChars = query(collection(db, 'characters'), where('mesaId', '==', mesaId));
        const unsubChars = onSnapshot(qChars, (snap) => {
            const allChars: any[] = [];
            const mine: any[] = [];
            snap.forEach(d => {
                const data = { ...d.data(), id: d.id } as any; 
                if (data.isDead || data.isPrivate || data.socialEnabled === false) return;
                allChars.push(data);
                if (data.userId === currentUser?.uid) mine.push(data);
            });
            setCharacters(allChars);
            setMyChars(mine);
        });

        const qRanks = query(collection(db, `mesas/${mesaId}/rankings`));
        const unsubRanks = onSnapshot(qRanks, (snap) => {
            const ranks: any[] = [];
            snap.forEach(d => ranks.push({ ...d.data(), id: d.id }));
            ranks.sort((a,b) => b.createdAt - a.createdAt);
            setRankings(ranks);
        });

        return () => { unsubChars(); unsubRanks(); };
    }, [mesaId, currentUser]);

    // Define o personagem ativo inicial
    useEffect(() => {
        if (myChars.length > 0 && !activeCharId) {
            setActiveCharId(myChars[0].id);
        }
    }, [myChars, activeCharId]);

    const activeChar = myChars.find(c => c.id === activeCharId);

    // Sincroniza o rascunho de forma segura
    useEffect(() => {
        if (activeChar && !isEditing) {
            const currentHeader = activeChar.teamHeader || {};
            setHeaderDraft({
                titleSuffix: currentHeader.titleSuffix || '',
                bgUrl: currentHeader.bgUrl || '',
                color: currentHeader.color || '#a855f7',
                quirkText1: currentHeader.quirkText1 || ''
            });
        }
    }, [activeChar, isEditing]);

    // --- LÓGICA DE HEADER E UPLOAD BASE64 ---
    const toggleEditMode = () => setIsEditing(!isEditing);

    const saveHeader = async () => {
        if (!activeCharId) return;
        setIsSavingHeader(true);
        try {
            await updateDoc(doc(db, 'characters', activeCharId), { teamHeader: headerDraft });
        } catch(error) {
            console.error("Erro ao salvar", error);
        }
        setIsSavingHeader(false);
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 800; 
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Converte em Base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setHeaderDraft((prev: any) => ({ ...prev, bgUrl: dataUrl }));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // --- LÓGICA DE TOPS/RANKING ---
    const handleCreateTop = async () => {
        if (!topDraft.title.trim() || topDraft.items.some(i => !i)) return alert("Preencha o título e selecione todos os personagens!");
        
        const uniqueItems = new Set(topDraft.items);
        if (uniqueItems.size !== topDraft.items.length) {
            return alert("Você não pode colocar o mesmo personagem em posições repetidas!");
        }

        if (!activeCharId) return;

        const rankId = generateId();
        const newRank = {
            id: rankId,
            title: topDraft.title,
            creatorId: currentUser?.uid,
            creatorCharName: activeChar?.personal?.name || 'Desconhecido',
            items: topDraft.items, 
            votes: { [currentUser!.uid]: 'yes' }, 
            status: 'voting',
            createdAt: Date.now()
        };

        await setDoc(doc(db, `mesas/${mesaId}/rankings`, rankId), newRank);
        setShowTopModal(false);
        setTopDraft({ title: '', items: [''] });
    };

    const handleVoteTop = async (rank: any, vote: 'yes' | 'no') => {
        if (!currentUser) return;
        const newVotes = { ...rank.votes, [currentUser.uid]: vote };
        const totalVotes = Object.keys(newVotes).length;
        
        let newStatus = rank.status;
        let shouldDelete = false;

        if (totalVotes >= mesaMembers.length) {
            const yesCount = Object.values(newVotes).filter(v => v === 'yes').length;
            const noCount = Object.values(newVotes).filter(v => v === 'no').length;
            if (noCount >= yesCount) shouldDelete = true;
            else newStatus = 'locked';
        }

        if (shouldDelete) {
            await deleteDoc(doc(db, `mesas/${mesaId}/rankings`, rank.id));
        } else {
            await updateDoc(doc(db, `mesas/${mesaId}/rankings`, rank.id), { votes: newVotes, status: newStatus });
        }
    };

    const updateTopItem = (index: number, value: string) => {
        setTopDraft(prev => {
            const newItems = [...prev.items];
            newItems[index] = value;
            return { ...prev, items: newItems };
        });
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderQuirkContent = (char: any, isDraft = false) => {
        const header = isDraft ? headerDraft : (char.teamHeader || {});
        
        if (isDraft) {
            return (
                <div className="flex-1 flex items-center justify-center w-full">
                    <textarea 
                        maxLength={100}
                        value={header.quirkText1 || ''} 
                        onChange={e => setHeaderDraft({...header, quirkText1: e.target.value})} 
                        placeholder="Escreva a frase do seu personagem (máx 100 caracteres)..." 
                        className="w-full bg-black/40 border border-white/20 outline-none focus:border-white px-3 py-2 rounded transition-colors text-center text-sm font-bold text-white resize-none" 
                        rows={2}
                    />
                </div>
            );
        }

        return (
            <p className="text-sm font-bold text-white drop-shadow-md whitespace-pre-wrap text-center">
                {header.quirkText1 ? `"${header.quirkText1}"` : <span className="text-xs text-white/50 italic">Nenhuma frase definida.</span>}
            </p>
        );
    };

    const renderCardElement = (char: any, isDraft = false) => {
        const header = isDraft ? headerDraft : (char.teamHeader || {});
        const bgColor = header.color || '#a855f7'; 
        
        return (
            <div key={`render-card-${char.id}`} className={`relative w-full rounded-3xl overflow-hidden shadow-2xl group transition-all border border-white/10 flex flex-col ${isDraft ? 'min-h-[22rem] ring-4 ring-white/20 scale-[1.01]' : 'h-48 md:h-56 hover:scale-[1.01]'}`} style={{ backgroundColor: `${bgColor}20`, borderColor: bgColor }}>
                
                {/* BG IMAGE */}
                <div className="absolute inset-0 z-0">
                    {header.bgUrl && <img src={header.bgUrl} className="w-full h-full object-cover opacity-50 mix-blend-overlay transition-opacity duration-700" alt="bg"/>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                </div>
                
                {/* BOTÕES DE EDIÇÃO INLINE */}
                {isDraft && (
                    <div className="absolute top-4 right-4 flex gap-2 z-30">
                        <button onClick={() => {
                            const url = prompt("Cole o link (URL) da imagem de fundo:");
                            if (url !== null) setHeaderDraft({...headerDraft, bgUrl: url});
                        }} className="w-10 h-10 bg-black/60 hover:bg-black border border-white/20 rounded-full flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm transition-all" title="Mudar Imagem de Fundo (URL)">
                            <LinkIcon size={16} className="text-white"/>
                        </button>

                        <label className="w-10 h-10 bg-black/60 hover:bg-black border border-white/20 rounded-full flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm transition-all" title="Fazer Upload do PC">
                            <Upload size={16} className="text-white"/>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef}/>
                        </label>

                        <label className="w-10 h-10 bg-black/60 hover:bg-black border border-white/20 rounded-full flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm transition-all" title="Mudar Cor">
                            <Palette size={16} className="text-white"/>
                            <input type="color" value={header.color || '#a855f7'} onChange={e => setHeaderDraft({...headerDraft, color: e.target.value})} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                        </label>
                    </div>
                )}

                {/* CONTEÚDO DO CARD */}
                <div className="relative z-20 flex-1 flex flex-col justify-end p-5 md:p-6">
                    <div className="flex gap-4 md:gap-6 items-end">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-black border-2 shadow-lg shrink-0" style={{ borderColor: bgColor }}>
                            {char.personal?.portraitUrl ? <img src={char.personal.portraitUrl} className="w-full h-full object-cover"/> : <Ghost className="w-10 h-10 m-auto mt-4 text-white/20"/>}
                        </div>
                        <div className="flex-1 min-w-0 pb-1 md:pb-2">
                            
                            {/* TÍTULO INLINE, UNIFICADO E COM COR DA PALETA */}
                            {isDraft ? (
                                <div className="flex items-center flex-wrap mb-2 font-black text-xl md:text-3xl drop-shadow-lg" style={{ color: bgColor }}>
                                    <span className="mr-1">{char.personal?.name}</span>
                                    <input 
                                        type="text" 
                                        value={header.titleSuffix || ''} 
                                        onChange={e => setHeaderDraft({...headerDraft, titleSuffix: e.target.value})} 
                                        placeholder=", o título..." 
                                        className="bg-black/30 border-b-2 border-white/20 outline-none font-black text-xl md:text-3xl px-2 py-1 w-full max-w-[250px] transition-colors focus:border-white rounded"
                                        style={{ color: bgColor }}
                                    />
                                </div>
                            ) : (
                                <div className="font-black text-xl md:text-3xl leading-none tracking-tight truncate drop-shadow-lg mb-2" style={{ color: bgColor }}>
                                    <span>{char.personal?.name}</span>
                                    <span className="opacity-90">{header.titleSuffix ? `, ${header.titleSuffix}` : ''}</span>
                                </div>
                            )}
                            
                            <div className="p-3 md:p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-inner flex items-center justify-center min-h-[3rem]">
                                {renderQuirkContent(char, isDraft)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Botões Salvar/Cancelar embaixo do card no modo de edição */}
                    {isDraft && (
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                            <button onClick={toggleEditMode} className="px-4 py-2 bg-black/40 text-white font-bold text-xs rounded-lg hover:bg-black/60 transition-colors">Cancelar</button>
                            <button onClick={saveHeader} disabled={isSavingHeader} className="px-6 py-2 bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-energia transition-colors shadow-lg">
                                {isSavingHeader ? <><Ghost size={14} className="animate-spin"/> Salvando...</> : <><Check size={14}/> Salvar</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-eden-900 font-sans p-4 md:p-8 space-y-6 flex flex-col">
            
            {/* TOPO DA TELA */}
            <div className="max-w-7xl mx-auto w-full bg-eden-800 p-4 md:p-6 rounded-2xl border border-eden-700 shadow-xl flex flex-col md:flex-row gap-6 justify-between items-center z-10 relative">
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <Link to={`/mesa/${mesaId}`} className="p-2 bg-eden-950 text-eden-100/50 hover:text-energia hover:bg-black/40 rounded-xl border border-eden-700 transition-colors shadow-sm" title="Voltar à Mesa">
                            <HomeIcon size={20}/>
                        </Link>
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Users className="text-energia" size={28}/> Cantinho da Equipe
                        </h1>
                    </div>

                    {myChars.length > 0 ? (
                        <div className="flex items-center gap-3 bg-eden-950 p-2 rounded-xl border border-eden-700 w-fit">
                            <span className="text-[10px] uppercase font-bold text-eden-100/50 pl-2">Atuando como:</span>
                            <select 
                                value={activeCharId || ''} 
                                onChange={(e) => {
                                    setActiveCharId(e.target.value);
                                    setIsEditing(false); 
                                }}
                                className="bg-transparent text-energia font-black text-sm uppercase outline-none cursor-pointer pr-2"
                            >
                                <option value="" disabled>Selecione...</option>
                                {myChars.map(c => <option key={`hub-char-${c.id}`} value={c.id} className="bg-eden-900 text-white">{c.personal?.name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <span className="text-xs text-red-400 font-bold bg-red-950/30 px-3 py-1 rounded-lg border border-red-900/50 w-fit">Você não tem agentes ativos no Hub.</span>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
                    <button onClick={() => navigate(`/mesa/${mesaId}/grupo/chat`)} className="flex-1 md:flex-none p-3 md:px-5 bg-eden-900 hover:bg-energia text-white hover:text-eden-900 rounded-xl border border-eden-600 transition-all shadow-md font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2"><MessageSquare size={16}/> Chat</button>
                    <button onClick={() => navigate(`/mesa/${mesaId}/grupo/jogos`)} className="flex-1 md:flex-none p-3 md:px-5 bg-eden-900 hover:bg-energia text-white hover:text-eden-900 rounded-xl border border-eden-600 transition-all shadow-md font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Gamepad2 size={16}/> Jogos</button>
                    <button onClick={() => navigate(`/mesa/${mesaId}/grupo/dashboard`)} className="flex-1 md:flex-none p-3 md:px-5 bg-eden-900 hover:bg-energia text-white hover:text-eden-900 rounded-xl border border-eden-600 transition-all shadow-md font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2"><BarChart2 size={16}/> Dashboard</button>
                    <button onClick={() => navigate(`/mesa/${mesaId}/grupo/cemiterio`)} className="flex-1 md:flex-none p-3 md:px-5 bg-red-950 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-900/50 transition-all shadow-md font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Skull size={16}/> Cemitério</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* COLUNA ESQUERDA: MURAL DE AGENTES */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-end border-b border-eden-700/50 pb-2">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon className="text-energia" size={20}/> Mural de Agentes</h2>
                        {activeChar && (
                            <button onClick={toggleEditMode} className={`text-[10px] uppercase font-bold flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-energia/10 text-energia hover:text-yellow-300 hover:bg-energia/20'}`}>
                                {isEditing ? <><X size={14}/> Cancelar Edição</> : <><Edit3 size={14}/> Editar Meu Perfil</>}
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {characters.length === 0 && <p className="text-eden-100/40 text-sm text-center py-10">Nenhum agente no radar.</p>}
                        
                        {/* 1. SEU PERSONAGEM (SEMPRE NO TOPO) */}
                        {activeChar && renderCardElement(activeChar, isEditing)}

                        {/* 2. OS OUTROS AGENTES */}
                        {characters.filter(c => c.id !== activeCharId).map(char => renderCardElement(char, false))}
                    </div>
                </div>

                {/* COLUNA DIREITA: TOPS / RANKINGS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex justify-between items-end border-b border-eden-700/50 pb-2">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2"><BarChart2 className="text-yellow-400" size={20}/> Tops da Mesa</h2>
                        <button onClick={() => setShowTopModal(true)} className="w-8 h-8 flex items-center justify-center bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-eden-900 rounded-lg transition-colors"><Plus size={16}/></button>
                    </div>

                    <div className="space-y-4">
                        {rankings.length === 0 && <p className="text-eden-100/40 text-sm text-center py-10">Nenhum Top criado ainda.</p>}
                        
                        {rankings.map(rank => {
                            const isLocked = rank.status === 'locked';
                            const myVote = rank.votes[currentUser?.uid || ''];
                            const yesCount = Object.values(rank.votes).filter(v => v === 'yes').length;
                            const noCount = Object.values(rank.votes).filter(v => v === 'no').length;

                            return (
                                <div key={rank.id} className="bg-eden-800 border border-eden-700 rounded-2xl overflow-hidden shadow-lg">
                                    <div className="bg-eden-950 p-4 border-b border-eden-700 flex justify-between items-center">
                                        <h3 className="font-black text-white uppercase tracking-widest text-sm truncate pr-2">{rank.title}</h3>
                                        {isLocked ? (
                                            <span className="text-[9px] bg-green-900/50 text-green-400 border border-green-500/30 px-2 py-1 rounded font-bold uppercase tracking-widest shrink-0">Aprovado</span>
                                        ) : (
                                            <span className="text-[9px] bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded font-bold uppercase tracking-widest shrink-0 animate-pulse">Votação ({yesCount + noCount}/{mesaMembers.length})</span>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-2 bg-eden-900/30">
                                        {rank.items.map((charId: string, idx: number) => {
                                            const char = characters.find(c => c.id === charId);
                                            return (
                                                <div key={`${rank.id}-item-${idx}`} className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                                                    <div className="w-6 h-6 flex items-center justify-center font-black text-xs bg-yellow-500 text-eden-900 rounded-full shrink-0">{idx + 1}</div>
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
                                                        {char?.personal?.portraitUrl ? <img src={char.personal.portraitUrl} className="w-full h-full object-cover"/> : <Ghost className="w-4 h-4 m-auto mt-2 text-white/20"/>}
                                                    </div>
                                                    <span className="text-sm font-bold text-white truncate">{char?.personal?.name || 'Desconhecido'}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {!isLocked && currentUser && (
                                        <div className="p-3 bg-eden-950 flex gap-2 border-t border-eden-700">
                                            <button onClick={() => handleVoteTop(rank, 'yes')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${myVote === 'yes' ? 'bg-green-600 text-white' : 'bg-eden-800 text-green-500 hover:bg-green-900/50 border border-green-900/50'}`}>
                                                <ThumbsUp size={14}/> Aprovo
                                            </button>
                                            <button onClick={() => handleVoteTop(rank, 'no')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${myVote === 'no' ? 'bg-red-600 text-white' : 'bg-eden-800 text-red-500 hover:bg-red-900/50 border border-red-900/50'}`}>
                                                <ThumbsDown size={14}/> Nego
                                            </button>
                                        </div>
                                    )}
                                    {(currentUser?.uid === rank.creatorId || currentUser?.uid === mesa?.mestreId) && (
                                        <button onClick={async () => { if(confirm("Excluir esse Top permanentemente?")) await deleteDoc(doc(db, `mesas/${mesaId}/rankings`, rank.id)); }} className="w-full py-2 text-[10px] uppercase font-bold text-red-500 hover:bg-red-950/50 border-t border-eden-700 transition-colors">Excluir Top</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* MODAL DE CRIAÇÃO DE TOP */}
            {showTopModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-eden-900 w-full max-w-lg rounded-3xl border border-yellow-500/50 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-yellow-500/30 flex justify-between items-center bg-eden-800">
                            <h3 className="text-lg font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2"><BarChart2 size={18}/> Criar Novo Top Ranking</h3>
                            <button onClick={() => setShowTopModal(false)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"><X className="text-white/50 hover:text-white"/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-yellow-100/50">Título do Ranking</label>
                                <input type="text" value={topDraft.title} onChange={e => setTopDraft({...topDraft, title: e.target.value})} placeholder="Ex: Top 3 Mais feios da mesa" className="w-full bg-eden-950 border border-yellow-900/50 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-yellow-500" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-yellow-100/50 flex justify-between items-end">
                                    <span>Posições ({topDraft.items.length})</span>
                                    {topDraft.items.length < characters.length && (
                                        <button onClick={() => setTopDraft(prev => ({...prev, items: [...prev.items, '']}))} className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1"><Plus size={12}/> Adicionar Posição</button>
                                    )}
                                </label>
                                
                                {topDraft.items.map((item, idx) => (
                                    <div key={`draft-item-${idx}`} className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center font-black text-xs bg-yellow-500 text-eden-900 rounded-xl shrink-0">{idx + 1}</div>
                                        <select value={item || ''} onChange={e => updateTopItem(idx, e.target.value)} className="flex-1 bg-eden-950 border border-eden-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-yellow-500">
                                            <option value="" disabled>Selecione um personagem...</option>
                                            {characters.map(c => (
                                                <option key={`char-opt-${c.id}-${idx}`} value={c.id}>{c.personal?.name}</option>
                                            ))}
                                        </select>
                                        {topDraft.items.length > 1 && (
                                            <button onClick={() => setTopDraft(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="p-2 text-red-500/50 hover:bg-red-500/10 hover:text-red-400 rounded-lg"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 border-t border-eden-700 bg-eden-800 flex justify-end">
                            <button onClick={handleCreateTop} className="px-8 py-3 bg-yellow-500 text-eden-950 font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors shadow-lg flex items-center gap-2"><Check size={18}/> Iniciar Votação</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}