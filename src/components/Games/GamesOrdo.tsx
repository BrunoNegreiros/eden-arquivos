import { useState, useRef } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Trophy, AlertTriangle, Key, Loader2 } from 'lucide-react';

const ORDO_WORDS = [
  { word: "SANGUE", hint: "Entidade" }, { word: "CONHECIMENTO", hint: "Entidades" }, { word: "ENERGIA", hint: "Entidades" }, { word: "MORTE", hint: "Entidades" },
  { word: "MEDO", hint: "Entidades" }, { word: "TINTA", hint: "Entidades" }, { word: "TRANSMISSAO", hint: "Entidades" }, { word: "INTENCAO", hint: "Entidades" },
  { word: "ENTIDADES", hint: "Entidades" }, { word: "RELIQUIAS", hint: "Entidades" }, { word: "ARTHUR", hint: "Personagens" }, { word: "VERISSIMO", hint: "Personagens" },
  { word: "ARNALDO", hint: "Personagens" }, { word: "KIAN", hint: "Personagens" }, { word: "KAISER", hint: "Personagens" }, { word: "ELIZABETH", hint: "Personagens" },
  { word: "CARINA", hint: "Personagens" }, { word: "RUBENS", hint: "Personagens" }, { word: "BALU", hint: "Personagens" }, { word: "DANTE", hint: "Personagens" },
  { word: "SUVACO", hint: "Locais" }, { word: "CARPAZINHA", hint: "Locais" }, { word: "COLISEU", hint: "Locais" }, { word: "TIPORA", hint: "Locais" },
  { word: "ORFANATO", hint: "Locais" }, { word: "TENEBRIS", hint: "Locais" }, { word: "VARMINHO", hint: "Locais" }, { word: "CANADENSE", hint: "Locais" },
  { word: "AURORA", hint: "Locais" }, { word: "BENQUERENCA", hint: "Locais" }, { word: "ESCRIPTAS", hint: "Cultos" }, { word: "PSIKOLERA", hint: "Cultos" },
  { word: "VAMPIROS", hint: "Cultos" }, { word: "COURACAS", hint: "Cultos" }, { word: "ORDEM", hint: "Cultos" }, { word: "MASCARADOS", hint: "Cultos" },
  { word: "TRANSTORNADOS", hint: "Cultos" }, { word: "LUZIDIOS", hint: "Cultos" }, { word: "STRACH", hint: "Cultos" }, { word: "OBSCURITE", hint: "Cultos" },
  { word: "DIABO", hint: "Criaturas" }, { word: "ANFITRIAO", hint: "Criaturas" }, { word: "MAGISTRADA", hint: "Criaturas" }, { word: "ANIQUILACAO", hint: "Criaturas" },
  { word: "QUIBUNGO", hint: "Criaturas" }, { word: "ENPAP", hint: "Criaturas" }, { word: "MINOTAURO", hint: "Criaturas" }, { word: "DEGOLIFICADA", hint: "Criaturas" },
  { word: "ANULADO", hint: "Criaturas" }, { word: "ANJO", hint: "Criaturas" }, { word: "INEXISTIR", hint: "Rituais" }, { word: "DECADENCIA", hint: "Rituais" },
  { word: "CICATRIZACAO", hint: "Rituais" }, { word: "CINERARIA", hint: "Rituais" }, { word: "DESCARNAR", hint: "Rituais" }, { word: "ELETROCUSSAO", hint: "Rituais" },
  { word: "EMBARALHAR", hint: "Rituais" }, { word: "HEMOFAGIA", hint: "Rituais" }, { word: "ENFEITICAR", hint: "Rituais" }, { word: "PURGATORIO", hint: "Rituais" },
  { word: "ENERGETICA", hint: "Maldições" }, { word: "VIBRANTE", hint: "Maldições" }, { word: "SANGUINARIA", hint: "Maldições" }, { word: "RITUALISTICA", hint: "Maldições" },
  { word: "SENCIENTE", hint: "Maldições" }, { word: "PUJANCA", hint: "Maldições" }, { word: "SADICA", hint: "Maldições" }, { word: "ABASCANTA", hint: "Maldições" },
  { word: "VOLTAICA", hint: "Maldições" }, { word: "CONSUMIDORA", hint: "Maldições" }, { word: "EDEN", hint: "Ligados a Eden" }, { word: "ADAO", hint: "Ligados a Eden" },
  { word: "OCCULTORUM", hint: "Ligados a Eden" }, { word: "ORCHID", hint: "Ligados a Eden" }, { word: "ALEXANDRIA", hint: "Ligados a Eden" }, { word: "UTOPICOS", hint: "Ligados a Eden" },
  { word: "VISLUMBRE", hint: "Ligados a Eden" }, { word: "ZELDA", hint: "Ligados a Eden" }, { word: "RENASCER", hint: "Ligados a Eden" }, { word: "JARDIM", hint: "Ligados a Eden" }
];

