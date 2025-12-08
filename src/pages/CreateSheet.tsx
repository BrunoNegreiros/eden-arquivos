import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CharacterProvider, useCharacter } from '../context/CharacterContext';
import { ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';
import { saveCharacter } from '../services/characterService';

// Importação dos Passos
import Step1Concept from '../components/wizard/Step1Concept';
import Step2Attributes from '../components/wizard/Step2Attributes';
import Step3Origins from '../components/wizard/Step3Origins';
import Step4Classes from '../components/wizard/Step4Classes';
import Step5Details from '../components/wizard/Step5Details';
import Step6Inventory from '../components/wizard/Step6Inventory';
import Step7Rituals from '../components/wizard/Step7Rituals';
import Step8Team from '../components/wizard/Step8Team';

function WizardContent() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const isPrivate = searchParams.get('private') === 'true';

  const { character } = useCharacter();

  const handleNext = async () => {
    if (step < 8) {
      setStep(s => s + 1);
      // Rola para o topo ao mudar de passo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsSaving(true);
      try {
        const finalCharacter = {
            ...character,
            isPrivate: isPrivate,
        };
        const id = await saveCharacter(finalCharacter);
        navigate(`/ficha/${id}`); 
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar. Verifique o console.");
        setIsSaving(false);
      }
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1: return <Step1Concept />;
      case 2: return <Step2Attributes />;
      case 3: return <Step3Origins />;
      case 4: return <Step4Classes />;
      case 5: return <Step5Details />;
      case 6: return <Step6Inventory />;
      case 7: return <Step7Rituals />;
      case 8: return <Step8Team />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-eden-900 text-eden-100 flex flex-col font-sans">
      {/* Barra de Progresso (Sticky no topo para não sumir) */}
      <div className="sticky top-0 z-50 w-full bg-eden-800 h-2 shrink-0 shadow-md">
        <div 
          className="bg-gradient-to-r from-energia to-conhecimento h-full transition-all duration-500"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>

      {/* Main sem altura travada (min-h-screen apenas para garantir fundo) */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-eden-700 pb-4">
          <button onClick={() => navigate(isPrivate ? '/mestre' : '/')} className="text-sm text-eden-100/50 hover:text-eden-100 transition-colors">
            &larr; Cancelar
          </button>
          <div className="text-right">
              <span className="text-sm font-mono text-eden-100/30 block">ETAPA {step}/8</span>
              {isPrivate && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">CONFIDENCIAL</span>}
          </div>
        </header>

        {/* Área de Conteúdo (Removemos overflow-hidden e altura fixa) */}
        <div className={`flex-1 bg-eden-800/30 border ${isPrivate ? 'border-red-500/30' : 'border-eden-700'} rounded-2xl p-4 md:p-8 shadow-2xl relative`}>
          {renderStep()}
        </div>

        {/* Navegação (Sticky no fundo mobile para facilitar) */}
        <div className="sticky bottom-0 p-4 bg-eden-900/90 backdrop-blur-md border-t border-eden-700 flex justify-between items-center z-40 -mx-4 md:mx-0 md:relative md:bg-transparent md:border-none md:p-0">
          <button
            onClick={() => { 
                if(step > 1) {
                    setStep(s => s - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }}
            disabled={step === 1 || isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'bg-eden-800 hover:bg-eden-700 text-eden-100 border border-eden-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all shadow-lg ${
               step === 8 
               ? 'bg-energia text-eden-900 hover:bg-yellow-400' 
               : 'bg-eden-100 text-eden-900 hover:bg-white hover:scale-105'
            }`}
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
            ) : step === 8 ? (
              <><Save className="w-5 h-5" /> Finalizar</>
            ) : (
              <>Próximo <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CreateSheet() {
  return (
    <CharacterProvider>
      <WizardContent />
    </CharacterProvider>
  );
}