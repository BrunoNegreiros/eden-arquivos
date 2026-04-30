export type Attribute = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

export type DamageType = 
  | 'balistico' | 'corte' | 'impacto' | 'perfuracao' 
  | 'fogo' | 'frio' | 'eletricidade' | 'quimico' 
  | 'conhecimento' | 'sangue' | 'morte' | 'energia' | 'medo'
  | 'mental' | 'paranormal'; 

export type ElementType = 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';

export type DiceFace = 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type ItemType = 'weapon' | 'protection' | 'ammo' | 'accessory' | 'explosive' | 'general' | 'cursed';

export type Range = 'adjacente' | 'curto' | 'medio' | 'longo' | 'extremo';

export type Complexity = 'simple' | 'tactical' | 'heavy';

export type HandType = 'light' | 'one' | 'two';

export type WeaponSubtype = 'melee' | 'ranged';

export type Operation = 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
export type TermType = 
  | 'fixed' | 'dice' | 'attribute' | 'skill_total' | 'skill_training'
  | 'stat_max' | 'stat_current' | 'stat_temp' | 'nex' | 'pe_limit'
  | 'displacement' | 'defense' | 'dr_value' | 'load_max' | 'load_current'
  | 'action_move' | 'action_std' | 'count_rituals' | 'count_paranormal_powers'
  | 'count_abilities' | 'count_class_powers' | 'count_origin_powers' | 'count_team_powers' | 'prestige_points';

export interface FormulaTerm {
  id: string;
  type: TermType;
  value?: number; 
  diceFace?: number; 
  attribute?: Attribute;
  skill?: string;
  stat?: 'pv' | 'pe' | 'san';
  element?: ElementType; 
  damageType?: DamageType; 
}

export interface Formula {
  terms: FormulaTerm[];
  operations: Operation[];
}

export type EffectCategory = 
  | 'add_fixed' | 'change_dice' | 'add_resistance' | 'learning'
  | 'change_damage' | 'override_power' | 'gain_power' | 'gain_proficiency'
  | 'instant_heal_damage' | 'manual';

export type TargetType = 
  | 'defense' | 'displacement' | 'load_max' | 'action_std' | 'action_move'
  | 'test_skill' | 'test_attribute' | 'test_attack' | 'damage_roll' | 'damage_increase'
  | 'pv_max' | 'pe_max' | 'san_max' | 'pv_temp' | 'pe_temp' | 'san_temp'
  | 'ritual_dt' | 'attribute' | 'dr' | 'immunity_damage' | 'immunity_condition' | 'vulnerability'
  | 'proficiency' | 'pv_current' | 'pe_current' | 'san_current'
  | 'override_ritual' | 'override_ability'
  | 'critical_range' | 'explosive_dt'; // ATUALIZADO AQUI: NOVOS ALVOS!

export interface EffectTarget {
  id: string;
  type: TargetType;
  skill?: string;
  attribute?: Attribute;
  weaponId?: string;
  ritualId?: string;
  abilityId?: string; 
  itemId?: string;
  damageType?: string;
  condition?: string;
  weaponFilter?: 'all' | 'melee' | 'ranged';
  isMultipliable?: boolean;
  damageIndex?: number;
  proficiencyType?: 'simples' | 'taticas' | 'pesadas' | 'leves_armor' | 'pesadas_armor';
}

export interface Effect {
  id: string;
  name?: string;
  category: EffectCategory;
  value: Formula;
  targets: EffectTarget[];
  description?: string;
  textDescription?: string;
  payload?: any; 
  payloadType?: 'ritual' | 'ability' | 'item'; 
  isActive?: boolean;
}

export interface UserOrigin {
    id: string;
    name: string;
    description: string;
    effects: Effect[];
}

export interface BaseUserItem {
  id: string;
  name: string;
  description?: string;
  weight: number; 
  category: number; 
  isEquipped?: boolean;
  amount?: number; 
  effects?: Effect[]; 
}

export interface DamageInstance {
  id: string; 
  diceCount: number;
  diceFace: DiceFace;
  type: DamageType;
  bonus?: Formula; 
  isMultipliable?: boolean;
}

export interface AttackTest {
  skill: string; 
  secondaryDice?: Formula; 
  secondaryBonus?: Formula; 
}

export interface UserWeapon extends BaseUserItem {
  type: 'weapon';
  subtype: WeaponSubtype; 
  hands: HandType;        
  complexity: Complexity; 
  range: Range | string;  
  attackTest?: AttackTest; 
  damage: DamageInstance[];
  critical: {
    range: number;      
    multiplier: number; 
  };
  ammunition?: string; 
  attacks?: any[]; 
}

export interface UserProtection extends BaseUserItem {
  type: 'protection';
  defenseBonus: number;
  damageReduction?: number; 
  isHeavy?: boolean;
}

export interface UserAmmo extends BaseUserItem {
  type: 'ammo';
  ammoDurationType?: 'scenes' | 'single_use' | 'infinite';
  durationScenes?: number;
  leftovers?: number;
}

export interface UserExplosive extends BaseUserItem {
  type: 'explosive';
  range?: string; 
  damage?: DamageInstance[];
  area?: string; 
  dt?: number;
  dtAttribute?: Attribute | 'none'; // ATUALIZADO AQUI: ATRIBUTO PARA DT
  critical?: {
      range: number;
      multiplier: number;
  };
  complexity?: Complexity; 
}

export interface UserCursedItem extends BaseUserItem {
  type: 'cursed';
  element: ElementType;
}

export interface UserAccessory extends BaseUserItem { type: 'accessory'; }
export interface UserGeneralItem extends BaseUserItem { type: 'general'; }

export type AnyUserItem = 
  | UserWeapon | UserProtection | UserAmmo | UserExplosive 
  | UserAccessory | UserGeneralItem | UserCursedItem;

export interface RitualVersion {
    isActive: boolean;
    cost: number;
    execution: string; 
    range: string;
    target: string;
    duration: string;
    resistance: string;
    description: string;
    effects: Effect[];
    requiredCircle?: 2 | 3 | 4;
    affinity?: ElementType; 
    isSustaining?: boolean; 
}

export interface UserRitual {
  id: string;
  name: string;
  element: ElementType;
  circle: 1 | 2 | 3 | 4;
  description?: string; 
  normal: RitualVersion;
  discente: RitualVersion;
  verdadeiro: RitualVersion;
}

export interface UserAbility {
  id: string;
  name: string;
  description: string;
  cost?: number; 
  effects?: Effect[];
  source?: string; 
}

export interface EdensLetterSection {
  id: string;
  title: string;
  description: string;
}

export interface EdensLetter {
  id: string;
  title: string;
  subtitle: string;
  titleColor?: string; 
  headerUrl?: string;  
  createdAt: number;   
  updatedAt: number;   
  sections: EdensLetterSection[];
}

export type UserRole = 'mestre' | 'jogador';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  joinedMesas: string[]; 
}

export interface Mesa {
  id: string;
  name: string;
  accessKey: string; 
  mestreId: string;  
  members: string[]; 
  createdAt: number;
}