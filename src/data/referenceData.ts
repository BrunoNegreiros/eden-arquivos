import type { Effect, Formula } from '../types/systemData';


export interface Rank {
  name: string;
  minPP: number;
  credit: string;
  limit: { I: number, II: number, III: number, IV: number };
}

export const RANKS: Rank[] = [
  { name: 'Recruta', minPP: 0, credit: 'Baixo', limit: { I: 2, II: 0, III: 0, IV: 0 } },
  { name: 'Operador', minPP: 20, credit: 'Médio', limit: { I: 3, II: 1, III: 0, IV: 0 } },
  { name: 'Agente Especial', minPP: 50, credit: 'Médio', limit: { I: 3, II: 2, III: 1, IV: 0 } },
  { name: 'Oficial de Operações', minPP: 100, credit: 'Alto', limit: { I: 3, II: 3, III: 2, IV: 1 } },
  { name: 'Agente de Elite', minPP: 200, credit: 'Ilimitado', limit: { I: 3, II: 3, III: 3, IV: 2 } },
];


export const SKILL_LIST = [
  'Acrobacia', 'Adestramento', 'Artes', 'Atletismo', 'Atualidades', 
  'Ciências', 'Crime', 'Diplomacia', 'Enganação', 'Fortitude', 
  'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação', 
  'Luta', 'Medicina', 'Ocultismo', 'Percepção', 'Pilotagem', 
  'Pontaria', 'Profissão', 'Reflexos', 'Religião', 'Sobrevivência', 
  'Tática', 'Tecnologia', 'Vontade'
];


export const DAMAGE_TYPES_INFO = [
    { id: 'balistico', name: 'Balístico' }, { id: 'corte', name: 'Corte' },
    { id: 'impacto', name: 'Impacto' }, { id: 'perfuracao', name: 'Perfuração' },
    { id: 'fogo', name: 'Fogo' }, { id: 'frio', name: 'Frio' },
    { id: 'eletricidade', name: 'Eletricidade' }, { id: 'quimico', name: 'Químico' },
    { id: 'conhecimento', name: 'Conhecimento' }, { id: 'sangue', name: 'Sangue' },
    { id: 'morte', name: 'Morte' }, { id: 'energia', name: 'Energia' },
    { id: 'medo', name: 'Medo' }, { id: 'mental', name: 'Mental' }, { id: 'paranormal', name: 'Paranormal' }
];




const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const fFixed = (val: number): Formula => ({ terms: [{ id: generateId(), type: 'fixed', value: val }], operations: [] });

const fSub1d6 = (): Formula => ({ terms: [{ id: generateId(), type: 'fixed', value: 0 }, { id: generateId(), type: 'dice', value: 1, diceFace: 6 }], operations: ['subtracao'] });

const effDefesa = (val: number): Effect => ({ id: generateId(), name: `Defesa ${val}`, category: 'add_fixed', targets: [{ id: generateId(), type: 'defense' }], value: fFixed(val), isActive: true });
const effDice = (type: 'test_skill' | 'test_attribute' | 'test_attack', targetValue: string, val: number): Effect => ({
  id: generateId(), name: `Penalidade de Dados`, category: 'change_dice',
  targets: [{ id: generateId(), type, ...(type === 'test_skill' ? { skill: targetValue } : {}), ...(type === 'test_attribute' ? { attribute: targetValue as any } : {}), ...(type === 'test_attack' ? { weaponFilter: 'all' } : {}) }],
  value: fFixed(val), isActive: true
});
const effRD = (val: number): Effect => ({
  id: generateId(), name: `Resistência a Dano Físico ${val}`, category: 'add_resistance',
  targets: [ { id: generateId(), type: 'dr', damageType: 'balistico' }, { id: generateId(), type: 'dr', damageType: 'corte' }, { id: generateId(), type: 'dr', damageType: 'impacto' }, { id: generateId(), type: 'dr', damageType: 'perfuracao' } ],
  value: fFixed(val), isActive: true
});
const effManual = (desc: string): Effect => ({ id: generateId(), name: 'Regra da Condição', category: 'manual', targets: [], value: fFixed(0), textDescription: desc, isActive: true });
const effDano = (): Effect => ({ id: generateId(), name: 'Dano de Sangramento (Turno)', category: 'instant_heal_damage', targets: [{ id: generateId(), type: 'pv_current' }], value: fSub1d6(), isActive: true });


