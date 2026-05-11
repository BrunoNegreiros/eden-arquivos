import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { solveFormulaNumber } from '../../utils/characterFormulas'; 
import { 
  Swords, Crosshair, Bomb, Hand, 
  Target, Info, AlertTriangle, 
  Link, Circle, Infinity
} from 'lucide-react';
import type { UserWeapon, UserExplosive, UserAmmo } from '../../types/systemData';

const UNARMED_ATTACK: any = {
    id: 'unarmed_virtual',
    type: 'weapon',
    name: 'Ataque Desarmado',
    description: 'Golpes com punhos, chutes ou cabeçadas.',
    weight: 0,
    category: 0,
    complexity: 'simple',
    hands: 'light', 
    range: 'adjacente',
    subtype: 'melee',
    attackTest: { skill: 'Luta' }, 
    damage: [{ id: 'unarmed_dmg', diceCount: 1, diceFace: 3, type: 'impacto', bonus: { terms: [], operations: [] }, isMultipliable: true }], 
    critical: { range: 20, multiplier: 2 },
    ammunition: undefined,
    attacks: []
};

const COMPLEXITY_MAP: Record<string, string> = { simple: 'Simples', tactical: 'Tática', heavy: 'Pesada' };
const HANDS_MAP: Record<string, string> = { light: 'Leve', one: 'Uma Mão', two: 'Duas Mãos' };
const RANGE_MAP: Record<string, string> = { adjacente: 'Adjacente', curto: 'Curto', medio: 'Médio', longo: 'Longo', extremo: 'Extremo' };

