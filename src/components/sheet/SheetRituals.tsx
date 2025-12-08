import { useState } from 'react';
import { Search, Plus, X, Flame, Skull, Eye, Zap, Ghost, Trash2, GraduationCap, CheckSquare, Square, Info } from 'lucide-react';
import type { CharacterSheet } from '../../types/characterSchema';
import { RITUALS } from '../../data/referenceData';
import type { RitualBase } from '../../data/referenceData';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

const ELEMENTS: Record<string, { label: string, icon: any, color: string, border: string, bg: string }> = {
  conhecimento: { label: 'Conhecimento', icon: Eye, color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10' },
  energia: { label: 'Energia', icon: Zap, color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-500/10' },
  morte: { label: 'Morte', icon: Skull, color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-500/10' },
  sangue: { label: 'Sangue', icon: Flame, color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-600/10' },
  medo: { label: 'Medo', icon: Ghost, color: 'text-white', border: 'border-white', bg: 'bg-white/10' },
};

export default function SheetRituals({ character, onUpdate }: Props) {
  const [filterElement, setFilterElement] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingRitual, setViewingRitual] = useState<RitualBase | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [castVersion, setCastVersion] = useState<'normal' | 'discente' | 'verdadeiro'>('normal');

  const peLimit = Math.ceil(character.progression.nex / 5);
  const dtRitual = 10 + peLimit + character.attributes.int;

  // Lógica de Sustentação
  const hasFluxo = character.rituals?.some((r: any) => r.id === 'fluxo_poder') || false; 
  const maxSustained = 1 + (hasFluxo ? 1 : 0); 
  const currentSustained = character.status.sustainedIds?.length || 0;

  const myRituals = character.rituals || [];

  const filteredMyRituals = myRituals.filter((r: RitualBase) => 
    (filterElement === 'all' || r.element === filterElement) &&
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const learnableRituals = RITUALS.filter(r => 
    !myRituals.some((mr: RitualBase) => mr.name === r.name) &&
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.element.includes(searchTerm.toLowerCase()))
  );

  const parseRitualVersion = (ritual: RitualBase, version: 'normal' | 'discente' | 'verdadeiro') => {
      const text = ritual[version] || '';
      if (!text && version !== 'normal') return null;

      let cost = ritual.circle; 
      const costMatch = text.match(/\+(\d+)\s*PE/);
      if (costMatch) cost += parseInt(costMatch[1]);

      let execution = ritual.execution;
      let range = ritual.range;
      let target = ritual.target;
      let duration = ritual.duration;

      if (text.toLowerCase().includes('muda a execução para')) {
          const match = text.match(/muda a execução para ([^.,]+)/i);
          if (match) execution = match[1];
      }
      if (text.toLowerCase().includes('muda o alcance para')) {
          const match = text.match(/muda o alcance para ([^.,]+)/i);
          if (match) range = match[1];
      }
      if (text.toLowerCase().includes('muda o alvo para') || text.toLowerCase().includes('muda a área para')) {
          const match = text.match(/muda (?:o alvo|a área) para ([^.,]+)/i);
          if (match) target = match[1];
      }
      if (text.toLowerCase().includes('muda a duração para')) {
          const match = text.match(/muda a duração para ([^.,]+)/i);
          if (match) duration = match[1];
      }
      if (text.toLowerCase().includes('sustentada')) duration = 'Sustentada';

      return { cost, execution, range, target, duration, text };
  };

  const parsedView = viewingRitual ? parseRitualVersion(viewingRitual, castVersion) : null;

  const handleCast = () => {
    if (!parsedView || !viewingRitual) return;
    
    if (character.status.pe.current < parsedView.cost) {
        alert("PE Insuficiente!");
        return;
    }

    onUpdate({
        status: {
            ...character.status,
            pe: { ...character.status.pe, current: character.status.pe.current - parsedView.cost }
        }
    });
    alert(`${viewingRitual.name} (${castVersion}) conjurado! -${parsedView.cost} PE`);
    setViewingRitual(null);
  };

  const toggleSustain = (id: string) => {
      const currentIds = character.status.sustainedIds || [];
      const isSustaining = currentIds.includes(id);
      let newSustained = [...currentIds];

      if (isSustaining) {
          newSustained = newSustained.filter(sid => sid !== id);
      } else {
          if (newSustained.length >= maxSustained) {
              alert(`Limite de sustentação atingido! (${maxSustained})`);
              return;
          }
          newSustained.push(id);
      }

      onUpdate({
          status: { ...character.status, sustainedIds: newSustained }
      });
  };

  const handleLearn = (ritual: RitualBase) => {
      const newRituals = [...myRituals, { ...ritual, cost: ritual.circle }];
      onUpdate({ rituals: newRituals });
      setIsLearning(false);
  };

  const removeRitual = (id: string) => {
      if(!confirm("Esquecer este ritual?")) return;
      onUpdate({ rituals: myRituals.filter((r: RitualBase) => r.id !== id) });
      setViewingRitual(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl shadow-sm">
         <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-start">
             <div className="flex-1 md:flex-none p-2 md:p-3 bg-eden-950 rounded-lg border border-eden-600 text-eden-100 min-w-[80px]">
                 <div className="text-[10px] uppercase font-bold text-eden-100/50 text-center">DT Ritual</div>
                 <div className="text-xl md:text-2xl font-black text-center leading-none">{dtRitual}</div>
             </div>
             <div className="flex-1 md:flex-none p-2 md:p-3 bg-eden-950 rounded-lg border border-eden-600 text-eden-100 min-w-[80px]">
                 <div className="text-[10px] uppercase font-bold text-eden-100/50 text-center">Sustentando</div>
                 <div className={`text-xl md:text-2xl font-black text-center leading-none ${currentSustained >= maxSustained ? 'text-red-500' : 'text-energia'}`}>
                     {currentSustained}/{maxSustained}
                 </div>
             </div>
         </div>

         <div className="flex-1 w-full relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/40 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Buscar ritual..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full bg-eden-950 border border-eden-600 rounded-lg py-2 pl-9 text-sm text-eden-100 outline-none focus:border-energia"
               style={{ colorScheme: 'dark' }}
             />
         </div>

         {/* Container de Filtros + Aprender (Separados no mobile para não esmagar) */}
         <div className="flex w-full md:w-auto gap-2 overflow-hidden">
             {/* Área de Scroll apenas para filtros */}
             <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar mask-right flex-1 md:flex-none">
                <button onClick={() => setFilterElement('all')} className={`px-3 py-1 rounded text-xs font-bold border whitespace-nowrap transition-all ${filterElement === 'all' ? 'bg-eden-100 text-eden-900 border-eden-100' : 'bg-eden-900 text-eden-100/50 border-eden-700'}`}>Todos</button>
                {Object.entries(ELEMENTS).map(([key, style]) => (
                    <button 
                      key={key}
                      onClick={() => setFilterElement(key)}
                      className={`w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1 rounded flex items-center justify-center gap-1 border shrink-0 transition-all ${filterElement === key ? `${style.bg} ${style.border} ${style.color} shadow-lg` : 'bg-eden-900 border-eden-700 text-eden-100/30 hover:border-eden-500'}`}
                      title={style.label}
                    >
                        <style.icon size={14} /> <span className="hidden md:inline text-xs font-bold">{style.label}</span>
                    </button>
                ))}
             </div>

             {/* Divisória e Botão Aprender FIXOS (não scrollam, não esmagam) */}
             <div className="flex items-center gap-2 shrink-0 border-l border-eden-700 pl-2">
                 <button onClick={() => { setIsLearning(true); setSearchTerm(''); }} className="px-3 py-1 rounded bg-energia text-eden-900 text-xs font-bold flex items-center gap-1 hover:bg-yellow-400 transition-colors shadow-lg whitespace-nowrap">
                     <Plus size={14}/> Aprender
                 </button>
             </div>
         </div>
      </div>

      {/* GRIMÓRIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredMyRituals.map((ritual: RitualBase) => {
              const style = ELEMENTS[ritual.element as keyof typeof ELEMENTS] || ELEMENTS.conhecimento;
              const isSustaining = character.status.sustainedIds?.includes(ritual.id);
              
              return (
                  <div 
                    key={ritual.id}
                    onClick={() => setViewingRitual(ritual)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group hover:-translate-y-1 hover:shadow-lg bg-eden-900/40 ${style.border} ${isSustaining ? 'bg-eden-900 ring-2 ring-energia' : 'hover:bg-eden-900'}`}
                  >
                      {/* Botão de Info */}
                      <button onClick={(e) => { e.stopPropagation(); setViewingRitual(ritual); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-eden-900/50 hover:bg-eden-700 text-eden-100/50 hover:text-white transition-colors z-20">
                          <Info size={16} />
                      </button>

                      <div className="cursor-pointer flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                  <div className={`p-1.5 md:p-2 rounded-lg ${style.bg} ${style.color}`}><style.icon size={18} /></div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${style.color}`}>{style.label}</span>
                              </div>
                              {isSustaining && <div className="absolute top-3 right-10 text-[9px] font-black text-energia uppercase tracking-widest animate-pulse flex items-center gap-1"><Zap size={10}/> Sustentando</div>}
                          </div>
                          
                          <h3 className="text-base md:text-lg font-bold text-eden-100 mb-1 leading-tight pr-8">{ritual.name}</h3>
                          <p className="text-[10px] md:text-xs text-eden-100/70 leading-relaxed mb-3 line-clamp-2">{ritual.description}</p>

                          <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-eden-100/50 uppercase font-mono mt-auto pt-2 border-t border-eden-100/5">
                              <div className="bg-eden-900/50 p-1 rounded px-2 truncate">Exec: <span className="text-eden-100">{ritual.execution}</span></div>
                              <div className="bg-eden-900/50 p-1 rounded px-2 truncate">Alcance: <span className="text-eden-100">{ritual.range}</span></div>
                              <div className="bg-eden-900/50 p-1 rounded px-2 truncate col-span-2">Alvo: <span className="text-eden-100">{ritual.target}</span></div>
                              <div className="bg-eden-900/50 p-1 rounded px-2 truncate col-span-2">Resistência: <span className="text-eden-100">{ritual.resistance}</span></div>
                          </div>
                      </div>
                  </div>
              )
          })}
          
          {filteredMyRituals.length === 0 && !isLearning && (
              <div className="col-span-full text-center py-12 text-eden-100/20 border-2 border-dashed border-eden-800 rounded-xl">
                  Nenhum ritual encontrado neste grimório.
              </div>
          )}
      </div>

      {/* MODAL APRENDER */}
      {isLearning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                <div className="p-4 md:p-6 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-eden-100 flex items-center gap-2">
                            <GraduationCap className="text-energia w-5 h-5 md:w-6 md:h-6"/> Aprender Ritual
                        </h3>
                    </div>
                    <button onClick={() => setIsLearning(false)}><X size={24} className="text-eden-100/50 hover:text-white"/></button>
                </div>
                
                <div className="p-3 md:p-4 border-b border-eden-700 bg-eden-950/50">
                    <input 
                        type="text" 
                        placeholder="Buscar na base de dados..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-eden-950 border border-eden-600 rounded-lg p-2 md:p-3 text-sm text-eden-100 outline-none focus:border-energia"
                        autoFocus
                        style={{ colorScheme: 'dark' }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learnableRituals.map(ritual => {
                        const style = ELEMENTS[ritual.element as keyof typeof ELEMENTS];
                        return (
                            <div key={ritual.id} className={`flex justify-between items-center p-2 md:p-3 rounded-lg border bg-eden-900/50 ${style.border}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 md:p-2 rounded bg-black/30 ${style.color}`}><style.icon size={16}/></div>
                                    <div className="min-w-0">
                                        <div className={`font-bold text-sm truncate ${style.color}`}>{ritual.name}</div>
                                        <div className="text-[10px] text-eden-100/40 uppercase">{ritual.circle}º Círculo • {ritual.execution}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLearn(ritual)}
                                    className="px-2 py-1 md:px-3 md:py-1.5 bg-eden-100 text-eden-900 text-[10px] md:text-xs font-bold rounded hover:bg-white transition-all shadow-md shrink-0"
                                >
                                    Aprender
                                </button>
                            </div>
                        )
                    })}
                    {learnableRituals.length === 0 && <div className="col-span-full text-center text-eden-100/30 py-10">Nenhum ritual encontrado.</div>}
                </div>
            </div>
        </div>
      )}

      {/* MODAL CONJURAR / VISUALIZAR (CORRIGIDO PARA MOBILE) */}
      {viewingRitual && parsedView && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
             <div className={`bg-eden-900 border-2 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].border}`}>
                
                <div className={`p-4 md:p-6 border-b flex justify-between items-start bg-black/20`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/40 ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].color}`}>
                                {viewingRitual.element} • {viewingRitual.circle}º Círculo
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-eden-100">{viewingRitual.name}</h3>
                    </div>
                    <button onClick={() => setViewingRitual(null)} className="p-1 md:p-2 hover:bg-black/20 rounded-full text-eden-100 transition-colors"><X size={24} /></button>
                </div>

                {/* CORREÇÃO: Grid 2x2 no mobile para evitar estouro de texto, 4x1 no Desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-eden-700 border-b border-eden-700 text-center text-[10px] uppercase font-bold text-eden-100/60">
                    <div className="bg-eden-950 p-2 md:p-3 flex flex-col"><span>Execução</span><span className="text-eden-100 text-xs">{parsedView.execution}</span></div>
                    <div className="bg-eden-950 p-2 md:p-3 flex flex-col"><span>Alcance</span><span className="text-eden-100 text-xs">{parsedView.range}</span></div>
                    <div className="bg-eden-950 p-2 md:p-3 flex flex-col"><span>Alvo</span><span className="text-eden-100 text-xs truncate px-1">{parsedView.target}</span></div>
                    <div className="bg-eden-950 p-2 md:p-3 flex flex-col"><span>Duração</span><span className="text-eden-100 text-xs">{parsedView.duration}</span></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 md:space-y-6 relative">
                    
                    {/* Botões de Versão */}
                    <div className="flex p-1 bg-eden-950 rounded-lg mb-2 sticky top-0 z-10 shadow-md border border-eden-700">
                        {(['normal', 'discente', 'verdadeiro'] as const).map(v => {
                            if (!viewingRitual[v] && v !== 'normal') return null;
                            return (
                                <button
                                    key={v}
                                    onClick={() => setCastVersion(v)}
                                    className={`flex-1 py-1.5 md:py-1.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all ${castVersion === v ? 'bg-eden-700 text-white shadow-sm' : 'text-eden-100/40 hover:text-eden-100'}`}
                                >
                                    {v}
                                </button>
                            )
                        })}
                    </div>

                    <div className="text-xs md:text-sm text-eden-100/90 leading-relaxed whitespace-pre-line bg-eden-800/50 p-3 md:p-4 rounded-xl border border-eden-700/50">
                        {parsedView.text || "Descrição não disponível."}
                    </div>

                    {/* Checkbox de Sustentação */}
                    {(parsedView.duration.toLowerCase().includes('sustentada') || viewingRitual.duration.toLowerCase().includes('sustentada')) && (
                        <div className="flex items-center justify-center mt-2">
                            <button 
                                onClick={() => toggleSustain(viewingRitual.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${character.status.sustainedIds?.includes(viewingRitual.id) ? 'bg-energia/20 border-energia text-energia shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-eden-950 border-eden-700 text-eden-100/50 hover:border-eden-500'}`}
                            >
                                {character.status.sustainedIds?.includes(viewingRitual.id) ? <CheckSquare size={16}/> : <Square size={16}/>}
                                <span className="text-xs md:text-sm font-bold">Manter Sustentado (-1 PE/turno)</span>
                            </button>
                        </div>
                    )}
                    
                    <div className="text-[10px] text-eden-100/40 text-center italic mt-2">
                        Resistência: {viewingRitual.resistance}
                    </div>
                </div>

                {/* CORREÇÃO: Footer com flex-col-reverse no Mobile para dar prioridade ao Conjurar */}
                <div className="p-4 border-t border-eden-700 bg-eden-950/50 flex flex-col-reverse md:flex-row justify-between items-center gap-3 md:gap-4">
                    <button 
                        onClick={() => removeRitual(viewingRitual.id)}
                        className="text-xs text-red-500/50 hover:text-red-500 flex items-center justify-center gap-1 px-3 py-2 rounded hover:bg-red-950/30 transition-colors w-full md:w-auto"
                    >
                        <Trash2 size={14}/> <span>Esquecer Ritual</span>
                    </button>

                    <button 
                        onClick={handleCast}
                        className={`
                            w-full md:flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95
                            ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].bg} 
                            ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].color}
                            ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].border}
                            border
                        `}
                    >
                        <Zap size={16} fill="currentColor" /> 
                        CONJURAR ({parsedView.cost} PE)
                    </button>
                </div>

             </div>
        </div>
      )}
    </div>
  );
}