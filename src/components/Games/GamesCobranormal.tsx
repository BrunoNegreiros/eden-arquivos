import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Gamepad2, Skull, Zap, Snail, Scissors, Coins, Loader2 } from 'lucide-react';

const GRID_W = 10;
const GRID_H = 9;
const INITIAL_SPEED = 150;

const getAppleIcon = (hex: string) => `https://img.icons8.com/?size=100&id=8SkEP8nszFSJ&format=png&color=${hex.replace('#', '')}`;
const SOUND_EAT = '/sounds/apple_eat.mp3';
const SOUND_TURN = '/sounds/turn.mp3';

type PowerupType = 'NONE' | 'SLOW' | 'SHINY' | 'RED' | 'SHRINK' | 'FAST';

interface Food {
    x: number; y: number; type: PowerupType; color: string;
}

export default function GamesCobranormal({ mesaId, currentUser, dateString, onGameOver, playerName }: any) {
    const [snake, setSnake] = useState([{ x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }]);
    const [score, setScore] = useState(0);
    const [applesEaten, setApplesEaten] = useState(0);
    
    const snakeRef = useRef(snake);
    const scoreRef = useRef(0);
    const applesRef = useRef(0);
    const foodRef = useRef<Food>({ x: 2, y: 2, type: 'NONE', color: 'FAB005' });
    const applesSincePowerRef = useRef(0);
    const isDead = useRef(false); 

    const direction = useRef({ x: 0, y: -1 });
    const moveQueue = useRef<{x: number, y: number}[]>([]);
    
    const [foodUI, setFoodUI] = useState<Food>(foodRef.current);
    const [activeEffect, setActiveEffect] = useState<PowerupType>('NONE');
    const [effectEnd, setEffectEnd] = useState(0);

    const [isGameOver, setIsGameOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [rankings, setRankings] = useState<any[]>([]);
    const gameRef = useRef<HTMLDivElement>(null);

    const playSfx = (src: string) => {
        const audio = new Audio(src);
        audio.volume = 0.3;
        audio.play().catch(() => {});
    };

    // --- MONITOR DE POWERUPS (CORREÇÃO DO TIMER NEGATIVO) ---
    useEffect(() => {
        if (activeEffect === 'NONE') return;

        const checkEffect = setInterval(() => {
            if (Date.now() >= effectEnd) {
                setActiveEffect('NONE');
                setEffectEnd(0);
            }
        }, 100); // Checa a cada 100ms se o efeito deve sumir

        return () => clearInterval(checkEffect);
    }, [activeEffect, effectEnd]);

    const spawnFood = useCallback(() => {
        let x: number, y: number;
        while (true) {
            x = Math.floor(Math.random() * GRID_W);
            y = Math.floor(Math.random() * GRID_H);
            if (!snakeRef.current.some(s => s.x === x && s.y === y)) break;
        }

        let type: PowerupType = 'NONE';
        let color = 'FAB005'; 

        if (applesSincePowerRef.current >= 8 && Math.random() < 0.2) {
            const roll = Math.random();
            if (roll < 0.2) { type = 'SLOW'; color = '2563EB'; } 
            else if (roll < 0.4) { type = 'SHRINK'; color = '06B6D4'; } 
            else if (roll < 0.6) { type = 'FAST'; color = '22C55E'; } 
            else if (roll < 0.8) { type = 'RED'; color = 'DC2626'; } 
            else { 
                if (Math.random() > 0.5) { type = 'SHINY'; color = 'FFF700'; }
                else { type = 'NONE'; color = 'FAB005'; }
            }
        }
        const newFood = { x, y, type, color };
        foodRef.current = newFood;
        setFoodUI(newFood);
    }, []);

    const die = async () => {
        if (isDead.current) return;
        isDead.current = true;
        setGameStarted(false);
        setIsSaving(true);
        
        const finalScore = scoreRef.current;
        const finalApples = applesRef.current;

        try {
            await addDoc(collection(db, `mesas/${mesaId}/snake_ranking`), {
                userId: currentUser.uid,
                playerName,
                score: finalScore,
                date: dateString,
                apples: finalApples,
                timestamp: Date.now()
            });

            const q = query(collection(db, `mesas/${mesaId}/snake_ranking`), where('date', '==', dateString), orderBy('score', 'desc'), limit(10));
            const snap = await getDocs(q);
            let list = snap.docs.map(d => d.data());

            if (list.length === 0) {
                list = [{ playerName, score: finalScore, userId: currentUser.uid }];
            }

            setRankings(list);
        } catch (e) {
            console.error(e);
            setRankings([{ playerName, score: finalScore, userId: currentUser.uid }]);
        } finally {
            setIsSaving(false);
            setIsGameOver(true);
            onGameOver(finalScore);
        }
    };

    const moveSnake = useCallback(() => {
        if (!gameStarted || isGameOver || isSaving || isDead.current) return;

        if (moveQueue.current.length > 0) {
            direction.current = moveQueue.current.shift()!;
        }

        const head = snakeRef.current[0];
        const nextHead = { x: head.x + direction.current.x, y: head.y + direction.current.y };

        if (
            nextHead.x < 0 || nextHead.x >= GRID_W || 
            nextHead.y < 0 || nextHead.y >= GRID_H || 
            snakeRef.current.some(s => s.x === nextHead.x && s.y === nextHead.y)
        ) {
            die();
            return;
        }

        const newSnake = [nextHead, ...snakeRef.current];

        if (nextHead.x === foodRef.current.x && nextHead.y === foodRef.current.y) {
            playSfx(SOUND_EAT);
            let pts = 0;
            const mult = activeEffect === 'SHINY' ? 3 : 1;

            if (foodRef.current.type === 'NONE') {
                pts = (1 + snakeRef.current.length) * mult;
                applesSincePowerRef.current += 1;
            } else if (foodRef.current.type === 'RED') {
                pts = (snakeRef.current.length + 5) * 4;
                applesSincePowerRef.current = 0;
            } else {
                pts = (snakeRef.current.length + 5) * mult;
                setActiveEffect(foodRef.current.type);
                setEffectEnd(Date.now() + 20000);
                applesSincePowerRef.current = 0;
            }

            if (foodRef.current.type === 'SHRINK') {
                const targetSize = Math.max(1, newSnake.length - 7);
                newSnake.splice(targetSize);
            }

            scoreRef.current += pts;
            applesRef.current += 1;
            setScore(scoreRef.current);
            setApplesEaten(applesRef.current);
            
            snakeRef.current = newSnake;
            setSnake(newSnake);
            spawnFood();
        } else {
            newSnake.pop();
            snakeRef.current = newSnake;
            setSnake(newSnake);
        }
    }, [gameStarted, isGameOver, isSaving, activeEffect, effectEnd, spawnFood]);

    useEffect(() => {
        if (!gameStarted || isGameOver) return;
        
        const getSpeed = () => {
            if (activeEffect === 'SLOW') return INITIAL_SPEED * 2;
            if (activeEffect === 'FAST') return INITIAL_SPEED / 2;
            return INITIAL_SPEED;
        };

        const interval = setInterval(moveSnake, getSpeed());
        return () => clearInterval(interval);
    }, [gameStarted, isGameOver, activeEffect, moveSnake]);

    const onKey = (e: React.KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) e.preventDefault();

        if (!gameStarted && (key === ' ' || key === 'enter')) {
            if (!isGameOver && !isSaving) setGameStarted(true);
            return;
        }

        const lastDir = moveQueue.current.length > 0 ? moveQueue.current[moveQueue.current.length - 1] : direction.current;
        let next: {x: number, y: number} | null = null;

        if ((key === 'arrowup' || key === 'w') && lastDir.y !== 1) next = { x: 0, y: -1 };
        else if ((key === 'arrowdown' || key === 's') && lastDir.y !== -1) next = { x: 0, y: 1 };
        else if ((key === 'arrowleft' || key === 'a') && lastDir.x !== 1) next = { x: -1, y: 0 };
        else if ((key === 'arrowright' || key === 'd') && lastDir.x !== -1) next = { x: 1, y: 0 };

        if (next) {
            if (moveQueue.current.length < 2) {
                playSfx(SOUND_TURN);
                moveQueue.current.push(next);
            }
        }
    };

    let sCol = 'bg-eden-100';
    if (activeEffect === 'SLOW') sCol = 'bg-blue-600';
    if (activeEffect === 'SHRINK') sCol = 'bg-cyan-500';
    if (activeEffect === 'FAST') sCol = 'bg-green-500';
    if (activeEffect === 'SHINY') sCol = 'bg-yellow-500 shadow-[0_0_15px_#FAB005]';

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto select-none outline-none pb-10">
            <div className="flex justify-between w-full bg-eden-950 border border-eden-700 rounded-2xl p-4 shadow-inner mb-4">
                <div className="flex gap-6">
                    <div className="text-center"><span className="text-[10px] uppercase font-bold text-white/50 block">Pontos</span><span className="text-2xl font-black text-energia">{score}</span></div>
                    <div className="text-center"><span className="text-[10px] uppercase font-bold text-white/50 block">Maçãs</span><span className="text-lg font-black text-white">{applesEaten}</span></div>
                </div>
                {activeEffect !== 'NONE' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg border border-white/20 animate-pulse text-white font-black text-xs">
                        {activeEffect === 'FAST' && <Zap size={14} className="text-green-400"/>} 
                        {activeEffect === 'SLOW' && <Snail size={14} className="text-blue-400"/>}
                        {activeEffect === 'SHRINK' && <Scissors size={14} className="text-cyan-400"/>} 
                        {activeEffect === 'SHINY' && <Coins size={14} className="text-yellow-400"/>}
                        {Math.max(0, Math.ceil((effectEnd - Date.now()) / 1000))}s
                    </div>
                )}
            </div>

            <div ref={gameRef} tabIndex={0} onKeyDown={onKey} className="relative bg-eden-950 border-4 border-eden-800 rounded-xl overflow-hidden shadow-2xl w-full aspect-[10/9] focus:border-energia transition-colors outline-none">
                {!gameStarted && !isGameOver && !isSaving && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <Gamepad2 size={48} className="text-energia mb-4 animate-bounce" />
                        <p className="text-white font-black uppercase text-sm">Pressione <span className="text-energia">ESPAÇO</span></p>
                    </div>
                )}
                
                <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)` }}>
                    <div className="flex items-center justify-center p-1" style={{ gridColumnStart: foodUI.x + 1, gridRowStart: foodUI.y + 1 }}>
                        <img src={getAppleIcon(foodUI.color)} className={`w-full h-full object-contain ${foodUI.type !== 'NONE' ? 'animate-bounce' : ''}`} alt="M" />
                    </div>
                    {snake.map((s, i) => (
                        <div key={i} className="p-[2px]" style={{ gridColumnStart: s.x + 1, gridRowStart: s.y + 1 }}>
                            <div className={`w-full h-full rounded-md ${i === 0 ? 'bg-white shadow-[0_0_10px_white]' : sCol} transition-colors duration-300`}></div>
                        </div>
                    ))}
                </div>
            </div>

            {(isGameOver || isSaving) && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-eden-900 w-full max-w-md rounded-3xl border border-energia/50 p-6 text-center shadow-2xl">
                        {isSaving ? <Loader2 size={60} className="text-energia animate-spin mx-auto mb-4" /> : <Skull size={60} className="text-red-500 mb-4 mx-auto" />}
                        <h2 className="text-2xl font-black text-white uppercase mb-6">{isSaving ? 'Maçãs Devoradas!' : 'Maçãs Devoradas.'}</h2>
                        
                        <div className="flex gap-4 justify-center mb-6">
                            <div className="bg-black/40 p-4 rounded-2xl"><span className="block text-[10px] text-white/50 uppercase">Maçãs</span><span className="text-2xl font-black text-energia">{applesEaten}</span></div>
                            <div className="bg-black/40 p-4 rounded-2xl"><span className="block text-[10px] text-white/50 uppercase">Pontos</span><span className="text-2xl font-black text-energia">{score}</span></div>
                        </div>

                        <div className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase mb-3 text-left">Ranking do Dia</h3>
                            {rankings.length === 0 ? (
                                <p className="text-xs text-white/20 uppercase">Sem registros hoje.</p>
                            ) : (
                                rankings.map((r, i) => (
                                    <div key={i} className={`flex justify-between p-2 rounded-lg mb-1 ${r.userId === currentUser?.uid ? 'bg-energia/20 text-energia' : 'bg-black/40 text-eden-100'}`}>
                                        <span className="font-bold text-sm truncate max-w-[150px]">{i+1}º {r.playerName}</span>
                                        <span className="font-bold text-sm">{r.score} pts</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => window.location.reload()} disabled={isSaving} className="w-full py-4 bg-energia text-eden-950 font-black uppercase rounded-xl hover:bg-yellow-400">Sair</button>
                    </div>
                </div>
            )}
        </div>
    );
}