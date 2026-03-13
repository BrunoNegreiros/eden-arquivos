import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, query, deleteDoc, doc, getDoc, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Skull, Ghost, Plus, Trash2, ArrowLeft, Loader2, X, AlertTriangle } from 'lucide-react';

export default function DMScreen() {
  const navigate = useNavigate();
  const { mesaId } = useParams();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [privateChars, setPrivateChars] = useState<any[]>([]);

  
  const [deletingChar, setDeletingChar] = useState<any | null>(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    const verifyAndLoad = async () => {
      if (!auth.currentUser || !mesaId) {
        navigate('/');
        return;
      }

      try {
        
        const mesaSnap = await getDoc(doc(db, 'mesas', mesaId));
        if (!mesaSnap.exists() || mesaSnap.data().mestreId !== auth.currentUser.uid) {
          alert("Acesso Negado: Apenas o Mestre desta mesa tem autorização para acessar o Escudo.");
          navigate(`/mesa/${mesaId}`);
          return;
        }

        setAuthorized(true);

        
        const q = query(
            collection(db, "characters"), 
            where("mesaId", "==", mesaId), 
            where("isPrivate", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        const chars: any[] = [];
        
        querySnapshot.forEach((doc) => {
          chars.push({ ...doc.data(), id: doc.id });
        });

        
        chars.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPrivateChars(chars);

      } catch (error) {
        console.error("Erro ao acessar o Escudo do Mestre:", error);
        alert("Erro ao validar credenciais.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [mesaId, navigate]);

  const handleDelete = async () => {
    if (!deletingChar) return;
    const charName = deletingChar.personal?.name || deletingChar.info?.name || "Desconhecido";

    if (confirmName !== charName) return alert("Nome incorreto.");
  
    try {
      await deleteDoc(doc(db, "characters", deletingChar.id));
      setPrivateChars(prev => prev.filter(c => c.id !== deletingChar.id));
      setDeletingChar(null);
      setConfirmName('');
    } catch (error) {
      alert("Erro ao excluir ficha.");
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-red-500">
              <Loader2 size={40} className="animate-spin" />
              <span className="font-bold uppercase tracking-widest text-sm animate-pulse">Verificando Credenciais...</span>
          </div>
      );
  }

  if (!authorized) return null; 

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20 selection:bg-red-500 selection:text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/mesa/${mesaId}`)} className="p-2 bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-900/50" title="Voltar para a Mesa">
                <ArrowLeft size={20}/>
            </button>
            <div className="flex items-center gap-3">
                <Skull className="text-red-600" size={28}/>
                <div>
                    <h1 className="text-sm md:text-xl font-black text-red-500 uppercase tracking-widest leading-none">Escudo do Mestre</h1>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Acesso Nível Omega</p>
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Fichas em Posse</h2>
            <p className="text-zinc-500 text-xs mt-1">NPCs, Monstros e personagens ocultos da área pública da mesa.</p>
          </div>
          <button 
            onClick={() => navigate(`/mesa/${mesaId}/criar`)}
            className="bg-red-700 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus size={18}/> Novo Agente
          </button>
        </div>

        {privateChars.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20">
            <Ghost className="mx-auto mb-4 text-zinc-700 w-16 h-16"/>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Nenhum arquivo confidencial</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privateChars.map(char => {
               const name = char.personal?.name || char.info?.name || "Desconhecido";
               const portrait = char.personal?.portraitUrl || char.info?.portraitUrl;
               const nex = char.personal?.nex || char.progression?.nex || 0;
               const cls = char.personal?.class || char.progression?.class || "Mundano";

               return (
                <div key={char.id} onClick={() => navigate(`/mesa/${mesaId}/ficha/${char.id}`)} className="relative group bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-zinc-800 flex gap-4 items-center shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-700 group-hover:border-red-900 overflow-hidden shrink-0 transition-colors">
                    {portrait ? <img src={portrait} className="w-full h-full object-cover" alt={name}/> : <div className="w-full h-full flex items-center justify-center"><Ghost size={20} className="text-zinc-700"/></div>}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-bold text-lg text-zinc-200 truncate group-hover:text-red-400 transition-colors">{name}</h4>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5"><span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">{nex}%</span> • {cls}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeletingChar(char); setConfirmName(''); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Destruir Arquivo"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
               )
            })}
          </div>
        )}
      </main>

      {}
      {deletingChar && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-red-500/50 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button onClick={() => setDeletingChar(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="flex flex-col items-center text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-500/20"><AlertTriangle size={32}/></div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Destruir Arquivo?</h3>
                <p className="text-zinc-400 text-sm">Esta ação apagará a ficha permanentemente do banco de dados.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Digite <span className="text-white select-all">"{deletingChar.personal?.name || deletingChar.info?.name}"</span> para confirmar:</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-center font-bold outline-none focus:border-red-500 transition-colors"
                    value={confirmName}
                    onChange={e => setConfirmName(e.target.value)}
                    autoFocus
                  />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingChar(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-bold transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={confirmName !== (deletingChar.personal?.name || deletingChar.info?.name)} className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl text-white font-black uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={18}/> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}