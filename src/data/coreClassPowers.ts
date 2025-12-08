// src/data/coreClassPowers.ts

export interface CorePowerLevel {
    nex: 5 | 25 | 40 | 55 | 75 | 85 | 99; // Ampliado para aceitar todos os níveis usados
    cost?: string;
    description: string;
}

export interface CoreClassPower {
    id: string;
    name: string;
    class: 'combatente' | 'especialista' | 'ocultista';
    levels: CorePowerLevel[];
}

export const CORE_CLASS_POWERS: CoreClassPower[] = [
    {
        id: 'ataque_especial',
        name: 'Ataque Especial',
        class: 'combatente',
        levels: [
            { nex: 5, cost: '2 PE', description: 'Quando faz um ataque, você pode gastar 2 PE para receber +5 no teste de ataque ou na rolagem de dano.' },
            { nex: 25, cost: '3 PE', description: 'Você pode gastar 3 PE para receber +10 no teste de ataque ou na rolagem de dano.' },
            { nex: 55, cost: '4 PE', description: 'Você pode gastar 4 PE para receber +15 no teste de ataque ou na rolagem de dano.' },
            { nex: 85, cost: '5 PE', description: 'Você pode gastar 5 PE para receber +20 no teste de ataque ou na rolagem de dano.' }
        ]
    },
    {
        id: 'perito',
        name: 'Perito',
        class: 'especialista',
        levels: [
            { nex: 5, description: 'Escolha duas perícias nas quais você é treinado (exceto Luta e Pontaria). Quando faz um teste de uma dessas perícias, você pode gastar 2 PE para somar +1d6 no resultado do teste.' },
            { nex: 25, description: 'Você pode gastar 3 PE para somar +1d8.' },
            { nex: 55, description: 'Você pode gastar 4 PE para somar +1d10.' },
            { nex: 85, description: 'Você pode gastar 5 PE para somar +1d12.' }
        ]
    },
    {
        id: 'ecletico',
        name: 'Eclético',
        class: 'especialista',
        levels: [
            { nex: 5, cost: '2 PE', description: 'Quando faz um teste de uma perícia, você pode gastar 2 PE para receber os benefícios de ser treinado nesta perícia.' },
            { nex: 40, cost: '+2 PE', description: 'Você pode gastar 2 PE adicionais (4 PE total) para receber os benefícios de ser veterano na perícia.' },
            { nex: 75, cost: '+4 PE', description: 'Você pode gastar 4 PE adicionais (6 PE total) para receber os benefícios de ser expert na perícia.' },
            { nex: 99, cost: '', description: 'Melhoria de NEX 99%.' }
        ]
    },
    {
        id: 'escolhido_outro_lado',
        name: 'Escolhido pelo Outro Lado',
        class: 'ocultista',
        levels: [
            { nex: 5, description: 'Você pode lançar rituais de 1º círculo. A DT é 10 + Limite PE + INT/PRE.' },
            { nex: 25, description: 'Você pode lançar rituais de 2º círculo.' },
            { nex: 55, description: 'Você pode lançar rituais de 3º círculo.' },
            { nex: 85, description: 'Você pode lançar rituais de 4º círculo.' }
        ]
    }
];