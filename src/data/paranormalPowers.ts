// src/data/paranormalPowers.ts

export interface ParanormalPower {
    id: string;
    name: string;
    element: 'conhecimento' | 'energia' | 'morte' | 'sangue' | 'medo';
    description: string;
    prerequisites?: string;
}

export const PARANORMAL_POWERS: ParanormalPower[] = [
    // CONHECIMENTO    
    { id: 'compreensao_paranormal_poder', name: 'Compreensão Paranormal', element: 'conhecimento', description: 'Você recebe +5 em Intelecto (apenas para testes de perícia) e pode fazer testes de Ocultismo mesmo sem ser treinado.', prerequisites: '1 poder de Conhecimento' },
    { id: 'conhecimento_ampliado', name: 'Conhecimento Ampliado', element: 'conhecimento', description: 'Você aprende dois rituais de 1º círculo (se tiver NEX 45% ou mais, pode escolher um de 2º círculo).', prerequisites: 'Aprender Ritual' },
    { id: 'expansao_conhecimento', name: 'Expansão de Conhecimento', element: 'conhecimento', description: 'Você aprende um poder de outra classe. Você não pode escolher poderes que tenham pré-requisitos de classe.', prerequisites: '1 poder de Conhecimento' },
    { id: 'premonicao', name: 'Premonição', element: 'conhecimento', description: 'Você recebe +2 em Iniciativa e não pode ser surpreendido.', prerequisites: '2 poderes de Conhecimento' },
    { id: 'sensitivo', name: 'Sensitivo', element: 'conhecimento', description: 'Você recebe +5 em Percepção e pode sentir presenças paranormais próximas.' },

    // ENERGIA
    { id: 'afortunado', name: 'Afortunado', element: 'energia', description: 'Uma vez por rodada, você pode rolar novamente um teste de perícia que tenha falhado.' },
    { id: 'campo_protetor', name: 'Campo Protetor', element: 'energia', description: 'Você recebe +2 na Defesa e em testes de resistência contra efeitos de Energia.', prerequisites: '1 poder de Energia' },
    { id: 'carga_extra', name: 'Carga Extra', element: 'energia', description: 'Você recebe +1 PE por NEX.' },
    { id: 'golpe_sorte', name: 'Golpe de Sorte', element: 'energia', description: 'Sua margem de ameaça com todas as armas aumenta em +1.', prerequisites: '2 poderes de Energia' },
    { id: 'sobrecarga', name: 'Sobrecarga', element: 'energia', description: 'Quando lança um ritual de Energia ou causa dano com uma arma de Energia, você pode gastar 2 PE para aumentar o dano em +1 dado do mesmo tipo.', prerequisites: '1 poder de Energia' },

    // MORTE
    { id: 'consumir_materia', name: 'Consumir Matéria', element: 'morte', description: 'Você pode gastar uma ação completa para tocar um cadáver e recuperar 2d6 PV ou 2d6 PE.', prerequisites: '1 poder de Morte' },
    { id: 'escape_morte', name: 'Escape da Morte', element: 'morte', description: 'Uma vez por cena, se for sofrer dano que o levaria a 0 PV ou menos, você fica com 1 PV.', prerequisites: '2 poderes de Morte' },
    { id: 'potencial_aprimorado', name: 'Potencial Aprimorado', element: 'morte', description: 'Você recebe +1 PE por NEX. Se escolher este poder novamente, recebe +2 PE por NEX.' },
    { id: 'resistencia_morte', name: 'Resistência a Morte', element: 'morte', description: 'Você recebe Resistência a Morte 10.' },
    { id: 'surto_temporal', name: 'Surto Temporal', element: 'morte', description: 'Uma vez por rodada, você pode gastar 3 PE para realizar uma ação de movimento extra.', prerequisites: '2 poderes de Morte' },

    // SANGUE
    { id: 'adrenalina_poder', name: 'Adrenalina', element: 'sangue', description: 'Você recebe +5 em testes de resistência contra efeitos de medo e +2 em deslocamento.', prerequisites: '1 poder de Sangue' },    
    { id: 'armadura_sangue_poder', name: 'Armadura de Sangue', element: 'sangue', description: 'Você recebe +2 na Defesa, mas sofre -2 em testes de perícias baseadas em Intelecto e Presença.', prerequisites: '1 poder de Sangue' },
    { id: 'ferocidade', name: 'Ferocidade', element: 'sangue', description: 'Quando você sofre dano, recebe +2 em rolagens de dano corpo a corpo até o fim do seu próximo turno.' },
    { id: 'sangue_ferro', name: 'Sangue de Ferro', element: 'sangue', description: 'Você recebe +2 PV por NEX. Você pode escolher este poder várias vezes.' },
    { id: 'vigor_mortal', name: 'Vigor Mortal', element: 'sangue', description: 'Você soma seu Vigor aos seus PV em vez de apenas no nível 1.', prerequisites: '1 poder de Sangue' },
];