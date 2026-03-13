import { useState, useEffect } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { Lightbulb, Shield, User as UserIcon, Plus, Trash2, ShieldAlert, Sparkles, Footprints, Target, X, Lock } from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export default function SheetDicas({ isMestre }: { isMestre: boolean }) {
    const { character, updateCharacter } = useCharacter();
    const [mode, setMode] = useState<'select' | 'jogador' | 'mestre'>('select');

    
    useEffect(() => {
        if (!(character as any).dicas) {
            updateCharacter(prev => ({
                ...prev,
                dicas: {
                    equipments: [],
                    powers: [],
                    combatStyles: [],
                    nextSteps: [
                        { id: '1', condition: 'Quero aumentar meu dano.', description: '' },
                        { id: '2', condition: 'Quero durar mais no combate.', description: '' },
                        { id: '3', condition: 'Quero ser mais versátil.', description: '' }
                    ]
                }
            }));
        }
    }, []);

    const dicas = (character as any).dicas || { equipments: [], powers: [], combatStyles: [], nextSteps: [] };

    const updateDicaSection = (section: string, data: any) => {
        updateCharacter(prev => ({
            ...prev,
            dicas: { ...((prev as any).dicas || {}), [section]: data }
        }));
    };

    const handleSelectMode = (selected: 'jogador' | 'mestre') => {
        if (selected === 'mestre' && !isMestre) {
            alert("Acesso Negado: Apenas o Mestre conectado nesta mesa tem permissão para editar as dicas táticas desta ficha.");
            return;
        }
        setMode(selected);
    };

    
    if (mode === 'select') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95">
                <Lightbulb size={64} className="text-energia mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Dicas Táticas</h2>
                <p className="text-eden-100/50 mb-10 max-w-md text-center">Uma área dedicada para anotações e estratégias recomendadas pelo mestre da campanha.</p>
                
                <h3 className="text-sm font-bold text-eden-100 uppercase tracking-widest mb-4">Quem está acessando?</h3>
                <div className="flex gap-4 w-full max-w-md">
                    <button onClick={() => handleSelectMode('jogador')} className="flex-1 flex flex-col items-center gap-3 bg-eden-800 border border-eden-600 hover:border-cyan-400 p-6 rounded-2xl transition-all hover:-translate-y-1 shadow-lg group">
                        <UserIcon size={32} className="text-eden-100/50 group-hover:text-cyan-400" />
                        <span className="font-black text-white uppercase tracking-widest group-hover:text-cyan-400">JOGADOR</span>
                        <span className="text-[10px] text-eden-100/40 text-center">Modo Leitura. Consultar estratégias.</span>
                    </button>
                    
                    <button onClick={() => handleSelectMode('mestre')} className="flex-1 flex flex-col items-center gap-3 bg-red-950/30 border border-red-900/50 hover:border-red-500 p-6 rounded-2xl transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden">
                        {!isMestre && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><LockIcon /></div>}
                        <Shield size={32} className="text-red-500/50 group-hover:text-red-500" />
                        <span className="font-black text-red-200 uppercase tracking-widest group-hover:text-red-400">MESTRE</span>
                        <span className="text-[10px] text-red-200/40 text-center">Modo Edição. Escrever táticas.</span>
                    </button>
                </div>
            </div>
        );
    }

    const isEdit = mode === 'mestre';

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 shadow-lg sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className={`text-xl font-black flex items-center gap-2 ${isEdit ? 'text-red-400' : 'text-cyan-400'}`}>
                        {isEdit ? <Shield/> : <Lightbulb/>} 
                        Dicas Táticas {isEdit && '(MODO MESTRE)'}
                    </h2>
                    <p className="text-[10px] uppercase text-eden-100/50 font-bold mt-1">
                        {isEdit ? 'Adicione orientações para ajudar o jogador.' : 'Estratégias recomendadas pelo seu mestre.'}
                    </p>
                </div>
                <button onClick={() => setMode('select')} className="text-xs font-bold text-eden-100/50 hover:text-white border border-eden-700 px-3 py-1.5 rounded-lg transition-colors">TROCAR MODO</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {}
                <div className="bg-eden-950/50 border border-eden-700/50 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-eden-700 pb-2">
                        <h3 className="font-bold text-white uppercase tracking-widest flex items-center gap-2 text-sm"><Target size={16} className="text-energia"/> Usando Equipamentos</h3>
                        {isEdit && (
                            <button onClick={() => updateDicaSection('equipments', [...dicas.equipments, { id: generateId(), itemId: '', situation: '', accuracy: '', damage: '', stealth: '' }])} className="text-energia hover:text-yellow-400 p-1 rounded"><Plus size={16}/></button>
                        )}
                    </div>
                    {dicas.equipments.length === 0 && <p className="text-xs text-eden-100/30 italic">Nenhuma dica de equipamento.</p>}
                    
                    {dicas.equipments.map((eq: any, idx: number) => (
                        <div key={eq.id} className="bg-eden-900 border border-eden-700 rounded-lg p-3 space-y-3 relative group">
                            {isEdit && <button onClick={() => updateDicaSection('equipments', dicas.equipments.filter((_:any, i:number) => i !== idx))} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>}
                            
                            {isEdit ? (
                                <select value={eq.itemId} onChange={e => { const n = [...dicas.equipments]; n[idx].itemId = e.target.value; updateDicaSection('equipments', n); }} className="w-full bg-eden-950 border border-eden-600 rounded p-2 text-xs text-white outline-none font-bold">
                                    <option value="">-- Selecione o Equipamento --</option>
                                    {character.inventory.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            ) : (
                                <h4 className="font-black text-energia">{character.inventory.find((i:any) => i.id === eq.itemId)?.name || 'Equipamento Desconhecido'}</h4>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-eden-100/50 uppercase">Situação Recomendada</label>
                                {isEdit ? <input type="text" value={eq.situation} onChange={e => { const n = [...dicas.equipments]; n[idx].situation = e.target.value; updateDicaSection('equipments', n); }} className="w-full bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white outline-none" placeholder="Ex: Quando os inimigos estiverem agrupados"/>
                                : <p className="text-xs text-eden-100">{eq.situation || '-'}</p>}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black/30 p-2 rounded border border-eden-800">
                                    <label className="text-[9px] font-bold text-eden-100/40 uppercase block mb-1">Acerto</label>
                                    {isEdit ? <input type="text" value={eq.accuracy} onChange={e => { const n = [...dicas.equipments]; n[idx].accuracy = e.target.value; updateDicaSection('equipments', n); }} className="w-full bg-transparent text-xs text-white outline-none" placeholder="Ex: Muito Alto"/> : <span className="text-xs text-white font-bold">{eq.accuracy || '-'}</span>}
                                </div>
                                <div className="bg-black/30 p-2 rounded border border-eden-800">
                                    <label className="text-[9px] font-bold text-eden-100/40 uppercase block mb-1">Dano</label>
                                    {isEdit ? <input type="text" value={eq.damage} onChange={e => { const n = [...dicas.equipments]; n[idx].damage = e.target.value; updateDicaSection('equipments', n); }} className="w-full bg-transparent text-xs text-white outline-none" placeholder="Ex: Baixo"/> : <span className="text-xs text-white font-bold">{eq.damage || '-'}</span>}
                                </div>
                                <div className="bg-black/30 p-2 rounded border border-eden-800">
                                    <label className="text-[9px] font-bold text-eden-100/40 uppercase block mb-1">Furtividade</label>
                                    {isEdit ? <input type="text" value={eq.stealth} onChange={e => { const n = [...dicas.equipments]; n[idx].stealth = e.target.value; updateDicaSection('equipments', n); }} className="w-full bg-transparent text-xs text-white outline-none" placeholder="Ex: Silencioso"/> : <span className="text-xs text-white font-bold">{eq.stealth || '-'}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {}
                <div className="bg-eden-950/50 border border-eden-700/50 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-eden-700 pb-2">
                        <h3 className="font-bold text-white uppercase tracking-widest flex items-center gap-2 text-sm"><Sparkles size={16} className="text-purple-400"/> Usando Poderes</h3>
                        {isEdit && (
                            <button onClick={() => updateDicaSection('powers', [...dicas.powers, { id: generateId(), powerId: '', situation: '', customFields: [] }])} className="text-purple-400 hover:text-purple-300 p-1 rounded"><Plus size={16}/></button>
                        )}
                    </div>
                    {dicas.powers.length === 0 && <p className="text-xs text-eden-100/30 italic">Nenhuma dica de poder.</p>}

                    {dicas.powers.map((pw: any, idx: number) => {
                        const allPowers = [...(character.abilities||[]), ...(character.classPowers||[]), ...(character.rituals||[])];
                        return (
                        <div key={pw.id} className="bg-eden-900 border border-eden-700 rounded-lg p-3 space-y-3 relative group">
                            {isEdit && <button onClick={() => updateDicaSection('powers', dicas.powers.filter((_:any, i:number) => i !== idx))} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>}
                            
                            {isEdit ? (
                                <select value={pw.powerId} onChange={e => { const n = [...dicas.powers]; n[idx].powerId = e.target.value; updateDicaSection('powers', n); }} className="w-full bg-eden-950 border border-eden-600 rounded p-2 text-xs text-white outline-none font-bold">
                                    <option value="">-- Selecione Habilidade/Ritual --</option>
                                    {allPowers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            ) : (
                                <h4 className="font-black text-purple-400">{allPowers.find((p:any) => p.id === pw.powerId)?.name || 'Poder Desconhecido'}</h4>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-eden-100/50 uppercase">Situação Recomendada</label>
                                {isEdit ? <input type="text" value={pw.situation} onChange={e => { const n = [...dicas.powers]; n[idx].situation = e.target.value; updateDicaSection('powers', n); }} className="w-full bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white outline-none" placeholder="Ex: Para iniciar o combate..."/>
                                : <p className="text-xs text-eden-100">{pw.situation || '-'}</p>}
                            </div>

                            {}
                            {(pw.customFields || []).map((cf: any, cIdx: number) => (
                                <div key={cf.id} className="bg-black/30 p-2 rounded border border-eden-800 relative">
                                    {isEdit && <button onClick={() => { const n = [...dicas.powers]; n[idx].customFields.splice(cIdx,1); updateDicaSection('powers', n); }} className="absolute top-1 right-1 text-red-500/50 hover:text-red-400"><X size={12}/></button>}
                                    {isEdit ? <input type="text" value={cf.title} onChange={e => { const n = [...dicas.powers]; n[idx].customFields[cIdx].title = e.target.value; updateDicaSection('powers', n); }} className="bg-transparent text-[9px] font-bold text-eden-100/40 uppercase outline-none mb-1 w-full" placeholder="NOME DO CAMPO"/> : <label className="text-[9px] font-bold text-eden-100/40 uppercase block mb-1">{cf.title}</label>}
                                    {isEdit ? <input type="text" value={cf.text} onChange={e => { const n = [...dicas.powers]; n[idx].customFields[cIdx].text = e.target.value; updateDicaSection('powers', n); }} className="w-full bg-transparent text-xs text-white outline-none" placeholder="Descrição..."/> : <span className="text-xs text-white font-bold">{cf.text || '-'}</span>}
                                </div>
                            ))}

                            {isEdit && (
                                <button onClick={() => { const n = [...dicas.powers]; if(!n[idx].customFields) n[idx].customFields = []; n[idx].customFields.push({id: generateId(), title: 'Novo Campo', text: ''}); updateDicaSection('powers', n); }} className="text-[10px] uppercase font-bold text-purple-400 bg-purple-900/20 px-2 py-1 rounded w-full border border-purple-500/30 hover:bg-purple-900/40">+ Campo Personalizado</button>
                            )}
                        </div>
                    )})}
                </div>

                {}
                <div className="bg-eden-950/50 border border-eden-700/50 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-eden-700 pb-2">
                        <h3 className="font-bold text-white uppercase tracking-widest flex items-center gap-2 text-sm"><ShieldAlert size={16} className="text-red-400"/> Estilos de Combate</h3>
                        {isEdit && <button onClick={() => updateDicaSection('combatStyles', [...dicas.combatStyles, { id: generateId(), condition: 'Condição...', description: 'Faça...' }])} className="text-red-400 hover:text-red-300 p-1 rounded"><Plus size={16}/></button>}
                    </div>
                    
                    <div className="grid gap-3">
                        {dicas.combatStyles.map((cs: any, idx: number) => (
                            <div key={cs.id} className="bg-eden-900 border-l-2 border-red-500 p-3 rounded-r-lg relative group">
                                {isEdit && <button onClick={() => updateDicaSection('combatStyles', dicas.combatStyles.filter((_:any, i:number) => i !== idx))} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>}
                                {isEdit ? <input type="text" value={cs.condition} onChange={e => { const n = [...dicas.combatStyles]; n[idx].condition = e.target.value; updateDicaSection('combatStyles', n); }} className="w-[90%] bg-transparent font-black text-red-400 text-sm outline-none mb-1" placeholder="Condição (Ex: Quando a vida cair)"/> : <h4 className="font-black text-red-400 text-sm mb-1">{cs.condition}</h4>}
                                {isEdit ? <textarea value={cs.description} onChange={e => { const n = [...dicas.combatStyles]; n[idx].description = e.target.value; updateDicaSection('combatStyles', n); }} className="w-full bg-eden-950 rounded p-2 text-xs text-white outline-none resize-none" placeholder="O que fazer?"/> : <p className="text-xs text-eden-100/80">{cs.description}</p>}
                            </div>
                        ))}
                        {dicas.combatStyles.length === 0 && <p className="text-xs text-eden-100/30 italic">Nenhum estilo definido.</p>}
                    </div>
                </div>

                {}
                <div className="bg-eden-950/50 border border-eden-700/50 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-eden-700 pb-2">
                        <h3 className="font-bold text-white uppercase tracking-widest flex items-center gap-2 text-sm"><Footprints size={16} className="text-green-400"/> Próximos Passos</h3>
                        {isEdit && <button onClick={() => updateDicaSection('nextSteps', [...dicas.nextSteps, { id: generateId(), condition: 'Novo Objetivo...', description: '' }])} className="text-green-400 hover:text-green-300 p-1 rounded"><Plus size={16}/></button>}
                    </div>
                    
                    <div className="grid gap-3">
                        {dicas.nextSteps.map((ns: any, idx: number) => (
                            <div key={ns.id} className="bg-eden-900 border-l-2 border-green-500 p-3 rounded-r-lg relative group">
                                {isEdit && <button onClick={() => updateDicaSection('nextSteps', dicas.nextSteps.filter((_:any, i:number) => i !== idx))} className="absolute top-2 right-2 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>}
                                {isEdit ? <input type="text" value={ns.condition} onChange={e => { const n = [...dicas.nextSteps]; n[idx].condition = e.target.value; updateDicaSection('nextSteps', n); }} className="w-[90%] bg-transparent font-black text-green-400 text-sm outline-none mb-1" placeholder="Ex: Quero mais dano"/> : <h4 className="font-black text-green-400 text-sm mb-1">{ns.condition}</h4>}
                                {isEdit ? <textarea value={ns.description} onChange={e => { const n = [...dicas.nextSteps]; n[idx].description = e.target.value; updateDicaSection('nextSteps', n); }} className="w-full bg-eden-950 rounded p-2 text-xs text-white outline-none resize-none" placeholder="O que o jogador deve focar em pegar ao subir de nível?"/> : <p className="text-xs text-eden-100/80">{ns.description || <span className="text-eden-100/30 italic">Sem resposta do mestre ainda...</span>}</p>}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}


function LockIcon() {
    return <Lock size={48} className="text-red-500 opacity-80" />;
}