export default function SheetCombat() {
  const { character, updateCharacter, vars } = useCharacter();
  const [critToggles, setCritToggles] = useState<Record<string, boolean>>({});

  const injectedItems = (vars.INJECTED_ITEMS || []).map((i: any) => ({ ...i, isInjected: true, isEquipped: true }));
  const fullInventory = [...(character.inventory || []), ...injectedItems];

  const inventoryWeapons = fullInventory.filter((i: any) => i.type === 'weapon' && i.isEquipped) as UserWeapon[];
  const inventoryExplosives = fullInventory.filter((i: any) => i.type === 'explosive' && i.isEquipped) as UserExplosive[];
  
  const inventoryAmmo = fullInventory.filter((i: any) => i.type === 'ammo') as UserAmmo[];
  
  const allAttacks = [UNARMED_ATTACK, ...inventoryWeapons, ...inventoryExplosives];

  const handleAttachAmmo = (weaponId: string, ammoId: string) => { 
      updateCharacter(prev => ({
          ...prev,
          inventory: prev.inventory.map(i => 
              i.id === weaponId ? { ...i, ammunition: ammoId } : i
          )
      }));
  };

  const handleShoot = (_weaponId: string, ammoId: string, isBurst: boolean) => {
      const ammoItem = inventoryAmmo.find(i => i.id === ammoId);
      if (!ammoItem) return alert("Munição não encontrada!");

      const cost = isBurst ? 3 : 1;
      const durationType = ammoItem.ammoDurationType || 'scenes';

      if (durationType === 'infinite') return;
      if (durationType === 'single_use') {
          if ((ammoItem.amount || 0) < cost) return alert("Unidades de munição insuficientes para este disparo!");
          updateCharacter(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === ammoId ? { ...i, amount: (i.amount || 0) - cost } : i) }));
          return;
      }

      if (durationType === 'scenes') {
          const availableLeftovers = ammoItem.leftovers || 0;
          const currentHigh = ammoItem.sceneUsageCount || 0;
          
          let pointsToAdd = 0; let leftoversToConsume = 0;

          if (availableLeftovers >= cost) leftoversToConsume = cost;
          else { leftoversToConsume = availableLeftovers; pointsToAdd = cost - availableLeftovers; }

          const potentialHigh = currentHigh + pointsToAdd;
          const scenesNeeded = Math.floor(potentialHigh / 10);

          if (scenesNeeded > (ammoItem.durationScenes || 0)) return alert("Munição esgotada! Você não tem Cenas suficientes para cobrir este disparo.");

          updateCharacter(prev => ({
              ...prev,
              inventory: prev.inventory.map(i => {
                  if (i.id === ammoId) {
                      return { 
                          ...i, 
                          leftovers: Math.max(0, ((i as UserAmmo).leftovers || 0) - leftoversToConsume), 
                          durationScenes: Math.max(0, ((i as UserAmmo).durationScenes || 0) - scenesNeeded),
                          sceneUsageCount: potentialHigh % 10
                      };
                  }
                  return i;
              })
          }));
      }
  };

  const handleThrowExplosive = (explosiveId: string) => {
      if(!confirm("Usar explosivo? Quantidade -1.")) return;
      updateCharacter(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === explosiveId ? { ...i, amount: Math.max(0, (i.amount || 0) - 1) } : i).filter((i: any) => i.amount > 0) }));
  };

  const renderAttackCard = (item: any) => {
      const isExplosive = item.type === 'explosive';
      const isVirtual = item.id === 'unarmed_virtual';
      const isRangedWeapon = item.type === 'weapon' && item.subtype === 'ranged';
      
      const complexity = COMPLEXITY_MAP[item.complexity || 'simple'] || 'Simples';
      const hands = HANDS_MAP[item.hands || 'one'] || 'Uma Mão';
      const range = RANGE_MAP[item.range || 'adjacente'] || item.range || 'Curto';
      let subtype = item.type === 'weapon' ? (item.subtype === 'ranged' ? 'À Distância' : 'Corpo a Corpo') : 'Arremesso';
      
      const damageList = Array.isArray(item.damage) ? item.damage : [];
      const hasDamage = damageList.length > 0;
      
      const baseCritRange = item.critical?.range || 20;
      const wSubtype = isExplosive ? 'explosive' : (item.subtype || 'melee');
      const wId = item.id;
      
      const wbAll = (vars as any)?.WEAPON_BONUS?.all || {};
      const wbSub = (vars as any)?.WEAPON_BONUS?.[wSubtype] || {};
      const wbId = (vars as any)?.WEAPON_BONUS?.[wId] || {};

      const rangeMod = (wbAll.criticalRange || 0) + (wbSub.criticalRange || 0) + (wbId.criticalRange || 0);
      const finalCritRange = Math.max(2, baseCritRange - rangeMod);

      const multMod = (wbAll.criticalMultiplier || 0) + (wbSub.criticalMultiplier || 0) + (wbId.criticalMultiplier || 0);
      const critMult = (item.critical?.multiplier || 2) + multMod;

      let finalDT = item.dt || 0;
      if (isExplosive) {
          if (item.dtAttribute && item.dtAttribute !== 'none') {
              const attrVal = (vars as any)?.ATTRS?.[item.dtAttribute] || 0;
              const limit = (vars as any)?.PE?.limit || Math.max(1, Math.floor(character.personal.nex / 5));
              finalDT = 10 + limit + attrVal + (item.dt || 0);
          }
          finalDT += ((vars as any)?.EXPLOSIVE_DT_MOD || 0);
      }

      const attachedAmmoId = item.ammunition; 
      const attachedAmmoItem = attachedAmmoId ? inventoryAmmo.find(i => i.id === attachedAmmoId) : null;
      
      const durationType = attachedAmmoItem?.ammoDurationType || 'scenes';
      const ammoAmount = attachedAmmoItem?.amount || 0;
      const ammoScenes = attachedAmmoItem?.durationScenes || 0;
      const ammoLeftovers = attachedAmmoItem?.leftovers || 0;
      const currentCounter = attachedAmmoItem?.sceneUsageCount || 0; 

      const canShoot = attachedAmmoItem && (
          (durationType === 'infinite') ||
          (durationType === 'single_use' && ammoAmount > 0) ||
          (durationType === 'scenes' && (ammoScenes > 0 || ammoLeftovers > 0))
      );

      let Icon = Swords;
      if (isExplosive) Icon = Bomb;
      if (isVirtual) Icon = Hand;
      if (isRangedWeapon) Icon = Crosshair;

      return (
          <div key={item.id} className="bg-eden-900/50 border border-eden-700 rounded-2xl overflow-hidden hover:border-eden-500 transition-all flex flex-col shadow-lg">
              
              <div className="p-4 md:p-5 bg-eden-950/80 border-b border-eden-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto min-w-0">
                      <div className={`p-2.5 md:p-3 rounded-xl bg-black/40 shadow-inner border border-white/5 shrink-0 ${isExplosive ? 'text-red-400' : isVirtual ? 'text-eden-100' : 'text-energia'}`}>
                          <Icon size={24} className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                          <h3 className="text-base md:text-lg font-black text-white leading-tight break-words">{item.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-[9px] md:text-[10px] bg-eden-800 text-eden-100/70 px-1.5 py-0.5 rounded border border-eden-700 uppercase font-bold tracking-wider whitespace-nowrap">{subtype}</span>
                              <span className="text-[9px] md:text-[10px] bg-eden-800 text-eden-100/70 px-1.5 py-0.5 rounded border border-eden-700 uppercase font-bold tracking-wider whitespace-nowrap">{complexity}</span>
                              <span className="text-[9px] md:text-[10px] bg-eden-800 text-eden-100/70 px-1.5 py-0.5 rounded border border-eden-700 uppercase font-bold tracking-wider whitespace-nowrap">{hands}</span>
                          </div>
                      </div>
                  </div>

                  {hasDamage && !isExplosive && (
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 bg-red-950/10 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-red-900/30">
                          <div className="text-xs md:text-sm font-black text-red-400 flex items-center gap-1.5"><Target size={14} className="md:w-4 md:h-4"/> Margem {finalCritRange}</div>
                          <div className="text-[10px] md:text-xs font-mono font-bold text-eden-100/70 sm:bg-black/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded sm:mt-1.5 sm:border sm:border-white/5">x{critMult} Crítico</div>
                      </div>
                  )}

              </div>

              <div className="p-4 md:p-5 space-y-5 flex-1 flex flex-col">
                  
                  <div className="flex gap-3">
                      <div className="flex-1 bg-black/20 p-3 rounded-xl border border-eden-700/30 flex flex-col justify-center">
                          <span className="text-[10px] text-eden-100/40 uppercase font-bold mb-1">Alcance</span>
                          <span className="text-sm md:text-base text-eden-100 font-bold capitalize">{range}</span>
                      </div>
                      {isExplosive && (
                           <div className="flex-1 bg-black/20 p-3 rounded-xl border border-eden-700/30 flex flex-col justify-center">
                              <span className="text-[10px] text-eden-100/40 uppercase font-bold mb-1">Quantidade</span>
                              <span className="text-sm md:text-base text-eden-100 font-bold">x{item.amount || 0}</span>
                           </div>
                      )}
                  </div>

                  {}
                  {isExplosive && (item.area || finalDT > 0) && (
                      <div className="flex gap-3">
                          {item.area && (
                              <div className="flex-1 bg-red-900/10 p-3 rounded-xl border border-red-500/20 flex flex-col justify-center">
                                  <span className="text-[10px] text-red-200/50 uppercase font-bold mb-1">Área de Efeito</span>
                                  <span className="text-sm md:text-base text-red-100 font-bold">{item.area}</span>
                              </div>
                          )}
                          {finalDT > 0 && (
                              <div className="flex-1 bg-red-900/10 p-3 rounded-xl border border-red-500/20 flex flex-col justify-center">
                                  <span className="text-[10px] text-red-200/50 uppercase font-bold mb-1">DT Resistência</span>
                                  <span className="text-sm md:text-base text-red-100 font-bold">{finalDT}</span>
                              </div>
                          )}
                      </div>
                  )}

                  {hasDamage ? (
                      <div className="space-y-3">
                          {item.type === 'weapon' && item.attackTest && (
                              <div className="flex justify-between items-center p-3.5 rounded-xl bg-energia/10 border border-energia/20">
                                  <span className="text-xs uppercase font-bold text-energia/70">Teste de Ataque:</span>
                                  {(() => {
                                      const skillName = item.attackTest.skill || 'Luta';
                                      const skillData = vars?.SKILLS ? vars.SKILLS[skillName] : { dice: 1, total: 0 };
                                      
                                      let baseDice = skillData?.dice || 1;
                                      if (item.isAgile && skillName === 'Luta') {
                                          const forAttr = (vars as any)?.ATTRS?.FOR || 0;
                                          const agiAttr = (vars as any)?.ATTRS?.AGI || 0;
                                          if (agiAttr > forAttr) {
                                              baseDice = baseDice - forAttr + agiAttr;
                                          }
                                      }

                                      const wBonusDice = (wbAll.attackDice || 0) + (wbSub.attackDice || 0) + (wbId.attackDice || 0);
                                      const wBonusFixed = (wbAll.attackBonus || 0) + (wbSub.attackBonus || 0) + (wbId.attackBonus || 0);
                                      
                                      const secDice = item.attackTest.secondaryDice ? solveFormulaNumber(item.attackTest.secondaryDice, vars, character, wId, 'fixed') : 0;
                                      const secBonus = item.attackTest.secondaryBonus ? solveFormulaNumber(item.attackTest.secondaryBonus, vars, character, wId, 'fixed') : 0;

                                      const totalDice = baseDice + wBonusDice + secDice;
                                      const b = (skillData?.total || 0) + wBonusFixed + secBonus;
                                      
                                      let diceDisplay = `${totalDice}d20`;
                                      let isDisadvantage = false;
                                      if (totalDice < 1) {
                                          diceDisplay = `${2 - totalDice}d20`;
                                          isDisadvantage = true;
                                      }
                                      
                                      return (
                                          <span className="text-sm md:text-base font-black text-energia flex items-center gap-1.5">
                                              <Crosshair size={16}/> 
                                              {diceDisplay}{b >= 0 ? '+' : ''}{b} 
                                              {isDisadvantage && <span className="text-[9px] font-black uppercase text-red-200 bg-red-900/80 px-1.5 py-0.5 rounded border border-red-500 ml-1">Pior</span>}
                                              <span className="text-xs font-bold text-energia/50 ml-1">({skillName})</span>
                                          </span>
                                      );
                                  })()}
                              </div>
                          )}

                          {damageList.length > 0 && (
                              <div className="bg-black/30 border border-eden-700/50 rounded-xl overflow-hidden flex flex-col mt-2 shadow-inner">
                                  <div className="bg-eden-900/80 p-2.5 border-b border-eden-700/30 flex justify-between items-center">
                                      <span className="text-[10px] uppercase font-bold text-eden-100/50 ml-1">Dano Causado</span>
                                      {!isExplosive && (
                                          <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-2 py-1 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors">
                                              <span className={`text-[10px] font-bold uppercase tracking-wider ${critToggles[item.id] ? 'text-red-400' : 'text-eden-100/50'}`}>Crítico x{critMult}</span>
                                              <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${critToggles[item.id] ? 'bg-red-500' : 'bg-eden-800'}`}>
                                                  <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${critToggles[item.id] ? 'translate-x-3' : 'translate-x-0'}`}/>
                                              </div>
                                              <input type="checkbox" className="hidden" checked={critToggles[item.id] || false} onChange={() => setCritToggles(p => ({ ...p, [item.id]: !p[item.id] }))}/>
                                          </label>
                                      )}
                                  </div>
                                  <div className="p-3.5 flex flex-col gap-3">
                                      {(() => {
                                          const isCrit = critToggles[item.id] || false;
                                          const allExtra = [...(wbAll.extraDamages || []), ...(wbSub.extraDamages || []), ...(wbId.extraDamages || [])];
                      
                                          const groupedDamage: Record<string, { parts: { count: number; face: number; isMult: boolean; isExtra: boolean }[]; fixed: number; }> = {};
                      
                                          const addPart = (type: string, count: number, face: number, isMult: boolean, isExtra: boolean) => {
                                              if (!groupedDamage[type]) groupedDamage[type] = { parts: [], fixed: 0 };
                                              if (count > 0) groupedDamage[type].parts.push({ count, face, isMult, isExtra });
                                          };
                      
                                          const addFixed = (type: string, amount: number) => {
                                              if (!groupedDamage[type]) groupedDamage[type] = { parts: [], fixed: 0 };
                                              groupedDamage[type].fixed += amount;
                                          };
                      
                                          const typesProcessed: string[] = [];
                      
                                          damageList.forEach((dmg: any, i: number) => {
                                              const damageOverride = wbId.damageOverride?.[`idx_${i}`] || wbSub.damageOverride?.[`idx_${i}`] || wbAll.damageOverride?.[`idx_${i}`];
                                              const targetDmg = damageOverride ? { ...dmg, ...damageOverride } : dmg;
                                              const type = targetDmg.type || 'impacto';
                                              typesProcessed.push(type);
                      
                                              const getInc = (incObj: any) => {
                                                  if (!incObj) return { diceCount: 0, diceFace: 0, fixed: 0 };
                                                  if (typeof incObj === 'number') return { diceCount: incObj, diceFace: 0, fixed: 0 };
                                                  return incObj;
                                              };
                      
                                              const specificInc = getInc(wbId.damageDiceIncrease?.[`idx_${i}`] || wbId.damageDiceIncrease?.[type]);
                                              const subInc = getInc(wbSub.damageDiceIncrease?.[`idx_${i}`] || wbSub.damageDiceIncrease?.[type]);
                                              const allInc = getInc(wbAll.damageDiceIncrease?.[`idx_${i}`] || wbAll.damageDiceIncrease?.[type]);
                      
                                              let c = (targetDmg.diceCount || 0) + specificInc.diceCount + subInc.diceCount + allInc.diceCount;
                                              const f = Math.max(targetDmg.diceFace || 6, specificInc.diceFace, subInc.diceFace, allInc.diceFace);
                      
                                              addPart(type, c, f, targetDmg.isMultipliable !== false, false);
                      
                                              let itemBonusFixed = 0;
                                              let itemBonusDice: {count: number, face: number}[] = [];
                                              
                                              if (!damageOverride && targetDmg.bonus) {
                                                  itemBonusFixed = solveFormulaNumber(targetDmg.bonus, vars, character, wId, 'fixed');
                                                  if (Array.isArray(targetDmg.bonus.terms)) {
                                                      targetDmg.bonus.terms.forEach((t: any) => { if (t.type === 'dice') itemBonusDice.push({ count: t.value || 1, face: t.diceFace || 6 }); });
                                                  }
                                              } else if (damageOverride) {
                                                  itemBonusFixed = damageOverride.bonus || 0;
                                              }
                      
                                              itemBonusFixed += (specificInc.fixed + subInc.fixed + allInc.fixed);
                      
                                              if (wSubtype === 'melee' && i === 0 && !isExplosive) {
                                                  let attrBonus = ((vars as any)?.ATTRS?.FOR || 0);
                                                  if (item.isAgile && item.attackTest?.skill === 'Luta') {
                                                      const agiAttr = ((vars as any)?.ATTRS?.AGI || 0);
                                                      if (agiAttr > attrBonus) attrBonus = agiAttr;
                                                  }
                                                  itemBonusFixed += attrBonus;
                                              }
                      
                                              addFixed(type, itemBonusFixed);
                                              itemBonusDice.forEach(d => addPart(type, d.count, d.face, false, false));
                      
                                              const extrasOfThisType = allExtra.filter((e: any) => e.type === type || (e.type === 'primario' && i === 0));
                                              extrasOfThisType.forEach((ex: any) => {
                                                  addPart(type, ex.diceCount, ex.diceFace, !!ex.isMultipliable, true);
                                                  addFixed(type, ex.fixed || 0);
                                              });
                                          });
                      
                                          const standaloneExtras = allExtra.filter((e: any) => !typesProcessed.includes(e.type) && e.type !== 'primario');
                                          standaloneExtras.forEach((ex: any) => {
                                              addPart(ex.type, ex.diceCount, ex.diceFace, !!ex.isMultipliable, true);
                                              addFixed(ex.type, ex.fixed || 0);
                                          });
                      
                                          return Object.entries(groupedDamage).map(([type, data], idx) => {
                                              const partsReact: any[] = [];
                                              
                                              data.parts.forEach((p, pIdx) => {
                                                  const count = (isCrit && p.isMult) ? p.count * critMult : p.count;
                                                  const str = `${count}d${p.face}`;
                                                  if (pIdx > 0 || partsReact.length > 0) partsReact.push(<span key={`plus_${pIdx}`} className="text-eden-100/30 mx-1.5 font-normal">+</span>);
                                                  partsReact.push(
                                                      <span key={`p_${pIdx}`} className={p.isExtra ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-white'}>
                                                          {str}
                                                      </span>
                                                  );
                                              });
                      
                                              if (data.fixed !== 0) {
                                                  const sign = data.fixed > 0 ? '+' : '-';
                                                  partsReact.push(<span key="fixed_plus" className="text-eden-100/30 mx-1.5 font-normal">{sign}</span>);
                                                  partsReact.push(<span key="fixed_val" className="text-white">{Math.abs(data.fixed)}</span>);
                                              }
                      
                                              return (
                                                  <div key={idx} className="flex justify-between items-center text-sm md:text-base font-mono font-bold">
                                                      <div className="flex-1 flex flex-wrap items-center">
                                                          {partsReact.length > 0 ? partsReact : <span className="text-white">0</span>}
                                                          <span className="text-xs font-sans uppercase text-eden-100/50 ml-2 mt-0.5 tracking-wider">de {type}</span>
                                                      </div>
                                                  </div>
                                              );
                                          });
                                      })()}
                                  </div>
                              </div>
                          )}
                      </div>
                  ) : (
                      <div className="py-5 px-4 rounded-xl bg-eden-950/30 border border-eden-700/30 text-center flex flex-col gap-3">
                          <span className="text-sm font-bold text-eden-100/70 uppercase flex items-center justify-center gap-2">
                              <AlertTriangle size={16} className="text-yellow-500"/> Efeito Tático / Não-Letal
                          </span>
                      </div>
                  )}

                  {isRangedWeapon && (
                      <div className="bg-black/20 rounded-xl border border-eden-700/50 p-4 space-y-4">
                          <div className="flex items-center gap-3 w-full">
                              <Link size={16} className="text-eden-100/50 shrink-0"/>
                              <select value={attachedAmmoId || ''} onChange={(e) => handleAttachAmmo(item.id, e.target.value)} className="flex-1 min-w-0 w-full text-ellipsis overflow-hidden bg-eden-900 border border-eden-600 rounded-lg text-sm text-white p-2.5 outline-none focus:border-energia">
                                  <option value="">-- Selecionar Munição --</option>
                                  {inventoryAmmo.map(ammo => {
                                      let label = ammo.name;
                                      if (ammo.ammoDurationType === 'infinite') label += ' (Infinita)';
                                      else if (ammo.ammoDurationType === 'single_use') label += ` (${ammo.amount} Un)`;
                                      else label += ` (${ammo.durationScenes} Cenas / ${ammo.leftovers || 0} Sobras)`;
                                      return <option key={ammo.id} value={ammo.id}>{label}</option>
                                  })}
                              </select>
                          </div>

                          {attachedAmmoItem && (
                              <div className="space-y-4 animate-in fade-in">
                                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                      <div>
                                          {durationType === 'infinite' && <div className="text-base font-black text-cyan-400 flex items-center gap-1.5"><Infinity size={18}/> Infinita</div>}
                                          {durationType === 'single_use' && <><div className="text-[10px] uppercase font-bold text-eden-100/50 mb-1">Unidades</div><div className={`text-2xl font-black leading-none ${ammoAmount > 0 ? 'text-white' : 'text-red-500'}`}>{ammoAmount}</div></>}
                                          {(durationType === 'scenes' || !durationType) && <><div className="text-[10px] uppercase font-bold text-eden-100/50 mb-1">Duração Atual</div><div className={`text-2xl font-black leading-none ${(ammoScenes > 0 || ammoLeftovers > 0) ? 'text-white' : 'text-red-500'}`}>{ammoScenes} <span className="text-sm font-normal text-eden-100/30">Cenas</span>{ammoLeftovers > 0 && <span className="text-lg text-yellow-400 ml-2">+ {ammoLeftovers} <span className="text-sm">Sobras</span></span>}</div></>}
                                      </div>
                                      {durationType === 'scenes' && (
                                          <div className="text-right">
                                            <div className="text-[9px] uppercase font-bold text-eden-100/30 mb-1.5">Contador de Tiros</div>
                                            <div className="flex gap-1">{Array.from({length: 10}).map((_, i) => <div key={i} className={`w-2 h-4 rounded-sm ${i < currentCounter ? 'bg-energia shadow-[0_0_8px_rgba(255,215,0,0.6)]' : 'bg-eden-800/80'}`} />)}</div>
                                          </div>
                                      )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                      <button onClick={() => handleShoot(item.id, attachedAmmoId, false)} disabled={!canShoot} className="py-3 bg-eden-800 hover:bg-eden-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors border border-eden-600 shadow-sm"><Circle size={12} className="fill-current"/>Tiro Único {durationType !== 'infinite' ? '(-1)' : ''}</button>
                                      <button onClick={() => handleShoot(item.id, attachedAmmoId, true)} disabled={!canShoot} className="py-3 bg-eden-800 hover:bg-eden-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors border border-eden-600 shadow-sm"><div className="flex -space-x-1"><Circle size={12} className="fill-current"/><Circle size={12} className="fill-current"/><Circle size={12} className="fill-current"/></div>Rajada {durationType !== 'infinite' ? '(-3)' : ''}</button>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {isExplosive && (
                      <button onClick={() => handleThrowExplosive(item.id)} className="w-full py-3 mt-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-200 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"><Bomb size={18}/> {hasDamage ? 'Arremessar' : 'Usar/Detonar'} (-1 Qtd)</button>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in pb-20">
        <div className="bg-cyan-950/20 border border-cyan-700/50 p-3 rounded-lg flex gap-3 items-start mx-1 mt-2">
            <Info size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            <div className="text-xs text-cyan-100/80">
                <strong className="text-cyan-200 block mb-1">Como Funciona a Munição</strong>
                <ul className="list-disc pl-3 space-y-1">
                    <li><strong>Uso Único:</strong> Consome as unidades que você tem no inventário.</li>
                    <li><strong>Por Cenas (Uso Alto):</strong> Encher o contador gasta 1 cena do pacote.</li>
                    <li><strong>Por Cenas (Uso Baixo):</strong> Finalizar a cena tendo dado apenas 1 tiro único transforma 1 cena em "Sobras" (ataques individuais), impedindo o desperdício de um pacote inteiro.</li>
                </ul>
            </div>
        </div>

        {allAttacks.length === 0 ? (
            <div className="text-center py-10 text-eden-100/30 border-2 border-dashed border-eden-800 rounded-xl">Nenhum ataque disponível. Equipe uma arma no inventário.</div>
        ) : (
            <div className="flex flex-col gap-5">{allAttacks.map(renderAttackCard)}</div>
        )}
    </div>
  );
}