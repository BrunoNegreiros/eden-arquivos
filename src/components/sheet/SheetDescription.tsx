import { useState, useEffect, useRef } from 'react';
import { User, Save, Sparkles, Scroll, Book, Image as ImageIcon, Upload } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';

export default function SheetDescription() {
  const { character, updateCharacter } = useCharacter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const info = character.personal;
  const [editValues, setEditValues] = useState(info);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditValues(character.personal);
  }, [character.personal]);

  const handleChange = (field: keyof typeof info, value: any) => {
    setEditValues((prev: any) => {
        const newState = { ...prev, [field]: value };
        return newState;
    });
    setHasChanges(true);
  };

  const saveChanges = () => {
    updateCharacter(prev => ({
        ...prev,
        personal: editValues
    }));
    setHasChanges(false);
    alert("Dados salvos com sucesso!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        handleChange('portraitUrl', dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const INPUT_CLASS = "w-full bg-eden-950 text-eden-100 border border-eden-700 rounded-lg p-3 text-sm outline-none focus:border-energia placeholder-eden-100/30 transition-colors";
  const LABEL_CLASS = "text-xs uppercase font-bold text-eden-100/50 mb-1 flex items-center gap-2";

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
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
          
          <div className="space-y-4 md:space-y-6">
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl space-y-4 md:space-y-5">
                  <div className="flex flex-col items-center gap-3 pb-2 border-b border-eden-700/50">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-eden-600 bg-eden-900 flex items-center justify-center shrink-0 shadow-inner">
                          {editValues.portraitUrl ? (
                              <img src={editValues.portraitUrl} alt="Retrato" className="w-full h-full object-cover" />
                          ) : (
                              <User className="w-10 h-10 md:w-16 md:h-16 text-eden-100/20" />
                          )}
                      </div>
                      <div className="w-full">
                          <label className={LABEL_CLASS}><ImageIcon size={12}/> Avatar do Agente</label>
                          <input 
                            type="text"
                            value={editValues.portraitUrl?.startsWith('data:image') ? '(Imagem Local)' : (editValues.portraitUrl || '')} 
                            onChange={e => handleChange('portraitUrl', e.target.value)} 
                            className={INPUT_CLASS} 
                            placeholder="https://... (Link da internet)"
                            disabled={editValues.portraitUrl?.startsWith('data:image')}
                          />
                          <div className="flex items-center gap-2 mt-2">
                              <input 
                                 type="file" 
                                 accept="image/*" 
                                 className="hidden" 
                                 ref={fileInputRef} 
                                 onChange={handleImageUpload} 
                              />
                              <button 
                                 type="button"
                                 onClick={() => fileInputRef.current?.click()}
                                 className="bg-eden-950 hover:bg-energia hover:text-eden-900 border border-eden-700 text-eden-100 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 w-full"
                              >
                                <Upload size={14}/> Enviar do Computador
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className={LABEL_CLASS}>Idade</label>
                          <input 
                            type="number" 
                            value={editValues.age || ''} 
                            onChange={e => handleChange('age', parseInt(e.target.value))} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                      <div>
                          <label className={LABEL_CLASS}>Gênero</label>
                          <input 
                            value={editValues.gender || ''} 
                            onChange={e => handleChange('gender', e.target.value)} 
                            className={INPUT_CLASS} 
                            style={{ colorScheme: 'dark' }}
                          />
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-eden-800 border border-eden-700 p-4 md:p-6 rounded-xl h-full flex flex-col gap-4 md:gap-6">
                  
                  <div>
                      <label className={LABEL_CLASS}>Conceito / Arquétipo</label>
                      <textarea 
                        value={editValues.archetype || ''} 
                        onChange={e => handleChange('archetype', e.target.value)} 
                        className={`${INPUT_CLASS} min-h-[100px] md:min-h-[140px] resize-none`} 
                        style={{ colorScheme: 'dark' }}
                        placeholder="Descreva detalhadamente o conceito ou arquétipo do seu personagem..."
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                          <label className={LABEL_CLASS}><User size={14}/> Aparência Física</label>
                          <textarea 
                            value={editValues.appearance || ''} 
                            onChange={e => handleChange('appearance', e.target.value)} 
                            className={`${INPUT_CLASS} h-32 md:h-40 resize-none`} 
                            style={{ colorScheme: 'dark' }}
                            placeholder="Descreva altura, peso, cor dos olhos, cicatrizes..."
                          />
                      </div>
                      <div>
                          <label className={LABEL_CLASS}><Sparkles size={14}/> Personalidade</label>
                          <textarea 
                            value={editValues.personality || ''} 
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
                        value={editValues.history || ''} 
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