export const CONDITIONS_LIST = [
  { name: 'Agarrado', description: 'Desprevenido (-5 Defesa) e Imóvel (Deslocamento 0m). Sofre -1d20 em testes de ataque.', effects: [effDefesa(-5), effDice('test_attack', '', -1), effManual('Deslocamento reduzido a 0 metros. O personagem não pode se mover.')] },
  { name: 'Abalado', description: '-1d20 em testes de Vontade.', effects: [effDice('test_skill', 'Vontade', -1)] },
  { name: 'Alquebrado', description: '-2d20 em testes de Vontade.', effects: [effDice('test_skill', 'Vontade', -2)] },
  { name: 'Apavorado', description: '-3d20 em testes de Vontade.', effects: [effDice('test_skill', 'Vontade', -3)] },
  { name: 'Alucinado', description: '-4d20 em testes de Vontade.', effects: [effDice('test_skill', 'Vontade', -4)] },
  { name: 'Atordoado', description: 'Não pode fazer ações.', effects: [effManual('O personagem não pode realizar ações Padrão ou de Movimento.')] },
  { name: 'Cego', description: 'Desprevenido (-5 Defesa), -2d20 Iniciativa, falha testes Percepção visão.', effects: [effDefesa(-5), effDice('test_skill', 'Iniciativa', -2), effManual('Falha automaticamente em testes de Percepção baseados em visão. Rolagens de ataque têm 50% de chance de erro.')] },
  { name: 'Confuso', description: 'Comporta-se de forma aleatória.', effects: [effManual('Comporta-se de forma aleatória. Role 1d6 no início do turno para determinar a ação (1: Move-se em direção aleatória, 2-3: Não faz nada, 4-5: Ataca a criatura mais próxima, 6: Age normalmente).')] },
  { name: 'Debilitado', description: '-2d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -2), effDice('test_attribute', 'AGI', -2), effDice('test_attribute', 'VIG', -2)] },
  { name: 'Desprevenido', description: '-5 Defesa e -2d20 Reflexos.', effects: [effDefesa(-5), effDice('test_skill', 'Reflexos', -2)] },
  { name: 'Doente', description: '-1d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -1), effDice('test_attribute', 'AGI', -1), effDice('test_attribute', 'VIG', -1)] },
  { name: 'Enjoado', description: '-2d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -2), effDice('test_attribute', 'AGI', -2), effDice('test_attribute', 'VIG', -2)] },
  { name: 'Enlouquecendo', description: '0 SAN.', effects: [effManual('Com 0 de Sanidade. O personagem está perdendo o controle e pode sofrer consequências graves se não for acalmado por um aliado.')] },
  { name: 'Enredado', description: '-1d20 ataque, -2d20 Reflexos, metade deslocamento.', effects: [effDice('test_attack', '', -1), effDice('test_skill', 'Reflexos', -2), effManual('Deslocamento reduzido à metade. Não pode correr ou fazer investidas.')] },
  { name: 'Escondido', description: 'Desprevenido contra ataques corporais.', effects: [effManual('Recebe bônus em testes de Furtividade. Alvos de seus ataques ficam Desprevenidos contra você.')] },
  { name: 'Exausto', description: '-3d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -3), effDice('test_attribute', 'AGI', -3), effDice('test_attribute', 'VIG', -3), effManual('Deslocamento reduzido à metade. Não pode correr ou fazer investidas.')] },
  { name: 'Fascinado', description: '-2d20 Percepção e Iniciativa.', effects: [effDice('test_skill', 'Percepção', -2), effDice('test_skill', 'Iniciativa', -2), effManual('Atenção voltada inteiramente para o efeito fascinante. Qualquer ação hostil contra o personagem anula esta condição.')] },
  { name: 'Fatigado', description: '-1d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -1), effDice('test_attribute', 'AGI', -1), effDice('test_attribute', 'VIG', -1), effManual('Não pode correr ou fazer investidas.')] },
  { name: 'Fraco', description: '-1d20 em FOR, AGI, VIG.', effects: [effDice('test_attribute', 'FOR', -1), effDice('test_attribute', 'AGI', -1), effDice('test_attribute', 'VIG', -1)] },
  { name: 'Frustrado', description: '-1d20 em INT e PRE.', effects: [effDice('test_attribute', 'INT', -1), effDice('test_attribute', 'PRE', -1)] },
  { name: 'Imóvel', description: 'Deslocamento 0m.', effects: [effManual('Deslocamento reduzido a 0 metros. O personagem não pode sair do lugar.')] },
  { name: 'Inconsciente', description: 'Indefeso, não age.', effects: [effDefesa(-10), effManual('O personagem está desmaiado e não pode realizar nenhuma ação (Condição: Indefeso).')] },
  { name: 'Indefeso', description: '-10 Defesa, falha em Reflexos.', effects: [effDefesa(-10), effManual('Falha automaticamente em todos os testes de Reflexos.')] },
  { name: 'Lento', description: 'Deslocamento metade. Não corre/investida.', effects: [effManual('Todas as formas de deslocamento são reduzidas à metade. Não pode correr ou fazer investidas.')] },
  { name: 'Machucado', description: 'Menos da metade dos PV totais.', effects: [effManual('O personagem está com menos da metade de seus Pontos de Vida máximos.')] },
  { name: 'Morrendo', description: '0 PV. 3 rodadas para morrer.', effects: [effManual('Com 0 Pontos de Vida. Faça um teste de Fortitude/Vigor no início de cada turno. Falhar em 3 testes de morte na mesma cena resulta em óbito.')] },
  { name: 'Ofuscado', description: '-1d20 ataque e Percepção.', effects: [effDice('test_attack', '', -1), effDice('test_skill', 'Percepção', -1)] },
  { name: 'Paralisado', description: 'Imóvel e Indefeso.', effects: [effDefesa(-10), effManual('Deslocamento reduzido a 0 metros. Falha automática em testes de Força e Agilidade/Reflexos. Só pode realizar ações puramente mentais.')] },
  { name: 'Pasmo', description: 'Não pode fazer ações.', effects: [effManual('O personagem não pode realizar ações de forma alguma.')] },
  { name: 'Petrificado', description: 'Inconsciente e RD 10.', effects: [effDefesa(-10), effRD(10), effManual('Inconsciente e transformado em pedra.')] },
  { name: 'Perturbado', description: 'Menos da metade da Sanidade total.', effects: [effManual('O personagem está com menos da metade de sua Sanidade máxima.')] },
  { name: 'Sangrando', description: 'Teste de Vigor (DT 20) no turno. Falha = perde 1d6 PV.', effects: [effDano(), effManual('No início do turno, faça um teste de Fortitude/Vigor (DT 20). Se passar, a condição é removida. Se falhar, clique em "APLICAR" no painel Efeitos Ocultos para sofrer 1d6 de dano e continue Sangrando.')] },
  { name: 'Surdo', description: 'Falha Percepção para ouvir, -2d20 Iniciativa.', effects: [effDice('test_skill', 'Iniciativa', -2), effManual('Falha automaticamente em testes de Percepção baseados em audição. Considerado em condição ruim para lançar rituais.')] },
  { name: 'Vulnerável', description: '-2 Defesa.', effects: [effDefesa(-2)] }
];