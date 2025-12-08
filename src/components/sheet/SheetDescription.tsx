import { useState, useEffect } from 'react';
import { User, Save, Image as ImageIcon, Sparkles, Scroll, VenetianMask, Book } from 'lucide-react';
import type { CharacterSheet } from '../../types/characterSchema';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

export default function SheetDescription({ character, onUpdate }: Props) {
  const { info } = character;
  
  const [editValues, setEditValues] = useState(info);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditValues(character.info);
  }, [character.info]);

  const handleChange = (field: keyof typeof info, value: any) => {
    setEditValues(prev => {
        const newState = { ...prev, [field]: value };
        return newState;
    });
    setHasChanges(true);
  };

  const saveChanges = () => {
    onUpdate({ info: editValues });
    setHasChanges(false);
    alert("Dados salvos com sucesso!");
  };

  const INPUT_CLASS = "w-full bg-eden-950 text-eden-100 border border-eden-700 rounded-lg p-3 text-sm outline-none focus:border-energia placeholder-eden-100/30 transition-colors";
  const LABEL_CLASS = "text-xs uppercase font-bold text-eden-100/50 block mb-1 flex items-center gap-2";

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* BARRA DE TÍTULO E SALVAR */}
      <div className="flex justify-between items-center bg-eden-800 border border-eden-700 p-3 md:p-4 rounded-xl sticky top-0 z-10 shadow-md backdrop-blur-sm bg-eden-800/90">
          <h3 className="font-bold text-eden-100 flex items-center gap-2 text-base md:text-lg">
              <Book className="text-energia w-5 h-5 md:w-6 md:h-6"/> Dados Pessoais
          </h3>
          {hasChanges && (
              <button onClick={saveChanges} className="bg-energia text-eden-900 px-4 py-2 rounded-lg text-xs md:text-sm font-black flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg animate-pulse">
                   <Save size={14} className="md:w-4 md:h-4"/> <span className="hidden md:inline">SALVAR ALTERAÇÕES</span><span className="md:hidden">SALVAR</span>
              </button>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* COLUNA 1: IDENTIDADE E FOTO */}
          <div className="space-y-4 md:space-y-6">
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl flex flex-col items-center">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 mb-4 md:mb-6 group">
                      <div className="absolute inset-0 rounded-full border-4 border-eden-700 group-hover:border-energia transition-colors duration-300" />
                      <div className="w-full h-full rounded-full overflow-hidden bg-eden-900 flex items-center justify-center">
                          {editValues.portraitUrl ? (
                              <img src={editValues.portraitUrl} alt="Retrato" className="w-full h-full object-cover" />
                          ) : (
                              <User size={48} className="text-eden-700 md:w-16 md:h-16" />
                          )}
                      </div>
                  </div>
                  
                  <div className="w-full space-y-3 md:space-y-4">
                      <div>
                          <label className={LABEL_CLASS}><ImageIcon size={12}/> URL da Imagem</label>
                          <input 
                            value={editValues.portraitUrl} 
                            onChange={e => handleChange('portraitUrl', e.target.value)} 
                            className={INPUT_CLASS} 
                            placeholder="https://..."
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                      
                      <div>
                          <label className={LABEL_CLASS}><User size={12}/> Nome do Personagem</label>
                          <input 
                            value={editValues.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>

                      <div>
                          <label className={LABEL_CLASS}><User size={12}/> Jogador</label>
                          <input 
                            value={editValues.player} 
                            onChange={e => handleChange('player', e.target.value)} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                  </div>
              </div>

              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl space-y-3 md:space-y-4">
                  <div>
                      <label className={LABEL_CLASS}><VenetianMask size={12}/> Campanha</label>
                      <input 
                        value={editValues.campaign} 
                        onChange={e => handleChange('campaign', e.target.value)} 
                        className={INPUT_CLASS} 
                        style={{ colorScheme: 'dark' }}
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className={LABEL_CLASS}>Idade</label>
                          <input 
                            type="number" 
                            value={editValues.age} 
                            onChange={e => handleChange('age', parseInt(e.target.value))} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                      <div>
                          <label className={LABEL_CLASS}>Gênero</label>
                          <input 
                            value={editValues.gender} 
                            onChange={e => handleChange('gender', e.target.value)} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                  </div>

                  <div>
                      <label className={LABEL_CLASS}>Conceito / Arquétipo</label>
                      <input 
                        value={editValues.archetype} 
                        onChange={e => handleChange('archetype', e.target.value)} 
                        className={INPUT_CLASS} 
                        style={{ colorScheme: 'dark' }}
                      />
                  </div>
              </div>
          </div>

          {/* COLUNA 2 E 3: TEXTOS LONGOS */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl h-full flex flex-col gap-4 md:gap-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                          <label className={LABEL_CLASS}><User size={14}/> Aparência Física</label>
                          <textarea 
                            value={editValues.appearance} 
                            onChange={e => handleChange('appearance', e.target.value)} 
                            className={`${INPUT_CLASS} h-32 md:h-40 resize-none`} 
                            style={{ colorScheme: 'dark' }}
                            placeholder="Descreva altura, peso, cor dos olhos, cicatrizes..."
                          />
                      </div>
                      <div>
                          <label className={LABEL_CLASS}><Sparkles size={14}/> Personalidade</label>
                          <textarea 
                            value={editValues.personality} 
                            onChange={e => handleChange('personality', e.target.value)} 
                            className={`${INPUT_CLASS} h-32 md:h-40 resize-none`} 
                            style={{ colorScheme: 'dark' }}
                            placeholder="Como seu personagem age? Do que ele gosta? O que ele teme?"
                          />
                      </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                      <label className={LABEL_CLASS}><Scroll size={14}/> Histórico</label>
                      <textarea 
                        value={editValues.history} 
                        onChange={e => handleChange('history', e.target.value)} 
                        className={`${INPUT_CLASS} flex-1 min-h-[200px] md:min-h-[300px] resize-none`} 
                        style={{ colorScheme: 'dark' }}
                        placeholder="A história de vida do seu personagem..."
                      />
                  </div>

              </div>
          </div>

      </div>
    </div>
  );
}