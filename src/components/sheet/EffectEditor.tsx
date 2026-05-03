import { useState } from 'react';
import { Trash2, Plus, Calculator, Edit2, X, Settings } from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import type { Effect, TermType, Operation } from '../../types/systemData';
import { SKILL_MAP } from '../../utils/characterFormulas';
import { CONDITIONS_LIST } from '../../data/referenceData';

import { RitualForm } from './SheetRituals';
import { AbilityForm } from './SheetAbilities';
import { ItemForm } from './SheetInventory';

interface Props { effect: Effect; onChange: (effect: Effect) => void; onRemove: () => void; isNested?: boolean }

const ALL_DAMAGE_TYPES = ['balistico', 'corte', 'impacto', 'perfuracao', 'fogo', 'frio', 'eletricidade', 'quimico', 'conhecimento', 'sangue', 'morte', 'energia', 'medo', 'mental', 'paranormal'];

const getDefaultTargetType = (cat: string): string => {
    if (cat === 'change_dice') return 'test_skill';
    if (cat === 'add_resistance') return 'dr';
    if (cat === 'change_damage') return 'damage_roll';
    if (cat === 'instant_heal_damage') return 'pv_current';
    if (cat === 'gain_proficiency') return 'proficiency';
    if (cat === 'override_power') return 'override_ability';
    return 'defense';
};

