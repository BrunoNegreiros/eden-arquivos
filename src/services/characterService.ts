import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { CharacterSheet } from '../types/characterSchema';

const CLASS_STATS = {
  combatente: { pv: 20, pe: 2, san: 12 },
  especialista: { pv: 16, pe: 3, san: 16 },
  ocultista: { pv: 12, pe: 4, san: 20 },
  mundano: { pv: 8, pe: 1, san: 8 }
};

const sanitizeObject = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};


export const saveCharacter = async (characterData: CharacterSheet, mesaId: string) => {
  try {
    const cls = characterData.personal.class || 'mundano';
    const stats = CLASS_STATS[cls as keyof typeof CLASS_STATS] || CLASS_STATS['mundano'];
    
    const vig = characterData.attributes.initial.VIG;
    const pre = characterData.attributes.initial.PRE;

    const startPV = stats.pv + vig;
    const startPE = stats.pe + pre;
    const startSAN = stats.san;

    const cleanCharacterData = sanitizeObject(characterData);

    const finalData = {
      ...cleanCharacterData,
      status: {
        ...cleanCharacterData.status,
        pv: { current: startPV, temp: 0 },
        pe: { current: startPE, temp: 0 },
        san: { current: startSAN, temp: 0 },
        sustainedIds: cleanCharacterData.status.sustainedIds || [],
        dyingRounds: 0,
        isDying: false
      },
      createdAt: Date.now(), 
      updatedAt: Date.now(),
      userId: auth.currentUser?.uid || 'guest_user',
      ownerEmail: auth.currentUser?.email || 'convidado',
      mesaId: mesaId 
    };

    const docRef = await addDoc(collection(db, 'characters'), finalData);
    console.log("Ficha salva com ID: ", docRef.id);
    return docRef.id;

  } catch (error) {
    console.error("Erro fatal ao salvar a ficha: ", error);
    throw error;
  }
};