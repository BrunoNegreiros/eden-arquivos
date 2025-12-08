import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { ORIGINS } from '../../data/origins';
import type { Origin } from '../../data/origins';
import { Search, BookOpen, Award, X, ChevronRight } from 'lucide-react';

export default function Step3Origins() {
  const { character, updateProgression } = useCharacter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(
    ORIGINS.find(o => o.name === character.progression.origin.name) || null
  );

  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const filteredOrigins = ORIGINS.filter(origin => 
    origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    origin.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    origin.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (origin: Origin) => {
    setSelectedOrigin(origin);
    updateProgression('origin', { id: origin.id, name: origin.name });
    if (window.innerWidth < 1024) {
        setShowMobileDetails(true);
    }
  };

  const getSourceStyle = (source: string) => {
    if (source.includes('Livro')) return 'bg-red-500/10 text-red-300 border-red-500/30';
    if (source.includes('Sobrevivendo')) return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    if (source.includes('HQ')) return 'bg-green-500/10 text-green-300 border-green-500/30';
    return 'bg-eden-800 text-eden-100 border-eden-700';
  };

  const OriginDetailsContent = ({ origin }: { origin: Origin }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-black text-eden-100 leading-none mb-3">
                {origin.name}
            </h3>
            
            <span className={`inline-block mb-4 text-[10px] px-3 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getSourceStyle(origin.source)}`}>
                {origin.source.replace('Livro de Regras', 'Livro').replace('Sobrevivendo ao Horror', 'SaH')}
            </span>

            <p className="text-eden-100/80 leading-relaxed text-sm md:text-lg border-l-2 border-energia/50 pl-4 italic text-left">
                "{origin.description}"
            </p>
        </div>

        <div className="space-y-4">
            <div className="p-4 md:p-5 bg-eden-900/50 rounded-xl border border-eden-700/50">
                <h4 className="flex items-center gap-2 text-xs md:text-sm font-bold text-conhecimento uppercase tracking-wider mb-3">
                    <BookOpen size={18} /> Perícias Treinadas
                </h4>
                <div className="flex flex-wrap gap-2">
                    {origin.skills.length > 0 ? origin.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-eden-800 text-eden-100 text-xs md:text-sm font-medium border border-eden-700 shadow-sm">
                            {skill}
                        </span>
                    )) : (
                        <span className="text-eden-100/50 italic text-xs">À escolha do jogador.</span>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-5 bg-eden-900/50 rounded-xl border border-eden-700/50">
                <h4 className="flex items-center gap-2 text-xs md:text-sm font-bold text-sangue uppercase tracking-wider mb-3">
                    <Award size={18} /> Poder: {origin.power.name}
                </h4>
                <p className="text-xs md:text-sm text-eden-100/80 leading-relaxed">
                    {origin.power.description}
                </p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      <div className="text-center space-y-1 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Origem</h2>
        <p className="text-xs md:text-base text-eden-100/50">O que você fazia antes de encarar o Paranormal?</p>
      </div>

      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-eden-100/40 w-4 h-4 md:w-5 md:h-5" />
        <input 
          type="text" 
          placeholder="Buscar origem, perícia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-eden-800 border border-eden-700 rounded-xl py-3 pl-10 md:pl-12 pr-4 text-sm md:text-base text-eden-100 focus:border-eden-100 focus:ring-1 focus:ring-eden-100 outline-none transition-all placeholder:text-eden-100/30"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start relative">
        
        {/* ESQUERDA: LISTA (Cresce naturalmente com a página) */}
        <div className="w-full lg:w-1/2 space-y-3">
          {filteredOrigins.map((origin) => (
            <button
              key={origin.id}
              onClick={() => handleSelect(origin)}
              className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden flex flex-col gap-1 ${
                selectedOrigin?.id === origin.id
                  ? 'bg-eden-800 border-energia shadow-lg z-10 ring-1 ring-energia/50'
                  : 'bg-eden-800/30 border-eden-700 hover:border-eden-600 hover:bg-eden-800'
              }`}
            >
              <div className="flex justify-between items-center w-full relative z-10">
                 <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <h3 className={`font-bold text-base md:text-lg leading-tight truncate ${selectedOrigin?.id === origin.id ? 'text-energia' : 'text-eden-100'}`}>
                      {origin.name}
                    </h3>
                    {selectedOrigin?.id === origin.id && (
                      <div className="hidden lg:block w-2 h-2 rounded-full bg-energia animate-pulse shadow-[0_0_8px_#7c3aed] shrink-0" />
                    )}
                 </div>
                 <span className={`ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${getSourceStyle(origin.source)}`}>
                    {origin.source.replace('Livro de Regras', 'Livro').replace('Sobrevivendo ao Horror', 'SaH')}
                 </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 relative z-10 opacity-80">
                {origin.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-eden-900/50 border border-eden-700/50 text-eden-100/60">
                    {skill}
                  </span>
                ))}
                {origin.skills.length > 3 && <span className="text-[10px] text-eden-100/40 px-1 self-center">...</span>}
              </div>
              <div className="lg:hidden absolute top-1/2 -translate-y-1/2 right-2 opacity-10"><ChevronRight size={24} /></div>
            </button>
          ))}
          
          {filteredOrigins.length === 0 && (
            <div className="text-center p-8 text-eden-100/30 italic border border-dashed border-eden-800 rounded-xl text-sm">
              Nenhuma origem encontrada.
            </div>
          )}
        </div>

        {/* DIREITA: DETALHES (STICKY - Acompanha o scroll) */}
        {/* sticky top-4 faz ele grudar no topo da janela enquanto o pai (flex-row) tiver altura */}
        <div className="hidden lg:block w-1/2 sticky top-4 self-start">
          <div className={`rounded-2xl border transition-all duration-500 relative overflow-hidden flex flex-col ${
             selectedOrigin 
               ? 'bg-eden-800 border-eden-600 shadow-2xl' 
               : 'bg-eden-800/10 border-eden-700/30 border-dashed items-center justify-center min-h-[300px]'
          }`}>
            {selectedOrigin ? (
              <div className="p-8">
                <OriginDetailsContent origin={selectedOrigin} />
              </div>
            ) : (
              <div className="text-center text-eden-100/20">
                <Search size={64} className="mx-auto mb-6 opacity-30" />
                <p className="text-xl font-light">Selecione uma origem</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View (Modal Centralizado) */}
        {showMobileDetails && selectedOrigin && (
            <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-eden-900 border border-eden-600 w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 overflow-hidden">
                    <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800/80 backdrop-blur-md shrink-0">
                        <span className="text-xs font-bold text-eden-100/50 uppercase tracking-widest">Detalhes da Origem</span>
                        <button onClick={() => setShowMobileDetails(false)} className="p-1 bg-eden-950 rounded-full text-eden-100 border border-eden-700"><X size={16}/></button>
                    </div>
                    <div className="p-5 overflow-y-auto custom-scrollbar">
                        <OriginDetailsContent origin={selectedOrigin} />
                    </div>
                    <div className="p-4 border-t border-eden-700 bg-eden-900 shrink-0">
                        <button onClick={() => setShowMobileDetails(false)} className="w-full py-3 bg-energia text-eden-900 font-black rounded-xl shadow-lg hover:bg-yellow-400 transition-colors">
                            CONFIRMAR ESCOLHA
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}