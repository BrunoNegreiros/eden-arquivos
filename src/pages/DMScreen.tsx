import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Lock, Unlock, Skull, Ghost, Plus, Trash2, ArrowLeft } from 'lucide-react';
import type { CharacterSheet } from '../types/characterSchema';

export default function DMScreen() {
    const navigate = useNavigate();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const [privateChars, setPrivateChars] = useState<CharacterSheet[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados para Exclusão
    const [deletingChar, setDeletingChar] = useState<CharacterSheet | null>(null);
    const [confirmName, setConfirmName] = useState('');

    // Lógica da Senha Matemática
    const checkPassword = (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // Jan é 0
        const year = today.getFullYear();
        
        const magicNumber = day * month * year;

        if (parseInt(password) === magicNumber) {
            setIsUnlocked(true);
            fetchPrivateCharacters();
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const fetchPrivateCharacters = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const chars: CharacterSheet[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data() as CharacterSheet;
                if (data.isPrivate) {
                    chars.push({ ...data, id: doc.id });
                }
            });
            setPrivateChars(chars);
        } catch (error) {
            console.error("Erro ao buscar:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingChar) return;
        if (confirmName !== deletingChar.info.name) return alert("Nome incorreto.");
  
        try {
            await deleteDoc(doc(db, "characters", deletingChar.id!));
            setPrivateChars(prev => prev.filter(c => c.id !== deletingChar.id));
            setDeletingChar(null);
            setConfirmName('');
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    // --- TELA DE BLOQUEIO ---
    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                 <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-red-900 hover:text-red-500 transition-colors flex items-center gap-2"><ArrowLeft/> Voltar</button>

                 <div className="w-full max-w-sm z-10">
                     <div className="flex justify-center mb-8">
                         <Skull size={64} className="animate-pulse" />
                     </div>
                     <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-widest">Acesso Restrito</h1>
                     <p className="text-center text-xs text-red-800 mb-8">Protocolo Mestre do Calabouço</p>

                     <form onSubmit={checkPassword} className="space-y-4">
                         <div className="relative">
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"/>
                             <input 
                                type="number" 
                                placeholder="Senha do Mestre" 
                                className={`w-full bg-red-950/20 border-2 rounded-xl py-3 pl-10 pr-4 text-center text-xl font-bold outline-none transition-all placeholder-red-900/50 ${error ? 'border-red-500 animate-shake' : 'border-red-900 focus:border-red-700'}`}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoFocus
                             />
                         </div>
                         <button className="w-full bg-red-900/50 hover:bg-red-800 text-red-100 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                             <Unlock size={18}/> DESBLOQUEAR
                         </button>
                     </form>
                 </div>
            </div>
        );
    }

    // --- DASHBOARD DO MESTRE ---
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
            <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Skull className="text-red-600" size={28}/>
                        <h1 className="text-xl font-black text-red-500 uppercase tracking-widest hidden md:block">Escudo do Mestre</h1>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/')} className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold">Voltar para Home</button>
                        <button onClick={() => setIsUnlocked(false)} className="px-4 py-2 rounded bg-red-900/50 text-red-200 hover:bg-red-800 text-xs font-bold">Bloquear</button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Fichas Privadas</h2>
                        <p className="text-zinc-500 text-xs">Apenas você tem acesso a estes agentes.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/criar?private=true')} // <--- O SEGREDO ESTÁ AQUI
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                        <Plus size={20}/> Criar Privada
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-zinc-600">Carregando segredos...</div>
                ) : privateChars.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                        <Ghost className="mx-auto mb-4 text-zinc-700 w-16 h-16"/>
                        <p className="text-zinc-500">Nenhum arquivo confidencial encontrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {privateChars.map(char => (
                            <div key={char.id} onClick={() => navigate(`/ficha/${char.id}`)} className="relative group bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-zinc-800 flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-black border border-zinc-700 overflow-hidden shrink-0">
                                    {char.info.portraitUrl ? <img src={char.info.portraitUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Ghost size={20} className="text-zinc-700"/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg text-zinc-200 truncate group-hover:text-red-400">{char.info.name || "Desconhecido"}</h4>
                                    <div className="text-xs text-zinc-500 font-mono">{char.progression.nex}% • {char.progression.class}</div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setDeletingChar(char); setConfirmName(''); }}
                                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Exclusão (Reaproveitado visualmente) */}
            {deletingChar && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-red-500 w-full max-w-md rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-red-500 mb-4">Destruir Arquivo?</h3>
                        <p className="text-zinc-400 text-sm mb-4">Digite <span className="text-white font-bold">"{deletingChar.info.name}"</span> para confirmar.</p>
                        <input 
                            className="w-full bg-black border border-zinc-700 rounded p-2 text-white mb-4 outline-none focus:border-red-500"
                            value={confirmName}
                            onChange={e => setConfirmName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingChar(null)} className="flex-1 py-2 bg-zinc-800 rounded text-zinc-300 font-bold">Cancelar</button>
                            <button onClick={handleDelete} disabled={confirmName !== deletingChar.info.name} className="flex-1 py-2 bg-red-600 rounded text-white font-bold disabled:opacity-50">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}