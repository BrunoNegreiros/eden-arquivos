import { useEffect, useState } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Trophy, AlertTriangle, Loader2 } from 'lucide-react';

const MEMORY_CARDS = [
    '/elementos/conhecimento.png', '/elementos/energia.png', '/elementos/morte.png', '/elementos/medo.png', '/elementos/sangue.png',
    '/marcas/ordorealitas.png', '/marcas/hellhunters.png', '/marcas/obscurite.png', '/marcas/ordocalamitas.png', '/marcas/leone.png'
];

export default function GamesSigilsMemo({ mesaId, currentUser, dateString, onGameOver, playerName }: any) {
    const MAX_ERRORS = 15;
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [errors, setErrors] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [didWin, setDidWin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startTime] = useState(Date.now());
    const [finalTime, setFinalTime] = useState(0);
    const [rankings, setRankings] = useState<any[]>([]);

    useEffect(() => {
        const shuffled = [...MEMORY_CARDS, ...MEMORY_CARDS]
            .map((src, i) => ({ id: i, src, matchId: MEMORY_CARDS.indexOf(src) }))
            .sort(() => Math.random() - 0.5);
        setCards(shuffled);
    }, []);

    const handleCardClick = (index: number) => {
        if (isChecking || isGameOver || isSaving || flipped.includes(index) || matched.includes(cards[index].matchId)) return;
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            const [i1, i2] = newFlipped;
            if (cards[i1].matchId === cards[i2].matchId) {
                setTimeout(() => {
                    const newMatches = [...matched, cards[i1].matchId];
                    setMatched(newMatches);
                    setFlipped([]);
                    setIsChecking(false);
                    checkWin(newMatches.length, errors);
                }, 800);
            } else {
                setTimeout(() => {
                    const newErr = errors + 1;
                    setErrors(newErr);
                    setFlipped([]);
                    setIsChecking(false);
                    checkWin(matched.length, newErr);
                }, 1000);
            }
        }
    };

    const checkWin = async (mCount: number, currentErr: number) => {
        const won = mCount === MEMORY_CARDS.length;
        const lost = currentErr >= MAX_ERRORS && !won;
        
        if (won || lost) {
            setIsSaving(true);
            const timeTaken = Date.now() - startTime;
            setFinalTime(timeTaken);
            setDidWin(won);

            try {
                await addDoc(collection(db, `mesas/${mesaId}/memory_ranking`), { 
                    userId: currentUser.uid, playerName: playerName || 'Agente', score: mCount, errors: currentErr, timeTaken, date: dateString 
                });
                
                const q = query(collection(db, `mesas/${mesaId}/memory_ranking`), where('date', '==', dateString), orderBy('score', 'desc'), orderBy('timeTaken', 'asc'), limit(10));
                const snaps = await getDocs(q);
                let list = snaps.docs.map(d => d.data());

                
                const myResult = { playerName: playerName || 'Agente', score: mCount, errors: currentErr, timeTaken, userId: currentUser.uid };
                const alreadyIn = list.some(r => r.userId === currentUser.uid && r.score === mCount && r.timeTaken === timeTaken);
                
                if (!alreadyIn) {
                    list.push(myResult);
                    
                    list.sort((a, b) => (b.score || 0) - (a.score || 0) || a.timeTaken - b.timeTaken);
                    list = list.slice(0, 10);
                }
                setRankings(list);
            } catch (e) {
                setRankings([{ playerName: playerName || 'Agente', score: mCount, errors: currentErr, timeTaken, userId: currentUser.uid }]);
            } finally {
                setIsSaving(false);
                setIsGameOver(true);
                onGameOver(won ? 100 : Math.floor((mCount / MEMORY_CARDS.length) * 100)); 
            }
        }
    };

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        return `${Math.floor(total/60).toString().padStart(2, '0')}:${(total%60).toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6 select-none pb-10">
            <div className="flex justify-between w-full bg-eden-950 border border-eden-700 rounded-2xl p-4 shadow-inner">
                <div className="text-center"><span className="text-[10px] uppercase font-bold text-white/50 block">Pares</span><span className="text-2xl font-black text-white">{matched.length}/{MEMORY_CARDS.length}</span></div>
                <div className="text-center"><span className="text-[10px] uppercase font-bold text-white/50 block">Chances</span><span className={`text-2xl font-black ${MAX_ERRORS - errors <= 3 ? 'text-red-500 animate-pulse' : 'text-energia'}`}>{MAX_ERRORS - errors}</span></div>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 w-full" style={{ perspective: '1000px' }}>
                {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i);
                    const isMatched = matched.includes(card.matchId);
                    return (
                        <div key={i} onClick={() => handleCardClick(i)} style={{ transformStyle: 'preserve-3d', transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)' }} className={`relative aspect-[3/4] cursor-pointer transition-all duration-700 ${isMatched ? 'opacity-0 scale-95 pointer-events-none' : 'hover:scale-105'}`}>
                            <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 bg-black border-2 border-eden-700 rounded-xl flex items-center justify-center shadow-lg"><img src="/misc/desconhecido.png" className="w-2/3 h-2/3 object-contain opacity-40" /></div>
                            <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 bg-eden-800 border-2 border-energia rounded-xl flex items-center justify-center shadow-2xl overflow-hidden"><div className="absolute inset-0 bg-energia/10"></div><img src={card.src} className="w-3/4 h-3/4 object-contain relative z-10 drop-shadow-md" /></div>
                        </div>
                    );
                })}
            </div>
            
            {(isGameOver || isSaving) && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-eden-900 w-full max-w-md rounded-3xl border border-energia/50 p-6 text-center shadow-2xl">
                        {isSaving ? <Loader2 size={60} className="text-energia animate-spin mx-auto mb-4" /> : (
                            didWin ? <Trophy size={60} className="text-yellow-400 mb-4 mx-auto animate-bounce" /> : <AlertTriangle size={60} className="text-red-500 mb-4 mx-auto" />
                        )}
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6">{isSaving ? 'Sincronizando...' : (didWin ? 'A Conjuração foi Completa!' : 'A Conjuração Falhou!')}</h2>
                        
                        {!isSaving && (
                            <div className="flex gap-4 justify-center mb-6">
                                <div className="bg-black/40 p-3 rounded-xl min-w-[80px]">
                                    <span className="block text-[10px] text-white/50 uppercase">Pares</span>
                                    <span className="text-xl font-black text-energia">{matched.length}</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl min-w-[80px]">
                                    <span className="block text-[10px] text-white/50 uppercase">Tempo</span>
                                    <span className="text-xl font-black text-energia">{formatTime(finalTime)}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 mb-6">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase mb-3 text-left">Ranking do Dia</h3>
                            {rankings.map((r, i) => (
                                <div key={i} className={`flex justify-between p-2 rounded-lg mb-1 ${r.userId === currentUser?.uid ? 'bg-energia/20 text-energia' : 'bg-black/40 text-eden-100'}`}>
                                    <span className="font-bold text-sm truncate max-w-[150px]">{i+1}º {r.playerName}</span>
                                    <span className="text-xs font-bold text-right">{r.score || 0} pares | {formatTime(r.timeTaken)}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => window.location.reload()} disabled={isSaving} className="w-full py-4 bg-energia text-eden-950 font-black uppercase rounded-xl hover:bg-yellow-400">Sair</button>
                    </div>
                </div>
            )}
        </div>
    );
}