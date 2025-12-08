import type { AttributeKey } from '../types/characterSchema';

export interface ClassPower {
  id: string;
  name: string;
  description: string;
  class: 'combatente' | 'especialista' | 'ocultista' | 'all';
  // Requisitos para validação
  req?: {
    attr?: Partial<Record<AttributeKey, number>>; // Ex: { for: 2 }
    skill?: string[]; // Ex: ['Luta', 'Pontaria'] (OU lógico: basta ter uma)
    nex?: number;
    power?: string; // ID de outro poder necessário
  };
  // Automação (Metadados para o futuro sistema de rolagem)
  effects?: {
    target: 'damage' | 'attack' | 'defense' | 'resistance' | 'skill' | 'action' | 'initiative' | 'load';
    value: number | string; // Ex: 2, "1d6"
    condition?: string; // Ex: "com armas de fogo", "desarmado"
  }[];
  needsSelection?: 'skills' | 'power'; // Se precisa abrir modal de escolha
}

export const CLASS_POWERS: ClassPower[] = [
  // === COMBATENTE ===
  { 
    id: 'armamento_pesado', name: 'Armamento Pesado', class: 'combatente', 
    description: 'Você recebe proficiência com armas pesadas.',
    req: { attr: { for: 2 } },
    effects: [{ target: 'action', value: 0, condition: 'Proficiência Pesada' }] 
  },
  { 
    id: 'artista_marcial_comb', name: 'Artista Marcial', class: 'combatente', 
    description: 'Seus ataques desarmados causam 1d6 pontos de dano, podem causar dano letal e contam como armas ágeis. Em NEX 35%, o dano aumenta para 1d8 e, em NEX 70%, para 1d10.',
    effects: [{ target: 'damage', value: '1d6', condition: 'Ataque Desarmado' }]
  },
  { 
    id: 'ataque_oportunidade', name: 'Ataque de Oportunidade', class: 'combatente', 
    description: 'Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, você pode gastar uma reação e 1 PE para fazer um ataque corpo a corpo contra ele.',
    effects: [{ target: 'action', value: 0, condition: 'Reação Extra (Oportunidade)' }]
  },
  { 
    id: 'combater_duas_armas', name: 'Combater com Duas Armas', class: 'combatente', 
    description: 'Se estiver empunhando duas armas (e pelo menos uma for leve) e fizer a ação agredir, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –1d20 em todos os testes de ataque até o seu próximo turno.',
    req: { attr: { agi: 3 }, skill: ['Luta', 'Pontaria'] },
    effects: [{ target: 'attack', value: 'Extra', condition: 'Ação Agredir (2 armas)' }]
  },
  { 
    id: 'combate_defensivo', name: 'Combate Defensivo', class: 'combatente', 
    description: 'Quando usa a ação agredir, você pode combater defensivamente. Se fizer isso, até seu próximo turno, sofre –1d20 em todos os testes de ataque, mas recebe +5 na Defesa.',
    req: { attr: { int: 2 } },
    effects: [{ target: 'defense', value: 5, condition: 'Ao combater defensivamente' }]
  },
  { 
    id: 'golpe_demolidor', name: 'Golpe Demolidor', class: 'combatente', 
    description: 'Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 1 PE para causar dois dados de dano extra do mesmo tipo de sua arma.',
    req: { attr: { for: 2 }, skill: ['Luta'] },
    effects: [{ target: 'damage', value: '2d', condition: 'Contra Objetos/Quebrar' }]
  },
  { 
    id: 'golpe_pesado', name: 'Golpe Pesado', class: 'combatente', 
    description: 'O dano de suas armas corpo a corpo aumenta em mais um dado do mesmo tipo.',
    effects: [{ target: 'damage', value: '1d', condition: 'Armas Corpo a Corpo' }]
  },
  { 
    id: 'incansavel', name: 'Incansável', class: 'combatente', 
    description: 'Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional, mas deve usar Força ou Agilidade como atributo-base do teste.' 
  },
  { 
    id: 'presteza_atletica', name: 'Presteza Atlética', class: 'combatente', 
    description: 'Quando faz um teste de facilitar a investigação, você pode gastar 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia. Se passar no teste, o próximo aliado que usar seu bônus também recebe +1d20 no teste.' 
  },
  { 
    id: 'protecao_pesada', name: 'Proteção Pesada', class: 'combatente', 
    description: 'Você recebe proficiência com Proteções Pesadas.',
    req: { nex: 30 },
    effects: [{ target: 'action', value: 0, condition: 'Proficiência Proteção Pesada' }]
  },
  { 
    id: 'reflexos_defensivos', name: 'Reflexos Defensivos', class: 'combatente', 
    description: 'Você recebe +2 em Defesa e em testes de resistência.',
    req: { attr: { agi: 2 } },
    effects: [
        { target: 'defense', value: 2 },
        { target: 'resistance', value: 2 }
    ]
  },
  { 
    id: 'saque_rapido', name: 'Saque Rápido', class: 'combatente', 
    description: 'Você pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, caso esteja usando a regra opcional de contagem de munição, uma vez por rodada pode recarregar uma arma de disparo como uma ação livre.',
    req: { skill: ['Iniciativa'] }
  },
  { 
    id: 'segurar_gatilho', name: 'Segurar o Gatilho', class: 'combatente', 
    description: 'Sempre que acerta um ataque com uma arma de fogo, pode fazer outro ataque com a mesma arma contra o mesmo alvo, pagando 2 PE por cada ataque já realizado no turno.',
    req: { nex: 60 },
    effects: [{ target: 'attack', value: 'Extra', condition: 'Ao acertar (Custo PE)' }]
  },
  { 
    id: 'sentido_tatico', name: 'Sentido Tático', class: 'combatente', 
    description: 'Você pode gastar uma ação de movimento e 2 PE para analisar o ambiente. Se fizer isso, recebe um bônus em Defesa e em testes de resistência igual ao seu Intelecto até o final da cena.',
    req: { attr: { int: 2 }, skill: ['Percepção', 'Tática'] } // Tática E Percepção (lógica complexa de req será simplificada no componente)
  },
  { 
    id: 'tanque_guerra', name: 'Tanque de Guerra', class: 'combatente', 
    description: 'Se estiver usando uma proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2.',
    req: { power: 'protecao_pesada' },
    effects: [
        { target: 'defense', value: 2, condition: 'Com Proteção Pesada' },
        { target: 'resistance', value: 2, condition: 'RD da Armadura' }
    ]
  },
  { 
    id: 'tiro_certeiro', name: 'Tiro Certeiro', class: 'combatente', 
    description: 'Se estiver usando uma arma de disparo, você soma sua Agilidade nas rolagens de dano e ignora a penalidade contra alvos envolvidos em combate corpo a corpo (mesmo se não usar a ação mirar).',
    req: { skill: ['Pontaria'] },
    effects: [{ target: 'damage', value: 'AGI', condition: 'Armas de Disparo/Fogo' }]
  },
  { 
    id: 'tiro_cobertura', name: 'Tiro de Cobertura', class: 'combatente', 
    description: 'Você pode gastar uma ação padrão e 1 PE para disparar uma arma de fogo na direção de um personagem no alcance da arma para forçá-lo a se proteger. Faça um teste de Pontaria contra a Vontade do alvo. Se vencer, até o início do seu próximo turno o alvo não pode sair do lugar onde está e sofre –5 em testes de ataque.' 
  },
  { 
    id: 'treinamento_pericia', name: 'Treinamento em Perícia', class: 'all', 
    description: 'Escolha duas perícias. Você se torna treinado nessas perícias. A partir de NEX 35%, pode escolher perícias para se tornar veterano. A partir de NEX 70%, para se tornar expert.',
    needsSelection: 'skills' // <--- GATILHO PARA O MODAL
  },
  
  // === SOBREVIVENDO AO HORROR (COMBATENTE) ===
  { id: 'caminho_forca', name: 'Caminho para Forca', class: 'combatente', description: 'Quando usa a ação sacrifício em uma cena de perseguição, pode gastar 1 PE para fornecer +1d20 extra nos testes dos outros. Em furtividade (chamar atenção), 1 PE diminui a visibilidade de aliados próximos em -2.' },
  { id: 'ciente_cicatrizes', name: 'Ciente das Cicatrizes', class: 'combatente', description: 'Quando faz um teste para encontrar uma pista relacionada a armas ou ferimentos, você pode usar Luta ou Pontaria no lugar da perícia original.', req: { skill: ['Luta', 'Pontaria'] } },
  { id: 'correria_desesperada', name: 'Correria Desesperada', class: 'combatente', description: 'Você recebe +3m em seu deslocamento e +1d20 em testes de perícia para fugir em uma perseguição.', effects: [{ target: 'action', value: 3, condition: 'Deslocamento' }] },
  { id: 'engolir_choro', name: 'Engolir o Choro', class: 'combatente', description: 'Você não sofre penalidades por condições em testes de perícia para fugir e em testes de Furtividade.' },
  { id: 'instinto_fuga', name: 'Instinto de Fuga', class: 'combatente', description: 'Quando uma cena de perseguição tem início, você recebe +2 em todos os testes de perícia que fizer durante a cena.', req: { skill: ['Intuição'] } },
  { id: 'mochileiro_comb', name: 'Mochileiro', class: 'combatente', description: 'Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de uma vestimenta adicional.', req: { attr: { vig: 2 } }, effects: [{ target: 'load', value: 5 }] },
  { id: 'apego_angustiado', name: 'Apego Angustiado', class: 'combatente', description: 'Você não fica inconsciente por estar morrendo, mas sempre que terminar uma rodada nesta condição e consciente, perde 2 pontos de Sanidade.' },
  { id: 'paranoia_defensiva', name: 'Paranoia Defensiva', class: 'combatente', description: 'Uma vez por cena, você pode gastar uma rodada e 3 PE. Se fizer isso, você e cada aliado presente escolhe entre receber +5 na Defesa contra o próximo ataque ou +5 em um teste de perícia até o fim da cena.' },
  { id: 'sacrificar_joelhos', name: 'Sacrificar os Joelhos', class: 'combatente', description: 'Uma vez por cena de perseguição, quando faz a ação esforço extra, você pode gastar 2 PE para passar automaticamente no teste.', req: { skill: ['Atletismo'] } },
  { id: 'sem_tempo', name: 'Sem Tempo, Irmão', class: 'combatente', description: 'Uma vez por cena de investigação, quando usa facilitar investigação, você passa automaticamente, mas faz uma rolagem adicional na tabela de eventos de investigação.' },
  { id: 'valentao', name: 'Valentão', class: 'combatente', description: 'Você pode usar Força no lugar de Presença para Intimidação. Uma vez por cena, pode gastar 1 PE para fazer um teste de Intimidação (assustar) como ação livre.' },

  // === ESPECIALISTA ===
  { 
    id: 'artista_marcial_esp', name: 'Artista Marcial', class: 'especialista', 
    description: 'Seus ataques desarmados causam 1d6 pontos de dano, podem causar dano letal e contam como armas ágeis. Em NEX 35%, o dano aumenta para 1d8 e, em NEX 70%, para 1d10.',
    effects: [{ target: 'damage', value: '1d6', condition: 'Ataque Desarmado' }]
  },
  { 
    id: 'balistica_avancada', name: 'Balística Avançada', class: 'especialista', 
    description: 'Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com armas de fogo.',
    effects: [{ target: 'damage', value: 2, condition: 'Armas de Fogo' }]
  },
  { 
    id: 'conhecimento_aplicado', name: 'Conhecimento Aplicado', class: 'especialista', 
    description: 'Quando faz um teste de perícia (exceto Luta e Pontaria), você pode gastar 2 PE para mudar o atributo-base da perícia para Int.',
    req: { attr: { int: 2 } }
  },
  { 
    id: 'hacker', name: 'Hacker', class: 'especialista', 
    description: 'Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo necessário para hackear qualquer sistema para uma ação completa.',
    req: { skill: ['Tecnologia'] },
    effects: [{ target: 'skill', value: 5, condition: 'Tecnologia (Invadir)' }]
  },
  { 
    id: 'maos_rapidas', name: 'Mãos Rápidas', class: 'especialista', 
    description: 'Ao fazer um teste de Crime, você pode pagar 1 PE para fazê-lo como uma ação livre.',
    req: { attr: { agi: 3 }, skill: ['Crime'] }
  },
  { 
    id: 'mochila_utilidades', name: 'Mochila de Utilidades', class: 'especialista', 
    description: 'Um item a sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos.',
    effects: [{ target: 'load', value: 'Otimização', condition: '1 Item' }]
  },
  { 
    id: 'movimento_tatico', name: 'Movimento Tático', class: 'especialista', 
    description: 'Você pode gastar 1 PE para ignorar a penalidade em deslocamento por terreno dif ícil e por escalar até o final do turno.',
    req: { skill: ['Atletismo'] }
  },
  { 
    id: 'na_trilha_certa', name: 'Na Trilha Certa', class: 'especialista', 
    description: 'Sempre que tiver sucesso em um teste para procurar pistas, você pode gastar 1 PE para receber +1d20 no próximo teste. Os custos e os bônus são cumulativos.' 
  },
  { 
    id: 'nerd', name: 'Nerd', class: 'especialista', 
    description: 'Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena.' 
  },
  { 
    id: 'ninja_urbano', name: 'Ninja Urbano', class: 'especialista', 
    description: 'Você recebe proficiência com armas táticas de ataque corpo a corpo e de disparo (exceto de fogo) e +2 em rolagens de dano com armas de corpo a corpo e de disparo.',
    effects: [{ target: 'damage', value: 2, condition: 'Corpo a corpo / Disparo' }]
  },
  { 
    id: 'pensamento_agil', name: 'Pensamento Ágil', class: 'especialista', 
    description: 'Uma vez por rodada, durante uma cena de investigação, você pode gastar 2 PE para fazer uma ação de procurar pistas adicional.' 
  },
  { 
    id: 'perito_explosivos', name: 'Perito em Explosivos', class: 'especialista', 
    description: 'Você soma seu Intelecto na DT para resistir aos seus explosivos e pode excluir dos efeitos da explosão um número de alvos igual ao seu valor de Intelecto.' 
  },
  { 
    id: 'primeira_impressao', name: 'Primeira Impressão', class: 'especialista', 
    description: 'Você recebe +2d20 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena.' 
  },
  
  // Especialista - Sobrevivendo ao Horror
  { id: 'esconderijo_desesperado', name: 'Esconderijo Desesperado', class: 'especialista', description: 'Você não sofre –1d20 em testes de Furtividade por se mover ao seu deslocamento normal. Em cenas de furtividade, sucesso reduz visibilidade em –2.' },
  { id: 'especialista_diletante', name: 'Especialista Diletante', class: 'especialista', description: 'Você aprende um poder que não pertença à sua classe (exceto poderes de trilha ou paranormais), à sua escolha. (Anote na ficha).', req: { nex: 30 } },
  { id: 'flashback', name: 'Flashback', class: 'especialista', description: 'Escolha uma origem que não seja a sua. Você recebe o poder dessa origem. (Anote na ficha).' },
  { id: 'leitura_fria', name: 'Leitura Fria', class: 'especialista', description: 'Em interlúdio, faça 3 perguntas a um NPC. Para cada não respondida, receba 2 PE temporários (missão).', req: { skill: ['Intuição'] } },
  { id: 'maos_firmes', name: 'Mãos Firmes', class: 'especialista', description: 'Quando faz um teste de Furtividade para esconder-se ou ação discreta manual, pode gastar 2 PE para receber +1d20.', req: { skill: ['Furtividade'] } },
  { id: 'acolher_terror', name: 'Acolher o Terror', class: 'especialista', description: 'Você pode se entregar para o medo uma vez por sessão de jogo adicional.' },
  { id: 'contatos_oportunos', name: 'Contatos Oportunos', class: 'especialista', description: 'Gaste ação de interlúdio para receber um Aliado até o fim da missão.', req: { skill: ['Crime'] } },
  { id: 'disfarce_sutil', name: 'Disfarce Sutil', class: 'especialista', description: 'Gaste 1 PE para se disfarçar como ação completa e sem kit (se usar kit, +5).', req: { attr: { pre: 2 }, skill: ['Enganação'] } },
  { id: 'plano_fuga', name: 'Plano de Fuga', class: 'especialista', description: 'Pode usar Intelecto no lugar de Força para criar obstáculos em perseguição. 1/cena: 2 PE para sucesso automático.' },
  { id: 'remoer_memorias', name: 'Remoer Memórias', class: 'especialista', description: '1/cena: Quando faz teste de Int ou Pre, gaste 2 PE para substituir por teste de Intelecto (DT 15).', req: { attr: { int: 1 } } },
  { id: 'resistir_pressao', name: 'Resistir à Pressão', class: 'especialista', description: '1/cena investigação: Gaste 5 PE. Aumenta urgência em 1 rodada, mas todos recebem +2 em testes nesta rodada.', req: { skill: ['Investigação'] } },

  // === OCULTISTA ===
  { 
    id: 'camuflar_ocultismo', name: 'Camuflar Ocultismo', class: 'ocultista', 
    description: 'Gaste ação livre para esconder sigilos. Gaste +2 PE para lançar ritual sem componentes/gestos (só concentração). Perceber exige Ocultismo DT 25.' 
  },
  { 
    id: 'criar_selo', name: 'Criar Selo', class: 'ocultista', 
    description: 'Pode fabricar selos paranormais em interlúdio. Limite de selos = Presença.' 
  },
  { 
    id: 'envolto_misterio', name: 'Envolto em Mistério', class: 'ocultista', 
    description: 'Recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Ocultismo.',
    effects: [{ target: 'skill', value: 5, condition: 'Contra não-ocultistas' }]
  },
  { 
    id: 'especialista_elemento', name: 'Especialista em Elemento', class: 'ocultista', 
    description: 'Escolha um elemento. A DT para resistir aos seus rituais desse elemento aumenta em +2.' 
  },
  { 
    id: 'ferramentas_paranormais', name: 'Ferramentas Paranormais', class: 'ocultista', 
    description: 'Reduz categoria de item paranormal em I. Pode ativar itens paranormais sem pagar custo em PE.' 
  },
  { 
    id: 'fluxo_poder', name: 'Fluxo de Poder', class: 'ocultista', 
    description: 'Pode manter dois efeitos sustentados ativos com apenas uma ação livre (paga custo separado).',
    req: { nex: 60 }
  },
  { 
    id: 'guiado_paranormal', name: 'Guiado pelo Paranormal', class: 'ocultista', 
    description: 'Uma vez por cena, pode gastar 2 PE para fazer uma ação de investigação adicional.' 
  },
  { 
    id: 'identificacao_paranormal', name: 'Identificação Paranormal', class: 'ocultista', 
    description: 'Recebe +10 em testes de Ocultismo para identificar criaturas, objetos ou rituais.',
    effects: [{ target: 'skill', value: 10, condition: 'Identificar Paranormal' }]
  },
  { 
    id: 'improvisar_componentes', name: 'Improvisar Componentes', class: 'ocultista', 
    description: '1/cena, ação completa Investigação DT 15: Encontra componentes de elemento à escolha.' 
  },
  { 
    id: 'intuicao_paranormal', name: 'Intuição Paranormal', class: 'ocultista', 
    description: 'Sempre que usa facilitar investigação, soma seu Intelecto ou Presença no teste.' 
  },
  { 
    id: 'mestre_elemento', name: 'Mestre em Elemento', class: 'ocultista', 
    description: 'Escolha um elemento (deve ter Especialista nele). Custo de rituais desse elemento diminui em -1 PE.',
    req: { nex: 45, power: 'especialista_elemento' }
  },
  { 
    id: 'ritual_potente', name: 'Ritual Potente', class: 'ocultista', 
    description: 'Soma seu Intelecto nas rolagens de dano ou cura de seus rituais.',
    req: { attr: { int: 2 } },
    effects: [{ target: 'damage', value: 'INT', condition: 'Dano de Ritual' }]
  },
  { 
    id: 'ritual_predileto', name: 'Ritual Predileto', class: 'ocultista', 
    description: 'Escolha um ritual conhecido. Reduz custo em -1 PE.' 
  },
  { 
    id: 'tatuagem_ritualistica', name: 'Tatuagem Ritualística', class: 'ocultista', 
    description: 'Reduz em -1 PE custo de rituais de alcance pessoal (alvo você).' 
  },
  
  // Ocultista - Sobrevivendo ao Horror
  { id: 'deixe_sussurros', name: 'Deixe os Sussurros Guiarem', class: 'ocultista', description: '1/cena: 2 PE e 1 rodada para +2 em investigação (cena). Falha em teste tira 1 Sanidade.' },
  { id: 'dominio_esoterico', name: 'Domínio Esotérico', class: 'ocultista', description: 'Pode combinar efeitos de até dois catalisadores ritualísticos no mesmo ritual.', req: { attr: { int: 3 } } },
  { id: 'estalos_macabros', name: 'Estalos Macabros', class: 'ocultista', description: 'Ao Distrair ou Fintar: Gaste 1 PE para usar Ocultismo. Se alvo pessoa/animal: +5 no teste.' },
  { id: 'minha_dor', name: 'Minha Dor me Impulsiona', class: 'ocultista', description: 'Se machucado (5+ dano): Gaste 1 PE para +1d6 em Acrobacia, Atletismo ou Furtividade.', req: { attr: { vig: 2 } } },
  { id: 'olhos_monstro', name: 'Nos Olhos do Monstro', class: 'ocultista', description: 'Cena com criatura: Gaste 1 rodada e 3 PE encarando. +5 testes contra ela (exceto ataque) até fim da cena.' },
  { id: 'olhar_sinistro', name: 'Olhar Sinistro', class: 'ocultista', description: 'Usa Presença em Ocultismo. Pode usar Ocultismo para coagir (Intimidação).', req: { attr: { pre: 1 } } },
  { id: 'sentido_premonitorio', name: 'Sentido Premonitório', class: 'ocultista', description: '3 PE ativar, 1 PE/rodada. Sabe fim urgência, eventos futuros (1 rodada) e ações de inimigos em perseguição/furtividade.' },
  { id: 'sincronia_paranormal', name: 'Sincronia Paranormal', class: 'ocultista', description: 'Padrão + 2 PE. Conecta com aliados sobreviventes. 1 PE/rodada. Distribui bônus d20 igual a Presença entre aliados para Int/Pre.', req: { attr: { pre: 2 } } },
  { id: 'tracado_conjuratorio', name: 'Traçado Conjuratório', class: 'ocultista', description: '1 PE e Completa: Desenha símbolo 1,5m. Dentro: +2 Ocultismo/Resistência e +2 DT rituais. Dura cena.' }
];