import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CharacterSheet, InventoryItem } from '../types/characterSchema';

const emptyCharacter: CharacterSheet = {
  id: '', userId: '', createdAt: '', updatedAt: '', isPublic: false, version: '2.0',
  info: { name: '', player: '', campaign: '', archetype: '', age: 0, gender: '', portraitUrl: '', appearance: '', personality: '', history: '' },
  attributes: { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
  // Inicializa com 0 PP
  progression: { nex: 5, patente: 'Recruta', prestigePoints: 0, class: 'mundano', origin: { id: '', name: '' }, trail: '' },
  
  status: {
    pv: { current: 0, max: 0, temp: 0 }, 
    pe: { current: 0, max: 0, temp: 0 }, 
    san: { current: 0, max: 0, temp: 0 }, 
    defense: { passiveMod: 0, tempMod: 0 },
    displacement: { baseMetres: 9, tempMod: 0 },
    resistances: {} as any, 
    immunities: [],
    conditions: [],
    sustainedIds: [] // <--- CORREÇÃO: Inicializado aqui
  },

  notes: [],
  skills: {},
  
  // HABILIDADES (Novos campos)
  classPowers: { coreLevel: 0, selectedIds: [] }, // <--- Inicializado
  paranormalPowers: [], // <--- Inicializado
  customAbilities: [], // <--- Inicializado

  inventory: { items: [], weapons: [], creditLimit: 'Baixo', maxLoad: 0 },
  abilities: [], 
  rituals: [],
  teamStrategy: { role: 'polivalente', roleAbilities: [], favoriteFormations: [], isFormationActive: false, loneWolf: { isActive: false, extraPowersChosen: [] } },
  combatLog: []
};

interface CharacterContextType {
  character: CharacterSheet;
  updateInfo: (field: keyof CharacterSheet['info'], value: string | number) => void;
  updateAttribute: (attr: keyof CharacterSheet['attributes'], value: number) => void;
  updateProgression: (field: keyof CharacterSheet['progression'], value: any) => void;
  updateInventory: (items: InventoryItem[]) => void; // Nova função segura
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacter] = useState<CharacterSheet>(emptyCharacter);

  const updateInfo = (field: keyof CharacterSheet['info'], value: string | number) => {
    setCharacter(prev => ({ ...prev, info: { ...prev.info, [field]: value } }));
  };

  const updateAttribute = (attr: keyof CharacterSheet['attributes'], value: number) => {
    setCharacter(prev => ({ ...prev, attributes: { ...prev.attributes, [attr]: value } }));
  };

  const updateProgression = (field: keyof CharacterSheet['progression'], value: any) => {
    setCharacter(prev => ({ ...prev, progression: { ...prev.progression, [field]: value } }));
  };

  // Função dedicada para atualizar inventário forçando re-render
  const updateInventory = (newItems: InventoryItem[]) => {
    setCharacter(prev => ({
      ...prev,
      inventory: { ...prev.inventory, items: newItems }
    }));
  };

  return (
    <CharacterContext.Provider value={{ character, updateInfo, updateAttribute, updateProgression, updateInventory }}>
      {children}
    </CharacterContext.Provider>
  );
}

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter deve ser usado dentro de um CharacterProvider");
  return context;
};