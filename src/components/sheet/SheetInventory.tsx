import { useState, useMemo } from 'react';
import { Scale, Trash2, CheckCircle2, Circle, Ghost, Plus, Search, X, Settings, Info, Flame, Skull, Eye, Zap, Hexagon, DollarSign } from 'lucide-react';
import type { CharacterSheet, InventoryItem, ItemEffect } from '../../types/characterSchema';
import { EQUIPMENT_LIST, MODIFICATIONS, CURSES, RANKS, DAMAGE_TYPES_INFO } from '../../data/referenceData';
import type { ItemBase } from '../../data/referenceData';

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Estilos de Elementos
const getElementStyle = (element?: string) => {
  switch (element) {
    case 'sangue': return { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10', icon: Flame };
    case 'morte': return { color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-500/10', icon: Skull };
    case 'conhecimento': return { color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: Eye };
    case 'energia': return { color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-500/10', icon: Zap };
    case 'medo': return { color: 'text-white', border: 'border-white', bg: 'bg-white/10', icon: Ghost };
    default: return { color: 'text-eden-100', border: 'border-eden-700', bg: 'bg-eden-800', icon: Hexagon };
  }
};

// Regra de Opressão
const isOpposing = (elemA: string, elemB: string) => {
  if ((elemA === 'sangue' && elemB === 'conhecimento') || (elemA === 'conhecimento' && elemB === 'sangue')) return true;
  if ((elemA === 'morte' && elemB === 'energia') || (elemA === 'energia' && elemB === 'morte')) return true;
  if ((elemA === 'energia' && elemB === 'conhecimento') || (elemA === 'conhecimento' && elemB === 'energia')) return true;
  if ((elemA === 'sangue' && elemB === 'morte') || (elemA === 'morte' && elemB === 'sangue')) return true;
  return false;
};

const getTypeStyle = (item: ItemBase | InventoryItem) => {
    const base = "border-opacity-40 bg-opacity-5"; 
    if (item.subType === 'cursed_item') return `border-purple-500 bg-purple-500 ${base} text-purple-200`;
    switch (item.type) {
      case 'weapon': case 'explosive': return `border-red-500 bg-red-500 ${base} text-red-200`;
      case 'ammo': return `border-yellow-500 bg-yellow-500 ${base} text-yellow-200`;
      case 'protection': return `border-emerald-500 bg-emerald-500 ${base} text-emerald-200`;
      case 'accessory': return `border-cyan-500 bg-cyan-500 ${base} text-cyan-200`;
      case 'paranormal': return `border-pink-500 bg-pink-500 ${base} text-pink-200`;
      default: return `border-zinc-500 bg-zinc-500 ${base} text-zinc-200`;
    }
};

export default function SheetInventory({ character, onUpdate }: Props) {
  const { items } = character.inventory;
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addTab, setAddTab] = useState<'catalog' | 'custom'>('catalog');
  
  // Estado para item customizado
  const [customItem, setCustomItem] = useState({ 
      name: '', 
      category: 1, 
      space: 1, 
      type: 'general', 
      description: '',
      damageDice: '',
      damageType: 'cortante',
      weaponSubType: 'melee'
  });
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

  const prestige = character.progression.prestigePoints || 0;
  const calculatedRank = useMemo(() => [...RANKS].reverse().find(r => prestige >= r.minPP) || RANKS[0], [prestige]);
  
  const currentLoad = items.reduce((acc, item) => acc + (item.space * item.quantity), 0);
  
  // CORREÇÃO: Usar character.progression.class para checar combatente
  const maxLoad = (character.attributes.for === 0 ? 2 : character.attributes.for * 5) + 
                  (character.progression.class === 'combatente' ? 0 : 0); 

  const getItemCategory = (item: InventoryItem) => {
    let cat = item.category;
    cat += item.modifications.length;
    if (item.curses.length > 0) {
      cat += 2;
      if (item.curses.length > 1) cat += (item.curses.length - 1);
    }
    return cat;
  };

  const itemCounts = useMemo(() => items.reduce((acc, item) => {
    const finalCat = getItemCategory(item);
    if (finalCat > 0) acc[finalCat] = (acc[finalCat] || 0) + item.quantity;
    return acc;
  }, {} as Record<number, number>), [items]);

  const curseCounts = useMemo(() => {
    const counts = { sangue: 0, morte: 0, energia: 0, conhecimento: 0, medo: 0 };
    items.forEach(item => {
      item.curses.forEach(curse => {
        if (curse.element && curse.element in counts) {
          counts[curse.element as keyof typeof counts]++;
        }
      });
    });
    return counts;
  }, [items]);

  
  // --- AÇÕES ---
  const toggleEquip = (id: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, isEquipped: !i.isEquipped } : i);
    onUpdate({ inventory: { ...character.inventory, items: newItems } });
  };

  const removeItem = (id: string) => {
    if (!confirm('Remover este item permanentemente?')) return;
    const newItems = items.filter(i => i.id !== id);
    onUpdate({ inventory: { ...character.inventory, items: newItems } });
  };

  const addItemFromCatalog = (base: ItemBase) => {
    const limitKey = ['I', 'II', 'III', 'IV'][base.category - 1] as keyof typeof calculatedRank.limit;
    const limit = base.category === 0 ? 999 : (calculatedRank.limit[limitKey] || 0);
    if (base.category > 0 && (itemCounts[base.category] || 0) >= limit) {
        alert(`Limite de Categoria ${base.category} atingido!`);
        return;
    }

    const newItem: InventoryItem = {
        id: generateId(),
        name: base.name,
        category: base.category,
        space: base.space,
        type: base.type as any,
        subType: base.subType,
        quantity: 1,
        isEquipped: false,
        modifications: [],
        curses: [],
        damage: base.damage,
        details: base.details
    };
    onUpdate({ inventory: { ...character.inventory, items: [...items, newItem] } });
    setShowAddModal(false);
  };

  const addCustomItem = () => {
      let finalDamage = undefined;
      let finalSubType = undefined;

      if (customItem.type === 'weapon' || customItem.type === 'explosive') {
          if (customItem.damageDice) {
            const typeName = DAMAGE_TYPES_INFO.find(d => d.id === customItem.damageType)?.name || customItem.damageType;
            finalDamage = `${customItem.damageDice} ${typeName}`;
          }
      }

      if (customItem.type === 'weapon') {
          finalSubType = customItem.weaponSubType;
      }

      const newItem: InventoryItem = {
          id: generateId(),
          name: customItem.name || 'Item Sem Nome',
          category: customItem.category,
          space: customItem.space,
          type: customItem.type as any,
          subType: finalSubType,
          quantity: 1,
          isEquipped: false,
          modifications: [],
          curses: [],
          damage: finalDamage,
          details: customItem.description
      };
      onUpdate({ inventory: { ...character.inventory, items: [...items, newItem] } });
      setShowAddModal(false);
      setCustomItem({ name: '', category: 1, space: 1, type: 'general', description: '', damageDice: '', damageType: 'cortante', weaponSubType: 'melee' });
  };

  const updateItem = (updatedItem: InventoryItem) => {
      const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
      onUpdate({ inventory: { ...character.inventory, items: newItems } });
  };

  const toggleModification = (mod: ItemEffect) => {
      const item = items.find(i => i.id === editingItemId);
      if (!item) return;
      const has = item.modifications.some(m => m.id === mod.id);
      const newMods = has ? item.modifications.filter(m => m.id !== mod.id) : [...item.modifications, mod];
      
      const testItem = { ...item, modifications: newMods };
      const futureCat = getItemCategory(testItem);
      const limitKey = ['I', 'II', 'III', 'IV'][futureCat - 1] as keyof typeof calculatedRank.limit;
      const limit = calculatedRank.limit[limitKey] || 0;
      
      if (!has && futureCat > 0 && (itemCounts[futureCat] || 0) >= limit) {
          alert(`Limite de Categoria ${futureCat} atingido!`);
          return;
      }
      updateItem(testItem);
  };

  const toggleCurse = (curse: ItemEffect) => {
      const item = items.find(i => i.id === editingItemId);
      if (!item || !curse.element) return;

      const has = item.curses.some(c => c.id === curse.id);
      const newCurses = [...item.curses];

      if (has) {
         updateItem({ ...item, curses: item.curses.filter(c => c.id !== curse.id) });
      } else {
         const hasOpposing = item.curses.some(existing => isOpposing(existing.element!, curse.element!));
         if (hasOpposing) {
             alert(`Elementos opostos não se misturam! (${curse.element} oposto a existente).`);
             return;
         }
         
         const testItem = { ...item, curses: [...newCurses, curse] };
         const futureCat = getItemCategory(testItem);
         const limitKey = ['I', 'II', 'III', 'IV'][futureCat - 1] as keyof typeof calculatedRank.limit;
         const limit = calculatedRank.limit[limitKey] || 0;
         
         if (futureCat > 0 && (itemCounts[futureCat] || 0) >= limit) {
            alert(`Limite de Categoria ${futureCat} atingido!`);
            return;
         }

         updateItem(testItem);
      }
  };

  const activeItem = items.find(i => i.id === editingItemId);
  const viewingItem = items.find(i => i.id === viewingItemId);
  const filteredCatalog = EQUIPMENT_LIST.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* PAINEL TÁTICO */}
      <div className="bg-eden-800 border border-eden-700 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-start border-b border-eden-700 pb-3">
              <div>
                  <div className="text-[10px] uppercase text-eden-100/50 font-bold tracking-wider">Patente</div>
                  <div className="text-xl font-black text-energia flex items-center gap-2">
                      {calculatedRank.name} 
                      <span className="text-xs font-normal text-eden-100/50 bg-eden-900 px-2 py-0.5 rounded border border-eden-700 flex items-center gap-1">
                        <DollarSign size={10}/> {calculatedRank.credit}
                      </span>
                  </div>
              </div>
              <div className="text-right">
                   <div className="text-[10px] uppercase text-eden-100/50 font-bold tracking-wider flex items-center gap-1 justify-end">
                      <Scale size={12}/> Carga
                   </div>
                   <div className={`text-xl font-black ${currentLoad > maxLoad ? 'text-red-500' : 'text-eden-100'}`}>
                       {currentLoad} <span className="text-sm text-eden-100/30">/ {maxLoad}</span>
                   </div>
              </div>
          </div>

          {/* Limites de Categoria */}
          <div className="grid grid-cols-4 gap-2">
               {[1, 2, 3, 4].map(cat => {
                  const key = ['I', 'II', 'III', 'IV'][cat - 1] as keyof typeof calculatedRank.limit;
                  const limit = calculatedRank.limit[key];
                  const current = itemCounts[cat] || 0;
                  return (
                    <div key={cat} className={`text-center p-1.5 rounded border ${current > limit ? 'bg-red-900/30 border-red-500/50' : 'bg-eden-900/50 border-eden-700'}`}>
                      <div className="text-[9px] text-eden-100/40 uppercase font-bold">Cat {['I','II','III','IV'][cat-1]}</div>
                      <div className={`font-mono font-bold ${current > limit ? 'text-red-400' : 'text-eden-100'}`}>{current}/{limit}</div>
                    </div>
                  )
               })}
          </div>

          {/* Resumo de Maldições */}
          {(curseCounts.sangue > 0 || curseCounts.morte > 0 || curseCounts.energia > 0 || curseCounts.conhecimento > 0) && (
              <div className="bg-eden-950/50 border border-eden-700/50 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-bold text-eden-100/70 mb-1 flex items-center gap-1"><Ghost size={10}/> Penalidades Ativas</div>
                  {Object.entries(curseCounts).map(([elem, count]) => count > 0 && elem !== 'medo' && (
                      <div key={elem} className="flex justify-between text-eden-100/50">
                          <span className="capitalize">{elem}</span>
                          <span className="text-red-400">-{count * 2} SAN em testes</span>
                      </div>
                  ))}
              </div>
          )}
      </div>

      <div className="flex justify-end">
          <button onClick={() => setShowAddModal(true)} className="bg-energia text-eden-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 flex items-center gap-2 shadow-lg transition-all">
              <Plus size={18} /> Adicionar Item
          </button>
      </div>

      {/* Lista de Itens */}
      <div className="grid grid-cols-1 gap-2">
        {items.map(item => {
            const typeClass = getTypeStyle(item);
            const cat = getItemCategory(item);
            const catIndex = cat - 1;
            const limitKey = catIndex >= 0 && catIndex < 4 ? (['I', 'II', 'III', 'IV'][catIndex] as keyof typeof calculatedRank.limit) : null;
            const limit = limitKey ? calculatedRank.limit[limitKey] : 999;
            const isOverLimit = cat > 0 && (itemCounts[cat] || 0) > limit;

            return (
                <div key={item.id} className={`p-3 rounded-lg border flex justify-between items-center transition-all group ${item.isEquipped ? 'bg-eden-800 shadow-md ' + typeClass : 'bg-eden-900/30 border-eden-700/50 hover:bg-eden-800'}`}>
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <button onClick={() => toggleEquip(item.id)} className="text-eden-100/50 hover:text-energia transition-colors shrink-0">
                            {item.isEquipped ? <CheckCircle2 size={20} className="text-energia" /> : <Circle size={20} />}
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className={`font-bold text-sm truncate ${item.isEquipped ? 'text-white' : 'text-eden-100/70'}`}>
                                {item.name} {item.quantity > 1 && <span className="text-xs text-eden-100/40">x{item.quantity}</span>}
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] uppercase text-eden-100/40 font-bold tracking-wider items-center mt-0.5">
                                <span className={isOverLimit ? 'text-red-500 font-black' : ''}>
                                    Cat {['0','I','II','III','IV','V','VI'][cat] || 'VI+'}
                                </span>
                                <span>•</span>
                                <span>{item.space} Esp</span>
                                {item.damage && <><span className="text-eden-700">•</span><span className="text-red-400">{item.damage}</span></>}
                                <div className="flex gap-1 ml-2">
                                    {item.curses.length > 0 && <Ghost size={12} className="text-purple-400" />}
                                    {item.modifications.length > 0 && <Zap size={12} className="text-blue-400" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                        <button onClick={() => setViewingItemId(item.id)} className="p-2 hover:bg-black/20 rounded text-blue-400"><Info size={16}/></button>
                        <button onClick={() => setEditingItemId(item.id)} className="p-2 hover:bg-black/20 rounded text-conhecimento"><Settings size={16}/></button>
                        <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-black/20 rounded text-red-500"><Trash2 size={16}/></button>
                    </div>
                </div>
            )
        })}
        {items.length === 0 && <div className="text-center py-10 text-eden-100/30 text-sm italic border-2 border-dashed border-eden-800 rounded-xl">Mochila vazia.</div>}
      </div>

      {/* MODAL ADICIONAR ITEM */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
              <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                  <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                      <div className="flex gap-4">
                          <button onClick={() => setAddTab('catalog')} className={`font-bold text-sm ${addTab === 'catalog' ? 'text-energia border-b-2 border-energia' : 'text-eden-100/50 hover:text-eden-100'}`}>Catálogo</button>
                          <button onClick={() => setAddTab('custom')} className={`font-bold text-sm ${addTab === 'custom' ? 'text-energia border-b-2 border-energia' : 'text-eden-100/50 hover:text-eden-100'}`}>Customizado</button>
                      </div>
                      <button onClick={() => setShowAddModal(false)}><X size={24}/></button>
                  </div>
                  
                  {addTab === 'catalog' ? (
                      <>
                        <div className="p-4 border-b border-eden-700 bg-eden-900">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/40 w-4 h-4" />
                                {/* Input de Busca Escuro */}
                                <input 
                                    type="text" 
                                    placeholder="Buscar..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded py-2 pl-9 text-sm outline-none focus:border-energia" 
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {filteredCatalog.map(item => (
                                <div key={item.id} className={`p-3 rounded border flex justify-between items-center ${getTypeStyle(item)}`}>
                                    <div className="min-w-0 mr-2">
                                        <div className="font-bold text-sm">{item.name}</div>
                                        <div className="text-[10px] opacity-70 line-clamp-1">{item.details}</div>
                                    </div>
                                    <button onClick={() => addItemFromCatalog(item)} className="bg-black/20 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold shrink-0">Add</button>
                                </div>
                            ))}
                        </div>
                      </>
                  ) : (
                      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar bg-eden-900">
                          {/* Inputs Customizados Escuros */}
                          <div>
                              <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Nome</label>
                              <input 
                                value={customItem.name} 
                                onChange={e => setCustomItem({...customItem, name: e.target.value})} 
                                className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia" 
                                style={{ colorScheme: 'dark' }}
                              />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Categoria</label>
                                  <input 
                                    type="number" min="0" max="4" 
                                    value={customItem.category} 
                                    onChange={e => setCustomItem({...customItem, category: parseInt(e.target.value)})} 
                                    className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia" 
                                    style={{ colorScheme: 'dark' }}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Espaço</label>
                                  <input 
                                    type="number" min="0" 
                                    value={customItem.space} 
                                    onChange={e => setCustomItem({...customItem, space: parseInt(e.target.value)})} 
                                    className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia" 
                                    style={{ colorScheme: 'dark' }}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Tipo</label>
                                  <select 
                                    value={customItem.type} 
                                    onChange={e => setCustomItem({...customItem, type: e.target.value})} 
                                    className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia" 
                                    style={{colorScheme:'dark'}}
                                  >
                                      <option value="general">Geral</option>
                                      <option value="weapon">Arma</option>
                                      <option value="protection">Proteção</option>
                                      <option value="accessory">Acessório</option>
                                      <option value="ammo">Munição</option>
                                      <option value="explosive">Explosivo</option>
                                  </select>
                              </div>
                          </div>

                          {/* CAMPOS EXTRAS PARA ARMA/EXPLOSIVO */}
                          {(customItem.type === 'weapon' || customItem.type === 'explosive') && (
                              <div className="grid grid-cols-2 gap-4 p-3 border border-eden-700 rounded bg-eden-950/30">
                                  <div>
                                      <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Dano (ex: 1d6)</label>
                                      <input 
                                        type="text"
                                        value={customItem.damageDice} 
                                        onChange={e => setCustomItem({...customItem, damageDice: e.target.value})} 
                                        className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia"
                                        style={{ colorScheme: 'dark' }}
                                        placeholder="1d6"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Tipo Dano</label>
                                      <select 
                                        value={customItem.damageType} 
                                        onChange={e => setCustomItem({...customItem, damageType: e.target.value})} 
                                        className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia"
                                        style={{colorScheme:'dark'}}
                                      >
                                          {DAMAGE_TYPES_INFO.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                      </select>
                                  </div>
                                  {customItem.type === 'weapon' && (
                                      <div className="col-span-2">
                                          <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Subtipo de Arma</label>
                                          <select 
                                            value={customItem.weaponSubType} 
                                            onChange={e => setCustomItem({...customItem, weaponSubType: e.target.value})} 
                                            className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 outline-none focus:border-energia"
                                            style={{colorScheme:'dark'}}
                                          >
                                              <option value="melee">Corpo a Corpo</option>
                                              <option value="ranged">Disparo</option>
                                              <option value="firearm">Arma de Fogo</option>
                                          </select>
                                      </div>
                                  )}
                              </div>
                          )}

                          <div>
                              <label className="text-xs uppercase font-bold text-eden-100/50 block mb-1">Descrição</label>
                              <textarea 
                                value={customItem.description} 
                                onChange={e => setCustomItem({...customItem, description: e.target.value})} 
                                className="w-full bg-eden-900 text-eden-100 border border-eden-700 rounded p-2 h-24 outline-none focus:border-energia resize-none" 
                                style={{ colorScheme: 'dark' }}
                              />
                          </div>
                          <button onClick={addCustomItem} className="w-full py-3 bg-energia text-eden-900 font-bold rounded hover:bg-yellow-400 transition-colors">Criar Item</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
              <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                  <div className="p-4 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                      <div>
                          <h3 className="font-bold text-eden-100 text-lg">{activeItem.name}</h3>
                          <span className="text-xs text-energia font-mono">Categoria Atual: {['0','I','II','III','IV','V','VI'][getItemCategory(activeItem)] || 'VI+'}</span>
                      </div>
                      <button onClick={() => setEditingItemId(null)}><X size={24}/></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                          <h4 className="text-conhecimento font-bold text-xs mb-2 uppercase border-b border-conhecimento/30 pb-1 flex items-center gap-2"><Settings size={14}/> Modificações</h4>
                          <div className="space-y-2">
                              {MODIFICATIONS.filter(m => m.targetType === 'any' || m.targetType === activeItem.type || (m.targetType === 'ammo' && activeItem.type === 'ammo')).map(mod => {
                                  if (mod.allowedTypes && activeItem.subType && !mod.allowedTypes.includes(activeItem.subType)) return null;
                                  const isInstalled = activeItem.modifications.some(m => m.id === mod.id);
                                  return (
                                  <button key={mod.id} onClick={() => toggleModification(mod)} className={`w-full text-left p-2 rounded border flex justify-between items-center transition-colors ${isInstalled ? 'bg-conhecimento/20 border-conhecimento text-eden-100' : 'bg-eden-950 border-eden-700 text-eden-100/50 hover:border-eden-500'}`}>
                                      <div><div className="font-bold text-xs">{mod.name}</div><div className="text-[9px] opacity-70">{mod.description}</div></div>
                                      {isInstalled && <CheckCircle2 size={14} className="text-conhecimento shrink-0" />}
                                  </button>
                              )})}
                          </div>
                      </section>
                      <section>
                          <h4 className="text-sangue font-bold text-xs mb-2 uppercase border-b border-sangue/30 pb-1 flex items-center gap-2"><Ghost size={14}/> Maldições</h4>
                          <div className="space-y-2">
                              {CURSES.filter(c => c.targetType === 'any' || c.targetType === activeItem.type).map(curse => {
                                  const isInstalled = activeItem.curses.some(c => c.id === curse.id);
                                  const style = getElementStyle(curse.element);
                                  return (
                                  <button key={curse.id} onClick={() => toggleCurse(curse)} className={`w-full text-left p-2 rounded border flex justify-between items-center transition-colors ${isInstalled ? `${style.bg} ${style.border} text-eden-100` : 'bg-eden-950 border-eden-700 text-eden-100/50 hover:border-eden-500'}`}>
                                      <div><div className={`font-bold text-xs flex items-center gap-1`}><span className={isInstalled ? style.color : ''}>{curse.name}</span></div><div className="text-[9px] opacity-70">{curse.description}</div></div>
                                      {isInstalled && <CheckCircle2 size={14} className={style.color + ' shrink-0'} />}
                                  </button>
                              )})}
                          </div>
                      </section>
                  </div>
              </div>
          </div>
      )}
      
      {viewingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
               <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95">
                   <button onClick={() => setViewingItemId(null)} className="absolute top-4 right-4 hover:text-white text-eden-100/50"><X/></button>
                   <h3 className="text-2xl font-black mb-2 text-eden-100">{viewingItem.name}</h3>
                   <div className="flex gap-2 mb-4 text-xs font-mono text-eden-100/50 uppercase border-b border-eden-700 pb-2">
                       <span>{viewingItem.type}</span><span>•</span><span>Cat {viewingItem.category}</span><span>•</span><span>{viewingItem.space} Esp</span>
                   </div>
                   <div className="bg-eden-800 p-4 rounded-xl border border-eden-700 text-sm text-eden-100/80 mb-4 italic">"{viewingItem.details || "Sem descrição."}"</div>
                   {(viewingItem.modifications.length > 0 || viewingItem.curses.length > 0) && (
                       <div className="space-y-3">
                           {viewingItem.modifications.map(m => <div key={m.id} className="text-xs bg-conhecimento/10 border border-conhecimento/30 p-2 rounded text-conhecimento"><strong className="block mb-0.5"><Zap size={10} className="inline"/> {m.name}</strong> {m.description}</div>)}
                           {viewingItem.curses.map(c => {
                               const style = getElementStyle(c.element);
                               return <div key={c.id} className={`text-xs ${style.bg} ${style.border} border p-2 rounded ${style.color}`}><strong className="block mb-0.5"><Ghost size={10} className="inline"/> {c.name}</strong> {c.description}</div>
                           })}
                       </div>
                   )}
               </div>
          </div>
      )}
    </div>
  );
}