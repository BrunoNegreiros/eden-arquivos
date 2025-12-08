import type { ItemEffect } from '../types/characterSchema';

// --- PATENTES ---
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

// --- EQUIPAMENTOS ---
export interface ItemBase {
  id: string;
  name: string;
  category: number;
  space: number;
  type: string;
  subType?: string;
  details: string;
  damage?: string;
}

// (Mantendo a lista de equipamentos que já estava correta e completa nas etapas anteriores)
export const EQUIPMENT_LIST: ItemBase[] = [
  // ARMAS SIMPLES
  { id: 'faca', name: 'Faca', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d4 Corte', details: 'Uma lâmina afiada, como uma navalha, uma faca de churrasco ou uma faca militar. É uma arma ágil e pode ser arremessada.' },
  { id: 'martelo', name: 'Martelo', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Impacto', details: 'Esta ferramenta comum pode ser usada como arma na falta de opções melhores.' },
  { id: 'punhal', name: 'Punhal', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d4 Perfuração', details: 'Uma faca de lâmina longa e pontiaguda, usada por cultistas em seus rituais. É uma arma ágil.' },
  { id: 'bastao', name: 'Bastão', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6/1d8 Impacto', details: 'Um cilindro de madeira maciça. Pode ser um taco de beisebol, um cacetete da polícia, uma tonfa ou apenas uma clava envolta em pregos ou arame farpado. Você pode empunhar um bastão com uma mão (dano 1d6) ou com as duas (dano 1d8).' },
  { id: 'machete', name: 'Machete', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Corte', details: 'Uma lâmina longa e larga, muito usada como ferramenta para abrir trilhas.' },
  { id: 'lanca', name: 'Lança', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Perfuração', details: 'Uma haste de madeira com uma ponta metálica afiada, a lança é uma arma arcaica, mas usada ainda hoje por artistas marciais. Pode ser arremessada.' },
  { id: 'cajado', name: 'Cajado', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Impacto', details: 'Um cabo de madeira ou barra de ferro longos. Inclui o bo usado em artes marciais. É uma arma ágil. Além disso, pode ser usado com Combater com Duas Armas (e poderes similares) para fazer ataques adicionais, como se fosse uma arma de uma mão e uma arma leve.' },
  { id: 'arco', name: 'Arco', category: 0, space: 2, type: 'weapon', subType: 'ranged', damage: '1d6 Perfuração', details: 'Um arco e flecha comum, próprio para tiro ao alvo.' },
  { id: 'besta', name: 'Besta', category: 0, space: 2, type: 'weapon', subType: 'ranged', damage: '1d8 Perfuração', details: 'Esta arma da antiguidade exige uma ação de movimento para ser recarregada a cada disparo.' },
  { id: 'pistola', name: 'Pistola', category: 1, space: 1, type: 'weapon', subType: 'firearm', damage: '1d12 Balístico', details: 'Uma arma de mão comum entre policiais e militares por ser facilmente recarregável.' },
  { id: 'revolver', name: 'Revólver', category: 0, space: 1, type: 'weapon', subType: 'firearm', damage: '2d6 Balístico', details: 'A arma de fogo mais comum, e uma das mais confiáveis.' },
  { id: 'fuzil_caca', name: 'Fuzil de Caça', category: 1, space: 2, type: 'weapon', subType: 'firearm', damage: '2d8 Balístico', details: 'Esta arma de fogo é bastante popular entre fazendeiros, caçadores e atiradores esportistas.' },
  
  // ARMAS TÁTICAS
  { id: 'machadinha', name: 'Machadinha', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Corte', details: 'Ferramenta útil para cortar madeira, muito comum em fazendas e canteiros de obras. Pode ser arremessada.' },
  { id: 'nunchaku', name: 'Nunchaku', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d8 Impacto', details: 'Dois bastões curtos de madeira ligados por uma corrente. É uma arma ágil.' },
  { id: 'corrente', name: 'Corrente', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d8 Impacto', details: 'Um pedaço de corrente grossa pode ser usado como uma arma bastante efetiva. A corrente fornece +2 em testes para desarmar e derrubar.' },
  { id: 'espada', name: 'Espada', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d8/1d10 Corte', details: 'Uma arma medieval, como uma espada longa dos cavaleiros europeus ou uma cimitarra sarracena. Você pode empunhar uma espada com uma mão (dano 1d8) ou com as duas (dano 1d10).' },
  { id: 'florete', name: 'Florete', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Perfuração', details: 'Esta espada de lâmina fina e comprida é usada por esgrimistas. É uma arma ágil.' },
  { id: 'machado', name: 'Machado', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d8 Corte', details: 'Uma ferramenta importante para lenhadores e bombeiros, um machado pode causar ferimentos terríveis.' },
  { id: 'maca', name: 'Maça', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '2d4 Impacto', details: 'Bastão com uma cabeça metálica cheia de protuberâncias.' },
  { id: 'acha', name: 'Acha', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '1d12 Corte', details: 'Um machado grande e pesado, usado no corte de árvores largas.' },
  { id: 'gadanho', name: 'Gadanho', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '2d4 Corte', details: 'Uma ferramenta agrícola, o gadanho é uma versão maior da foice, para uso com as duas mãos. Foi criada para ceifar cereais, mas também pode ceifar vidas.' },
  { id: 'katana', name: 'Katana', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '1d10 Corte', details: 'Originária do Japão, esta espada longa e levemente curvada transcendeu os séculos. É uma arma ágil. Se você for veterano em Luta pode usá-la como uma arma de uma mão.' },
  { id: 'marreta', name: 'Marreta', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '3d4 Impacto', details: 'Normalmente usada para demolir paredes, também pode ser usada para demolir pessoas. Use estas estatísticas para outras ferramentas de construção civil, como picaretas.' },
  { id: 'montante', name: 'Montante', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '2d6 Corte', details: 'Enorme e pesada, esta espada de 1,5m de comprimento foi uma das armas mais poderosas em seu tempo.' },
  { id: 'motoserra', name: 'Motosserra', category: 1, space: 2, type: 'weapon', subType: 'melee', damage: '3d6 Corte', details: 'Uma ferramenta capaz de causar ferimentos profundos; sempre que rolar um 6 em um dado de dano com uma motosserra, role um dado de dano adicional. Apesar de potente, esta arma é desajeitada e impõe -1d20 nos seus testes de ataque. Ligar uma motosserra gasta uma ação de movimento.' },
  { id: 'arco_composto', name: 'Arco Composto', category: 1, space: 2, type: 'weapon', subType: 'ranged', damage: '1d10 Perfuração', details: 'Este arco moderno usa materiais de alta tensão e um sistema de roldanas para gerar mais pressão. Ao contrário de outras armas de disparo, permite que você aplique seu valor de Força às rolagens de dano.' },
  { id: 'balestra', name: 'Balestra', category: 1, space: 2, type: 'weapon', subType: 'ranged', damage: '1d12 Perfuração', details: 'Uma besta pesada, capaz de disparos poderosos. Exige uma ação de movimento para ser recarregada a cada disparo.' },
  { id: 'submetralhadora', name: 'Submetralhadora', category: 1, space: 1, type: 'weapon', subType: 'firearm', damage: '2d6 Balístico', details: 'Esta arma de fogo automática pode ser empunhada com apenas uma mão.' },
  { id: 'espingarda', name: 'Espingarda', category: 1, space: 2, type: 'weapon', subType: 'firearm', damage: '4d6 Balístico', details: 'Arma de fogo longa e com cano liso. A espingarda causa apenas metade do dano em alcance médio ou maior.' },
  { id: 'fuzil_assalto', name: 'Fuzil de Assalto', category: 2, space: 2, type: 'weapon', subType: 'firearm', damage: '2d10 Balístico', details: 'A arma de fogo padrão da maioria dos exércitos modernos. É uma arma automática.' },
  { id: 'fuzil_precisao', name: 'Fuzil de Precisão', category: 3, space: 2, type: 'weapon', subType: 'firearm', damage: '2d10 Balístico', details: 'Esta arma de fogo de uso militar é projetada para disparos longos e precisos. Se for veterano em Pontaria e mirar com um fuzil de precisão, você recebe +5 na margem de ameaça de seu ataque.' },
  { id: 'bazuca', name: 'Bazuca', category: 2, space: 2, type: 'weapon', subType: 'firearm', damage: '10d8 Impacto', details: 'Este lança-foguetes foi concebido como uma arma anti-tanques, mas também se mostrou eficaz contra criaturas. A bazuca causa seu dano no alvo atingido e em todos os seres num raio de 3m; esses seres (mas não o alvo atingido diretamente) têm direito a um teste de Reflexos (DT Agi) para reduzir o dano à metade. A bazuca exige uma ação de movimento para ser recarregada a cada disparo.' },
  { id: 'lanca_chamas', name: 'Lança-chamas', category: 2, space: 2, type: 'weapon', subType: 'firearm', damage: '6d6 Fogo', details: 'Equipamento militar que esguicha líquido inflamável incandescente. Um lança-chamas atinge todos os seres em uma linha de 1,5m de largura com alcance curto, mas não alcança além disso. Faça um único teste de ataque e compare o resultado com a Defesa de todos os seres na área. Além de sofrer dano, seres atingidos ficam em chamas.' },
  { id: 'metralhadora', name: 'Metralhadora', category: 2, space: 2, type: 'weapon', subType: 'firearm', damage: '2d12 Balístico', details: 'Uma arma de fogo pesada, de uso militar. Para atacar com uma metralhadora, você precisa ter Força 4 ou maior ou gastar uma ação de movimento para apoiá-la em seu tripé ou suporte apropriado; caso contrário, sofre -5 em seus ataques. Uma metralhadora é uma arma automática.' },

  // --- ITENS SOBREVIVENDO AO HORROR / ESPECIAIS ---
  { id: 'baioneta', name: 'Baioneta', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d4 Perfuração', details: 'Uma lâmina projetada para ser fixada em um fuzil ou arma similar. Você pode gastar uma ação de movimento para fixar a baioneta em uma arma de fogo de duas mãos. Se fizer isso, a baioneta se torna uma arma de duas mãos ágil e seu dano aumenta para 1d6. Você ainda pode atacar com a arma de fogo, mas sofre -1d20 em ataques à distância com ela.' },
  { id: 'bastao_policial', name: 'Bastão Policial', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d6/1d8 Impacto', details: 'Essencialmente um bastão com uma guarda lateral, esta é a arma branca de uso padrão da maioria das forças policiais. Além de desferir golpes contundentes, pode ser usada para aparar ataques; quando usa a ação especial esquiva com um bastão policial, o bônus que você recebe na Defesa aumenta em +1. Um bastão policial é uma arma ágil.' },
  { id: 'espingarda_dupla', name: 'Espingarda de Cano Duplo', category: 1, space: 2, type: 'weapon', subType: 'firearm', damage: '4d6 Balístico', details: 'Geralmente usada para caça, essa versão da espingarda conta com dois canos paralelos, cada um com um gatilho e capacidade para um cartucho. Ao contrário de outras armas de fogo, você precisa gastar uma ação de movimento para recarregar a espingarda de cano duplo após disparar seus dois cartuchos. Quando ataca com essa arma, você pode disparar os dois canos no mesmo alvo; se fizer isso, sofre -1d20 no teste de ataque, mas o dano da arma aumenta para 6d6.' },
  { id: 'estilingue', name: 'Estilingue', category: 0, space: 1, type: 'weapon', subType: 'ranged', damage: '1d3 Impacto', details: 'Originalmente usado para caçar passarinhos, estilingues evoluíram em formato e composição. Ao contrário de outras armas de disparo, permite que você aplique seu valor de Força às rolagens de dano. Um estilingue dispara bolinhas que podem ser reaproveitadas e, na falta destas, você pode usar pedrinhas como munição; um pacote de bolinhas dura uma missão inteira, tem categoria 0 e ocupa o mesmo espaço do estilingue. Um estilingue também pode lançar granadas; fazer isso permite arremessar uma granada em alcance longo.' },
  { id: 'faca_tatica', name: 'Faca Tática', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Corte', details: 'Uma faca balanceada para contra-ataques rápidos e bloqueios. Se usada na ação especial contra-ataque, fornece +2 no teste de ataque para contra-atacar. Se usada na ação especial bloqueio, você pode gastar 2 PE e sacrificar a faca tática para aumentar a RD do bloqueio em +20. A faca tática é uma arma ágil e pode ser arremessada.' },
  { id: 'gancho_carne', name: 'Gancho de Carne', category: 0, space: 1, type: 'weapon', subType: 'melee', damage: '1d4 Perfuração', details: 'Usado para pendurar carne em frigoríficos, este gancho metálico pode servir como arma. Também pode ser amarrado a um pedaço de corda ou corrente; isso aumenta seu alcance para 4,5m e o transforma em um item de espaço 2.' },
  { id: 'pistola_pesada', name: 'Pistola Pesada', category: 1, space: 1, type: 'weapon', subType: 'firearm', damage: '1d12 Balístico', details: 'Uma versão de calibre superior da tradicional pistola. Sua potência e recuo impõem uma penalidade de -1d20 em testes de ataque; empunhá-la com as duas mãos anula essa penalidade.' },
  { id: 'pregador_pneumatico', name: 'Pregador Pneumático', category: 1, space: 2, type: 'weapon', subType: 'firearm', damage: '1d8 Perfuração', details: 'Outra ferramenta que pode ser empregada como arma em uma situação extrema, um pregador pneumático é um aparelho semelhante a uma pistola que dispara pregos sob pressão. Embora seja um dispositivo mecânico, ele conta como uma arma de fogo para seus poderes que afetam armas deste tipo. Um pregador armazena 300 pregos em rolo, o suficiente para durar uma missão inteira.' },
  { id: 'revolver_compacto', name: 'Revolver Compacto', category: 1, space: 1, type: 'weapon', subType: 'firearm', damage: '2d6 Balístico', details: 'Uma arma de baixo calibre, projetada para ser facilmente escondida no corpo. Se for treinado em Crime, você consegue carregar uma dessas armas sem que ela ocupe um espaço.' },
  { id: 'shuriken', name: 'Shuriken', category: 0, space: 1, type: 'weapon', subType: 'ranged', damage: '1d4 Perfuração', details: 'Pequenos projéteis metálicos em forma de estrelas ou dardos, usados por artistas marciais (e fãs de ninjas). Se for veterano em Pontaria, uma vez por rodada, quando ataca com uma shuriken, você poderá gastar 1 PE para fazer um ataque adicional de shuriken contra o mesmo alvo. Uma única shuriken representa um "pacote" suficiente para duas cenas (ou 10 shurikens, se estiver usando a regra opcional de contagem de munição).' },
  { id: 'soqueira', name: 'Soqueira', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '+1 Impacto', details: 'Esta peça de metal é usada entre os dedos e permite socos mais perigosos — fornece +1 em rolagens de dano desarmado. Uma soqueira pode receber modificações e maldições de armas corpo a corpo e aplica os efeitos delas em seus ataques desarmados.' },
  { id: 'taser', name: 'Taser', category: 1, space: 1, type: 'weapon', subType: 'melee', damage: '1d6 Eletricidade', details: 'Um dispositivo de eletrochoque capaz de atordoar ou até incapacitar um alvo. Você pode gastar uma ação padrão para atingir um ser adjacente. O alvo sofre 1d6 pontos de dano de eletricidade e fica atordoado por uma rodada (Fortitude DT Agi evita). A bateria do taser dura dois usos.' },
  { id: 'pistola_sinalizadora', name: 'Pistola Sinalizadora', category: 0, space: 1, type: 'weapon', subType: 'firearm', damage: '2d6 Fogo', details: 'Esta pistola dispara um sinalizador luminoso, útil para chamar outras pessoas para sua localização. Pode ser usada como uma arma de disparo leve com alcance curto. A pistola vem com 2 cargas. Uma caixa adicional com 2 cargas é um item de categoria 0 que ocupa 1 espaço.' },
  { id: 'pistola_dardos', name: 'Pistola de Dardos', category: 0, space: 1, type: 'weapon', subType: 'ranged', damage: 'Sonífero', details: 'Esta arma dispara dardos com um poderoso sonífero. Para disparar em um ser, faça um ataque à distância contra ele. Se acertá-lo, ele fica inconsciente até o fim da cena (Fortitude DT Agi reduz para desprevenida e lenta por uma rodada). A pistola vem com 2 dardos. Uma caixa adicional com 2 dardos é um item de categoria 0 que ocupa 1 espaço.' },

  // --- PROTEÇÕES ---
  { id: 'escudo', name: 'Escudo', category: 1, space: 2, type: 'protection', subType: 'heavy_protection', details: 'Um escudo medieval ou moderno, como aqueles usados por tropas de choque. Precisa ser empunhado em uma mão e fornece Defesa +2. Bônus na Defesa fornecido por um escudo acumula com o de uma proteção. Para efeitos de proficiência e penalidade por não proficiência, escudos contam como proteção pesada.' },
  { id: 'protecao_leve', name: 'Proteção Leve', category: 1, space: 2, type: 'protection', subType: 'light_protection', details: 'Jaqueta de couro pesada ou um colete de kevlar. Essa proteção é tipicamente usada por seguranças e policiais. Fornece Defesa +5.' },
  { id: 'protecao_pesada', name: 'Proteção Pesada', category: 2, space: 5, type: 'protection', subType: 'heavy_protection', details: 'Equipamento usado por forças especiais da polícia e pelo exército. Fornece Defesa +10 e resistência a balístico, corte, impacto e perfuração 2. No entanto, por ser desconfortável e volumosa, impõe -5 em testes de perícias que sofrem penalidade de carga.' },
  { id: 'traje_hazmat', name: 'Traje Hazmat', category: 1, space: 2, type: 'protection', subType: 'light_protection', details: 'Uma roupa impermeável e que cobre o corpo inteiro, usada para impedir o contato do usuário com materiais tóxicos. Fornece +5 em testes de resistência contra efeitos ambientais e resistência a químico 10.' },

  // --- MUNIÇÕES ---
  { id: 'balas_curtas', name: 'Balas Curtas', category: 0, space: 1, type: 'ammo', details: 'Munição básica, usada em pistolas, revólveres e submetralhadoras. Um pacote de balas curtas dura duas cenas.' },
  { id: 'balas_longas', name: 'Balas Longas', category: 1, space: 1, type: 'ammo', details: 'Maior e mais potente, esta munição é usada em fuzis e metralhadoras. Um pacote de balas longas dura uma cena.' },
  { id: 'cartuchos', name: 'Cartuchos', category: 1, space: 1, type: 'ammo', details: 'Usados em espingardas, esses cartuchos são carregados com esferas de chumbo. Um pacote de cartuchos dura uma cena.' },
  { id: 'combustivel', name: 'Combustível', category: 1, space: 1, type: 'ammo', details: 'Um tanque de combustível para lança-chamas. Dura uma cena.' },
  { id: 'flechas', name: 'Flechas', category: 0, space: 1, type: 'ammo', details: 'Usadas em arcos e bestas, flechas podem ser reaproveitadas após cada combate. Por isso, um pacote de flechas dura uma missão inteira.' },
  { id: 'foguete', name: 'Foguete', category: 1, space: 1, type: 'ammo', details: 'Disparado por bazucas. Ao contrário de outras munições, cada foguete dura um único disparo, não uma cena. Para fazer vários ataques, você precisará carregar vários foguetes.' },
  { id: 'bolinhas', name: 'Bolinhas (Estilingue)', category: 0, space: 0, type: 'ammo', details: 'Um pacote de bolinhas dura uma missão inteira, tem categoria 0 e ocupa o mesmo espaço do estilingue.' },
  { id: 'pregos', name: 'Rolo de Pregos', category: 0, space: 0, type: 'ammo', details: 'Um pregador armazena 300 pregos em rolo, o suficiente para durar uma missão inteira.' },

  // --- ITENS GERAIS / ACESSÓRIOS / EXPLOSIVOS / PARANORMAIS ---
  { id: 'amuleto_sagrado', name: 'Amuleto Sagrado', category: 1, space: 1, type: 'accessory', subType: 'tool', details: 'Um utensílio especial na forma de rosário ou conta. Fornece +2 em Religião e Vontade.' },
  { id: 'celular', name: 'Celular', category: 1, space: 1, type: 'accessory', subType: 'tool', details: 'Um utensílio especial. Se tiver acesso a internet, fornece +2 em testes de perícia que envolvam adquirir informações. Possui lanterna fraca (cone 4,5m).' },
  { id: 'chave_fenda_universal', name: 'Chave de Fenda Universal', category: 1, space: 1, type: 'accessory', subType: 'tool', details: 'Esta ferramenta pode ser considerada um milagre da engenharia humana. Fornece +2 em testes de perícia para criar ou reparar objetos. Também fornece o bônus se usada como item de apoio em situações especiais.' },
  { id: 'coldre_saque_rapido', name: 'Coldre Saque Rápido', category: 1, space: 1, type: 'accessory', subType: 'clothing', details: 'Este coldre é projetado para que a arma possa ser sacada ou armazenada com um movimento mínimo. Uma vez por rodada, você pode sacar ou guardar uma arma de fogo leve como uma ação livre.' },
  { id: 'kit_pericia', name: 'Kit de Perícia', category: 0, space: 1, type: 'accessory', subType: 'kit', details: 'Um conjunto de ferramentas necessárias para algumas perícias ou usos de perícias. Sem o kit, você sofre -5 no teste.' },
  { id: 'notebook', name: 'Notebook', category: 1, space: 1, type: 'accessory', subType: 'tool', details: 'Utensílio especial. Como um celular, fornece +2 em testes para adquirir informações. Ao relaxar em interlúdio com ele, recupera +1 Sanidade. Ilumina cone de 4,5m.' },
  { id: 'oculos_escuros', name: 'Óculos Escuros', category: 1, space: 1, type: 'accessory', subType: 'clothing', details: 'Um personagem vestindo óculos escuros não pode ser ofuscado.' },
  { id: 'oculos_vis_noturna', name: 'Óculos de Visão Noturna', category: 1, space: 1, type: 'accessory', subType: 'clothing', details: 'Alimentados por uma bateria, estes óculos permitem enxergar no escuro. O usuário recebe -1d20 em testes de resistência contra a condição ofuscado e efeitos baseados em luz.' },
  { id: 'utensilio', name: 'Utensílio', category: 1, space: 1, type: 'accessory', subType: 'tool', details: 'Um item comum que tenha uma utilidade específica (canivete, lupa, etc). Um utensílio fornece +2 em uma perícia (exceto Luta e Pontaria). Precisa ser empunhado para que o bônus seja aplicado.' },
  { id: 'vestimenta', name: 'Vestimenta', category: 1, space: 1, type: 'accessory', subType: 'clothing', details: 'Uma peça de vestuário que fornece +2 em uma perícia (exceto Luta ou Pontaria). Você pode receber os bônus de no máximo duas vestimentas ao mesmo tempo. Vestir ou despir uma vestimenta é uma ação completa.' },
  { id: 'dinamite', name: 'Dinamite', category: 1, space: 1, type: 'explosive', damage: '4d6+4d6', details: 'Bastão de nitroglicerina. Ação padrão para acender e arremessar (médio). Raio 6m. Causa 4d6 impacto + 4d6 fogo e deixa em chamas (Reflexos DT Agi reduz metade).' },
  { id: 'explosivo_plastico', name: 'Explosivo Plástico', category: 1, space: 1, type: 'explosive', damage: '16d6 Impacto', details: 'Massa adesiva com detonador remoto. 2 rodadas para instalar. Detonação livre. Raio 3m, 16d6 impacto (Reflexos DT Int reduz metade). Especialista em explosivos dobra dano em objetos.' },
  { id: 'galao_vermelho', name: 'Galão Vermelho', category: 1, space: 1, type: 'explosive', damage: '12d6 Fogo', details: 'Carrega substância inflamável. Se sofrer dano fogo/balístico, explode (raio 6m). 12d6 fogo e em chamas (Reflexos DT 25 reduz metade e evita a condição). A área afetada pelo raio da explosão fica em chamas.' },
  { id: 'granada_atordoamento', name: 'Granada (Atordoamento)', category: 1, space: 1, type: 'explosive', details: 'Também chamadas de flash-bang. Seres na área (raio 6m) ficam atordoados por 1 rodada (Fortitude DT Agi reduz para ofuscado e surdo por uma rodada).' },
  { id: 'granada_gas_sonifero', name: 'Granada de Gás Sonífero', category: 1, space: 1, type: 'explosive', details: 'Libera fumaça branca (raio 6m). Seres na área ficam inconscientes e caídos ou, se estiverem envolvidos em atividade física intensa, ficam exaustos por 1 rodada, depois fatigados. Fortitude DT Agi reduz. Gás dura 2 rodadas.' },
  { id: 'granada_fragmentacao', name: 'Granada (Fragmentação)', category: 1, space: 1, type: 'explosive', damage: '8d6 Perfuração', details: 'Espalha fragmentos perfurantes. Seres na área (raio 6m) sofrem 8d6 pontos de dano de perfuração (Reflexos DT Agi reduz à metade).' },
  { id: 'granada_fumaca', name: 'Granada (Fumaça)', category: 1, space: 1, type: 'explosive', details: 'Produz uma fumaça espessa e escura. Seres na área (raio 6m) ficam cegos e sob camuflagem total. A fumaça dura 2 rodadas.' },
  { id: 'granada_incendiaria', name: 'Granada (Incendiária)', category: 1, space: 1, type: 'explosive', damage: '6d6 Fogo', details: 'Espalha labaredas incandescentes. Seres na área (raio 6m) sofrem 6d6 pontos de dano de fogo e ficam em chamas (Reflexos DT Agi reduz o dano à metade e evita a condição em chamas).' },
  { id: 'granada_pem', name: 'Granada de PEM', category: 1, space: 1, type: 'explosive', details: 'Emite pulso eletromagnético que desativa eletrônicos em raio de 18m. Criaturas de Energia sofrem 6d6 impacto e paralisia (Fortitude DT Agi reduz).' },
  { id: 'mina_antipessoal', name: 'Mina Antipessoal', category: 1, space: 1, type: 'explosive', damage: '12d6 Perfuração', details: 'Ativada por controle remoto. Dispara bolas de aço em um cone de 6m (Reflexos DT Int reduz à metade). Instalar exige ação completa e Tática DT 15.' },
  { id: 'alarme_movimento', name: 'Alarme de Movimento', category: 1, space: 1, type: 'general', details: 'Controlado por app. Ação completa para posicionar. Detecta movimento em cone de 30m e sinaliza.' },
  { id: 'algemas', name: 'Algemas', category: 0, space: 1, type: 'general', details: 'Um par de algemas de aço. Para prender, exige teste de agarrar. Escapar exige Acrobacia DT 30 ou chaves.' },
  { id: 'alimento_energetico', name: 'Alimento Energético', category: 0, space: 1, type: 'general', details: 'Alimentos de alta tecnologia. Ação padrão para consumir e recuperar 1d4 PE.' },
  { id: 'aplicador_medicamentos', name: 'Aplicador de Medicamentos', category: 1, space: 1, type: 'general', details: 'Pode ser preso ao braço. Aplica substância (cicatrizante/remédio) com ação de movimento. Espaço para 3 doses.' },
  { id: 'arpeu', name: 'Arpéu', category: 1, space: 1, type: 'general', details: 'Um gancho de aço amarrado na ponta de uma corda. Prender exige Pontaria DT 15. Subir muro fornece +5 Atletismo.' },
  { id: 'bandoleira', name: 'Bandoleira', category: 1, space: 1, type: 'general', details: 'Um cinto com bolsos e alças. Uma vez por rodada, você pode sacar ou guardar um item em seu inventário como uma ação livre.' },
  { id: 'binoculos', name: 'Binóculos', category: 1, space: 1, type: 'general', details: 'Estes binóculos militares fornecem +5 em testes de Percepção para observar coisas distantes.' },
  { id: 'bloqueador_sinal', name: 'Bloqueador de Sinal', category: 2, space: 1, type: 'general', details: 'Emite ondas que poluem frequência de rádio, impedindo celulares em alcance médio de se conectarem.' },
  { id: 'bracadeira_reforcada', name: 'Braçadeira Reforçada', category: 1, space: 1, type: 'accessory', subType: 'clothing', details: 'Ajudam a absorver impacto. Aumentam em +2 a RD que você recebe por usar um bloqueio.' },
  { id: 'cao_adestrado', name: 'Cão Adestrado', category: 1, space: 1, type: 'general', details: 'Um cachorro pode ser um parceiro valioso. Personagem treinado em Adestramento pode usá-lo como aliado.' },
  { id: 'chaves', name: 'Chaves', category: 0, space: 1, type: 'general', details: 'Molhos de chaves. Usar o barulho para distrair fornece +2 em testes de Furtividade na mesma rodada.' },
  { id: 'cicatrizante', name: 'Cicatrizante', category: 1, space: 1, type: 'general', details: 'Spray com remédio cicatrizante. Gaste ação padrão para curar 2d8+2 PV em você ou ser adjacente.' },
  { id: 'corda', name: 'Corda (10m)', category: 0, space: 1, type: 'general', details: 'Um rolo com 10 metros de corda resistente. Ajuda a descer buracos/prédios (+5 Atletismo).' },
  { id: 'documentos_falsos', name: 'Documentos Falsos', category: 1, space: 1, type: 'general', details: 'Conjunto de identidade falsa. +2 em Diplomacia, Enganação e Intimidação para se passar pela pessoa.' },
  { id: 'equip_escuta', name: 'Equipamento de Escuta', category: 2, space: 1, type: 'general', details: 'Receptor e 3 transmissores. Instalar: Crime DT 20. Alcance 90m.' },
  { id: 'equip_sobrevivencia', name: 'Equip. Sobrevivência', category: 1, space: 1, type: 'general', details: 'Mochila com itens úteis para mato. +5 Sobrevivência para acampar/orientar. Permite teste sem treino.' },
  { id: 'estrepes', name: 'Estrepes', category: 1, space: 1, type: 'general', details: 'Ação padrão para cobrir quadrado 1,5m. Pisar causa 1d4 dano e lento por 1 dia (Reflexos DT Agi evita).' },
  { id: 'faixa_pregos', name: 'Faixa de Pregos', category: 1, space: 1, type: 'general', details: 'Trilha de hastes metálicas (linha 9m). Funciona como estrepes. Fura pneus de veículos (reduz deslocamento pela metade).' },
  { id: 'isqueiro', name: 'Isqueiro', category: 0, space: 1, type: 'general', details: 'Produz pequena chama. Ilumina raio de 3m. Incendeia objetos inflamáveis.' },
  { id: 'lanterna_tatica', name: 'Lanterna Tática', category: 1, space: 1, type: 'general', details: 'Ilumina lugares escuros. Ação movimento para mirar nos olhos: Ofusca alvo por 1 rodada (imune pelo resto da cena).' },
  { id: 'manual_operacional', name: 'Manual Operacional', category: 1, space: 1, type: 'general', details: 'Livro com lições. Ler em interlúdio permite usar perícia como treinado. Versão aprimorada dá +5.' },
  { id: 'mascara_gas', name: 'Máscara de Gás', category: 1, space: 1, type: 'general', details: 'Máscara com filtro. Fornece +10 em testes de Fortitude contra efeitos respiratórios.' },
  { id: 'medicamentos', name: 'Medicamentos', category: 1, space: 1, type: 'general', details: 'Diversos tipos (Antibiótico, Antídoto, etc). Gaste ação padrão para aplicar efeito benéfico específico.' },
  { id: 'mochila_militar', name: 'Mochila Militar', category: 1, space: 0, type: 'general', details: 'Mochila leve de alta qualidade. Não usa espaço e aumenta capacidade de carga em 2 espaços.' },
  { id: 'oculos_termico', name: 'Óculos Visão Térmica', category: 2, space: 1, type: 'general', details: 'Estes óculos eliminam a penalidade em testes por camuflagem.' },
  { id: 'pe_cabra', name: 'Pé de Cabra', category: 0, space: 1, type: 'general', details: 'Barra de ferro. Fornece +5 em Força para arrombar portas. Conta como bastão em combate.' },
  { id: 'paraquedas', name: 'Paraquedas', category: 1, space: 1, type: 'general', details: 'Anula dano de queda. Exige teste de Reflexos (DT 20) se não for treinado em perícia relevante.' },
  { id: 'spray_pimenta', name: 'Spray de Pimenta', category: 0, space: 1, type: 'general', details: 'Ação padrão para atingir ser adjacente. Cega por 1d4 rodadas (Fortitude DT Agi evita). 2 usos.' },
  { id: 'traje_mergulho', name: 'Traje de Mergulho', category: 1, space: 1, type: 'general', details: 'Garante 1 hora de oxigênio. Fornece +5 resistência efeitos ambientais e RD Químico 5.' },
  { id: 'traje_espacial', name: 'Traje Espacial', category: 1, space: 1, type: 'general', details: 'Suprimento de 8 horas. Fornece +10 resistência efeitos ambientais e RD Químico 20. Vestir/despir demora 2 rodadas.' },
  { id: 'amarras_elemento', name: 'Amarras de (Elemento)', category: 1, space: 1, type: 'paranormal', details: 'Cordas do elemento. Armadilha (3x3m, Reflexos ou imóvel) ou Laçar (Padrão+1PE, Vontade ou paralisado).' },
  { id: 'camera_paranormal', name: 'Câmera de Aura Paranormal', category: 1, space: 1, type: 'paranormal', details: 'Câmera amaldiçoada. Tirar foto (Padrão + 1 PE) revela auras paranormais.' },
  { id: 'catalisador_ritualistico', name: 'Catalisador Ritualístico', category: 1, space: 1, type: 'paranormal', details: 'Componente consumível. Ampliador (Alcance/Área), Perturbador (+2 DT), Potencializador (+1 dado), Prolongador (Dobra duração).' },
  { id: 'componentes', name: 'Componentes Ritualísticos', category: 0, space: 1, type: 'paranormal', details: 'Conjunto de objetos para conjurar rituais de um elemento específico (Sangue, Morte, Energia, Conhecimento).' },
  { id: 'emissor_pulso', name: 'Emissor de Pulsos Paranormais', category: 2, space: 1, type: 'paranormal', details: 'Ativar (Completa + 1 PE): Atrai criaturas do elemento e afasta opostos. Vontade evita.' },
  { id: 'escuta_ruidos', name: 'Escuta de Ruídos Paranormais', category: 2, space: 1, type: 'paranormal', details: 'Ativar (Completa + 2 PE): Grava ruídos. Ouvir fornece +5 Ocultismo para identificar criatura.' },
  { id: 'ligacao_infernal', name: 'Ligação Direta Infernal', category: 2, space: 1, type: 'paranormal', details: 'Fios de cobre contaminados. Ação completa para ligar veículo. Veículo ganha RD 20 e imunidade Sangue. +5 Pilotagem. Falhas têm consequências dobradas.' },
  { id: 'medidor_condicao', name: 'Medidor de Condição Vertebral', category: 2, space: 1, type: 'paranormal', details: 'Conecta à coluna (atordoa 1 rodada). Conta como vestimenta +2 Fortitude. Indica saúde por cores. +5 Medicina para auxiliar usuário.' },
  { id: 'medidor_estabilidade', name: 'Medidor de Estabilidade', category: 1, space: 1, type: 'paranormal', details: 'Dispositivo complexo. Agente treinado em Ocultismo usa para avaliar estado da Membrana em uma área.' },
  { id: 'pe_morto', name: 'Pé de Morto', category: 2, space: 1, type: 'paranormal', details: 'Botas de pele de cadáveres. +5 Furtividade. Ações de movimento aumentam visibilidade em apenas +1.' },
  { id: 'pen_drive_selado', name: 'Pen Drive Selado', category: 1, space: 1, type: 'paranormal', details: 'Gravado com sigilos de Conhecimento. Protegido contra invasão ou efeitos de Energia.' },
  { id: 'scanner_manifestacao', name: 'Scanner de Manifestação', category: 2, space: 1, type: 'paranormal', details: 'Ativar (Padrão): Consome 1 PE/rodada. Detecta direção de manifestações ativas do elemento escolhido.' },
  { id: 'valete_salvacao', name: 'Valete da Salvação', category: 1, space: 1, type: 'paranormal', details: 'Carta valete de ouros. Ação padrão para atirar ao ar. Aponta rota de fuga e some. Sucesso automático em cortar caminho.' },
  
  // --- ITENS AMALDIÇOADOS ESPECIAIS (TODOS OS JÁ LISTADOS) ---
  { id: 'conector_membros', name: 'Conector de Membros', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Dois anéis metálicos conectados por sanfona de tecido. Ação padrão para reconectar membro decepado (até 3 rodadas). Não cura PV. 25% chance de vida própria no membro (efeitos variados como lentidão ou penalidade em testes).' },
  { id: 'dose_praga', name: 'Dose d\'A Praga', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Frasco com líquido vermelho. Ação padrão: Alvo ganha Arma de Sangue, Sangue de Ferro e Sangue Vivo (cena). Fim: Fortitude DT 20+5/dose. Falha: 2d4 mental, mantém poderes e ganha Ódio Incontrolável.' },
  { id: 'mandibula_agonizante', name: 'Mandíbula Agonizante', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Parte inferior de crânio. Padrão: Arremessar (Médio). Grita alto (30m). Passa automaticamente em teste para Distrair (Furtividade). Atrai criaturas de Sangue (Vontade DT 35).' },
  { id: 'retalho_tenebroso', name: 'Retalho Tenebroso', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Pedaço de carne com pele. Padrão: Aplicar no rosto. Faro, Visão no Escuro, Vuln. Morte, -2d20 Social. +1 dano/dia. Perde 1d6 PV/dia (Fortitude DT 15+5 evita).' },
  { id: 'ampulheta_tempo', name: 'Ampulheta do Tempo Sofrido', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Ampulheta com areia negra. Empunhando: Gaste 5 PE para receber imediatamente os benefícios de uma ação de interlúdio. Só recarrega após gastar ação de interlúdio devolvendo tempo.' },
  { id: 'injecao_lodo', name: 'Injeção de Lodo', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Seringa velha com lodo. Padrão: Injetar em você ou adjacente. Alvo ganha vuln. Balístico e Energia. Próxima vez que cair a 0 PV na cena, cai a 1 PV.' },
  { id: 'instantaneo_mortal', name: 'Instantâneo Mortal', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Foto de momento pré-morte. Ao procurar pistas (relacionadas à morte da foto), gaste 1 PE: Imagem se move e aponta direção útil (bônus no teste a critério do mestre).' },
  { id: 'projetil_lodo', name: 'Projétil de Lodo', category: 2, space: 1, type: 'ammo', subType: 'cursed_item', details: 'Munição forjada com lodo. Usar troca todo o dano da arma para Morte. Ao fim da cena, a arma se degrada e é destruída.' },
  { id: 'radio_chiador', name: 'Rádio Chiador', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Rádio velho. Emite chiado se houver criatura Paranormal em alcance extremo. Volume indica proximidade. Atrai criaturas.' },
  { id: 'camera_obscura', name: 'Câmera Obscura', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Polaroid Model 95. Possui Lente de Revelação (DT+10). Se criatura falhar, sofre 6d6 frio (se invisível/incorpórea).' },
  { id: 'enxame_fantasmagorico', name: 'Enxame Fantasmagórico', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Manto de traças. Deixa usuário invisível. Sofre 1 dano mental (ignora RD) no início de cada turno.' },
  { id: 'repositorio_fracasso', name: 'Repositório do Fracasso', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Caixinha de madeira. Ganha carga quando criatura falha (1 natural). Consumir carga (livre): Recupera 1d4 PE. Penalidade cumulativa -1 Vontade até interlúdio.' },
  { id: 'tabula_saber', name: 'Tábula do Saber Custoso', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Tábula pequena. Usar para ser treinado em uma perícia por um teste. Perde Sanidade igual ao atributo-chave da perícia.' },
  { id: 'arreio_neural', name: 'Arreio Neural', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Correias na cabeça. Se sofrer 5+ dano Eletricidade/Energia, recupera 1 PE. Máx PE/dia = 2x Vigor.' },
  { id: 'centrifugador', name: 'Centrifugador Existencial', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Padrão + 3 PE: Turno extra no fim da rodada. Sorteia qual "versão" dissipa. Teste Ocultismo (DT 15+5/uso). Falha: Perde metade dos atributos.' },
  { id: 'espelho_refletor', name: 'Espelho Refletor', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Movimento: Observar fora de ângulo (Médio). +1d20 Percepção, vê através de cobertura total. Reação: Sacrificar para refletir dano de Energia.' },
  { id: 'fuzil_alheio', name: 'Fuzil Alheio', category: 2, space: 1, type: 'weapon', subType: 'cursed_item', damage: 'Energia', details: 'Arma alienígena. Fuzil de Precisão com mira telescópica e laser. Dano de Energia, munição infinita.' },
  { id: 'coracao_pulsante', name: 'Coração Pulsante', category: 2, space: 1, type: 'paranormal', subType: 'cursed_item', details: 'Um coração humano banhado em Sangue. Se estiver empunhando e sofrer dano, gaste reação para reduzir à metade. Teste Fortitude (DT 15 + 5/uso) ou item quebra. Drene o compartimento diariamente.' },
  { id: 'coroa_espinhos', name: 'Coroa de Espinhos', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Coroa/colar de espinhos. Reação: Transforma dano mental em dano de Sangue. Não recupera Sanidade por descanso. Ativa após 1 semana de uso.' },
  { id: 'frasco_vitalidade', name: 'Frasco de Vitalidade', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Gaste 1 min e até 20 PV para encher com seu sangue. Ação padrão para beber e recuperar os PV armazenados (Fortitude DT 20 ou enjoado).' },
  { id: 'perola_sangue', name: 'Pérola de Sangue', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Ação movimento para absorver: +5 em Agi, For, Vig (cena). Fim da cena: Fortitude DT 20. Falha: Fatigado. Falha por 5+: Morrendo (vira criatura).' },
  { id: 'punhos_enraivecidos', name: 'Punhos Enraivecidos', category: 2, space: 1, type: 'weapon', subType: 'cursed_item', damage: '1d8 Sangue', details: 'Soqueiras de metal vermelho. Ataques desarmados causam 1d8 Sangue. Ao acertar, pode gastar 2 PE (cumulativo: 2, 4, 6...) para atacar novamente o mesmo alvo.' },
  { id: 'seringa_transfiguracao', name: 'Seringa de Transfiguração', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Ação padrão para sugar sangue (ataque se hostil). Ação padrão para injetar: Alvo assume aparência do dono do sangue (1 dia). Fim: 1d6 (1 = perde 1 PV permanente).' },
  { id: 'amarras_mortais', name: 'Amarras Mortais', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Correntes nos antebraços. Ação padrão + 2 PE: Agarrar alvo Grande ou menor (Curto) com +10 no teste. Movimento: Puxar alvo agarrado para adjacente.' },
  { id: 'casaco_lodo', name: 'Casaco de Lodo', category: 2, space: 1, type: 'protection', subType: 'cursed_item', details: 'Sobretudo de Lodo. Resistência 5 a Corte, Impacto, Morte, Perfuração. Vulnerabilidade a Balístico e Energia.' },
  { id: 'coletora', name: 'Coletora', category: 2, space: 1, type: 'weapon', subType: 'cursed_item', damage: 'Punhal', details: 'Apunhalar morrendo (Completa): Mata e armazena 1d8 PE (máx 20). Pesadelos e descanso ruim constantes.' },
  { id: 'cranio_espiral', name: 'Crânio Espiral', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Empunhando: Ação livre para ganhar ação padrão extra na rodada. Teste Vontade (DT 15 + 5/uso). Falha: Envelhece 1d4 anos e item desativa no dia.' },
  { id: 'frasco_lodo', name: 'Frasco de Lodo', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Aplicar em ferimento (Padrão). Recente (1 rodada): Cura 6d8+20 PV. Antigo: 1d6 (Par: Cura 3d8+10 / Ímpar: 3d8+10 Dano Morte). Uso único.' },
  { id: 'vislumbre_fim', name: 'Vislumbre do Fim', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Óculos. Movimento para saber tempo de vida (comuns) ou pior resistência e vulnerabilidades (Marcados/Criaturas).' },
  { id: 'aneis_elo', name: 'Anéis do Elo Mental', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Par de anéis. Após 24h, cria ligação telepática. Compartilham maior teste de Vontade, mas dividem dano mental e condições mentais/medo.' },
  { id: 'lanterna_reveladora', name: 'Lanterna Reveladora', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Padrão + 1 PE: Emite luz (Terceiro Olho) por uma cena. Atrai criaturas de Sangue.' },
  { id: 'mascara_sombras', name: 'Máscara das Pessoas nas Sombras', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Resistência Conhecimento 10. Movimento + 2 PE: Entrar em sombra e teleportar para outra (Médio). Cuidado com a Seita.' },
  { id: 'municao_jurada', name: 'Munição Jurada', category: 2, space: 1, type: 'ammo', subType: 'cursed_item', details: 'Vincular a um ser (1h). Contra ele: +10 Ataque, Dobra margem ameaça, +6d12 Conhecimento. -2 Defesa/Ataque contra outros.' },
  { id: 'pergaminho_pertinacia', name: 'Pergaminho da Pertinácia', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Padrão: Recebe 5 PE temporários (Cena). Teste Ocultismo (DT 15 + 5/uso). Falha: Item destruído.' },
  { id: 'arcabuz_moretti', name: 'Arcabuz dos Moretti', category: 2, space: 1, type: 'weapon', subType: 'cursed_item', damage: 'Variável', details: 'Arma antiga. +2 Ataque. Dano 1d6 define dado: 1) 2d4, 2) 2d6, 3) 2d8, 4) 2d10, 5) 2d12, 6) 2d20. Curto. Crítico x3. Munição infinita.' },
  { id: 'bateria_reversa', name: 'Bateria Reversa', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Padrão + 2 PE: Drena carga de eletrônico (Curto). Padrão: Transfere carga. Teste Ocultismo (DT 15 + 5/uso). Falha: Explode 12d6 Energia (3m).' },
  { id: 'peitoral_segunda_chance', name: 'Peitoral da Segunda Chance', category: 2, space: 1, type: 'protection', subType: 'cursed_item', details: 'Se cair a 0 PV, gasta 5 PE para curar 4d10 PV. Falha se sem PE. Chance (1 em 1d10) de morte instantânea (vira plasma).' },
  { id: 'relogio_arnaldo', name: 'Relógio de Arnaldo', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Item Único. Gaste 1 PE (cumulativo/dia) para rerolar qualquer dado com resultado 1.' },
  { id: 'talisma_sorte', name: 'Talismã da Sorte', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Ao sofrer dano, reação + 3 PE: Rola 1d4. 2-3: Evita dano. 4: Evita e queima item. 1: Dobro do dano e queima item.' },
  { id: 'teclado_neural', name: 'Teclado de Conexão Neural', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Conecta mente ao PC. +10 Hackear, metade do tempo. Sofre 1d6 mental por rodada de uso.' },
  { id: 'tela_pesadelo', name: 'Tela do Pesadelo', category: 2, space: 1, type: 'general', subType: 'cursed_item', details: 'Padrão + 2 PE: Próximo a tocar vê ilusão. Vontade (DT usuário + 5). Falha: Atordoado, 4d6 mental, repete teste. Ativa 1x.' },
  { id: 'veiculo_energizado', name: 'Veículo Energizado', category: 2, space: 0, type: 'general', subType: 'cursed_item', details: 'Veículo não usa combustível. Reação (Pilotagem DT 25): Fica incorpóreo para evitar colisão.' },
  { id: 'jaqueta_verissimo', name: 'Jaqueta de Veríssimo', category: 4, space: 1, type: 'protection', subType: 'cursed_item', details: 'Item Único. RD Paranormal 15. Reação + 2 PE: Recebe dano no lugar de aliado adjacente.' },
  { id: 'dedo_decepado', name: 'Dedo Decepado', category: 2, space: 1, type: 'accessory', subType: 'cursed_item', details: 'Concede um poder paranormal. Interlúdio: 1d4. 1 = Assombrado (sem recuperação). -10 Diplomacia. Ativa após 1 semana.' },
  { id: 'selo_paranormal', name: 'Selo Paranormal', category: 1, space: 1, type: 'general', subType: 'cursed_item', details: 'Contém um ritual (Categoria = Círculo). Padrão (ou tempo ritual): Conjura e queima. Teste Ocultismo (DT 20 + Custo) se não conhecer. Sofre Custo do Paranormal.' },
  { id: 'primeira_adaga', name: 'A Primeira Adaga', category: 2, space: 1, type: 'weapon', subType: 'cursed_item', damage: 'Daga', details: 'Lâmina de pedra. Como componente: Catalisador total (amplia, perturba, potencializa, prolonga). Tempo vira 1 rodada. Custo: Perde metade dos PV totais.' },
].sort((a, b) => a.name.localeCompare(b.name));

// --- MODIFICAÇÕES ---
export const MODIFICATIONS: ItemEffect[] = [
  { id: 'alongada', name: 'Alongada', description: 'Com um cano mais longo, que aumenta a precisão dos disparos, a arma fornece +2 nos testes de ataque.', targetType: 'weapon', allowedTypes: ['firearm'], bonuses: [{ type: 'attack_roll', value: 2 }] },
  { id: 'calibre_grosso', name: 'Calibre Grosso', description: 'A arma é modificada para disparar munição de maior calibre, aumentando seu dano em mais um dado do mesmo tipo. Exige munição específica.', targetType: 'weapon', allowedTypes: ['firearm'], bonuses: [{ type: 'damage_roll', value: '1d' }] },
  { id: 'carregador_rapido', name: 'Carregador Rápido', description: 'Em uma arma de fogo, permite recarregá-la como uma ação livre uma vez por rodada. Para bestas ou balestras, permite até cinco recargas como ação livre.', targetType: 'weapon', allowedTypes: ['firearm', 'ranged'] },
  { id: 'certeira', name: 'Certeira', description: 'Fabricada para ser mais precisa e balanceada, a arma fornece +2 nos testes de ataque.', targetType: 'weapon', allowedTypes: ['firearm', 'melee', 'ranged'], bonuses: [{ type: 'attack_roll', value: 2 }] },
  { id: 'compensador', name: 'Compensador', description: 'Apenas para armas automáticas. Um sistema de amortecimento reduz o coice da arma, anulando a penalidade em testes de ataque por disparar rajadas.', targetType: 'weapon', allowedTypes: ['firearm'] },
  { id: 'cruel', name: 'Cruel', description: 'A arma possui a lâmina especialmente afiada ou foi fabricada com materiais mais densos. Fornece +2 nas rolagens de dano.', targetType: 'weapon', allowedTypes: ['melee', 'ranged'], bonuses: [{ type: 'damage_roll', value: 2 }] },
  { id: 'discreta', name: 'Discreta', description: 'A arma possui modificações para chamar menos atenção e ocupar menos espaço. Fornece +5 em testes de Crime para ser ocultada e reduz o número de espaços ocupados em 1.', targetType: 'any', allowedTypes: ['melee', 'firearm', 'ranged', 'light_protection', 'accessory'] },
  { id: 'dum_dum', name: 'Dum Dum', description: 'Estas balas são feitas para se expandir durante o impacto, produzindo ferimentos terríveis. Aumenta o multiplicador de crítico em +1.', targetType: 'ammo', bonuses: [{ type: 'crit_mult', value: 1 }] },
  { id: 'explosiva', name: 'Explosiva', description: 'Estas munições possuem uma gota de mercúrio ou glicerina, que fazem a bala explodir ao atingir o alvo. Aumenta o dano causado em +2d6.', targetType: 'ammo', bonuses: [{ type: 'damage_roll', value: '2d6' }] },
  { id: 'ferrolho_automatico', name: 'Ferrolho Automático', description: 'O mecanismo de ação da arma é modificado para disparar várias vezes em sequência. A arma se torna automática.', targetType: 'weapon', allowedTypes: ['firearm'] },
  { id: 'mira_laser', name: 'Mira Laser', description: 'Um laser interno cria um reflexo vermelho num retículo luminoso. Aumenta a margem de ameaça em +2.', targetType: 'weapon', allowedTypes: ['firearm', 'ranged'], bonuses: [{ type: 'crit_range', value: 2 }] },
  { id: 'mira_telescopica', name: 'Mira Telescópica', description: 'A arma possui uma luneta com marcações de medidas, ideal para disparos precisos de longa distância. Aumenta o alcance da arma em uma categoria e permite que a habilidade Ataque Furtivo seja usada em qualquer alcance.', targetType: 'weapon', allowedTypes: ['firearm', 'ranged'] },
  { id: 'perigosa', name: 'Perigosa', description: 'Seus golpes possuem impacto terrível. Aumenta a margem de ameaça em +2.', targetType: 'weapon', allowedTypes: ['melee'], bonuses: [{ type: 'crit_range', value: 2 }] },
  { id: 'silenciador', name: 'Silenciador', description: 'Um silenciador reduz em -1d20 a penalidade em Furtividade para se esconder no mesmo turno em que atacou com a arma de fogo.', targetType: 'weapon', allowedTypes: ['firearm'] },
  { id: 'tatica', name: 'Tática', description: 'A arma possui cabo texturizado, bandoleira e outros acessórios que facilitam seu manuseio. Você pode sacar a arma como uma ação livre.', targetType: 'weapon', allowedTypes: ['melee', 'firearm', 'ranged'] },
  { id: 'visao_calor', name: 'Visão de Calor', description: 'A mira tem um sistema eletrônico que sobrepõe imagens visíveis e imagens em infravermelho. Ao disparar com a arma, você ignora qualquer camuflagem do alvo.', targetType: 'weapon', allowedTypes: ['firearm', 'ranged'] },

  // MODIFICAÇÕES DE PROTEÇÃO
  { id: 'antibombas', name: 'Antibombas', description: 'Tratada para resistir a explosões. +5 resistência a efeitos de área. Acompanha capacete.', targetType: 'protection', allowedTypes: ['heavy_protection'], bonuses: [{ type: 'resistance_area', value: 5 }] },
  { id: 'blindada', name: 'Blindada', description: 'Reforçada com placas de aço e cerâmica costuradas dentro das camadas de kevlar. Aumenta a resistência a dano para 5 e o espaço ocupado em +1. Só pode ser aplicada em proteções pesadas.', targetType: 'protection', allowedTypes: ['heavy_protection'], bonuses: [{ type: 'rd_value', value: 5 }] },
  { id: 'reforcada', name: 'Reforçada', description: 'Aumenta a Defesa fornecida em +2 e o espaço ocupado em +1. Uma proteção não pode ser reforçada e discreta ao mesmo tempo.', targetType: 'protection', bonuses: [{ type: 'defense', value: 2 }] },

  // MODIFICAÇÕES DE ACESSÓRIOS
  { id: 'aprimorado', name: 'Aprimorado', description: 'O bônus em perícia concedido pelo acessório aumenta para +5. Se o item tiver função adicional, esta modificação poderá ser escolhida uma segunda vez para esta função.', targetType: 'accessory', bonuses: [{ type: 'skill_bonus', value: 5 }] },
  { id: 'bateria_potente', name: 'Bateria Potente', description: 'Essa modificação para objetos elétricos aumenta sua eficiência e duração. Se usada em lanternas, celulares e notebooks, dobra a duração da bateria e o alcance da luz projetada. Se usada em um taser, dobra seus usos, aumenta o dano para 1d8 e a DT para resistir a ele em +5.', targetType: 'general', allowedTypes: ['accessory', 'general'] },
  { id: 'funcao_adicional', name: 'Função Adicional', description: 'O acessório fornece +2 em uma perícia adicional à sua escolha, sujeita à aprovação do mestre.', targetType: 'accessory' },
  { id: 'instrumental', name: 'Instrumental', description: 'O acessório pode ser usado como um kit de perícia específico (escolhido ao aplicar esta modificação).', targetType: 'accessory', subType: 'tool' },
  { id: 'lente_revelacao', name: 'Lente de Revelação', description: 'Para Câmeras. Permite ver seres invisíveis e incorpóreos e ignorar a camuflagem deles. Foto (1 PE): Remove camuflagem/invisibilidade/incorpóreo (Vontade DT Pre evita).', targetType: 'paranormal' },
].sort((a, b) => a.name.localeCompare(b.name));

// --- MALDIÇÕES ---
export const CURSES: ItemEffect[] = [
  // CONHECIMENTO
  { id: 'abascanta', name: 'Abascanta', element: 'conhecimento', description: 'Você recebe +5 em testes de resistência contra rituais. Uma vez por cena, quando você é alvo de um ritual, pode gastar uma reação e PE igual ao custo dele para refleti-lo de volta ao conjurador.', targetType: 'protection', bonuses: [{ type: 'defense', value: 0 }] },
  { id: 'antielemento', name: 'Antielemento', element: 'conhecimento', description: 'A arma é letal contra criaturas de um elemento. Quando ataca uma criatura desse elemento, você pode gastar 2 PE para causar +4d8 pontos de dano.', targetType: 'weapon' },
  { id: 'carisma', name: 'Carisma', element: 'conhecimento', description: 'O acessório gera uma aura que torna você mais carismático e autoconfiante. Você recebe +1 em Presença.', targetType: 'accessory' },
  { id: 'conjuracao', name: 'Conjuração', element: 'conhecimento', description: 'O acessório tem um ritual de 1º círculo. Se estiver empunhando o item, você pode conjurar o ritual como se o conhecesse. Caso conheça, custo -1 PE.', targetType: 'accessory' },
  { id: 'escudo_mental', name: 'Escudo Mental', element: 'conhecimento', description: 'O acessório gera uma barreira psíquica. Você recebe resistência mental 10.', targetType: 'accessory' },
  { id: 'profetica', name: 'Profética', element: 'conhecimento', description: 'Você recebe resistência a Conhecimento 10 e pode gastar 2 PE para rolar novamente um teste de resistência uma vez.', targetType: 'protection' },
  { id: 'reflexao', name: 'Reflexão', element: 'conhecimento', description: 'Uma vez por rodada, quando você é alvo de um ritual, pode gastar PE igual ao custo dele para refleti-lo de volta ao seu conjurador.', targetType: 'accessory' },
  { id: 'ritualistica', name: 'Ritualística', element: 'conhecimento', description: 'Você pode armazenar na arma um ritual. Quando acerta um ataque com a arma, você pode descarregar o ritual armazenado como uma ação livre.', targetType: 'weapon' },
  { id: 'sagacidade', name: 'Sagacidade', element: 'conhecimento', description: 'Sua mente é acelerada pelas forças do Conhecimento, fornecendo a você +1 em Intelecto.', targetType: 'accessory' },
  { id: 'senciente', name: 'Senciente', element: 'conhecimento', description: 'Você pode gastar uma ação de movimento e 2 PE para imbuir a arma com uma fagulha de sua consciência. A arma flutua ao seu lado e ataca sozinha.', targetType: 'weapon' },
  { id: 'sombria', name: 'Sombria', element: 'conhecimento', description: 'A proteção confunde os sentidos. Você recebe +5 em Furtividade e ignora a penalidade de carga em testes dessa perícia.', targetType: 'protection' },

  // ENERGIA
  { id: 'cinetica', name: 'Cinética', element: 'energia', description: 'A proteção produz uma barreira invisível que desvia ataques, concedendo +2 em Defesa e resistência a dano 2 (leve/escudo) ou 5 (pesada).', targetType: 'protection', bonuses: [{ type: 'defense', value: 2 }] },
  { id: 'defesa', name: 'Defesa', element: 'energia', description: 'Uma barreira de energia invisível gerada por este acessório fornece +5 de Defesa.', targetType: 'accessory', bonuses: [{ type: 'defense', value: 5 }] },
  { id: 'destreza', name: 'Destreza', element: 'energia', description: 'Este acessório aprimora sua coordenação e velocidade, fornecendo +1 em Agilidade.', targetType: 'accessory' },
  { id: 'empuxo', name: 'Empuxo', element: 'energia', description: 'A arma ganha a capacidade de ser arremessada em alcance curto e causa mais um dado de dano do mesmo tipo quando usada dessa forma. Ela volta voando para você.', targetType: 'weapon' },
  { id: 'energetica', name: 'Energética', element: 'energia', description: 'Você pode gastar 2 PE por ataque para transformar a arma em Energia pura. Fornece +5 em testes de ataque, ignora resistência a dano e converte dano para Energia.', targetType: 'weapon' },
  { id: 'lepida', name: 'Lépida', element: 'energia', description: 'A proteção amplifica sua mobilidade, concedendo +10 em testes de Atletismo e +3m de deslocamento.', targetType: 'protection' },
  { id: 'potencia', name: 'Potência', element: 'energia', description: 'Este acessório aumenta a DT contra suas habilidades, poderes e rituais em +1.', targetType: 'accessory' },
  { id: 'vibrante', name: 'Vibrante', element: 'energia', description: 'A arma vibra constantemente. Você recebe a habilidade Ataque Extra. Se já a possui, o custo para usá-la diminui em -1 PE.', targetType: 'weapon' },
  { id: 'voltaica', name: 'Voltaica', element: 'energia', description: 'Você recebe resistência a Energia 10 e pode gastar 2 PE para fazer a proteção emitir arcos de Energia, causando dano em adjacentes.', targetType: 'protection' },

  // MORTE
  { id: 'consumidora', name: 'Consumidora', element: 'morte', description: 'A arma drena a entropia de seres. Quando ataca, você pode gastar 2 PE. Se acertar, o alvo fica imóvel por uma rodada.', targetType: 'weapon' },
  { id: 'erosiva', name: 'Erosiva', element: 'morte', description: 'A arma acelera o envelhecimento dos alvos, causando +1d8 pontos de dano de Morte. Gaste 2 PE para causar dano recorrente.', targetType: 'weapon' },
  { id: 'esforco_adicional', name: 'Esforço Adicional', element: 'morte', description: 'Este acessório fornece +5 PE. Este efeito só se ativa após um dia de uso.', targetType: 'accessory' },
  { id: 'letargica', name: 'Letárgica', element: 'morte', description: 'A proteção desacelera ataques perigosos, concedendo +2 em Defesa. Além disso, recebe chance de ignorar dano extra de críticos.', targetType: 'protection' },
  { id: 'repulsiva', name: 'Repulsiva', element: 'morte', description: 'Você recebe resistência a Morte 10 e pode gastar 2 PE para cobrir seu corpo com uma camada de Lodo preto que causa dano em quem atacar.', targetType: 'protection' },
  { id: 'repulsora', name: 'Repulsora', element: 'morte', description: 'A arma gera uma aura que desacelera ataques, fornecendo +2 de Defesa. Ao bloquear, gaste 2 PE para +5 Defesa adicional.', targetType: 'weapon' },

  // SANGUE
  { id: 'disposicao', name: 'Disposição', element: 'sangue', description: 'Valendo-se do poder do Sangue, você recebe +1 em Vigor.', targetType: 'accessory' },
  { id: 'lancinante', name: 'Lancinante', element: 'sangue', description: 'A arma inflige ferimentos terríveis, causando +1d8 de dano de Sangue. Este dado é multiplicado em acertos críticos.', targetType: 'weapon' },
  { id: 'predadora', name: 'Predadora', element: 'sangue', description: 'A arma tem sede de sangue. Anula penalidades por camuflagem/cobertura leve e duplica a margem de ameaça.', targetType: 'weapon' },
  { id: 'pujanca', name: 'Pujança', element: 'sangue', description: 'O acessório aumenta sua potência muscular, fornecendo +1 em Força.', targetType: 'accessory' },
  { id: 'regenerativa', name: 'Regenerativa', element: 'sangue', description: 'Você recebe resistência a Sangue 10 e pode gastar uma ação de movimento e 1 PE para recuperar 1d12 pontos de vida.', targetType: 'protection' },
  { id: 'sadica', name: 'Sádica', element: 'sangue', description: 'No início de seu turno, você recebe +1 em testes de ataque e dano para cada 10 pontos de dano que sofreu na última rodada.', targetType: 'protection' },
  { id: 'sanguinaria', name: 'Sanguinária', element: 'sangue', description: 'Os ferimentos se rasgam. Causa sangramento cumulativo (2d6). Críticos curam você em 2d10 PV temporários.', targetType: 'weapon' },
  { id: 'vitalidade', name: 'Vitalidade', element: 'sangue', description: 'Este acessório fornece +15 PV. Este efeito só se ativa após um dia de uso.', targetType: 'accessory' },

  // VARIA
  { id: 'protecao_elemental_sangue', name: 'Proteção Elemental (Sangue)', element: 'sangue', description: 'Você recebe resistência 10 contra dano de Sangue.', targetType: 'accessory' },
  { id: 'protecao_elemental_conhecimento', name: 'Proteção Elemental (Conhecimento)', element: 'conhecimento', description: 'Você recebe resistência 10 contra dano de Conhecimento.', targetType: 'accessory' },
  { id: 'protecao_elemental_energia', name: 'Proteção Elemental (Energia)', element: 'energia', description: 'Você recebe resistência 10 contra dano de Energia.', targetType: 'accessory' },
  { id: 'protecao_elemental_morte', name: 'Proteção Elemental (Morte)', element: 'morte', description: 'Você recebe resistência 10 contra dano de Morte.', targetType: 'accessory' },
].sort((a, b) => a.name.localeCompare(b.name));

// --- PERÍCIAS (LISTA OFICIAL COM 3 PROFISSÕES) ---
export const SKILL_LIST = [
  'Acrobacia', 'Adestramento', 'Artes', 'Atletismo', 'Atualidades', 
  'Ciências', 'Crime', 'Diplomacia', 'Enganação', 'Fortitude', 
  'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação', 
  'Luta', 'Medicina', 'Ocultismo', 'Percepção', 'Pilotagem', 
  'Pontaria', 'Profissão', 'Profissão 2', 'Profissão 3',
  'Reflexos', 'Religião', 'Sobrevivência', 
  'Tática', 'Tecnologia', 'Vontade'
];

// --- TIPOS DE DANO (DESCRIÇÕES COMPLETAS) ---
export const DAMAGE_TYPES_INFO = [
  { id: 'balistico', name: 'Balístico', desc: 'Projéteis disparados por armas de fogo. Perfura a carne e causa grandes ferimentos internos.' },
  { id: 'conhecimento', name: 'Conhecimento', desc: 'O dano mental causado por saber demais. Afeta a mente e a percepção da realidade.' },
  { id: 'corte', name: 'Corte', desc: 'Lâminas, garras e objetos afiados. Rasga a pele e os músculos, causando sangramento.' },
  { id: 'eletricidade', name: 'Eletricidade', desc: 'Raios, choques e faíscas. Queima a pele e sobrecarrega o sistema nervoso.' },
  { id: 'energia', name: 'Energia', desc: 'Dano causado por luz, calor, frio ou som sobrenaturais, ou por pura energia cinética.' },
  { id: 'fogo', name: 'Fogo', desc: 'Chamas, calor extremo e explosões. Queima a carne e consome o oxigênio.' },
  { id: 'frio', name: 'Frio', desc: 'Gelo e temperaturas congelantes. Congela a água nas células e causa hipotermia.' },
  { id: 'impacto', name: 'Impacto', desc: 'Socos, chutes, quedas e objetos rombudos. Quebra ossos e causa hematomas.' },
  { id: 'medo', name: 'Medo', desc: 'O pavor sobrenatural que abala a mente e o espírito, podendo levar à loucura ou à morte.' },
  { id: 'mental', name: 'Mental', desc: 'Ataques que visam a mente, causando dor psíquica, confusão ou perda de memória.' },
  { id: 'morte', name: 'Morte', desc: 'A decomposição acelerada da matéria, o apodrecimento da carne e a extinção da vida.' },
  { id: 'perfuracao', name: 'Perfuração', desc: 'Flechas, dardos, lanças e balas. Penetra fundo no corpo, atingindo órgãos vitais.' },
  { id: 'quimico', name: 'Químico', desc: 'Ácidos, venenos e toxinas. Corrói a matéria orgânica ou envenena o organismo.' },
  { id: 'sangue', name: 'Sangue', desc: 'A dor e a violência física em sua forma mais pura. Afeta o corpo e a vitalidade.' }
].sort((a, b) => a.name.localeCompare(b.name));

// --- CONDIÇÕES ---
export const CONDITIONS_LIST = [
  { name: 'Abalado', description: '-1d20 em testes. Se ganhar de novo, vira Apavorado.', effects: [{ target: 'testes', value: -1 }] },
  { name: 'Agarrado', description: 'Desprevenido, Imóvel, -1d20 ataque, só armas leves.', effects: [{ target: 'defesa', value: -5 }] }, // Desprevenido dá -5 def
  { name: 'Alquebrado', description: 'Custo de PE aumenta em +1.' },
  { name: 'Apavorado', description: '-2d20 em testes, deve fugir.', effects: [{ target: 'testes', value: -2 }] },
  { name: 'Asfixiado', description: 'Não respira. Testes de Fortitude ou cai inconsciente.' },
  { name: 'Atordoado', description: 'Desprevenido, não pode agir.', effects: [{ target: 'defesa', value: -5 }] },
  { name: 'Caído', description: '-2d20 ataque corpo a corpo, deslocamento 1,5m. -5 Defesa corpo a corpo, +5 contra distância.' },
  { name: 'Cego', description: 'Desprevenido, Lento, falha em percepção visual.', effects: [{ target: 'defesa', value: -5 }] },
  { name: 'Confuso', description: 'Comportamento aleatório (rolar 1d6).' },
  { name: 'Debilitado', description: '-2d20 em For, Agi, Vig.' },
  { name: 'Desprevenido', description: '-5 na Defesa e -1d20 Reflexos.', effects: [{ target: 'defesa', value: -5 }] },
  { name: 'Doente', description: 'Sob efeito de doença.' },
  { name: 'Em Chamas', description: '1d6 fogo/rodada. Ação padrão apaga.' },
  { name: 'Enjoado', description: 'Só uma ação padrão ou movimento.' },
  { name: 'Enredado', description: 'Lento, Vulnerável, -1d20 ataque.', effects: [{ target: 'defesa', value: -2 }] },
  { name: 'Envenenado', description: 'Efeito varia conforme veneno.' },
  { name: 'Esmorecido', description: '-2d20 em Int e Pre.' },
  { name: 'Exausto', description: 'Debilitado, Lento, Vulnerável.', effects: [{ target: 'defesa', value: -2 }] },
  { name: 'Fascinado', description: '-2d20 Percepção, não age.' },
  { name: 'Fatigado', description: 'Fraco e Vulnerável.', effects: [{ target: 'defesa', value: -2 }] },
  { name: 'Fraco', description: '-1d20 em For, Agi, Vig.' },
  { name: 'Frustrado', description: '-1d20 em Int e Pre.' },
  { name: 'Imóvel', description: 'Deslocamento 0m.' },
  { name: 'Inconsciente', description: 'Indefeso, não age.', effects: [{ target: 'defesa', value: -10 }] }, // Indefeso = -10
  { name: 'Indefeso', description: '-10 Defesa, falha em Reflexos.', effects: [{ target: 'defesa', value: -10 }] },
  { name: 'Lento', description: 'Deslocamento metade. Não corre/investida.' },
  { name: 'Machucado', description: 'Menos da metade dos PV totais.' },
  { name: 'Morrendo', description: '0 PV. 3 rodadas para morrer.' },
  { name: 'Ofuscado', description: '-1d20 ataque e Percepção.' },
  { name: 'Paralisado', description: 'Imóvel e Indefeso.', effects: [{ target: 'defesa', value: -10 }] },
  { name: 'Pasmo', description: 'Não pode fazer ações.' },
  { name: 'Petrificado', description: 'Inconsciente e RD 10.', effects: [{ target: 'defesa', value: -10 }] },
  { name: 'Perturbado', description: 'Menos da metade da Sanidade total.' },
  { name: 'Sangrando', description: 'Teste de Vigor DT 20 ou perde 1d6 PV.' },
  { name: 'Surdo', description: '-2d20 Iniciativa e Percepção auditiva.' },
  { name: 'Surpreendido', description: 'Desprevenido, não age.', effects: [{ target: 'defesa', value: -5 }] },
  { name: 'Vulnerável', description: '-2 na Defesa.', effects: [{ target: 'defesa', value: -2 }] },
];

// --- RITUAIS ---
export interface RitualBase { 
  id: string; 
  name: string; 
  element: 'conhecimento' | 'energia' | 'morte' | 'sangue' | 'medo'; 
  circle: 1 | 2 | 3 | 4; 
  execution: string; 
  range: string; 
  target: string; 
  duration: string; 
  resistance: string; 
  description: string; 
  normal: string; 
  discente?: string; 
  verdadeiro?: string; 
}

export const RITUALS: RitualBase[] = [
  // === 1º CÍRCULO: CONHECIMENTO ===
  {
    id: 'amaldicoar_arma_conhecimento', name: 'Amaldiçoar Arma (Conhecimento)', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 arma corpo a corpo ou pacote de munição', duration: 'Cena', resistance: '-', description: 'Arma causa +1d6 de dano de Conhecimento.', 
    normal: 'Você imbui a arma ou munições com o elemento, fazendo com que causem +1d6 de dano de Conhecimento. Este ritual passa a ser do elemento escolhido.', 
    discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo.', 
    verdadeiro: 'Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade.'
  },
  {
    id: 'compreensao_paranormal', name: 'Compreensão Paranormal', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 ser ou objeto', duration: 'Cena', resistance: 'Vontade anula', description: 'Confere compreensão sobrenatural da linguagem.', 
    normal: 'Se tocar um objeto contendo informação, você entende as palavras mesmo que não conheça seu idioma (idioma humano). Se tocar uma pessoa, pode se comunicar com ela. Se tocar um animal, percebe sentimentos básicos.', 
    discente: 'Muda o alcance para "curto" e o alvo para "alvos escolhidos". Você pode entender todos os alvos afetados. Requer 2º círculo.', 
    verdadeiro: 'Muda o alcance para "pessoal" e o alvo para "você". Você pode falar, entender e escrever qualquer idioma humano. Requer 3º círculo.'
  },
  {
    id: 'desfazer_sinapses', name: 'Desfazer Sinapses', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Instantânea', resistance: 'Vontade parcial', description: 'Causa dano de Conhecimento e frustração.', 
    normal: 'A entidade do Conhecimento inexiste bilhões de neurônios de dentro do cérebro do alvo. O alvo sofre 2d6+2 pontos de dano de Conhecimento e fica frustrado por uma rodada. Se passar no teste, sofre metade do dano e evita a condição.', 
    discente: 'Muda o alcance para longo, o dano para 3d6+3 e o alvo para até 5 seres a sua escolha. Requer 2º círculo.', 
    verdadeiro: 'Muda o alcance para extremo, o dano para 8d6+8 e a condição para esmorecido. Se passar, fica frustrado. Requer 3º círculo.'
  },
  {
    id: 'enfeiticar', name: 'Enfeitiçar', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 pessoa', duration: 'Cena', resistance: 'Vontade anula', description: 'Torna o alvo prestativo.', 
    normal: 'O alvo se torna prestativo a você (+10 em Diplomacia). Alvo hostil recebe +5 no teste. Ações hostis dissipam o efeito.', 
    discente: 'Em vez do normal, você sugere uma ação para o alvo e ele obedece (se parecer aceitável). Requer 2º círculo.', 
    verdadeiro: 'Afeta todos os alvos dentro do alcance. Requer 3º círculo.'
  },
  {
    id: 'ouvir_sussurros', name: 'Ouvir os Sussurros', element: 'conhecimento', circle: 1, execution: 'Completa', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Recebe informações do Outro Lado sobre evento iminente.', 
    normal: 'Faça uma pergunta sobre um evento prestes a acontecer (sim/não). Resultado 2-6: resposta correta. 1: falha ("não").', 
    discente: 'Execução 1 minuto. Pergunta sobre evento até 1 dia no futuro. Resposta pode ser frase/enigma. Requer 2º círculo.', 
    verdadeiro: 'Execução 10 minutos, Duração 5 rodadas. Uma pergunta por rodada (sim/não/ninguém sabe). Requer 3º círculo.'
  },
  {
    id: 'perturbacao', name: 'Perturbação', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 pessoa', duration: '1 rodada', resistance: 'Vontade anula', description: 'Força o alvo a obedecer um comando simples.', 
    normal: 'Dê uma ordem (Fuja, Largue, Pare, Sente-se, Venha). O alvo obedece em seu turno da melhor maneira possível.', 
    discente: 'Muda o alvo para "1 ser" e adiciona comando "Sofra" (3d8 dano Conhecimento e abalado).', 
    verdadeiro: 'Muda o alvo para "até 5 seres" ou adiciona comando "Ataque" (agredir outro alvo). Requer 3º círculo e afinidade.'
  },
  {
    id: 'tecer_ilusao', name: 'Tecer Ilusão', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Médio', target: 'Ilusão em 4 cubos de 1,5m', duration: 'Cena', resistance: 'Vontade desacredita', description: 'Cria ilusão visual ou sonora simples.', 
    normal: 'Cria imagem ou som simples. Não cria cheiro/textura. Atravessar não causa dano.', 
    discente: 'Até 8 cubos, duração sustentada. Ilusão completa (som, odor, temperatura, tátil). Seres precisam de Vontade para atravessar. Pode mover a ilusão. Requer 2º círculo.', 
    verdadeiro: 'Cria ilusão de perigo mortal. Alvo interagindo faz Vontade ou acredita ser real e sofre 6d6 Conhecimento/turno. Requer 3º círculo.'
  },
  {
    id: 'terceiro_olho', name: 'Terceiro Olho', element: 'conhecimento', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Enxerga auras paranormais.', 
    normal: 'Vê auras de rituais, itens e criaturas em alcance longo. Gasta movimento para saber se ser em alcance médio tem poderes.', 
    discente: 'Muda duração para 1 dia.', 
    verdadeiro: 'Também pode enxergar objetos e seres invisíveis (formas translúcidas).'
  },

  // === 1º CÍRCULO: ENERGIA ===
  {
    id: 'amaldicoar_arma_energia', name: 'Amaldiçoar Arma (Energia)', element: 'energia', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 arma ou munição', duration: 'Cena', resistance: '-', description: 'Arma causa +1d6 de dano de Energia.', 
    normal: 'Imbui a arma com Energia. Causa +1d6 de dano de Energia. (Escolha elemento ao aprender).', 
    discente: 'Muda bônus para +2d6. Requer 2º círculo.', 
    verdadeiro: 'Muda bônus para +4d6. Requer 3º círculo e afinidade.'
  },
  {
    id: 'amaldicoar_tecnologia', name: 'Amaldiçoar Tecnologia', element: 'energia', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 acessório ou arma de fogo', duration: 'Cena', resistance: '-', description: 'Otimiza o funcionamento de um dispositivo.', 
    normal: 'Item recebe uma modificação a sua escolha.', 
    discente: 'Muda para duas modificações. Requer 2º círculo.', 
    verdadeiro: 'Muda para três modificações. Requer 3º círculo e afinidade.'
  },
  {
    id: 'coincidencia_forcada', name: 'Coincidência Forçada', element: 'energia', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Cena', resistance: '-', description: 'Manipula a sorte a favor do alvo.', 
    normal: 'O alvo recebe +2 em testes de perícias.', 
    discente: 'Muda alvo para aliados à escolha. Requer 2º círculo.', 
    verdadeiro: 'Muda alvo para aliados e bônus para +5. Requer 3º círculo e afinidade.'
  },
  {
    id: 'eletrocussao', name: 'Eletrocussão', element: 'energia', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser ou objeto', duration: 'Instantânea', resistance: 'Fortitude parcial', description: 'Dispara corrente elétrica.', 
    normal: 'Causa 3d6 de eletricidade e deixa vulnerável por 1 rodada. Passar reduz metade e evita vulnerável. Dobro de dano em eletrônicos.', 
    discente: 'Muda alvo para linha de 30m. Causa 6d6 em todos na área. Requer 2º círculo.', 
    verdadeiro: 'Muda alvo para "alvos escolhidos". Dispara relâmpagos causando 8d6 em cada. Requer 3º círculo.'
  },
  {
    id: 'embaralhar', name: 'Embaralhar', element: 'energia', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Cria cópias ilusórias para defesa.', 
    normal: 'Cria 3 cópias. +6 Defesa. Se errarem ataque, uma cópia some e bônus cai em 2.', 
    discente: 'Cria 5 cópias (+10 Defesa). Requer 2º círculo.', 
    verdadeiro: 'Cria 8 cópias (+16 Defesa). Cópia destruída ofusca o atacante. Requer 3º círculo.'
  },
  {
    id: 'luz', name: 'Luz', element: 'energia', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 objeto', duration: 'Cena', resistance: 'Vontade anula', description: 'Objeto emite luz brilhante.', 
    normal: 'Ilumina área de 9m raio + 9m penumbra. Pode ser guardado para interromper.', 
    discente: 'Alcance longo, cria 4 esferas de luz móveis (6m raio cada). Ocupar espaço da esfera ofusca seres. Requer 2º círculo.', 
    verdadeiro: 'Luz cálida. Aliados na área +1d20 Vontade, inimigos ofuscados. Requer 3º círculo.'
  },
  {
    id: 'overclock', name: 'Overclock', element: 'energia', circle: 1, execution: 'Reação', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Força sucesso em teste de Tecnologia.', 
    normal: 'Ao fazer teste de Tecnologia, pode conjurar para garantir sucesso através de um minigame (estátua) com o mestre. Aparelho quebra após uso.', 
    discente: 'Só falha se errar duas vezes no jogo. Requer 2º círculo.', 
    verdadeiro: 'Só falha se errar três vezes. Requer 3º círculo.'
  },
  {
    id: 'polarizacao_caotica', name: 'Polarização Caótica', element: 'energia', circle: 1, execution: 'Padrão', range: 'Curto', target: 'Você', duration: 'Sustentada', resistance: 'Vontade anula', description: 'Gera aura magnética.', 
    normal: 'Atrair (puxa objeto metal espaço 2) ou Repelir (+5 resistência contra projéteis/arremessos).', 
    discente: 'Expelir: Arremessa 10 objetos (dano 1 ou 1d6 por espaço). Seres podem ser arremessados. Requer 2º círculo.', 
    verdadeiro: 'Alcance médio. Levita e move ser/objeto de metal (espaço 10) por 9m. Requer 3º círculo.'
  },

  // === 1º CÍRCULO: MORTE ===
  {
    id: 'amaldicoar_arma_morte', name: 'Amaldiçoar Arma (Morte)', element: 'morte', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 arma', duration: 'Cena', resistance: '-', description: 'Arma causa +1d6 de dano de Morte.', 
    normal: 'Você imbui a arma com o elemento. A arma causa +1d6 de dano de Morte.', 
    discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo.', 
    verdadeiro: 'Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade.'
  },
  {
    id: 'apagar_luzes', name: 'Apagar as Luzes', element: 'morte', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Apaga luzes e concede visão no escuro.', 
    normal: 'Qualquer fonte de luz em alcance curto se apaga (lâmpadas estouram, velas somem). Você recebe visão no escuro até o fim da cena.', 
    discente: 'Alcance para apagar luzes muda para longo. Requer 2º círculo.', 
    verdadeiro: 'Além de você, até 5 seres no alcance recebem visão no escuro. Requer 3º círculo.'
  },
  {
    id: 'cicatrizacao', name: 'Cicatrização', element: 'morte', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: '-', description: 'Acelera tempo para fechar feridas.', 
    normal: 'Recupera 3d8+3 PV. O alvo envelhece 1 ano.', 
    discente: 'Aumenta cura para 5d8+5 PV. Requer 2º círculo.', 
    verdadeiro: 'Alcance curto, "seres escolhidos", cura 7d8+7 PV. Requer 4º círculo e afinidade.'
  },
  {
    id: 'consumir_manancial', name: 'Consumir Manancial', element: 'morte', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Suga vida ao redor para ganhar PV temporário.', 
    normal: 'Suga vida de plantas/insetos. Recebe 3d6 PV temporários (duram até fim da cena).', 
    discente: 'PV temporários aumentam para 6d6. Requer 2º círculo.', 
    verdadeiro: 'Alvo vira esfera 6m raio. Suga 3d6 Morte de todos na área e ganha PV igual ao dano causado. Fortitude metade. Requer 3º círculo e afinidade.'
  },
  {
    id: 'decadencia', name: 'Decadência', element: 'morte', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: 'Fortitude metade', description: 'Acelera envelhecimento de parte do corpo.', 
    normal: 'Causa 2d8+2 dano de Morte.', 
    discente: 'Resistência nenhuma. Dano 3d8+3. Faz ataque corpo a corpo com arma: soma dano da arma + ritual.', 
    verdadeiro: 'Alcance pessoal, área explosão 6m raio. Dano 8d8+8 em todos. Requer 3º círculo.'
  },
  {
    id: 'definhar', name: 'Definhar', element: 'morte', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Cena', resistance: 'Fortitude parcial', description: 'Enfraquece o alvo.', 
    normal: 'Alvo fica fatigado. Se passar, fica vulnerável.', 
    discente: 'Alvo fica exausto. Se passar, fatigado. Requer 2º círculo.', 
    verdadeiro: 'Alvo até 5 seres. Requer 3º círculo e afinidade.'
  },
  {
    id: 'espirais_perdicao', name: 'Espirais da Perdição', element: 'morte', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Cena', resistance: '-', description: 'Penalidade em ações.', 
    normal: 'Espirais tornam movimentos lentos. Alvo sofre -1d20 em testes de ataque.', 
    discente: 'Penalidade muda para -2d20. Requer 2º círculo.', 
    verdadeiro: 'Penalidade -3d20 e alvo "seres escolhidos". Requer 3º círculo.'
  },
  {
    id: 'nuvem_cinzas', name: 'Nuvem de Cinzas', element: 'morte', circle: 1, execution: 'Padrão', range: 'Curto', target: 'Nuvem 6m raio', duration: 'Cena', resistance: '-', description: 'Obscurece visão.', 
    normal: 'Camuflagem (1,5m) e Camuflagem Total (3m+). Vento dispersa.', 
    discente: 'Seres escolhidos enxergam através da nuvem. Requer 2º círculo.', 
    verdadeiro: 'Nuvem quase sólida. Deslocamento vira 3m e -2 ataque dentro dela. Requer 3º círculo.'
  },

  // === 1º CÍRCULO: SANGUE ===
  {
    id: 'amaldicoar_arma_sangue', name: 'Amaldiçoar Arma (Sangue)', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 arma', duration: 'Cena', resistance: '-', description: 'Arma causa +1d6 de dano de Sangue.', 
    normal: 'A arma causa +1d6 de dano de Sangue e conta como mágica.', 
    discente: 'Muda bônus para +2d6. Requer 2º círculo.', 
    verdadeiro: 'Muda bônus para +4d6. Requer 3º círculo e afinidade.'
  },
  {
    id: 'arma_atroz', name: 'Arma Atroz', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 arma corpo a corpo', duration: 'Sustentada', resistance: '-', description: 'Aumenta letalidade da arma.', 
    normal: '+2 testes de ataque e +1 margem de ameaça.', 
    discente: '+5 testes de ataque. Requer 2º círculo.', 
    verdadeiro: '+5 ataque, +2 margem ameaça e +1 multiplicador crítico. Requer 3º círculo e afinidade.'
  },
  {
    id: 'armadura_sangue', name: 'Armadura de Sangue', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Proteção de sangue endurecido.', 
    normal: '+5 na Defesa (cumulativo com rituais, não com equipamento).', 
    discente: '+10 Defesa e RD (balístico/corte/impacto/perfuração) 5. Requer 3º círculo.', 
    verdadeiro: '+15 Defesa e RD 10. Requer 4º círculo e afinidade.'
  },
  {
    id: 'corpo_adaptado', name: 'Corpo Adaptado', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Cena', resistance: '-', description: 'Sobrevivência em ambientes hostis.', 
    normal: 'Imune a calor/frio extremos, respira na água, não sufoca em fumaça.', 
    discente: 'Duração 1 dia.', 
    verdadeiro: 'Alcance curto, alvos escolhidos.'
  },
  {
    id: 'distorcer_aparencia', name: 'Distorcer Aparência', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: 'Vontade desacredita', description: 'Muda aparência física.', 
    normal: '+10 Enganação para disfarce. Muda características físicas.', 
    discente: 'Alcance curto, 1 ser. Involuntário faz Vontade anula.', 
    verdadeiro: 'Alvos escolhidos. Requer 3º círculo.'
  },
  {
    id: 'esfolar', name: 'Esfolar', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Instantânea', resistance: 'Reflexos parcial', description: 'Projeta agulhas de sangue.', 
    normal: 'Causa 3d4+3 corte e deixa Sangrando. Passar: metade dano e evita condição.', 
    discente: 'Alcance médio, dano 5d4+5, alvo explosão 6m raio. Requer 2º círculo.', 
    verdadeiro: 'Alcance longo, dano 10d4+10, explosão 6m. Passar não evita sangrando. Requer 3º círculo.'
  },
  {
    id: 'fortalecimento_sensorial', name: 'Fortalecimento Sensorial', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Potencializa sentidos.', 
    normal: '+1d20 em Investigação, Luta, Percepção e Pontaria.', 
    discente: 'Inimigos sofrem -1d20 ataque contra você. Requer 2º círculo.', 
    verdadeiro: 'Imune a surpreendido/desprevenido, +10 Defesa e Reflexos. Requer 4º círculo e afinidade.'
  },
  {
    id: 'odio_incontrolavel', name: 'Ódio Incontrolável', element: 'sangue', circle: 1, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Cena', resistance: 'Vontade anula', description: 'Frenesi de combate.', 
    normal: '+2 ataque/dano corpo a corpo, RD física 5. Não pode fazer ações calmas, deve atacar sempre.', 
    discente: 'Ao usar agredir, faz um ataque extra. Requer 2º círculo.', 
    verdadeiro: 'Bônus sobe para +5 e RD para metade do dano físico. Requer 3º círculo e afinidade.'
  },

  // === 1º CÍRCULO: MEDO ===
  {
    id: 'cineraria', name: 'Cinerária', element: 'medo', circle: 1, execution: 'Padrão', range: 'Curto', target: 'Nuvem 6m raio', duration: 'Cena', resistance: '-', description: 'Névoa paranormal.', 
    normal: 'Rituais na névoa tem DT +5.', 
    discente: 'Rituais custam -2 PE na névoa.', 
    verdadeiro: 'Rituais na névoa causam dano maximizado.'
  },

  // === 2º CÍRCULO ===
  // CONHECIMENTO
  { id: 'aprimorar_mente', name: 'Aprimorar Mente', element: 'conhecimento', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Cena', resistance: '-', description: '+1 Int ou Pre.', normal: 'Recebe +1 em Intelecto ou Presença.', discente: '+2 (Requer 3º círculo).', verdadeiro: '+3 (Requer 4º círculo e afinidade).' },
  { id: 'aurora_verdade', name: 'Aurora da Verdade', element: 'conhecimento', circle: 2, execution: 'Padrão', range: 'Curto', target: 'Esfera 3m raio', duration: 'Sustentada', resistance: 'Vontade parcial', description: 'Impede mentiras.', normal: 'Obrigado a falar a verdade. Escondidos/Invisíveis são revelados.', discente: 'Alcance médio, 9m raio, conjurador imune.', verdadeiro: 'Alcance longo, duração Cena. Ouve tudo na área à distância.' },
  { id: 'deteccao_ameacas', name: 'Detecção de Ameaças', element: 'conhecimento', circle: 2, execution: 'Padrão', range: 'Pessoal', target: 'Esfera 18m raio', duration: 'Cena', resistance: '-', description: 'Percepção de perigo.', normal: 'Sente perigo. Movimento + Percepção DT 20 para saber direção.', discente: 'Não fica desprevenido, +5 resistência armadilhas.', verdadeiro: 'Duração 1 dia.' },
  { id: 'esconder_olhos', name: 'Esconder dos Olhos', element: 'conhecimento', circle: 2, execution: 'Livre', range: 'Pessoal', target: 'Você', duration: '1 rodada', resistance: '-', description: 'Invisibilidade.', normal: 'Invisível (+15 Furtividade). Quebra se atacar.', discente: 'Duração sustentada. Esfera de invisibilidade 3m (aliados).', verdadeiro: 'Padrão, Toque, Sustentada. Não quebra ao atacar.' },
  { id: 'invadir_mente', name: 'Invadir Mente', element: 'conhecimento', circle: 2, execution: 'Padrão', range: 'Médio', target: '1 ser', duration: 'Inst ou 1 dia', resistance: 'Vontade parcial', description: 'Dano ou Elo.', normal: 'Rajada: 6d6 Conhecimento + Atordoado (passar nega atordoado/metade). Elo: Comunicação mental.', discente: 'Rajada: 10d6. Elo: Sentidos compartilhados.', verdadeiro: 'Rajada: 10d6 em "seres escolhidos". Elo: Até 5 pessoas.' },
  { id: 'localizacao', name: 'Localização', element: 'conhecimento', circle: 2, execution: 'Padrão', range: 'Pessoal', target: 'Círculo 90m raio', duration: 'Cena', resistance: '-', description: 'Encontra pessoa/objeto.', normal: 'Indica direção/distância do mais próximo.', discente: 'Toque, 1h. Descobre caminho (rota) para lugar.', verdadeiro: 'Raio 1km.' },

  // ENERGIA
  { id: 'chamas_caos', name: 'Chamas do Caos', element: 'energia', circle: 2, execution: 'Padrão', range: 'Curto', target: 'Varia', duration: 'Cena', resistance: '-', description: 'Manipula fogo.', normal: 'Chamejar (arma +1d6 fogo), Esquentar (1d6/rodada), Extinguir (fumaça), Modelar (move chama, 3d6 dano).', discente: 'Sustentada. Jato de 4d6 (Reflexos metade).', verdadeiro: 'Dano 8d6.' },
  { id: 'contencao_fantasmagorica', name: 'Contenção Fantasmagórica', element: 'energia', circle: 2, execution: 'Padrão', range: 'Médio', target: '1 ser', duration: 'Cena', resistance: 'Reflexos anula', description: 'Agarrado por laços.', normal: 'Agarrado. Atletismo quebra laços.', discente: '6 laços, pode dividir alvos.', verdadeiro: 'Laço destruído causa 2d6+2 dano Energia.' },
  { id: 'dissonancia_acustica', name: 'Dissonância Acústica', element: 'energia', circle: 2, execution: 'Padrão', range: 'Médio', target: 'Esfera 6m raio', duration: 'Sustentada', resistance: '-', description: 'Surdez/Silêncio.', normal: 'Todos surdos. Impede rituais.', discente: 'Alvo 1 objeto. Silêncio 3m raio. Vontade anula (involuntário).', verdadeiro: 'Cena. Nenhum som sai, mas dentro ouvem normal.' },
  { id: 'sopro_caos', name: 'Sopro do Caos', element: 'energia', circle: 2, execution: 'Padrão', range: 'Médio', target: 'Varia', duration: 'Sustentada', resistance: '-', description: 'Manipula ar.', normal: 'Ascender (levita alvo), Sopro (cone 4,5m empurrar), Vento (cria vento forte).', discente: 'Afeta alvos Grandes.', verdadeiro: 'Afeta Enormes.' },
  { id: 'tela_ruido', name: 'Tela de Ruído', element: 'energia', circle: 2, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Absorção de dano.', normal: '30 PV temporários contra balístico/corte/impacto/perfuração. Ou Reação para RD 15 contra 1 ataque.', discente: '60 PV ou RD 30.', verdadeiro: 'Curto, 1 ser/objeto Enorme. Esfera impenetrável.' },
  { id: 'tremeluzir', name: 'Tremeluzir', element: 'energia', circle: 2, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Sustentada', resistance: '-', description: 'Atravessa objetos.', normal: 'Atravessa sólidos (gasta movimento). 25% falha. Cortar caminho sem penalidade. Sofre 1d4 energia/rodada.', discente: 'Toque, 1 ser voluntário.' },

  // MORTE
  { id: 'desacelerar_impacto', name: 'Desacelerar Impacto', element: 'morte', circle: 2, execution: 'Reação', range: 'Curto', target: '1 ser/objetos (10 esp)', duration: 'Até solo/Cena', resistance: '-', description: 'Queda lenta.', normal: 'Velocidade 18m/rodada. Dano queda/projétil cai à metade.', discente: 'Até 100 espaços.' },
  { id: 'eco_espiral', name: 'Eco Espiral', element: 'morte', circle: 2, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: '2 rodadas', resistance: 'Fortitude metade', description: 'Dano repetido.', normal: 'Padrão para concentrar, Padrão para descarregar. Repete dano sofrido na rodada como Morte.', discente: 'Até 5 seres.', verdadeiro: 'Duração 3 rodadas.' },
  { id: 'lingua_morta', name: 'Língua Morta', element: 'morte', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 cadáver', duration: 'Sustentada', resistance: '-', description: 'Fala com mortos.', normal: 'Cadáver responde 1 pergunta/rodada (máx 3). Depois vira esqueleto de lodo.', discente: 'Máx 4 rodadas. Vira enraizado.', verdadeiro: 'Máx 5 rodadas. Vira marionete.' },
  { id: 'miasma_entropico', name: 'Miasma Entrópico', element: 'morte', circle: 2, execution: 'Padrão', range: 'Médio', target: 'Nuvem 6m raio', duration: 'Instantânea', resistance: 'Fortitude parcial', description: 'Gás tóxico.', normal: '4d8 químico e enjoado.', discente: '6d8 Morte.', verdadeiro: 'Duração 3 rodadas (dano repetido).' },
  { id: 'paradoxo', name: 'Paradoxo', element: 'morte', circle: 2, execution: 'Padrão', range: 'Médio', target: 'Esfera 6m raio', duration: 'Instantânea', resistance: 'Fortitude metade', description: 'Implosão temporal.', normal: '6d6 Morte.', discente: 'Esfera média sustentada (4d6/rodada). Move 9m.', verdadeiro: '13d6. Se 0 PV, desintegrado.' },
  { id: 'velocidade_mortal', name: 'Velocidade Mortal', element: 'morte', circle: 2, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Sustentada', resistance: '-', description: 'Acelera tempo.', normal: 'Ação de movimento extra.', discente: 'Ação padrão extra.', verdadeiro: 'Alvos escolhidos.' },

  // SANGUE
  { id: 'aprimorar_fisico', name: 'Aprimorar Físico', element: 'sangue', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Cena', resistance: '-', description: '+1 For ou Agi.', normal: 'Recebe +1 em Força ou Agilidade.', discente: '+2.', verdadeiro: '+3.' },
  { id: 'descarnar', name: 'Descarnar', element: 'sangue', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: 'Fortitude parcial', description: 'Laceração.', normal: '6d8 dano e hemorragia (2d8/rodada). Passar: metade e sem hemorragia.', discente: '10d8 (4d8 hemorragia).', verdadeiro: 'Sustentada em você. Seus ataques causam +4d8 e hemorragia.' },
  { id: 'flagelo_sangue', name: 'Flagelo de Sangue', element: 'sangue', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Cena', resistance: 'Fortitude parcial', description: 'Marca de dor.', normal: 'Dá ordem. Desobedecer = 10d6 sangue e enjoado.', discente: 'Alvo "1 ser (exceto sangue)".', verdadeiro: 'Duração 1 dia.' },
  { id: 'hemofagia', name: 'Hemofagia', element: 'sangue', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: 'Fortitude metade', description: 'Roubo de vida.', normal: '6d6 sangue, cura metade.', discente: 'Resistência nenhuma. Ataque corpo a corpo com arma.', verdadeiro: 'Pessoal/Cena. Ação padrão toque 4d6 e cura.' },
  { id: 'sede_adrenalina', name: 'Sede de Adrenalina', element: 'sangue', circle: 2, execution: 'Reação', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Refaz teste físico.', normal: 'Refaz Acrobacia/Atletismo com Presença. OU reduz dano impacto em 20 (fica atordoado).', discente: 'Reduz 40.', verdadeiro: 'Reduz 70.' },
  { id: 'transfusao_vital', name: 'Transfusão Vital', element: 'sangue', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: '-', description: 'Transfere PV.', normal: 'Sofre até 30 dano para curar alvo mesma quantia.', discente: 'Até 50 PV.', verdadeiro: 'Até 100 PV.' },

  // MEDO
  { id: 'protecao_rituais', name: 'Proteção contra Rituais', element: 'medo', circle: 2, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Cena', resistance: '-', description: 'RD Paranormal.', normal: 'RD Paranormal 5 e +5 testes contra rituais.', discente: 'Até 5 seres.', verdadeiro: 'Até 5 seres, RD 10 e +10 testes.' },
  { id: 'rejeitar_nevoa', name: 'Rejeitar Névoa', element: 'medo', circle: 2, execution: 'Padrão', range: 'Curto', target: 'Nuvem 6m raio', duration: 'Cena', resistance: '-', description: 'Dificulta rituais.', normal: 'Rituais na área custam +2 PE e execução piora. Anula Cinerária.', discente: 'DT contra rituais na área -5.', verdadeiro: 'Dano de rituais na área é mínimo.' },

  // ----------------------------------------------------------------------------------------------
  // 3º CÍRCULO
  // ----------------------------------------------------------------------------------------------
  // CONHECIMENTO
  { id: 'alterar_memoria', name: 'Alterar Memória', element: 'conhecimento', circle: 3, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Instantânea', resistance: 'Vontade anula', description: 'Altera lembranças.', normal: 'Altera/apaga memória de até 1h atrás. Recupera em 1d4 dias.', verdadeiro: 'Até 24h atrás.' },
  { id: 'contato_paranormal', name: 'Contato Paranormal', element: 'conhecimento', circle: 3, execution: 'Completa', range: 'Pessoal', target: 'Você', duration: '1 dia', resistance: '-', description: 'Dados de auxílio.', normal: 'Recebe 6d6. Gaste para somar em perícia. Rolar 6 = perde 2 Sanidade.', discente: 'Dados d8 (8 tira 3 San).', verdadeiro: 'Dados d12 (12 tira 5 San).' },
  { id: 'mergulho_mental', name: 'Mergulho Mental', element: 'conhecimento', circle: 3, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Sustentada', resistance: 'Vontade parcial', description: 'Lê pensamentos.', normal: 'Desprevenido. Alvo falha = responde pergunta Sim/Não (verdade).', verdadeiro: 'À distância com objeto pessoal (1 dia execução).' },
  { id: 'relembrar_fragmento', name: 'Relembrar Fragmento', element: 'conhecimento', circle: 3, execution: 'Padrão', range: 'Toque', target: '1 objeto', duration: 'Instantânea', resistance: '-', description: 'Restaura texto.', normal: 'Restaura objeto escrito danificado enquanto tocar.', discente: 'Dura até fim da missão.', verdadeiro: 'Altera o objeto imperceptivelmente.' },
  { id: 'videncia', name: 'Vidência', element: 'conhecimento', circle: 3, execution: 'Completa', range: 'Ilimitado', target: '1 ser', duration: '5 rodadas', resistance: 'Vontade anula', description: 'Espiona à distância.', normal: 'Vê e ouve alvo através de reflexo. Teste/rodada para resistir.' },

  // ENERGIA
  { id: 'convocacao_instantanea', name: 'Convocação Instantânea', element: 'energia', circle: 3, execution: 'Padrão', range: 'Ilimitado', target: '1 objeto até 2 esp', duration: 'Instantânea', resistance: 'Vontade anula', description: 'Invoca objeto.', normal: 'Invoca objeto preparado para mão. Se com alguém, Vontade nega.', discente: 'Objeto até 10 espaços.', verdadeiro: 'Recipiente médio com itens (Perm, perde 1 PE).' },
  { id: 'milagre_ionizante', name: 'Milagre Ionizante', element: 'energia', circle: 3, execution: 'Completa', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: '-', description: 'Cura condição.', normal: 'Cura 1 condição (abalado, cego, etc), doença ou veneno. Alvo faz Fortitude DT 30 ou pega Infectcídio.', verdadeiro: 'Até 5 seres.' },
  { id: 'mutar', name: 'Mutar', element: 'energia', circle: 3, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Silêncio absoluto.', normal: 'Inibe emissão/recebimento de som. +10 Furtividade. Não pode falar.', discente: 'Toque, 1 ser.', verdadeiro: 'Curto, 5 seres.' },
  { id: 'salto_fantasma', name: 'Salto Fantasma', element: 'energia', circle: 3, execution: 'Padrão', range: 'Médio', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Teleporte.', normal: 'Viaja para ponto imaginado (precisa ter visto).', discente: 'Reação. Salta para adjacente (+10 Defesa).', verdadeiro: 'Longo, você e 2 aliados.' },
  { id: 'transfigurar_agua', name: 'Transfigurar Água', element: 'energia', circle: 3, execution: 'Padrão', range: 'Longo', target: 'Esfera 30m raio', duration: 'Cena', resistance: '-', description: 'Manipula água.', normal: 'Congelar, Derreter, Enchente, Evaporar (5d8 dano), Partir.', verdadeiro: 'Enchente +12m, Evaporar 10d8.' },
  { id: 'transfigurar_terra', name: 'Transfigurar Terra', element: 'energia', circle: 3, execution: 'Padrão', range: 'Longo', target: '9 cubos 1,5m', duration: 'Instantânea', resistance: '-', description: 'Manipula terra.', normal: 'Amolecer (desabamento 10d6), Modelar, Solidificar.', discente: '15 cubos.', verdadeiro: 'Afeta minerais/metais.' },

  // MORTE
  { id: 'ancora_temporal', name: 'Âncora Temporal', element: 'morte', circle: 3, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Cena', resistance: 'Vontade parcial', description: 'Impede movimento.', normal: 'Falha Vontade = não desloca. Passar 2 turnos acaba.', verdadeiro: 'Alvos a escolha.' },
  { id: 'fedor_putrido', name: 'Fedor Pútrido', element: 'morte', circle: 3, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Sustentada', resistance: '-', description: 'Cheiro de morte.', normal: 'Animais afastam. -3d20 Diplomacia. +5 Furtividade, +10 Enganação (fingir morto). Sofre 1d4 Morte/rodada.', discente: 'Toque, 1 ser.', verdadeiro: 'Curto, 5 seres.' },
  { id: 'poeira_podridao', name: 'Poeira da Podridão', element: 'morte', circle: 3, execution: 'Padrão', range: 'Médio', target: 'Nuvem 6m raio', duration: 'Sustentada', resistance: 'Fortitude metade', description: 'Nuvem de dano.', normal: '4d8 Morte na área/rodada. Sem cura.', verdadeiro: '4d8+16.' },
  { id: 'tentaculos_lodo', name: 'Tentáculos de Lodo', element: 'morte', circle: 3, execution: 'Padrão', range: 'Médio', target: 'Círculo 6m raio', duration: 'Cena', resistance: '-', description: 'Agarra área.', normal: 'Teste agarrar (Ocultismo) vs alvos. Dano 4d6 se vencer.', verdadeiro: '9m raio, 6d6 dano.' },
  { id: 'zerar_entropia', name: 'Zerar Entropia', element: 'morte', circle: 3, execution: 'Padrão', range: 'Curto', target: '1 pessoa', duration: 'Cena', resistance: 'Vontade parcial', description: 'Paralisia.', normal: 'Paralisado. Passar = Lento. Teste/turno para acabar.', discente: '1 ser.', verdadeiro: 'Seres escolhidos.' },

  // SANGUE
  { id: 'ferver_sangue', name: 'Ferver Sangue', element: 'sangue', circle: 3, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Sustentada', resistance: 'Fortitude parcial', description: 'Dano interno.', normal: '4d8 Sangue e Fraco. Passar = metade e não fraco.', verdadeiro: 'Seres escolhidos.' },
  { id: 'forma_monstruosa', name: 'Forma Monstruosa', element: 'sangue', circle: 3, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Transformação.', normal: 'Grande. +5 Ataque/Dano/Defesa. +30 PV. Só ataca. Sem fala/rituals.', discente: 'Imune condições.', verdadeiro: '+10 bônus, +50 PV.' },
  { id: 'odor_cacada', name: 'Odor da Caçada', element: 'sangue', circle: 3, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Faro e Perseguição.', normal: 'Ganha Faro. Perseguição: +5 Atletismo, sem custo esforço extra. Próxima cena: Fome e Sede.', discente: 'Toque, 1 ser.', verdadeiro: 'Curto, 5 seres.' },
  { id: 'purgatorio', name: 'Purgatório', element: 'sangue', circle: 3, execution: 'Padrão', range: 'Curto', target: 'Área 6m raio', duration: 'Sustentada', resistance: 'Fortitude parcial', description: 'Área de dor.', normal: 'Vuln. a danos físicos na área. Sair = 6d6 Sangue e teste Fortitude (falha = perde movimento).', },
  { id: 'vomitar_pestes', name: 'Vomitar Pestes', element: 'sangue', circle: 3, execution: 'Padrão', range: 'Médio', target: 'Enxame Grande', duration: 'Sustentada', resistance: 'Reflexos metade', description: 'Cria enxame.', normal: '5d12 Sangue na área/rodada. Move 12m.', discente: 'Agarra (Acrobacia/Atletismo escapar).', verdadeiro: 'Enorme, voo 18m.' },

  // MEDO
  { id: 'dissipar_ritual', name: 'Dissipar Ritual', element: 'medo', circle: 3, execution: 'Padrão', range: 'Médio', target: '1 ser/objeto ou área 3m', duration: 'Instantânea', resistance: '-', description: 'Remove rituais.', normal: 'Teste Ocultismo vs DT dos rituais ativos. Sucesso anula. Pode anular item amaldiçoado por 1 dia.' },

  // ----------------------------------------------------------------------------------------------
  // 4º CÍRCULO
  // ----------------------------------------------------------------------------------------------
  // CONHECIMENTO
  { id: 'controle_mental', name: 'Controle Mental', element: 'conhecimento', circle: 4, execution: 'Padrão', range: 'Médio', target: '1 pessoa/animal', duration: 'Sustentada', resistance: 'Vontade parcial', description: 'Domina mente.', normal: 'Obedece comandos (exceto suicidas). Teste/turno para livrar. Passar = Pasmo 1 rodada.', discente: '5 alvos.', verdadeiro: '10 alvos.' },
  { id: 'inexistir', name: 'Inexistir', element: 'conhecimento', circle: 4, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: 'Vontade parcial', description: 'Apaga da realidade.', normal: '10d12+10 Conhecimento. Passar = 2d12 e Debilitado. Se cair a 0 PV, apagado da existência.', discente: '15d12+15.', verdadeiro: '20d12+20.' },
  { id: 'possessao', name: 'Possessão', element: 'conhecimento', circle: 4, execution: 'Padrão', range: 'Longo', target: '1 pessoa', duration: '1 dia', resistance: 'Vontade anula', description: 'Troca de corpo.', normal: 'Assume controle do corpo. Sua ficha + atributos físicos do alvo. Se alvo morre, fica preso.', },
  { id: 'pronunciar_sigilo', name: 'Pronunciar Sigilo', element: 'conhecimento', circle: 4, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Instantânea', resistance: 'Vontade parcial', description: 'Efeito poderoso.', normal: 'Esquecer (Atordoado 1d4+1), Cegar (Cego), Inexistir (Some 1d4+1 rodadas).', discente: 'Alcance Extremo.', verdadeiro: 'Até 5 seres.' },

  // ENERGIA
  { id: 'alterar_destino', name: 'Alterar Destino', element: 'energia', circle: 4, execution: 'Reação', range: 'Pessoal', target: 'Você', duration: 'Instantânea', resistance: '-', description: 'Bônus massivo.', normal: '+15 em teste de resistência ou Defesa.', verdadeiro: 'Curto, 1 aliado.' },
  { id: 'deflagracao_energia', name: 'Deflagração de Energia', element: 'energia', circle: 4, execution: 'Completa', range: 'Pessoal', target: 'Explosão 15m raio', duration: 'Instantânea', resistance: 'Fortitude parcial', description: 'Explosão nuclear.', normal: '30d10 Energia. Quebra eletrônicos. Você imune.', verdadeiro: 'Alvos a escolha.' },
  { id: 'teletransporte', name: 'Teletransporte', element: 'energia', circle: 4, execution: 'Padrão', range: 'Toque', target: '5 seres', duration: 'Instantânea', resistance: '-', description: 'Viagem rápida.', normal: 'Até 1000km. Teste Ocultismo define precisão.', verdadeiro: 'Qualquer local na Terra.' },

  // MORTE
  { id: 'convocar_algoz', name: 'Convocar o Algoz', element: 'morte', circle: 4, execution: 'Padrão', range: '1,5m', target: '1 pessoa', duration: 'Sustentada', resistance: 'Vontade/Fortitude', description: 'Invoca perseguidor.', normal: 'Algoz persegue alvo. Curto: Vontade ou Abalado. Adjacente: Fortitude ou 0 PV (passar 6d6 Morte).', },
  { id: 'distorcao_temporal', name: 'Distorção Temporal', element: 'morte', circle: 4, execution: 'Padrão', range: 'Pessoal', target: 'Você/Área', duration: '3 rodadas', resistance: '-', description: 'Para o tempo.', normal: 'Bolsão temporal. Age mas não desloca/interage. Efeitos congelam.', },
  { id: 'fim_inevitavel', name: 'Fim Inevitável', element: 'morte', circle: 4, execution: 'Completa', range: 'Extremo', target: 'Vácuo 1,5m', duration: '4 rodadas', resistance: 'Fortitude parcial', description: 'Buraco negro.', normal: 'Puxa 30m (cair). Tocar vácuo = 100 dano Morte.', discente: '5 rodadas, você imune.', verdadeiro: '6 rodadas, escolhidos imunes.' },
  { id: 'singularidade_temporal', name: 'Singularidade Temporal', element: 'morte', circle: 4, execution: 'Padrão', range: 'Curto', target: '1 objeto não paranormal Médio', duration: 'Instantânea', resistance: 'Fortitude (usuário)', description: 'Envelhece objeto.', normal: 'Objeto avança no tempo até decompor/estragar. Em uso: teste Fortitude protege.', discente: 'Objeto Grande.', verdadeiro: 'Objeto Enorme.' },

  // SANGUE
  { id: 'capturar_coracao', name: 'Capturar o Coração', element: 'sangue', circle: 4, execution: 'Padrão', range: 'Curto', target: '1 pessoa', duration: 'Cena', resistance: 'Vontade parcial', description: 'Escraviza emoções.', normal: 'Paixão doentia. Vontade/turno ou obedece tudo.', },
  { id: 'involucro_carne', name: 'Invólucro de Carne', element: 'sangue', circle: 4, execution: 'Padrão', range: 'Curto', target: 'Clone', duration: 'Cena', resistance: '-', description: 'Cria cópia.', normal: 'Cópia sua com equipamento mundano. Sem mente (ordem movimento ou assumir controle).', },
  { id: 'martirio', name: 'Martírio de Sangue', element: 'sangue', circle: 4, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Sacrifício final.', normal: 'Faro, Visão Escuro, Cura 10, +10 Atq/Dano/Def, 30 PV temp. Perde mente. Vira criatura permanente no fim.', discente: '+20 bônus, 50 PV.' },
  { id: 'vinculo_sangue', name: 'Vínculo de Sangue', element: 'sangue', circle: 4, execution: 'Padrão', range: 'Curto', target: '1 ser', duration: 'Cena', resistance: 'Fortitude anula', description: 'Compartilha dano.', normal: 'Divide dano sofrido entre você e alvo (metade cada). Pode ser inverso.', },

  // MEDO
  { id: 'canalizar_medo', name: 'Canalizar o Medo', element: 'medo', circle: 4, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Permanente', resistance: '-', description: 'Transfere ritual.', normal: 'Transfere 1 ritual conhecido para alvo conjurar de graça 1 vez. Reduz seus PE máximos temporariamente.', },
  { id: 'conhecendo_medo', name: 'Conhecendo o Medo', element: 'medo', circle: 4, execution: 'Padrão', range: 'Toque', target: '1 pessoa', duration: 'Instantânea', resistance: 'Vontade parcial', description: 'Loucura instantânea.', normal: 'Falha: Sanidade 0 (Enlouquecendo). Sucesso: 10d6 mental e Apavorado.', },
  { id: 'lamina_medo', name: 'Lâmina do Medo', element: 'medo', circle: 4, execution: 'Padrão', range: 'Toque', target: '1 ser', duration: 'Instantânea', resistance: 'Fortitude parcial', description: 'Golpe de realidade.', normal: 'Falha: 0 PV (Morrendo). Sucesso: 10d8 Medo e Apavorado. Ferimento nunca cura (dor eterna).', },
  { id: 'medo_tangivel', name: 'Medo Tangível', element: 'medo', circle: 4, execution: 'Padrão', range: 'Pessoal', target: 'Você', duration: 'Cena', resistance: '-', description: 'Avatar do Medo.', normal: 'Imune a condições (atordoado, cego etc), doenças, venenos, críticos. Dano mundano não reduz abaixo de 1 PV.', },
  { id: 'presenca_medo', name: 'Presença do Medo', element: 'medo', circle: 4, execution: 'Padrão', range: 'Pessoal', target: 'Emanação 9m', duration: 'Sustentada', resistance: 'Vontade parcial', description: 'Aura de terror.', normal: '5d8 Mental + 5d8 Medo em quem estiver na área. Falha: Atordoado 1 rodada.', },
];