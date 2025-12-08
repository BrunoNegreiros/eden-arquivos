import { useState, useMemo, useEffect } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { 
  Search, Trash2, Scale, DollarSign, Settings, X, Zap, Skull, 
  Check, Crown, AlertTriangle, ShoppingBag, Ghost, Flame, Eye, 
  Hexagon, Swords, Plus
} from 'lucide-react';

import { EQUIPMENT_LIST, RANKS, MODIFICATIONS, CURSES } from '../../data/referenceData';
import type { ItemBase } from '../../data/referenceData';
import type { InventoryItem, ItemEffect } from '../../types/characterSchema';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const translateType = (type: string) => {
  switch(type) {
    case 'weapon': return 'Arma';
    case 'protection': return 'Proteção';
    case 'ammo': return 'Munição';
    case 'accessory': return 'Acessório';
    case 'general': return 'Geral';
    case 'explosive': return 'Explosivo';
    case 'paranormal': return 'Paranormal';
    default: return type;
  }
};

// Filtros rápidos
const LEGEND_FILTERS = [
  { label: 'Arma', color: 'bg-red-500', types: ['weapon', 'explosive'] },
  { label: 'Proteção', color: 'bg-emerald-500', types: ['protection'] },
  { label: 'Munição', color: 'bg-yellow-500', types: ['ammo'] },
  { label: 'Acessório', color: 'bg-cyan-500', types: ['accessory'] },
  { label: 'Geral', color: 'bg-zinc-500', types: ['general'] },
  { label: 'Paranormal', color: 'bg-pink-500', types: ['paranormal'] },
];

const getTypeStyle = (item: ItemBase | InventoryItem) => {
  if (item.subType === 'cursed_item') return 'border-purple-500/50 bg-purple-500/5 text-purple-200 group-hover:border-purple-400';
  switch (item.type) {
    case 'weapon': 
    case 'explosive': return 'border-red-500/50 bg-red-500/5 text-red-200 group-hover:border-red-400';
    case 'ammo': return 'border-yellow-500/50 bg-yellow-500/5 text-yellow-200 group-hover:border-yellow-400';
    case 'protection': return 'border-emerald-500/50 bg-emerald-500/5 text-emerald-200 group-hover:border-emerald-400';
    case 'accessory': return 'border-cyan-500/50 bg-cyan-500/5 text-cyan-200 group-hover:border-cyan-400';
    case 'paranormal': return 'border-pink-500/50 bg-pink-500/5 text-pink-200 group-hover:border-pink-400';
    default: return 'border-eden-700 bg-eden-900 text-eden-100 group-hover:border-eden-500';
  }
};

