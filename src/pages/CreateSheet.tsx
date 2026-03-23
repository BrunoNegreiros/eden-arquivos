import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../context/CharacterContext';
import { ChevronRight, ChevronLeft, Save, Loader2, AlertCircle, X } from 'lucide-react';
import { saveCharacter } from '../services/characterService';

import Step1Concept from '../components/wizard/Step1Concept';
import Step2Attributes from '../components/wizard/Step2Attributes';
import Step3Origins from '../components/wizard/Step3Origins';
import Step4Classes from '../components/wizard/Step4Classes';
import Step5Details from '../components/wizard/Step5Details';
import Step6Inventory from '../components/wizard/Step6Inventory';
import Step7Rituals from '../components/wizard/Step7Rituals';

const STEP_TITLES = [
  "Conceito & Identidade",
  "Atributos",
  "Origem Customizada",
  "Classe & Trilha",
  "Detalhes & Perícias",
  "Inventário & Equipamento",
  "Rituais & Finalização"
];

export default function CreateSheet() {
  const navigate = useNavigate();
  const { mesaId } = useParams();
  const { character, resetCharacter } = useCharacter(); 
  
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resetCharacter();
  }, []);

  const handleNext = () => {
    setError(null);

    // ==========================================
    // VALIDAÇÕES OBRIGATÓRIAS
    // ==========================================

    // Step 1: Nome do Jogador e do Personagem
    if (step === 1) {
        if (!character.personal.name?.trim()) return setError("O Nome do Personagem é obrigatório.");
        if (!character.personal.player?.trim()) return setError("O Nome do Jogador é obrigatório.");
    }

    // Step 3: Origem (Nome, Perícias e Poder)
    if (step === 3) {
        const orig = character.customOrigin as any;
        if (!orig?.name?.trim()) return setError("O Nome da Origem é obrigatório.");
        if (!orig?.trainedSkills || orig.trainedSkills.length === 0) return setError("Sua origem deve fornecer pelo menos uma perícia.");
        if (!orig?.power?.name?.trim()) return setError("O Nome do Poder da Origem é obrigatório.");
    }

    // Step 4: Classe (Escolha da classe e cota de perícias)
    if (step === 4) {
        const cls = character.personal.class;
        if (!['combatente', 'especialista', 'ocultista'].includes(cls)) {
            return setError("Você deve selecionar uma Classe (Combatente, Especialista ou Ocultista).");
        }
        
        const trainedCount = Object.values(character.skills).filter((s: any) => s.training === 1).length;
        const expectedCount = 2 + character.attributes.initial.INT + (cls === 'combatente' ? 3 : cls === 'especialista' ? 7 : cls === 'ocultista' ? 5 : 0);
        
        if (trainedCount < expectedCount) {
            return setError(`Você precisa escolher todas as perícias fornecidas pela sua classe (Faltam ${expectedCount - trainedCount}).`);
        }
    }

    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a tela para cima ao avançar
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      if (!mesaId) {
          setError("Erro Crítico: Mesa não identificada na URL.");
          setIsSaving(false);
          return;
      }

      const newId = await saveCharacter(character, mesaId);
      navigate(`/mesa/${mesaId}/ficha/${newId}`);
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError("Falha ao salvar o personagem. Verifique sua conexão e tente novamente.");
      setIsSaving(false);
    } 
  };

  const handleCancel = () => {
    if (confirm("Deseja realmente cancelar? Todo o progresso será perdido.")) {
      navigate(mesaId ? `/mesa/${mesaId}` : '/');
    }
  };

  return (
    <div className="min-h-screen bg-eden-900 text-eden-100 flex flex-col font-sans selection:bg-energia selection:text-eden-900">
      
      <header className="bg-eden-950 border-b border-eden-700 p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={handleCancel} className="p-2 bg-eden-800 hover:bg-red-900/50 text-eden-100/50 hover:text-red-400 rounded-xl transition-colors">
                <X size={20} />
             </button>
             <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  NOVO AGENTE
                </h1>
                <p className="text-xs text-eden-100/50 font-medium uppercase tracking-widest mt-0.5">
                  Passo {step} de 7: <span className="text-energia">{STEP_TITLES[step - 1]}</span>
                </p>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-bold text-eden-100/40">Progresso</span>
            <div className="w-48 h-2 bg-eden-800 rounded-full overflow-hidden border border-eden-700">
              <div 
                className="h-full bg-energia transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-950/80 border-b border-red-500/50 text-red-200 p-3 flex justify-center items-center gap-2 text-sm font-bold shadow-inner">
           <AlertCircle size={18} className="text-red-500" /> {error}
        </div>
      )}

      <main className="flex-1 container mx-auto max-w-5xl p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && <Step1Concept />}
          {step === 2 && <Step2Attributes />}
          {step === 3 && <Step3Origins />}
          {step === 4 && <Step4Classes />}
          {step === 5 && <Step5Details />}
          {step === 6 && <Step6Inventory />}
          {step === 7 && <Step7Rituals />}
        </div>
      </main>

      <footer className="bg-eden-950/80 backdrop-blur-md border-t border-eden-700 p-4 fixed bottom-0 w-full z-50">
        <div className="container mx-auto max-w-5xl flex justify-between items-center">
          
          <button
            onClick={handleBack}
            disabled={step === 1 || isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              step === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'text-eden-100/60 hover:text-white hover:bg-eden-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <button
            onClick={step === 7 ? handleSave : handleNext}
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl transform active:scale-95 ${
               step === 7 
               ? 'bg-gradient-to-r from-energia to-orange-500 text-eden-950 hover:to-orange-400'                 
               : 'text-eden-100/60 hover:text-white hover:bg-eden-800'
            }`}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : step === 7 ? (
              <><Save className="w-4 h-4" /> Concluir Ficha</>
            ) : (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            )}
          </button>

        </div>
      </footer>
    </div>
  );
}