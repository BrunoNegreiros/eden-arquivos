import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Sword, Shield, Plus, Scroll, Ghost, Loader2, Trash2, AlertTriangle, X } from 'lucide-react';
import type { CharacterSheet } from '../types/characterSchema';

export default function Home() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Exclusão
  const [deletingChar, setDeletingChar] = useState<CharacterSheet | null>(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    async function fetchPublicCharacters() {
      try {
        const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const chars: CharacterSheet[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as CharacterSheet;
          // Mostra apenas se NÃO for privado
          if (!data.isPrivate) {
             chars.push({ ...data, id: doc.id });
          }
        });
        
        setCharacters(chars);
      } catch (error) {
        console.error("Erro ao buscar fichas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicCharacters();
  }, []);

  const handleDelete = async () => {
      if (!deletingChar) return;
      
      if (confirmName !== deletingChar.info.name) {
          alert("O nome inserido não corresponde ao do agente.");
          return;
      }

      try {
          await deleteDoc(doc(db, "characters", deletingChar.id!));
          // Remove da lista local visualmente
          setCharacters(prev => prev.filter(c => c.id !== deletingChar.id));
          setDeletingChar(null);
          setConfirmName('');
      } catch (error) {
          console.error("Erro ao excluir:", error);
          alert("Erro ao excluir ficha.");
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-eden-900 text-eden-100 font-sans">
      
      {/* Hero Section */}
      <div className="bg-eden-800 border-b border-eden-700 py-6 md:py-12 px-4 text-center relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-eden-100 to-eden-500 mb-1 md:mb-2 relative z-10">
          EDEN
        </h1>
        <p className="text-[10px] md:text-xl text-eden-100/40 font-mono tracking-[0.3em] md:tracking-[0.5em] uppercase relative z-10">
          Arquivos Públicos
        </p>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Ações */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
            
            <button 
                onClick={() => navigate('/criar')}
                className="col-span-2 md:col-span-1 group relative overflow-hidden p-4 md:p-8 bg-eden-800 border border-eden-600 rounded-2xl hover:border-energia transition-all hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] text-left shadow-md flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none hidden md:block">
                    <Plus size={100} />
                </div>
                <div className="p-2 md:p-3 bg-eden-900/80 rounded-lg shrink-0 group-hover:bg-energia group-hover:text-eden-900 transition-colors shadow-inner">
                    <Sword size={20} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold mb-0 md:mb-1 text-white leading-tight">Ficha Pública</h3>
                    <p className="text-eden-100/50 text-xs md:text-sm">Criar agente visível para todos.</p>
                </div>
            </button>

            {/* Botão Escudo do Mestre */}
            <button 
                onClick={() => navigate('/mestre')}
                className="col-span-1 group relative overflow-hidden p-4 md:p-8 bg-eden-800/50 border border-eden-700 hover:border-red-500/50 rounded-2xl text-left flex flex-col justify-between hover:bg-eden-800 transition-all"
            >
                <div className="p-2 md:p-3 bg-eden-900/80 rounded-lg w-fit mb-2 md:mb-4 text-red-500">
                    <Shield size={20} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h3 className="text-sm md:text-2xl font-bold mb-0 md:mb-1 text-white group-hover:text-red-400">Escudo do Mestre</h3>
                    <p className="text-eden-100/50 text-[10px] md:text-sm hidden md:block">Área restrita.</p>
                </div>
            </button>
             
            <div className="col-span-1 p-4 md:p-8 bg-eden-900 border border-eden-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-inner">
                <span className="text-2xl md:text-4xl font-black text-eden-100">{characters.length}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-eden-100/40 mt-1 leading-tight">Agentes<br className="md:hidden"/> Públicos</span>
            </div>
        </div>

        <h2 className="text-lg md:text-2xl font-bold text-eden-100 mb-3 md:mb-6 flex items-center gap-2 md:gap-3 border-b border-eden-700 pb-2 md:pb-4">
            <Scroll className="text-conhecimento w-4 h-4 md:w-6 md:h-6" /> Arquivos da Ordem
        </h2>

        {loading ? (
            <div className="flex justify-center py-20 text-eden-100/30">
                <Loader2 size={32} className="animate-spin md:w-12 md:h-12" />
            </div>
        ) : characters.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-eden-800/30 rounded-2xl border border-dashed border-eden-700">
                <Ghost className="mx-auto mb-4 text-eden-100/20 w-10 h-10 md:w-16 md:h-16" />
                <p className="text-xs md:text-lg text-eden-100/50">Nenhum agente público encontrado.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-8">
                {characters.map(char => (
                    <div 
                        key={char.id}
                        onClick={() => navigate(`/ficha/${char.id}`)}
                        className="relative flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-eden-800 border border-eden-700 rounded-xl hover:border-eden-500 hover:bg-eden-700 transition-all group cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-eden-900 overflow-hidden border-2 border-eden-600 group-hover:border-eden-400 shrink-0">
                            {char.info.portraitUrl ? (
                                <img src={char.info.portraitUrl} alt={char.info.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-eden-100/20"><Ghost className="w-5 h-5 md:w-8 md:h-8" /></div>
                            )}
                        </div>
                        
                        <div className="min-w-0 flex-1 pr-8">
                            <h4 className="font-bold text-sm md:text-lg text-eden-100 truncate group-hover:text-white">{char.info.name || 'Desconhecido'}</h4>
                            <div className="flex gap-2 text-[10px] md:text-xs text-eden-100/50 font-mono uppercase mt-0.5 md:mt-1">
                                <span className="bg-eden-900 px-1.5 py-0.5 rounded">{char.progression.nex}%</span>
                                <span className="self-center">•</span>
                                <span className="truncate text-energia font-bold">{char.progression.class}</span>
                            </div>
                        </div>

                        {/* Botão de Excluir (Extrema Direita) */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Impede abrir a ficha
                                setDeletingChar(char);
                                setConfirmName('');
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-eden-100/30 hover:text-red-500 hover:bg-red-500/10 transition-all z-10"
                            title="Excluir Ficha"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* Modal de Exclusão */}
      {deletingChar && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-eden-900 border border-red-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                  <button 
                    onClick={() => setDeletingChar(null)}
                    className="absolute top-4 right-4 text-eden-100/50 hover:text-white"
                  >
                      <X size={24}/>
                  </button>

                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                          <AlertTriangle size={32}/>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Excluir Agente?</h3>
                      <p className="text-eden-100/60 text-sm">
                          Esta ação é irreversível. A ficha de <strong className="text-white">{deletingChar.info.name}</strong> será apagada permanentemente.
                      </p>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-eden-100/50 uppercase mb-1">
                              Digite <span className="text-white select-all">"{deletingChar.info.name}"</span> para confirmar:
                          </label>
                          <input 
                              type="text" 
                              value={confirmName}
                              onChange={(e) => setConfirmName(e.target.value)}
                              placeholder={deletingChar.info.name}
                              className="w-full bg-eden-950 border border-eden-700 rounded-xl p-3 text-center font-bold text-eden-100 focus:border-red-500 outline-none transition-colors"
                              autoFocus
                              style={{ colorScheme: 'dark' }}
                          />
                      </div>

                      <div className="flex gap-3">
                          <button 
                              onClick={() => setDeletingChar(null)}
                              className="flex-1 py-3 rounded-xl font-bold bg-eden-800 text-eden-100 hover:bg-eden-700 transition-colors"
                          >
                              Cancelar
                          </button>
                          <button 
                              onClick={handleDelete}
                              disabled={confirmName !== deletingChar.info.name}
                              className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              <Trash2 size={18}/> Excluir
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}