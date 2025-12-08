import { 
  Swords, Shield, Crosshair, Zap, AlertTriangle, 
  RefreshCw, Gavel, ChevronDown, ChevronUp, Link, Calculator, Infinity, Info, Target, Package
} from 'lucide-react';
import type { CharacterSheet, InventoryItem } from '../../types/characterSchema';

// Exportando tipos para uso no componente Pai
export interface SubRollResult {
    totalAttack: number;
    attackBreakdown: string;
    isCrit: boolean;
    damageValue: number;
    damageBreakdown: string;
}

export interface RollResultType {
    weaponName: string;
    results: SubRollResult[];
}

export interface CombatState {
    expandedWeapon: string | null;
    attackMode: Record<string, 'padrao' | 'duas_maos' | 'agil'>;
    unbridledMode: Record<string, 'normal' | '2_attacks' | '3_attacks' | 'burst'>;
    rollResult: RollResultType | null;
    damageMode: 'roll' | 'average';
    attachedAmmo: Record<string, string>;
    ammoCounters: Record<string, number>;
    ammoLeftovers: Record<string, number>;
    ammoSceneTracker?: Record<string, number>;
}

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
  combatState: CombatState;
  setCombatState: React.Dispatch<React.SetStateAction<CombatState>>;
}

// --- DADOS AUXILIARES ---
const WEAPON_CRITS: Record<string, { range: number, mult: number }> = {
  'Pregador pneumático': { range: 20, mult: 4 }, 'Estilingue': { range: 20, mult: 2 },
  'Coronhada': { range: 20, mult: 2 }, 'Faca': { range: 19, mult: 2 },
  'Martelo': { range: 20, mult: 2 }, 'Punhal': { range: 20, mult: 3 },
  'Bastão': { range: 20, mult: 2 }, 'Machete': { range: 19, mult: 2 },
  'Lança': { range: 20, mult: 2 }, 'Cajado': { range: 20, mult: 2 },
  'Arco': { range: 20, mult: 3 }, 'Besta': { range: 19, mult: 2 },
  'Machadinha': { range: 20, mult: 3 }, 'Nunchaku': { range: 20, mult: 2 },
  'Corrente': { range: 20, mult: 2 }, 'Espada': { range: 19, mult: 2 },
  'Florete': { range: 18, mult: 2 }, 'Machado': { range: 20, mult: 3 },
  'Maça': { range: 20, mult: 2 }, 'Baioneta': { range: 19, mult: 2 },
  'Faca tática': { range: 19, mult: 2 }, 'Gancho de carne': { range: 20, mult: 4 },
  'Bastão policial': { range: 20, mult: 2 }, 'Picareta': { range: 20, mult: 4 },
  'Shuriken': { range: 20, mult: 2 }, 'Acha': { range: 20, mult: 3 },
  'Gadanho': { range: 20, mult: 4 }, 'Katana': { range: 19, mult: 2 },
  'Marreta': { range: 20, mult: 2 }, 'Montante': { range: 19, mult: 2 },
  'Motoserra': { range: 20, mult: 2 }, 'Arco composto': { range: 20, mult: 3 },
  'Balestra': { range: 19, mult: 2 },
  'Revólver compacto': { range: 19, mult: 3 }, 'Pistola': { range: 18, mult: 2 },
  'Revólver': { range: 19, mult: 3 }, 'Fuzil de caça': { range: 19, mult: 3 },
  'Pistola pesada': { range: 18, mult: 2 }, 'Espingarda de cano duplo': { range: 20, mult: 3 },
  'Submetralhadora': { range: 19, mult: 3 }, 'Espingarda': { range: 20, mult: 3 },
  'Fuzil de assalto': { range: 19, mult: 3 }, 'Fuzil de precisão': { range: 19, mult: 3 },
  'Bazuca': { range: 20, mult: 2 }, 'Lança-chamas': { range: 20, mult: 2 },
  'Metralhadora': { range: 19, mult: 3 },
};

interface AmmoRule {
    type: 'scene' | 'single' | 'infinite';
    lowUsageLimit?: number; 
    scenesPerUnit?: number; 
}

const AMMO_RULES: Record<string, AmmoRule> = {
    'balas curtas': { type: 'scene', lowUsageLimit: 6, scenesPerUnit: 3 },
    'balas longas': { type: 'scene', lowUsageLimit: 6, scenesPerUnit: 2 },
    'cartuchos': { type: 'scene', lowUsageLimit: 4, scenesPerUnit: 2 },
    'combustível': { type: 'scene', lowUsageLimit: 4, scenesPerUnit: 2 },
    'foguete': { type: 'single', scenesPerUnit: 1 },
};

// Helper para Maldições
const getCursePenalty = (element?: string) => {
  switch (element) {
    case 'sangue': return "Falha em testes de FOR ou VIG: -2 SAN";
    case 'morte': return "Falha em testes de PRE: -2 SAN";
    case 'conhecimento': return "Falha em testes de INT: -2 SAN";
    case 'energia': return "Falha em testes de AGI: -2 SAN";
    default: return "";
  }
};

const getElementColor = (element?: string) => {
    switch (element) {
        case 'sangue': return 'text-red-500';
        case 'morte': return 'text-zinc-400';
        case 'conhecimento': return 'text-amber-400';
        case 'energia': return 'text-violet-400';
        case 'medo': return 'text-white';
        default: return 'text-eden-100';
    }
};

