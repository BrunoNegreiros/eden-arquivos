import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, deleteDoc, doc, setDoc, getDoc, where } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { 
  Sword, Shield, Plus, Scroll, Ghost, Loader2, Trash2, AlertTriangle, 
  X, Newspaper, Edit2, Image as ImageIcon, ChevronLeft, Calendar, Save, Palette, 
  LogOut, UserCircle, Lock, Key, Users, Home as HomeIcon
} from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
const formatDateTime = (ts: number) => { if (!ts) return ''; return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };

export default function Home() {
  const navigate = useNavigate();
  const { mesaId } = useParams(); 
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [mesa, setMesa] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [publicCharacters, setPublicCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingChar, setDeletingChar] = useState<any | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const [promptingChar, setPromptingChar] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const [letters, setLetters] = useState<any[]>([]);
  const [letterMode, setLetterMode] = useState<'closed' | 'list' | 'read' | 'edit'>('closed');
  const [activeLetter, setActiveLetter] = useState<any | null>(null);
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { setCurrentUser(user); });
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    async function fetchData() {
      if (!mesaId || !currentUser) return;
      setLoading(true);
      try {
        
        const mesaSnap = await getDoc(doc(db, "mesas", mesaId));
        if (!mesaSnap.exists()) {
            alert("Mesa não encontrada!");
            navigate('/'); return;
        }
        const mesaData = mesaSnap.data();
        setMesa(mesaData);

        
        if (mesaData.members && mesaData.members.length > 0) {
            const qUsers = query(collection(db, "users"), where("uid", "in", mesaData.members));
            const snapUsers = await getDocs(qUsers);
            const membersData: any[] = [];
            snapUsers.forEach(d => membersData.push(d.data()));
            setMembers(membersData);
        }

        
        const qChars = query(collection(db, "characters"), where("mesaId", "==", mesaId));
        const snapChars = await getDocs(qChars);
        const mines: any[] = [];
        const publics: any[] = [];
        
        snapChars.forEach((doc) => {
          const data = doc.data();
          const char = { ...data, id: doc.id };
          if (data.userId === currentUser.uid) mines.push(char);
          else if (!data.isPrivate) publics.push(char);
        });
        
        
        mines.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        publics.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setMyCharacters(mines);
        setPublicCharacters(publics);

        
        const qLetters = query(collection(db, "edens_letters"), where("mesaId", "==", mesaId));
        const snapLetters = await getDocs(qLetters);
        const news: any[] = [];
        snapLetters.forEach(doc => news.push({ ...doc.data(), id: doc.id }));
        news.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLetters(news);

      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchData();
  }, [currentUser, mesaId, navigate]);

  const isMestre = currentUser && mesa && currentUser.uid === mesa.mestreId;

  const handleLogout = async () => { try { await signOut(auth); } catch (error) { console.error(error); } };

  const handleDeleteChar = async () => {
      if (!deletingChar) return;
      const charName = deletingChar.personal?.name || deletingChar.info?.name || "Desconhecido";
      if (confirmName !== charName) return alert("O nome não corresponde.");

      try {
          await deleteDoc(doc(db, "characters", deletingChar.id));
          setMyCharacters(prev => prev.filter(c => c.id !== deletingChar.id));
          setPublicCharacters(prev => prev.filter(c => c.id !== deletingChar.id));
          setDeletingChar(null); setConfirmName('');
      } catch (error) { alert("Erro ao excluir."); }
  };

  const handleCharClick = (char: any) => {
      const isOwner = currentUser && char.userId === currentUser.uid;
      if (isOwner || isMestre || !char.password) {
          navigate(`/mesa/${mesaId}/ficha/${char.id}`);
      } else {
          setPromptingChar(char); setPasswordInput('');
      }
  };

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === promptingChar.password || passwordInput === 'ADM_IS_TOP') {
          navigate(`/mesa/${mesaId}/ficha/${promptingChar.id}`);
      } else { alert("Acesso Negado: Senha incorreta."); }
  };

  const handleSaveLetter = async () => {
      if (!activeLetter?.title) return alert("O título é obrigatório!");
      setIsSavingLetter(true);
      try {
          const isNew = !activeLetter.id;
          const letterId = isNew ? generateId() : activeLetter.id;
          const now = Date.now();
          const finalData = { ...activeLetter, id: letterId, mesaId, createdAt: isNew ? now : activeLetter.createdAt, updatedAt: now };
          
          await setDoc(doc(db, "edens_letters", letterId), finalData);
          
          if (isNew) setLetters(prev => [finalData, ...prev]);
          else setLetters(prev => prev.map(l => l.id === letterId ? finalData : l));
          
          setActiveLetter(finalData); setLetterMode('read');
      } catch (e) { alert("Erro ao salvar notícia."); } finally { setIsSavingLetter(false); }
  };

  const handleDeleteLetter = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(!confirm("Apagar esta edição?")) return;
      try { await deleteDoc(doc(db, "edens_letters", id)); setLetters(prev => prev.filter(l => l.id !== id)); } catch (err) { alert("Erro ao deletar."); }
  };

  const openEditMode = (letter?: any) => {
      if (letter) setActiveLetter({ ...letter });
      else setActiveLetter({ id: '', title: '', subtitle: '', titleColor: '#ffffff', headerUrl: '', sections: [] });
      setLetterMode('edit');
  };

  const renderCharacterCard = (char: any, isOwner: boolean) => {
      const name = char.personal?.name || char.info?.name || "Desconhecido";
      const portrait = char.personal?.portraitUrl || char.info?.portraitUrl;
      const nex = char.personal?.nex || char.progression?.nex || 0;
      const cls = char.personal?.class || char.progression?.class || "Mundano";

      return (
          <div key={char.id} onClick={() => handleCharClick(char)} className="relative flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-eden-800 border border-eden-700 rounded-xl hover:border-eden-500 hover:bg-eden-700 transition-all group cursor-pointer shadow-sm active:scale-[0.98]">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-eden-900 overflow-hidden border-2 border-eden-600 group-hover:border-eden-400 shrink-0">
                  {portrait ? <img src={portrait} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-eden-100/20"><Ghost className="w-5 h-5 md:w-8 md:h-8" /></div>}
              </div>
              <div className="min-w-0 flex-1 pr-8">
                  <h4 className="font-bold text-sm md:text-lg text-eden-100 truncate group-hover:text-white flex items-center gap-2">
                      {name} {char.password && !isOwner && !isMestre && <Lock size={14} className="text-red-400" />}
                  </h4>
                  <div className="flex gap-2 text-[10px] md:text-xs text-eden-100/50 font-mono uppercase mt-0.5 md:mt-1"><span className="bg-eden-900 px-1.5 py-0.5 rounded">{nex}%</span><span className="self-center">•</span><span className="truncate text-energia font-bold">{cls}</span></div>
              </div>
              {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); setDeletingChar(char); setConfirmName(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-eden-100/30 hover:text-red-500 hover:bg-red-500/10 transition-all z-10" title="Excluir Ficha"><Trash2 size={18} /></button>
              )}
          </div>
      );
  };

  if (loading || !mesa) return <div className="h-screen bg-eden-900 flex items-center justify-center"><Loader2 className="animate-spin text-energia" size={40}/></div>;

  return (
    <div className="min-h-screen flex flex-col bg-eden-900 text-eden-100 font-sans">
      
      {}
      <div className="bg-eden-950 border-b border-eden-700 py-3 px-4 md:px-8 flex justify-between items-center shrink-0 z-20 shadow-md">
          <div className="flex items-center gap-4">
              <Link to="/" className="p-2 bg-eden-900 hover:bg-eden-800 text-eden-100/50 hover:text-energia rounded-xl transition-colors border border-eden-700/50" title="Voltar ao Lobby"><HomeIcon size={18}/></Link>
              <div className="font-black text-white tracking-widest uppercase flex items-center gap-2 hidden md:flex">
                  <img src="https://img.icons8.com/?size=512&id=8SkEP8nszFSJ&format=png&color=fa8805" alt="Icon" className="w-6 h-6" /> EDEN: ARQUIVOS
              </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{currentUser?.displayName}</span>
                  <span className="text-[10px] text-eden-100/50">{currentUser?.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-eden-600">
                  {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Perfil" className="w-full h-full object-cover"/> : <UserCircle className="w-full h-full text-eden-100/50"/>}
              </div>
              <button onClick={handleLogout} className="p-2 text-eden-100/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Sair da Conta"><LogOut size={18} /></button>
          </div>
      </div>

      {}
      <div className="bg-eden-800 border-b border-eden-700 py-8 px-4 text-center relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white relative z-10 mb-2 uppercase">{mesa.name}</h1>
        <p className="text-xs md:text-sm text-eden-100/50 uppercase tracking-widest font-bold flex items-center justify-center gap-2 relative z-10">
            <Shield size={14} className="text-red-500"/> Mestre: <span className="text-energia">{mesa.mestreName}</span>
        </p>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {}
        <div className="flex-1 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                <button onClick={() => navigate(`/mesa/${mesaId}/criar`)} className="col-span-1 group relative overflow-hidden p-4 bg-eden-800/50 border border-eden-700 hover:border-green-500/50 rounded-2xl text-left flex flex-col justify-between hover:bg-eden-800 transition-all">
                    <div className="p-2 bg-eden-900/80 rounded-lg w-fit mb-3 text-green-500"><Sword size={18} /></div>
                    <div><h3 className="text-sm md:text-lg font-bold text-white group-hover:text-green-400">Criar Agente</h3></div>
                </button>

                {isMestre && (
                    <button onClick={() => navigate(`/mesa/${mesaId}/mestre`)} className="col-span-1 group relative overflow-hidden p-4 bg-eden-800/50 border border-eden-700 hover:border-red-500/50 rounded-2xl text-left flex flex-col justify-between hover:bg-eden-800 transition-all">
                        <div className="p-2 bg-eden-900/80 rounded-lg w-fit mb-3 text-red-500"><Shield size={18} /></div>
                        <div><h3 className="text-sm md:text-lg font-bold text-white group-hover:text-red-400">Escudo do Mestre</h3></div>
                    </button>
                )}
                 
                <button onClick={() => setLetterMode('list')} className={`${isMestre ? 'col-span-2 md:col-span-1' : 'col-span-1'} group relative overflow-hidden p-4 bg-purple-900/10 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl text-left flex flex-col justify-between hover:bg-purple-900/20 transition-all`}>
                    <div className="p-2 bg-purple-950/80 rounded-lg w-fit mb-3 text-purple-400 border border-purple-500/20"><Newspaper size={18} /></div>
                    <div><h3 className="text-sm md:text-lg font-bold text-white group-hover:text-purple-300">Jornal da Mesa</h3></div>
                    {letters.length > 0 && <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded-full">{letters.length} edições</div>}
                </button>
            </div>

            <div>
                <h2 className="text-lg font-bold text-energia mb-4 flex items-center gap-2 border-b border-energia/30 pb-2"><UserCircle className="w-5 h-5" /> Meus Agentes</h2>
                {myCharacters.length === 0 ? (
                    <div className="text-center py-6 bg-eden-800/20 rounded-xl border border-dashed border-eden-700"><p className="text-xs text-eden-100/40">Você não tem fichas nesta mesa.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {myCharacters.map(char => renderCharacterCard(char, true))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-bold text-eden-100 mb-4 flex items-center gap-2 border-b border-eden-700 pb-2"><Scroll className="text-conhecimento w-5 h-5" /> Fichas da Mesa</h2>
                {publicCharacters.length === 0 ? (
                    <div className="text-center py-10 bg-eden-800/30 rounded-xl border border-dashed border-eden-700"><Ghost className="mx-auto mb-2 text-eden-100/20 w-8 h-8" /><p className="text-xs text-eden-100/50">Nenhuma ficha na mesa.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {publicCharacters.map(char => renderCharacterCard(char, false))}
                    </div>
                )}
            </div>
        </div>

        {}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-eden-800/50 border border-eden-700 rounded-2xl p-4 md:p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-eden-100 flex items-center gap-2 mb-4 border-b border-eden-700/50 pb-2">
                    <Users size={16} className="text-cyan-400"/> Membros ({members.length})
                </h3>
                <div className="space-y-3">
                    {members.map(m => (
                        <div key={m.uid} className="flex items-center justify-between bg-eden-900/80 p-2.5 rounded-xl border border-eden-700/50">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${m.uid === mesa.mestreId ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-eden-800 text-eden-100 border border-eden-600'}`}>
                                    {m.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className={`text-sm font-bold truncate ${m.uid === mesa.mestreId ? 'text-red-400' : 'text-white'}`}>@{m.username}</p>
                                    <p className="text-[9px] text-eden-100/40 uppercase tracking-widest">{m.uid === mesa.mestreId ? 'Mestre' : 'Jogador'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {isMestre && (
                <div className="bg-energia/10 border border-energia/30 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-bold text-energia/70 uppercase tracking-widest mb-1">Chave da Mesa</p>
                    <p className="text-lg font-mono font-black text-energia select-all">{mesa.accessKey}</p>
                </div>
            )}
        </div>
      </main>

      {}
      {}
      {}
      {promptingChar && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <form onSubmit={handleUnlock} className="bg-eden-900 border border-red-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <button type="button" onClick={() => setPromptingChar(null)} className="absolute top-4 right-4 text-eden-100/50 hover:text-white"><X size={24}/></button>
                  <div className="flex flex-col items-center text-center mb-6 mt-4">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-500/20"><Lock size={32}/></div>
                      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Acesso Restrito</h3>
                      <p className="text-eden-100/60 text-sm">Ficha protegida por senha.</p>
                  </div>
                  <div className="space-y-4">
                      {promptingChar.passwordHint && (
                          <div className="bg-eden-950/80 p-3 rounded-lg border border-eden-700 text-center flex items-center justify-center gap-2">
                              <Key size={14} className="text-energia" />
                              <span className="text-xs font-bold text-eden-100/70">Dica: <span className="text-energia/80 italic">{promptingChar.passwordHint}</span></span>
                          </div>
                      )}
                      <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Digite a senha..." className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-center font-bold text-eden-100 focus:border-red-500 outline-none" autoFocus/>
                      <button type="submit" disabled={!passwordInput} className="w-full py-3 rounded-xl font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-500 disabled:opacity-50">Desbloquear</button>
                  </div>
              </form>
          </div>
      )}

      {letterMode !== 'closed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-eden-900 w-full max-w-4xl max-h-full rounded-2xl border border-purple-500/50 shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-purple-500/30 bg-purple-950/20 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          {letterMode !== 'list' && <button onClick={() => setLetterMode('list')} className="p-2 bg-black/20 hover:bg-black/40 text-purple-300 rounded-lg"><ChevronLeft size={20}/></button>}
                          <h2 className="text-xl font-black text-purple-100 uppercase tracking-widest flex items-center gap-2"><Newspaper className="text-purple-400"/> Jornal da Mesa</h2>
                      </div>
                      <button onClick={() => setLetterMode('closed')} className="p-2 text-eden-100/50 hover:text-white hover:bg-white/10 rounded-lg"><X size={24}/></button>
                  </div>

                  {letterMode === 'list' && (
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          <div className="flex justify-between items-center mb-4">
                              <p className="text-sm text-eden-100/60 italic">Fique por dentro das atualizações da campanha.</p>
                              {}
                              {isMestre && <button onClick={() => openEditMode()} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><Plus size={16}/> Escrever Edição</button>}
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
                                              
                                              {}
                                              {isMestre && (
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

                  {letterMode === 'edit' && activeLetter && isMestre && (
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-eden-900">
                          {}
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
                  {letterMode === 'edit' && isMestre && (
                      <div className="p-4 border-t border-purple-500/30 bg-purple-950/20 shrink-0 flex justify-end gap-3">
                          <button onClick={() => setLetterMode('list')} className="px-6 py-2.5 text-purple-200 hover:bg-purple-900/50 rounded-xl text-sm font-bold">Cancelar</button>
                          <button onClick={handleSaveLetter} disabled={isSavingLetter || !activeLetter?.title} className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg"><Save size={16}/> PUBLICAR</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {deletingChar && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-eden-900 border border-red-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                  <button onClick={() => setDeletingChar(null)} className="absolute top-4 right-4 text-eden-100/50 hover:text-white"><X size={24}/></button>
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4"><AlertTriangle size={32}/></div>
                      <h3 className="text-2xl font-bold text-white mb-2">Excluir Agente?</h3>
                  </div>
                  <div className="space-y-4">
                      <input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={`Digite "${deletingChar.personal?.name}" para confirmar`} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-center font-bold text-eden-100 focus:border-red-500 outline-none" autoFocus/>
                      <div className="flex gap-3">
                          <button onClick={() => setDeletingChar(null)} className="flex-1 py-3 rounded-xl font-bold bg-eden-800 hover:bg-eden-700">Cancelar</button>
                          <button onClick={handleDeleteChar} disabled={confirmName !== (deletingChar.personal?.name || deletingChar.info?.name)} className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50">Excluir</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}