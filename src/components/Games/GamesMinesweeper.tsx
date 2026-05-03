import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Skull, Flag, Loader2, Trophy, Bomb } from 'lucide-react';

const COLS = 10;
const ROWS = 8;
const BOMB_COUNT = 10; 

const BOMB_IMAGES = [
    '/elementos/conhecimento.png',
    '/elementos/energia.png',
    '/elementos/medo.png',
    '/elementos/morte.png',
    '/elementos/sangue.png'
];

interface Cell {
    x: number;
    y: number;
    isBomb: boolean;
    bombImg: string;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
}

export default function GamesMinesweeper({ mesaId, currentUser, dateString, onGameOver, playerName }: any) {
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [didWin, setDidWin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [firstMoveMade, setFirstMoveMade] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [finalTime, setFinalTime] = useState(0);
    const [rankings, setRankings] = useState<any[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const isEnding = useRef(false);

    const initEmptyGrid = useCallback(() => {
        let cells: Cell[][] = [];
        for (let y = 0; y < ROWS; y++) {
            let row: Cell[] = [];
            for (let x = 0; x < COLS; x++) {
                row.push({ x, y, isBomb: false, bombImg: '', isRevealed: false, isFlagged: false, neighborCount: 0 });
            }
            cells.push(row);
        }
        setGrid(cells);
    }, []);

    useEffect(() => {
        initEmptyGrid();
    }, [initEmptyGrid]);

    const calculateNeighbors = (board: Cell[][]) => {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (!board[y][x].isBomb) {
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (board[y + dy]?.[x + dx]?.isBomb) count++;
                        }
                    }
                    board[y][x].neighborCount = count;
                }
            }
        }
        return board;
    };

    const generateBoardWithSafeZone = (startX: number, startY: number): Cell[][] => {
        let tempCells: Cell[][] = [];
        for (let y = 0; y < ROWS; y++) {
            let row: Cell[] = [];
            for (let x = 0; x < COLS; x++) {
                row.push({ x, y, isBomb: false, bombImg: '', isRevealed: false, isFlagged: false, neighborCount: 0 });
            }
            tempCells.push(row);
        }

        let planted = 0;
        while (planted < BOMB_COUNT) {
            const rx = Math.floor(Math.random() * COLS);
            const ry = Math.floor(Math.random() * ROWS);
            
            const isSafeZone = Math.abs(rx - startX) <= 1 && Math.abs(ry - startY) <= 1;

            if (!tempCells[ry][rx].isBomb && !isSafeZone) {
                tempCells[ry][rx].isBomb = true;
                tempCells[ry][rx].bombImg = BOMB_IMAGES[Math.floor(Math.random() * BOMB_IMAGES.length)];
                planted++;
            }
        }

        return calculateNeighbors(tempCells);
    };

    const endGame = async (won: boolean, finalScore: number) => {
        if (isEnding.current) return;
        isEnding.current = true;
        setIsSaving(true);
        const timeTaken = Date.now() - startTime;
        setFinalTime(timeTaken);
        setDidWin(won);

        try {
            await addDoc(collection(db, `mesas/${mesaId}/minesweeper_ranking`), {
                userId: currentUser.uid, playerName, score: finalScore, timeTaken, date: dateString, timestamp: Date.now()
            });

            
            const q = query(
                collection(db, `mesas/${mesaId}/minesweeper_ranking`), 
                where('date', '==', dateString), 
                orderBy('score', 'desc'), 
                orderBy('timeTaken', 'asc'), 
                limit(10)
            );
            const snap = await getDocs(q);
            let list = snap.docs.map(d => d.data());

            
            if (list.length === 0) {
                list = [{ playerName, score: finalScore, timeTaken, userId: currentUser.uid }];
            }

            setRankings(list);
        } catch (e) {
            setRankings([{ playerName, score: finalScore, timeTaken, userId: currentUser.uid }]);
        } finally {
            setIsSaving(false);
            setIsGameOver(true);
            onGameOver(finalScore);
        }
    };

    const revealCell = (x: number, y: number) => {
        if (isGameOver || isSaving || grid[y][x].isFlagged) return;

        let workingGrid = [...grid.map(row => row.map(c => ({ ...c })))];

        if (!firstMoveMade) {
            setStartTime(Date.now());
            setFirstMoveMade(true);
            workingGrid = generateBoardWithSafeZone(x, y);
        }

        let newlyRevealed = 0;
        let hitBomb = false;

        const floodFill = (cx: number, cy: number) => {
            if (!workingGrid[cy]?.[cx] || workingGrid[cy][cx].isRevealed || workingGrid[cy][cx].isFlagged) return;
            
            if (workingGrid[cy][cx].isBomb) {
                hitBomb = true;
                return;
            }

            workingGrid[cy][cx].isRevealed = true;
            newlyRevealed++;

            if (workingGrid[cy][cx].neighborCount === 0) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) floodFill(cx + dx, cy + dy);
                }
            }
        };

        const targetCell = workingGrid[y][x];

        
        if (targetCell.isRevealed && targetCell.neighborCount > 0) {
            let flagCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (workingGrid[y + dy]?.[x + dx]?.isFlagged) flagCount++;
                }
            }
            
            if (flagCount === targetCell.neighborCount) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const neighbor = workingGrid[y + dy]?.[x + dx];
                        if (neighbor && !neighbor.isRevealed && !neighbor.isFlagged) {
                            if (neighbor.isBomb) hitBomb = true;
                            else floodFill(x + dx, y + dy);
                        }
                    }
                }
            } else { return; }
        } 
        else if (!targetCell.isRevealed && !targetCell.isFlagged) {
            if (targetCell.isBomb) hitBomb = true;
            else floodFill(x, y);
        } else { return; }

        if (hitBomb) {
            setGrid(workingGrid.map(row => row.map(c => c.isBomb ? { ...c, isRevealed: true } : c)));
            endGame(false, revealedCount);
            return;
        }

        if (newlyRevealed > 0) {
            const total = revealedCount + newlyRevealed;
            setRevealedCount(total);
            setGrid(workingGrid);

            if (total === (COLS * ROWS) - BOMB_COUNT) endGame(true, total);
        }
    };

    const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
        e.preventDefault();
        if (isGameOver || grid[y][x].isRevealed) return;
        const newGrid = [...grid.map(row => [...row])];
        newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
        setGrid(newGrid);
    };

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
    };

    const [visualTime, setVisualTime] = useState(0);
    useEffect(() => {
        if (!firstMoveMade || isGameOver) return;
        const interval = setInterval(() => setVisualTime(Date.now() - startTime), 1000);
        return () => clearInterval(interval);
    }, [firstMoveMade, startTime, isGameOver]);

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4 pb-10 select-none">
            <div className="flex justify-between w-full bg-eden-950 border border-eden-700 rounded-2xl p-4 shadow-inner">
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-white/50 block">Setores</span>
                    <span className="text-2xl font-black text-energia">{revealedCount}</span>
                </div>
                <div className="flex items-center gap-2 text-white/20">
                    <Bomb size={20} /> <span className="font-bold">{BOMB_COUNT}</span>
                </div>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-white/50 block">Tempo</span>
                    <span className="text-2xl font-black text-white">{formatTime(firstMoveMade ? visualTime : 0)}</span>
                </div>
            </div>

            <div className="grid gap-1 p-2 bg-eden-800 border-4 border-eden-800 rounded-xl shadow-2xl" 
                 style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                {grid.map((row, y) => row.map((cell, x) => (
                    <div key={`${x}-${y}`} onClick={() => revealCell(x, y)} onContextMenu={(e) => toggleFlag(e, x, y)}
                        className={`w-8 h-8 md:w-11 md:h-11 flex items-center justify-center rounded-sm cursor-pointer transition-all duration-200 font-black text-lg
                            ${cell.isRevealed ? (cell.isBomb ? 'bg-red-600/50' : 'bg-eden-950 text-white') : 'bg-eden-700 hover:bg-eden-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]'}`}
                    >
                        {cell.isRevealed ? (
                            cell.isBomb ? <img src={cell.bombImg} className="w-4/5 h-4/5 object-contain animate-pulse" alt="E" /> : (
                                cell.neighborCount > 0 ? <span style={{ color: ['','#60a5fa','#4ade80','#f87171','#c084fc','#fb923c','#2dd4bf','#000','#fff'][cell.neighborCount] }}>{cell.neighborCount}</span> : ''
                            )
                        ) : (cell.isFlagged ? <Flag size={16} className="text-energia fill-energia/20" /> : '')}
                    </div>
                )))}
            </div>

            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center">Clique no Número: Abre Vizinhos (Chording) | Direito: Bandeira</p>

            {(isGameOver || isSaving) && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-eden-900 w-full max-w-md rounded-3xl border border-energia/50 p-6 text-center shadow-2xl">
                        {isSaving ? <Loader2 size={60} className="text-energia animate-spin mx-auto mb-4" /> : (
                            didWin ? <Trophy size={60} className="text-yellow-400 mb-4 mx-auto animate-bounce" /> : <Skull size={60} className="text-red-500 mb-4 mx-auto" />
                        )}
                        <h2 className="text-2xl font-black text-white uppercase mb-6">{isSaving ? 'Sincronizando...' : (didWin ? 'Saiu em Segurança' : 'Criatura Encontrada!')}</h2>
                        <div className="flex gap-4 justify-center mb-6">
                            <div className="bg-black/40 p-4 rounded-2xl"><span className="block text-[10px] text-white/50 uppercase">Pontos</span><span className="text-2xl font-black text-energia">{revealedCount}</span></div>
                            <div className="bg-black/40 p-4 rounded-2xl"><span className="block text-[10px] text-white/50 uppercase">Tempo</span><span className="text-2xl font-black text-white">{formatTime(finalTime || (Date.now() - startTime))}</span></div>
                        </div>
                        <div className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 mb-6">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase mb-3 text-left">Ranking do Dia</h3>
                            {rankings.length === 0 ? (
                                <p className="text-xs text-white/20 uppercase">Sem registros hoje.</p>
                            ) : (
                                rankings.map((r, i) => (
                                    <div key={i} className={`flex justify-between p-2 rounded-lg mb-1 ${r.userId === currentUser?.uid ? 'bg-energia/20 text-energia' : 'bg-black/40 text-eden-100'}`}>
                                        <span className="font-bold text-sm truncate max-w-[150px]">{i+1}º {r.playerName}</span>
                                        <span className="text-xs font-bold">{r.score} pts | {formatTime(r.timeTaken)}</span>
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