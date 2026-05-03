import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Gamepad2, Home as HomeIcon, Loader2, Trophy, ArrowRight, Clock } from 'lucide-react';


import GamesOrdo from '../components/Games/GamesOrdo';
import GamesSigilsMemo from '../components/Games/GamesSigilsMemo';
import GamesCobranormal from '../components/Games/GamesCobranormal';
import GamesMinesweeper from '../components/Games/GamesMinesweeper';


const GAMES = [
    { id: 'snake', title: 'Cobranormal', desc: '"Farta-te em um banquete superior a tua fome e sorva insaciável além da tua sede."', icon: '🐍' },
    { id: 'minesweeper', title: 'Campo Minado', desc: '"Encare o limiar e retorne à tua forma pristina."', icon: '💣' },
    { id: 'termoo', title: 'Ordo', desc: '"Testifica tua lealdade e sangra sob as mãos de teu vínculo."', icon: '⌨️' },
    { id: 'memory', title: 'Jogo dos Sigilos', desc: '"Liberta a cua cólera primordial e aniquila a díade."', icon: '🎴' }
];

const CYCLE = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1]; 

export default function TeamGames() {
    const { mesaId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const [loading, setLoading] = useState(true);
    const [hasPlayedToday, setHasPlayedToday] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerName, setPlayerName] = useState('Usuário');
    
    
    const [dailyRankings, setDailyRankings] = useState<any[]>([]);
    const [loadingRanking, setLoadingRanking] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - tzOffset);
    
    const dateString = localDate.toISOString().split('T')[0];
    const daysSinceEpoch = Math.floor(localDate.getTime() / 86400000);
    
    
    const todayGameIndex = CYCLE[daysSinceEpoch % 14];
    const GameOfTheDay = GAMES[todayGameIndex];

    
    useEffect(() => {
        if (!hasPlayedToday) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const diffMs = tomorrow.getTime() - now.getTime();

            const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
            const m = Math.floor((diffMs / 1000 / 60) % 60).toString().padStart(2, '0');
            const s = Math.floor((diffMs / 1000) % 60).toString().padStart(2, '0');

            setTimeLeft(`${h}:${m}:${s}`);
        };

        calculateTimeLeft(); 
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [hasPlayedToday]);

    useEffect(() => {
        const checkDailyPlay = async () => {
            if (!mesaId || !currentUser) return;
            
            if (currentUser.displayName) {
                setPlayerName(currentUser.displayName);
            } else {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setPlayerName(userSnap.data().name || userSnap.data().displayName || 'Agente');
                }
            }

            const playerGameRef = doc(db, `mesas/${mesaId}/minigames`, currentUser.uid);
            const playerGameSnap = await getDoc(playerGameRef);

            if (playerGameSnap.exists()) {
                const data = playerGameSnap.data();
                if (data.lastPlayedDate === dateString) {
                    setHasPlayedToday(true);
                }
            }
            setLoading(false);
        };

        checkDailyPlay();
    }, [mesaId, currentUser, dateString]);

    
    useEffect(() => {
        if (hasPlayedToday) {
            const fetchRankings = async () => {
                setLoadingRanking(true); 
                let q;
                if (todayGameIndex === 0) {
                    q = query(collection(db, `mesas/${mesaId}/snake_ranking`), where('date', '==', dateString), orderBy('score', 'desc'), limit(10));
                } else if (todayGameIndex === 1) {
                    q = query(collection(db, `mesas/${mesaId}/minesweeper_ranking`), where('date', '==', dateString), orderBy('score', 'desc'), orderBy('timeTaken', 'asc'), limit(10));
                } else if (todayGameIndex === 2) {
                    q = query(collection(db, `mesas/${mesaId}/ordoo_ranking`), where('date', '==', dateString), orderBy('attempts', 'asc'), orderBy('timeTaken', 'asc'), limit(10));
                } else if (todayGameIndex === 3) {
                    q = query(collection(db, `mesas/${mesaId}/memory_ranking`), where('date', '==', dateString), orderBy('score', 'desc'), orderBy('timeTaken', 'asc'), limit(10));
                }

                if (q) {
                    try {
                        const snaps = await getDocs(q);
                        setDailyRankings(snaps.docs.map(d => d.data()));
                    } catch (e) {
                        console.error("Erro ao buscar ranking na tela principal:", e);
                    } finally {
                        setLoadingRanking(false); 
                    }
                } else {
                    setLoadingRanking(false);
                }
            }
            fetchRankings();
        }
    }, [hasPlayedToday, mesaId, dateString, todayGameIndex]);

    const startGame = () => {
        setGameStarted(true);
    };

    const handleGameOver = async (score: number) => {
        if (!mesaId || !currentUser) return;
        await setDoc(doc(db, `mesas/${mesaId}/minigames`, currentUser.uid), {
            lastPlayedDate: dateString,
            lastScore: score
        }, { merge: true });
    };

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
    };

    const renderRankInfo = (r: any, gameIndex: number) => {
        if (gameIndex === 0) return `${r.score} pts`;
        if (gameIndex === 1) return `${r.score} pts | ${formatTime(r.timeTaken)}`;
        if (gameIndex === 2) return `${r.won === false ? 'FALHOU' : r.attempts + ' tent.'} | ${formatTime(r.timeTaken)}`;
        if (gameIndex === 3) return `${r.score || 0} pares | ${formatTime(r.timeTaken)}`;
        return '';
    };

    if (loading) {
        return <div className="min-h-screen bg-eden-900 flex items-center justify-center text-energia"><Loader2 className="animate-spin" size={40}/></div>;
    }

    return (
        <div className="min-h-screen bg-eden-900 font-sans p-4 md:p-8 flex flex-col">
            
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between bg-eden-800 p-4 md:p-6 rounded-2xl border border-eden-700 shadow-xl mb-8 z-10 relative">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/mesa/${mesaId}/grupo`)} className="p-2 bg-eden-950 text-eden-100/50 hover:text-energia hover:bg-black/40 rounded-xl border border-eden-700 transition-colors shadow-sm">
                        <HomeIcon size={20}/>
                    </button>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Gamepad2 className="text-energia" size={28}/> Treinamento Diário
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                
                {!gameStarted ? (
                    <div className="bg-eden-800 border border-eden-700 rounded-3xl p-8 text-center shadow-2xl space-y-6 animate-in zoom-in-95 w-full relative overflow-hidden mt-10 flex flex-col items-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-energia/20 blur-[60px] pointer-events-none rounded-full"></div>

                        <div className="relative z-10">
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-energia bg-energia/10 px-3 py-1 rounded-full border border-energia/20 shadow-sm">
                                Jogo do Dia
                            </span>
                            <div className="text-6xl md:text-8xl mt-6 drop-shadow-lg">{GameOfTheDay.icon}</div>
                            <h2 className="text-2xl md:text-4xl font-black text-white mt-4 uppercase tracking-tight">
                                {GameOfTheDay.title}
                            </h2>
                            <p className="text-eden-100/60 text-sm md:text-base mt-3 max-w-sm mx-auto">
                                {GameOfTheDay.desc}
                            </p>
                        </div>

                        <div className="pt-4 relative z-10 w-full max-w-md mx-auto">
                            {hasPlayedToday ? (
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 shadow-inner w-full">
                                    <div className="flex items-center justify-center gap-2 mb-4 border-b border-white/5 pb-4">
                                        <Trophy className="w-5 h-5 text-energia" />
                                        <h3 className="text-eden-100 font-bold uppercase tracking-widest text-sm md:text-base">Ranking de Hoje</h3>
                                    </div>
                                    
                                    {}
                                    {loadingRanking ? (
                                        <div className="py-4 flex justify-center"><Loader2 className="w-6 h-6 text-energia animate-spin" /></div>
                                    ) : dailyRankings.length === 0 ? (
                                        <div className="py-4 flex justify-center text-xs text-white/50 uppercase tracking-widest font-bold">
                                            Sem registros hoje.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 mb-6">
                                            {dailyRankings.map((r, i) => (
                                                <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${r.userId === currentUser?.uid ? 'bg-energia/20 border-energia/50 text-energia' : 'bg-black/40 border-white/5 text-eden-100'}`}>
                                                    <span className="font-bold text-sm truncate max-w-[150px] text-left">{i+1}º {r.playerName}</span>
                                                    <span className="text-xs font-bold text-right">{renderRankInfo(r, todayGameIndex)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="bg-eden-950/80 border border-eden-700 p-3 rounded-xl flex items-center justify-center gap-3">
                                        <Clock className="text-energia w-5 h-5" />
                                        <div className="text-left">
                                            <p className="text-[10px] text-eden-100/50 uppercase tracking-widest font-bold">Próximo Treinamento em:</p>
                                            <p className="text-lg font-black text-white font-mono">{timeLeft}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={startGame} className="w-full bg-energia text-eden-950 text-lg md:text-xl font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(250,176,5,0.4)] hover:shadow-[0_0_30px_rgba(250,176,5,0.6)] hover:bg-yellow-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                    Iniciar Simulação <ArrowRight size={20}/>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full bg-eden-950 border border-eden-700 rounded-3xl p-4 md:p-6 shadow-2xl animate-in fade-in flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b border-eden-700/50 pb-4">
                            <h2 className="font-black text-white uppercase tracking-widest flex items-center gap-2">
                                {GameOfTheDay.icon} {GameOfTheDay.title}
                            </h2>
                            <button onClick={() => setGameStarted(false)} className="text-eden-100/50 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors">
                                Abortar Missão
                            </button>
                        </div>

                        <div className="flex-1 w-full flex items-start justify-center">
                            {todayGameIndex === 0 && <GamesCobranormal mesaId={mesaId} currentUser={currentUser} dateString={dateString} onGameOver={handleGameOver} playerName={playerName} />}
                            {todayGameIndex === 1 && <GamesMinesweeper mesaId={mesaId} currentUser={currentUser} dateString={dateString} onGameOver={handleGameOver} playerName={playerName} />}
                            {todayGameIndex === 2 && <GamesOrdo mesaId={mesaId} currentUser={currentUser} dateString={dateString} onGameOver={handleGameOver} playerName={playerName} />}
                            {todayGameIndex === 3 && <GamesSigilsMemo mesaId={mesaId} currentUser={currentUser} dateString={dateString} onGameOver={handleGameOver} playerName={playerName} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}