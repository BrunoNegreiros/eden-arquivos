import { useState } from 'react';
import { Brain, Zap, Shield, Eye, BicepsFlexed, HelpCircle, Info } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import type { Attribute } from '../../types/systemData';


const KEY_MAP: Record<string, Attribute> = {
  'agi': 'AGI',
  'for': 'FOR',
  'int': 'INT',
  'pre': 'PRE',
  'vig': 'VIG'
};


const ATTRIBUTE_DETAILS = {
  agi: { 
    label: 'Agilidade', 
    icon: Zap, 
    color: 'text-yellow-400', 
    borderColor: 'border-yellow-400',
    shadowColor: 'shadow-yellow-400/50',
    bgGradient: 'from-yellow-400/20',
    desc: 'Coordenação motora, velocidade de reação e destreza manual. Essencial para Furtividade, Pilotagem e Pontaria.' 
  },
  for: { 
    label: 'Força', 
    icon: BicepsFlexed, 
    color: 'text-red-500', 
    borderColor: 'border-red-500',
    shadowColor: 'shadow-red-500/50',
    bgGradient: 'from-red-500/20',
    desc: 'Potência muscular e capacidade física. Afeta o dano corpo a corpo, capacidade de carga e testes de Atletismo.' 
  },
  int: { 
    label: 'Intelecto', 
    icon: Brain, 
    color: 'text-blue-400', 
    borderColor: 'border-blue-400',
    shadowColor: 'shadow-blue-400/50',
    bgGradient: 'from-blue-400/20',
    desc: 'Raciocínio, memória e educação. Define o número de perícias treinadas e a compreensão de rituais.' 
  },
  pre: { 
    label: 'Presença', 
    icon: Eye, 
    color: 'text-purple-400', 
    borderColor: 'border-purple-400',
    shadowColor: 'shadow-purple-400/50',
    bgGradient: 'from-purple-400/20',
    desc: 'Força de vontade e carisma. Define seus Pontos de Esforço (PE) iniciais e resistência mental.' 
  },
  vig: { 
    label: 'Vigor', 
    icon: Shield, 
    color: 'text-green-500', 
    borderColor: 'border-green-500',
    shadowColor: 'shadow-green-500/50',
    bgGradient: 'from-green-500/20',
    desc: 'Saúde e resistência física. Define seus Pontos de Vida (PV) iniciais e resistência a ferimentos.' 
  },
};

