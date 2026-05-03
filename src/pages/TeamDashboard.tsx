import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { calculateVariables, solveFormulaNumber } from '../utils/characterFormulas';
import { 
    Users, Zap, Target, Home, BarChart2,
    Ghost, Loader2, X, Info
} from 'lucide-react';

const IDEAL_TABLES: Record<string, any> = {
    combatente: {
        PV: [23, 30, 37, 48, 56, 64, 72, 80, 88, 106, 115, 124, 133, 142, 151, 160, 169, 178, 187, 196],
        PE: [5, 10, 15, 24, 30, 36, 42, 48, 54, 70, 77, 84, 91, 98, 105, 112, 119, 126, 133, 140],
        SAN: [12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69],
        ATAQUE: [11, 16, 18, 20, 23, 25, 27, 29, 31, 33, 35, 40, 42, 43, 45, 47, 48, 50, 52, 55],
        DANO: [12, 20, 26, 32, 38, 62, 69, 77, 104, 113, 122, 131, 140, 150, 159, 192, 202, 212, 223, 233],
        DEFESA: [16, 20, 21, 23, 25, 28, 31, 34, 36, 38, 40, 42, 44, 46, 48, 50, 53, 56, 58, 60],
        RESISTENCIA: [11, 12, 15, 16, 17, 19, 20, 22, 24, 26, 27, 29, 31, 33, 35, 37, 39, 40, 42, 45],
        PERICIAS: [8, 8, 8, 9, 9, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 13],
        PP: [0, 10, 20, 30, 40, 50, 66, 82, 100, 114, 128, 142, 156, 170, 184, 200, 225, 250, 275, 300]
    },
    especialista: {
        PV: [19, 25, 31, 41, 48, 55, 62, 69, 76, 93, 101, 109, 117, 125, 133, 141, 149, 157, 165, 173],
        PE: [6, 12, 18, 28, 35, 42, 49, 56, 63, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160],
        SAN: [16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92],
        ATAQUE: [7, 10, 12, 13, 15, 17, 18, 19, 21, 22, 23, 25, 28, 29, 30, 31, 32, 33, 34, 37],
        DANO: [12, 20, 26, 32, 38, 62, 69, 77, 104, 113, 122, 131, 140, 150, 159, 192, 202, 212, 223, 233],
        DEFESA: [11, 13, 14, 15, 17, 19, 21, 23, 24, 25, 27, 28, 29, 31, 32, 33, 35, 37, 39, 40],
        RESISTENCIA: [11, 12, 15, 16, 17, 19, 20, 22, 24, 26, 27, 29, 31, 33, 35, 37, 39, 40, 42, 45],
        PERICIAS: [12, 12, 12, 14, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19],
        PP: [0, 10, 20, 30, 40, 50, 66, 82, 100, 114, 128, 142, 156, 170, 184, 200, 225, 250, 275, 300]
    },
    ocultista: {
        PV: [15, 20, 25, 34, 40, 46, 52, 58, 64, 80, 87, 94, 101, 108, 115, 122, 129, 136, 143, 150],
        PE: [7, 14, 21, 32, 40, 48, 56, 64, 72, 90, 99, 108, 117, 126, 135, 144, 153, 162, 171, 180],
        SAN: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115],
        ATAQUE: [5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27],
        DANO: [12, 20, 26, 32, 38, 62, 69, 77, 104, 113, 122, 131, 140, 150, 159, 192, 202, 212, 223, 233],
        DEFESA: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30],
        RESISTENCIA: [11, 12, 15, 16, 17, 19, 20, 22, 24, 26, 27, 29, 31, 33, 35, 37, 39, 40, 42, 45],
        PERICIAS: [10, 10, 10, 11, 12, 12, 12, 12, 12, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16],
        PP: [0, 10, 20, 30, 40, 50, 66, 82, 100, 114, 128, 142, 156, 170, 184, 200, 225, 250, 275, 300]
    }
};

const NEX_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

const UNARMED_ATTACK: any = {
    id: 'unarmed_virtual',
    type: 'weapon',
    name: 'Ataque Desarmado',
    attackTest: { skill: 'Luta' },
    damage: [{ id: 'unarmed_dmg', diceCount: 1, diceFace: 3, type: 'impacto', isMultipliable: true }],
    critical: { range: 20, multiplier: 2 }
};

const convertDiceToBonus = (dice: number) => {
    if (dice >= 10) return 12;
    if (dice >= 9) return 12;
    if (dice >= 7) return 11;
    if (dice >= 5) return 10;
    if (dice === 4) return 9;
    if (dice === 3) return 8;
    if (dice === 2) return 6;
    if (dice === 1) return 3;
    if (dice === 0) return -3;
    if (dice === -1) return -6;
    if (dice === -2) return -8;
    if (dice === -3) return -9;
    return -10;
};

const convertDamageToAvg = (count: number, face: number) => {
    return count * ((face / 2) + 0.5);
};