export default function EffectEditor({ effect, onChange, onRemove, isNested = false }: Props) {
  const { character } = useCharacter();
  
  const virtualUnarmed = { id: 'unarmed_virtual', name: 'Ataque Desarmado', type: 'weapon', damage: [{ type: 'impacto' }] };
  const weapons = [virtualUnarmed, ...character.inventory.filter((i: any) => i.type === 'weapon')];
  
  const rituals = character.rituals || [];
  
  const [isEditingPayload, setIsEditingPayload] = useState(false);

  const updateField = (field: keyof Effect, value: any) => { onChange({ ...effect, [field]: value }); };

  const updateTargetFull = (index: number, newTarget: any) => {
      const newTargets = [...effect.targets]; newTargets[index] = newTarget; onChange({ ...effect, targets: newTargets });
  };

  const updateTargetField = (index: number, field: string, value: any) => { updateTargetFull(index, { ...effect.targets[index], [field]: value }); };

  const handleAddTarget = () => {
      const newType = getDefaultTargetType(effect.category);
      const newTarget: any = { id: Date.now().toString(), type: newType };
      
      if (newType === 'test_skill') newTarget.skill = 'Luta';
      if (newType === 'attribute' || newType === 'test_attribute') newTarget.attribute = 'PRE';
      if (['dr', 'immunity_damage', 'vulnerability', 'damage_roll', 'damage_increase', 'change_damage'].includes(newType)) newTarget.damageType = 'primario';
      if (newType === 'immunity_condition') newTarget.condition = 'Agarrado';
      if (['test_attack', 'damage_roll', 'damage_increase', 'change_damage', 'critical_range', 'critical_multiplier'].includes(newType)) newTarget.weaponFilter = 'all';
      if (newType === 'ritual_dt') newTarget.ritualId = 'all';
      if (newType === 'proficiency') newTarget.proficiencyType = 'simples';

      onChange({ ...effect, targets: [...effect.targets, newTarget] });
  };

  const handleCategoryChange = (newCat: string) => {
      let currentTargets = [...effect.targets];
      if (currentTargets.length === 0) currentTargets = [{ id: Date.now().toString(), type: 'defense' as any }];

      const newTargets = currentTargets.map(t => {
          let newType = getDefaultTargetType(newCat);
          const nt: any = { id: t.id, type: newType };
          if (newType === 'test_skill') nt.skill = 'Luta';
          if (newType === 'dr') nt.damageType = 'balistico';
          if (newType === 'proficiency') nt.proficiencyType = 'simples';
          if (['damage_roll', 'test_attack', 'critical_range', 'critical_multiplier'].includes(newType)) nt.weaponFilter = 'all';
          return nt;
      });

      onChange({ 
          ...effect, category: newCat as any, targets: newTargets, payload: undefined, textDescription: '', 
          payloadType: newCat === 'gain_power' ? 'ability' : undefined 
      });
  };

  const terms = effect.value?.terms || [{ id: '1', type: 'fixed', value: 0 }];
  const operations = effect.value?.operations || [];

  const updateTerm = (index: number, updates: any) => {
      const newTerms = [...terms]; newTerms[index] = { ...newTerms[index], ...updates }; onChange({ ...effect, value: { terms: newTerms as any, operations } });
  };

  return (
    <div className={`p-3 md:p-4 rounded-xl border space-y-4 relative group animate-in fade-in ${isNested ? 'bg-black/40 border-energia/30' : 'bg-black/30 border-eden-700'}`}>
      <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>

      <div className="space-y-1 pr-8">
          <label className="text-[10px] uppercase font-bold text-eden-100/50 flex items-center gap-1"><Edit2 size={12} className="text-energia"/> Nome do Efeito</label>
          <input type="text" value={effect.name || ''} onChange={e => updateField('name', e.target.value)} placeholder="Ex: Força do Touro" className="w-full bg-eden-950 border border-eden-700 rounded-lg p-2 text-sm text-white outline-none focus:border-energia font-bold"/>
      </div>

      <div className="pr-8">
          <label className="text-[10px] uppercase font-bold text-eden-100/50">Ação do Efeito</label>
          <select value={effect.category} onChange={e => handleCategoryChange(e.target.value)} className="w-full md:w-1/2 bg-eden-950 border border-eden-700 rounded-lg p-2 text-sm text-white outline-none mt-1">
            <option value="add_fixed">Modificar Valor (Numérico)</option>
            <option value="change_dice">Aumento de Dados (+XdY)</option>
            <option value="add_resistance">Adicionar Resistência/Imunidade</option>
            <option value="change_damage">Substituir Dano Específico</option>
            <option value="gain_proficiency">Ganhar Proficiência / Acesso</option>
            <option value="instant_heal_damage">Cura / Dano Instantâneo</option>
            <option value="gain_power">Ganhar Poder/Ritual/Item Dinâmico</option>
            <option value="override_power">Substituir Poder/Ritual Existente</option>
            <option value="manual">Efeito Manual (Texto)</option>
          </select>
      </div>

      {effect.category === 'manual' && (
          <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-eden-100/50">Descrição do Efeito</label>
              <textarea value={effect.textDescription || ''} onChange={e => updateField('textDescription', e.target.value)} className="w-full bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white min-h-[60px]" placeholder="Descreva as regras manuais..." />
          </div>
      )}

      {effect.category === 'gain_power' && (
          <div className="p-4 border border-purple-500/50 bg-purple-900/10 rounded-xl space-y-4">
              <div className="text-xs text-purple-300 font-bold uppercase flex items-center justify-between border-b border-purple-500/30 pb-2">
                  Conceder Novo Poder / Item Dinâmico
              </div>
              
              <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                      <input type="radio" checked={effect.payloadType === 'ability'} onChange={() => updateField('payloadType', 'ability')} className="accent-purple-500 w-4 h-4"/> Habilidade
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                      <input type="radio" checked={effect.payloadType === 'ritual'} onChange={() => updateField('payloadType', 'ritual')} className="accent-purple-500 w-4 h-4"/> Ritual
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                      <input type="radio" checked={effect.payloadType === 'item'} onChange={() => updateField('payloadType', 'item')} className="accent-purple-500 w-4 h-4"/> Item Injetado
                  </label>
              </div>

              {effect.payload ? (
                  <div className="bg-black/40 p-3 rounded border border-purple-500/20">
                      <div className="text-sm font-bold text-white">{effect.payload.name || 'Sem Nome'}</div>
                      <div className="text-[10px] text-purple-300 mt-1">Configuração salva. O componente será injetado na ficha.</div>
                  </div>
              ) : (
                  <div className="text-[10px] text-eden-100/40 italic">Nenhum componente configurado. Clique abaixo para construir.</div>
              )}

              <button onClick={() => setIsEditingPayload(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-xs font-black w-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                  <Settings size={16}/> {effect.payload ? 'EDITAR CONFIGURAÇÃO' : 'CONSTRUIR COMPONENTE'}
              </button>

              {isEditingPayload && effect.payloadType === 'ritual' && <RitualForm initialData={effect.payload} onSave={data => { updateField('payload', data); setIsEditingPayload(false); }} onCancel={() => setIsEditingPayload(false)} />}
              {isEditingPayload && effect.payloadType === 'ability' && <AbilityForm initialData={effect.payload} onSave={data => { updateField('payload', data); setIsEditingPayload(false); }} onCancel={() => setIsEditingPayload(false)} />}
              {isEditingPayload && effect.payloadType === 'item' && <ItemForm initialData={effect.payload} onSave={(data: any) => { updateField('payload', data); setIsEditingPayload(false); }} onCancel={() => setIsEditingPayload(false)} />}
          </div>
      )}

      {effect.category === 'override_power' && (
        <div className="p-4 border border-purple-500/50 bg-purple-900/10 rounded-xl space-y-4">
            <div className="text-xs text-purple-300 font-bold uppercase border-b border-purple-500/30 pb-2">
                Modificar Poder / Ritual Existente
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white">1. Qual poder você deseja modificar?</label>
                
                {effect.targets.map((target, idx) => (
                    <div key={target.id} className="flex flex-col md:flex-row gap-2 bg-eden-950/50 p-2 rounded-lg border border-purple-500/30">
                        <select value={target.type} onChange={e => {
                            const newTargets = [...effect.targets];
                            newTargets[idx] = { ...newTargets[idx], type: e.target.value as any, abilityId: '', ritualId: '' };
                            onChange({...effect, targets: newTargets, payload: undefined});
                        }} className="bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white outline-none">
                            <option value="override_ability">Uma Habilidade</option>
                            <option value="override_ritual">Um Ritual</option>
                        </select>
                        
                        {target.type === 'override_ability' && (
                            <select value={target.abilityId || ''} onChange={e => {
                                const val = e.target.value;
                                const newTargets = [...effect.targets];
                                newTargets[idx] = { ...newTargets[idx], abilityId: val };
                                const sourceAbility = [...(character.abilities||[]), ...(character.classPowers||[])].find(a => a.id === val);
                                
                                onChange({
                                    ...effect,
                                    targets: newTargets,
                                    payload: sourceAbility ? JSON.parse(JSON.stringify(sourceAbility)) : undefined
                                });
                            }} className="flex-1 bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white outline-none">
                                <option value="">-- Selecione a Habilidade --</option>
                                {[...(character.abilities||[]), ...(character.classPowers||[])].map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        )}
                        
                        {target.type === 'override_ritual' && (
                            <select value={target.ritualId || ''} onChange={e => {
                                const val = e.target.value;
                                const newTargets = [...effect.targets];
                                newTargets[idx] = { ...newTargets[idx], ritualId: val };
                                const sourceRitual = rituals.find((r:any) => r.id === val);
                                
                                onChange({
                                    ...effect,
                                    targets: newTargets,
                                    payload: sourceRitual ? JSON.parse(JSON.stringify(sourceRitual)) : undefined
                                });
                            }} className="flex-1 bg-eden-950 border border-eden-700 rounded p-2 text-xs text-white outline-none">
                                <option value="">-- Selecione o Ritual --</option>
                                {rituals.map((r:any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-purple-500/30 space-y-3">
                <label className="text-[10px] uppercase font-bold text-white">2. Edite o Substituto</label>
                {effect.payload ? (
                    <div className="bg-black/40 p-3 rounded border border-purple-500/20">
                        <div className="text-sm font-bold text-white">{effect.payload.name || 'Sem Nome'}</div>
                        <div className="text-[10px] text-purple-300 mt-1">Snapshot do poder carregado. Clique abaixo para editar suas regras e efeitos.</div>
                    </div>
                ) : (
                    <div className="text-[10px] text-eden-100/40 italic">Selecione um alvo válido acima primeiro.</div>
                )}

                <button onClick={() => setIsEditingPayload(true)} disabled={!effect.payload} className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-xs font-black w-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                    <Settings size={16}/> EDITAR O PODER SUBSTITUTO
                </button>
            </div>

            {isEditingPayload && effect.targets[0]?.type === 'override_ritual' && <RitualForm initialData={effect.payload} onSave={data => { updateField('payload', data); setIsEditingPayload(false); }} onCancel={() => setIsEditingPayload(false)} />}
            {isEditingPayload && effect.targets[0]?.type === 'override_ability' && <AbilityForm initialData={effect.payload} onSave={data => { updateField('payload', data); setIsEditingPayload(false); }} onCancel={() => setIsEditingPayload(false)} />}
        </div>
      )}
        
      {['add_fixed', 'change_dice', 'add_resistance', 'change_damage', 'instant_heal_damage'].includes(effect.category) && (
          <div className="bg-eden-950/50 border border-eden-700/50 p-3 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-energia flex items-center gap-1"><Calculator size={12}/> Fórmula do Valor</label>
                  <button onClick={() => onChange({ ...effect, value: { terms: [...terms, { id: Date.now().toString(), type: 'fixed', value: 0 }], operations: terms.length > 0 ? [...operations, 'soma' as Operation] : [...operations] } })} className="text-[9px] uppercase font-bold text-energia hover:text-yellow-400 flex items-center gap-1 bg-energia/10 px-2 py-1 rounded border border-energia/20"><Plus size={12}/> Variável</button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                  {terms.map((term, idx) => (
                      <div key={term.id} className="flex items-center gap-2">
                          {idx > 0 && <select value={operations[idx - 1] || 'soma'} onChange={e => { const newOps = [...operations]; newOps[idx - 1] = e.target.value as Operation; onChange({ ...effect, value: { terms: terms as any, operations: newOps } }); }} className="bg-eden-800 border border-eden-600 text-white rounded p-1.5 text-xs outline-none font-bold"><option value="soma">+</option><option value="subtracao">-</option><option value="multiplicacao">×</option><option value="divisao">÷</option></select>}
                          <div className="flex gap-1 bg-eden-900 border border-eden-700 rounded p-1 items-center">
                              <select value={term.type} onChange={e => updateTerm(idx, { type: e.target.value as TermType })} className="bg-eden-950 text-xs text-eden-100 outline-none p-1 max-w-[140px]">
                                  <option value="fixed">Fixo</option><option value="dice">Dado</option><option value="attribute">Atributo</option><option value="skill_total">Perícia (Total)</option><option value="skill_training">Perícia (Treino)</option><option value="stat_max">Status Máx</option><option value="stat_current">Status Atual</option><option value="defense">Defesa</option><option value="dr_value">Valor de RD</option><option value="nex">NEX Total</option><option value="pe_limit">Lim. de PE</option><option value="displacement">Deslocamento</option><option value="load_max">Carga Max</option><option value="count_rituals">Qtd. Rituais</option><option value="count_paranormal_powers">Qtd. Poderes Paranormais</option><option value="count_abilities">Qtd. Habilidades Gerais</option><option value="count_class_powers">Qtd. Poderes de Classe</option><option value="count_origin_powers">Qtd. Poderes de Origem</option><option value="count_team_powers">Qtd. Poderes de Equipe</option><option value="prestige_points">Pontos de Prestígio</option>
                              </select>
                              {term.type === 'fixed' && <input type="number" value={term.value || 0} onChange={e => updateTerm(idx, { value: parseInt(e.target.value) || 0 })} className="w-12 bg-eden-950 border border-eden-700 rounded p-1 text-xs text-center text-white outline-none"/>}
                              {term.type === 'dice' && <div className="flex items-center gap-1"><input type="number" value={term.value || 1} onChange={e => updateTerm(idx, { value: parseInt(e.target.value) || 1 })} className="w-10 bg-eden-950 border border-eden-700 rounded p-1 text-xs text-center text-white outline-none"/><span className="text-xs text-eden-100/50 font-bold">d</span><select value={term.diceFace || 20} onChange={e => updateTerm(idx, { diceFace: parseInt(e.target.value) })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none">{[2,3,4,6,8,10,12,20,100].map(d => <option key={d} value={d}>{d}</option>)}</select></div>}
                              {term.type === 'attribute' && <select value={term.attribute || 'PRE'} onChange={e => updateTerm(idx, { attribute: e.target.value })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none">{['AGI', 'FOR', 'INT', 'PRE', 'VIG'].map(a => <option key={a} value={a}>{a}</option>)}</select>}
                              {(term.type === 'skill_total' || term.type === 'skill_training') && <select value={term.skill || 'Luta'} onChange={e => updateTerm(idx, { skill: e.target.value })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none">{Object.keys(SKILL_MAP).map(s => <option key={s} value={s}>{s}</option>)}</select>}
                              {(term.type === 'stat_max' || term.type === 'stat_current') && <select value={term.stat || 'pv'} onChange={e => updateTerm(idx, { stat: e.target.value })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none uppercase"><option value="pv">PV</option><option value="pe">PE</option><option value="san">SAN</option></select>}
                              {term.type === 'dr_value' && <select value={term.damageType || 'balistico'} onChange={e => updateTerm(idx, { damageType: e.target.value })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none capitalize">{ALL_DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}</select>}
                              {['count_rituals', 'count_paranormal_powers'].includes(term.type) && <select value={term.element || 'Sangue'} onChange={e => updateTerm(idx, { element: e.target.value })} className="bg-eden-950 border border-eden-700 rounded p-1 text-xs text-white outline-none">{['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(el => <option key={el} value={el}>{el}</option>)}</select>}
                              {terms.length > 1 && <button onClick={() => { const n = [...terms]; n.splice(idx, 1); const o = [...operations]; if(idx>0)o.splice(idx-1,1); else o.splice(0,1); onChange({...effect, value:{terms:n as any, operations:o}})}} className="ml-1 p-1 text-red-500/50 hover:bg-red-500 hover:text-white rounded"><X size={12}/></button>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {['add_fixed', 'change_dice', 'add_resistance', 'change_damage', 'gain_proficiency', 'instant_heal_damage'].includes(effect.category) && (
      <div className="space-y-2 pt-2 border-t border-eden-700/50">
        <label className="text-[10px] uppercase font-bold text-eden-100/50 flex items-center justify-between">
          <span>Onde Aplica? (Alvos)</span>
          <button onClick={handleAddTarget} className="text-energia hover:text-yellow-400 flex items-center gap-1"><Plus size={12}/> Adicionar Alvo</button>
        </label>
        
        {effect.targets.map((target, idx) => {
          const selectedWeapon = weapons.find((w: any) => w.id === target.weaponId) as any;
          return (
          <div key={target.id} className="flex flex-wrap gap-2 items-center bg-eden-900/50 p-2 rounded-lg border border-eden-700/50">
            <select value={target.type} onChange={e => { const val = e.target.value as any; const nt: any = { id: target.id, type: val }; if (val === 'test_skill') nt.skill = 'Luta'; if (val === 'attribute' || val === 'test_attribute' || val === 'test_skill_attribute') nt.attribute = 'PRE'; if (['dr', 'immunity_damage', 'vulnerability', 'damage_roll', 'damage_increase', 'change_damage'].includes(val)) nt.damageType = 'primario'; if (val === 'immunity_condition') nt.condition = 'Agarrado'; if (['test_attack', 'damage_roll', 'damage_increase', 'change_damage', 'critical_range', 'critical_multiplier'].includes(val)) nt.weaponFilter = 'all'; if (val === 'ritual_dt') nt.ritualId = 'all'; if (val === 'proficiency') nt.proficiencyType = 'simples'; if (val === 'elemental_affinity') nt.element = 'Sangue'; if (val === 'unlock_ritual_requirements') nt.ritualId = 'all'; updateTargetFull(idx, nt); }} className="flex-1 min-w-[140px] bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white outline-none font-bold">
              {effect.category === 'change_dice' ? ( <><option value="test_skill">Aumento de Dados (Uma Perícia)</option><option value="test_skill_all">Aumento de Dados (Todas Perícias)</option><option value="test_skill_attribute">Aumento de Dados (Perícias de um Atributo)</option><option value="test_attribute">Aumento de Dados (Teste Puro de Atributo)</option><option value="test_attack">Aumento de Dados de Ataque</option><option value="damage_increase">Aumento de Dano (Qtd de Dados)</option></> ) : effect.category === 'add_resistance' ? ( <><option value="dr">Resistência a Dano (RD)</option><option value="immunity_damage">Imunidade a Dano</option><option value="vulnerability">Vulnerabilidade a Dano</option><option value="immunity_condition">Imunidade a Condição</option></> ) : effect.category === 'change_damage' ? ( <option value="damage_roll">Substituir Dano da Arma</option> ) : effect.category === 'gain_proficiency' ? ( <><option value="proficiency">Nova Proficiência em Armas/Armaduras</option><option value="elemental_affinity">Afinidade Elemental</option><option value="unlock_ritual_requirements">Ignorar Pré-requisitos de Rituais</option></> ) : effect.category === 'instant_heal_damage' ? ( <><option value="pv_current">Alterar PV Atual</option><option value="pe_current">Alterar PE Atual</option><option value="san_current">Alterar SAN Atual</option></> ) : ( 
                  <>
                      <option value="pv_max">PV Máximo</option>
                      <option value="pe_max">PE Máximo</option>
                      <option value="san_max">SAN Máxima</option>
                      <option value="pv_temp">PV Temporário</option>
                      <option value="pe_temp">PE Temporário</option>
                      <option value="san_temp">SAN Temporário</option>
                      <option value="defense">Defesa</option>
                      <option value="test_attack">Bônus de Ataque</option>
                      <option value="damage_roll">Adicionar Novo Dano na Arma</option>
                      <option value="critical_range">Margem de Ameaça</option>
                      <option value="critical_multiplier">Multiplicador de Crítico</option>
                      <option value="explosive_dt">DT de Explosivos</option>
                      <option value="action_std">Ações Padrão Adicionais</option>
                      <option value="action_move">Ações de Movimento Adicionais</option>
                      <option value="attribute">Bônus Numérico em Atributo</option>
                      <option value="test_skill">Bônus em Uma Perícia</option>
                      <option value="test_skill_all">Bônus em TODAS Perícias</option>
                      <option value="test_skill_attribute">Bônus nas Perícias de UM Atributo</option>
                      <option value="displacement">Deslocamento (Metros)</option>
                      <option value="load_max">Carga Máxima</option>
                      <option value="ritual_dt">DT dos Rituais</option>
                      <option value="max_ritual_circle">Aumentar Acesso de Círculo</option>                      
                  </> 
              )}
            </select>

            {target.type === 'proficiency' && ( <select value={target.proficiencyType || 'simples'} onChange={e => updateTargetField(idx, 'proficiencyType', e.target.value)} className="bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white"><option value="simples">Armas Simples</option><option value="taticas">Armas Táticas</option><option value="pesadas">Armas Pesadas</option><option value="leves_armor">Proteções Leves</option><option value="pesadas_armor">Proteções Pesadas</option></select> )}
            {target.type === 'elemental_affinity' && ( <select value={target.element || 'Sangue'} onChange={e => updateTargetField(idx, 'element', e.target.value)} className="bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white">{['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(el => <option key={el} value={el}>{el}</option>)}</select> )}
            {target.type === 'unlock_ritual_requirements' && ( <select value={target.ritualId || 'all'} onChange={e => updateTargetField(idx, 'ritualId', e.target.value)} className="w-full md:w-40 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white"><option value="all">Todos os Rituais</option>{rituals.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select> )}
            {target.type === 'test_skill' && <select value={target.skill || 'Luta'} onChange={e => updateTargetField(idx, 'skill', e.target.value)} className="w-full md:w-32 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white">{Object.keys(SKILL_MAP).map(s => <option key={s} value={s}>{s}</option>)}</select>}
            {((target.type as string) === 'attribute' || (target.type as string) === 'test_attribute' || (target.type as string) === 'test_skill_attribute') && <select value={target.attribute || 'PRE'} onChange={e => updateTargetField(idx, 'attribute', e.target.value)} className="w-full md:w-32 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white">{['AGI', 'FOR', 'INT', 'PRE', 'VIG'].map(a => <option key={a} value={a}>{a}</option>)}</select>}
            
            {(['test_attack', 'damage_roll', 'damage_increase', 'critical_range', 'critical_multiplier'].includes(target.type) || effect.category === 'change_damage') && (
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-1">
                    <select value={target.weaponId || target.weaponFilter || 'all'} onChange={e => { const val = e.target.value; const nt = { ...target }; if (['all', 'melee', 'ranged'].includes(val)) { nt.weaponFilter = val as any; delete nt.weaponId; } else { nt.weaponId = val; delete nt.weaponFilter; } updateTargetFull(idx, nt); }} className="bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-energia"><optgroup label="Filtros Gerais"><option value="all">Todas as Armas</option><option value="melee">Corpo a Corpo</option><option value="ranged">À Distância</option></optgroup>{weapons.length > 0 && <optgroup label="Ataques & Armas">{weapons.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}</optgroup>}</select>
                    {(target.type === 'damage_increase' || effect.category === 'change_damage') && selectedWeapon && <select value={target.damageIndex ?? -1} onChange={e => updateTargetField(idx, 'damageIndex', Number(e.target.value))} className="bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-red-300">{effect.category !== 'change_damage' && <option value={-1}>Todos os danos</option>}{selectedWeapon.damage?.map((dmg: any, i: number) => <option key={i} value={i}>Dano {i+1} ({dmg.type})</option>)}</select>}
    
                    {['damage_roll', 'damage_increase'].includes(target.type) && (
                        <select value={target.damageType || 'primario'} onChange={e => updateTargetField(idx, 'damageType', e.target.value)} className="bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-red-300 capitalize">
                            <option value="primario">Igual ao Dano Primário</option>
                            {ALL_DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                </div>
            )}

            {target.type === 'damage_roll' && <label className="flex items-center gap-1.5 w-full md:w-auto text-[10px] text-eden-100/60 cursor-pointer bg-eden-950/50 border border-eden-800 p-1.5 rounded mt-1 md:mt-0"><input type="checkbox" checked={target.isMultipliable || false} onChange={e => updateTargetField(idx, 'isMultipliable', e.target.checked)} className="accent-red-500" />Crítico?</label>}
            {['dr', 'immunity_damage', 'vulnerability'].includes(target.type) && <select value={target.damageType || 'balistico'} onChange={e => updateTargetField(idx, 'damageType', e.target.value)} className="w-full md:w-32 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white capitalize">{ALL_DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}</select>}
            {target.type === 'immunity_condition' && <select value={target.condition || 'Agarrado'} onChange={e => updateTargetField(idx, 'condition', e.target.value)} className="w-full md:w-32 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-white">{CONDITIONS_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>}
            {target.type === 'ritual_dt' && <select value={target.ritualId || 'all'} onChange={e => updateTargetField(idx, 'ritualId', e.target.value)} className="w-full md:w-40 bg-eden-950 border border-eden-700 rounded p-1.5 text-xs text-conhecimento"><option value="all">Todos os Rituais</option>{rituals.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>}

            <button onClick={() => { const n = [...effect.targets]; n.splice(idx,1); onChange({...effect, targets:n})}} className="p-1.5 ml-auto text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14}/></button>
          </div>
        )})}
      </div>
      )}
    </div>
  );
}