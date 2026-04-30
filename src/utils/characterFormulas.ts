import type { CharacterSheet } from '../types/characterSchema';
import type { Effect, Formula, Attribute } from '../types/systemData';

const CLASS_STATS: Record<string, { pvInit: number, pvNex: number, peInit: number, peNex: number, sanInit: number, sanNex: number }> = {
  'combatente': { pvInit: 20, pvNex: 4, peInit: 2, peNex: 2, sanInit: 12, sanNex: 3 },
  'especialista': { pvInit: 16, pvNex: 3, peInit: 3, peNex: 3, sanInit: 16, sanNex: 4 },
  'ocultista': { pvInit: 12, pvNex: 2, peInit: 4, peNex: 4, sanInit: 20, sanNex: 5 },
  'mundano': { pvInit: 8, pvNex: 2, peInit: 1, peNex: 1, sanInit: 8, sanNex: 1 },
};

export const SKILL_MAP: Record<string, Attribute> = {
  'Acrobacia': 'AGI', 'Adestramento': 'PRE', 'Artes': 'PRE', 'Atletismo': 'FOR', 'Atualidades': 'INT',
  'Ciências': 'INT', 'Crime': 'AGI', 'Diplomacia': 'PRE', 'Enganação': 'PRE', 'Fortitude': 'VIG',
  'Furtividade': 'AGI', 'Iniciativa': 'AGI', 'Intimidação': 'PRE', 'Intuição': 'INT', 'Investigação': 'INT',
  'Luta': 'FOR', 'Medicina': 'INT', 'Ocultismo': 'INT', 'Percepção': 'PRE', 'Pilotagem': 'AGI',
  'Pontaria': 'AGI', 'Profissão 1': 'INT', 'Profissão 2': 'INT', 'Profissão 3': 'INT', 'Reflexos': 'AGI', 
  'Religião': 'PRE', 'Sobrevivência': 'INT', 'Tática': 'INT', 'Tecnologia': 'INT', 'Vontade': 'PRE'
};

export interface CalculatedVariables {
  ATTRS: Record<Attribute, number>;
  PV: { max: number; temp: number };
  PE: { max: number; temp: number; limit: number };
  SAN: { max: number; temp: number };
  DEF: number;
  RD: Record<string, number>;
  IMUNIDADES: string[];
  VULNERABILIDADES: string[];
  DESLOCAMENTO: number;
  ACOES: { movimento: number; padrao: number; reacao: number };
  // ATUALIZADO: Declaradas as propriedades `criticalRange` e `EXPLOSIVE_DT_MOD`
  WEAPON_BONUS: Record<string, { 
      attackDice: number; attackBonus: number; 
      criticalRange: number; 
      damageDiceIncrease: Record<string, number>; 
      extraDamages: { type: string, fixed: number, diceCount: number, diceFace: number, isMultipliable: boolean }[]; 
      damageOverride?: Record<string, any>; 
  }>;
  EXPLOSIVE_DT_MOD: number;
  SKILLS: Record<string, { total: number; dice: number; trainingBonus: number; otherBonus: number }>;
  NEX: number;
  PATENTE: string;
  LIMITE_CREDITO: string;
  CARGA: { atual: number; max: number };
  DT_RITUAL: { global: number; specific: Record<string, number> };
  PROFICIENCIAS: string[];
  INJECTED_RITUALS: any[];
  INJECTED_ABILITIES: any[];
  INJECTED_ITEMS: any[]; 
  OVERRIDDEN_RITUALS: Record<string, any>;
  OVERRIDDEN_ABILITIES: Record<string, any>;
}

const diceRollCache: Record<string, number> = {};