export default function GamesOrdo({ mesaId, currentUser, dateString, onGameOver, playerName }: any) {
    
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - tzOffset);
    
    const todayIndex = Math.floor(localDate.getTime() / 86400000) % ORDO_WORDS.length;
    const { word, hint } = ORDO_WORDS[todayIndex]; 
    const maxAttempts = 3 + Math.floor((word.length - 3) / 2);

    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string[]>(Array(word.length).fill(''));
    const [isGameOver, setIsGameOver] = useState(false);
    const [didWin, setDidWin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startTime] = useState(Date.now());
    const [finalTime, setFinalTime] = useState(0); 
    const [rankings, setRankings] = useState<any[]>([]);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const getGuessColors = (guessStr: string) => {
        const colors = Array(word.length).fill('gray');
        const targetArr = word.split('');
        const guessArr = guessStr.split('');
        guessArr.forEach((char, i) => { if (char === targetArr[i]) { colors[i] = 'green'; targetArr[i] = ''; } });
        guessArr.forEach((char, i) => { if (colors[i] !== 'green' && targetArr.includes(char)) { colors[i] = 'yellow'; targetArr[targetArr.indexOf(char)] = ''; } });
        return colors;
    };

    const getKeyColors = () => {
        const keyColors: Record<string, string> = {};
        guesses.forEach(g => {
            const colors = getGuessColors(g);
            g.split('').forEach((char, i) => {
                if (colors[i] === 'green') keyColors[char] = 'green';
                else if (colors[i] === 'yellow' && keyColors[char] !== 'green') keyColors[char] = 'yellow';
                else if (colors[i] === 'gray' && !keyColors[char]) keyColors[char] = 'gray';
            });
        });
        return keyColors;
    };

    const submitGuess = async () => {
        const fullWord = currentGuess.join('');
        if (fullWord.length !== word.length || isGameOver || isSaving) return;
        
        const newGuesses = [...guesses, fullWord];
        setGuesses(newGuesses);
        setCurrentGuess(Array(word.length).fill(''));
        inputRefs.current[0]?.focus();
        
        const won = fullWord === word;
        const lost = newGuesses.length >= maxAttempts && !won;
        
        if (won || lost) {
            setIsSaving(true);
            const timeTaken = Date.now() - startTime;
            setFinalTime(timeTaken);
            setDidWin(won);

            
            const finalAttempts = won ? newGuesses.length : 99;

            try {
                
                await addDoc(collection(db, `mesas/${mesaId}/ordoo_ranking`), { 
                    userId: currentUser.uid, playerName: playerName || 'Agente', attempts: finalAttempts, timeTaken, date: dateString, won 
                });

                const q = query(collection(db, `mesas/${mesaId}/ordoo_ranking`), where('date', '==', dateString), orderBy('attempts', 'asc'), orderBy('timeTaken', 'asc'), limit(10));
                const snaps = await getDocs(q);
                let list = snaps.docs.map(d => d.data());

                
                const myResult = { playerName: playerName || 'Agente', attempts: finalAttempts, timeTaken, userId: currentUser.uid, won };
                const alreadyIn = list.some(r => r.userId === currentUser.uid && r.timeTaken === timeTaken);
                
                if (!alreadyIn) {
                    list.push(myResult);
                    list.sort((a, b) => a.attempts - b.attempts || a.timeTaken - b.timeTaken);
                    list = list.slice(0, 10);
                }
                setRankings(list);
            } catch (e) {
                setRankings([{ playerName: playerName || 'Agente', attempts: finalAttempts, timeTaken, userId: currentUser.uid, won }]);
            } finally {
                setIsSaving(false);
                setIsGameOver(true);
                onGameOver(won ? 100 : 0);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        if (!val) return;
        const newG = [...currentGuess];
        newG[index] = val[val.length - 1];
        setCurrentGuess(newG);
        if (index < word.length - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!currentGuess[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newG = [...currentGuess];
                newG[index - 1] = '';
                setCurrentGuess(newG);
            } else {
                const newG = [...currentGuess];
                newG[index] = '';
                setCurrentGuess(newG);
            }
        } else if (e.key === 'Enter') submitGuess();
    };

    const handleVirtualKey = (key: string) => {
        if (key === 'ENTER') { submitGuess(); return; }
        if (key === 'BACKSPACE') {
            let lastFilled = currentGuess.map((c, i) => c ? i : -1).filter(i => i !== -1).pop();
            if (lastFilled !== undefined) {
                const newG = [...currentGuess];
                newG[lastFilled] = '';
                setCurrentGuess(newG);
                inputRefs.current[lastFilled]?.focus();
            }
            return;
        }
        const firstEmpty = currentGuess.findIndex(c => !c);
        if (firstEmpty !== -1) {
            const newG = [...currentGuess];
            newG[firstEmpty] = key;
            setCurrentGuess(newG);
            if (firstEmpty < word.length - 1) inputRefs.current[firstEmpty + 1]?.focus();
        }
    };

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
    };

    const keyboardRows = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','BACKSPACE']];
    const keyColors = getKeyColors();

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 select-none pb-10">
            {!isGameOver && guesses.length === maxAttempts - 1 && (
                <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm tracking-widest uppercase animate-in slide-in-from-top-4">
                    <Key size={16}/> Tópico: {hint}
                </div>
            )}
            <div className="grid gap-2 mb-4" style={{ gridTemplateRows: `repeat(${maxAttempts}, minmax(0, 1fr))` }}>
                {Array.from({ length: maxAttempts }).map((_, r) => (
                    <div key={r} className="flex gap-2 justify-center">
                        {Array.from({ length: word.length }).map((_, c) => {
                            const isSubmitted = r < guesses.length;
                            const colors = isSubmitted ? getGuessColors(guesses[r]) : [];
                            let style = isSubmitted ? (colors[c] === 'green' ? 'bg-green-600 border-green-600' : colors[c] === 'yellow' ? 'bg-yellow-500 border-yellow-500' : 'bg-zinc-800 border-zinc-800') : 'bg-eden-950 border-eden-700';
                            return r === guesses.length && !isGameOver && !isSaving ? (
                                <input key={c} ref={el => { inputRefs.current[c] = el; }} value={currentGuess[c] || ''} onChange={e => handleInputChange(e, c)} onKeyDown={e => handleInputKeyDown(e, c)} className="w-10 h-12 md:w-14 md:h-16 bg-eden-950 border-2 border-eden-700 text-center text-xl md:text-3xl font-black text-white uppercase rounded-xl focus:border-energia outline-none transition-colors" maxLength={1} autoFocus={c === 0} />
                            ) : (
                                <div key={c} className={`w-10 h-12 md:w-14 md:h-16 border-2 flex items-center justify-center text-xl md:text-3xl font-black text-white uppercase rounded-xl transition-all ${style}`}>{isSubmitted ? guesses[r][c] : ''}</div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="w-full max-w-xl mx-auto space-y-2">
                {keyboardRows.map((row, i) => (
                    <div key={i} className="flex justify-center gap-1 md:gap-2">
                        {row.map(k => {
                            let bg = keyColors[k] === 'green' ? 'bg-green-600 hover:bg-green-500' : keyColors[k] === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-400' : keyColors[k] === 'gray' ? 'bg-zinc-800 opacity-50' : 'bg-eden-800 hover:bg-eden-700';
                            return <button key={k} disabled={isSaving} onClick={() => handleVirtualKey(k)} className={`${bg} ${k.length > 1 ? 'px-2 md:px-4 text-[10px]' : 'w-8 md:w-11 text-sm md:text-lg'} h-12 md:h-14 font-bold text-white rounded-lg flex items-center justify-center uppercase shadow disabled:opacity-50`}>{k === 'BACKSPACE' ? '⌫' : k}</button>
                        })}
                    </div>
                ))}
            </div>
            {(isGameOver || isSaving) && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-eden-900 w-full max-w-md rounded-3xl border border-energia/50 p-6 text-center shadow-2xl">
                        {isSaving ? <Loader2 size={60} className="text-energia animate-spin mx-auto mb-4" /> : (
                            didWin ? <Trophy size={60} className="text-yellow-400 mb-4 mx-auto animate-bounce" /> : <AlertTriangle size={60} className="text-red-500 mb-4 mx-auto" />
                        )}
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{isSaving ? 'Sincronizando...' : (didWin ? 'Acesso Aprovado!' : 'Acesso Negado!')}</h2>
                        
                        {!isSaving && (
                            <div className="flex gap-4 justify-center mb-6">
                                <div className="bg-black/40 p-3 rounded-xl min-w-[80px]">
                                    <span className="block text-[10px] text-white/50 uppercase">Tenta.</span>
                                    <span className="text-xl font-black text-energia">{didWin ? guesses.length : '—'}</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl min-w-[80px]">
                                    <span className="block text-[10px] text-white/50 uppercase">Tempo</span>
                                    <span className="text-xl font-black text-energia">{formatTime(finalTime)}</span>
                                </div>
                            </div>
                        )}

                        {!didWin && !isSaving && <p className="text-eden-100 mb-6">A chave era: <span className="font-black text-energia">{word}</span></p>}
                        
                        <div className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 mb-6">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase mb-3 text-left">Ranking do Dia</h3>
                            {rankings.map((r, i) => (
                                <div key={i} className={`flex justify-between p-2 rounded-lg mb-1 ${r.userId === currentUser?.uid ? 'bg-energia/20 text-energia' : 'bg-black/40 text-eden-100'}`}>
                                    <span className="font-bold text-sm truncate max-w-[150px]">{i+1}º {r.playerName}</span>
                                    <span className="text-xs font-bold text-right">
                                        {r.won === false ? <span className="text-red-400">FALHOU</span> : `${r.attempts} tent.`} | {formatTime(r.timeTaken)}
                                    </span>
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