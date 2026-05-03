import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, orderBy, updateDoc, arrayUnion, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebase'; 
import { Home as HomeIcon, Send, MessageSquare, ArrowLeft, Loader2, Search, CheckCheck, X, Edit2, Camera, Mic, Square, ImageIcon, MoreVertical, Trash2, Reply, Info as InfoIcon, Sun, Moon } from 'lucide-react';

export default function TeamChat() {
    const { mesaId } = useParams();
    const currentUser = auth.currentUser;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados de Dados
    const [loading, setLoading] = useState(true);
    const [mesa, setMesa] = useState<any>(null);
    const [allCharacters, setAllCharacters] = useState<any[]>([]); 
    const [actingCharId, setActingCharId] = useState<string>('');
    const [activeChatId, setActiveChatId] = useState<string | 'global' | null>('global');
    const [messages, setMessages] = useState<any[]>([]);
    const [mySettings, setMySettings] = useState<any>({ theme: 'dark', chatBgOpacity: 0.1 });
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de UI
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showContactList, setShowContactList] = useState(false); 
    const [showInfoPanel, setShowInfoPanel] = useState<'chat' | 'me' | null>(null); 
    const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
    const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
    const [editingText, setEditingEText] = useState('');
    const [msgActionModal, setMsgActionModal] = useState<any | null>(null);
    const [msgInfoModal, setMsgInfoModal] = useState<any | null>(null);
    const [replyingTo, setReplyingTo] = useState<any | null>(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const groupPlaceholder = "https://img.icons8.com/ios-filled/100/7c3aed/conference-call.png";
    const userPlaceholder = "https://img.icons8.com/ios-filled/100/7c3aed/user.png";

    // --- 1. DEFINIÇÕES GLOBAIS ---
    const isLight = mySettings.theme === 'light';
    const myActiveChars = useMemo(() => allCharacters.filter(c => c.userId === currentUser?.uid), [allCharacters, currentUser]);
    const activeChar = useMemo(() => allCharacters.find(c => c.id === actingCharId), [allCharacters, actingCharId]);
    const actorName = activeChar?.personal?.name || 'Agente';

    // --- 2. CARREGAMENTO ---
    useEffect(() => {
        if (!mesaId) return;
        const unsubMesa = onSnapshot(doc(db, 'mesas', mesaId), (snap) => { if (snap.exists()) setMesa(snap.data()); });
        const qChars = query(collection(db, 'characters'), where('mesaId', '==', mesaId));
        const unsubChars = onSnapshot(qChars, (snap) => {
            const chars: any[] = [];
            snap.forEach(d => {
                const data = { ...d.data(), id: d.id } as any;
                if (!data.isDead && !data.isPrivate && data.socialEnabled !== false) chars.push(data);
            });
            setAllCharacters(chars);
            const mine = chars.filter(c => c.userId === currentUser?.uid);
            if (mine.length > 0 && !actingCharId) setActingCharId(mine[0].id);
            setLoading(false);
        });
        return () => { unsubMesa(); unsubChars(); };
    }, [mesaId, currentUser, actingCharId]);

    useEffect(() => {
        if (!mesaId || !actingCharId) return;
        return onSnapshot(doc(db, `mesas/${mesaId}/chat_settings`, actingCharId), (snap) => { 
            if (snap.exists()) setMySettings((prev: any) => ({ ...prev, ...snap.data() })); 
        });
    }, [mesaId, actingCharId]);

    useEffect(() => {
        if (!mesaId) return;
        const qMsgs = query(collection(db, `mesas/${mesaId}/messages`), orderBy('timestamp', 'asc'));
        return onSnapshot(qMsgs, (snap) => {
            const msgs: any[] = [];
            const batch = writeBatch(db);
            let hasUpdates = false;

            snap.forEach(d => {
                const data = d.data();
                if (!data.deletedBy?.includes(actingCharId)) {
                    msgs.push({ id: d.id, ...data });
                    if (data.senderCharId !== actingCharId && (!data.viewedBy || !data.viewedBy[actingCharId])) {
                        if ((activeChatId === 'global' && data.targetCharacterId === 'global') || 
                            (activeChatId === data.senderCharId && data.targetCharacterId === actingCharId)) {
                            batch.update(doc(db, `mesas/${mesaId}/messages`, d.id), { [`viewedBy.${actingCharId}`]: Date.now() });
                            hasUpdates = true;
                        }
                    }
                }
            });
            if (hasUpdates) batch.commit();
            setMessages(msgs);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
    }, [mesaId, actingCharId, activeChatId]);

    // --- 3. LÓGICA DE ENVIO ---
    const handleSendMessage = async (text?: string, imageUrl?: string, audioUrl?: string) => {
        if ((!text?.trim() && !imageUrl && !audioUrl) || !actingCharId || isSending) return;
        setIsSending(true);
        try {
            await addDoc(collection(db, `mesas/${mesaId}/messages`), {
                senderCharId: actingCharId,
                senderCharName: actorName,
                senderPortrait: mySettings.chatPortraitUrl || activeChar?.personal?.portraitUrl || '',
                targetCharacterId: activeChatId,
                text: text || '',
                imageUrl: imageUrl || null,
                audioUrl: audioUrl || null,
                timestamp: serverTimestamp(),
                deletedBy: [],
                viewedBy: {},
                replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.senderCharName } : null
            });
            setInputText('');
            setReplyingTo(null);
        } catch (e) { alert("Erro ao enviar."); } finally { setIsSending(false); }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'msg' | 'profile' | 'group' | 'bg') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg', 0.6);
                if (target === 'msg') handleSendMessage(undefined, base64);
                else if (target === 'profile') updateMyChatProfile('portrait', base64);
                else if (target === 'group') updateGroupInfo('portrait', base64);
                else if (target === 'bg') updateMyChatProfile('bg', base64);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                const reader = new FileReader();
                reader.onloadend = () => handleSendMessage(undefined, undefined, reader.result as string);
                reader.readAsDataURL(blob);
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (e) { alert("Sem acesso ao áudio."); }
    };

    const stopRecording = () => { mediaRecorder?.stop(); setIsRecording(false); };

    // --- 4. FUNÇÕES DE MODERAÇÃO E PERFIL ---
    const deleteForAll = async (id: string) => {
        await updateDoc(doc(db, `mesas/${mesaId}/messages`, id), { text: "🚫 Esta mensagem foi apagada.", imageUrl: null, audioUrl: null, isDeletedForAll: true });
        setMsgActionModal(null);
    };
    const deleteForMe = async (id: string) => {
        await updateDoc(doc(db, `mesas/${mesaId}/messages`, id), { deletedBy: arrayUnion(actingCharId) });
        setMsgActionModal(null);
    };
    const editMessage = async () => {
        if (!editingMsgId || !editingText.trim()) return;
        await updateDoc(doc(db, `mesas/${mesaId}/messages`, editingMsgId), { text: editingText.trim(), isEdited: true });
        setEditingMsgId(null);
    };

    const updateGroupInfo = async (field: 'name' | 'description' | 'portrait', value: string) => {
        const fieldKey = field === 'portrait' ? 'chatPortraitUrl' : field === 'name' ? 'chatName' : 'chatDescription';
        await updateDoc(doc(db, 'mesas', mesaId!), { [fieldKey]: value });
        await addDoc(collection(db, `mesas/${mesaId}/messages`), { type: 'system', text: `${actorName} alterou os dados do grupo.`, targetCharacterId: 'global', timestamp: serverTimestamp() });
    };

    const updateMyChatProfile = async (field: 'portrait' | 'bio' | 'bg' | 'opacity' | 'theme', value: any) => {
        const fieldMap: any = { portrait: 'chatPortraitUrl', bio: 'chatBio', bg: 'chatBgUrl', opacity: 'chatBgOpacity', theme: 'theme' };
        await setDoc(doc(db, `mesas/${mesaId}/chat_settings`, actingCharId), { [fieldMap[field]]: value }, { merge: true });
    };

    // --- AUXILIARES ---
    const formatTime = (ts: any) => ts ? new Date(ts.toDate?.() || ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    const getLastMsg = (chatId: string | 'global') => {
        const chatMsgs = messages.filter(m => {
            if (chatId === 'global') return m.targetCharacterId === 'global';
            return (m.senderCharId === actingCharId && m.targetCharacterId === chatId) || (m.senderCharId === chatId && m.targetCharacterId === actingCharId);
        });
        if (chatMsgs.length === 0) return null;
        const last = chatMsgs[chatMsgs.length - 1];
        let text = last.text;
        if (last.imageUrl) text = "📷 Foto";
        if (last.audioUrl) text = "🎤 Mensagem de voz";
        return { text, timestamp: last.timestamp };
    };

    const currentConversation = messages.filter(m => {
        if (activeChatId === 'global') return m.targetCharacterId === 'global';
        return (m.senderCharId === actingCharId && m.targetCharacterId === activeChatId) || (m.senderCharId === activeChatId && m.targetCharacterId === actingCharId);
    });
    
    const activeContact = allCharacters.find(c => c.id === activeChatId);

    if (loading) return <div className={`h-screen flex items-center justify-center ${isLight ? 'bg-[#f0f2f5]' : 'bg-[#050510]'} text-purple-600`}><Loader2 className="animate-spin" size={40}/></div>;

    return (
        <div className={`h-[100dvh] font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${isLight ? 'bg-[#f0f2f5] text-[#111b21]' : 'bg-[#050510] text-[#e9edef]'}`} onClick={() => setMsgActionModal(null)}>
            
            {/* SIDEBAR */}
            <div className={`w-full md:w-[420px] flex flex-col border-r ${isLight ? 'bg-white border-[#d1d7db]' : 'bg-[#0d0d1a] border-purple-900/30'} ${activeChatId !== null && 'hidden md:flex'}`}>
                <div className={`p-3 flex justify-between items-center h-16 shrink-0 border-b ${isLight ? 'bg-[#f0f2f5] border-[#d1d7db]' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                    <div className="flex items-center gap-3 cursor-pointer sticky" onClick={(e) => { e.stopPropagation(); setShowInfoPanel('me'); }}>
                        <img src={mySettings.chatPortraitUrl || activeChar?.personal?.portraitUrl || userPlaceholder} className={`w-10 h-10 rounded-full object-cover border ${isLight ? 'border-gray-200' : 'border-purple-500/30'}`} alt="Me" />
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold truncate max-w-[120px] ${isLight ? 'text-[#111b21]' : 'text-purple-100'}`}>{actorName}</span>
                            <span className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-purple-500">
                        {myActiveChars.length > 1 && (
                            <select value={actingCharId} onClick={e => e.stopPropagation()} onChange={e => setActingCharId(e.target.value)} className={`bg-transparent text-[10px] border rounded px-1 outline-none font-bold ${isLight ? 'border-gray-300 text-gray-600' : 'border-purple-500/20 text-purple-400'}`}>
                                {myActiveChars.map(c => <option key={c.id} value={c.id} className={isLight ? 'bg-white' : 'bg-[#0d0d1a]'}>{c.personal?.name}</option>)}
                            </select>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setShowContactList(true); }} className="hover:scale-110 transition-transform"><MessageSquare size={22}/></button>
                        <Link to={`/mesa/${mesaId}/grupo`} className="hover:scale-110 transition-transform"><HomeIcon size={22}/></Link>
                    </div>
                </div>

                <div className={`p-3 ${isLight ? 'bg-white' : 'bg-[#0d0d1a]'}`}>
                    <div className={`rounded-xl flex items-center px-4 py-2 border ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-inner' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                        <Search size={18} className="text-purple-500/50 mr-3"/>
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Procurar conversas..." className="bg-transparent text-sm outline-none w-full placeholder:text-purple-500/30"/>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {(!searchTerm || (mesa?.chatName || "Grupo da Mesa").toLowerCase().includes(searchTerm.toLowerCase())) && (
                        <div onClick={(e) => { e.stopPropagation(); setActiveChatId('global'); }} className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4 ${activeChatId === 'global' ? (isLight ? 'bg-[#f0f2f5] border-purple-600' : 'bg-[#1a1a2e] border-purple-500') : 'border-transparent hover:bg-black/5'}`}>
                            <img src={mesa?.chatPortraitUrl || groupPlaceholder} className="w-12 h-12 rounded-full object-cover shadow-lg border border-purple-500/10" alt="G" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`font-bold truncate ${isLight ? 'text-[#111b21]' : 'text-purple-50'}`}>{mesa?.chatName || "Grupo da Mesa"}</h4>
                                    <span className="text-[10px] opacity-50">{formatTime(getLastMsg('global')?.timestamp)}</span>
                                </div>
                                <p className="text-xs opacity-60 truncate line-clamp-1">{getLastMsg('global')?.text || "Sem mensagens."}</p>
                            </div>
                        </div>
                    )}

                    {allCharacters.filter(c => c.id !== actingCharId && c.personal?.name.toLowerCase().includes(searchTerm.toLowerCase())).map(contact => {
                        const lastMsg = getLastMsg(contact.id);
                        if (!lastMsg && !searchTerm) return null;
                        return (
                            <div key={contact.id} onClick={(e) => { e.stopPropagation(); setActiveChatId(contact.id); }} className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-l-4 ${activeChatId === contact.id ? (isLight ? 'bg-[#f0f2f5] border-purple-600' : 'bg-[#1a1a2e] border-purple-500') : 'border-transparent border-b-black/5 hover:bg-black/5'}`}>
                                <img src={contact.personal?.portraitUrl || userPlaceholder} className="w-12 h-12 rounded-full object-cover shadow-md" alt="C"/>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`font-bold truncate ${isLight ? 'text-[#111b21]' : 'text-purple-100'}`}>{mySettings.nicknames?.[contact.id] || contact.personal?.name}</h4>
                                        <span className="text-[10px] opacity-50 font-bold">{formatTime(lastMsg?.timestamp)}</span>
                                    </div>
                                    <p className="text-xs opacity-60 truncate line-clamp-1">{lastMsg?.text || "Nova conversa..."}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* JANELA DE CHAT */}
            <div className={`flex-1 flex flex-col min-h-0 min-w-0 relative ${activeChatId === null && 'hidden md:flex'} ${isLight ? 'bg-[#efeae2]' : 'bg-[#050510]'}`}>
                {activeChatId ? (
                    <>
                        <div className={`p-3 flex items-center justify-between h-16 shrink-0 z-20 shadow-md border-b ${isLight ? 'bg-[#f0f2f5] border-[#d1d7db]' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                            <div className="flex items-center gap-4 cursor-pointer min-w-0" onClick={(e) => { e.stopPropagation(); setShowInfoPanel('chat'); }}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveChatId(null); }} className="md:hidden text-purple-600 mr-1"><ArrowLeft size={24}/></button>
                                <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${isLight ? 'bg-white shadow-sm' : 'bg-[#0d0d1a] border border-purple-500/30'}`}>
                                    {activeChatId === 'global' ? <img src={mesa?.chatPortraitUrl || groupPlaceholder} className="w-full h-full object-cover" alt="G"/> : <img src={activeContact?.personal?.portraitUrl || userPlaceholder} className="w-full h-full object-cover" alt="C"/>}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`font-black truncate text-base ${isLight ? 'text-[#111b21]' : 'text-purple-50'}`}>{activeChatId === 'global' ? (mesa?.chatName || "Grupo da Mesa") : (mySettings.nicknames?.[activeChatId] || activeContact?.personal?.name)}</span>
                                    <span className="text-[10px] text-purple-500 uppercase font-black tracking-tighter">Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4 md:px-12 flex flex-col gap-2 relative z-10">
                            <div className="absolute inset-0 z-0 pointer-events-none transition-opacity" style={{ 
                                backgroundImage: `url(${mySettings.chatBgUrl || "https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png"})`, 
                                backgroundSize: mySettings.chatBgUrl ? 'cover' : '400px',
                                opacity: mySettings.chatBgOpacity ?? 0.1 
                            }}></div>
                            
                            {currentConversation.map((msg) => {
                                if (msg.type === 'system') return <div key={msg.id} className="flex justify-center my-4"><div className={`text-[10px] uppercase font-black px-5 py-2 rounded-2xl border text-center leading-relaxed break-words max-w-[90%] md:max-w-[70%] ${isLight ? 'bg-white text-gray-500 border-gray-200 shadow-sm' : 'bg-purple-950/40 text-purple-300 border-purple-500/20'}`}>{msg.text}</div></div>;
                                const isMe = msg.senderCharId === actingCharId;
                                const isViewedByEveryone = msg.targetCharacterId === 'global' 
                                    ? Object.keys(msg.viewedBy || {}).length >= allCharacters.length - 1
                                    : Object.keys(msg.viewedBy || {}).length > 0;

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative z-10`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-xl relative transition-transform ${isMe ? (isLight ? 'bg-[#e7dbff] text-[#111b21]' : 'bg-purple-800 text-white') : (isLight ? 'bg-white text-[#111b21]' : 'bg-[#1a1a2e] text-[#e9edef]')} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                            {activeChatId === 'global' && !isMe && <p className="text-[11px] font-black text-purple-500 mb-1 drop-shadow-sm">{msg.senderCharName}</p>}
                                            
                                            {msg.replyTo && (
                                                <div className={`border-l-4 border-purple-500 p-2 rounded mb-2 text-xs opacity-80 cursor-pointer ${isLight ? 'bg-black/5' : 'bg-black/20'}`} onClick={() => document.getElementById(`msg-${msg.replyTo.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                                    <p className="font-bold text-purple-500">{msg.replyTo.sender}</p>
                                                    <p className="truncate italic">{msg.replyTo.text}</p>
                                                </div>
                                            )}

                                            {msg.imageUrl && <img src={msg.imageUrl} className="rounded-xl mb-2 max-h-80 w-full object-cover cursor-zoom-in" onClick={() => setZoomPhoto(msg.imageUrl)} alt="Sent"/>}
                                            {msg.audioUrl && <div className={`${isLight ? 'bg-[#00000008]' : 'bg-black/20'} rounded-xl p-2 mb-2 flex items-center gap-2`}><audio controls src={msg.audioUrl} className={`w-full h-9 ${!isLight && 'filter hue-rotate-[240deg]'}`} /></div>}
                                            
                                            {editingMsgId === msg.id ? (
                                                <div className="flex flex-col gap-2 min-w-[240px]">
                                                    <textarea value={editingText} onChange={e => setEditingEText(e.target.value)} className="bg-black/5 text-base outline-none rounded-lg p-2 border border-purple-500/30" autoFocus/>
                                                    <div className="flex justify-end gap-3"><button onClick={() => setEditingMsgId(null)} className="text-red-500 font-bold">Cancelar</button><button onClick={editMessage} className="text-purple-600 font-bold">Salvar</button></div>
                                                </div>
                                            ) : (
                                                <p className="text-[15px] leading-relaxed pr-14 whitespace-pre-wrap break-words" id={`msg-${msg.id}`}>{msg.text}</p>
                                            )}

                                            <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1.5">
                                                <span className="text-[10px] opacity-50 font-bold">{formatTime(msg.timestamp)}</span>
                                                {isMe && <CheckCheck size={14} className={isViewedByEveryone ? "text-cyan-500" : "opacity-30"}/>}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setMsgActionModal({ id: msg.id, isMe, text: msg.text, msg }); }} className="absolute top-2 right-1.5 opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded-full transition-all"><MoreVertical size={16} className="opacity-30"/></button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className={`p-3 flex sticky items-center gap-3 shrink-0 z-20 pb-8 md:pb-3 border-t ${isLight ? 'bg-[#f0f2f5] border-[#d1d7db]' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-purple-500 hover:scale-110 transition-transform p-2"><ImageIcon size={26}/></button>
                            <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'msg')} accept="image/*" className="hidden"/>
                            <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Digite sua mensagem..." className={`flex-1 rounded-2xl px-5 py-3 text-sm outline-none border transition-all ${isLight ? 'bg-white border-transparent focus:border-purple-300 shadow-sm' : 'bg-[#0d0d1a] border-purple-900/30 focus:border-purple-500/50'}`}/>
                            {inputText.trim() ? <button type="submit" className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-500 transition-all"><Send size={22}/></button> : 
                            <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-purple-500/20 text-purple-600'}`}>{isRecording ? <Square size={22}/> : <Mic size={22}/>}</button>}
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 select-none">
                        <img src="https://img.icons8.com/?size=512&id=8SkEP8nszFSJ&format=png&color=7c3aed" className="w-48 mb-6 grayscale" alt="Logo"/>
                        <h2 className={`text-2xl font-black uppercase tracking-[0.5em] ${isLight ? 'text-purple-700' : 'text-purple-500'}`}>Conversas</h2>
                    </div>
                )}
            </div>

            {/* MODAL DE AÇÕES */}
            {msgActionModal && (
                <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-[2px]" onClick={() => setMsgActionModal(null)}>
                    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border shadow-2xl rounded-2xl py-2 min-w-[220px] animate-in zoom-in-95 duration-150 ${isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'}`} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setReplyingTo(msgActionModal.msg); setMsgActionModal(null); }} className="w-full px-5 py-3.5 text-left hover:bg-black/5 flex items-center gap-4 text-sm font-bold border-b border-black/5"><Reply size={18} className="text-purple-500"/> Responder</button>
                        {msgActionModal.isMe && <button onClick={() => { setEditingMsgId(msgActionModal.id); setEditingEText(msgActionModal.text); setMsgActionModal(null); }} className="w-full px-5 py-3.5 text-left hover:bg-black/5 flex items-center gap-4 text-sm font-bold border-b border-black/5"><Edit2 size={18} className="text-purple-500"/> Editar</button>}
                        {msgActionModal.isMe && <button onClick={() => { setMsgInfoModal(msgActionModal.msg); setMsgActionModal(null); }} className="w-full px-5 py-3.5 text-left hover:bg-black/5 flex items-center gap-4 text-sm font-bold border-b border-black/5"><InfoIcon size={18} className="text-purple-500"/> Dados da Mensagem</button>}
                        <button onClick={() => deleteForMe(msgActionModal.id)} className="w-full px-5 py-3.5 text-left hover:bg-black/5 flex items-center gap-4 text-sm font-bold border-b border-black/5"><Trash2 size={18} className="text-purple-500"/> Apagar para mim</button>
                        {msgActionModal.isMe && <button onClick={() => deleteForAll(msgActionModal.id)} className="w-full px-5 py-3.5 text-left hover:bg-black/5 flex items-center gap-4 text-sm font-black text-red-500"><Trash2 size={18}/> Apagar para todos</button>}
                    </div>
                </div>
            )}

            {/* MODAL DADOS MENSAGEM */}
            {msgInfoModal && (
                <div className="fixed inset-0 z-[400] bg-black/90 flex items-center justify-center p-4">
                    <div className={`w-full max-w-sm rounded-3xl border p-6 space-y-6 ${isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/40'}`}>
                        <div className="flex justify-between items-center border-b pb-4 border-black/5">
                            <h3 className="font-black text-purple-600 uppercase tracking-widest flex items-center gap-2"><InfoIcon size={20}/> Dados da Mensagem</h3>
                            <button onClick={() => setMsgInfoModal(null)} className="text-purple-600"><X/></button>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {Object.entries(msgInfoModal.viewedBy || {}).map(([charId, ts]: any) => {
                                const char = allCharacters.find(c => c.id === charId);
                                return (
                                    <div key={charId} className={`flex items-center justify-between p-3 rounded-xl ${isLight ? 'bg-gray-100' : 'bg-black/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <img src={char?.personal?.portraitUrl || userPlaceholder} className="w-8 h-8 rounded-full object-cover"/>
                                            <span className="font-bold text-sm">{char?.personal?.name || "Desconhecido"}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-purple-500 font-black uppercase">Lido</p>
                                            <p className="text-[9px] opacity-50">{new Date(ts).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* INFO PANEL */}
            {showInfoPanel && (
                <div className={`fixed inset-0 md:relative w-full md:w-[420px] z-[400] flex flex-col border-l animate-in slide-in-from-right duration-300 ${isLight ? 'bg-white border-[#d1d7db]' : 'bg-[#0d0d1a] border-purple-900/30'}`}>
                    <div className={`h-16 flex items-center px-6 gap-6 shrink-0 border-b ${isLight ? 'bg-[#f0f2f5] border-[#d1d7db]' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                        <button onClick={() => setShowInfoPanel(null)} className="text-purple-600"><X size={24}/></button> 
                        <span className="font-black uppercase tracking-widest text-purple-600">{showInfoPanel === 'me' ? "Meu Perfil" : "Dados"}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-8">
                        <div className="relative group">
                            <img src={showInfoPanel === 'me' ? (mySettings.chatPortraitUrl || activeChar?.personal?.portraitUrl || userPlaceholder) : (activeChatId === 'global' ? (mesa?.chatPortraitUrl || groupPlaceholder) : activeContact?.personal?.portraitUrl || userPlaceholder)} className={`w-56 h-56 rounded-full object-cover shadow-2xl cursor-zoom-in border-4 ${isLight ? 'border-white shadow-purple-500/10' : 'border-[#1a1a2e] shadow-purple-500/20'}`} onClick={(e:any) => setZoomPhoto(e.target.src)}/>
                            {(showInfoPanel === 'me' || (showInfoPanel === 'chat' && activeChatId === 'global')) && (
                                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-all backdrop-blur-sm"><Camera className="text-white" size={32}/></button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, showInfoPanel === 'me' ? 'profile' : 'group')} accept="image/*" className="hidden"/>
                        </div>
                        <div className="w-full space-y-6">
                            {/* BLOCO IDENTIFICAÇÃO: SÓ APARECE NO CHAT, NÃO NO PERFIL (Meu Perfil já tem o nome no topo) */}
                            {showInfoPanel === 'chat' && (
                                <div className={`p-5 rounded-3xl border text-left ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-sm' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                                    <label className="text-[10px] uppercase text-purple-600 font-black block mb-2 tracking-widest">{activeChatId === 'global' ? "Nome do Grupo" : "Nome"}</label>
                                    {activeChatId === 'global' ? (
                                        <input defaultValue={mesa?.chatName} onBlur={e => updateGroupInfo('name', e.target.value)} className="bg-transparent text-xl font-black w-full outline-none border-b border-purple-400"/>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xl font-black">{activeContact?.personal?.name}</p>
                                            <div className={`p-3 rounded-xl flex items-center gap-3 ${isLight ? 'bg-white shadow-inner' : 'bg-black/5'}`}>
                                                <Edit2 size={14} className="text-purple-500"/>
                                                <input placeholder="Definir apelido..." defaultValue={mySettings.nicknames?.[activeChatId!] || ''} onBlur={e => updateDoc(doc(db, `mesas/${mesaId}/chat_settings`, actingCharId), { [`nicknames.${activeChatId}`]: e.target.value })} className="bg-transparent text-xs w-full outline-none"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={`p-5 rounded-3xl border text-left ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-sm' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                                <label className="text-[10px] uppercase text-purple-600 font-black block mb-2 tracking-widest">{activeChatId === 'global' && showInfoPanel === 'chat' ? "Sobre o Grupo" : "Recado / Bio"}</label>
                                {showInfoPanel === 'me' ? (
                                    <textarea defaultValue={mySettings.chatBio || ''} onBlur={e => updateMyChatProfile('bio', e.target.value)} className="bg-transparent text-sm w-full outline-none resize-none h-24"/>
                                ) : (
                                    activeChatId === 'global' ? (
                                        <textarea defaultValue={mesa?.chatDescription} onBlur={e => updateGroupInfo('description', e.target.value)} className="bg-transparent text-sm w-full outline-none resize-none h-24 border-b border-purple-400"/>
                                    ) : (
                                        <p className="text-sm">{activeContact?.chatBio || "Sem bio disponível."}</p>
                                    )
                                )}
                            </div>

                            {/* Tema e Wallpaper no Meu Perfil */}
                            {showInfoPanel === 'me' && (
                                <>
                                    <div className={`p-5 rounded-3xl border text-left ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-sm' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                                        <label className="text-[10px] uppercase text-purple-600 font-black block mb-4 tracking-widest">Tema da Interface</label>
                                        <button onClick={() => updateMyChatProfile('theme', isLight ? 'dark' : 'light')} className="w-full py-2 bg-purple-600/10 text-purple-600 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 border border-purple-600/20">
                                            {isLight ? <><Moon size={14}/> Tema Escuro</> : <><Sun size={14}/> Tema Claro</>}
                                        </button>
                                    </div>
                                    <div className={`p-5 rounded-3xl border text-left space-y-4 ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-sm' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                                        <label className="text-[10px] uppercase text-purple-600 font-black block tracking-widest">Wallpaper do Chat</label>
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-purple-600/10 border border-purple-600/20 rounded-xl text-xs font-black uppercase text-purple-600 flex items-center justify-center gap-2"><ImageIcon size={16}/> Mudar Imagem</button>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-purple-600 uppercase"><span>Opacidade</span><span>{Math.round((mySettings.chatBgOpacity || 0.1) * 100)}%</span></div>
                                            <input type="range" min="0" max="1" step="0.05" value={mySettings.chatBgOpacity || 0.1} onChange={e => updateMyChatProfile('opacity', parseFloat(e.target.value))} className="w-full accent-purple-600 h-1.5 rounded-lg appearance-none cursor-pointer bg-purple-900/20"/>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Membros */}
                            {activeChatId === 'global' && showInfoPanel === 'chat' && (
                                <div className={`p-5 rounded-3xl border text-left ${isLight ? 'bg-[#f0f2f5] border-transparent shadow-sm' : 'bg-[#1a1a2e] border-purple-900/20'}`}>
                                    <label className="text-[10px] uppercase text-purple-600 font-black block mb-4 tracking-widest">Participantes ({allCharacters.length})</label>
                                    <div className="space-y-4">
                                        {allCharacters.map(c => (
                                            <div key={c.id} onClick={() => { if(c.id !== actingCharId) { setActiveChatId(c.id); setShowInfoPanel(null); } }} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <img src={c.personal?.portraitUrl || userPlaceholder} className="w-10 h-10 rounded-full object-cover border border-purple-900/10"/>
                                                    <span className="font-bold text-sm">{c.personal?.name} {c.id === actingCharId && "(Você)"}</span>
                                                </div>
                                                {c.id !== actingCharId && <MessageSquare size={16} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ZOOM DE FOTO */}
            {zoomPhoto && <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomPhoto(null)}><img src={zoomPhoto} className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(168,85,247,0.3)] animate-in zoom-in" alt="Zoom"/></div>}
            
            {/* MODAL NOVA CONVERSA */}
            {showContactList && (
                <div className="fixed inset-0 bg-black/90 z-[500] flex items-center justify-center p-4" onClick={() => setShowContactList(false)}>
                    <div className={`w-full max-w-md rounded-3xl overflow-hidden border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0d0d1a] border-purple-500/30'}`} onClick={e => e.stopPropagation()}>
                        <div className={`p-5 font-black uppercase tracking-widest flex items-center gap-4 ${isLight ? 'bg-[#f0f2f5] text-purple-600' : 'bg-[#1a1a2e] text-purple-100'}`}><button onClick={() => setShowContactList(false)}><ArrowLeft/></button> Conversas</div>
                        <div className="p-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {allCharacters.filter(c => c.id !== actingCharId && c.personal?.name.toLowerCase().includes(searchTerm.toLowerCase())).map(contact => (
                                <div key={contact.id} onClick={() => { setActiveChatId(contact.id); setShowContactList(false); }} className={`flex items-center gap-4 p-4 hover:bg-black/5 cursor-pointer rounded-2xl transition-all mb-1`}>
                                    <img src={contact.personal?.portraitUrl || userPlaceholder} className="w-12 h-12 rounded-full object-cover shadow-lg border border-purple-900/10"/>
                                    <div><p className="font-black">{contact.personal?.name}</p><p className="text-[10px] text-purple-500 font-bold uppercase opacity-60">{contact.personal?.class}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}