import type { AnyUserItem, UserRitual, UserOrigin, Effect, Attribute, UserAbility } from './systemData';





export interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  width: number;
  height: number;
  borderColor?: string;
  backgroundColor?: string;
}

export interface TextNote {
   id: string;
   title: string;
   createdAt: string;
   updatedAt: string;
   coverUrl: string;
   category: string;
   content: Record<string, string>;
}

export interface LevelUpTask {
  id: string;
  text: string;
  isDone: boolean;
}

export interface ImageObject {
  id: string;
  x: number;
  y: number;
  src: string;
  width: number;
  height: number;
}

export interface NotePage {
  id: number;
  title?: string;
  drawing: string;
  texts: TextObject[];
  images: ImageObject[];
}

export interface LevelUpTask {
  id: string;
  text: string;
  isDone: boolean;
}

export interface StatusPool {
  current: number;
  temp: number;
  max?: number; 
}





export interface CharacterAttributes {
  initial: Record<Attribute, number>;
  nexIncreases: Record<Attribute, number>;
}

export interface CharacterPersonal {
  name: string;
  player: string;
  age: number;
  gender: string;
  origin: string; 
  class: 'combatente' | 'especialista' | 'ocultista' | 'mundano';
  trail: string;
  nex: number;
  xp: number;
  prestigePoints: number;
  patent: string;
  
  
  portraitUrl?: string;
  appearance?: string;
  personality?: string;
  history?: string;
  archetype?: string; 
  campaign?: string;
}

export interface CharacterCondition {
  id: string;
  name: string;
  description?: string;
  duration: string; 
  turnsRemaining: number; 
  isActive: boolean;
  effects: Effect[]; 
}

export interface CharacterSkill {
  training: number; 
  otherBonus: number; 
  customName?: string; 
}





export interface CharacterSheet {
  id: string;
  userId: string;
  personal: any; 
  attributes: any;
  status: {
    pv: StatusPool;
    pe: StatusPool;
    san: StatusPool;
    sustainedIds: string[];
    dyingRounds: number;
    isDying: boolean;
  };
  inventory: AnyUserItem[];
  rituals: UserRitual[];
  customOrigin?: UserOrigin; 
  conditions: any[];
  skills: Record<string, any>;
  classPowers: any[]; 
  otherPowers: any[];
  abilities: UserAbility[]; 
  textNotes: TextNote[];    
  proficiencies: string[]; 
  attacks: any[]; 
  resistances: any[];
  notes: any[];
  levelUpTasks?: LevelUpTask[];
}





export const initialCharacterState: CharacterSheet = {
  id: '',
  userId: '',
  personal: { 
    name: '', player: '', origin: '', class: 'mundano', trail: '', nex: 5, prestigePoints: 0,
    age: 0, gender: '', portraitUrl: '', appearance: '', personality: '', history: '', patent: 'Recruta', xp: 0
  },
  status: { 
    pv: { current: 1, temp: 0 }, 
    pe: { current: 1, temp: 0 }, 
    san: { current: 1, temp: 0 },
    sustainedIds: [],
    dyingRounds: 0,
    isDying: false
  },
  attributes: {
    initial: { AGI: 1, INT: 1, VIG: 1, PRE: 1, FOR: 1 },
    nexIncreases: { AGI: 0, INT: 0, VIG: 0, PRE: 0, FOR: 0 }
  },
  inventory: [],
  rituals: [],
  conditions: [],
  skills: {},
  notes: [],
  classPowers: [],
  otherPowers: [],
  abilities: [],
  textNotes: [],
  proficiencies: [],
  attacks: [],
  resistances: [],
  levelUpTasks: []
};