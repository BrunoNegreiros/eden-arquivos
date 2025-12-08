export type AttributeKey = 'agi' | 'for' | 'int' | 'pre' | 'vig';
export type SkillLevel = 'destreinado' | 'treinado' | 'veterano' | 'expert';
export type DamageType = 'balistico' | 'corte' | 'impacto' | 'perfuracao' | 'fogo' | 'frio' | 'eletricidade' | 'quimico' | 'morte' | 'sangue' | 'medo' | 'conhecimento' | 'energia' | 'mental';
export type NumericBonusType = string;

export interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  // Campos adicionados para o editor avançado:
  align: 'left' | 'center' | 'right'; 
  width: number;
  height: number;
  borderColor?: string;
  backgroundColor?: string;
}

// NOVA INTERFACE PARA IMAGENS
export interface ImageObject {
  id: string;
  x: number;
  y: number;
  src: string; // Base64 da imagem
  width: number;
  height: number;
}

export interface NotePage {
  id: number;
  title?: string; // Adicionado título
  drawing: string;
  texts: TextObject[];
  images: ImageObject[];
}

export interface CustomEffect {
  id: string;
  name: string;
  type: 'bonus' | 'penalty' | 'other';
  target?: string; // PV, PE, SAN, Defesa...
  targetSubType?: string; // Atual, Máximo, Tipo de Dano...
  value?: string; // "+1d8", "5", "Resistência"
  description?: string;
}

export interface CustomAbility {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  cost?: number; // PE
  effects: CustomEffect[];
}

export interface ItemEffect {
    id: string; name: string; description: string; targetType?: string; element?: string; allowedTypes?: string[];
    bonuses?: { type: NumericBonusType, value: number | string, condition?: string }[];
    complexEffect?: string;
}

export interface InventoryItem {
    id: string; name: string; category: number; space: number;
    type: 'weapon' | 'protection' | 'general' | 'ammo' | 'amaldicoado' | 'accessory' | 'explosive' | 'paranormal';
    subType?: string; quantity: number; isEquipped: boolean;
    modifications: ItemEffect[]; curses: ItemEffect[]; damage?: string; details?: string;
}

export type TeamRole = 'tanque' | 'suporte' | 'curandeiro' | 'oportunista' | 'investigador' | 'terapeuta' | 'sabotador' | 'polivalente' | 'lobo_solitario'; 

export interface ActiveCondition {
  id: string; name: string; description: string; durationType: 'turnos' | 'cena' | 'indefinida'; durationValue?: number; effects?: { target: string, value: number }[];
}

export interface CharacterSheet {
  id: string; userId: string; createdAt: string; updatedAt: string; isPublic: boolean; version: string; isPrivate?: boolean;

  info: {
    name: string; player: string; campaign: string; archetype: string; age: number; gender: string; portraitUrl: string; appearance: string; personality: string; history: string;
  };

  attributes: { agi: number; for: number; int: number; pre: number; vig: number; };

  notes: NotePage[];

  progression: {
    nex: number; patente: string; prestigePoints: number;
    class: 'combatente' | 'especialista' | 'ocultista' | 'mundano';
    origin: { id: string; name: string; }; trail: string;
    affinity?: string | null | undefined;
    attributeIncreases?: Record<number, string>;
  };

  status: {
    pv: { current: number; max: number; temp: number; }; 
    pe: { current: number; max: number; temp: number; }; 
    san: { current: number; max: number; temp: number; }; 
    defense: { passiveMod: number; tempMod: number; };
    displacement: { baseMetres: number; tempMod: number; };
    resistances: Record<DamageType, number>; 
    immunities: DamageType[];
    conditions: ActiveCondition[];
    // NOVO: Array de IDs dos rituais sendo sustentados atualmente
    sustainedIds: string[]; 
  };

  skills: Record<string, { level: SkillLevel; isTrained: boolean; miscBonus: number; customName?: string; }>;

  inventory: { items: InventoryItem[]; weapons: any[]; creditLimit: string; maxLoad: number; };

  abilities: any[];
  rituals: any[]; // Aqui ficam os rituais aprendidos
  
  teamStrategy: {
    role: TeamRole; roleAbilities: Array<{ id: string; name: string; currentLevel: 0 | 1 | 2 | 3 | 4 | 5; }>;
    favoriteFormations: string[]; isFormationActive: boolean;
    loneWolf: { isActive: boolean; extraPowersChosen: Array<{ nexSource: number; powerId: string; powerName: string; }>; };
  };

  classPowers: {
    coreLevel: number; // Nível do poder principal (0 a 3)
    selectedIds: string[]; // IDs de classPowers.ts
  };
  paranormalPowers: string[]; // IDs de paranormalPowers.ts
  customAbilities: CustomAbility[];

  combatLog: any[];
}