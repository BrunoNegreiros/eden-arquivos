import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../context/CharacterContext';
import { ChevronRight, ChevronLeft, Save, Loader2, AlertCircle, X, Book } from 'lucide-react';
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
    if (step === 1) {
        if (!character.personal.name?.trim()) return setError("O Nome do Personagem é obrigatório.");
        if (!character.personal.player?.trim()) return setError("O Nome do Jogador é obrigatório.");
    }
    if (step === 2) {
        const attrs = character.attributes.initial;
        const currentSum = (Object.values(attrs) as number[]).reduce((a, b) => a + b, 0);
        const pointsRemaining = 4 - (currentSum - 5);
        if (pointsRemaining > 0) return setError(`Distribua todos os seus pontos de atributo antes de continuar (Faltam ${pointsRemaining}).`);
    }
    if (step === 3) {
        const orig = character.customOrigin as any;
        if (!orig?.name?.trim()) return setError("O Nome da Origem é obrigatório.");
        if (!orig?.trainedSkills || orig.trainedSkills.length === 0) return setError("Sua origem deve fornecer pelo menos uma perícia.");
        if (!orig?.power?.name?.trim()) return setError("O Nome do Poder da Origem é obrigatório.");
    }
    if (step === 4) {
        const cls = character.personal.class;
        if (!['combatente', 'especialista', 'ocultista'].includes(cls)) return setError("Você deve selecionar uma Classe (Combatente, Especialista ou Ocultista).");
        
        const trainedCount = Object.values(character.skills).filter((s: any) => s.training === 1).length;
        const expectedCount = 2 + character.attributes.initial.INT + (cls === 'combatente' ? 3 : cls === 'especialista' ? 7 : cls === 'ocultista' ? 5 : 0);
        if (trainedCount < expectedCount) return setError(`Você precisa escolher todas as perícias fornecidas pela sua classe (Faltam ${expectedCount - trainedCount}).`);
    }

    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
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

  const progressPercentage = Math.round((step / 7) * 100);

  return (
    <div className="min-h-screen bg-eden-900 text-eden-100 flex flex-col font-sans selection:bg-energia selection:text-eden-900 relative">
      
      {/* Alerta Fixo no Topo */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg bg-red-900 border-2 border-red-500 text-red-100 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 shrink-0" /> 
              <span className="text-sm font-bold">{error}</span>
           </div>
           <button onClick={() => setError(null)} className="text-red-300 hover:text-white"><X size={18}/></button>
        </div>
      )}

      {/* Header Limpo */}
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
                {/* Removemos a contagem de passo, deixando só o título */}
                <p className="text-xs text-energia font-black uppercase tracking-widest mt-0.5">
                  {STEP_TITLES[step - 1]}
                </p>
             </div>
          </div>
          
          {/* Barra de Progresso do Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-black text-eden-100/40">{progressPercentage}%</span>
            <div className="w-48 h-2 bg-eden-800 rounded-full overflow-hidden border border-eden-700">
              <div className="h-full bg-energia transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl p-4 md:p-8 overflow-y-auto custom-scrollbar pb-40">
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

      <footer className="bg-eden-950/80 backdrop-blur-md border-t border-eden-700 p-4 fixed bottom-0 w-full z-50 flex flex-col gap-3">
        
        {/* Barra de Progresso Mobile inserida acima dos botões */}
        <div className="flex md:hidden items-center justify-center gap-3 w-full">
            <span className="text-[10px] font-black text-eden-100/50">{progressPercentage}%</span>
            <div className="w-full h-1.5 bg-eden-800 rounded-full overflow-hidden border border-eden-700">
              <div className="h-full bg-energia transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>

        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="hidden md:flex items-center gap-2 text-xs text-eden-100/40">
             <Book size={14}/> Caso tenha alguma dúvida mecânica, consultar o Mestre ou o Livro de Regras de Ordem Paranormal.
          </div>

          <div className="flex w-full md:w-auto justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={step === 1 || isSaving}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
                  step === 1 
                    ? 'opacity-0 pointer-events-none' 
                    : 'text-eden-100/60 hover:text-white hover:bg-eden-800 bg-eden-900 flex-1 md:flex-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                onClick={step === 7 ? handleSave : handleNext}
                disabled={isSaving}
                className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex-1 md:flex-none ${
                   step === 7 
                   ? 'bg-gradient-to-r from-energia to-orange-500 text-eden-950 hover:to-orange-400'                 
                   : 'text-eden-100/60 hover:text-white hover:bg-eden-800 bg-eden-900'
                }`}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                ) : step === 7 ? (
                  <><Save className="w-4 h-4" /> Concluir</>
                ) : (
                  <>Próximo <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
          </div>

        </div>

        {/* Aviso no Mobile */}
        <div className="md:hidden flex items-center justify-center gap-2 text-[9px] text-eden-100/30 text-center uppercase tracking-widest font-bold pb-2">
            <Book size={12}/> Dúvidas? Consulte o Livro de Regras.
        </div>

      </footer>
    </div>
  );
}