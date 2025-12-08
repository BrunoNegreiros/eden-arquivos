import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { RITUALS } from '../../data/referenceData';
import type { RitualBase } from '../../data/referenceData';
import { Flame, Skull, Eye, Zap, Ghost, Check, AlertCircle, BookOpen, Info, X, Search } from 'lucide-react';

const ELEMENTS = {
  conhecimento: { label: 'Conhecimento', icon: Eye, color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10' },
  energia: { label: 'Energia', icon: Zap, color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-500/10' },
  morte: { label: 'Morte', icon: Skull, color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-500/10' },
  sangue: { label: 'Sangue', icon: Flame, color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-600/10' },
  medo: { label: 'Medo', icon: Ghost, color: 'text-white', border: 'border-white', bg: 'bg-white/10' },
};

export default function Step7Rituals() {
  const { character, updateProgression } = useCharacter();
  const [filterElement, setFilterElement] = useState<keyof typeof ELEMENTS | 'all'>('all');
  const [viewingRitual, setViewingRitual] = useState<RitualBase | null>(null);
  
  // Estado para controle de abas no Mobile
  const [mobileTab, setMobileTab] = useState<'catalog' | 'grimoire'>('catalog');

  const isOcultista = character.progression.class === 'ocultista';
  const maxRituals = isOcultista ? 3 : 0;
  const eligibleCircle = 1;
  const selectedRituals = character.rituals;

  const handleToggleRitual = (ritual: RitualBase) => {
    const isSelected = selectedRituals.some(r => r.id === ritual.id);
    if (isSelected) {
      // Remover
      character.rituals = selectedRituals.filter(r => r.id !== ritual.id);
      updateProgression('nex', character.progression.nex); // Force Render
    } else {
      // Adicionar
      if (selectedRituals.length >= maxRituals) return;
      
      // Salvar objeto completo
      character.rituals.push({
        ...ritual,
        cost: ritual.circle
      });
      updateProgression('nex', character.progression.nex);
    }
  };

  const filteredRituals = RITUALS.filter(r => 
    r.circle === eligibleCircle && (filterElement === 'all' || r.element === filterElement)
  );

  // Se não for Ocultista, mostra aviso e bloqueia (sem responsividade complexa necessária)
  if (!isOcultista) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-8 duration-500 text-center p-4 md:p-8">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-eden-800 rounded-full flex items-center justify-center mb-4 md:mb-6 border-2 border-eden-700">
          <BookOpen size={48} className="text-eden-100/20 md:w-16 md:h-16" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100 mb-2 md:mb-4">Mente Mundana</h2>
        <p className="text-eden-100/50 max-w-md text-sm md:text-lg leading-relaxed">
          Apenas <strong>Ocultistas</strong> iniciam com o conhecimento necessário para conjurar rituais no NEX 5%.
        </p>
        <div className="mt-6 md:mt-10 p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 md:gap-4 text-yellow-200 text-left max-w-md text-xs md:text-sm">
          <AlertCircle size={24} className="shrink-0" />
          <span>Você pode prosseguir para o próximo passo sem escolher rituais.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-right-8 duration-500 pb-4">
      
      {/* Cabeçalho */}
      <div className="shrink-0 space-y-3 text-center">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Grimório</h2>
            <p className="text-xs md:text-base text-eden-100/50">
              Escolha <strong className={selectedRituals.length === maxRituals ? "text-energia" : "text-white"}>{selectedRituals.length} / {maxRituals}</strong> rituais de 1º Círculo.
            </p>
        </div>

        {/* Filtros */}
        <div className="flex justify-center gap-2 flex-wrap">
            <button onClick={() => setFilterElement('all')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterElement === 'all' ? 'bg-eden-100 text-eden-900 border-eden-100' : 'bg-eden-800 text-eden-100/50 border-eden-700 hover:border-eden-500'}`}>Todos</button>
            {(Object.entries(ELEMENTS) as [string, typeof ELEMENTS['sangue']][]).map(([key, style]) => {
            if (key === 'medo') return null;
            return (
                <button key={key} onClick={() => setFilterElement(key as any)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterElement === key ? `${style.bg} ${style.color} ${style.border}` : `bg-eden-800 text-eden-100/50 border-eden-700 hover:border-eden-500`}`}>
                <style.icon size={12} /> {style.label}
                </button>
            );
            })}
        </div>
      </div>

      {/* BARRA DE ABAS MOBILE */}
      <div className="flex bg-eden-800 p-1 rounded-lg border border-eden-700 lg:hidden shrink-0">
          <button 
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'catalog' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50'}`}
          >
              <Search size={14}/> Catálogo
          </button>
          <button 
            onClick={() => setMobileTab('grimoire')}
            className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'grimoire' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50'}`}
          >
              <BookOpen size={14}/> Meus Rituais ({selectedRituals.length})
          </button>
      </div>

      {/* CONTEÚDO PRINCIPAL (Grid Responsivo com Abas) */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
          
          {/* LISTA DE RITUAIS (Lógica de Filtro para Abas) */}
          <div className="h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* No Mobile, filtra pela aba. No Desktop, mostra tudo (mas destaca os selecionados) */}
                {(window.innerWidth < 1024 && mobileTab === 'grimoire' ? selectedRituals : filteredRituals).map(ritual => {
                    
                    // Se estiver na aba Grimório, só mostra os selecionados
                    // Se estiver na aba Catálogo, mostra todos (com indicação de seleção)
                    
                    const isSelected = selectedRituals.some(r => r.id === ritual.id);
                    const style = ELEMENTS[ritual.element as keyof typeof ELEMENTS];

                    return (
                        <div 
                            key={ritual.id} 
                            onClick={() => handleToggleRitual(ritual)}
                            className={`
                                relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 group flex flex-col cursor-pointer
                                ${isSelected ? `bg-eden-800 ${style.border} shadow-lg` : 'bg-eden-800/30 border-eden-700/50 hover:border-eden-500 hover:bg-eden-800'}
                            `}
                        >
                            {/* Botão de Info */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setViewingRitual(ritual); }} 
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-eden-900/50 hover:bg-eden-700 text-eden-100/50 hover:text-white transition-colors z-20"
                            >
                                <Info size={16} />
                            </button>

                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}><style.icon size={16} /></div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${style.color}`}>{style.label}</span>
                                </div>
                                {isSelected ? (
                                    <div className={`w-5 h-5 rounded-full ${style.bg} ${style.color} flex items-center justify-center border ${style.border} mr-8`}><Check size={12} strokeWidth={4} /></div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-eden-700 group-hover:border-eden-500 transition-colors mr-8" />
                                )}
                            </div>
                            
                            <h3 className="text-base md:text-lg font-bold text-eden-100 mb-1 leading-tight pr-8">{ritual.name}</h3>
                            <p className="text-[10px] md:text-xs text-eden-100/70 leading-relaxed mb-3 line-clamp-3">{ritual.description}</p>

                            <div className="grid grid-cols-2 gap-1.5 text-[9px] text-eden-100/50 uppercase font-mono mt-auto pt-2 border-t border-eden-100/5">
                                <div className="bg-eden-900/50 p-1 rounded px-2 truncate">Exec: <span className="text-eden-100">{ritual.execution}</span></div>
                                <div className="bg-eden-900/50 p-1 rounded px-2 truncate">Alcance: <span className="text-eden-100">{ritual.range}</span></div>
                                <div className="bg-eden-900/50 p-1 rounded px-2 truncate col-span-2">Alvo: <span className="text-eden-100">{ritual.target}</span></div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Mensagem de Vazio */}
                {window.innerWidth < 1024 && mobileTab === 'grimoire' && selectedRituals.length === 0 && (
                    <div className="col-span-full text-center py-10 text-eden-100/30 text-xs italic border-2 border-dashed border-eden-800 rounded-xl">
                        Nenhum ritual selecionado.
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* MODAL DE DETALHES DO RITUAL */}
      {viewingRitual && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
             <div className={`bg-eden-900 border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].border}`}>
                <div className={`p-4 md:p-6 border-b flex justify-between items-start ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].bg}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 ${ELEMENTS[viewingRitual.element as keyof typeof ELEMENTS].color}`}>
                                {viewingRitual.element} • {viewingRitual.circle}º Círculo
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-eden-100">{viewingRitual.name}</h3>
                    </div>
                    <button onClick={() => setViewingRitual(null)} className="p-1 hover:bg-black/20 rounded-full text-eden-100 transition-colors"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-4 gap-px bg-eden-700 border-b border-eden-700 text-center text-[8px] md:text-[10px] uppercase font-bold text-eden-100/60">
                    <div className="bg-eden-900 p-2 md:p-3 flex flex-col"><span>Execução</span><span className="text-eden-100 text-[10px] md:text-xs">{viewingRitual.execution}</span></div>
                    <div className="bg-eden-900 p-2 md:p-3 flex flex-col"><span>Alcance</span><span className="text-eden-100 text-[10px] md:text-xs">{viewingRitual.range}</span></div>
                    <div className="bg-eden-900 p-2 md:p-3 flex flex-col"><span>Alvo/Área</span><span className="text-eden-100 text-[10px] md:text-xs">{viewingRitual.target}</span></div>
                    <div className="bg-eden-900 p-2 md:p-3 flex flex-col"><span>Duração</span><span className="text-eden-100 text-[10px] md:text-xs">{viewingRitual.duration}</span></div>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar max-h-[60vh] space-y-4">
                    <div className="bg-eden-800/30 p-3 md:p-4 rounded-xl border border-eden-700/50">
                        <h4 className="text-xs md:text-sm font-bold text-eden-100 mb-1 border-b border-eden-700 pb-1">Efeito Normal</h4>
                        <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed whitespace-pre-line">{viewingRitual.normal}</p>
                    </div>

                    {viewingRitual.discente && (
                         <div className="bg-eden-800/30 p-3 md:p-4 rounded-xl border border-eden-700/50">
                            <h4 className="text-xs md:text-sm font-bold text-conhecimento mb-1 border-b border-conhecimento/20 pb-1 flex justify-between">
                                Discente 
                                <span className="text-[9px] bg-conhecimento/10 px-2 py-0.5 rounded opacity-70">Requer 2º Círculo</span>
                            </h4>
                            <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed whitespace-pre-line">{viewingRitual.discente}</p>
                        </div>
                    )}

                    {viewingRitual.verdadeiro && (
                        <div className="bg-eden-800/30 p-3 md:p-4 rounded-xl border border-eden-700/50">
                            <h4 className="text-xs md:text-sm font-bold text-energia mb-1 border-b border-energia/20 pb-1 flex justify-between">
                                Verdadeiro 
                                <span className="text-[9px] bg-energia/10 px-2 py-0.5 rounded opacity-70">Requer 3º Círculo</span>
                            </h4>
                            <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed whitespace-pre-line">{viewingRitual.verdadeiro}</p>
                        </div>
                    )}

                     <div className="text-[10px] text-eden-100/30 mt-2 text-center italic">
                        Resistência: {viewingRitual.resistance}
                     </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}