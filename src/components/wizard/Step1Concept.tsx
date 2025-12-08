import { User, Scroll, Users, VenetianMask } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';

export default function Step1Concept() {
  const { character, updateInfo } = useCharacter();

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar pb-2">
      
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100">Identidade</h2>
        <p className="text-xs md:text-base text-eden-100/50">Quem você era antes de conhecer o Outro Lado?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Nome do Personagem */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <User className="w-3 h-3 md:w-4 md:h-4 text-energia" /> Nome do Personagem
          </label>
          <input
            type="text"
            value={character.info.name}
            onChange={(e) => updateInfo('name', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-energia focus:ring-1 focus:ring-energia outline-none transition-all placeholder:text-eden-700"
            placeholder="Ex: Arthur Cervero"
            autoFocus
          />
        </div>

        {/* Jogador */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-conhecimento" /> Jogador
          </label>
          <input
            type="text"
            value={character.info.player}
            onChange={(e) => updateInfo('player', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-conhecimento focus:ring-1 focus:ring-conhecimento outline-none transition-all placeholder:text-eden-700"
            placeholder="Seu nome real"
          />
        </div>

        {/* Arquétipo / Conceito */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <VenetianMask className="w-3 h-3 md:w-4 md:h-4 text-sangue" /> Conceito / Arquétipo
          </label>
          <input
            type="text"
            value={character.info.archetype}
            onChange={(e) => updateInfo('archetype', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-sangue focus:ring-1 focus:ring-sangue outline-none transition-all placeholder:text-eden-700"
            placeholder="Ex: Um ex-militar buscando vingança..."
          />
        </div>

        {/* Idade e Gênero */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">Idade</label>
                <input
                    type="number"
                    value={character.info.age || ''}
                    onChange={(e) => updateInfo('age', parseInt(e.target.value))}
                    className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-eden-100 outline-none transition-all"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">Gênero</label>
                <input
                    type="text"
                    value={character.info.gender}
                    onChange={(e) => updateInfo('gender', e.target.value)}
                    className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-eden-100 outline-none transition-all"
                />
            </div>
        </div>
        
        {/* Campanha */}
         <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <Scroll className="w-3 h-3 md:w-4 md:h-4 text-morte" /> Campanha
          </label>
          <input
            type="text"
            value={character.info.campaign}
            onChange={(e) => updateInfo('campaign', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm md:text-base text-eden-100 focus:border-morte focus:ring-1 focus:ring-morte outline-none transition-all placeholder:text-eden-700"
            placeholder="Nome da missão"
          />
        </div>
      </div>
    </div>
  );
}