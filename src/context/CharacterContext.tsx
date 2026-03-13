import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { initialCharacterState } from '../types/characterSchema';
import type { CharacterSheet } from '../types/characterSchema';
import { calculateVariables } from '../utils/characterFormulas';
import type { CalculatedVariables } from '../utils/characterFormulas';

interface CharacterContextType {
  character: CharacterSheet;
  vars: CalculatedVariables; 
  updateCharacter: (action: CharacterSheet | ((prev: CharacterSheet) => CharacterSheet)) => void;
  resetCharacter: () => void;
  toggleItem: (itemId: string) => void;
  toggleCondition: (conditionId: string) => void;
  updateSkill: (skillId: string, training: number, otherBonus?: number) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacter] = useState<CharacterSheet>(initialCharacterState);

  
  const vars = useMemo(() => {
    return calculateVariables(character);
  }, [character]);

  const updateCharacter = (action: CharacterSheet | ((prev: CharacterSheet) => CharacterSheet)) => {
    setCharacter(prev => {
      const newState = typeof action === 'function' ? action(prev) : action;
      return newState;
    });
  };

  const resetCharacter = () => {
    setCharacter(initialCharacterState);
  };

  const toggleItem = (itemId: string) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.id === itemId ? { ...item, isEquipped: !item.isEquipped } : item
      )
    }));
  };

  
  

  const toggleCondition = (conditionId: string) => {
    setCharacter(prev => ({
      ...prev,
      conditions: prev.conditions.map(cond => 
        cond.id === conditionId ? { ...cond, isActive: !cond.isActive } : cond
      )
    }));
  };

  const updateSkill = (skillId: string, training: number, otherBonus: number = 0) => {
    setCharacter(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: { ...prev.skills[skillId], training, otherBonus }
      }
    }));
  };

  return (
    <CharacterContext.Provider value={{ 
      character, 
      vars, 
      updateCharacter, 
      resetCharacter, 
      toggleItem, 
      toggleCondition,
      updateSkill
    }}>
      {children}
    </CharacterContext.Provider>
  );
}

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter deve ser usado dentro de um CharacterProvider");
  return context;
};