const getElementStyle = (element?: string) => {
  switch (element) {
    case 'sangue': return { color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-600/10', icon: Flame, desc: 'Penalidade: -2 SAN em testes de FOR ou VIG' };
    case 'morte': return { color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-500/10', icon: Skull, desc: 'Penalidade: -2 SAN em testes de PRE' };
    case 'conhecimento': return { color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: Eye, desc: 'Penalidade: -2 SAN em testes de INT' };
    case 'energia': return { color: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-500/10', icon: Zap, desc: 'Penalidade: -2 SAN em testes de AGI' };
    case 'medo': return { color: 'text-white', border: 'border-white', bg: 'bg-white/10', icon: Ghost, desc: '' };
    default: return { color: 'text-eden-100', border: 'border-eden-700', bg: 'bg-eden-800', icon: Hexagon, desc: '' };
  }
};

const isOpposing = (elemA: string, elemB: string) => {
  if ((elemA === 'sangue' && elemB === 'conhecimento') || (elemA === 'conhecimento' && elemB === 'sangue')) return true;
  if ((elemA === 'morte' && elemB === 'energia') || (elemA === 'energia' && elemB === 'morte')) return true;
  if ((elemA === 'energia' && elemB === 'conhecimento') || (elemA === 'conhecimento' && elemB === 'energia')) return true;
  if ((elemA === 'sangue' && elemB === 'morte') || (elemA === 'morte' && elemB === 'sangue')) return true;
  return false;
};

export default function Step6Inventory() {
  const { character, updateProgression, updateInventory } = useCharacter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle de Abas no Mobile
  const [mobileTab, setMobileTab] = useState<'catalog' | 'backpack'>('catalog');
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
  const items = character.inventory.items; 

  // Lógica de Prestígio
  const prestige = character.progression.prestigePoints || 0;
  const calculatedRank = useMemo(() => [...RANKS].reverse().find(r => prestige >= r.minPP) || RANKS[0], [prestige]);

  useEffect(() => {
    if (character.progression.patente !== calculatedRank.name) {
      updateProgression('patente', calculatedRank.name);
    }
  }, [calculatedRank, character.progression.patente, updateProgression]);

  // Lógica de Carga
  const str = character.attributes.for;
  const maxLoad = useMemo(() => (str === 0 ? 2 : str * 5) + (character.progression.class === 'combatente' ? 0 : 0), [str, character.progression.class]);
  const currentItems = character.inventory.items;
  
  const currentSpace = useMemo(() => currentItems.reduce((sum, item) => sum + item.space * item.quantity, 0), [currentItems]);

  const getItemCategory = (item: InventoryItem) => {
    let cat = item.category;
    cat += item.modifications.length;
    if (item.curses.length > 0) {
      cat += 2;
      if (item.curses.length > 1) cat += (item.curses.length - 1);
    }
    return cat;
  };

  const itemCounts = useMemo(() => currentItems.reduce((acc, item) => {
    const finalCat = getItemCategory(item);
    if (finalCat > 0) acc[finalCat] = (acc[finalCat] || 0) + item.quantity;
    return acc;
  }, {} as Record<number, number>), [currentItems]);

  const curseCounts = useMemo(() => {
    const counts: Record<string, number> = { sangue: 0, morte: 0, energia: 0, conhecimento: 0, medo: 0 };
    currentItems.forEach(item => {
      item.curses.forEach(curse => {
        if (curse.element && curse.element in counts) {
          counts[curse.element as string]++;
        }
      });
    });
    return counts;
  }, [currentItems]);

  // --- LÓGICA DE FILTRO DO CATÁLOGO ---
  const filteredEquipment = useMemo(() => {
    return EQUIPMENT_LIST.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilters.length > 0) {
        const isCursedFilterActive = activeFilters.includes('cursed_item');
        const isTypeFilterActive = activeFilters.some(f => f !== 'cursed_item');
        
        const matchesType = isTypeFilterActive ? activeFilters.includes(item.type) : false;
        const matchesCursed = isCursedFilterActive ? item.subType === 'cursed_item' : false;

        if (isCursedFilterActive && isTypeFilterActive) {
            matchesFilter = matchesType || matchesCursed;
        } else if (isCursedFilterActive) {
            matchesFilter = matchesCursed;
        } else {
            matchesFilter = matchesType;
        }
      }
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilters]);

  const toggleFilter = (types: string[]) => {
    setActiveFilters(prev => {
      const allActive = types.every(t => prev.includes(t));
      if (allActive) return prev.filter(t => !types.includes(t));
      return [...new Set([...prev, ...types])];
    });
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handlePrestigeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) updateProgression('prestigePoints', val);
  };

  const handleAddItem = (itemBase: ItemBase) => {
    const limitKey = ['I', 'II', 'III', 'IV'][itemBase.category - 1] as keyof typeof calculatedRank.limit;
    const limit = itemBase.category === 0 ? 999 : (calculatedRank.limit[limitKey] || 0);
    
    if (itemBase.category > 0 && (itemCounts[itemBase.category] || 0) >= limit) {
        showAlert(`Limite de Categoria ${['0','I','II','III','IV'][itemBase.category]} atingido!`);
        return;
    }
    if (currentSpace + itemBase.space > maxLoad * 2) {
        showAlert(`Impossível carregar!`);
        return;
    }
    
    const newItem: InventoryItem = {
      id: generateId(),
      name: itemBase.name,
      category: itemBase.category,
      space: itemBase.space,
      type: itemBase.type as InventoryItem['type'],
      subType: itemBase.subType,
      quantity: 1,
      isEquipped: false,
      modifications: [],
      curses: [],
      damage: itemBase.damage,
      details: itemBase.details || ""
    };
    
    updateInventory([...currentItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    updateInventory(currentItems.filter(item => item.id !== id));
  };

  const activeItem = currentItems.find(i => i.id === editingItemId);
  const viewingItem = currentItems.find(i => i.id === viewingItemId);

  const updateActiveItem = (updatedItem: InventoryItem) => {
    const newItems = currentItems.map(i => i.id === updatedItem.id ? updatedItem : i);
    updateInventory(newItems);
  };

  const handleToggleModification = (mod: ItemEffect) => {
    if (!activeItem) return;
    const hasMod = activeItem.modifications.some(m => m.id === mod.id);
    let newMods = hasMod 
      ? activeItem.modifications.filter(m => m.id !== mod.id)
      : [...activeItem.modifications, mod];

    const testItem = { ...activeItem, modifications: newMods };
    const futureCat = getItemCategory(testItem);
    const limitKey = ['I', 'II', 'III', 'IV'][futureCat - 1] as keyof typeof calculatedRank.limit;
    
    if (!hasMod && futureCat > 0 && (itemCounts[futureCat] || 0) >= (calculatedRank.limit[limitKey] || 0)) {
       alert(`Limite de Categoria ${futureCat} atingido!`);
       return;
    }
    updateActiveItem(testItem);
  };

  const handleToggleCurse = (curse: ItemEffect) => {
    if (!activeItem || !curse.element) return;
    const isInstalled = activeItem.curses.some(c => c.id === curse.id);
    let newCurses = [...activeItem.curses];

    if (isInstalled) {
      newCurses = newCurses.filter(c => c.id !== curse.id);
    } else {
      const hasOpposing = activeItem.curses.some(existing => isOpposing(existing.element!, curse.element!));
      if (hasOpposing) {
        alert(`Elementos opostos não se misturam!`);
        return;
      }
      const testItem = { ...activeItem, curses: [...newCurses, curse] };
      const futureCat = getItemCategory(testItem);
      const limitKey = ['I', 'II', 'III', 'IV'][futureCat - 1] as keyof typeof calculatedRank.limit;
      
      if (futureCat > 0 && (itemCounts[futureCat] || 0) >= (calculatedRank.limit[limitKey] || 0)) {
          alert(`Limite de Categoria ${futureCat} atingido!`);
          return;
      }
      newCurses.push(curse);
    }
    updateActiveItem({ ...activeItem, curses: newCurses });
  };

  const isOverburdened = currentSpace > maxLoad;

  const getSpecialRules = (item: InventoryItem) => {
    const rules = [];
    const desc = (item.details || "").toLowerCase();
    if (desc.includes('ágil')) rules.push({ title: 'Arma Ágil', desc: 'Permite usar Agilidade em vez de Força para ataques e dano.' });
    if (desc.includes('automática')) rules.push({ title: 'Arma Automática', desc: 'Pode disparar rajadas: sofre -1d20 no ataque, mas causa +1 dado de dano.' });
    if (item.type === 'weapon' && item.damage?.toLowerCase().includes('balístico')) {
        const isTwoHanded = item.space >= 2 || desc.includes('duas mãos');
        rules.push({ title: 'Coronhada', desc: `Dano: ${isTwoHanded ? '1d6' : '1d4'} impacto.` });
    }
    return rules;
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-500 relative pb-4">
      
      {alertMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-[100] font-bold flex gap-2 border border-red-400 items-center whitespace-nowrap">
            <AlertTriangle size={20} /> {alertMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="shrink-0 space-y-2">
        <div className="flex justify-between items-end border-b border-eden-700 pb-2">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-eden-100">Arsenal</h2>
                <p className="text-xs md:text-sm text-eden-100/50">Gerencie patente, carga e maldições.</p>
            </div>
            
            <div className="flex flex-col items-end bg-eden-800/50 p-1.5 rounded-lg border border-eden-700">
                <label className="text-[10px] text-eden-100/50 uppercase font-bold mb-1 flex items-center gap-1">
                    <Crown size={12} className="text-conhecimento"/> Prestígio
                </label>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" min="0" value={prestige} 
                        onChange={handlePrestigeChange}
                        className="w-16 bg-eden-900 border border-eden-600 rounded px-1 py-0.5 text-right text-base font-mono font-black text-conhecimento focus:border-energia outline-none"
                    />
                    <span className="text-xs text-eden-100/30 font-mono pt-1">PP</span>
                </div>
            </div>
        </div>

        {/* Status Bar */}
        <div className="bg-eden-800 border border-eden-700 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm text-xs">
            <div className="flex items-center gap-3">
                 <div>
                    <div className="text-[8px] text-eden-100/40 uppercase font-bold">Patente</div>
                    <div className="text-energia font-black text-sm leading-none">{calculatedRank.name}</div>
                 </div>
                 <div className="w-px h-6 bg-eden-700"></div>
                             <div className="flex justify-center items-center text-[10px] border-eden-700 pt-1">
              <span className="text-eden-100/50">Crédito</span>
              <span className="text-conhecimento font-bold flex items-center gap-1"><DollarSign size={10} /> {calculatedRank.credit}</span>
            </div>
            </div>
        </div>
      </div>

      {/* BARRA DE ABAS MOBILE */}
      <div className="flex bg-eden-800 p-1 rounded-lg border border-eden-700 lg:hidden shrink-0">
          <button 
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'catalog' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50'}`}
          >
              <Search size={14}/> Catálogo
          </button>
          <button 
            onClick={() => setMobileTab('backpack')}
            className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'backpack' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50'}`}
          >
              <ShoppingBag size={14}/> Mochila ({items.length})
          </button>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        
        {/* COLUNA ESQUERDA: Filtros e Catálogo */}
        <div className={`lg:col-span-1 flex-col gap-3 h-full ${mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
             
             {/* Barra de Busca e Filtros (Wrap, sem scroll) */}
             <div className="shrink-0 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-eden-100/40 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Buscar item..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full bg-eden-800 border border-eden-700 rounded-xl py-2 pl-9 pr-4 text-sm text-eden-100 focus:border-eden-100 outline-none transition-all" 
                    />
                </div>
                {/* FILTROS QUEBRAM LINHA */}
                <div className="flex flex-wrap gap-2 pb-1">
                  {LEGEND_FILTERS.map(l => (
                    <button 
                      key={l.label} 
                      onClick={() => toggleFilter(l.types)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded border whitespace-nowrap transition-all duration-200 ${activeFilters.some(t => l.types.includes(t)) ? 'border-eden-100 bg-eden-800 shadow-sm' : 'border-transparent opacity-60 grayscale'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-[10px] uppercase tracking-wider text-eden-100 font-bold">{l.label}</span>
                    </button>
                  ))}
                </div>
             </div>

             {/* Lista do Catálogo */}
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-20 lg:pb-0">
                {filteredEquipment.map(item => {
                   const typeClass = getTypeStyle(item);
                   return (
                       <div key={item.id} className={`p-2 rounded-lg border flex justify-between items-center group transition-colors ${typeClass}`}>
                          <div className="min-w-0 mr-2">
                             <div className="font-bold text-xs flex items-center gap-2">
                                <span className="truncate">{item.name}</span>
                                <span className="text-[9px] opacity-60 border border-current px-1 rounded shrink-0">Cat {item.category}</span>
                             </div>
                             <div className="text-[10px] opacity-60 line-clamp-1">{item.details}</div>
                          </div>
                          <button onClick={() => handleAddItem(item)} className="px-2 py-1 rounded text-xs font-bold bg-black/20 hover:bg-white/20 transition-colors"><Plus size={14}/></button>
                       </div>
                   )
                })}
                {filteredEquipment.length === 0 && <div className="text-center text-eden-100/30 py-10 text-sm">Nenhum item encontrado.</div>}
             </div>
        </div>
        
        {/* COLUNA DIREITA: Mochila e Status */}
        <div className={`lg:col-span-2 flex flex-col gap-4 h-full ${mobileTab === 'backpack' ? 'flex' : 'hidden lg:flex'}`}>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">              
                {/* Carga */}
                <div className={`rounded-xl p-3 border flex flex-col justify-between width-100 ${isOverburdened ? 'bg-red-900/20 border-red-500' : 'bg-eden-800 border-eden-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase text-eden-100/60 font-mono">Carga</span>
                        <Scale size={14} className={isOverburdened ? 'text-red-400' : 'text-eden-100'} />
                    </div>
                    <div className="text-2xl font-black text-eden-100 leading-none">{currentSpace} <span className="text-sm text-eden-100/40">/ {maxLoad}</span></div>
                    {isOverburdened && <p className="text-[9px] text-red-400 font-bold">-5 Defesa</p>}
                </div>

                {/* Limites */}
                <div className="col-span-2 md:col-span-1 bg-eden-900/50 border border-eden-700 rounded-xl p-2 flex gap-1 overflow-x-auto">
                    {[1, 2, 3, 4].map(cat => {
                        const limitKey = ['I', 'II', 'III', 'IV'][cat - 1] as keyof typeof calculatedRank.limit;
                        const limit = calculatedRank.limit[limitKey];
                        const current = itemCounts[cat] || 0;
                        return (
                          <div key={cat} className={`flex-1 text-center px-1 rounded border flex flex-col justify-center ${current > limit ? 'bg-red-900/50 border-red-500' : 'bg-eden-900 border-eden-700'}`}>
                            <div className="text-[8px] text-eden-100/40">Cat {cat}</div>
                            <div className={`font-mono text-xs font-bold ${current > limit ? 'text-red-400' : 'text-eden-100'}`}>{current}/{limit}</div>
                          </div>
                        )
                    })}
                </div>
             </div>

             {/* Lista da Mochila */}
             <div className="flex-1 flex flex-col bg-eden-800/20 border border-eden-700 rounded-xl overflow-hidden min-h-0">
                <div className="p-3 border-b border-eden-700 bg-eden-800/80 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-eden-100 flex items-center gap-2 text-sm">
                        <ShoppingBag size={16} className="text-energia"/> Mochila
                    </h3>
                    <span className="text-[10px] bg-eden-900 px-2 py-0.5 rounded text-eden-100/50">{currentItems.length} itens</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {currentItems.map(item => {
                        const cat = getItemCategory(item);
                        const typeClass = getTypeStyle(item);
                        return (
                            <div key={item.id} className={`border rounded-lg p-2 flex justify-between items-center group transition-all shadow-sm ${typeClass}`}>
                                <div className="flex-1 min-w-0 mr-3 cursor-pointer" onClick={() => setViewingItemId(item.id)}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-xs truncate">{item.name}</span>
                                        <span className="text-[9px] opacity-60 px-1 rounded border border-current">
                                            {['0', 'I', 'II', 'III', 'IV', 'V', 'VI'][cat] || 'VI+'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] opacity-70 flex flex-wrap gap-2 items-center">
                                        <span>{item.space} esp</span>
                                        <span>• {translateType(item.type)}</span>
                                        {item.quantity > 1 && <span className="text-energia font-bold">x{item.quantity}</span>}
                                        {(item.modifications.length > 0 || item.curses.length > 0) && <span className="text-conhecimento">+Mods</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setEditingItemId(item.id)} className="p-1.5 hover:bg-black/20 rounded text-eden-100/50 hover:text-white"><Settings size={14}/></button>
                                    <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 hover:bg-black/20 rounded text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        )
                    })}
                    {currentItems.length === 0 && <div className="text-center py-10 text-eden-100/30 text-xs italic">Mochila vazia.</div>}
                </div>
             </div>

             {/* Maldições (Se houver) */}
             {(curseCounts.sangue > 0 || curseCounts.morte > 0 || curseCounts.energia > 0 || curseCounts.conhecimento > 0) && (
                  <div className="bg-eden-900 border border-eden-700 rounded-xl p-3 shrink-0">
                    <h3 className="text-xs font-bold text-eden-100 mb-2 flex items-center gap-2 border-b border-eden-700 pb-1">
                        <Ghost size={12} className="text-red-500" /> Penalidades
                    </h3>
                    <div className="space-y-1 text-[10px]">
                        {Object.entries(curseCounts).map(([elem, count]) => {
                            if (count === 0 || elem === 'medo') return null;
                            const style = getElementStyle(elem);
                            return (
                                <div key={elem} className="flex gap-2 items-center text-eden-100/80">
                                    <span className="capitalize font-bold text-eden-100">{elem}:</span> 
                                    <span>{style.desc} (x{count})</span>
                                </div>
                            )
                        })}
                    </div>
                  </div>
             )}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-eden-700 flex justify-between items-center bg-eden-800">
                    <div>
                        <h3 className="text-xl font-bold text-eden-100">{activeItem.name}</h3>
                        <div className="flex gap-3 mt-1 text-xs text-eden-100/60">
                            <span className="text-energia font-bold">Categoria Atual: {getItemCategory(activeItem)}</span>
                        </div>
                    </div>
                    <button onClick={() => setEditingItemId(null)} className="p-2 hover:bg-eden-700 rounded-full text-eden-100"><X size={20} /></button>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section>
                        <h4 className="text-conhecimento font-bold uppercase tracking-widest text-[10px] mb-2 pb-1 border-b border-conhecimento/20 flex items-center gap-2"><Settings size={12} /> Modificações (+1 Cat)</h4>
                        <div className="space-y-1">
                           {MODIFICATIONS.filter(m => m.targetType === 'any' || m.targetType === activeItem.type || (m.targetType === 'ammo' && activeItem.type === 'ammo')).map(mod => {
                                if (mod.allowedTypes && activeItem.subType && !mod.allowedTypes.includes(activeItem.subType)) return null;
                                const isInstalled = activeItem.modifications.some(m => m.id === mod.id);
                                 return (
                                    <button key={mod.id} onClick={() => handleToggleModification(mod)} className={`w-full text-left p-2 rounded border flex justify-between items-center transition-all text-xs ${isInstalled ? 'bg-conhecimento/10 border-conhecimento text-eden-100' : 'bg-eden-800/30 border-eden-700 text-eden-100/60 hover:border-eden-500 hover:text-eden-100'}`}>
                                        <div><div className="font-bold">{mod.name}</div><div className="text-[9px] opacity-70">{mod.description}</div></div>
                                        {isInstalled && <Check size={14} className="text-conhecimento shrink-0" />}
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                    <section>
                        <h4 className="text-sangue font-bold uppercase tracking-widest text-[10px] mb-2 pb-1 border-b border-sangue/20 flex items-center gap-2"><Ghost size={12} /> Maldições (+2/1 Cat)</h4>
                        <div className="space-y-1">
                           {CURSES.filter(c => c.targetType === 'any' || c.targetType === activeItem.type).map(curse => {
                                const isInstalled = activeItem.curses.some(c => c.id === curse.id);
                                const style = getElementStyle(curse.element);
                                 return (
                                    <button key={curse.id} onClick={() => handleToggleCurse(curse)} className={`w-full text-left p-2 rounded border flex justify-between items-center transition-all text-xs ${isInstalled ? `${style.bg} ${style.border} text-eden-100` : 'bg-eden-800/30 border-eden-700 text-eden-100/60 hover:border-eden-500 hover:text-eden-100'}`}>
                                        <div className="flex flex-col items-start">
                                            <div className={`font-bold flex items-center gap-1`}><style.icon size={10} className={style.color}/><span className={isInstalled ? style.color : ''}>{curse.name}</span></div>
                                            <div className="text-[9px] opacity-70">{curse.description}</div>
                                            {/* DESCRIÇÃO DA PENALIDADE ADICIONADA */}
                                            {style.desc && <div className="text-[8px] text-red-400 font-mono mt-0.5">{style.desc}</div>}
                                        </div>
                                        {isInstalled && <Check size={14} className={style.color + ' shrink-0'} />}
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DE DETALHES (INFO) */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-eden-900 border border-eden-600 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className={`p-4 border-b flex justify-between items-start ${getTypeStyle(viewingItem).split(' ')[0]} border-b-2 bg-eden-800`}>
                    <div>
                        <h3 className="text-xl font-black text-eden-100 mb-1">{viewingItem.name}</h3>
                        <div className="flex gap-2 text-xs text-eden-100/60 font-mono uppercase">
                            <span>{translateType(viewingItem.type)}</span>
                            <span>•</span>
                            <span>{viewingItem.damage || 'Sem Dano'}</span>
                        </div>
                    </div>
                    <button onClick={() => setViewingItemId(null)} className="p-1 hover:bg-eden-700 rounded-full text-eden-100 transition-colors"><X size={20} /></button>
                </div>
         
                <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <div className="bg-eden-800/50 p-3 rounded-xl border border-eden-700/50">
                        <h4 className="text-[10px] font-bold text-eden-100/40 uppercase mb-1">Descrição Original</h4>
                        <p className="text-eden-100/90 leading-relaxed text-xs italic">"{viewingItem.details}"</p>
                    </div>
                    {getSpecialRules(viewingItem).length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold text-energia uppercase mb-1 flex items-center gap-2"><Swords size={10}/> Habilidades Especiais</h4>
                            <div className="grid grid-cols-1 gap-1">
                                {getSpecialRules(viewingItem).map(rule => (
                                    <div key={rule.title} className="bg-energia/10 border border-energia/20 p-2 rounded-lg">
                                        <span className="text-energia font-bold text-xs block mb-0.5">{rule.title}</span>
                                        <p className="text-[10px] text-eden-100/80">{rule.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-eden-700">
                        <div className="text-center">
                            <div className="text-[10px] text-eden-100/40 uppercase">Categoria Final</div>
                            <div className="text-lg font-black text-energia">
                                {['0', 'I', 'II', 'III', 'IV', 'V', 'VI'][getItemCategory(viewingItem)] || 'VI+'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-eden-100/40 uppercase">Peso Total</div>
                            <div className="text-lg font-black text-eden-100">{viewingItem.space}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}