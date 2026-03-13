import { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { 
  Trash2, Scale, Settings, X, 
  Shield, Crosshair, Package, Crown, AlertTriangle, 
  ShoppingBag, Plus, Calculator, Edit2, Bomb, Book, Search, Sparkles
} from 'lucide-react';

import { RANKS, DAMAGE_TYPES_INFO } from '../../data/referenceData'; 
import type { 
  ItemType, ElementType, Formula, FormulaTerm, Operation
} from '../../types/systemData';
import EffectEditor from '../sheet/EffectEditor';


const SKILL_OPTIONS = ["Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", "Tática", "Tecnologia", "Vontade"];
const ELEMENTS: ElementType[] = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const ITEM_TYPES: { id: ItemType; label: string; icon: any; color: string }[] = [
  { id: 'weapon', label: 'Arma', icon: Crosshair, color: 'text-red-400 border-red-500' },
  { id: 'protection', label: 'Proteção', icon: Shield, color: 'text-emerald-400 border-emerald-500' },
  { id: 'ammo', label: 'Munição', icon: Package, color: 'text-yellow-400 border-yellow-500' },
  { id: 'accessory', label: 'Acessório', icon: Crown, color: 'text-cyan-400 border-cyan-500' },
  { id: 'explosive', label: 'Explosivo', icon: Bomb, color: 'text-orange-400 border-orange-500' },
  { id: 'general', label: 'Geral', icon: ShoppingBag, color: 'text-zinc-400 border-zinc-500' },
];

const getTypeStyle = (item: any) => {
    switch (item.type) {
      case 'weapon': 
      case 'explosive': return `border-red-500/50 bg-red-500/5 text-red-200`;
      case 'ammo': return `border-yellow-500/50 bg-yellow-500/5 text-yellow-200`;
      case 'protection': return `border-emerald-500/50 bg-emerald-500/5 text-emerald-200`;
      case 'accessory': return `border-cyan-500/50 bg-cyan-500/5 text-cyan-200`;
      default: return `border-zinc-500/50 bg-zinc-500/5 text-zinc-200`;
    }
};




function FormulaBuilder({ formula, onChange }: { formula: Formula, onChange: (f: Formula) => void }) {
    const addTerm = () => {
      if (formula.terms.length >= 10) return;
      onChange({ terms: [...formula.terms, { id: Date.now().toString(), type: 'fixed', value: 0 }], operations: formula.terms.length > 0 ? [...formula.operations, 'soma'] : [...formula.operations] });
    };
    const removeTerm = (idx: number) => {
        const newTerms = formula.terms.filter((_, i) => i !== idx);
        const newOps = formula.operations.filter((_, i) => i !== (idx === 0 ? 0 : idx - 1));
        onChange({ terms: newTerms, operations: newOps.slice(0, newTerms.length - 1) });
    };
    const updateTerm = (idx: number, field: keyof FormulaTerm, value: any) => {
        const n = [...formula.terms]; n[idx] = { ...n[idx], [field]: value };
        onChange({ ...formula, terms: n });
    };
    const updateOp = (idx: number, op: Operation) => {
        const n = [...formula.operations]; n[idx] = op;
        onChange({ ...formula, operations: n });
    };

    const renderTermExtras = (term: FormulaTerm, index: number) => {
        switch (term.type) {
            case 'fixed': return <input type="number" value={term.value ?? 0} onChange={(e) => updateTerm(index, 'value', Number(e.target.value))} className="w-12 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white text-center outline-none" placeholder="0" />;
            case 'dice': return (
                <div className="flex items-center gap-1"><input type="number" value={term.value || 1} onChange={(e) => updateTerm(index, 'value', Number(e.target.value))} className="w-10 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white text-center outline-none" /><span className="text-white text-xs font-bold">d</span><select value={term.diceFace || 20} onChange={(e) => updateTerm(index, 'diceFace', Number(e.target.value))} className="w-12 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white outline-none">{[2, 3, 4, 6, 8, 10, 12, 20, 100].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            );
            case 'attribute': return <select value={term.attribute || 'PRE'} onChange={(e) => updateTerm(index, 'attribute', e.target.value)} className="w-16 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white outline-none">{['AGI', 'FOR', 'INT', 'PRE', 'VIG'].map(a => <option key={a} value={a}>{a}</option>)}</select>;
            case 'skill_total': case 'skill_training': return <select value={term.skill || SKILL_OPTIONS[0]} onChange={(e) => updateTerm(index, 'skill', e.target.value)} className="w-24 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white outline-none">{SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>;
            case 'stat_max': case 'stat_current': case 'stat_temp': return <select value={term.stat || 'pv'} onChange={(e) => updateTerm(index, 'stat', e.target.value)} className="w-16 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white uppercase outline-none"><option value="pv">PV</option><option value="pe">PE</option><option value="san">SAN</option></select>;
            case 'count_paranormal_powers': case 'count_rituals': return <select value={term.element || 'Sangue'} onChange={(e) => updateTerm(index, 'element', e.target.value)} className="w-24 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white outline-none">{ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}</select>;
            case 'dr_value': return <select value={term.damageType || 'balistico'} onChange={(e) => updateTerm(index, 'damageType', e.target.value)} className="w-24 bg-eden-900 border border-eden-700 rounded p-1 text-xs text-white capitalize outline-none">{DAMAGE_TYPES_INFO.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>;
            default: return null;
        }
    };

    return (
      <div className="bg-eden-950/50 p-4 rounded-xl border border-eden-700 space-y-3">
          <div className="flex justify-between items-center"><label className="text-xs font-bold text-energia flex gap-2"><Calculator size={14}/> Fórmula</label><button onClick={addTerm} className="text-xs bg-eden-800 px-2 py-1 rounded hover:bg-eden-700"><Plus size={12}/> Add</button></div>
          {formula.terms.map((t, i) => (
              <div key={t.id} className="flex gap-2 items-center bg-eden-900/30 p-2 rounded border border-eden-700/50 flex-wrap">
                  {i > 0 && <select value={formula.operations[i-1]} onChange={e=>updateOp(i-1, e.target.value as Operation)} className="bg-eden-800 text-[10px] p-1 rounded text-white font-bold outline-none"><option value="soma">+</option><option value="subtracao">-</option><option value="multiplicacao">*</option><option value="divisao">/</option></select>}
                  <select value={t.type} onChange={e=>updateTerm(i, 'type', e.target.value)} className="bg-eden-800 text-xs p-1.5 rounded text-white max-w-[130px] outline-none">
                      <option value="fixed">Fixo</option>
                      <option value="dice">Dado</option>
                      <option value="attribute">Atributo</option>
                      <option value="skill_total">Perícia (Total)</option>
                      <option value="skill_training">Perícia (Treino)</option>
                      <option value="stat_max">Status Máx</option>
                      <option value="stat_current">Status Atual</option>
                      <option value="defense">Defesa</option>
                      <option value="dr_value">Valor de RD</option>
                      <option value="nex">NEX Total</option>
                      <option value="pe_limit">Lim. de PE</option>
                      <option value="displacement">Deslocamento</option>
                      <option value="load_max">Carga Max</option>
                      <option value="count_rituals">Qtd. Rituais</option>
                      <option value="count_paranormal_powers">Qtd. Poderes Paranormais</option>
                      <option value="count_abilities">Qtd. Habilidades Gerais</option>
                      <option value="count_class_powers">Qtd. Poderes de Classe</option>
                      <option value="count_origin_powers">Qtd. Poderes de Origem</option>
                      <option value="count_team_powers">Qtd. Poderes de Equipe</option>
                      <option value="prestige_points">Pontos de Prestígio</option>
                  </select>
                  {renderTermExtras(t, i)}
                  <button onClick={()=>removeTerm(i)} className="ml-auto text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={14}/></button>
              </div>
          ))}
      </div>
    )
}




const ItemForm = ({ initialData, onSave, onCancel }: { initialData?: any, onSave: (item: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<any>(() => {
      if (initialData) {
          let convertedDamage = initialData.damage;
          if (convertedDamage && !Array.isArray(convertedDamage)) {
              convertedDamage = [{ 
                  ...convertedDamage, 
                  id: generateId(), 
                  bonus: { terms: [], operations: [] } 
              }];
          }
          return { ...initialData, damage: convertedDamage };
      }
      return {
          id: '', name: '', type: 'general', category: 1, weight: 1, amount: 1, isEquipped: true, description: '', 
          isCustom: true, effects: []
      };
  });

  const [editingEffectIndex, setEditingEffectIndex] = useState<number | null>(null);

  const handleChange = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));
  const updateNested = (parent: string, field: string, value: any) => setFormData((prev: any) => ({ ...prev, [parent]: { ...(prev[parent] || {}), [field]: value } }));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-eden-900 w-full max-w-5xl max-h-[95vh] rounded-2xl border border-eden-600 shadow-2xl flex flex-col">
        <div className="p-4 border-b border-eden-700 bg-eden-800 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-xl text-eden-100">{initialData ? 'Editar Item' : 'Criar Novo Item'}</h3>
          <button onClick={onCancel}><X size={24} className="text-eden-100/50 hover:text-white"/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {}
                <div className="flex-1 space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-eden-100/50 uppercase">Nome</label>
                        <input value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-white font-bold text-lg focus:border-energia outline-none" placeholder="Nome do Item" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ITEM_TYPES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleChange('type', t.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border h-20 transition-all ${
                                formData.type === t.id 
                                    ? `bg-eden-800 ${t.color} shadow-md scale-105` 
                                    : 'bg-eden-950 border-eden-800 text-eden-100/40 hover:bg-eden-900'
                                }`}
                            >
                                <t.icon size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-eden-950/30 p-4 rounded-xl border border-eden-700/50">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-eden-100/50 uppercase">Categoria</label>
                            <select 
                                value={formData.category} onChange={(e) => handleChange('category', Number(e.target.value))}
                                className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white"
                            >
                                {[0,1,2,3,4].map(c => <option key={c} value={c}>{c === 0 ? '0' : ['I','II','III','IV'][c-1]}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-eden-100/50 uppercase">Espaço (Peso)</label>
                            <input type="number" value={formData.weight || 1} onChange={e => handleChange('weight', Number(e.target.value))} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-eden-100/50 uppercase">Quantidade</label>
                            <input type="number" value={formData.amount || 1} onChange={e => handleChange('amount', Number(e.target.value))} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-2.5 text-sm text-white" />
                        </div>
                    </div>

                    {formData.type === 'cursed' && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-2 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-purple-300 uppercase flex items-center gap-2"><Book size={16}/> Detalhes</h4>
                            <div className="space-y-1">
                                <label className="text-[10px] text-purple-200/60 uppercase font-bold">Elemento Principal</label>
                                <select 
                                    value={formData.element || 'Medo'} onChange={(e) => handleChange('element', e.target.value)}
                                    className="w-full bg-eden-900 border border-purple-500/30 rounded-lg p-2.5 text-sm text-purple-100"
                                >
                                    {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {(formData.type === 'weapon' || formData.type === 'explosive') && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-red-300 uppercase flex items-center gap-2"><Crosshair size={16}/> Estatísticas de Combate</h4>
                            
                            {formData.type === 'weapon' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Subtipo</label>
                                        <select value={formData.subtype || 'melee'} onChange={(e) => handleChange('subtype', e.target.value)} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white">
                                            <option value="melee">Corpo a Corpo</option><option value="ranged">Distância</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Empunhadura</label>
                                        <select value={formData.hands || 'one'} onChange={(e) => handleChange('hands', e.target.value)} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white">
                                            <option value="light">Leve</option><option value="one">Uma Mão</option><option value="two">Duas Mãos</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Complexidade</label>
                                        <select value={formData.complexity || 'simple'} onChange={(e) => handleChange('complexity', e.target.value)} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white">
                                            <option value="simple">Simples</option><option value="tactical">Tática</option><option value="heavy">Pesada</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Alcance</label>
                                        <select value={formData.range || 'curto'} onChange={(e) => handleChange('range', e.target.value)} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white">
                                            <option value="adjacente">Adjacente</option>
                                            <option value="curto">Curto</option>
                                            <option value="medio">Médio</option>
                                            <option value="longo">Longo</option>
                                            <option value="extremo">Extremo</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.type === 'explosive' && (
                                <div className="flex items-center gap-2 pb-2 border-b border-red-500/20">
                                    <input 
                                        type="checkbox" 
                                        id="dealsDamage"
                                        checked={Array.isArray(formData.damage) && formData.damage.length > 0} 
                                        onChange={e => {
                                            if (e.target.checked) {
                                                handleChange('damage', [{ id: generateId(), diceCount: 1, diceFace: 6, type: 'impacto', bonus: { terms: [], operations: [] } }]);
                                            } else {
                                                handleChange('damage', []);
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-red-500 bg-eden-900 text-red-500 focus:ring-red-500 cursor-pointer"
                                    />
                                    <label htmlFor="dealsDamage" className="text-xs font-bold text-red-200 cursor-pointer select-none">
                                        Explosivo causa dano direto?
                                    </label>
                                </div>
                            )}

                            {formData.type === 'weapon' && (
                                <div className="space-y-3 pt-3 border-t border-red-500/20">
                                    <h5 className="text-xs font-bold text-red-300 uppercase">Teste de Ataque</h5>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Perícia Base</label>
                                        <select 
                                            value={formData.attackTest?.skill || 'Luta'} 
                                            onChange={e => updateNested('attackTest', 'skill', e.target.value)} 
                                            className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-sm text-white"
                                        >
                                            {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 bg-black/20 p-3 rounded border border-red-900/30">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Dados Secundários (Opcional)</label>
                                        <FormulaBuilder 
                                            formula={formData.attackTest?.secondaryDice || { terms: [], operations: [] }} 
                                            onChange={f => updateNested('attackTest', 'secondaryDice', f)} 
                                        />
                                    </div>
                                    <div className="space-y-2 bg-black/20 p-3 rounded border border-red-900/30">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Bônus Secundário (Opcional)</label>
                                        <FormulaBuilder 
                                            formula={formData.attackTest?.secondaryBonus || { terms: [], operations: [] }} 
                                            onChange={f => updateNested('attackTest', 'secondaryBonus', f)} 
                                        />
                                    </div>
                                </div>
                            )}

                            {(formData.type === 'weapon' || (formData.type === 'explosive' && Array.isArray(formData.damage) && formData.damage.length > 0)) && (
                                <div className="animate-in fade-in space-y-4 pt-3 border-t border-red-500/20">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-xs font-bold text-red-300 uppercase">Dano Causado</h5>
                                        <button 
                                            onClick={() => {
                                                const currentDamage = Array.isArray(formData.damage) ? formData.damage : [];
                                                handleChange('damage', [...currentDamage, { id: generateId(), diceCount: 1, diceFace: 6, type: 'impacto', bonus: { terms: [], operations: [] }, isMultipliable: true }]);
                                            }}
                                            className="text-[10px] bg-red-900/50 px-2 py-1 rounded text-red-200 hover:bg-red-800 flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12}/> Adicionar Dano
                                        </button>
                                    </div>
                                    
                                    {(Array.isArray(formData.damage) ? formData.damage : []).map((dmg: any, idx: number) => (
                                        <div key={dmg.id} className="bg-black/20 p-3 rounded border border-red-900/30 space-y-3 relative group">
                                            <button 
                                                onClick={() => {
                                                    const newDmg = formData.damage.filter((_: any, i: number) => i !== idx);
                                                    handleChange('damage', newDmg);
                                                }} 
                                                className="absolute -top-2 -right-2 bg-red-900 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-3 flex-1">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-red-200/60 uppercase font-bold">Dados</label>
                                                    <div className="flex gap-1 items-center bg-eden-900 border border-red-900/50 rounded p-1">
                                                        <input 
                                                            type="number" 
                                                            value={dmg.diceCount ?? 0} 
                                                            onChange={e => {
                                                                const newDmg = [...formData.damage];
                                                                newDmg[idx].diceCount = Number(e.target.value);
                                                                handleChange('damage', newDmg);
                                                            }} 
                                                            className="w-10 bg-eden-800 text-center text-sm text-white font-bold outline-none"
                                                        />
                                                        <span className="text-xs text-red-400 font-bold">d</span>
                                                        <select 
                                                            value={dmg.diceFace || 6} 
                                                            onChange={e => {
                                                                const newDmg = [...formData.damage];
                                                                newDmg[idx].diceFace = Number(e.target.value);
                                                                handleChange('damage', newDmg);
                                                            }} 
                                                            className="bg-eden-800 text-sm text-white font-bold outline-none flex-1"
                                                        >
                                                            {[2,3,4,6,8,10,12,20,100].map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-red-200/60 uppercase font-bold">Tipo</label>
                                                    <select 
                                                        value={dmg.type || 'balistico'} 
                                                        onChange={e => {
                                                            const newDmg = [...formData.damage];
                                                            newDmg[idx].type = e.target.value;
                                                            handleChange('damage', newDmg);
                                                        }} 
                                                        className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-sm text-white capitalize"
                                                    >
                                                        {DAMAGE_TYPES_INFO.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    id={`mult_${dmg.id}`}
                                                    checked={dmg.isMultipliable !== false}
                                                    onChange={e => {
                                                        const newDmg = [...formData.damage];
                                                        newDmg[idx].isMultipliable = e.target.checked;
                                                        handleChange('damage', newDmg);
                                                    }} 
                                                    className="w-3 h-3 rounded border-red-500 bg-eden-900 text-red-500 cursor-pointer"
                                                />
                                                <label htmlFor={`mult_${dmg.id}`} className="text-[10px] font-bold text-red-200/60 uppercase cursor-pointer select-none">
                                                    Dados multiplicam no Crítico?
                                                </label>
                                            </div>

                                            <div className="space-y-1 pt-2 border-t border-red-900/30">
                                                <label className="text-[10px] text-red-200/60 uppercase font-bold">Bônus de Dano (Não multiplica no crítico)</label>
                                                <FormulaBuilder 
                                                    formula={dmg.bonus || { terms: [], operations: [] }} 
                                                    onChange={f => {
                                                        const newDmg = [...formData.damage];
                                                        newDmg[idx].bonus = f;
                                                        handleChange('damage', newDmg);
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="space-y-1 pt-3 border-t border-red-500/20">
                                        <label className="text-[10px] text-red-200/60 uppercase font-bold">Crítico (Margem / Multiplicador)</label>
                                        <div className="flex gap-2">
                                            <input type="number" value={formData.critical?.range || 20} onChange={e => updateNested('critical', 'range', Number(e.target.value))} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white text-center" placeholder="20"/>
                                            <span className="text-white font-bold self-center">/</span>
                                            <input type="number" value={formData.critical?.multiplier || 2} onChange={e => updateNested('critical', 'multiplier', Number(e.target.value))} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white text-center" placeholder="x2"/>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.type === 'explosive' && (
                                <div className="grid grid-cols-2 gap-3 border-t border-red-500/20 pt-2">
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-red-300">Área</label><input type="text" value={formData.area || ''} onChange={e => handleChange('area', e.target.value)} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white" placeholder="Ex: 6m raio"/></div>
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-red-300">DT Resistência</label><input type="number" value={formData.dt || 0} onChange={e => handleChange('dt', Number(e.target.value))} className="w-full bg-eden-900 border border-red-900/50 rounded p-2 text-xs text-white"/></div>
                                </div>
                            )}
                        </div>
                    )}

                    {formData.type === 'protection' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-emerald-300 uppercase flex items-center gap-2"><Shield size={16}/> Estatísticas de Defesa</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-emerald-200/60 uppercase font-bold">Defesa (+)</label>
                                    <input type="number" value={formData.defenseBonus || 0} onChange={e => handleChange('defenseBonus', Number(e.target.value))} className="w-full bg-eden-900 border border-emerald-900/50 rounded p-2 text-sm text-white font-bold"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-emerald-200/60 uppercase font-bold">Penalidade (-)</label>
                                    <input type="number" value={formData.penalty || 0} onChange={e => handleChange('penalty', Number(e.target.value))} className="w-full bg-eden-900 border border-emerald-900/50 rounded p-2 text-sm text-white font-bold"/>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20">
                                <input type="checkbox" id="isHeavy" checked={formData.isHeavy || false} onChange={e => handleChange('isHeavy', e.target.checked)} className="w-4 h-4 rounded border-emerald-500 bg-eden-900"/>
                                <label htmlFor="isHeavy" className="text-xs text-emerald-100 cursor-pointer font-bold">Proteção Pesada?</label>
                            </div>
                        </div>
                    )}

                    {formData.type === 'ammo' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-yellow-300 uppercase flex items-center gap-2"><Package size={16}/> Estatísticas de Munição</h4>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] text-yellow-200/60 uppercase font-bold">Tipo de Duração</label>
                                <select 
                                    value={formData.ammoDurationType || 'scenes'} 
                                    onChange={e => handleChange('ammoDurationType', e.target.value)} 
                                    className="w-full bg-eden-900 border border-yellow-900/50 rounded p-2 text-xs text-white"
                                >
                                    <option value="scenes">Por Cenas</option>
                                    <option value="single_use">Uso Único (Contada em Unidades)</option>
                                    <option value="infinite">Infinita / Recuperável</option>
                                </select>
                            </div>

                            {(!formData.ammoDurationType || formData.ammoDurationType === 'scenes') && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-yellow-200/60 uppercase font-bold">Cenas (Pacotes)</label>
                                        <input type="number" value={formData.durationScenes || 0} onChange={e => handleChange('durationScenes', Number(e.target.value))} className="w-full bg-eden-900 border border-yellow-900/50 rounded p-2 text-sm text-white font-bold"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-yellow-200/60 uppercase font-bold">Sobras Atuais</label>
                                        <input type="number" value={formData.leftovers || 0} onChange={e => handleChange('leftovers', Number(e.target.value))} className="w-full bg-eden-900 border border-yellow-900/50 rounded p-2 text-sm text-white font-bold"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="text-xs font-bold text-eden-100/50 uppercase">Descrição & Regras</label>
                        <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-lg p-3 text-sm text-eden-100 focus:border-energia outline-none resize-none flex-1 min-h-[100px]" placeholder="Descreva os detalhes do item..."/>
                    </div>
                </div>
                
                {}
                <div className="w-full lg:w-[350px] space-y-6 border-t lg:border-t-0 lg:border-l border-eden-700 pt-6 lg:pt-0 lg:pl-6">
                    <div className="bg-black/20 rounded-xl border border-eden-700/50 p-4 space-y-3 shadow-inner h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-eden-700 pb-2">
                            <h3 className="text-xs md:text-sm font-black text-eden-100 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={16} className="text-energia" />
                                Efeitos / Bônus
                            </h3>
                            <button 
                                type="button"
                                onClick={() => {
                                    const newEffect = { id: Date.now().toString(), name: 'Novo Efeito', category: 'add_fixed', value: { terms: [{ id: '1', type: 'fixed', value: 1 }], operations: [] }, targets: [] };
                                    const newEffectsList = [...(formData.effects || []), newEffect];
                                    setFormData((prev: any) => ({ ...prev, effects: newEffectsList }));
                                    setEditingEffectIndex(newEffectsList.length - 1);
                                }}
                                className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-energia hover:text-yellow-400 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Adicionar
                            </button>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[400px]">
                            {(formData.effects || []).map((effect: any, idx: number) => (
                                <div key={effect.id} className="flex justify-between items-center bg-eden-950/50 border border-eden-700/50 p-2.5 rounded-lg group">
                                    <div className="flex flex-col max-w-[200px]">
                                        <span className="text-xs font-bold text-white capitalize truncate">
                                            {effect.name ? effect.name : effect.category.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-eden-100/50">{effect.targets?.length || 0} alvo(s) configurado(s)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => setEditingEffectIndex(idx)} className="p-1.5 text-eden-100/50 hover:text-energia hover:bg-energia/10 rounded transition-colors"><Edit2 size={16}/></button>
                                        <button type="button" onClick={() => {
                                            const newEffects = [...(formData.effects || [])];
                                            newEffects.splice(idx, 1);
                                            setFormData((prev: any) => ({ ...prev, effects: newEffects }));
                                        }} className="p-1.5 text-eden-100/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.effects || formData.effects.length === 0) && (
                                <p className="text-[10px] text-eden-100/30 italic text-center py-4 border border-dashed border-eden-800 rounded-lg">Sem efeitos configurados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-eden-700 bg-eden-800 rounded-b-2xl flex justify-end gap-3">
            <button onClick={onCancel} className="px-6 py-2.5 text-eden-100 hover:bg-eden-700 rounded-lg text-sm font-bold">Cancelar</button>
            <button onClick={() => onSave(formData)} disabled={!formData.name} className="px-8 py-2.5 bg-energia text-eden-900 rounded-lg text-sm font-black hover:bg-yellow-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">SALVAR ITEM</button>
        </div>
      </div>
      
      {}
      {editingEffectIndex !== null && formData.effects?.[editingEffectIndex] && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <div className="bg-eden-900 border border-eden-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-eden-700 bg-eden-800 flex justify-between items-center shrink-0">
                      <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2"><Settings size={16} className="text-energia"/> Configurar Efeito</h3>
                      <button onClick={() => setEditingEffectIndex(null)} className="text-eden-100/50 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                      <EffectEditor
                          effect={formData.effects[editingEffectIndex]}
                          onChange={(updatedEffect: any) => {
                              const newEffects = [...(formData.effects || [])];
                              newEffects[editingEffectIndex] = updatedEffect;
                              setFormData((prev: any) => ({ ...prev, effects: newEffects }));
                          }}
                          onRemove={() => {
                              const newEffects = [...(formData.effects || [])];
                              newEffects.splice(editingEffectIndex, 1);
                              setFormData((prev: any) => ({ ...prev, effects: newEffects }));
                              setEditingEffectIndex(null);
                          }}
                      />
                  </div>

                  <div className="p-4 border-t border-eden-700 bg-eden-800 shrink-0 flex justify-end">
                      <button onClick={() => setEditingEffectIndex(null)} className="bg-energia text-eden-900 font-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(250,176,5,0.3)]">
                          Concluir Edição
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};




export default function Step6Inventory() {
  const { character, updateCharacter } = useCharacter();
  const items = character.inventory || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  
  const currentLoad = items.reduce((acc, item) => acc + (item.weight || 0) * (item.amount || 1), 0);
  const str = character.attributes?.initial?.FOR || 0;
  const maxLoad = str * 5 + (str === 0 ? 2 : 0);

  
  const prestige = character.personal?.prestigePoints || 0;
  const rank = [...RANKS].reverse().find(r => prestige >= r.minPP) || RANKS[0];

  const categoryCounts = items.reduce((acc, item) => {
    const cat = item.category;
    if (cat > 0) acc[cat] = (acc[cat] || 0) + (item.amount || 1);
    return acc;
  }, {} as Record<number, number>);

  const handleSaveItem = (item: any) => {
      const finalItem = { 
          ...item, 
          isEquipped: item.isEquipped ?? true, 
          modifications: [],
          curses: []
      };
      if (editingItem) {
          updateCharacter(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === item.id ? finalItem : i) }));
      } else {
          updateCharacter(prev => ({ ...prev, inventory: [...prev.inventory, { ...finalItem, id: generateId() }] }));
      }
      setIsCreating(false);
      setEditingItem(null);
  };

  const handleDelete = (id: string) => {
      updateCharacter(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
  };

  const filteredItems = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
  });

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
      
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-eden-100 mb-2">Inventário Inicial</h2>
        <p className="text-eden-100/60 text-sm max-w-xl mx-auto">
          Adicione suas armas, proteções e itens gerais.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
         <div className="bg-eden-800 border border-eden-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-eden-900 flex items-center justify-center border border-eden-600 text-energia"><Crown size={20} /></div>
               <div>
                   <div className="text-[10px] uppercase font-bold text-eden-100/50">Patente</div>
                   <div className="text-lg font-black text-eden-100 leading-none">{rank.name}</div>
               </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-eden-100/50">Crédito</div>
                <div className="flex items-center justify-end gap-1 text-conhecimento font-mono font-bold">{rank.credit}</div>
            </div>
         </div>
         
         <div className={`border rounded-xl p-4 flex items-center justify-between transition-colors shadow-sm ${currentLoad > maxLoad ? 'bg-red-900/20 border-red-500' : 'bg-eden-800 border-eden-700'}`}>
             <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentLoad > maxLoad ? 'bg-red-900 text-red-200 border-red-500' : 'bg-eden-900 text-eden-100 border-eden-600'}`}><Scale size={20} /></div>
               <div>
                  <div className="text-[10px] uppercase font-bold text-eden-100/50">Carga Máxima</div>
                  <div className={`text-lg font-black leading-none ${currentLoad > maxLoad ? 'text-red-400' : 'text-eden-100'}`}>{currentLoad} <span className="text-sm font-normal text-eden-100/40">/ {maxLoad}</span></div>
               </div>
            </div>
            {currentLoad > maxLoad && (<div className="flex items-center gap-1 text-red-400 text-xs font-bold animate-pulse"><AlertTriangle size={14} /> Sobrepeso</div>)}
         </div>
      </div>

      {}
      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {[1, 2, 3, 4].map(cat => {
              const key = ['I', 'II', 'III', 'IV'][cat - 1] as keyof typeof rank.limit;
              const limit = rank.limit[key] || 0;
              const current = categoryCounts[cat] || 0;
              const isFull = current > limit; 
              return (
                  <div key={cat} className={`flex-1 min-w-[80px] bg-eden-900/40 border rounded-lg p-2 text-center flex flex-col justify-center ${isFull ? 'border-red-500/50 bg-red-500/5' : 'border-eden-700'}`}>
                      <span className="text-[9px] text-eden-100/40 font-bold uppercase">Cat {key}</span>
                      <span className={`text-sm font-mono font-bold ${isFull ? 'text-red-400' : 'text-eden-100'}`}>{current} / {limit}</span>
                  </div>
              )
          })}
      </div>

      <div className="bg-eden-800 border border-eden-700 rounded-2xl flex flex-col overflow-hidden min-h-[500px] shadow-sm">
          <div className="p-4 border-b border-eden-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-eden-900/30">
              <h3 className="font-bold text-eden-100 flex items-center gap-2"><ShoppingBag size={18} className="text-energia" /> Meus Itens <span className="text-xs bg-eden-900 px-2 py-0.5 rounded-full text-eden-100/50">{items.length}</span></h3>
              <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                 
                 <select 
                     value={filterType} 
                     onChange={(e) => setFilterType(e.target.value)}
                     className="bg-eden-950 border border-eden-700 rounded-lg px-3 py-1.5 text-sm text-eden-100 focus:border-energia outline-none cursor-pointer flex-1 md:flex-none"
                 >
                     <option value="all">Todos os Itens</option>
                     {ITEM_TYPES.map(t => (
                         <option key={t.id} value={t.id}>{t.label}s</option>
                     ))}
                 </select>

                 <div className="relative flex-1 md:w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-eden-100/30 w-4 h-4"/>
                    <input type="text" placeholder="Filtrar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-eden-950 border border-eden-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-eden-100 focus:border-energia outline-none"/>
                 </div>                 
                 
                 <button onClick={() => { setEditingItem(null); setIsCreating(true); }} className="bg-energia text-eden-900 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-400 flex items-center justify-center gap-1 shadow-lg hover:shadow-energia/20 transition-all shrink-0"><Plus size={14} /> <span className="hidden md:inline">Adicionar</span></button>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {filteredItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-eden-100/20 gap-4"><ShoppingBag size={48} strokeWidth={1} /><p className="text-sm">Nenhum item criado.</p></div>
              ) : (
                  filteredItems.map(item => {
                      const typeInfo = ITEM_TYPES.find(t => t.id === item.type) || ITEM_TYPES[5];
                      const styleClass = getTypeStyle(item);
                      const qty = item.amount || 1;
                      
                      return (
                          <div key={item.id} className={`group relative rounded-xl border p-3 flex flex-col md:flex-row gap-3 items-start md:items-center transition-all bg-eden-800 shadow-md ${styleClass}`}>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-eden-900/50 border-current opacity-80`}>
                                      <typeInfo.icon size={20} />
                                  </div>
                                  <div className="min-w-0">
                                      <h4 className={`font-bold text-sm truncate flex items-center gap-2 text-eden-100`}>
                                        {item.name} 
                                        {qty > 1 && item.type !== 'ammo' && <span className="text-xs bg-black/20 px-1.5 rounded">x{qty}</span>}
                                        {item.type === 'cursed' && (item as any).element && <span className="text-[9px] px-1.5 py-0.5 rounded border border-purple-500 text-purple-200 bg-purple-500/20 uppercase font-black">{(item as any).element}</span>}
                                        {item.type === 'ammo' && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-500 text-yellow-200 bg-yellow-500/20 uppercase font-black">
                                                {(!item.ammoDurationType || item.ammoDurationType === 'scenes') ? `${item.durationScenes || 0} Cenas` :
                                                item.ammoDurationType === 'infinite' ? 'Infinita' : `${item.amount || 0} Un`}
                                            </span>
                                        )}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide font-bold opacity-60 mt-0.5">
                                          <span>{typeInfo.label}</span>
                                          <span>•</span>
                                          <span>Cat {['0', 'I', 'II', 'III', 'IV'][Math.min(item.category, 4)]}</span>
                                          <span>•</span>
                                          <span>{item.weight || 1} Esp</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex gap-1 ml-auto border-t md:border-none border-white/10 pt-2 md:pt-0 w-full md:w-auto justify-end items-center">
                                  <button onClick={() => { setEditingItem(item); setIsCreating(true); }} className="p-2 text-eden-100/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar"><Settings size={16}/></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 text-eden-100/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      )
                  })
              )}
          </div>
      </div>

      {(isCreating || editingItem) && (
        <ItemForm initialData={editingItem || undefined} onSave={handleSaveItem} onCancel={() => { setIsCreating(false); setEditingItem(null); }} />
      )}
    </div>
  );
}