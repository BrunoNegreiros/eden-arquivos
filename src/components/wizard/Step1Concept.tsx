import { User, Users, VenetianMask, Dices, Minus, Plus } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import { NATIONALITIES, ORIGINS_LIST, PERSONALITIES, MANIAS, FEARS, SECRETS, APPEARANCES, PARANORMAL_EVENTS, POSITIVE_TRAITS } from '../../data/generators';

export default function Step1Concept() {
  const { character, updateCharacter } = useCharacter();

  const updatePersonal = (field: string, value: string | number) => {
    updateCharacter((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const generateRandomName = () => {
      const keys = Object.keys(NATIONALITIES) as Array<keyof typeof NATIONALITIES>;
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const nat = NATIONALITIES[randomKey];
      
      const randomName = nat.names[Math.floor(Math.random() * nat.names.length)];
      const randomSurname = nat.surnames[Math.floor(Math.random() * nat.surnames.length)];
      
      updatePersonal('name', `${randomName} ${randomSurname}`);
  };

  const generateRandomConcept = () => {
      const originObj = ORIGINS_LIST[Math.floor(Math.random() * ORIGINS_LIST.length)];
      const origin = originObj.text;
      const category = originObj.cat;

      const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
      const mania = MANIAS[Math.floor(Math.random() * MANIAS.length)];
      const fear = FEARS[Math.floor(Math.random() * FEARS.length)];
      const secret = SECRETS[Math.floor(Math.random() * SECRETS.length)];
      const appearance = APPEARANCES[Math.floor(Math.random() * APPEARANCES.length)];
      const positive = POSITIVE_TRAITS[Math.floor(Math.random() * POSITIVE_TRAITS.length)];

      const eventsList = PARANORMAL_EVENTS[category] || PARANORMAL_EVENTS["Investigação, mídia e comunicação"]; 
      const paranormal = eventsList[Math.floor(Math.random() * eventsList.length)];

      const concept = `${origin}, ${personality}, além disso, sempre ${mania}. Seu maior medo é ${fear}. Seu maior segredo é que ${secret}. ${appearance}. Conheceu o paranormal quando ${paranormal}. Sua maior força está no fato de que ${positive}.`;

      updatePersonal('archetype', concept);
  };

  const handleAgeChange = (input: string | number) => {
      let finalValue = 0;
      if (typeof input === 'number') {
          finalValue = input;
      } else {
          const onlyNumbers = input.replace(/[^0-9]/g, '');
          finalValue = onlyNumbers === '' ? 0 : parseInt(onlyNumbers);
      }
      if (finalValue < 0) finalValue = 0;
      if (finalValue > 999) finalValue = 999;
      updatePersonal('age', finalValue);
  };

  const { personal } = character;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar pb-2">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-eden-100">Identidade</h2>
        <p className="text-base text-eden-100/50">Quem você era antes de conhecer o Outro Lado?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <span className="flex items-center gap-2"><User className="w-4 h-4 text-energia" /> Nome do Personagem <span className="text-red-500">*</span></span>
            <button 
                onClick={generateRandomName}
                className="text-xs bg-eden-700 hover:bg-eden-600 text-eden-100 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                title="Gerar nome aleatório"
            >
                <Dices className="w-3 h-3" /> Gerar
            </button>
          </label>
          <input
            type="text"
            value={personal.name || ''}
            onChange={(e) => updatePersonal('name', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-base text-eden-100 focus:border-energia focus:ring-1 focus:ring-energia outline-none transition-all placeholder:text-eden-700"
            placeholder="Ex: Arthur Cervero"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <Users className="w-4 h-4 text-conhecimento" /> Jogador <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={personal.player || ''}
            onChange={(e) => updatePersonal('player', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-base text-eden-100 focus:border-conhecimento focus:ring-1 focus:ring-conhecimento outline-none transition-all placeholder:text-eden-700"
            placeholder="Seu nome real"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-eden-100/70 uppercase tracking-wider">Idade</label>
                <div className="relative flex items-center">
                    <button 
                        onClick={() => handleAgeChange((personal.age || 0) - 1)}
                        className="absolute left-1 p-2 bg-eden-800 hover:bg-eden-700 rounded-md text-eden-100/70 hover:text-eden-100 transition-colors"
                        tabIndex={-1}
                    >
                        <Minus size={14} />
                    </button>
                    
                    <input
                        type="text"
                        inputMode="numeric"
                        value={personal.age === 0 ? '' : personal.age}
                        onChange={(e) => handleAgeChange(e.target.value)}
                        placeholder="0"
                        className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-center text-base text-eden-100 focus:border-eden-100 outline-none transition-all"
                    />
                    
                    <button 
                        onClick={() => handleAgeChange((personal.age || 0) + 1)}
                        className="absolute right-1 p-2 bg-eden-800 hover:bg-eden-700 rounded-md text-eden-100/70 hover:text-eden-100 transition-colors"
                        tabIndex={-1}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-eden-100/70 uppercase tracking-wider">Gênero</label>
                <input
                    type="text"
                    value={personal.gender || ''}
                    onChange={(e) => updatePersonal('gender', e.target.value)}
                    className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-base text-eden-100 focus:border-eden-100 outline-none transition-all"
                />
            </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="flex items-center justify-between text-sm font-medium text-eden-100/70 uppercase tracking-wider">
            <span className="flex items-center gap-2"><VenetianMask className="w-4 h-4 text-sangue" /> Conceito / Arquétipo</span>
            <button 
                onClick={generateRandomConcept}
                className="text-xs bg-eden-700 hover:bg-eden-600 text-eden-100 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                title="Gerar conceito aleatório"
            >
                <Dices className="w-3 h-3" /> Gerar
            </button>
          </label>
          <textarea
            rows={5}
            value={personal.archetype || ''}
            onChange={(e) => updatePersonal('archetype', e.target.value)}
            className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-base text-eden-100 focus:border-sangue focus:ring-1 focus:ring-sangue outline-none transition-all placeholder:text-eden-700 resize-none leading-relaxed"
            placeholder="Ex: Um ex-militar buscando vingança..."
          />
        </div>

      </div>
    </div>
  );
}