export default function SheetCombat({ character, onUpdate, combatState, setCombatState }: Props) {
  const { expandedWeapon, attackMode, rollResult, damageMode, attachedAmmo, ammoCounters, ammoLeftovers, ammoSceneTracker = {}, unbridledMode = {} } = combatState;

  // --- HELPERS ---
  const getAmmoRule = (ammoName: string): AmmoRule => {
      if (!ammoName) return { type: 'infinite' };
      const lowerName = ammoName.toLowerCase();
      const key = Object.keys(AMMO_RULES).find(k => lowerName.includes(k.toLowerCase()));
      return key ? AMMO_RULES[key] : { type: 'infinite' };
  };

  const getStatusColor = (count: number) => {
      if (count === 0) return { bar: 'bg-eden-700', text: 'text-eden-100/30', border: 'border-eden-700' };
      if (count === 1) return { bar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]', text: 'text-emerald-500', border: 'border-emerald-500/50' };
      if (count >= 2 && count <= 7) return { bar: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]', text: 'text-yellow-500', border: 'border-yellow-500/50' };
      return { bar: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]', text: 'text-red-500', border: 'border-red-500/50' };
  };

  const calculateTotalScenes = (item: InventoryItem, rule: AmmoRule) => {
      if (rule.type !== 'scene') return item.quantity;
      const spu = rule.scenesPerUnit || 1;
      const currentPackScenes = ammoSceneTracker[item.id];
      if (currentPackScenes !== undefined) {
          return ((item.quantity - 1) * spu) + currentPackScenes;
      }
      return item.quantity * spu;
  };

  const isAutomaticWeapon = (weapon: InventoryItem) => {
      const details = (weapon.details || '').toLowerCase();
      const name = weapon.name.toLowerCase();
      const autoNames = ['submetralhadora', 'fuzil de assalto', 'metralhadora', 'minigun'];
      return details.includes('automática') || autoNames.some(n => name.includes(n));
  };

  // --- CÁLCULOS DE COMBATE ---
  const getAttackAttribute = (weapon: InventoryItem) => {
    const details = (weapon.details || '').toLowerCase();
    const isAgile = details.includes('ágil') || (WEAPON_CRITS[weapon.name] && WEAPON_CRITS[weapon.name].range < 20); 
    const manualMode = attackMode[weapon.id];
    if (manualMode === 'agil') return 'agi';
    if (weapon.subType === 'ranged' || weapon.subType === 'firearm') return 'agi';
    if (isAgile && character.attributes.agi > character.attributes.for) return 'agi';
    return 'for';
  };

  const getAttackStats = (weapon: InventoryItem) => {
    const attrKey = getAttackAttribute(weapon);
    const attrValue = character.attributes[attrKey];
    let bonus = 0;
    let bonusBreakdown: string[] = [];
    
    let skillName = 'Luta';
    if (weapon.subType === 'firearm' || weapon.subType === 'ranged') skillName = 'Pontaria';
    
    const skill = character.skills[skillName];
    if (skill) {
      let skillBonus = 0;
      if (skill.level === 'treinado') skillBonus = 5;
      if (skill.level === 'veterano') skillBonus = 10;
      if (skill.level === 'expert') skillBonus = 15;
      skillBonus += skill.miscBonus;
      if (skillBonus > 0) {
          bonus += skillBonus;
          bonusBreakdown.push(`${skillBonus} (${skillName})`);
      }
    }

    weapon.modifications.forEach(mod => {
      if (mod.bonuses) {
        mod.bonuses.forEach(b => { 
            if (b.type === 'attack_roll') {
                const val = (typeof b.value === 'number' ? b.value : 0);
                bonus += val;
                bonusBreakdown.push(`${val} (${mod.name})`);
            }
        });
      }
    });
    weapon.curses.forEach(curse => {
        if (curse.name === 'Energética') {
            bonus += 5;
            bonusBreakdown.push(`5 (Energética)`);
        }
    });
    character.status.conditions.forEach(c => {
        if (['Fraco', 'Debilitado'].includes(c.name) && attrKey === 'for') {
            bonus -= 2;
            bonusBreakdown.push(`-2 (${c.name})`);
        }
    });

    return { attrKey, attrValue, bonus, bonusBreakdown, skillName };
  };

  const getCritStats = (weapon: InventoryItem) => {
    const base = WEAPON_CRITS[weapon.name] || { range: 20, mult: 2 };
    let range = base.range;
    let mult = base.mult;
    weapon.modifications.forEach(mod => {
        if (mod.id === 'mira_laser' || mod.id === 'perigosa') range -= 2;
        if (mod.id === 'dum_dum') mult += 1;
    });
    weapon.curses.forEach(curse => {
        if (curse.name === 'Predadora') range = 20 - ((20 - range) * 2);
    });
    
    const ammoId = attachedAmmo[weapon.id];
    if (ammoId) {
        const ammoItem = character.inventory.items.find(i => i.id === ammoId);
        if (ammoItem) {
             if (ammoItem.modifications.some(m => m.id === 'dum_dum')) mult += 1;
        }
    }

    if (weapon.name === 'Fuzil de Precisão' && character.skills['Pontaria']?.level !== 'destreinado' && character.skills['Pontaria']?.level !== 'treinado') {
        range -= 5; 
    }
    return { range, mult };
  };

  const parseDamage = (damageString: string) => {
      if (!damageString) return { count: 1, faces: 4, bonus: 0 };
      const match = damageString.match(/(\d+)d(\d+)(?:\+(\d+))?/);
      if (match) {
          return { count: parseInt(match[1]), faces: parseInt(match[2]), bonus: match[3] ? parseInt(match[3]) : 0 };
      }
      return { count: 1, faces: 4, bonus: 0 }; 
  };

  const calculateDamage = (weapon: InventoryItem, isCrit: boolean, critMult: number) => {
      let rawDano = weapon.damage || '1d4';
      if (attackMode[weapon.id] === 'duas_maos' && rawDano.includes('/')) {
          rawDano = rawDano.split('/')[1];
      } else if (rawDano.includes('/')) {
          rawDano = rawDano.split('/')[0];
      }
      rawDano = rawDano.split(' ')[0];
      
      const { count, faces, bonus: baseBonus } = parseDamage(rawDano);
      let finalCount = count;
      let totalBonus = baseBonus;
      let bonusDesc: string[] = [];

      const currentUnbridled = unbridledMode[weapon.id] || 'normal';
      if (currentUnbridled === 'burst') {
          finalCount += 1;
          bonusDesc.push('+1d (Rajada)');
      }

      if (weapon.subType === 'melee') {
          const str = character.attributes.for;
          if (str > 0) { totalBonus += str; bonusDesc.push(`${str} (FOR)`); }
      }
      
      weapon.modifications.forEach(mod => {
          if(mod.bonuses) {
              mod.bonuses.forEach(b => {
                  if (b.type === 'damage_roll' && typeof b.value === 'number') {
                      totalBonus += b.value;
                      bonusDesc.push(`${b.value} (${mod.name})`);
                  }
              })
          }
      });

      let damageTotal = 0;
      let finalBreakdown = '';
      
      if (damageMode === 'roll') {
          const finalDiceCount = isCrit ? finalCount * critMult : finalCount;
          const rolls = Array.from({ length: finalDiceCount }, () => Math.ceil(Math.random() * faces));
          const diceSum = rolls.reduce((a, b) => a + b, 0);
          damageTotal = diceSum + totalBonus;
          finalBreakdown = `[${rolls.join('+')}]${totalBonus > 0 ? ' + ' + totalBonus : ''}`;
          if (bonusDesc.length > 0) finalBreakdown += ` (${bonusDesc.join(', ')})`;
      } else {
          const baseAverage = (finalCount * faces) / 2; 
          const diceDamage = baseAverage * (isCrit ? critMult : 1);
          damageTotal = Math.floor(diceDamage + totalBonus);
          const mathDesc = isCrit ? `((${finalCount}*${faces})/2 * ${critMult})` : `(${finalCount}*${faces})/2`;
          finalBreakdown = `${mathDesc} = ${diceDamage}${totalBonus > 0 ? ' + ' + totalBonus : ''}`;
          if (bonusDesc.length > 0) finalBreakdown += ` (${bonusDesc.join(', ')})`;
      }
      return { damageTotal, finalBreakdown, damageString: `${finalCount}d${faces}` };
  };

  const handleRollAttack = (weapon: InventoryItem) => {
    let ammoUpdates = {}; 
    let inventoryUpdates: InventoryItem[] | null = null;
    
    const isRanged = weapon.subType === 'firearm' || weapon.subType === 'ranged';
    const currentUnbridled = unbridledMode[weapon.id] || 'normal';

    if (isRanged) {
        const ammoId = attachedAmmo[weapon.id];
        if (!ammoId) { alert("Selecione uma munição antes de atacar!"); return; }
        const ammoItem = character.inventory.items.find(i => i.id === ammoId);
        if (!ammoItem) { alert("Munição não encontrada no inventário!"); return; }
        
        const rule = getAmmoRule(ammoItem.name);
        if (rule.type !== 'infinite' && ammoItem.quantity <= 0) {
                alert("Munição esgotada!"); return;
        }

        const cost = currentUnbridled === 'burst' ? 3 : 1;

        if (rule.type === 'single') {
            const newQty = ammoItem.quantity - 1;
            if (newQty <= 0) {
                inventoryUpdates = character.inventory.items.filter(i => i.id !== ammoId);
                const newAttached = { ...attachedAmmo };
                delete newAttached[weapon.id];
                ammoUpdates = { ...ammoUpdates, attachedAmmo: newAttached };
                alert(`${ammoItem.name} acabou e foi removida!`);
            } else {
                inventoryUpdates = character.inventory.items.map(i => i.id === ammoId ? { ...i, quantity: newQty } : i);
            }
        } else if (rule.type === 'scene') {
            const leftover = ammoLeftovers[ammoId];
            const currentDots = ammoCounters[ammoId] || 0;
            
            if (leftover !== undefined) {
                const newLeftover = leftover - cost;
                if (newLeftover <= 0) {
                        const scenesPerUnit = rule.scenesPerUnit || 1;
                        const currentSceneVal = ammoSceneTracker[ammoId] ?? scenesPerUnit;
                        const newSceneVal = currentSceneVal - 1;
                        
                        if (newSceneVal <= 0) {
                            const newQty = ammoItem.quantity - 1;
                            if (newQty <= 0) {
                                inventoryUpdates = character.inventory.items.filter(i => i.id !== ammoId);
                                const newL = { ...ammoLeftovers }; delete newL[ammoId];
                                const newT = { ...ammoSceneTracker }; delete newT[ammoId];
                                const newAttached = { ...attachedAmmo }; delete newAttached[weapon.id]; 
                                ammoUpdates = { ...ammoUpdates, ammoLeftovers: newL, ammoSceneTracker: newT, attachedAmmo: newAttached };
                                alert(`${ammoItem.name} acabou completamente!`);
                            } else {
                                inventoryUpdates = character.inventory.items.map(i => i.id === ammoId ? { ...i, quantity: newQty } : i);
                                const newL = { ...ammoLeftovers }; delete newL[ammoId];
                                const newT = { ...ammoSceneTracker, [ammoId]: scenesPerUnit };
                                const newC = { ...ammoCounters, [ammoId]: 0 };
                                ammoUpdates = { ...ammoUpdates, ammoLeftovers: newL, ammoSceneTracker: newT, ammoCounters: newC };
                                alert(`Sobra acabou. Consumiu 1 pacote. Novo pacote aberto.`);
                            }
                        } else {
                            const newL = { ...ammoLeftovers }; delete newL[ammoId];
                            const newT = { ...ammoSceneTracker, [ammoId]: newSceneVal };
                            const newC = { ...ammoCounters, [ammoId]: 0 };
                            ammoUpdates = { ...ammoUpdates, ammoLeftovers: newL, ammoSceneTracker: newT, ammoCounters: newC };
                            alert(`Sobra acabou. Deduzida 1 cena do pacote atual.`);
                        }
                } else {
                    const newL = { ...ammoLeftovers, [ammoId]: newLeftover };
                    ammoUpdates = { ...ammoUpdates, ammoLeftovers: newL };
                }
            } else {
                let newDots = currentDots + cost;
                if (newDots >= 10) {
                        const scenesPerUnit = rule.scenesPerUnit || 1;
                        const currentSceneVal = ammoSceneTracker[ammoId] ?? scenesPerUnit;
                        const newSceneVal = currentSceneVal - 1;
                        
                        if (newSceneVal <= 0) {
                            const newQty = ammoItem.quantity - 1;
                            if (newQty <= 0) {
                                inventoryUpdates = character.inventory.items.filter(i => i.id !== ammoId);
                                const newC = { ...ammoCounters }; delete newC[ammoId];
                                const newT = { ...ammoSceneTracker }; delete newT[ammoId];
                                const newL = { ...ammoLeftovers }; delete newL[ammoId];
                                ammoUpdates = { ...ammoUpdates, ammoCounters: newC, ammoSceneTracker: newT, ammoLeftovers: newL };
                                alert(`Contador estourou! ${ammoItem.name} acabou.`);
                            } else {
                                inventoryUpdates = character.inventory.items.map(i => i.id === ammoId ? { ...i, quantity: newQty } : i);
                                const newT = { ...ammoSceneTracker, [ammoId]: scenesPerUnit };
                                const newC = { ...ammoCounters, [ammoId]: newDots - 10 };
                                ammoUpdates = { ...ammoUpdates, ammoSceneTracker: newT, ammoCounters: newC };
                                alert(`Contador estourou! -1 pacote.`);
                            }
                        } else {
                            const newT = { ...ammoSceneTracker, [ammoId]: newSceneVal };
                            const newC = { ...ammoCounters, [ammoId]: newDots - 10 };
                            ammoUpdates = { ...ammoUpdates, ammoSceneTracker: newT, ammoCounters: newC };
                            alert(`Contador estourou! -1 cena do pacote.`);
                        }
                } else {
                    const newC = { ...ammoCounters, [ammoId]: newDots };
                    ammoUpdates = { ...ammoUpdates, ammoCounters: newC };
                }
            }
        }
    }

    const { attrValue, bonus, bonusBreakdown, skillName } = getAttackStats(weapon);
    const { range, mult } = getCritStats(weapon);
    
    let numberOfAttacks = 1;
    let dicePenalty = 0;

    if (currentUnbridled === '2_attacks') { numberOfAttacks = 2; dicePenalty = 1; }
    else if (currentUnbridled === '3_attacks') { numberOfAttacks = 3; dicePenalty = 2; }
    else if (currentUnbridled === 'burst') { numberOfAttacks = 1; dicePenalty = 1; }

    const results: SubRollResult[] = [];

    for (let i = 0; i < numberOfAttacks; i++) {
        const effectiveAttr = attrValue - dicePenalty;
        let finalDie = 0;
        let rollBreakdown = '';
        
        if (effectiveAttr <= 0) {
            const r1 = Math.ceil(Math.random() * 20);
            const r2 = Math.ceil(Math.random() * 20);
            finalDie = Math.min(r1, r2);
            rollBreakdown = `(Dados: ${r1}, ${r2} [Menor] | -${dicePenalty}d20)`;
        } else {
            const rolls = Array.from({ length: effectiveAttr }, () => Math.ceil(Math.random() * 20));
            finalDie = Math.max(...rolls);
            rollBreakdown = `(Dados: [${rolls.join(', ')}] [Maior] | -${dicePenalty}d20)`;
        }

        const totalAttack = finalDie + bonus;
        const isCrit = finalDie >= range;
        let attackStr = `${finalDie} ${rollBreakdown}`;
        if (bonusBreakdown.length > 0) { attackStr += ` + ${bonusBreakdown.join(' + ')}`; }
        
        const { damageTotal, finalBreakdown } = calculateDamage(weapon, isCrit, mult);

        results.push({
            totalAttack,
            attackBreakdown: attackStr,
            isCrit,
            damageValue: damageTotal,
            damageBreakdown: finalBreakdown
        });
    }
    
    if (inventoryUpdates) {
        onUpdate({ inventory: { ...character.inventory, items: inventoryUpdates } });
    }
    
    setCombatState(prev => ({
        ...prev,
        ...ammoUpdates,
        rollResult: {
            weaponName: `${weapon.name} (${skillName})`,
            results: results
        }
    }));
  };

  const handleNewScene = () => {
      if(!confirm("Iniciar nova cena? Isso processará o uso de munição.")) return;

      const newInventory = [...character.inventory.items];
      const newLeftovers = { ...(ammoLeftovers || {}) };
      const newSceneTracker = { ...(ammoSceneTracker || {}) };
      let updatesMade = false;

      Object.entries(ammoCounters).forEach(([ammoId, count]) => {
          const itemIndex = newInventory.findIndex(i => i.id === ammoId);
          if (itemIndex === -1) return;
          const item = newInventory[itemIndex];
          const rule = getAmmoRule(item.name);

          if (newLeftovers[ammoId] !== undefined) return; 

          if (count === 1 && rule.lowUsageLimit) {
              newLeftovers[ammoId] = rule.lowUsageLimit; 
              alert(`Uso Baixo de ${item.name}: Preservada! (${rule.lowUsageLimit} ataques restantes).`);
          } 
          else if (count > 1 || (count === 1 && !rule.lowUsageLimit)) {
              const scenesPerUnit = rule.scenesPerUnit || 1;
              if (newSceneTracker[ammoId] === undefined) {
                  newSceneTracker[ammoId] = scenesPerUnit;
              }
              newSceneTracker[ammoId] -= 1;

              if (newSceneTracker[ammoId] <= 0) {
                  if (item.quantity > 0) {
                      item.quantity -= 1;
                      updatesMade = true;
                      if (item.quantity > 0) {
                          newSceneTracker[ammoId] = scenesPerUnit;
                          alert(`Fim de cena: ${item.name} consumiu 1 carga completa.`);
                      } else {
                          newInventory.splice(itemIndex, 1);
                          delete newSceneTracker[ammoId];
                          alert(`${item.name} acabou completamente.`);
                          updatesMade = true;
                      }
                  }
              } else {
                  alert(`Fim de cena: ${item.name} usou 1 duração. Restam ${newSceneTracker[ammoId]} cenas neste pacote.`);
              }
          }
      });

      setCombatState(prev => ({
          ...prev,
          ammoCounters: {},
          ammoLeftovers: newLeftovers,
          ammoSceneTracker: newSceneTracker
      }));

      if (updatesMade) {
          onUpdate({ inventory: { ...character.inventory, items: newInventory } });
      }
  };

  const availableAmmo = character.inventory.items.filter(i => i.type === 'ammo');
  const equippedWeapons = character.inventory.items.filter(i => i.type === 'weapon' && i.isEquipped);
  let currentDefense = 10 + character.attributes.agi + character.status.defense.passiveMod + character.status.defense.tempMod;
  character.inventory.items.forEach(i => {
      if (i.isEquipped) {
          if (i.type === 'protection') {
              if (i.name.includes('Pesada')) currentDefense += 10;
              else if (i.name.includes('Leve')) currentDefense += 5;
              else if (i.name.includes('Escudo')) currentDefense += 2;
              if (i.modifications.some(m => m.id === 'reforcada')) currentDefense += 2;
              if (i.modifications.some(m => m.id === 'cinetica')) currentDefense += 2;
          }
          i.curses.forEach(c => { if (c.name === 'Repulsora' || c.name === 'Vibrante') currentDefense += 2; });
      }
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-eden-800 border border-eden-700 p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5"></div>
              <Shield className="text-blue-400 mb-1" size={20} />
              <span className="text-2xl font-black text-white">{currentDefense}</span>
              <span className="text-[10px] uppercase font-bold text-eden-100/50">Defesa</span>
          </div>
          <div className="bg-eden-800 border border-eden-700 p-3 rounded-xl flex flex-col items-center justify-center">
              <Zap className="text-yellow-400 mb-1" size={20} />
              <span className="text-2xl font-black text-white">{character.status.displacement.baseMetres}m</span>
              <span className="text-[10px] uppercase font-bold text-eden-100/50">Deslocamento</span>
          </div>
          <div className="bg-eden-800 border border-eden-700 p-3 rounded-xl flex flex-col items-center justify-center col-span-2">
              <div className="flex gap-2 w-full justify-center items-center">
                  <button onClick={() => setCombatState(prev => ({ ...prev, damageMode: prev.damageMode === 'roll' ? 'average' : 'roll' }))} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${damageMode === 'average' ? 'bg-conhecimento/20 border-conhecimento text-conhecimento' : 'bg-eden-900 border-eden-700 text-eden-100/50'}`}><Calculator size={14} /> {damageMode === 'average' ? 'Dano Médio' : 'Rolar Dano'}</button>
                  <div className="w-px h-6 bg-eden-700 mx-1"></div>
                  <button onClick={handleNewScene} className="flex items-center gap-2 px-3 py-2 bg-eden-900 hover:bg-red-900/50 border border-eden-700 rounded-lg text-xs font-bold text-eden-100/60 hover:text-red-200 transition-colors"><RefreshCw size={14}/> Nova Cena</button>
              </div>
          </div>
      </div>

      {rollResult && (
          <div className={`p-4 rounded-xl border relative overflow-hidden animate-in zoom-in-95 ${rollResult.results.some(r => r.isCrit) ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-eden-800 border-eden-600'}`}>
              <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-eden-100/50 uppercase flex items-center gap-2"><Swords size={12}/> {rollResult.weaponName}</span>
              </div>
              <div className="space-y-3">
                  {rollResult.results.map((res, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-4 border-t border-eden-700/50 pt-3 first:border-0 first:pt-0">
                          <div className="bg-black/20 p-3 rounded-lg relative overflow-hidden">
                              <div className="text-[9px] uppercase font-bold text-eden-100/30 mb-1">Ataque #{idx + 1}</div>
                              <div className="text-3xl font-black text-white leading-none mb-1">{res.totalAttack}</div>
                              <div className="text-[9px] text-eden-100/60 font-mono">{res.attackBreakdown}</div>
                              {res.isCrit && <div className="absolute top-2 right-2 text-[9px] font-black text-yellow-400 border border-yellow-500/50 px-1 rounded bg-yellow-500/10">CRÍTICO</div>}
                          </div>
                          <div className={`p-3 rounded-lg ${res.isCrit ? 'bg-red-900/20 border border-red-500/20' : 'bg-black/20'}`}>
                              <div className="text-[9px] uppercase font-bold text-eden-100/30 mb-1">Dano</div>
                              <div className="text-3xl font-black text-red-400 leading-none mb-1">{res.damageValue}</div>
                              <div className="text-[9px] text-eden-100/60 font-mono">{res.damageBreakdown}</div>
                          </div>
                      </div>
                  ))}
              </div>
              <button onClick={() => setCombatState(prev => ({ ...prev, rollResult: null }))} className="absolute top-2 right-2 text-eden-100/20 hover:text-white"><div className="w-4 h-4 bg-black/20 rounded-full flex items-center justify-center">x</div></button>
          </div>
      )}

      <div className="space-y-3">
          {equippedWeapons.length === 0 && (
              <div className="text-center py-10 text-eden-100/30 italic border-2 border-dashed border-eden-800 rounded-xl text-sm">Nenhuma arma equipada.</div>
          )}
          {equippedWeapons.map(weapon => {
              const isExpanded = expandedWeapon === weapon.id;
              const { attrKey, bonus } = getAttackStats(weapon);
              const { range, mult } = getCritStats(weapon);
              const damageDice = attackMode[weapon.id] === 'duas_maos' && weapon.damage?.includes('/') ? weapon.damage.split('/')[1] : (weapon.damage?.split('/')[0] || '1d4');
              const isRanged = weapon.subType === 'firearm' || weapon.subType === 'ranged';
              const ammoId = attachedAmmo[weapon.id];
              const ammoItem = availableAmmo.find(a => a.id === ammoId);
              const currentDots = ammoCounters[ammoId || ''] || 0;
              const leftover = ammoLeftovers ? ammoLeftovers[ammoId || ''] : undefined;
              const ammoRule = getAmmoRule(ammoItem?.name || ''); 
              const statusColor = getStatusColor(currentDots);
              const totalScenes = ammoItem ? calculateTotalScenes(ammoItem, ammoRule) : 0;
              const isAutomatic = isAutomaticWeapon(weapon);
              const currentUnbridled = unbridledMode[weapon.id] || 'normal';

              return (
                  <div key={weapon.id} className={`bg-eden-800 border transition-all duration-200 rounded-xl overflow-hidden ${isExpanded ? 'border-energia shadow-lg ring-1 ring-energia/20' : 'border-eden-700'}`}>
                      {/* HEADER DO CARD (Mobile: Coluna, Desktop: Linha) */}
                      <div className="p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center cursor-pointer hover:bg-eden-700/30 transition-colors relative" onClick={() => setCombatState(prev => ({ ...prev, expandedWeapon: isExpanded ? null : weapon.id }))}>
                          
                          {/* Ícone e Nome (Topo no mobile) */}
                          <div className="flex items-center gap-3 w-full md:w-auto">
                              <div className={`p-2 md:p-3 rounded-lg shrink-0 ${isRanged ? 'bg-yellow-900/20 text-yellow-500' : 'bg-red-900/20 text-red-500'}`}>
                                  {isRanged ? <Crosshair size={20} className="md:w-6 md:h-6"/> : <Swords size={20} className="md:w-6 md:h-6"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-0.5">
                                      <h3 className="font-bold text-eden-100 text-base md:text-lg truncate">{weapon.name}</h3>
                                      <div className="text-lg md:text-xl font-black text-white bg-eden-900 px-2 py-0.5 rounded border border-eden-700">{bonus >= 0 ? `+${bonus}` : bonus}</div>
                                  </div>
                                  {/* Stats compactos no mobile */}
                                  <div className="flex gap-3 text-[10px] md:text-xs text-eden-100/50 font-mono">
                                      <span className="flex items-center gap-1"><Gavel size={10}/> {damageDice}</span>
                                      <span className="flex items-center gap-1"><AlertTriangle size={10}/> {range}/{mult}x</span>
                                      <span className="uppercase text-eden-100/30">{attrKey}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <button className="absolute top-3 right-3 md:relative md:top-auto md:right-auto text-eden-100/30">{isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</button>
                      </div>

                      {isExpanded && (
                          <div className="p-4 bg-eden-900/50 border-t border-eden-700 space-y-4 animate-in slide-in-from-top-2">
                              {/* MODIFICAÇÕES E MALDIÇÕES COM DESCRIÇÃO */}
                              {(weapon.modifications.length > 0 || weapon.curses.length > 0 || weapon.details) && (
                                  <div className="text-[10px] md:text-xs text-eden-100/70 space-y-2 pb-2 border-b border-eden-700/30">
                                      {weapon.details && <p className="italic opacity-60">"{weapon.details}"</p>}
                                      
                                      {weapon.modifications.map(m => (
                                          <div key={m.id} className="bg-black/20 p-2 rounded">
                                              <span className="text-conhecimento font-bold block mb-0.5">{m.name}</span>
                                              <span className="opacity-80">{m.description}</span>
                                          </div>
                                      ))}
                                      
                                      {weapon.curses.map(c => (
                                          <div key={c.id} className="bg-red-900/10 border border-red-900/30 p-2 rounded">
                                              <div className="flex justify-between items-start">
                                                  <span className={`font-bold block mb-0.5 ${getElementColor(c.element)}`}>{c.name}</span>
                                                  <span className="text-[8px] bg-red-900 text-red-200 px-1 rounded uppercase tracking-wider">Maldição</span>
                                              </div>
                                              <span className="opacity-80 block mb-1">{c.description}</span>
                                              {/* PENALIDADE DE SANIDADE */}
                                              <div className="text-[9px] text-red-400 font-mono bg-black/20 p-1 rounded inline-block">
                                                  ⚠ {getCursePenalty(c.element)}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              {/* OPÇÕES DE ATAQUE (Quebra de linha com flex-wrap) */}
                              <div className="flex flex-wrap gap-2">
                                  <button onClick={() => setCombatState(prev => ({ ...prev, attackMode: { ...prev.attackMode, [weapon.id]: prev.attackMode[weapon.id] === 'agil' ? 'padrao' : 'agil' } }))} className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${attackMode[weapon.id] === 'agil' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' : 'bg-eden-900 border-eden-700 text-eden-100/50'}`}>Ágil (AGI)</button>
                                  {weapon.damage?.includes('/') && (
                                      <button onClick={() => setCombatState(prev => ({ ...prev, attackMode: { ...prev.attackMode, [weapon.id]: prev.attackMode[weapon.id] === 'duas_maos' ? 'padrao' : 'duas_maos' } }))} className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${attackMode[weapon.id] === 'duas_maos' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-eden-900 border-eden-700 text-eden-100/50'}`}>Duas Mãos</button>
                                  )}
                              </div>

                              {/* ATAQUES DESENFREADOS / RAJADA */}
                              <div className="bg-eden-950/50 p-2 rounded border border-eden-700/50 mt-2">
                                  <span className="text-[9px] text-eden-100/40 uppercase font-bold mb-1.5 block">Modo de Ataque</span>
                                  <div className="flex flex-wrap gap-1">
                                      {weapon.subType === 'melee' ? (
                                          <>
                                              <button onClick={() => setCombatState(prev => ({ ...prev, unbridledMode: { ...prev.unbridledMode, [weapon.id]: 'normal' } }))} className={`flex-1 min-w-[60px] py-1.5 text-[10px] font-bold rounded border transition-all ${currentUnbridled === 'normal' ? 'bg-eden-100 text-eden-900' : 'text-eden-100/50 border-eden-700'}`}>1 Atq</button>
                                              <button onClick={() => setCombatState(prev => ({ ...prev, unbridledMode: { ...prev.unbridledMode, [weapon.id]: '2_attacks' } }))} className={`flex-1 min-w-[60px] py-1.5 text-[10px] font-bold rounded border transition-all ${currentUnbridled === '2_attacks' ? 'bg-red-500 text-white border-red-500' : 'text-eden-100/50 border-eden-700'}`}>2 Atq (-1d20)</button>
                                              <button onClick={() => setCombatState(prev => ({ ...prev, unbridledMode: { ...prev.unbridledMode, [weapon.id]: '3_attacks' } }))} className={`flex-1 min-w-[60px] py-1.5 text-[10px] font-bold rounded border transition-all ${currentUnbridled === '3_attacks' ? 'bg-red-600 text-white border-red-600' : 'text-eden-100/50 border-eden-700'}`}>3 Atq (-2d20)</button>
                                          </>
                                      ) : isAutomatic ? (
                                          <>
                                              <button onClick={() => setCombatState(prev => ({ ...prev, unbridledMode: { ...prev.unbridledMode, [weapon.id]: 'normal' } }))} className={`flex-1 min-w-[80px] py-1.5 text-[10px] font-bold rounded border transition-all ${currentUnbridled === 'normal' ? 'bg-eden-100 text-eden-900' : 'text-eden-100/50 border-eden-700'}`}>Padrão</button>
                                              <button onClick={() => setCombatState(prev => ({ ...prev, unbridledMode: { ...prev.unbridledMode, [weapon.id]: 'burst' } }))} className={`flex-1 min-w-[120px] py-1.5 text-[10px] font-bold rounded border transition-all ${currentUnbridled === 'burst' ? 'bg-red-500 text-white border-red-500' : 'text-eden-100/50 border-eden-700'}`}>Rajada (-1d20/+1d)</button>
                                          </>
                                      ) : (
                                          <span className="text-[10px] text-eden-100/30 italic w-full text-center">Arma não permite ataques desenfreados.</span>
                                      )}
                                  </div>
                              </div>

                              {isRanged && (
                                  <div className={`bg-eden-950 rounded-lg p-3 border ${leftover ? 'border-emerald-500/50' : statusColor.border} transition-colors duration-300 mt-3`}>
                                      <div className="flex justify-between items-center mb-3">
                                          <span className={`text-xs font-bold uppercase flex items-center gap-2 ${leftover ? 'text-emerald-500' : statusColor.text}`}><Link size={12}/> Munição</span>
                                          <div className="flex items-center gap-2">
                                              {ammoItem && ammoRule.type === 'scene' && (
                                                  <span className="text-[10px] text-eden-100/40 bg-eden-900 px-1.5 py-0.5 rounded border border-eden-700 flex items-center gap-1">
                                                      <Package size={10}/> {totalScenes} Cenas
                                                  </span>
                                              )}
                                              <select className="bg-eden-900 border border-eden-700 rounded text-xs p-1 text-eden-100 outline-none max-w-[120px]" value={ammoId || ''} onChange={(e) => setCombatState(prev => ({ ...prev, attachedAmmo: { ...prev.attachedAmmo, [weapon.id]: e.target.value } }))}>
                                                  <option value="">-- Selecionar --</option>
                                                  {availableAmmo.map(a => {
                                                      const r = getAmmoRule(a.name);
                                                      let display = `x${a.quantity}`;
                                                      if (r.type === 'infinite') display = '∞';
                                                      else if (r.type === 'scene') display = `${calculateTotalScenes(a, r)} Cenas`;
                                                      return <option key={a.id} value={a.id}>{a.name} ({display})</option>
                                                  })}
                                              </select>
                                          </div>
                                      </div>

                                      {ammoItem && (
                                          <div>
                                              {ammoRule.type === 'scene' && (
                                                  <>
                                                    {leftover !== undefined ? (
                                                        <div className="mb-3">
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className="text-[10px] text-eden-100/40">Modo Uso Baixo</span>
                                                                <span className="text-xs font-mono font-bold text-emerald-500">{leftover} Ataques Restantes</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-eden-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(leftover / (ammoRule.lowUsageLimit || 6)) * 100}%` }} />
                                                            </div>
                                                            <div className="mt-2 text-[10px] text-eden-100/50 flex items-center gap-1"><Target size={10}/> Ao zerar, 1 cena do pacote atual será consumida.</div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className="text-[10px] text-eden-100/40">Contador de Tiros</span>
                                                                <span className={`text-xs font-mono font-bold ${statusColor.text}`}>{currentDots}/10</span>
                                                            </div>
                                                            <div className="flex gap-1 mb-3">
                                                                {Array.from({ length: 10 }).map((_, idx) => (
                                                                    <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all ${idx < currentDots ? statusColor.bar : 'bg-eden-700'}`} />
                                                                ))}
                                                            </div>
                                                            {currentDots === 1 && ammoRule.lowUsageLimit && (
                                                                <div className="mb-3 p-2 bg-emerald-900/30 border border-emerald-500/30 rounded text-[10px] text-emerald-400 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                                                    <Info size={12} className="shrink-0 mt-0.5" />
                                                                    <span><strong>Uso Baixo:</strong> Se encerrar a cena agora, esta munição entrará em modo de sobra com <strong>{ammoRule.lowUsageLimit - 1} ataques</strong> extras.</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                  </>
                                              )}
                                              {ammoRule.type === 'infinite' && (
                                                  <div className="text-xs text-conhecimento italic mb-3 flex items-center gap-1"><Infinity size={12} /> Munição Infinita/Recuperável</div>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              )}

                              <button onClick={() => handleRollAttack(weapon)} className="w-full py-3 md:py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base"><Crosshair size={20} /> 
                                {isRanged && currentUnbridled === 'burst' ? 'Disparar Rajada (+3)' : isRanged ? 'Disparar (+1)' : 'Atacar'}
                              </button>
                              <div className="text-center text-xs text-eden-100/30 font-mono pt-2 border-t border-eden-700/30">Dano Base: {damageDice} {currentUnbridled === 'burst' ? '(+1d Rajada)' : ''} | Crítico: {mult}x</div>
                          </div>
                      )}
                  </div>
              )
          })}
      </div>
    </div>
  );
}