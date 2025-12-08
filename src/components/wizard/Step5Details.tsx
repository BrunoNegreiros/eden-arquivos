import { User, Scroll, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';

export default function Step5Details() {
  const { character, updateInfo } = useCharacter();
  const { info } = character;

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-4">
      
      <div className="text-center mb-2 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Detalhes</h2>
        <p className="text-xs md:text-base text-eden-100/50">Aparência, personalidade e história.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* COLUNA ESQUERDA: Foto e Identidade */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Card de Retrato */}
          <div className="bg-eden-800 border border-eden-700 rounded-2xl p-4 md:p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative w-32 h-32 md:w-48 md:h-48 mb-4 md:mb-6 group">
              {/* Moldura da Foto */}
              <div className="absolute inset-0 rounded-full border-2 border-eden-600 group-hover:border-energia transition-colors duration-300" />
              
              {/* A Foto em Si */}
              <div className="w-full h-full rounded-full overflow-hidden bg-eden-900 flex items-center justify-center relative">
                {info.portraitUrl ? (
                  <img 
                    src={info.portraitUrl} 
                    alt={info.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ''; 
                      updateInfo('portraitUrl', ''); 
                    }}
                  />
                ) : (
                  <User size={48} className="text-eden-700 md:w-16 md:h-16" />
                )}
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-eden-100 mb-1 truncate max-w-full">{info.name || 'Agente Desconhecido'}</h3>
            <p className="text-eden-100/50 text-[10px] md:text-sm uppercase tracking-wider mb-4">
              {character.progression.class} • {character.progression.origin.name}
            </p>

            {/* Input de URL da Imagem */}
            <div className="w-full space-y-2 text-left">
              <label className="text-[10px] md:text-xs font-bold text-eden-100/50 uppercase flex items-center gap-2">
                <ImageIcon size={12} /> URL da Imagem
              </label>
              <input
                type="text"
                value={info.portraitUrl}
                onChange={(e) => updateInfo('portraitUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-eden-900/50 border border-eden-700 rounded-lg px-3 py-2 text-xs md:text-sm text-eden-100 focus:border-energia focus:ring-1 focus:ring-energia outline-none transition-all placeholder:text-eden-100/20"
              />
              <p className="text-[9px] md:text-[10px] text-eden-100/30">
                Recomendado: Imagens quadradas.
              </p>
            </div>
          </div>

          {/* Dica de Roleplay */}
          <div className="bg-eden-900/30 border border-eden-700/30 rounded-xl p-3 md:p-4 flex gap-3 items-start">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-conhecimento shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs md:text-sm font-bold text-conhecimento">Dica de Interpretação</h4>
              <p className="text-[10px] md:text-xs text-eden-100/60 leading-relaxed">
                Pense em defeitos tanto quanto qualidades. Um agente perfeito é chato; um agente com medos e vícios é memorável.
              </p>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: Textos Longos */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          
          {/* Aparência */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
              <User className="w-3 h-3 md:w-4 md:h-4 text-energia" /> Aparência Física
            </label>
            <textarea
              value={info.appearance}
              onChange={(e) => updateInfo('appearance', e.target.value)}
              className="w-full h-20 md:h-24 bg-eden-800 border border-eden-700 rounded-xl p-3 md:p-4 text-sm text-eden-100 focus:border-energia focus:ring-1 focus:ring-energia outline-none transition-all placeholder:text-eden-100/20 resize-none"
              placeholder="Altura, porte físico, cicatrizes, estilo de roupa..."
            />
          </div>

          {/* Personalidade */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-conhecimento" /> Personalidade
            </label>
            <textarea
              value={info.personality}
              onChange={(e) => updateInfo('personality', e.target.value)}
              className="w-full h-20 md:h-24 bg-eden-800 border border-eden-700 rounded-xl p-3 md:p-4 text-sm text-eden-100 focus:border-conhecimento focus:ring-1 focus:ring-conhecimento outline-none transition-all placeholder:text-eden-100/20 resize-none"
              placeholder="Como seu personagem age? Calmo, explosivo? O que ele teme?"
            />
          </div>

          {/* Histórico */}
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
              <Scroll className="w-3 h-3 md:w-4 md:h-4 text-sangue" /> Histórico
            </label>
            <textarea
              value={info.history}
              onChange={(e) => updateInfo('history', e.target.value)}
              className="w-full flex-1 min-h-[150px] bg-eden-800 border border-eden-700 rounded-xl p-3 md:p-4 text-sm text-eden-100 focus:border-sangue focus:ring-1 focus:ring-sangue outline-none transition-all placeholder:text-eden-100/20 resize-none"
              placeholder="A história de vida do seu personagem. Como conheceu a Ordem? Qual foi seu primeiro contato com o Paranormal?"
            />
          </div>

        </div>
      </div>
    </div>
  );
}