export const solveFormulaNumber = (formula: Formula, context: CalculatedVariables, char: CharacterSheet, effectId?: string, mode: 'normal' | 'fixed' | 'dice_count' = 'normal'): number => {
    if (!formula || !formula.terms || formula.terms.length === 0) return 0;
    let expression = "";
    for (let i = 0; i < formula.terms.length; i++) {
        const term = formula.terms[i];
        let val = 0;
        switch (term.type) {
            case 'fixed': val = term.value || 0; break;
            case 'attribute': val = context.ATTRS[term.attribute || 'AGI'] || 0; break;
            case 'dice': 
                if (mode === 'fixed') { val = 0; break; }
                if (mode === 'dice_count') { val = term.value || 1; break; }
                if (effectId) {
                    const dCount = term.value || 1; const dFace = term.diceFace || 20;
                    const termKey = `${effectId}_${term.id}_${dCount}_${dFace}`;
                    if (diceRollCache[termKey] === undefined) {
                        let roll = 0; for(let r=0; r<dCount; r++) roll += Math.floor(Math.random() * dFace) + 1;
                        diceRollCache[termKey] = roll;
                    }
                    val = diceRollCache[termKey];
                } else val = Math.floor(((term.diceFace || 20) + 1) / 2) * (term.value || 1); 
                break;
            case 'skill_total': val = context.SKILLS[term.skill || 'Luta']?.total || 0; break;
            case 'skill_training': val = context.SKILLS[term.skill || 'Luta']?.trainingBonus || 0; break;
            case 'stat_max': val = term.stat === 'pv' ? context.PV.max : term.stat === 'pe' ? context.PE.max : context.SAN.max; break;
            case 'stat_current': val = term.stat === 'pv' ? char.status.pv.current : term.stat === 'pe' ? char.status.pe.current : char.status.san.current; break;
            case 'nex': val = context.NEX; break;
            case 'pe_limit': val = context.PE.limit; break;
            case 'displacement': val = context.DESLOCAMENTO; break;
            case 'defense': val = context.DEF; break;
            case 'dr_value': val = context.RD[term.damageType || 'balistico'] || 0; break;
            case 'load_max': val = context.CARGA.max; break;
            case 'count_rituals': val = char.rituals.filter(r => !term.element || r.element === term.element).length + context.INJECTED_RITUALS.filter(r => !term.element || r.element === term.element).length; break;
            case 'count_paranormal_powers': val = ((char as any).abilities || []).filter((p: any) => p.source === 'Paranormal' && (!term.element || p.element === term.element)).length + char.rituals.filter(r => !term.element || r.element === term.element).length; break;
            case 'count_abilities': val = ((char as any).abilities?.length || 0) + (char.rituals?.length || 0) + (char.classPowers?.length || 0); break;
            case 'count_class_powers': val = ((char as any).abilities || []).filter((a:any) => a.source === 'Classe').length + (char.classPowers?.length || 0); break;
            case 'count_origin_powers': val = ((char as any).abilities || []).filter((a:any) => a.source === 'Origem').length; break;
            case 'count_team_powers': val = ((char as any).abilities || []).filter((a:any) => a.source === 'Equipe').length; break;
            case 'prestige_points': val = char.personal?.prestigePoints || 0; break;
        }
        expression += val;
        if (i < formula.operations.length) expression += formula.operations[i] === 'soma' ? " + " : formula.operations[i] === 'subtracao' ? " - " : formula.operations[i] === 'multiplicacao' ? " * " : " / ";
    }
    try { return Math.floor(new Function(`return (${expression})`)() || 0); } catch { return 0; }
};

