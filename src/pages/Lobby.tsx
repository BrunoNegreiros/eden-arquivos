import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, setDoc, deleteDoc, orderBy 
} from 'firebase/firestore';
import { 
  Plus, Hash, LogOut, ChevronRight, Users, 
  Shield, BookOpen, Loader2, X, Ghost,
  Newspaper, Calendar, Edit2, Trash2, Save, Palette, Image as ImageIcon, ChevronLeft, Copy
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 15);

const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};

export default function Lobby() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mesas, setMesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [mesaName, setMesaName] = useState('');
  const [accessKey, setAccessKey] = useState('');

  const [letters, setLetters] = useState<any[]>([]);
  const [letterMode, setLetterMode] = useState<'closed' | 'list' | 'read' | 'edit'>('closed');
  const [activeLetter, setActiveLetter] = useState<any | null>(null);
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  const isAdmin = auth.currentUser?.email === 'brunonegreiros1605@gmail.com';

  useEffect(() => {
    async function loadData() {
      if (!auth.currentUser) return;
      
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userSnap.exists()) {
          const profile = userSnap.data();
          setUserProfile(profile);

          if (profile.joinedMesas && profile.joinedMesas.length > 0) {
              const mesasData: any[] = [];
              const q = query(collection(db, 'mesas'), where('id', 'in', profile.joinedMesas));
              const mesasSnap = await getDocs(q);
              mesasSnap.forEach(d => mesasData.push(d.data()));
              
              mesasData.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
              setMesas(mesasData);
          }
      }

      const qLetters = query(collection(db, "edens_letters"), orderBy("createdAt", "desc"));
      const snapLetters = await getDocs(qLetters);
      const news: any[] = [];
      snapLetters.forEach(d => {
          const data = d.data();
          if (!data.mesaId || data.mesaId === 'global') {
              news.push({ ...data, id: d.id });
          }
      });
      setLetters(news);

      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreateMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaName || !accessKey) return;
    setLoading(true);

    const mesaId = generateId();
    const newMesa = {
      id: mesaId, name: mesaName, accessKey: accessKey, mestreId: auth.currentUser?.uid,
      mestreName: userProfile.username, members: [auth.currentUser?.uid], createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'mesas', mesaId), newMesa);
      await updateDoc(doc(db, 'users', auth.currentUser!.uid), { joinedMesas: arrayUnion(mesaId) });
      navigate(`/mesa/${mesaId}`);
    } catch (err) { alert("Erro ao criar mesa."); setLoading(false); }
  };

  const handleJoinMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const q = query(collection(db, 'mesas'), where('accessKey', '==', accessKey));
        const snap = await getDocs(q);
        
        if (snap.empty) { alert("Chave de acesso inválida."); setLoading(false); return; }

        const mesaData = snap.docs[0].data();
        if (userProfile.joinedMesas.includes(mesaData.id)) { navigate(`/mesa/${mesaData.id}`); return; }

        await updateDoc(doc(db, 'mesas', mesaData.id), { members: arrayUnion(auth.currentUser!.uid) });
        await updateDoc(doc(db, 'users', auth.currentUser!.uid), { joinedMesas: arrayUnion(mesaData.id) });
        
        navigate(`/mesa/${mesaData.id}`);
    } catch (err) { alert("Erro ao entrar na mesa."); setLoading(false); }
  };

  const handleDuplicateMesa = async (mesa: any, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm(`Deseja duplicar a mesa "${mesa.name}" e criar uma cópia exata de TODAS as suas fichas, jornais e resumos?`)) return;
      
      setLoading(true);
      try {
          const newMesaId = generateId();
          
          const newMesa = {
              ...mesa,
              id: newMesaId,
              name: `${mesa.name} (Cópia)`,
              accessKey: `${mesa.accessKey}-${Math.floor(Math.random() * 1000)}`,
              members: [auth.currentUser!.uid], 
              createdAt: Date.now()
          };

          await setDoc(doc(db, 'mesas', newMesaId), newMesa);
          await updateDoc(doc(db, 'users', auth.currentUser!.uid), { joinedMesas: arrayUnion(newMesaId) });
          
          const qChars = query(collection(db, 'characters'), where('mesaId', '==', mesa.id));
          const snapChars = await getDocs(qChars);
          
          const charsPromises = snapChars.docs.map(d => {
              const charData = d.data();
              return setDoc(doc(collection(db, 'characters')), {
                  ...charData,
                  mesaId: newMesaId,
                  createdAt: Date.now(), 
              });
          });
          await Promise.all(charsPromises);

          const qLetters = query(collection(db, 'edens_letters'), where('mesaId', '==', mesa.id));
          const snapLetters = await getDocs(qLetters);
          
          const lettersPromises = snapLetters.docs.map(d => {
              const letterData = d.data();
              return setDoc(doc(collection(db, 'edens_letters')), {
                  ...letterData,
                  mesaId: newMesaId,
                  createdAt: Date.now(),
              });
          });
          await Promise.all(lettersPromises);

          setMesas(prev => [newMesa, ...prev]);
          alert("Clonagem concluída com sucesso! Fichas e jornais foram duplicados.");
      } catch (err) {
          console.error(err);
          alert("Erro ao realizar a clonagem profunda da mesa.");
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteMesa = async (mesaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("⚠️ ATENÇÃO: Tem certeza que deseja excluir esta mesa? TODAS as fichas e jornais associados a ela serão apagados para sempre. Esta ação não pode ser desfeita.")) return;
      
      setLoading(true);
      try {
          await deleteDoc(doc(db, 'mesas', mesaId));
          
          const newUserJoined = userProfile.joinedMesas.filter((id: string) => id !== mesaId);
          await updateDoc(doc(db, 'users', auth.currentUser!.uid), { joinedMesas: newUserJoined });
          setUserProfile({ ...userProfile, joinedMesas: newUserJoined });

          const qChars = query(collection(db, 'characters'), where('mesaId', '==', mesaId));
          const snapChars = await getDocs(qChars);
          snapChars.forEach(async (d) => await deleteDoc(doc(db, 'characters', d.id)));

          const qLetters = query(collection(db, 'edens_letters'), where('mesaId', '==', mesaId));
          const snapLetters = await getDocs(qLetters);
          snapLetters.forEach(async (d) => await deleteDoc(doc(db, 'edens_letters', d.id)));

          setMesas(prev => prev.filter(m => m.id !== mesaId));
      } catch(err) {
          alert("Erro ao excluir mesa.");
      } finally {
          setLoading(false);
      }
  };

  const handleSaveLetter = async () => {
      if (!activeLetter?.title) return alert("O título é obrigatório!");
      setIsSavingLetter(true);
      try {
          const isNew = !activeLetter.id;
          const letterId = isNew ? generateId() : activeLetter.id;
          const now = Date.now();
          
          const finalData = { ...activeLetter, id: letterId, mesaId: 'global', createdAt: isNew ? now : activeLetter.createdAt, updatedAt: now };
          await setDoc(doc(db, "edens_letters", letterId), finalData);
          
          if (isNew) setLetters(prev => [finalData, ...prev]);
          else setLetters(prev => prev.map(l => l.id === letterId ? finalData : l));
          
          setActiveLetter(finalData); setLetterMode('read');
      } catch (e) { alert("Erro ao salvar notícia."); } finally { setIsSavingLetter(false); }
  };

  const handleDeleteLetter = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(!confirm("Apagar esta edição da Eden's Letter?")) return;
      try { await deleteDoc(doc(db, "edens_letters", id)); setLetters(prev => prev.filter(l => l.id !== id)); } catch (err) { alert("Erro ao deletar."); }
  };

  const openEditMode = (letter?: any) => {
      if (letter) setActiveLetter({ ...letter });
      else setActiveLetter({ id: '', title: '', subtitle: '', titleColor: '#ffffff', headerUrl: '', sections: [] });
      setLetterMode('edit');
  };

  if (loading) return (
    <div className="min-h-screen bg-eden-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-energia animate-spin" size={40}/>
        <span className="text-eden-100/40 font-bold uppercase tracking-widest text-sm">Carregando Universo...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-eden-900 text-eden-100 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-eden-800 p-6 rounded-3xl border border-eden-700 shadow-xl">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-energia/10 border border-energia/30 flex items-center justify-center text-energia">
                <Users size={24}/>
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Suas Mesas</h1>
                <p className="text-xs text-eden-100/40 font-bold">Logado como <span className="text-energia">@{userProfile?.username}</span></p>
              </div>
           </div>
           <button onClick={() => signOut(auth)} className="p-3 text-eden-100/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all" title="Sair da Conta">
             <LogOut size={24}/>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setShowCreate(true)} className="group p-6 bg-eden-800 border border-eden-700 hover:border-energia/50 rounded-2xl flex items-center gap-4 transition-all">
                <div className="p-3 bg-eden-900 rounded-xl text-energia group-hover:scale-110 transition-transform"><Plus size={24}/></div>
                <div className="text-left">
                    <h3 className="font-bold text-white">Nova Campanha</h3>
                    <p className="text-[10px] text-eden-100/40 uppercase tracking-widest">Criar Mesa</p>
                </div>
            </button>

            <button onClick={() => setShowJoin(true)} className="group p-6 bg-eden-800 border border-eden-700 hover:border-cyan-500/50 rounded-2xl flex items-center gap-4 transition-all">
                <div className="p-3 bg-eden-900 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform"><Hash size={24}/></div>
                <div className="text-left">
                    <h3 className="font-bold text-white">Entrar em Mesa</h3>
                    <p className="text-[10px] text-eden-100/40 uppercase tracking-widest">Usar Chave</p>
                </div>
            </button>

            <button onClick={() => setLetterMode('list')} className="group p-6 bg-purple-900/10 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden">
                <div className="p-3 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform"><Newspaper size={24}/></div>
                <div className="text-left">
                    <h3 className="font-bold text-white group-hover:text-purple-300">Eden's Letter</h3>
                    <p className="text-[10px] text-purple-200/50 uppercase tracking-widest">Avisos do Sistema</p>
                </div>
                {letters.length > 0 && <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">{letters.length}</div>}
            </button>
        </div>

        <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-eden-100/30 px-2 flex items-center gap-2">
                <BookOpen size={14}/> Campanhas Ativas
            </h2>
            
            {mesas.length === 0 ? (
                <div className="py-20 text-center bg-eden-800/20 border-2 border-dashed border-eden-700 rounded-3xl">
                    <Ghost size={48} className="mx-auto mb-4 text-eden-100/10"/>
                    <p className="text-eden-100/30 font-bold uppercase tracking-widest text-sm">Nenhuma mesa encontrada</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mesas.map(mesa => {
                        const isMestre = mesa.mestreId === auth.currentUser?.uid;
                        return (
                            <div key={mesa.id} onClick={() => navigate(`/mesa/${mesa.id}`)} className="group p-5 bg-eden-800 border border-eden-700 hover:border-eden-500 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 shadow-lg flex justify-between items-center relative overflow-hidden">
                                <div className="space-y-1">
                                    <h3 className="font-black text-white text-lg group-hover:text-energia transition-colors pr-16 truncate">{mesa.name}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-eden-100/40 uppercase">
                                        <Shield size={10} className={isMestre ? "text-red-500" : "text-cyan-500"}/> Mestre: {mesa.mestreName}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isMestre && (
                                        <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDuplicateMesa(mesa, e)} className="p-2 bg-eden-900 text-eden-100/50 hover:text-energia rounded-lg transition-colors border border-eden-700 hover:border-energia" title="Duplicar Mesa Completa"><Copy size={16}/></button>
                                            <button onClick={(e) => handleDeleteMesa(mesa.id, e)} className="p-2 bg-eden-900 text-eden-100/50 hover:text-red-400 rounded-lg transition-colors border border-eden-700 hover:border-red-400" title="Excluir Mesa Permanentemente"><Trash2 size={16}/></button>
                                        </div>
                                    )}
                                    <ChevronRight size={20} className="text-eden-100/20 group-hover:text-energia group-hover:translate-x-1 transition-all"/>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>

      {showCreate && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <form onSubmit={handleCreateMesa} className="bg-eden-800 border border-energia/30 w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl relative">
                  <button type="button" onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-eden-100/30 hover:text-white"><X/></button>
                  <div className="text-center">
                      <div className="w-16 h-16 bg-energia/10 rounded-2xl flex items-center justify-center text-energia mx-auto mb-4 border border-energia/20"><Shield size={32}/></div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nova Campanha</h2>
                  </div>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-eden-100/40 uppercase ml-1">Nome da Mesa</label>
                          <input required value={mesaName} onChange={e => setMesaName(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-white outline-none focus:border-energia" placeholder="Ex: O Segredo na Ilha"/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-eden-100/40 uppercase ml-1">Chave de Acesso (Para os Jogadores)</label>
                          <input required value={accessKey} onChange={e => setAccessKey(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-white font-mono outline-none focus:border-energia" placeholder="Ex: ilha-2024"/>
                      </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-energia text-eden-900 font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-yellow-400 transition-all">INICIAR CAMPANHA</button>
              </form>
          </div>
      )}

      {showJoin && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <form onSubmit={handleJoinMesa} className="bg-eden-800 border border-cyan-500/30 w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl relative">
                  <button type="button" onClick={() => setShowJoin(false)} className="absolute top-4 right-4 text-eden-100/30 hover:text-white"><X/></button>
                  <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto mb-4 border border-cyan-500/20"><Hash size={32}/></div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Entrar na Ordem</h2>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-eden-100/40 uppercase ml-1">Chave de Acesso</label>
                      <input required value={accessKey} onChange={e => setAccessKey(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-white font-mono outline-none focus:border-cyan-500" placeholder="Digite a chave da mesa..."/>
                  </div>
                  <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-cyan-500 transition-all">CONECTAR</button>
              </form>
          </div>
      )}

      {letterMode !== 'closed' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-eden-900 w-full max-w-4xl max-h-full rounded-2xl border border-purple-500/50 shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-purple-500/30 bg-purple-950/20 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          {letterMode !== 'list' && <button onClick={() => setLetterMode('list')} className="p-2 bg-black/20 hover:bg-black/40 text-purple-300 rounded-lg"><ChevronLeft size={20}/></button>}
                          <h2 className="text-xl font-black text-purple-100 uppercase tracking-widest flex items-center gap-2"><Newspaper className="text-purple-400"/> Eden's Letter</h2>
                      </div>
                      <button onClick={() => setLetterMode('closed')} className="p-2 text-eden-100/50 hover:text-white hover:bg-white/10 rounded-lg"><X size={24}/></button>
                  </div>

                  {letterMode === 'list' && (
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          <div className="flex justify-between items-center mb-4">
                              <p className="text-sm text-eden-100/60 italic">Avisos globais e atualizações do sistema.</p>
                              {isAdmin && <button onClick={() => openEditMode()} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><Plus size={16}/> Escrever Edição</button>}
                          </div>
                          {letters.length === 0 ? (
                              <div className="text-center py-20 border-2 border-dashed border-purple-500/20 rounded-xl text-purple-200/40">Nenhuma edição publicada.</div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {letters.map(letter => (
                                      <div key={letter.id} onClick={() => { setActiveLetter(letter); setLetterMode('read'); }} className="group bg-eden-950/50 border border-purple-900/50 hover:border-purple-500/50 rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all hover:-translate-y-1 shadow-lg">
                                          {letter.headerUrl && <div className="h-24 w-full bg-black shrink-0"><img src={letter.headerUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" alt="Capa" /></div>}
                                          <div className="p-4 flex-1 flex flex-col">
                                              <div className="text-[10px] text-purple-300 font-bold mb-2 flex flex-col gap-1">
                                                  <span className="flex items-center gap-1"><Calendar size={12}/> {formatDateTime(letter.createdAt)}</span>
                                              </div>
                                              <h3 className="font-black text-lg leading-tight mb-1" style={{ color: letter.titleColor || '#ffffff' }}>{letter.title}</h3>
                                              <p className="text-xs text-eden-100/70 line-clamp-2 flex-1">{letter.subtitle}</p>
                                              
                                              {isAdmin && (
                                                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-purple-900/30">
                                                      <button onClick={(e) => { e.stopPropagation(); openEditMode(letter); }} className="p-1.5 text-purple-400 hover:bg-purple-500/20 rounded"><Edit2 size={16}/></button>
                                                      <button onClick={(e) => handleDeleteLetter(letter.id, e)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16}/></button>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {letterMode === 'read' && activeLetter && (
                      <div className="flex-1 overflow-y-auto custom-scrollbar bg-eden-950 relative">
                          {activeLetter.headerUrl && (
                              <div className="w-full h-48 md:h-64 relative border-b border-purple-900/50">
                                  <img src={activeLetter.headerUrl} className="w-full h-full object-cover opacity-50" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-eden-950 to-transparent"></div>
                              </div>
                          )}
                          <div className={`max-w-3xl mx-auto p-6 md:p-10 ${!activeLetter.headerUrl ? 'pt-10' : '-mt-20 relative z-10'}`}>
                              <div className="text-center mb-10 space-y-4">
                                  <div className="inline-block px-3 py-1 bg-purple-900/30 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                                      Publicado em {formatDateTime(activeLetter.createdAt)}
                                  </div>
                                  <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: activeLetter.titleColor || '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{activeLetter.title}</h1>
                                  <p className="text-lg md:text-xl text-eden-100/70 font-medium max-w-2xl mx-auto">{activeLetter.subtitle}</p>
                              </div>
                              <div className="space-y-12">
                                  {(activeLetter.sections || []).map((sec: any) => (
                                      <div key={sec.id} className="space-y-3">
                                          <h3 className="text-2xl font-bold text-white border-b border-purple-900/50 pb-2 flex items-center gap-2"><div className="w-2 h-6 bg-purple-500 rounded-sm"></div> {sec.title}</h3>
                                          <p className="text-eden-100/80 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{sec.description}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {letterMode === 'edit' && activeLetter && isAdmin && (
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-eden-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1"><ImageIcon size={12}/> Link da Imagem de Capa</label>
                                  <input type="text" value={activeLetter.headerUrl || ''} onChange={e => setActiveLetter({...activeLetter, headerUrl: e.target.value})} className="w-full bg-eden-950 border border-purple-900/50 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-purple-300">Título</label>
                                  <input type="text" value={activeLetter.title} onChange={e => setActiveLetter({...activeLetter, title: e.target.value})} className="w-full bg-eden-950 border border-purple-900/50 rounded-lg p-3 text-sm text-white font-bold outline-none focus:border-purple-500" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1"><Palette size={12}/> Cor</label>
                                  <div className="flex gap-2 h-[46px]">
                                      <input type="color" value={activeLetter.titleColor || '#ffffff'} onChange={e => setActiveLetter({...activeLetter, titleColor: e.target.value})} className="h-full w-14 rounded-lg cursor-pointer bg-eden-950 border border-purple-900/50 p-1"/>
                                      <input type="text" value={activeLetter.titleColor || '#ffffff'} onChange={e => setActiveLetter({...activeLetter, titleColor: e.target.value})} className="flex-1 bg-eden-950 border border-purple-900/50 rounded-lg p-3 text-sm text-white font-mono outline-none"/>
                                  </div>
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] uppercase font-bold text-purple-300">Resumo</label>
                                  <input type="text" value={activeLetter.subtitle} onChange={e => setActiveLetter({...activeLetter, subtitle: e.target.value})} className="w-full bg-eden-950 border border-purple-900/50 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500"/>
                              </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-purple-900/50">
                              <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-bold text-purple-200 uppercase tracking-widest">Seções</h3>
                                  <button onClick={() => setActiveLetter({...activeLetter, sections: [...(activeLetter.sections||[]), {id: generateId(), title: '', description: ''}]})} className="bg-purple-900/50 text-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-800 flex items-center gap-1"><Plus size={14}/> Add Seção</button>
                              </div>
                              {(activeLetter.sections || []).map((sec: any, idx: number) => (
                                  <div key={sec.id} className="bg-eden-950/50 border border-purple-900/30 p-4 rounded-xl space-y-3 relative group">
                                      <button onClick={() => setActiveLetter({...activeLetter, sections: activeLetter.sections.filter((_:any, i:number) => i !== idx)})} className="absolute top-4 right-4 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                      <div className="space-y-1 pr-8">
                                          <input type="text" value={sec.title} onChange={e => { const ns = [...activeLetter.sections]; ns[idx].title = e.target.value; setActiveLetter({...activeLetter, sections: ns}); }} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500" placeholder="Título..."/>
                                      </div>
                                      <div className="space-y-1">
                                          <textarea value={sec.description} onChange={e => { const ns = [...activeLetter.sections]; ns[idx].description = e.target.value; setActiveLetter({...activeLetter, sections: ns}); }} className="w-full h-32 bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 outline-none focus:border-purple-500 resize-none" placeholder="Conteúdo..."/>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {letterMode === 'edit' && isAdmin && (
                      <div className="p-4 border-t border-purple-500/30 bg-purple-950/20 shrink-0 flex justify-end gap-3">
                          <button onClick={() => setLetterMode('list')} className="px-6 py-2.5 text-purple-200 hover:bg-purple-900/50 rounded-xl text-sm font-bold">Cancelar</button>
                          <button onClick={handleSaveLetter} disabled={isSavingLetter || !activeLetter?.title} className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg"><Save size={16}/> PUBLICAR</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}