const getTrueNex = (val: number, arr: number[]) => {
    if (val < arr[0]) return 0;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (val >= arr[i]) return NEX_LEVELS[i];
    }
    return 0;
};

interface StatBarProps {
    label: string;
    nexValue: number;
    charNex: number;
    baseColor: string;
    maxScale: number;
    rawValue: number | string;
}

const StatBar = ({ label, nexValue, charNex, baseColor, maxScale }: StatBarProps) => {
    const fillPct = Math.min(100, Math.max(0, (nexValue / maxScale) * 100)) || 0;
    
    let currentColor = baseColor;
    let glow = 'none';

    if (nexValue >= charNex + 15) {
        currentColor = '#fbbf24'; 
        glow = '0 0 12px rgba(251, 191, 36, 0.6)';
    } else if (nexValue <= charNex - 15) {
        currentColor = '#3b82f6'; 
    }
    
    return (
        <div className="w-full h-8 bg-black/40 rounded-lg overflow-hidden border border-white/5 relative flex items-center shadow-inner group transition-all" style={{ boxShadow: glow !== 'none' ? glow : undefined }}>
            <div className="absolute left-0 top-0 h-full transition-all duration-1000" style={{ width: `${fillPct}%`, backgroundColor: currentColor, opacity: 0.8 }}></div>
            <div className="relative z-10 w-full px-4 flex justify-between text-xs font-black uppercase tracking-widest text-white drop-shadow-md items-center">
                <span className="flex items-center gap-2">
                    {label} <span className="text-[9px] text-white/50 font-mono tracking-normal lowercase opacity-60 group-hover:opacity-100 transition-opacity"></span>
                </span>
                <span>{nexValue}%</span>
            </div>
        </div>
    );
};

