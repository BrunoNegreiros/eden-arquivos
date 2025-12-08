import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CharacterSheet } from '../types/characterSchema';

// Tabelas de PV/PE/SAN por Classe (NEX 5% Inicial)
const CLASS_STATS = {
  combatente: { pv: 20, pe: 2, san: 12, pvPerNex: 4, pePerNex: 2, sanPerNex: 3 },
  especialista: { pv: 16, pe: 3, san: 16, pvPerNex: 3, pePerNex: 3, sanPerNex: 4 },
  ocultista: { pv: 12, pe: 4, san: 20, pvPerNex: 2, pePerNex: 4, sanPerNex: 5 },
  mundano: { pv: 8, pe: 1, san: 8, pvPerNex: 0, pePerNex: 0, sanPerNex: 0 }
};

// Função auxiliar para remover campos undefined (Firestore odeia undefined)
const sanitizeObject = (obj: any): any => {
  // O JSON.stringify remove automaticamente chaves com valor undefined
  return JSON.parse(JSON.stringify(obj));
};

export const saveCharacter = async (characterData: CharacterSheet) => {
  try {
    // 1. Cálculos Finais de Status Base (NEX 5%)
    const cls = characterData.progression.class || 'mundano';
    // Fallback de segurança
    const stats = CLASS_STATS[cls as keyof typeof CLASS_STATS] || CLASS_STATS['mundano'];
    
    const vig = characterData.attributes.vig;
    const pre = characterData.attributes.pre;

    // Fórmulas do Livro Base para NEX 5%
    const maxPV = stats.pv + vig;
    const maxPE = stats.pe + pre;
    const maxSAN = stats.san;

    // 2. Limpeza dos dados (Remove undefined)
    const cleanCharacterData = sanitizeObject(characterData);

    // 3. Montagem do Objeto Final
    const finalData = {
      ...cleanCharacterData,
      status: {
        ...cleanCharacterData.status,
        pv: { ...cleanCharacterData.status.pv, max: maxPV, current: maxPV },
        pe: { ...cleanCharacterData.status.pe, max: maxPE, current: maxPE },
        san: { ...cleanCharacterData.status.san, max: maxSAN, current: maxSAN },
      },
      // Timestamps do servidor (não podem passar pelo sanitizeObject pois são objetos especiais)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: 'guest_user', 
    };

    // 4. Envio ao Firestore
    const docRef = await addDoc(collection(db, "characters"), finalData);
    console.log("Ficha salva com ID: ", docRef.id);
    return docRef.id;

  } catch (e) {
    console.error("ERRO CRÍTICO AO SALVAR: ", e);
    throw e; // Re-lança para o componente tratar
  }
};