export default function Step2Attributes() {
  const { character, updateCharacter } = useCharacter();
  
  
  const attributes = character.attributes.initial;
  
  
  const updateAttribute = (key: Attribute, value: number) => {
    updateCharacter(prev => ({
        ...prev,
        attributes: {
            ...prev.attributes,
            initial: {
                ...prev.attributes.initial,
                [key]: value
            }
        }
    }));
  };
  
  const [activeKey, setActiveKey] = useState<string | null>(null);

  
  const currentSum = (Object.values(attributes) as number[]).reduce((a: number, b: number) => a + b, 0);
  const pointsRemaining = 4 - (currentSum - 5);
  const zerosCount = Object.values(attributes).filter(v => v === 0).length;

  const handleChange = (e: React.MouseEvent, uiKey: string, delta: number) => {
    e.stopPropagation();
    const schemaKey = KEY_MAP[uiKey];
    const currentVal = attributes[schemaKey];
    const newVal = currentVal + delta;

    if (newVal < 0 || newVal > 3) return;
    if (delta > 0 && pointsRemaining <= 0) return;
    if (newVal === 0 && zerosCount >= 1 && currentVal !== 0) return; 

    updateAttribute(schemaKey, newVal);
    setActiveKey(uiKey);
  };

  const activeInfo = activeKey ? ATTRIBUTE_DETAILS[activeKey as keyof typeof ATTRIBUTE_DETAILS] : null;

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col overflow-y-auto custom-scrollbar pb-4">
      
      {}
      <div className="text-center mb-4 lg:mb-8 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100 mb-2">Atributos</h2>
        
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors duration-300 ${
          pointsRemaining === 0 
            ? 'bg-eden-900 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
            : 'bg-eden-800 border-eden-600 text-eden-100'
        }`}>
          <span className="text-xl font-bold">{pointsRemaining}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-70">Pontos</span>
        </div>
      </div>

      {}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start flex-1">
        
        {}
        <div className="w-full lg:flex-1">
          
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-2 lg:gap-4 p-2 lg:p-4">
            {Object.entries(ATTRIBUTE_DETAILS).map(([uiKey, info]) => {
              const Icon = info.icon;
              const schemaKey = KEY_MAP[uiKey];
              const value = attributes[schemaKey];
              const isActive = activeKey === uiKey;

              return (
                <div 
                  key={uiKey}
                  onClick={() => setActiveKey(uiKey)}
                  className={`
                    relative rounded-xl border flex flex-col items-center justify-between transition-all duration-300 cursor-pointer select-none
                    ${isActive 
                      ? `bg-eden-800 ${info.borderColor} shadow-lg ${info.shadowColor} z-10 scale-105` 
                      : 'bg-eden-800/40 border-eden-700/50 hover:border-eden-600 hover:bg-eden-800'
                    }
                    w-full h-28 p-1 lg:w-36 lg:h-auto lg:p-4
                  `}
                >
                  <div className="flex flex-col items-center mt-1 lg:mt-0">
                      <div className={`p-1.5 lg:p-2 rounded-full bg-eden-900/50 ${info.color} mb-1`}>
                        <Icon className="w-4 h-4 lg:w-6 lg:h-6" />
                      </div>
                      <h3 className="font-bold text-eden-100 text-[10px] lg:text-xs uppercase tracking-wider">{info.label}</h3>
                  </div>
                  
                  <div className={`text-2xl lg:text-4xl font-black transition-colors duration-300 leading-none ${isActive ? info.color : 'text-eden-100'}`}>
                    {value}
                  </div>

                  <div className="flex items-center gap-2 w-full justify-center mb-1 lg:mt-2">
                    <button
                      onClick={(e) => handleChange(e, uiKey, -1)}
                      disabled={value <= 0 || (value === 1 && zerosCount >= 1)}
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-eden-900 hover:bg-eden-700 text-eden-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center pb-0.5 text-lg font-bold transition-colors border border-eden-700"
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => handleChange(e, uiKey, 1)}
                      disabled={value >= 3 || pointsRemaining <= 0}
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-eden-100 text-eden-900 hover:bg-white disabled:bg-eden-700 disabled:text-eden-500 disabled:cursor-not-allowed flex items-center justify-center pb-0.5 text-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

           <div className="mt-2 p-2 bg-eden-900/30 rounded border border-eden-700/30 text-center lg:hidden">
             <p className="text-[10px] text-eden-100/40 uppercase">Toque para ver detalhes</p>
           </div>
        </div>

        {}
        <div className="w-full lg:w-80 shrink-0">
          <div className={`rounded-xl border p-4 transition-all duration-500 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[140px] ${
            activeInfo 
              ? `bg-eden-800 border-${activeInfo.borderColor.split('-')[1] || 'eden-700'} shadow-md` 
              : 'bg-eden-800/30 border-eden-700/50 border-dashed'
          }`}>
            
            {activeInfo ? (
              <div className="relative z-10 animate-in fade-in zoom-in-95 duration-300 w-full">
                <div className={`absolute inset-0 bg-gradient-to-b ${activeInfo.bgGradient} to-transparent opacity-20 -z-10 rounded-xl blur-xl`} />
                
                <div className="flex items-center justify-center gap-2 mb-2">
                   <activeInfo.icon size={20} className={activeInfo.color}/> 
                   <h3 className={`text-xl font-bold ${activeInfo.color}`}>{activeInfo.label}</h3>
                </div>
                
                <p className="text-eden-100/80 text-xs leading-relaxed mb-3">
                  {activeInfo.desc}
                </p>

                <div className="border-t border-eden-100/10 pt-2 flex flex-wrap justify-center gap-2 text-[10px] text-eden-100/60 font-mono uppercase">
                  {activeInfo.label === 'Vigor' && <span className="bg-black/20 px-2 py-1 rounded">PV Inicial: {12 + attributes.VIG} + Classe</span>}
                  {activeInfo.label === 'Presença' && <span className="bg-black/20 px-2 py-1 rounded">PE Inicial: {1 + attributes.PRE} + Classe</span>}
                  {activeInfo.label === 'Intelecto' && <span className="bg-black/20 px-2 py-1 rounded">Perícias: {attributes.INT} Extras</span>}
                  {activeInfo.label === 'Força' && <span className="bg-black/20 px-2 py-1 rounded">Carga: {attributes.FOR * 5 + (attributes.FOR === 0 ? 2 : 0)}</span>}
                  {activeInfo.label === 'Agilidade' && <span className="bg-black/20 px-2 py-1 rounded">Defesa: {10 + attributes.AGI}</span>}
                </div>
              </div>
            ) : (
              <div className="text-eden-100/20 flex flex-col items-center">
                <HelpCircle size={32} className="mb-2" />
                <p className="text-xs font-medium">Selecione um atributo</p>
              </div>
            )}
          </div>

          {}
          <div className="hidden lg:block mt-4 p-3 bg-eden-900/50 rounded-xl border border-eden-700/50">
             <div className="text-[10px] text-eden-100/30 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Info size={12} /> Status Base (Mundano)
             </div>
             <div className="space-y-1 text-xs text-eden-100/60">
                <div className="flex justify-between"><span>PV Inicial</span> <strong className="text-eden-100">{12 + attributes.VIG}</strong></div>
                <div className="flex justify-between"><span>PE Inicial</span> <strong className="text-eden-100">{1 + attributes.PRE}</strong></div>
                <div className="flex justify-between"><span>SAN Inicial</span> <strong className="text-eden-100">8</strong></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}