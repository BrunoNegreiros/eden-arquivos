import { useState, useRef, useEffect } from 'react';
import { 
  Pen, Highlighter, Eraser, Type, PaintBucket, Image as ImageIcon,
  Undo, Redo, Trash2, Download, X, Minus, Plus, Save, 
  AlignLeft, AlignCenter, AlignRight, ChevronLeft, ChevronRight, Ban, Move, Maximize2
} from 'lucide-react';
import type { CharacterSheet, NotePage, TextObject, ImageObject } from '../../types/characterSchema';

// --- TIPOS ---
interface HistoryStep {
    base: ImageData;
    highlight: ImageData;
    pen: ImageData;
}

// CORREÇÃO: Propriedades obrigatórias para bater com NotePage
interface ExtendedNotePage extends Omit<NotePage, 'drawing'> {
  drawing: string;
  layerBase?: string;
  layerHighlight?: string;
  layerPen?: string;
  texts: TextObject[];  // Obrigatório
  images: ImageObject[]; // Obrigatório
}

interface Props {
  character: CharacterSheet;
  onUpdate: (updates: any) => void;
}

// --- COMPONENTE DE PALETA ---
const ColorPalette = ({ selectedColor, onSelect, label, allowTransparent = false }: { selectedColor: string, onSelect: (c: string) => void, label?: string, allowTransparent?: boolean }) => {
    const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ffffff'];
    return (
        <div className="flex flex-col gap-1 min-w-[120px]">
            {label && <span className="text-[9px] uppercase font-bold text-eden-100/40 ml-1">{label}</span>}
            <div className="flex gap-1 p-1 bg-eden-900/80 rounded-lg border border-eden-700/50 items-center overflow-x-auto custom-scrollbar pb-1">
                {COLORS.map(c => (
                    <button 
                        key={c} 
                        onClick={() => onSelect(c)}
                        className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-transform shrink-0 ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                    />
                ))}
                
                <label className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 shrink-0 ${!COLORS.includes(selectedColor) && selectedColor !== 'transparent' ? 'border-white scale-110' : 'border-transparent'}`}>
                    <input type="color" className="opacity-0 w-full h-full cursor-pointer" value={selectedColor !== 'transparent' ? selectedColor : '#000000'} onChange={e => onSelect(e.target.value)} />
                </label>

                {allowTransparent && (
                    <>
                        <div className="w-px bg-eden-700 mx-0.5 h-3 md:h-4 shrink-0"></div>
                        <button onClick={() => onSelect('transparent')} className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center bg-eden-950 shrink-0 ${selectedColor === 'transparent' ? 'border-white' : 'border-eden-600'}`} title="Transparente">
                            <Ban size={10} className="text-red-400"/>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default function SheetNotes({ character, onUpdate }: Props) {
  // --- REFS ---
  const canvasBaseRef = useRef<HTMLCanvasElement>(null);
  const canvasHighlightRef = useRef<HTMLCanvasElement>(null);
  const canvasPenRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navegação
  const [activePage, setActivePage] = useState(0);
  const [pageTitle, setPageTitle] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Ferramentas
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'bucket' | 'text' | 'image'>('pen');

  // Configurações
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  const [textBg, setTextBg] = useState<string>('transparent');
  const [textBorder, setTextBorder] = useState<string>('transparent');

  // Estados Lógicos
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  const [texts, setTexts] = useState<TextObject[]>([]);
  const [images, setImages] = useState<ImageObject[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  const [draggingId, setDraggingId] = useState<{ type: 'text' | 'image', id: string, startX: number, startY: number, initialObjX: number, initialObjY: number } | null>(null);
  const [resizingId, setResizingId] = useState<{ id: string, startX: number, startY: number, startW: number, startH: number } | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;
  const MAX_PAGES = 20;

  useEffect(() => {
      if (editingTextId) {
          const txt = texts.find(t => t.id === editingTextId);
          if (txt) {
              setColor(txt.color);
              setFontSize(txt.fontSize);
              setTextAlign(txt.align);
              setTextBg(txt.backgroundColor || 'transparent');
              setTextBorder(txt.borderColor || 'transparent');
          }
      }
  }, [editingTextId]);

  // Listener Global para Drag & Drop e Resize
  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (resizingId) {
              e.preventDefault();
              e.stopPropagation(); 
              const deltaX = e.clientX - resizingId.startX;
              const deltaY = e.clientY - resizingId.startY;
              
              setImages(prev => prev.map(img => 
                  img.id === resizingId.id 
                  ? { 
                      ...img, 
                      width: Math.max(50, resizingId.startW + deltaX), 
                      height: Math.max(50, resizingId.startH + deltaY) 
                    } 
                  : img
              ));
              return;
          }

          if (draggingId) {
              e.preventDefault();
              const deltaX = e.clientX - draggingId.startX;
              const deltaY = e.clientY - draggingId.startY;
              
              if (draggingId.type === 'image') {
                  setImages(prev => prev.map(img => img.id === draggingId.id ? { ...img, x: draggingId.initialObjX + deltaX, y: draggingId.initialObjY + deltaY } : img));
              } else {
                  setTexts(prev => prev.map(txt => txt.id === draggingId.id ? { ...txt, x: draggingId.initialObjX + deltaX, y: draggingId.initialObjY + deltaY } : txt));
              }
          }
      };

      const handleGlobalUp = () => {
          if (resizingId || draggingId) {
              setResizingId(null); 
              setDraggingId(null); 
              setHasChanges(true);
          }
      };

      if (resizingId || draggingId) {
          window.addEventListener('mousemove', handleGlobalMove);
          window.addEventListener('mouseup', handleGlobalUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleGlobalMove);
          window.removeEventListener('mouseup', handleGlobalUp);
      };
  }, [resizingId, draggingId]);

  useEffect(() => { loadPage(activePage); }, [activePage]);

  const loadPage = (pageIndex: number) => {
    const ctxBase = canvasBaseRef.current?.getContext('2d');
    const ctxHigh = canvasHighlightRef.current?.getContext('2d');
    const ctxPen = canvasPenRef.current?.getContext('2d');
    if (!ctxBase || !ctxHigh || !ctxPen) return;

    [ctxBase, ctxHigh, ctxPen].forEach(ctx => ctx.clearRect(0, 0, A4_WIDTH, A4_HEIGHT));
    ctxBase.fillStyle = '#ffffff';
    ctxBase.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    const savedNote = character.notes?.find(n => n.id === pageIndex) as unknown as ExtendedNotePage | undefined;

    if (savedNote) {
        setTexts(savedNote.texts || []);
        setImages(savedNote.images || []);
        setPageTitle(savedNote.title || `Anotação ${pageIndex + 1}`);

        const loadLayer = (src: string | undefined, ctx: CanvasRenderingContext2D) => new Promise<void>((resolve) => {
            if (!src) return resolve();
            const img = new Image();
            img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
            img.src = src;
        });

        Promise.all([
            loadLayer(savedNote.layerBase, ctxBase),
            loadLayer(savedNote.layerHighlight, ctxHigh),
            loadLayer(savedNote.layerPen || savedNote.drawing, ctxPen)
        ]).then(() => saveHistoryState());
    } else {
        setTexts([]); setImages([]); setPageTitle(`Anotação ${pageIndex + 1}`);
        saveHistoryState();
    }
    setHasChanges(false);
  };

  const saveCurrentPage = () => {
      const baseData = canvasBaseRef.current?.toDataURL() || '';
      const highData = canvasHighlightRef.current?.toDataURL() || '';
      const penData = canvasPenRef.current?.toDataURL() || '';
      const currentNotes = [...(character.notes || [])];
      const existingIndex = currentNotes.findIndex(n => n.id === activePage);

      const newNoteData: ExtendedNotePage = {
          id: activePage,
          title: pageTitle,
          layerBase: baseData,
          layerHighlight: highData,
          layerPen: penData,
          drawing: penData, 
          texts: texts,
          images: images
      };

      if (existingIndex >= 0) {
          currentNotes[existingIndex] = newNoteData as unknown as NotePage;
      } else {
          currentNotes.push(newNoteData as unknown as NotePage);
      }

      onUpdate({ notes: currentNotes });
      setHasChanges(false);
      alert(`"${pageTitle}" salva com sucesso!`);
  };

  // --- BALDE ---
  const colorsMatch = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
      return Math.abs(r1 - r2) < 10 && Math.abs(g1 - g2) < 10 && Math.abs(b1 - b2) < 10;
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
      const ctxBase = canvasBaseRef.current?.getContext('2d');
      const ctxPen = canvasPenRef.current?.getContext('2d');
      if (!ctxBase || !ctxPen) return;

      const w = A4_WIDTH; const h = A4_HEIGHT;
      const baseData = ctxBase.getImageData(0,0,w,h).data;
      const penData = ctxPen.getImageData(0,0,w,h).data;

      let r = 0, g = 0, b = 0;
      if (fillColor.startsWith('#')) {
          const hex = fillColor.slice(1);
          if (hex.length === 3) {
             r = parseInt(hex[0]+hex[0], 16);
             g = parseInt(hex[1]+hex[1], 16);
             b = parseInt(hex[2]+hex[2], 16);
          } else {
             r = parseInt(hex.slice(0, 2), 16);
             g = parseInt(hex.slice(2, 4), 16);
             b = parseInt(hex.slice(4, 6), 16);
          }
      }
      
      const startPos = (startY * w + startX) * 4;
      const startR = baseData[startPos], startG = baseData[startPos + 1], startB = baseData[startPos + 2];
      
      if (startR === r && startG === g && startB === b) return;

      const output = ctxBase.createImageData(w, h);
      output.data.set(baseData);
      const outData = output.data;

      const stack = [[startX, startY]];
      const visited = new Set<number>();

      while (stack.length) {
          const [x, y] = stack.pop()!;
          const idx = y * w + x;
          
          if (visited.has(idx)) continue;
          const pos = idx * 4;

          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          visited.add(idx);

          const matchesBase = colorsMatch(baseData[pos], baseData[pos+1], baseData[pos+2], startR, startG, startB);
          const isPen = penData[pos + 3] > 50;

          if (matchesBase && !isPen) {
              outData[pos] = r; outData[pos+1] = g; outData[pos+2] = b; outData[pos+3] = 255;
              stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
          }
      }
      ctxBase.putImageData(output, 0, 0);
      saveHistoryState();
      setHasChanges(true);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    return { x: Math.round(clientX - rect.left), y: Math.round(clientY - rect.top) };
  };

  const getTargetCtx = () => {
      if (tool === 'pen' || tool === 'eraser') return canvasPenRef.current?.getContext('2d');
      if (tool === 'highlighter') return canvasHighlightRef.current?.getContext('2d');
      return null;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'text' || tool === 'image' || draggingId || resizingId) return;
    
    const { x, y } = getCoordinates(e);
    
    if (tool === 'bucket') { 
        floodFill(x, y, color); 
        return; 
    }

    setIsDrawing(true);
    
    if (tool === 'eraser') {
        [canvasBaseRef, canvasHighlightRef, canvasPenRef].forEach(ref => {
            const ctx = ref.current?.getContext('2d');
            if(ctx) {
                ctx.beginPath(); ctx.moveTo(x, y); 
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = brushSize * 4;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            }
        });
        return;
    }

    const ctx = getTargetCtx();
    if (!ctx) return;
    
    ctx.beginPath(); 
    ctx.moveTo(x, y); 
    ctx.lineCap = 'round'; 
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    if (tool === 'highlighter') { 
        ctx.strokeStyle = color; 
        ctx.globalAlpha = 0.5; 
        ctx.lineWidth = 20; 
    } else { // Pen
        ctx.strokeStyle = color; 
        ctx.globalAlpha = 1.0; 
        ctx.lineWidth = brushSize; 
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'text' || tool === 'bucket' || tool === 'image') return;
    const { x, y } = getCoordinates(e);

    if (tool === 'eraser') {
        [canvasBaseRef, canvasHighlightRef, canvasPenRef].forEach(ref => {
            const c = ref.current?.getContext('2d');
            if(c) { c.lineTo(x, y); c.stroke(); }
        });
        return;
    }
    
    const ctx = getTargetCtx();
    if (!ctx) return;
    
    if (tool === 'highlighter') { ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 20; }
    
    ctx.lineTo(x, y); ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    [canvasBaseRef, canvasHighlightRef, canvasPenRef].forEach(ref => {
        const ctx = ref.current?.getContext('2d');
        if(ctx) ctx.closePath();
    });
    saveHistoryState();
    setHasChanges(true);
  };

  const saveHistoryState = () => {
    const ctxBase = canvasBaseRef.current?.getContext('2d');
    const ctxHigh = canvasHighlightRef.current?.getContext('2d');
    const ctxPen = canvasPenRef.current?.getContext('2d');
    if (!ctxBase || !ctxHigh || !ctxPen) return;

    const step: HistoryStep = {
        base: ctxBase.getImageData(0,0, A4_WIDTH, A4_HEIGHT),
        highlight: ctxHigh.getImageData(0,0, A4_WIDTH, A4_HEIGHT),
        pen: ctxPen.getImageData(0,0, A4_WIDTH, A4_HEIGHT),
    };

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(step);
    if (newHistory.length > 10) newHistory.shift(); 
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const prevStep = historyStep - 1;
    const ctxBase = canvasBaseRef.current?.getContext('2d');
    const ctxHigh = canvasHighlightRef.current?.getContext('2d');
    const ctxPen = canvasPenRef.current?.getContext('2d');
    if (ctxBase && ctxHigh && ctxPen && history[prevStep]) {
        ctxBase.putImageData(history[prevStep].base, 0, 0);
        ctxHigh.putImageData(history[prevStep].highlight, 0, 0);
        ctxPen.putImageData(history[prevStep].pen, 0, 0);
        setHistoryStep(prevStep);
        setHasChanges(true);
    }
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const nextStep = historyStep + 1;
    const ctxBase = canvasBaseRef.current?.getContext('2d');
    const ctxHigh = canvasHighlightRef.current?.getContext('2d');
    const ctxPen = canvasPenRef.current?.getContext('2d');
    if (ctxBase && ctxHigh && ctxPen && history[nextStep]) {
        ctxBase.putImageData(history[nextStep].base, 0, 0);
        ctxHigh.putImageData(history[nextStep].highlight, 0, 0);
        ctxPen.putImageData(history[nextStep].pen, 0, 0);
        setHistoryStep(nextStep);
        setHasChanges(true);
    }
  };

  const clearAll = () => {
    if(!confirm("Apagar tudo?")) return;
    [canvasBaseRef, canvasHighlightRef, canvasPenRef].forEach(ref => {
        const ctx = ref.current?.getContext('2d');
        if(ctx) { 
            ctx.clearRect(0,0,A4_WIDTH, A4_HEIGHT); 
            if(ref === canvasBaseRef) { ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,A4_WIDTH, A4_HEIGHT); }
        }
    });
    setTexts([]); setImages([]); saveHistoryState(); setHasChanges(true);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const { x, y } = getCoordinates(e);
    if (isDrawing) return;

    if (tool === 'image' && pendingImage) {
        const newId = Date.now().toString();
        setImages([...images, { id: newId, x: x - 75, y: y - 75, src: pendingImage, width: 150, height: 150 }]);
        setPendingImage(null); setTool('pen'); setHasChanges(true);
        return;
    }

    if (tool === 'text') {
        const newId = Date.now().toString();
        setTexts([...texts, { 
            id: newId, x, y, text: '', color: color, fontSize: fontSize, 
            align: textAlign, width: 200, height: 50,
            borderColor: textBorder !== 'transparent' ? textBorder : undefined,
            backgroundColor: textBg !== 'transparent' ? textBg : undefined
        }]);
        setEditingTextId(newId); 
        setHasChanges(true);
    }
  };

  const applyTextStyle = (updates: Partial<TextObject>) => {
      if (editingTextId) {
          setTexts(texts.map(t => t.id === editingTextId ? { ...t, ...updates } : t));
          setHasChanges(true);
      } else {
          // Atualiza estado global se não houver texto selecionado
          if(updates.color) setColor(updates.color);
          if(updates.fontSize) setFontSize(updates.fontSize);
          if(updates.align) setTextAlign(updates.align);
          if(updates.backgroundColor) setTextBg(updates.backgroundColor);
          if(updates.borderColor) setTextBorder(updates.borderColor);
      }
  };

  // Funções helper para botões de +/-
  const increaseFontSize = () => {
    const newSize = Math.min(72, fontSize + 2);
    setFontSize(newSize);
    applyTextStyle({ fontSize: newSize });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(8, fontSize - 2);
    setFontSize(newSize);
    applyTextStyle({ fontSize: newSize });
  };

  const updateText = (id: string, updates: Partial<TextObject>) => {
    setTexts(texts.map(t => t.id === id ? { ...t, ...updates } : t));
    setHasChanges(true);
  };
  const deleteText = (id: string) => { setTexts(texts.filter(t => t.id !== id)); setHasChanges(true); };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => { if (typeof event.target?.result === 'string') { setPendingImage(event.target.result); setTool('image'); } };
      reader.readAsDataURL(file); e.target.value = ''; 
  };
  
  const deleteImage = (id: string) => { setImages(images.filter(img => img.id !== id)); setHasChanges(true); };

  const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'anotacao';
  const downloadJpg = async () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = A4_WIDTH; tempCanvas.height = A4_HEIGHT;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(canvasBaseRef.current!, 0, 0);
    ctx.drawImage(canvasHighlightRef.current!, 0, 0);
    ctx.drawImage(canvasPenRef.current!, 0, 0);

    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => { const img = new Image(); img.src = src; img.onload = () => resolve(img); });
    for (const imgObj of images) {
        const imgEl = await loadImage(imgObj.src);
        ctx.drawImage(imgEl, imgObj.x, imgObj.y, imgObj.width, imgObj.height);
    }
      
    texts.forEach(textObj => {
      if (textObj.backgroundColor) { ctx.fillStyle = textObj.backgroundColor; ctx.fillRect(textObj.x, textObj.y, textObj.width, textObj.height); }
      if (textObj.borderColor) { ctx.strokeStyle = textObj.borderColor; ctx.lineWidth = 2; ctx.strokeRect(textObj.x, textObj.y, textObj.width, textObj.height); }
      ctx.font = `bold ${textObj.fontSize}px sans-serif`;
      ctx.fillStyle = textObj.color;
      ctx.textAlign = textObj.align;
      ctx.textBaseline = 'top';
      const lines = textObj.text.split('\n');
      const lineHeight = textObj.fontSize * 1.2;
      let drawX = textObj.x;
      if (textObj.align === 'center') drawX += textObj.width / 2;
      if (textObj.align === 'right') drawX += textObj.width;
      lines.forEach((line, i) => { ctx.fillText(line, drawX, textObj.y + (i * lineHeight)); }); 
    });

    const link = document.createElement('a');
    link.download = `${sanitizeFilename(pageTitle)}.jpg`;
    link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center bg-eden-950/50 p-3 rounded-xl border border-eden-700 shrink-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-eden-900 rounded-lg border border-eden-700 p-1 shrink-0">
                  <button onClick={() => { if(!hasChanges || confirm("Mudanças não salvas serão perdidas.")) setActivePage(Math.max(0, activePage - 1)); }} disabled={activePage === 0} className="p-1 hover:bg-eden-700 rounded disabled:opacity-30"><ChevronLeft size={18}/></button>
                  <span className="px-2 font-mono font-bold text-eden-100 text-sm">{activePage + 1}/{MAX_PAGES}</span>
                  <button onClick={() => { if(!hasChanges || confirm("Mudanças não salvas serão perdidas.")) setActivePage(Math.min(MAX_PAGES - 1, activePage + 1)); }} disabled={activePage === MAX_PAGES - 1} className="p-1 hover:bg-eden-700 rounded disabled:opacity-30"><ChevronRight size={18}/></button>
              </div>
              <input value={pageTitle} onChange={(e) => { setPageTitle(e.target.value); setHasChanges(true); }} className="bg-transparent border-b border-eden-700 focus:border-energia outline-none text-eden-100 font-bold px-2 py-1 w-full md:w-64 placeholder-eden-100/30 text-sm" placeholder="Título da Anotação" style={{ colorScheme: 'dark' }} />
          </div>
          {hasChanges && <button onClick={saveCurrentPage} className="bg-energia hover:bg-yellow-400 text-eden-900 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 shadow-lg animate-pulse w-full md:w-auto justify-center"><Save size={14}/> SALVAR</button>}
      </div>

      {/* TOOLBAR PRINCIPAL */}
      <div className="bg-eden-800 border border-eden-700 p-2 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-lg sticky top-0 z-20 shrink-0">
          
          <div className="flex w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0 custom-scrollbar mask-right">
              {/* Ferramentas Básicas */}
              <div className="flex gap-1 bg-eden-900/50 p-1 rounded-lg border border-eden-700 shrink-0">
                  <button onClick={() => setTool('pen')} className={`p-1.5 md:p-2 rounded ${tool === 'pen' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Caneta"><Pen size={16}/></button>
                  <button onClick={() => setTool('highlighter')} className={`p-1.5 md:p-2 rounded ${tool === 'highlighter' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Marca-Texto"><Highlighter size={16}/></button>
                  <button onClick={() => setTool('bucket')} className={`p-1.5 md:p-2 rounded ${tool === 'bucket' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Balde"><PaintBucket size={16}/></button>
                  <button onClick={() => setTool('eraser')} className={`p-1.5 md:p-2 rounded ${tool === 'eraser' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Borracha"><Eraser size={16}/></button>
                  <div className="w-px bg-eden-700 mx-1"></div>
                  <button onClick={() => setTool('text')} className={`p-1.5 md:p-2 rounded ${tool === 'text' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Texto"><Type size={16}/></button>
                  <button onClick={() => fileInputRef.current?.click()} className={`p-1.5 md:p-2 rounded ${tool === 'image' ? 'bg-eden-100 text-eden-900 shadow' : 'text-eden-100/50 hover:text-white'}`} title="Adicionar Imagem"><ImageIcon size={16}/></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              {/* Cores e Tamanhos */}
              <div className="flex gap-3 items-center shrink-0">
                  <ColorPalette selectedColor={color} onSelect={(c) => { setColor(c); if(editingTextId && tool === 'text') applyTextStyle({ color: c }); }} label="Cor" />
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-eden-100/40 ml-1">Tamanho</span>
                      <div className="flex items-center gap-2 bg-eden-900/80 p-1 rounded-lg border border-eden-700/50">
                          <button onClick={() => setBrushSize(Math.max(1, brushSize - 1))} className="hover:text-white text-eden-100/50 p-1"><Minus size={12}/></button>
                          <span className="text-xs font-mono w-4 text-center text-eden-100">{brushSize}</span>
                          <button onClick={() => setBrushSize(Math.min(50, brushSize + 1))} className="hover:text-white text-eden-100/50 p-1"><Plus size={12}/></button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Ações Globais */}
          <div className="flex gap-1 w-full md:w-auto justify-end border-t md:border-t-0 border-eden-700 pt-2 md:pt-0">
              <button onClick={undo} className="p-1.5 md:p-2 bg-eden-900 hover:bg-eden-700 rounded text-eden-100 border border-eden-700" title="Desfazer"><Undo size={16}/></button>
              <button onClick={redo} className="p-1.5 md:p-2 bg-eden-900 hover:bg-eden-700 rounded text-eden-100 border border-eden-700" title="Refazer"><Redo size={16}/></button>
              <button onClick={clearAll} className="p-1.5 md:p-2 bg-eden-900 hover:bg-red-900/50 text-red-400 border border-eden-700 rounded" title="Limpar"><Trash2 size={16}/></button>
              <div className="w-px bg-eden-700 mx-1"></div>
              <button onClick={downloadJpg} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-energia text-eden-900 font-bold rounded hover:bg-yellow-400 text-xs"><Download size={14}/> <span className="hidden md:inline">Baixar</span></button>
          </div>
      </div>

      {/* TOOLBAR SECUNDÁRIA (TEXTO) */}
      {(tool === 'text' || editingTextId) && (
          <div className="bg-eden-900/90 border border-eden-600 p-2 rounded-xl flex flex-wrap gap-4 items-center shadow-xl sticky top-[80px] z-20 animate-in slide-in-from-top-2 min-h-[50px] overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => applyTextStyle({ align: 'left' })} className={`p-1.5 rounded ${textAlign === 'left' ? 'bg-eden-700 text-white' : 'text-eden-100/50'}`}><AlignLeft size={14}/></button>
                  <button onClick={() => applyTextStyle({ align: 'center' })} className={`p-1.5 rounded ${textAlign === 'center' ? 'bg-eden-700 text-white' : 'text-eden-100/50'}`}><AlignCenter size={14}/></button>
                  <button onClick={() => applyTextStyle({ align: 'right' })} className={`p-1.5 rounded ${textAlign === 'right' ? 'bg-eden-700 text-white' : 'text-eden-100/50'}`}><AlignRight size={14}/></button>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                    <button onClick={decreaseFontSize} className="hover:text-white text-eden-100/50 p-1"><Minus size={12}/></button>
                    <span className="text-xs font-mono w-8 text-center font-bold">{fontSize}px</span>
                    <button onClick={increaseFontSize} className="hover:text-white text-eden-100/50 p-1"><Plus size={12}/></button>
              </div>

              <div className="w-px bg-eden-700 h-6 shrink-0"></div>
              
              <div className="flex gap-4 shrink-0">
                <ColorPalette selectedColor={textBg} onSelect={(c) => { setTextBg(c); applyTextStyle({ backgroundColor: c }); }} label="Fundo" allowTransparent />
                <ColorPalette selectedColor={textBorder} onSelect={(c) => { setTextBorder(c); applyTextStyle({ borderColor: c }); }} label="Borda" allowTransparent />
              </div>
          </div>
      )}

      {/* ÁREA DE TRABALHO (Scrollável) */}
      <div className="flex-1 overflow-auto bg-eden-950 rounded-xl border border-eden-700 relative flex justify-center p-4 md:p-8 custom-scrollbar shadow-inner cursor-grab active:cursor-grabbing min-h-[500px]">
          <div ref={containerRef} className={`relative shadow-2xl bg-white transition-cursor ${tool === 'image' ? 'cursor-copy' : tool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`} style={{ width: A4_WIDTH, height: A4_HEIGHT, minWidth: A4_WIDTH, minHeight: A4_HEIGHT }}>
              
              {/* 1. BASE (Balde) */}
              <canvas ref={canvasBaseRef} width={A4_WIDTH} height={A4_HEIGHT} className="absolute inset-0 z-0" />
              
              {/* 2. HIGHLIGHTER */}
              <canvas ref={canvasHighlightRef} width={A4_WIDTH} height={A4_HEIGHT} className="absolute inset-0 z-1 pointer-events-none" />

              {/* 3. PEN */}
              <canvas 
                ref={canvasPenRef} 
                width={A4_WIDTH} 
                height={A4_HEIGHT} 
                className="absolute inset-0 z-2 touch-none"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                onClick={handleCanvasClick}
              />
              
              {/* 4. IMAGENS */}
              {images.map(img => (
                  <div 
                    key={img.id} 
                    style={{ position: 'absolute', left: img.x, top: img.y, width: img.width, height: img.height, zIndex: 5 }} 
                    className={`group border-2 border-transparent hover:border-eden-600 select-none ${resizingId?.id === img.id ? 'cursor-nwse-resize' : 'cursor-move'}`}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingId({ type: 'image', id: img.id, startX: e.clientX, startY: e.clientY, initialObjX: img.x, initialObjY: img.y });
                    }}
                  >
                      <button 
                        onMouseDown={(e) => e.stopPropagation()} 
                        onClick={() => deleteImage(img.id)} 
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 z-10 transition-opacity shadow-sm"
                      >
                        <X size={12}/>
                      </button>
                      
                      <img src={img.src} className="w-full h-full object-fill pointer-events-none select-none" draggable={false} />
                      
                      <div 
                        className="absolute bottom-0 right-0 w-6 h-6 bg-energia cursor-nwse-resize rounded-tl opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center touch-none"
                        onMouseDown={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            setResizingId({ id: img.id, startX: e.clientX, startY: e.clientY, startW: img.width, startH: img.height });
                        }}
                      >
                        <Maximize2 size={12} className="text-eden-900 rotate-90"/>
                      </div>
                  </div>
              ))}

              {/* 5. TEXTOS */}
              {texts.map(t => (
                  <div key={t.id} style={{ position: 'absolute', left: t.x, top: t.y, zIndex: 10, width: 'fit-content', backgroundColor: t.backgroundColor || 'transparent', border: t.borderColor && t.borderColor !== 'transparent' ? `2px solid ${t.borderColor}` : '2px solid transparent' }} className={`group rounded p-1 ${editingTextId === t.id ? 'ring-1 ring-energia' : 'hover:ring-1 hover:ring-blue-400'}`} onMouseDown={(e) => { if (e.target === e.currentTarget) setDraggingId({ type: 'text', id: t.id, startX: e.clientX, startY: e.clientY, initialObjX: t.x, initialObjY: t.y }); }}>
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 cursor-move z-20" onMouseDown={(e) => setDraggingId({ type: 'text', id: t.id, startX: e.clientX, startY: e.clientY, initialObjX: t.x, initialObjY: t.y })}><Move size={12}/></div>
                      <button onClick={() => deleteText(t.id)} className="absolute -top-4 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"><X size={12}/></button>
                      <textarea 
                        value={t.text}
                        onFocus={() => { setEditingTextId(t.id); setTool('text'); }}
                        onChange={(e) => { setTexts(texts.map(tx => tx.id === t.id ? { ...tx, text: e.target.value } : tx)); setHasChanges(true); }}
                        onMouseUp={(e) => { const tget = e.currentTarget; updateText(t.id, { width: tget.offsetWidth, height: tget.offsetHeight }); }}
                        placeholder="Digite..."
                        className="bg-transparent border-none outline-none resize overflow-hidden min-h-[30px] cursor-text block"
                        style={{ color: t.color, fontSize: `${t.fontSize}px`, textAlign: t.align, fontFamily: 'sans-serif', fontWeight: 'bold', lineHeight: '1.2', width: t.width > 0 ? `${t.width}px` : '200px', height: t.height > 0 ? `${t.height}px` : 'auto' }}
                        autoFocus={editingTextId === t.id}
                      />
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}