export default function TeamDashboard() {
    const { mesaId } = useParams();
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [opts, setOpts] = useState({
        addReflexesToDefense: true,
        considerCriticals: true,
        recklessAttacks: false
    });

    const [showInfoModal, setShowInfoModal] = useState(false);
    
    const [simulations, setSimulations] = useState<Record<string, Record<string, boolean>>>({});

    const currentUserId = auth?.currentUser?.uid;

    useEffect(() => {
        async function fetchGroup() {
            if (!mesaId) return;
            const q = query(collection(db, 'characters'), where('mesaId', '==', mesaId));
            const snap = await getDocs(q);
            const chars: any[] = [];
            snap.forEach(d => {
                const data = d.data();                
                if (!data.isPrivate && !data.isDead) chars.push({ id: d.id, ...data });
            });
            setCharacters(chars);
            setLoading(false);
        }
        fetchGroup();
    }, [mesaId]);

    const toggleSimulation = (charId: string, itemId: string, currentVal: boolean) => {
        setSimulations(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] || {}),
                [itemId]: !currentVal
            }
        }));
    };

    const parsedData = characters.map(char => {
        const clone = JSON.parse(JSON.stringify(char));
        const sim = simulations[char.id] || {};
        
        clone.inventory?.forEach((i: any) => {
            if (sim[i.id] !== undefined) i.isEquipped = sim[i.id];
        });
        clone.abilities?.forEach((a: any) => {
            if (sim[a.id] !== undefined) a.isActive = sim[a.id];
        });
        clone.classPowers?.forEach((a: any) => {
            if (sim[a.id] !== undefined) a.isActive = sim[a.id];
        });
        if (clone.customOrigin?.power) {
            if (sim['origin_power'] !== undefined) clone.customOrigin.power.isActive = sim['origin_power'];
        }

        const varsMid = calculateVariables(clone); 
        
        clone.rituals?.forEach((r: any) => {
            const isSimActive = sim[r.id] !== undefined ? sim[r.id] : (r.normal?.isActive || r.discente?.isActive || r.verdadeiro?.isActive);
            
            if (r.normal) r.normal.isActive = false;
            if (r.discente) r.discente.isActive = false;
            if (r.verdadeiro) r.verdadeiro.isActive = false;

            if (isSimActive) {
                const bypass = varsMid.FREE_RITUALS?.includes(r.id) || varsMid.FREE_RITUALS?.includes('all');
                
                const hasVerd = r.verdadeiro && (r.verdadeiro.effects?.length > 0 || r.verdadeiro.cost > 1 || (r.verdadeiro.description && r.verdadeiro.description.trim() !== ''));
                const hasDisc = r.discente && (r.discente.effects?.length > 0 || r.discente.cost > 1 || (r.discente.description && r.discente.description.trim() !== ''));
                
                const canVerdadeiro = hasVerd && (bypass || (varsMid.MAX_RITUAL_CIRCLE >= (r.verdadeiro.requiredCircle || r.circle) && (!r.verdadeiro.affinity || varsMid.AFFINITIES?.includes(r.verdadeiro.affinity.toLowerCase()))));
                const canDiscente = hasDisc && (bypass || (varsMid.MAX_RITUAL_CIRCLE >= (r.discente.requiredCircle || r.circle) && (!r.discente.affinity || varsMid.AFFINITIES?.includes(r.discente.affinity.toLowerCase()))));
                const canNormal = r.normal && (bypass || varsMid.MAX_RITUAL_CIRCLE >= r.circle);

                if (canVerdadeiro) {
                    r.verdadeiro.isActive = true;
                } else if (canDiscente) {
                    r.discente.isActive = true;
                } else if (canNormal) {
                    r.normal.isActive = true;
                }
            }
        });

        const vars = calculateVariables(clone);
        const cls = (char.personal?.class || 'mundano').toLowerCase();

        const currentPV = char.status?.pv?.current || 0;
        const currentPE = char.status?.pe?.current || 0;
        const currentSAN = char.status?.san?.current || 0;

        const maxPV = vars.PV.max;
        const maxPE = vars.PE.max;
        const maxSAN = vars.SAN.max;

        const tempPV = char.status?.pv?.temp || vars.PV.temp || 0;
        const tempPE = char.status?.pe?.temp || vars.PE.temp || 0;
        const tempSAN = char.status?.san?.temp || vars.SAN.temp || 0;

        let maxAtk = 0;

        const acoesTotais = vars.ACOES.padrao || 1;
        const qtdeMovimentacoes = Math.floor(vars.DESLOCAMENTO / 2) * acoesTotais;
        
        const multiplicadorMovimento = opts.recklessAttacks ? Math.max(1, Math.floor(qtdeMovimentacoes / 2)) : 1;

        let maxRitualDmg = 0;
        let maxWeaponDmg = 0;

        const allAttacks = [
            UNARMED_ATTACK,
            ...(clone.inventory.filter((i:any) => (i.type === 'weapon' || i.type === 'explosive') && i.isEquipped)), 
            ...(clone.rituals || [])
        ];
        
        allAttacks.forEach((atk: any) => {
            const defaultWb = { 
                attackDice: 0, attackBonus: 0, criticalRange: 0, criticalMultiplier: 0,
                damageDiceIncrease: {} as Record<string, number>, 
                extraDamages: [] as any[],
                damageOverride: {} as Record<string, any>
            };

            const wbSpecific = vars.WEAPON_BONUS[atk.id] || defaultWb;
            const wbAll = vars.WEAPON_BONUS['all'] || defaultWb;
            const wbMelee = (atk.type === 'weapon' && atk.attackTest?.skill === 'Luta') ? (vars.WEAPON_BONUS['melee'] || defaultWb) : defaultWb;
            const wbRanged = (atk.type === 'weapon' && atk.attackTest?.skill === 'Pontaria') ? (vars.WEAPON_BONUS['ranged'] || defaultWb) : defaultWb;

            const totalWbAttackDice = wbSpecific.attackDice + wbAll.attackDice + wbMelee.attackDice + wbRanged.attackDice;
            const totalWbAttackBonus = wbSpecific.attackBonus + wbAll.attackBonus + wbMelee.attackBonus + wbRanged.attackBonus;

            if (atk.attackTest?.skill) {
                const skillTotal = vars.SKILLS[atk.attackTest.skill]?.total || 0;
                const skillDice = Math.max(0, (vars.SKILLS[atk.attackTest.skill]?.dice || 1) + totalWbAttackDice);
                const finalBonus = skillTotal + convertDiceToBonus(skillDice) + totalWbAttackBonus;
                if (finalBonus > maxAtk) maxAtk = finalBonus;
            } else if (atk.element && atk.circle) {
                const occTotal = vars.SKILLS['Ocultismo']?.total || 0;
                const occDice = Math.max(0, (vars.SKILLS['Ocultismo']?.dice || 1) + totalWbAttackDice);
                const finalBonus = occTotal + convertDiceToBonus(occDice) + totalWbAttackBonus;
                if (finalBonus > maxAtk) maxAtk = finalBonus;
            }

            const dmgListToEvaluate = [];
            
            if (atk.type === 'weapon' || atk.type === 'explosive') {
                if (atk.damage) dmgListToEvaluate.push(atk.damage);
            } else {
                const bypass = vars.FREE_RITUALS?.includes(atk.id) || vars.FREE_RITUALS?.includes('all');
                
                const hasVerd = atk.verdadeiro && (atk.verdadeiro.effects?.length > 0 || atk.verdadeiro.cost > 1 || (atk.verdadeiro.description && atk.verdadeiro.description.trim() !== ''));
                const hasDisc = atk.discente && (atk.discente.effects?.length > 0 || atk.discente.cost > 1 || (atk.discente.description && atk.discente.description.trim() !== ''));
                
                const canVerdadeiro = hasVerd && (bypass || (vars.MAX_RITUAL_CIRCLE >= (atk.verdadeiro.requiredCircle || atk.circle) && (!atk.verdadeiro.affinity || vars.AFFINITIES?.includes(atk.verdadeiro.affinity.toLowerCase()))));
                const canDiscente = hasDisc && (bypass || (vars.MAX_RITUAL_CIRCLE >= (atk.discente.requiredCircle || atk.circle) && (!atk.discente.affinity || vars.AFFINITIES?.includes(atk.discente.affinity.toLowerCase()))));
                const canNormal = atk.normal && (bypass || vars.MAX_RITUAL_CIRCLE >= atk.circle);

                if (canVerdadeiro && atk.verdadeiro.damage) dmgListToEvaluate.push(atk.verdadeiro.damage);
                else if (canDiscente && atk.discente.damage) dmgListToEvaluate.push(atk.discente.damage);
                else if (canNormal && atk.normal.damage) dmgListToEvaluate.push(atk.normal.damage);
            }

            const multMod = (wbSpecific.criticalMultiplier || 0) + (wbAll.criticalMultiplier || 0) + (wbMelee.criticalMultiplier || 0) + (wbRanged.criticalMultiplier || 0);
            const critMult = (atk.critical?.multiplier || 2) + multMod;

            dmgListToEvaluate.forEach(dmgList => {
                if (!Array.isArray(dmgList)) return;
                let currentDmgSum = 0;

                dmgList.forEach((dmg: any, idx: number) => {
                    // 1. Verifica se tem efeito de substituição de dano (Ex: d3 para d8)
                    const damageOverride = wbSpecific.damageOverride?.[`idx_${idx}`] 
                                        || wbMelee.damageOverride?.[`idx_${idx}`] 
                                        || wbRanged.damageOverride?.[`idx_${idx}`] 
                                        || wbAll.damageOverride?.[`idx_${idx}`];
                                        
                    const targetDmg = damageOverride ? { ...dmg, ...damageOverride } : dmg;

                    // 2. Aplica aumentos de dados baseados no alvo substituído
                    const specificInc = wbSpecific.damageDiceIncrease[`idx_${idx}`] || wbSpecific.damageDiceIncrease[targetDmg.type] || 0;
                    const allInc = wbAll.damageDiceIncrease[`idx_${idx}`] || wbAll.damageDiceIncrease[targetDmg.type] || 0;
                    const meleeInc = wbMelee.damageDiceIncrease[`idx_${idx}`] || wbMelee.damageDiceIncrease[targetDmg.type] || 0;
                    const rangedInc = wbRanged.damageDiceIncrease[`idx_${idx}`] || wbRanged.damageDiceIncrease[targetDmg.type] || 0;

                    let c = (targetDmg.diceCount || 0) + specificInc + allInc + meleeInc + rangedInc;
                    const f = targetDmg.diceFace || 6;
                    
                    // 3. Multiplica o crítico usando o critMult atualizado
                    if (opts.considerCriticals && targetDmg.isMultipliable !== false) {
                        c = c * critMult;
                    }
                    
                    let fixed = 0;
                    if (!damageOverride && targetDmg.bonus) {
                        fixed = solveFormulaNumber(targetDmg.bonus, vars, clone, targetDmg.id, 'fixed');
                    } else if (damageOverride) {
                        fixed = damageOverride.bonus || 0;
                    }
                    
                    let attrBonus = 0;
                    if (atk.attackTest?.skill === 'Luta') {
                        attrBonus = vars.ATTRS['FOR'] || 0;
                    }

                    currentDmgSum += Math.floor(convertDamageToAvg(c, f)) + fixed + attrBonus;
                });

                [...wbSpecific.extraDamages, ...wbAll.extraDamages, ...wbMelee.extraDamages, ...wbRanged.extraDamages].forEach(extra => {
                    let c = extra.diceCount;
                    if (opts.considerCriticals && extra.isMultipliable) c = c * critMult;
                    currentDmgSum += Math.floor(convertDamageToAvg(c, extra.diceFace)) + extra.fixed;
                });
                
                if (atk.type === 'weapon' || atk.type === 'explosive') {
                    if (currentDmgSum > maxWeaponDmg) maxWeaponDmg = currentDmgSum;
                } else {
                    if (currentDmgSum > maxRitualDmg) maxRitualDmg = currentDmgSum;
                }
            });
        });

        const maxDmg = Math.max(maxRitualDmg, maxWeaponDmg * multiplicadorMovimento);
        
        const trueDef = opts.addReflexesToDefense ? vars.DEF + (vars.SKILLS['Reflexos']?.total || 0) : vars.DEF;

        const refTotal = (vars.SKILLS['Reflexos']?.total || 0) + convertDiceToBonus(vars.SKILLS['Reflexos']?.dice || 1);
        const forTotal = (vars.SKILLS['Fortitude']?.total || 0) + convertDiceToBonus(vars.SKILLS['Fortitude']?.dice || 1);
        const vonTotal = (vars.SKILLS['Vontade']?.total || 0) + convertDiceToBonus(vars.SKILLS['Vontade']?.dice || 1);
        const trueResist = Math.max(refTotal, forTotal, vonTotal);

        let activeSkills = 0;
        Object.values(vars.SKILLS).forEach((s: any) => { if (s.total >= 1) activeSkills++; });

        return {
            char, vars, cls,
            currentPV, currentPE, currentSAN, tempPV, tempPE, tempSAN,
            maxPV, maxPE, maxSAN,
            maxAtk, maxDmg, trueDef, trueResist, activeSkills
        };
    });

    if (loading) return <div className="h-screen bg-eden-900 flex items-center justify-center text-energia"><Loader2 size={40} className="animate-spin" /></div>;

    const sumNEX = parsedData.reduce((acc, c) => acc + (c.char.personal?.nex || 0), 0);
    const sumCargaAtual = parsedData.reduce((acc, c) => acc + c.vars.CARGA.atual, 0);
    const sumCargaMax = parsedData.reduce((acc, c) => acc + c.vars.CARGA.max, 0);
    const sumPP = parsedData.reduce((acc, c) => acc + (c.char.personal?.prestigePoints || 0), 0);

    const totalPV = parsedData.reduce((acc, c) => acc + c.currentPV, 0);
    const totalPEMax = parsedData.reduce((acc, c) => acc + c.maxPE, 0);
    const totalSAN = parsedData.reduce((acc, c) => acc + c.currentSAN, 0);
    
    const clsCount = { combatente: 0, especialista: 0, ocultista: 0 };
    parsedData.forEach(c => { if (['combatente','especialista','ocultista'].includes(c.cls)) clsCount[c.cls as keyof typeof clsCount]++; });
    const totalValidCls = clsCount.combatente + clsCount.especialista + clsCount.ocultista;
    
    let pC = 0, pE = 0, pO = 0;
    if (totalValidCls > 0) {
        pC = (clsCount.combatente / totalValidCls) * 100;
        pE = (clsCount.especialista / totalValidCls) * 100;
        pO = (clsCount.ocultista / totalValidCls) * 100;
    }

    const renderHealthBar = (label: string, current: number, max: number, temp: number, colors: { base: string, current: string, temp: string, text: string }) => {
        const pctCurrent = Math.min(100, Math.max(0, (current / max) * 100)) || 0;
        const pctTemp = Math.max(0, (temp / max) * 100) || 0;

        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-black uppercase">
                    <span className="text-white tracking-widest">{label}</span>
                    <span className={colors.text}>{Math.floor(pctCurrent)}% {temp > 0 && `(+${Math.floor(pctTemp)}%)`}</span>
                </div>
                <div className={`w-full h-6 rounded-full relative overflow-visible shadow-inner ${colors.base}`}>
                    <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${colors.current}`} style={{ width: `${pctCurrent}%` }}/>
                    {temp > 0 && (
                        <div className={`absolute top-0 h-full rounded-full shadow-[0_0_10px_currentColor] z-10 transition-all duration-1000 ${colors.temp}`} style={{ left: `${pctCurrent}%`, width: `${pctTemp}%` }}/>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-eden-900 font-sans p-4 md:p-8 space-y-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto flex items-center justify-between bg-eden-800 p-4 rounded-2xl border border-eden-700 shadow-xl mb-8">
                <div className="flex items-center gap-3">
                    <Link to={`/mesa/${mesaId}/grupo`} className="p-3 bg-eden-900 text-eden-100/50 hover:text-energia rounded-xl border border-eden-700 transition-colors shadow-sm"><Home size={20}/></Link>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2"><BarChart2 className="text-energia" size={24}/> DASHBOARD DO GRUPO</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-eden-950/80 border border-eden-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 mb-1 tracking-widest">VD da Equipe</div>
                        <div className="text-4xl font-black text-energia leading-none">{sumNEX}</div>
                    </div>
                    <div className="bg-eden-950/80 border border-eden-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 mb-1 tracking-widest">Carga Atual Total</div>
                        <div className="text-4xl font-black text-white leading-none">{sumCargaAtual}</div>
                    </div>
                    <div className="bg-eden-950/80 border border-eden-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 mb-1 tracking-widest">Carga Máx. Total</div>
                        <div className="text-4xl font-black text-white leading-none">{sumCargaMax}</div>
                    </div>
                    <div className="bg-eden-950/80 border border-eden-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 mb-1 tracking-widest">Prestígio da Equipe</div>
                        <div className="text-4xl font-black text-yellow-500 leading-none">{sumPP} <span className="text-sm md:text-base opacity-60 font-bold">PP</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-eden-800 border border-eden-700 p-8 rounded-2xl shadow-xl flex flex-col justify-center space-y-8">
                        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-widest flex items-center gap-2"><Target size={20} className="text-energia"/> Saúde da Mesa</h3>
                        {renderHealthBar('PV', totalPV, parsedData.reduce((a,c)=>a+c.maxPV,0), parsedData.reduce((a,c)=>a+c.tempPV,0), { base: 'bg-red-950', current: 'bg-red-500', temp: 'bg-red-300', text: 'text-red-400' })}
                        {renderHealthBar('PE', parsedData.reduce((a,c)=>a+c.currentPE,0), totalPEMax, parsedData.reduce((a,c)=>a+c.tempPE,0), { base: 'bg-yellow-950', current: 'bg-yellow-500', temp: 'bg-yellow-200', text: 'text-yellow-400' })}
                        {renderHealthBar('SAN', totalSAN, parsedData.reduce((a,c)=>a+c.maxSAN,0), parsedData.reduce((a,c)=>a+c.tempSAN,0), { base: 'bg-blue-950', current: 'bg-blue-500', temp: 'bg-blue-300', text: 'text-blue-400' })}
                    </div>

                    <div className="bg-eden-800 border border-eden-700 p-8 rounded-2xl shadow-xl flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative border-4 border-eden-900" style={{ background: `conic-gradient(#ef4444 0% ${pC}%, #a855f7 ${pC}% ${pC+pO}%, #22c55e ${pC+pO}% 100%)` }}>
                                <div className="absolute inset-3 bg-eden-800 rounded-full flex items-center justify-center"><Users size={32} className="text-eden-100/20"/></div>
                            </div>
                            <div className="flex flex-col gap-3 justify-center self-stretch">
                                <div className="flex items-center gap-3 text-sm font-bold text-white"><div className="w-4 h-4 bg-red-500 rounded-sm shadow-md"></div> Combatente - {pC.toFixed(0)}% ({clsCount.combatente})</div>
                                <div className="flex items-center gap-3 text-sm font-bold text-white"><div className="w-4 h-4 bg-purple-500 rounded-sm shadow-md"></div> Ocultista - {pO.toFixed(0)}% ({clsCount.ocultista})</div>
                                <div className="flex items-center gap-3 text-sm font-bold text-white"><div className="w-4 h-4 bg-green-500 rounded-sm shadow-md"></div> Especialista - {pE.toFixed(0)}% ({clsCount.especialista})</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-eden-700">
                            {['combatente', 'ocultista', 'especialista'].map(clsType => {
                                const clsColor = clsType === 'combatente' ? 'text-red-400' : clsType === 'ocultista' ? 'text-purple-400' : 'text-green-400';
                                return (
                                    <div key={clsType} className="space-y-3">
                                        <div className={`text-xs md:text-sm uppercase font-black border-b border-eden-700/50 pb-1.5 tracking-wider ${clsColor}`}>{clsType}s</div>
                                        {parsedData.filter(c => c.cls === clsType).map(c => (
                                            <div key={c.char.id} className="flex items-center gap-3 bg-eden-950/50 p-2 rounded-xl border border-eden-700/50 shadow-sm">
                                                <div className="w-12 h-12 rounded-lg bg-black shrink-0 overflow-hidden border border-eden-600">{c.char.personal?.portraitUrl ? <img src={c.char.personal.portraitUrl} className="w-full h-full object-cover"/> : <Ghost size={24} className="m-auto mt-3 opacity-50"/>}</div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-xs font-black truncate leading-tight ${clsColor}`}>{c.char.personal?.name || 'Desconhecido'}</div>
                                                    <div className={`text-[9px] uppercase font-bold opacity-70 truncate mt-0.5 ${clsColor}`}>{c.char.personal?.trail || 'Sem Trilha'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-eden-800 border-2 border-purple-500/40 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden mt-10">
                    <div className="p-6 md:p-8 border-b border-purple-500/20 bg-purple-950/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-3xl font-black text-purple-400 uppercase tracking-widest flex items-center gap-3 drop-shadow-md"><Zap size={28}/> Nível Real dos Agentes</h3>
                            <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-2 rounded-xl border border-white/10 hover:border-energia/50 transition-all shadow-sm">
                                    <input type="checkbox" checked={opts.considerCriticals} onChange={() => setOpts(p => ({...p, considerCriticals: !p.considerCriticals}))} className="accent-energia w-4 h-4 rounded" />
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Somar Crítico</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-2 rounded-xl border border-white/10 hover:border-energia/50 transition-all shadow-sm">
                                    <input type="checkbox" checked={opts.addReflexesToDefense} onChange={() => setOpts(p => ({...p, addReflexesToDefense: !p.addReflexesToDefense}))} className="accent-energia w-4 h-4 rounded" />
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Reflexos na Defesa</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-2 rounded-xl border border-white/10 hover:border-energia/50 transition-all shadow-sm">
                                    <input type="checkbox" checked={opts.recklessAttacks} onChange={() => setOpts(p => ({...p, recklessAttacks: !p.recklessAttacks}))} className="accent-energia w-4 h-4 rounded" />
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Ataques Desenfreados</span>
                                </label>
                            </div>
                        </div>
                        <button onClick={() => setShowInfoModal(true)} className="px-4 py-3 bg-purple-900/60 text-purple-200 border border-purple-500/50 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-800 hover:text-white transition-all shadow-lg hover:shadow-purple-500/20"><Info size={18}/> Critérios Matemáticos</button>
                    </div>

                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 p-6 md:p-8 custom-scrollbar w-full">
                        {parsedData.map(c => {
                            if (!['combatente','especialista','ocultista'].includes(c.cls)) return null;
                            const table = IDEAL_TABLES[c.cls];
                            const baseColor = c.cls === 'combatente' ? '#ef4444' : c.cls === 'ocultista' ? '#a855f7' : '#22c55e';
                            
                            const maxScaleNEX = 99; 
                            const charNEX = c.char.personal?.nex || 5;

                            const rPV = getTrueNex(c.maxPV, table.PV);
                            const rPE = getTrueNex(c.maxPE, table.PE);
                            const rSAN = getTrueNex(c.maxSAN, table.SAN);
                            const rAtk = getTrueNex(c.maxAtk, table.ATAQUE);
                            const rDmg = getTrueNex(c.maxDmg, table.DANO);
                            const rDef = getTrueNex(c.trueDef, table.DEFESA);
                            const rResist = getTrueNex(c.trueResist, table.RESISTENCIA);
                            const rPericias = getTrueNex(c.activeSkills, table.PERICIAS);

                            const statsInfo = [
                                { name: 'PV', nex: rPV, raw: c.maxPV },
                                { name: 'PE', nex: rPE, raw: c.maxPE },
                                { name: 'SAN', nex: rSAN, raw: c.maxSAN },
                                { name: 'Ataque', nex: rAtk, raw: c.maxAtk },
                                { name: 'Dano', nex: rDmg, raw: c.maxDmg },
                                { name: 'Defesa', nex: rDef, raw: c.trueDef },
                                { name: 'Perícias', nex: rPericias, raw: c.activeSkills },
                                { name: 'Resistência', nex: rResist, raw: c.trueResist },
                            ];

                            const isOwner = currentUserId === c.char.userId;

                            return (
                                <div key={c.char.id} className="snap-center snap-always shrink-0 w-[92%] md:w-[85%] lg:w-[75%] xl:w-[65%] max-w-5xl bg-eden-950/60 border border-purple-500/20 p-6 md:p-8 rounded-3xl flex flex-col gap-8 shadow-xl">
                                    {}
                                    <div className="flex flex-col xl:flex-row gap-10 items-center xl:items-start w-full">
                                        <div className="flex flex-col items-center gap-4 xl:w-56 shrink-0">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500 bg-black overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                                {c.char.personal?.portraitUrl ? <img src={c.char.personal.portraitUrl} className="w-full h-full object-cover"/> : <Ghost className="m-auto mt-10 w-16 h-16 text-white/20"/>}
                                            </div>
                                            <div className="text-center space-y-1 mt-2">
                                                <h4 className="text-xl md:text-2xl font-black text-white leading-tight">{c.char.personal?.name}</h4>
                                                <div className="text-sm md:text-base text-purple-400 uppercase font-black tracking-widest">{c.cls} • NEX {charNEX}%</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 w-full flex flex-col">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                                                {statsInfo.map((stat, i) => (
                                                    <StatBar key={i} label={stat.name} nexValue={stat.nex} rawValue={stat.raw} charNex={charNEX} baseColor={baseColor} maxScale={maxScaleNEX} />
                                                ))}
                                            </div>
                                            <div className="w-full mt-8 flex flex-wrap gap-4 items-center justify-center border-t border-white/5 pt-5">
                                                <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase font-bold tracking-wider">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div> Defasado (-15% ou pior)
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase font-bold tracking-wider">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: baseColor }}></div> Esperado ({c.cls})
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase font-bold tracking-wider">
                                                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div> Excepcional (+15% ou melhor)
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {}
                                    {isOwner && (
                                        <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 md:p-6 flex flex-col gap-4 mt-2">
                                            <h5 className="text-xs uppercase font-black text-energia tracking-widest border-b border-energia/20 pb-2 flex items-center gap-2">
                                                <Zap size={14} /> Modo Simulação (Sua Ficha)
                                            </h5>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {c.char.inventory?.some((i: any) => i.type === 'weapon' || i.type === 'protection') && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Equipamentos</div>
                                                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                            {c.char.inventory.filter((i: any) => i.type === 'weapon' || i.type === 'protection').map((i: any) => {
                                                                const isEquipped = simulations[c.char.id]?.[i.id] ?? i.isEquipped;
                                                                return (
                                                                    <label key={i.id} className="flex items-center gap-2 text-xs text-white cursor-pointer hover:bg-white/5 p-1.5 rounded transition-colors border border-white/5">
                                                                        <input type="checkbox" checked={isEquipped} onChange={() => toggleSimulation(c.char.id, i.id, isEquipped)} className="accent-energia shrink-0" />
                                                                        <span className="truncate">{i.name}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {(() => {
                                                    const allAbilities = [];
                                                    if (c.char.customOrigin?.power) {
                                                        allAbilities.push({ ...c.char.customOrigin.power, id: 'origin_power', name: c.char.customOrigin.power.name || 'Poder de Origem' });
                                                    }
                                                    if (c.char.classPowers) allAbilities.push(...c.char.classPowers);
                                                    if (c.char.abilities) allAbilities.push(...c.char.abilities);

                                                    if (allAbilities.length === 0) return null;

                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Habilidades</div>
                                                            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                                {allAbilities.map((a: any) => {
                                                                    const isActive = simulations[c.char.id]?.[a.id] ?? a.isActive ?? true;
                                                                    return (
                                                                        <label key={a.id} className="flex items-center gap-2 text-xs text-white cursor-pointer hover:bg-white/5 p-1.5 rounded transition-colors border border-white/5">
                                                                            <input type="checkbox" checked={isActive} onChange={() => toggleSimulation(c.char.id, a.id, isActive)} className="accent-energia shrink-0" />
                                                                            <span className="truncate">{a.name}</span>
                                                                        </label>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {c.char.rituals?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Rituais Ativos</div>
                                                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                            {c.char.rituals.map((r: any) => {
                                                                const isActive = simulations[c.char.id]?.[r.id] ?? (r.normal?.isActive || r.discente?.isActive || r.verdadeiro?.isActive || false);
                                                                return (
                                                                    <label key={r.id} className="flex items-center gap-2 text-xs text-white cursor-pointer hover:bg-white/5 p-1.5 rounded transition-colors border border-white/5">
                                                                        <input type="checkbox" checked={isActive} onChange={() => toggleSimulation(c.char.id, r.id, isActive)} className="accent-energia shrink-0" />
                                                                        <span className="truncate">{r.name}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {showInfoModal && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-eden-900 w-full max-w-3xl rounded-3xl border border-energia/50 flex flex-col max-h-[90vh] shadow-2xl">
                        <div className="p-6 border-b border-energia/30 flex justify-between items-center bg-eden-800 rounded-t-3xl">
                            <h3 className="text-lg font-black text-energia uppercase tracking-widest">Critérios de Avaliação do Nível Real</h3>
                            <button onClick={() => setShowInfoModal(false)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"><X className="text-white/50 hover:text-white"/></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8 text-base text-eden-100/80 custom-scrollbar">
                            <p className="leading-relaxed bg-energia/10 p-4 rounded-xl border border-energia/20 text-energia/90 font-medium">A "Auditoria" do sistema pega sua ficha exatamente como está, roda um simulador numérico contra a base de design oficial do RPG (o mesmo usado para fazer as criaturas) e te diz <strong>"Qual o seu NEX Verdadeiro para esse status"</strong>.</p>
                            
                            <div className="space-y-3">
                                <h4 className="text-white font-black uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2"><Target size={18}/> Critérios Gerais</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                                    <li><strong>PV e PE:</strong> Considera que a build base ideal inicia com Atributo (VIG/PRE) em 3, chegando a 4 no NEX 20% e a 5 no NEX 50%.</li>
                                    <li><strong>SAN:</strong> A SAN Ideal assume que o personagem nunca transcendeu.</li>
                                    <li><strong>Resistência Média:</strong> Compara-se diretamente ao status das criaturas de ameaça proporcional (NEX x 4 = VD da criatura).</li>
                                    <li><strong>Movimentações:</strong> O dano de armas e explosivos leva em consideração a quantidade de movimentações que o personagem possui por turno.</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-red-400 font-black uppercase tracking-widest border-b border-red-500/20 pb-2">Combatente</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                                    <li><strong>Ataque e Defesa:</strong> O sistema espera que seja próximo ao ataque e dano de criaturas com VD compatível ao NEX retornado.</li>
                                    <li><strong>Perícias:</strong> Considerado o ganho padrão da origem, classe e Intelecto + 1 perícia adicional a cada 30% de NEX.</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-green-400 font-black uppercase tracking-widest border-b border-green-500/20 pb-2">Especialista</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                                    <li><strong>Ataque e Defesa:</strong> O sistema espera que seja igual à dois terços do ataque e dano da criatura.</li>
                                    <li><strong>Perícias:</strong> Muda para uma pericia adicional a cada 20% de NEX.</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-purple-400 font-black uppercase tracking-widest border-b border-purple-500/20 pb-2">Ocultista</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                                    <li><strong>Ataque e Defesa:</strong> O sistema espera que seja igual à metade do ataque e dano da criatura.</li>
                                    <li><strong>Perícias:</strong> Muda para uma perícia adicional a cada 25% de NEX.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="p-6 border-t border-energia/30 bg-eden-800 rounded-b-3xl flex justify-end">
                            <button onClick={() => setShowInfoModal(false)} className="px-8 py-3 bg-energia text-eden-950 font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors shadow-lg">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}