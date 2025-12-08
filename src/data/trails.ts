export interface TrailAbility {
  nex: 10 | 40 | 65 | 99;
  name: string;
  description: string;
}

export interface Trail {
  id: string;
  name: string;
  class: 'combatente' | 'especialista' | 'ocultista';
  abilities: TrailAbility[];
}

export const TRAILS: Trail[] = [
  // ========================================================================
  // COMBATENTE
  // ========================================================================
  {
    id: 'aniquilador',
    name: 'Aniquilador',
    class: 'combatente',
    abilities: [
      { 
        nex: 10, 
        name: 'A Favorita', 
        description: 'Escolha uma arma para ser sua favorita (como uma katana ou fuzil de assalto). A categoria da arma escolhida é reduzida em I.' 
      },
      { 
        nex: 40, 
        name: 'Técnica Secreta', 
        description: 'A categoria da arma favorita passa a ser reduzida em II. Quando faz um ataque com ela, você pode gastar 2 PE para executar um efeito: Amplo (atinge alvo adjacente adicional) ou Destruidor (+1 no multiplicador de crítico).' 
      },
      { 
        nex: 65, 
        name: 'Técnica Sublime', 
        description: 'Adiciona novos efeitos à Técnica Secreta: Letal (+2 na margem de ameaça, pode escolher 2x) ou Perfurante (ignora 5 de RD).' 
      },
      { 
        nex: 99, 
        name: 'Máquina de Matar', 
        description: 'A categoria da arma favorita passa a ser reduzida em III. Se acertar um ataque com ela, pode gastar 4 PE para causar dano crítico máximo.' 
      },
    ]
  },
  {
    id: 'comandante_campo',
    name: 'Comandante de Campo',
    class: 'combatente',
    abilities: [
      { 
        nex: 10, 
        name: 'Estrategista', 
        description: 'Você pode gastar uma ação de movimento e 1 PE para analisar o campo de batalha. Você e seus aliados em alcance curto recebem +1 em Defesa e testes de perícia até o início do seu próximo turno.' 
      },
      { 
        nex: 40, 
        name: 'Inspirar Confiança', 
        description: 'Quando usa Estrategista, os bônus aumentam para +2. Além disso, se um aliado em alcance curto falhar em um teste, você pode gastar 2 PE para permitir que ele refaça o teste.' 
      },
      { 
        nex: 65, 
        name: 'Brecha na Guarda', 
        description: 'Como uma ação padrão, você pode gastar 2 PE para designar um inimigo em alcance médio. Até o início do seu próximo turno, o inimigo sofre -5 na Defesa e não pode realizar reações.' 
      },
      { 
        nex: 99, 
        name: 'Oficial Comandante', 
        description: 'Quando usa Estrategista, os bônus aumentam para +5. Além disso, aliados em alcance curto recebem +1d20 em testes de ataque.' 
      },
    ]
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    class: 'combatente',
    abilities: [
      { 
        nex: 10, 
        name: 'Técnica Letal', 
        description: 'Você recebe +2 na margem de ameaça com armas corpo a corpo.' 
      },
      { 
        nex: 40, 
        name: 'Revidar', 
        description: 'Sempre que bloquear um ataque, você pode gastar 2 PE para fazer um ataque corpo a corpo contra o atacante como uma reação (se ele estiver ao seu alcance).' 
      },
      { 
        nex: 65, 
        name: 'Força Opressora', 
        description: 'Quando acerta um ataque crítico com uma arma corpo a corpo, o alvo fica atordoado até o início do seu próximo turno (Fortitude DT VIG evita).' 
      },
      { 
        nex: 99, 
        name: 'Potência Máxima', 
        description: 'Seus ataques com armas corpo a corpo causam +2 dados de dano do mesmo tipo da arma. Se gastar 4 PE, o ataque ignora qualquer resistência a dano do alvo.' 
      },
    ]
  },
  {
    id: 'operacoes_especiais',
    name: 'Operações Especiais',
    class: 'combatente',
    abilities: [
      { 
        nex: 10, 
        name: 'Iniciativa Aprimorada', 
        description: 'Você recebe +5 em Iniciativa. Além disso, pode sacar ou guardar armas como uma ação livre.' 
      },
      { 
        nex: 40, 
        name: 'Ataque Extra', 
        description: 'Uma vez por rodada, quando faz a ação agredir, você pode gastar 2 PE para fazer um ataque adicional.' 
      },
      { 
        nex: 65, 
        name: 'Surto de Adrenalina', 
        description: 'Uma vez por cena, você pode gastar 5 PE para ganhar uma ação padrão adicional no seu turno.' 
      },
      { 
        nex: 99, 
        name: 'Sempre Alerta', 
        description: 'Você nunca fica surpreendido. Além disso, recebe +10 em Iniciativa e sua primeira ação na primeira rodada de combate tem custo de PE reduzido em -2.' 
      },
    ]
  },
  {
    id: 'tropa_choque',
    name: 'Tropa de Choque',
    class: 'combatente',
    abilities: [
      { 
        nex: 10, 
        name: 'Casca Grossa', 
        description: 'Você recebe +1 PV por nível de NEX. Além disso, quando usa a ação Bloquear, você soma seu Vigor na redução de dano.' 
      },
      { 
        nex: 40, 
        name: 'Cai Dentro', 
        description: 'Quando um inimigo adjacente ataca um aliado seu, você pode gastar 2 PE para forçá-lo a atacar você (Vontade DT VIG evita). Se ele atacar você, você recebe +5 na Defesa contra esse ataque.' 
      },
      { 
        nex: 65, 
        name: 'Muralha Intransponível', 
        description: 'Você recebe resistência a dano balístico, corte, impacto e perfuração 5. Se estiver usando proteção pesada ou escudo, a resistência aumenta para 10.' 
      },
      { 
        nex: 99, 
        name: 'Inquebrável', 
        description: 'Uma vez por cena, se for reduzido a 0 PV, você pode gastar 10 PE para voltar a ter metade dos seus PV máximos imediatamente.' 
      },
    ]
  },

  // ========================================================================
  // ESPECIALISTA
  // ========================================================================
  {
    id: 'atirador_elite',
    name: 'Atirador de Elite',
    class: 'especialista',
    abilities: [
      { 
        nex: 10, 
        name: 'Mira de Elite', 
        description: 'Você recebe proficiência com armas de fogo longas. Se já tiver, recebe +2 em rolagens de dano com elas.' 
      },
      { 
        nex: 40, 
        name: 'Disparo Impactante', 
        description: 'Você pode gastar 2 PE para realizar um ataque que ignora a resistência a dano do alvo ou tenta derrubá-lo (teste de manobra usando Pontaria).' 
      },
      { 
        nex: 65, 
        name: 'Atirar para Matar', 
        description: 'Seus ataques com armas de fogo têm a margem de ameaça aumentada em +2.' 
      },
      { 
        nex: 99, 
        name: 'Mira Aniquiladora', 
        description: 'Quando faz um ataque com arma de fogo, você pode gastar 5 PE para fazer um acerto automático (não rola o dado de ataque) e causar dano crítico máximo.' 
      },
    ]
  },
  {
    id: 'infiltrador',
    name: 'Infiltrador',
    class: 'especialista',
    abilities: [
      { 
        nex: 10, 
        name: 'Ataque Furtivo', 
        description: 'Uma vez por rodada, se atacar um alvo desprevenido ou flanqueado, você causa +1d6 de dano extra. O dano aumenta em +1d6 a cada 15% de NEX.' 
      },
      { 
        nex: 40, 
        name: 'Gatuno', 
        description: 'Você recebe +5 em Atletismo e Crime. Além disso, pode percorrer seu deslocamento normal quando furtivo sem penalidades.' 
      },
      { 
        nex: 65, 
        name: 'Assassino', 
        description: 'Seu Ataque Furtivo passa a usar dados de d8 em vez de d6. Se causar dano massivo em um alvo desprevenido, a DT do teste de Fortitude aumenta em +5.' 
      },
      { 
        nex: 99, 
        name: 'Sombra Fugaz', 
        description: 'Quando usa a ação Esconder-se, você pode fazê-lo mesmo se estiver sendo observado. Se tiver sucesso, você fica invisível até o fim do seu próximo turno ou até atacar.' 
      },
    ]
  },
  {
    id: 'medico_campo',
    name: 'Médico de Campo',
    class: 'especialista',
    abilities: [
      { 
        nex: 10, 
        name: 'Paramédico', 
        description: 'Você pode usar a perícia Medicina para curar PV de um aliado adjacente como uma ação padrão (cura 2d10+INT). Você não sofre penalidade por usar kit de medicina em combate.' 
      },
      { 
        nex: 40, 
        name: 'Equipe de Trauma', 
        description: 'Sua cura aumenta. Paramédico cura +1d10. Além disso, você pode gastar 2 PE para curar uma condição removível (como sangramento, envenenado, etc.) de um alvo.' 
      },
      { 
        nex: 65, 
        name: 'Resgate', 
        description: 'Uma vez por rodada, você pode se mover até o dobro do seu deslocamento para chegar adjacente a um aliado caído ou machucado sem provocar ataques de oportunidade.' 
      },
      { 
        nex: 99, 
        name: 'O Doutor', 
        description: 'Sua ação de Paramédico cura +2d10 (total base + 3d10). Além disso, uma vez por cena, você pode reviver um personagem que morreu na última rodada (DT 20 Medicina, custo 10 PE).' 
      },
    ]
  },
  {
    id: 'negociador',
    name: 'Negociador',
    class: 'especialista',
    abilities: [
      { 
        nex: 10, 
        name: 'Eloquência', 
        description: 'Você pode usar uma ação completa e 1 PE para fascinar uma pessoa ou criatura inteligente que possa ouvi-lo (Vontade DT PRE evita). O alvo fica fascinado enquanto você falar.' 
      },
      { 
        nex: 40, 
        name: 'Discurso Motivador', 
        description: 'Por uma ação padrão e 2 PE, aliados em alcance curto recebem +1d6 em testes de perícia até o final da cena (ou até falharem em um teste).' 
      },
      { 
        nex: 65, 
        name: 'Eu Já Sabia', 
        description: 'Uma vez por cena, como reação a um ataque ou habilidade inimiga, você pode gastar 4 PE para anular aquele ataque ou efeito, alegando que já tinha previsto e preparado uma contra-medida.' 
      },
      { 
        nex: 99, 
        name: 'Mestre da Lábia', 
        description: 'Você pode controlar as ações de um alvo fascinado pela sua Eloquência. No turno dele, você decide o que ele faz (dentro do razoável, sem ordens suicidas diretas).' 
      },
    ]
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    class: 'especialista',
    abilities: [
      { 
        nex: 10, 
        name: 'Inventário Otimizado', 
        description: 'Você soma seu Intelecto à sua força para calcular a carga máxima. Além disso, itens de categoria I contam como peso 0.' 
      },
      { 
        nex: 40, 
        name: 'Improvisar', 
        description: 'Você pode gastar 2 PE e uma ação completa para combinar objetos comuns e criar um item ou equipamento de categoria I ou II, que dura até o fim da cena.' 
      },
      { 
        nex: 65, 
        name: 'Preparado para Tudo', 
        description: 'Você pode reduzir a categoria de itens que carrega em I. Além disso, pode sacar qualquer item como ação livre.' 
      },
      { 
        nex: 99, 
        name: 'Mestre dos Itens', 
        description: 'O custo de categoria de todos os seus itens é reduzido em II (mínimo 0). Você sempre tem o item certo para a situação (a critério do mestre, pode gastar PE para "ter" um item não listado).' 
      },
    ]
  },

  // ========================================================================
  // OCULTISTA
  // ========================================================================
  {
    id: 'conduite',
    name: 'Conduíte',
    class: 'ocultista',
    abilities: [
      { 
        nex: 10, 
        name: 'Ampliar Ritual', 
        description: 'Você pode gastar +1 PE ao lançar um ritual para aumentar seu alcance em um passo (curto -> médio -> longo -> extremo) ou dobrar sua área de efeito.' 
      },
      { 
        nex: 40, 
        name: 'Acelerar Ritual', 
        description: 'Uma vez por rodada, você pode gastar +4 PE para lançar um ritual que tenha execução "ação padrão" como "ação livre".' 
      },
      { 
        nex: 65, 
        name: 'Anulação', 
        description: 'Você pode usar um ritual conhecido para anular um ritual conjurado por outro ser (teste oposto de Ocultismo), gastando PE igual ao custo do ritual anulado.' 
      },
      { 
        nex: 99, 
        name: 'Conduíte Supremo', 
        description: 'Você pode manter dois rituais sustentados simultaneamente sem gastar ações para o segundo. O custo de PE para sustentar rituais é reduzido em 1.' 
      },
    ]
  },
  {
    id: 'flagelador',
    name: 'Flagelador',
    class: 'ocultista',
    abilities: [
      { 
        nex: 10, 
        name: 'Poder do Sangue', 
        description: 'Você pode gastar seus próprios PV para pagar o custo de PE de rituais (2 PV por 1 PE). Você não pode reduzir seus PV abaixo de 1 dessa forma.' 
      },
      { 
        nex: 40, 
        name: 'Abraçar a Dor', 
        description: 'Sempre que sofre dano, você recupera uma quantidade de PE igual a metade do dano sofrido (mínimo 1). Limitado ao seu NEX por rodada.' 
      },
      { 
        nex: 65, 
        name: 'Absorver Agonia', 
        description: 'Quando um ser morre em alcance curto, você pode gastar uma reação para recuperar PV e PE iguais ao NEX/ND do ser (dividido entre os dois como quiser).' 
      },
      { 
        nex: 99, 
        name: 'Medo Tangível', 
        description: 'Você recebe +5 na DT dos seus rituais. Além disso, você se torna imune a dano de Medo e a condições mentais.' 
      },
    ]
  },
  {
    id: 'graduado',
    name: 'Graduado',
    class: 'ocultista',
    abilities: [
      { 
        nex: 10, 
        name: 'Saber Ampliado', 
        description: 'Você aprende um ritual adicional de 1º círculo. Além disso, recebe +1 ritual conhecido a cada novo Círculo desbloqueado (NEX 25%, 55%, 85%).' 
      },
      { 
        nex: 40, 
        name: 'Grimório Ritualístico', 
        description: 'Você possui um grimório que armazena rituais infinitos. Você pode preparar rituais nele. Se perder o grimório, perde acesso a esses rituais extras até recuperá-lo.' 
      },
      { 
        nex: 65, 
        name: 'Eficiência Mágica', 
        description: 'Escolha 3 rituais que você conhece. O custo de PE para lançá-los é reduzido em -2 (mínimo 1 PE).' 
      },
      { 
        nex: 99, 
        name: 'Conhecimento Proibido', 
        description: 'Você aprende um ritual de Medo. O custo de PE para rituais de Medo é reduzido pela metade para você.' 
      },
    ]
  },
  {
    id: 'intuitivo',
    name: 'Intuitivo',
    class: 'ocultista',
    abilities: [
      { 
        nex: 10, 
        name: 'Mente Sã', 
        description: 'Você soma sua Presença à sua Sanidade máxima e recebe resistência a dano mental 5.' 
      },
      { 
        nex: 40, 
        name: 'Presença Inabalável', 
        description: 'Você torna-se imune à condição Abalado. Além disso, quando faz um teste de resistência de Vontade, pode rolar dois dados e ficar com o melhor.' 
      },
      { 
        nex: 65, 
        name: 'Vontade de Ferro', 
        description: 'Você pode gastar 3 PE para ignorar o custo de Sanidade de um ritual ou efeito paranormal. Resistência mental aumenta para 10.' 
      },
      { 
        nex: 99, 
        name: 'Inquebrável', 
        description: 'Você se torna imune a dano de Sanidade e não pode enlouquecer. Sua mente é um forte impenetrável.' 
      },
    ]
  },
  {
    id: 'lamina_paranormal',
    name: 'Lâmina Paranormal',
    class: 'ocultista',
    abilities: [
      { 
        nex: 10, 
        name: 'Lâmina Maldita', 
        description: 'Você pode usar Ocultismo em vez de Luta para testes de ataque com armas corpo a corpo. Se fizer isso, o dano conta como dano mágico.' 
      },
      { 
        nex: 40, 
        name: 'Gladiador Paranormal', 
        description: 'Quando lança um ritual de execução padrão, você pode gastar 2 PE para fazer um ataque corpo a corpo como parte da mesma ação.' 
      },
      { 
        nex: 65, 
        name: 'Conjuração Marcial', 
        description: 'Se acertar um ataque corpo a corpo, você pode lançar um ritual de toque ou alvo "você" como ação livre no mesmo turno (custo normal de PE).' 
      },
      { 
        nex: 99, 
        name: 'Lâmina do Medo', 
        description: 'Seus ataques corpo a corpo ignoram imunidades a dano. Além disso, se acertar um crítico, o alvo fica Vulnerável a rituais até o fim do seu próximo turno.' 
      },
    ]
  },
];