export const calculateVariables = (char: CharacterSheet): CalculatedVariables => {
    const nex = char.personal.nex;
    const ctx: CalculatedVariables = {
        ATTRS: { ...char.attributes.initial }, PV: { max: 0, temp: 0 }, PE: { max: 0, temp: 0, limit: Math.floor(nex / 5) }, SAN: { max: 0, temp: 0 },
        DEF: 10, RD: {}, IMUNIDADES: [], VULNERABILIDADES: [], DESLOCAMENTO: 9, ACOES: { movimento: 1, padrao: 1, reacao: 1 },
        WEAPON_BONUS: {}, EXPLOSIVE_DT_MOD: 0, SKILLS: {}, NEX: nex, PATENTE: 'Recruta', LIMITE_CREDITO: 'Baixo', CARGA: { atual: 0, max: 0 }, DT_RITUAL: { global: 0, specific: {} },
        PROFICIENCIAS: [], INJECTED_RITUALS: [], INJECTED_ABILITIES: [], INJECTED_ITEMS: [], OVERRIDDEN_RITUALS: {}, OVERRIDDEN_ABILITIES: {}
    };

    const allPossibleSources = [
        ...char.inventory.filter(i => (i as any).isEquipped),
        (char.customOrigin && (char.customOrigin as any).power?.isActive !== false) ? { effects: (char.customOrigin as any).power?.effects || char.customOrigin.effects || [] } : null,
        ...(char.conditions || []).filter(c => c.isActive),
        ...(char.classPowers || []).filter(p => p.isActive),
        ...((char as any).abilities || []).filter((p:any) => p.isActive)
    ].filter(Boolean);

    allPossibleSources.forEach((s: any) => {
        if (s.effects) {
            s.effects.forEach((e: Effect) => {
                if (e.isActive === false) return; 
                if (e.category === 'gain_power' && e.payload) {
                    if (e.payloadType === 'ritual') ctx.INJECTED_RITUALS.push(e.payload);
                    else if (e.payloadType === 'item') ctx.INJECTED_ITEMS.push(e.payload);
                    else ctx.INJECTED_ABILITIES.push(e.payload);
                }
                if (e.category === 'override_power' && e.payload) {
                    e.targets.forEach(t => {
                        if (t.type === 'override_ritual' && t.ritualId) ctx.OVERRIDDEN_RITUALS[t.ritualId] = e.payload;
                        if (t.type === 'override_ability' && t.abilityId) ctx.OVERRIDDEN_ABILITIES[t.abilityId] = e.payload;
                    });
                }
            });
        }
    });

    const activeEffects: Effect[] = [];

    const structuralSources = [
        ...char.inventory.filter(i => (i as any).isEquipped),
        (char.customOrigin && (char.customOrigin as any).power?.isActive !== false) ? { effects: (char.customOrigin as any).power?.effects || char.customOrigin.effects || [] } : null,
        ...(char.conditions || []).filter(c => c.isActive)
    ].filter(Boolean);
    structuralSources.forEach((s: any) => { if (s.effects) activeEffects.push(...s.effects.filter((e:any)=>e.isActive!==false)); });

    ctx.INJECTED_ITEMS.forEach(i => { if (i.isEquipped && i.effects) activeEffects.push(...i.effects.filter((e:any)=>e.isActive!==false)); });

    const allAbilities = [...(char.classPowers || []), ...((char as any).abilities || [])];
    allAbilities.forEach(a => {
        if (a.isActive) {
            const over = ctx.OVERRIDDEN_ABILITIES[a.id];
            if (over && over.effects) activeEffects.push(...over.effects.filter((e:any)=>e.isActive!==false));
            else if (!over && a.effects) activeEffects.push(...a.effects.filter((e:any)=>e.isActive!==false));
        }
    });
    ctx.INJECTED_ABILITIES.forEach(a => { if (a.isActive && a.effects) activeEffects.push(...a.effects.filter((e:any)=>e.isActive!==false)); });

    const processRitualEffects = (ritual: any) => {
        if (ritual.normal?.isActive && ritual.normal.effects) activeEffects.push(...ritual.normal.effects.filter((e:any)=>e.isActive!==false));
        if (ritual.discente?.isActive && ritual.discente.effects) activeEffects.push(...ritual.discente.effects.filter((e:any)=>e.isActive!==false));
        if (ritual.verdadeiro?.isActive && ritual.verdadeiro.effects) activeEffects.push(...ritual.verdadeiro.effects.filter((e:any)=>e.isActive!==false));
    };

    char.rituals.forEach(r => {
        const over = ctx.OVERRIDDEN_RITUALS[r.id];
        if (over) {
            const merged = {
                ...over,
                normal: { ...over.normal, isActive: r.normal?.isActive },
                discente: { ...over.discente, isActive: r.discente?.isActive },
                verdadeiro: { ...over.verdadeiro, isActive: r.verdadeiro?.isActive }
            };
            processRitualEffects(merged);
        } else {
            processRitualEffects(r);
        }
    });
    ctx.INJECTED_RITUALS.forEach(r => processRitualEffects(r));

    const currentActiveIds = new Set(activeEffects.map(e => e.id));
    Object.keys(diceRollCache).forEach(key => { if (!currentActiveIds.has(key.split('_')[0])) delete diceRollCache[key]; });

    const attrKeys: Attribute[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];
    attrKeys.forEach(k => ctx.ATTRS[k] += (char.attributes.nexIncreases[k] || 0));
    activeEffects.filter(e => e.category === 'add_fixed').forEach(e => {
        const val = solveFormulaNumber(e.value, ctx, char, e.id);
        e.targets.forEach(t => { if (t.type === 'attribute' && t.attribute) ctx.ATTRS[t.attribute] += val; });
    });

    const steps = Math.max(0, Math.floor((nex === 99 ? 100 : nex - 5) / 5));
    const cls = CLASS_STATS[char.personal.class] || CLASS_STATS['mundano'];
    ctx.PV.max = cls.pvInit + ctx.ATTRS.VIG + ((cls.pvNex + ctx.ATTRS.VIG) * steps);
    ctx.PE.max = cls.peInit + ctx.ATTRS.PRE + ((cls.peNex + ctx.ATTRS.PRE) * steps);
    ctx.SAN.max = cls.sanInit + (cls.sanNex * steps);
    
    ctx.DEF = 10 + ctx.ATTRS.AGI;
    const fullInventory = [...char.inventory, ...ctx.INJECTED_ITEMS];

    fullInventory.filter(i => (i as any).isEquipped && i.type === 'protection').forEach(i => ctx.DEF += ((i as any).defenseBonus || 0));
    ctx.CARGA.max = ctx.ATTRS.FOR > 0 ? ctx.ATTRS.FOR * 5 : 2;
    fullInventory.forEach(i => ctx.CARGA.atual += (Number(i.weight) || 0) * (Number((i as any).amount) || 1)); 

    Object.keys(SKILL_MAP).forEach(s => {
        const t = char.skills[s]?.training || 0;
        ctx.SKILLS[s] = { dice: ctx.ATTRS[SKILL_MAP[s]], trainingBonus: t===1?5:t===2?10:t===3?15:0, otherBonus: char.skills[s]?.otherBonus||0, total: (t===1?5:t===2?10:t===3?15:0) + (char.skills[s]?.otherBonus||0) };
    });

    if (char.personal.class === 'combatente') ctx.PROFICIENCIAS.push('simples', 'taticas', 'leves_armor');
    else if (char.personal.class === 'especialista') ctx.PROFICIENCIAS.push('simples', 'leves_armor');
    else if (char.personal.class === 'ocultista') ctx.PROFICIENCIAS.push('simples');
    ctx.PROFICIENCIAS.push(...(char.proficiencies || []));

    activeEffects.forEach(effect => {
        if (effect.category === 'add_fixed') {
            const val = solveFormulaNumber(effect.value, ctx, char, effect.id);
            effect.targets.forEach(t => {
                if (t.type === 'pv_max') ctx.PV.max += val; if (t.type === 'pe_max') ctx.PE.max += val; if (t.type === 'san_max') ctx.SAN.max += val;
                if (t.type === 'pv_temp') ctx.PV.temp += val; if (t.type === 'pe_temp') ctx.PE.temp += val; if (t.type === 'san_temp') ctx.SAN.temp += val;
                if (t.type === 'defense') ctx.DEF += val; if (t.type === 'displacement') ctx.DESLOCAMENTO += val; if (t.type === 'load_max') ctx.CARGA.max += val;
                if (t.type === 'ritual_dt') { if (!t.ritualId || t.ritualId === 'all') ctx.DT_RITUAL.global += val; else ctx.DT_RITUAL.specific[t.ritualId] = (ctx.DT_RITUAL.specific[t.ritualId] || 0) + val; }
                
                // ATUALIZADO: Cálculo da DT de Explosivos
                if (t.type === 'explosive_dt') ctx.EXPLOSIVE_DT_MOD += val;
                
                if (t.type === 'test_skill' && t.skill && ctx.SKILLS[t.skill]) ctx.SKILLS[t.skill].total += val;
                if ((t.type as string) === 'test_attribute' && t.attribute) Object.keys(ctx.SKILLS).forEach(s => { if (SKILL_MAP[s] === t.attribute) ctx.SKILLS[s].total += val; });
                
                if (t.type === 'test_attack' || t.type === 'damage_roll' || t.type === 'critical_range') {
                    const key = t.weaponId || t.weaponFilter || 'all';
                    if (!ctx.WEAPON_BONUS[key]) ctx.WEAPON_BONUS[key] = { attackDice: 0, attackBonus: 0, criticalRange: 0, damageDiceIncrease: {}, extraDamages: [] };
                    
                    if (t.type === 'test_attack') ctx.WEAPON_BONUS[key].attackBonus += val;
                    // ATUALIZADO: Cálculo da Margem de Ameaça
                    if (t.type === 'critical_range') ctx.WEAPON_BONUS[key].criticalRange += val;
                    
                    if (t.type === 'damage_roll') {
                        let dFace = 6; effect.value.terms.forEach(term => { if (term.type === 'dice') dFace = term.diceFace || 6; });
                        const fixedSum = solveFormulaNumber(effect.value, ctx, char, effect.id, 'fixed');
                        const totalWithDice = solveFormulaNumber(effect.value, ctx, char, effect.id, 'dice_count');
                        ctx.WEAPON_BONUS[key].extraDamages.push({ type: t.damageType || 'balistico', fixed: fixedSum, diceCount: totalWithDice - fixedSum, diceFace: dFace, isMultipliable: t.isMultipliable || false });
                    }
                }
            });
        }
        if (effect.category === 'change_dice') {
            const val = solveFormulaNumber(effect.value, ctx, char, effect.id);
            effect.targets.forEach(t => {
                if (t.type === 'test_skill' && t.skill && ctx.SKILLS[t.skill]) ctx.SKILLS[t.skill].dice += val;
                if (t.type === 'test_attribute' && t.attribute) Object.keys(ctx.SKILLS).forEach(s => { if (SKILL_MAP[s] === t.attribute) ctx.SKILLS[s].dice += val; });
                if (t.type === 'test_attack' || (t.type as string) === 'damage_increase') {
                    const key = t.weaponId || t.weaponFilter || 'all';
                    if (!ctx.WEAPON_BONUS[key]) ctx.WEAPON_BONUS[key] = { attackDice: 0, attackBonus: 0, criticalRange: 0, damageDiceIncrease: {}, extraDamages: [] };
                    if (t.type === 'test_attack') ctx.WEAPON_BONUS[key].attackDice += val;
                    if ((t.type as string) === 'damage_increase') {
                        if (t.damageIndex !== undefined && t.damageIndex !== -1) ctx.WEAPON_BONUS[key].damageDiceIncrease[`idx_${t.damageIndex}`] = (ctx.WEAPON_BONUS[key].damageDiceIncrease[`idx_${t.damageIndex}`] || 0) + val;
                        else if (t.damageType) ctx.WEAPON_BONUS[key].damageDiceIncrease[t.damageType] = (ctx.WEAPON_BONUS[key].damageDiceIncrease[t.damageType] || 0) + val;
                    }
                }
            });
        }
        if (effect.category === 'add_resistance') {
            const val = solveFormulaNumber(effect.value, ctx, char, effect.id);
            effect.targets.forEach(t => {
                if (t.type === 'dr' && t.damageType) ctx.RD[t.damageType] = (ctx.RD[t.damageType] || 0) + val;
                if (t.type === 'immunity_damage' && t.damageType) ctx.IMUNIDADES.push(t.damageType.toLowerCase());
                if (t.type === 'immunity_condition' && t.condition) ctx.IMUNIDADES.push(t.condition.toLowerCase());
                if (t.type === 'vulnerability' && t.damageType) ctx.VULNERABILIDADES.push(t.damageType.toLowerCase());
            });
        }
        if (effect.category === 'change_damage') {
            effect.targets.forEach(t => {
                const key = t.weaponId || t.weaponFilter || 'all';
                if (!ctx.WEAPON_BONUS[key]) ctx.WEAPON_BONUS[key] = { attackDice: 0, attackBonus: 0, criticalRange: 0, damageDiceIncrease: {}, extraDamages: [] };
                if (!(ctx.WEAPON_BONUS[key] as any).damageOverride) (ctx.WEAPON_BONUS[key] as any).damageOverride = {};
                let dFace = 6; effect.value.terms.forEach(term => { if (term.type === 'dice') dFace = term.diceFace || 6; });
                const fixedSum = solveFormulaNumber(effect.value, ctx, char, effect.id, 'fixed');
                const totalWithDice = solveFormulaNumber(effect.value, ctx, char, effect.id, 'dice_count');
                const idxToOverride = t.damageIndex !== undefined && t.damageIndex !== -1 ? t.damageIndex : 0;
                (ctx.WEAPON_BONUS[key] as any).damageOverride[`idx_${idxToOverride}`] = { diceCount: totalWithDice - fixedSum, diceFace: dFace, bonus: fixedSum, type: t.damageType || 'balistico', isMultipliable: t.isMultipliable };
            });
        }
        if (effect.category === 'gain_proficiency') {
            effect.targets.forEach(t => { if (t.proficiencyType) ctx.PROFICIENCIAS.push(t.proficiencyType); });
        }
    });

    fullInventory.filter(i => i.type === 'weapon' && (i as any).isEquipped).forEach(w => {
        const c = (w as any).complexity || 'simple';
        if (
            (c === 'simple' && !ctx.PROFICIENCIAS.includes('simples')) ||
            (c === 'tactical' && !ctx.PROFICIENCIAS.includes('taticas')) || 
            (c === 'heavy' && !ctx.PROFICIENCIAS.includes('pesadas'))
        ) {
            if (!ctx.WEAPON_BONUS[w.id]) ctx.WEAPON_BONUS[w.id] = { attackDice: 0, attackBonus: 0, criticalRange: 0, damageDiceIncrease: {}, extraDamages: [] };
            ctx.WEAPON_BONUS[w.id].attackDice -= 2;
        }
    });
    fullInventory.filter(i => i.type === 'protection' && (i as any).isEquipped).forEach(a => {
        const isH = (a as any).isHeavy;
        if ((isH && !ctx.PROFICIENCIAS.includes('pesadas_armor')) || (!isH && !ctx.PROFICIENCIAS.includes('leves_armor'))) {
            Object.keys(ctx.SKILLS).forEach(s => { if (SKILL_MAP[s] === 'FOR' || SKILL_MAP[s] === 'AGI') ctx.SKILLS[s].dice -= 2; });
        }
    });

    if (ctx.PV.max < 1) ctx.PV.max = 1;
    ctx.DT_RITUAL.global += (10 + ctx.PE.limit + ctx.ATTRS.PRE);
    ctx.DESLOCAMENTO = Math.floor(ctx.DESLOCAMENTO / 1.5) * 1.5;

    return ctx;
};