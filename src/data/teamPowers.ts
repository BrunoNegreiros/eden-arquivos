// CORREÇÃO: Importando 'TeamRole' em vez de 'RoleType' para bater com o Schema
import type { TeamRole } from '../types/characterSchema';

export interface TeamAbility {
  id: string;
  name: string;
  levels: { [key: number]: string };
}

export interface TeamRoleData {
  // CORREÇÃO: Usando TeamRole aqui
  id: TeamRole;
  name: string;
  description: string;
  abilities?: TeamAbility[];
  passive?: string;
}

export const TEAM_ROLES: TeamRoleData[] = [
  {
    id: 'tanque',
    name: 'Tanque',
    description: 'Focado em segurar ataques inimigos e proteger o time.',
    abilities: [
      {
        id: 'duro_na_queda', name: 'Duro na Queda',
        levels: {
          1: 'Você recebe +5 PV máximos.',
          2: 'Muda o bônus para +10 PV.',
          3: 'Muda o bônus para +15 PV.',
          4: 'Muda o bônus para +20 PV.',
          5: 'Muda o bônus para +25 PV. Além disso você consegue sobreviver uma rodada adicional durante a condição Morrendo.'
        }
      },
      {
        id: 'nervos_aco', name: 'Nervos de Aço',
        levels: {
          1: 'Você recebe +2 em testes de Fortitude.',
          2: 'Muda o bônus para +5.',
          3: 'Muda o bônus para +10.',
          4: 'Muda o bônus para +12.',
          5: 'Muda o bônus para +15. Além disso você recebe uma ação especial de defesa adicional por turno.'
        }
      },
      {
        id: 'protetor', name: 'Protetor',
        levels: {
          1: 'Aliados adjacentes a você recebem +2 de Defesa.',
          2: 'Aliados adjacentes a você recebem +5 de Defesa.',
          3: 'Aliados adjacentes a você recebem +10 de Defesa.',
          4: 'Aliados adjacentes a você recebem +12 de Defesa.',
          5: 'Aliados adjacentes a você recebem +15 de Defesa. Além disso você recebe +3 de Defesa para cada aliado em alcance curto de você.'
        }
      },
      {
        id: 'chamariz', name: 'Chamariz',
        levels: {
          1: 'No início de cada um dos seus turnos, seres em alcance curto de você que decidirem atacar um aliado seu devem rolar 1d12, em um resultado 1 ou 2 eles mudam o alvo para você.',
          2: 'O dado muda para 1d10.',
          3: 'O dado muda para 1d8.',
          4: 'O dado muda para 1d6.',
          5: 'O dado muda para 1d4. Além disso você pode bloquear inimigos afetados pelo efeito do chamariz sem contabilizar para o seu limite de ações especiais de defesa por turno.'
        }
      }
    ]
  },
  {
    id: 'suporte',
    name: 'Suporte',
    description: 'Focado em trazer vantagens para seu time no campo de batalha.',
    abilities: [
      {
        id: 'colaborador', name: 'Colaborador',
        levels: {
          1: 'Você fornece o dobro de pontos ao realizar a ação Ajudar.',
          2: 'Muda o bônus para o triplo de pontos.',
          3: 'Muda o bônus para o quadruplo de pontos.',
          4: 'Muda o bônus para o quintuplo de pontos.',
          5: 'Muda o bônus para o sextuplo de pontos. Além disso você recebe 3 PE temporários (cumulátivos) se um aliado que você ajudou passar em um teste que você ajudou.'
        }
      },
      {
        id: 'impulso', name: 'Impulso',
        levels: {
          1: 'Aliados que iniciarem seu turno adjacentes a você recebem +3m de deslocamento até o fim do turno deles.',
          2: 'Muda o bônus para +6m de deslocamento.',
          3: 'Muda o bônus para +9m de deslocamento.',
          4: 'Muda o bônus para +12m de deslocamento.',
          5: 'Muda o bônus para +15m de deslocamento. Além disso ele recebe uma ação de movimento adicional.'
        }
      },
      {
        id: 'ataque_equipe', name: 'Ataque em Equipe',
        levels: {
          1: 'Você e seus aliados adjacentes recebem +2 em testes de ataque.',
          2: 'Muda o bônus para +5 em testes de ataque.',
          3: 'Muda o bônus para +10 em testes de ataque.',
          4: 'Muda o bônus para +10 em testes de ataque e +5 em rolagens de dano.',
          5: 'Muda o bônus para +10 em testes de ataque e +10 em rolagens de dano. Além disso você pode fornecer sua ação padrão para um de seus aliados adjacentes, e vice-versa.'
        }
      },
      {
        id: 'mochileiro', name: 'Mochileiro',
        levels: {
          1: 'Você recebe +1 espaço livre no seu inventário para cada membro em sua equipe.',
          2: 'Muda o bônus para +2 espaços livres.',
          3: 'Muda o bônus para +3 espaços livres.',
          4: 'Muda o bônus para +4 espaços livres.',
          5: 'Muda o bônus para +5 espaços livres. Além disso você pode carregar um item adicional de cada categoria.'
        }
      }
    ]
  },
  {
    id: 'curandeiro',
    name: 'Curandeiro',
    description: 'Focado em curar feridas do time.',
    abilities: [
      {
        id: 'milagroso', name: 'Milagroso',
        levels: {
          1: 'Uma vez por cena, você pode tentar reviver um aliado que morreu ainda nessa cena, você deve tirar um resultado 10 em 1d10, se conseguir, ele revive e cura 2d4 PV.',
          2: 'Muda o teste para resultado 8 em 1d8 e a cura para 3d4.',
          3: 'Muda o teste para resultado 6 em 1d6 e a cura para 3d6.',
          4: 'Muda o teste para resultado 4 em 1d4 e a cura para 4d6.',
          5: 'Muda o teste para resultado 2 em 1d2 e a cura para 4d8. Uma vez por cena, você pode optar por perder uma quantidade de PE permanente igual ao seu Limite de PE para sucesso automático e cura dobrada.'
        }
      },
      {
        id: 'prevenir', name: 'Prevenir',
        levels: {
          1: 'Ao fim de cenas de interlúdio, você e todos seus aliados recebem PV temporários igual a metade de seus Limites de PE (não cumulativos, duração infinita).',
          2: 'Muda a quantidade para um valor igual a seus Limites de PE.',
          3: 'Muda a quantidade para um valor igual ao dobro de seus Limites de PE.',
          4: 'Muda a quantidade para um valor igual ao triplo de seus Limites de PE.',
          5: 'Muda a quantidade para um valor igual ao quadruplo de seus Limites de PE. Além disso, todos curam uma quantidade de PV igual ao dobro de seus Limites de PE.'
        }
      },
      {
        id: 'remediar', name: 'Remediar',
        levels: {
          1: 'Uma vez por cena. Ao utilizar uma habilidade, ritual ou item que cure um aliado ou a si mesmo, você pode curar o dobro de pontos.',
          2: 'Muda a quantidade de usos para duas vezes por cena.',
          3: 'Muda a cura para o triplo de pontos.',
          4: 'Muda a quantidade de usos para três vezes por cena.',
          5: 'Muda a cura para o quadruplo de pontos. Além disso, se o alvo curar mais do que metade de seus PV, recebe Cura Acelerada 2 (cumulativo).'
        }
      },
      {
        id: 'adrenalina', name: 'Adrenalina',
        levels: {
          1: 'Se um ou mais aliados estiverem morrendo em alcance curto, você recebe 1 ação de movimento adicional.',
          2: 'Adicionalmente, você recebe 1 ação padrão adicional.',
          3: 'Adicionalmente, você recebe +5 em testes baseados em Intelecto e Presença.',
          4: 'Adicionalmente, você recebe +5 em testes baseados em Força, Vigor e Agilidade.',
          5: 'Adicionalmente, você recebe mais outra ação de movimento e padrão adicionais. Se um aliado morrer em alcance médio, recebe os bônus até o fim da cena.'
        }
      }
    ]
  },
  {
    id: 'oportunista',
    name: 'Oportunista',
    description: 'Focado em ataques em alvos desprevenidos ou flanqueados.',
    abilities: [
      {
        id: 'oculto_fatal', name: 'Oculto e Fatal',
        levels: {
          1: 'Quando você ataca um alvo desprevenido, seu ataque tem a margem de ameaça aumentada em 2.',
          2: 'Muda o bônus em margem de ameaça para 4.',
          3: 'Muda o bônus em margem de ameaça para 6.',
          4: 'Muda o bônus em margem de ameaça para 8.',
          5: 'Muda o bônus em margem de ameaça para 10. Além disso, o múltiplicador de crítico desses ataques aumenta em 2.'
        }
      },
      {
        id: 'multidirecional', name: 'Multidirecional',
        levels: {
          1: 'Quando você ataca um alvo que esteja flanqueando, recebe +2 em rolagens de dano.',
          2: 'Muda o bônus para +5 em rolagens de dano.',
          3: 'Muda o bônus para +10 em rolagens de dano.',
          4: 'Muda o bônus para +12 em rolagens de dano.',
          5: 'Muda o bônus para +15 em rolagens de dano. Além disso, você recebe +10 nesse ataque.'
        }
      },
      {
        id: 'fragilizar', name: 'Fragilizar',
        levels: {
          1: 'Quando você acerta um ataque em um alvo, ele deve rolar 1d12, em um resultado 1 ou 2 ele fica desprevenido por 3 rodadas.',
          2: 'Muda o dado para 1d10.',
          3: 'Muda o dado para 1d8.',
          4: 'Muda o dado para 1d6.',
          5: 'Muda o dado para 1d4. Além disso, dobra quaisquer penalidades que ele receba por condições físicas e mentais.'
        }
      },
      {
        id: 'cobertura', name: 'Cobertura',
        levels: {
          1: 'Ao atacar alvo desprevenido/flanqueado em combate com aliado: alvo -2 ataque/dano, aliados +2 ataque (até fim do turno do alvo).',
          2: 'Muda a penalidade para -4 e o bônus para +4.',
          3: 'Muda a penalidade para -6 e o bônus para +6.',
          4: 'Muda a penalidade para -8 e o bônus para +8.',
          5: 'Muda a penalidade para -10 e o bônus para +10. Além disso, seus aliados recebem um aumento de +2 na margem de ameaça de seus ataques.'
        }
      }
    ]
  },
  {
    id: 'investigador',
    name: 'Investigador',
    description: 'Focado em investigar cenas de crime.',
    abilities: [
      {
        id: 'mente_inspiradora', name: 'Mente Inspiradora',
        levels: {
          1: 'Seus aliados recebem +2 em testes durante cenas de investigação.',
          2: 'Muda o bônus para +4.',
          3: 'Muda o bônus para +6.',
          4: 'Muda o bônus para +8.',
          5: 'Muda o bônus para +10. Além disso, eles recebem uma ação de movimento adicional.'
        }
      },
      {
        id: 'olheiro', name: 'Olheiro',
        levels: {
          1: 'Você e seus aliados recebem +2 de iniciativa.',
          2: 'Muda o bônus para +4.',
          3: 'Muda o bônus para +6.',
          4: 'Muda o bônus para +8.',
          5: 'Muda o bônus para +10. Além disso, você e seus aliados recebem uma ação de movimento adicional durante a primeira rodada.'
        }
      },
      {
        id: 'conhecimento_compartilhado', name: 'Conhecimento Compartilhado',
        levels: {
          1: 'Seus aliados escolhem cada um uma perícia na qual você seja no mínimo Treinado, eles recebem +2 por nível de treinamento que você possuir.',
          2: 'Os aliados podem escolher até duas perícias suas.',
          3: 'Os aliados podem escolher até três perícias suas.',
          4: 'Os aliados podem escolher até quatro perícias suas.',
          5: 'Os aliados podem escolher até cinco perícias suas. Além disso, o bônus aumenta para +3 por nível de treinamento.'
        }
      },
      {
        id: 'foco_inexaurivel', name: 'Foco Inexaurível',
        levels: {
          1: 'Você recebe +5 PE máximos.',
          2: 'Muda o bônus para +10.',
          3: 'Muda o bônus para +15.',
          4: 'Muda o bônus para +20.',
          5: 'Muda o bônus para +25. Além disso, uma vez por cena você pode usar uma habilidade sem gastar quaisquer PE.'
        }
      }
    ]
  },
  {
    id: 'terapeuta',
    name: 'Terapeuta',
    description: 'Focado em preservar a saúde mental do time.',
    abilities: [
      {
        id: 'mais_sao', name: 'O Mais São',
        levels: {
          1: 'Você recebe +5 SAN máxima.',
          2: 'Muda o bônus para +10.',
          3: 'Muda o bônus para +15.',
          4: 'Muda o bônus para +20.',
          5: 'Muda o bônus para +25.'
        }
      },
      {
        id: 'presenca_heroica', name: 'Presença Heróica',
        levels: {
          1: 'Aliados em alcance curto de você recebem +3 em testes de Vontade.',
          2: 'Muda o bônus para +6.',
          3: 'Muda o bônus para +9.',
          4: 'Muda o bônus para +12.',
          5: 'Muda o bônus para +15. O alcance da habilidade se torna ilimitado.'
        }
      },
      {
        id: 'choque_realidade', name: 'Choque de Realidade',
        levels: {
          1: 'Uma vez por cena: Tirar condição Insano (recente). 1d10 (alvo 10). Cura 2d4 SAN.',
          2: 'Muda o teste para resultado 8 em 1d8 e a cura para 3d4.',
          3: 'Muda o teste para resultado 6 em 1d6 e a cura para 3d6.',
          4: 'Muda o teste para resultado 4 em 1d4 e a cura para 4d6.',
          5: 'Muda o teste para resultado 2 em 1d2 e a cura para 4d8. Pode sacrificar PE permanente para sucesso automático e cura dobrada.'
        }
      },
      {
        id: 'preparem_mentes', name: 'Preparem suas Mentes',
        levels: {
          1: 'Interlúdio: Time recebe SAN temporária igual a metade de seus Limites de PE (não cumulativa, duração infinita).',
          2: 'Muda a quantidade para um valor igual a seus Limites de PE.',
          3: 'Muda a quantidade para um valor igual ao dobro de seus Limites de PE.',
          4: 'Muda a quantidade para um valor igual ao triplo de seus Limites de PE.',
          5: 'Muda a quantidade para um valor igual ao quadruplo de seus Limites de PE. Além disso, todos curam uma quantidade de PV igual ao dobro de seus Limites de PE.'
        }
      }
    ]
  },
  {
    id: 'sabotador',
    name: 'Sabotador',
    description: 'Focado em trazer desvantagens para os inimigos em batalha.',
    abilities: [
      {
        id: 'preparo', name: 'Preparo',
        levels: {
          1: 'Você e seus aliados recebem +5 em testes de Luta e Pontaria durante a primeira rodada de uma cena de ação.',
          2: 'Muda o bônus para +10.',
          3: 'Muda o bônus para +15.',
          4: 'Muda o bônus para +20.',
          5: 'Muda o bônus para +25. Adicionalmente, você e seus aliados recebem um bônus de +10 em rolagens de dano durante a primeira rodada de uma cena de ação.'
        }
      },
      {
        id: 'olhos_abertos', name: 'Olhos Sempre Abertos',
        levels: {
          1: 'Você recebe +2 em testes de Percepção.',
          2: 'Muda o bônus para +5.',
          3: 'Muda o bônus para +10.',
          4: 'Muda o bônus para +12.',
          5: 'Muda o bônus para +15. Além disso, você se torna imune as condições cego (se não surdo), desprevenido e surdo (se não cego).'
        }
      },
      {
        id: 'armadilha', name: 'Armadilha',
        levels: {
          1: '1/rodada: Ação completa (Tática DT 20). Instala armadilha (1,5m). Efeito: Agarrado, caído, cego ou surdo por 2 turnos. Reflexos/Percepção DT 15 evita. Com kit, pode mudar efeito.',
          2: 'Muda a duração para 1+1d2 turnos e aumenta a DT para 20.',
          3: 'Muda a duração para 2+1d3 turnos e aumenta a DT para 25.',
          4: 'Muda a duração para 2+1d4 turnos e aumenta a DT para 30.',
          5: 'Muda a duração para 2+1d6 turnos e aumenta a DT para 35. Bônus com Ocultismo/Componentes (dano elemental 2d6).'
        }
      },
      {
        id: 'estender', name: 'Estender',
        levels: {
          1: 'Uma vez por ser, você pode gastar uma ação completa para estender por mais uma rodada quaisquer condições que um alvo adjacente a você possua.',
          2: 'Muda o limite de usos para duas vezes por ser.',
          3: 'Muda o aumento da duração para mais duas rodadas.',
          4: 'Muda o limite de usos para três vezes por ser.',
          5: 'Muda o aumento da duração para mais três rodadas. Além disso, quaisquer penalidades que o alvo possua por estar nessa condição são dobradas.'
        }
      }
    ]
  },
  {
    id: 'polivalente',
    name: 'Polivalente',
    description: 'Focado em ajudar como pode nas diferentes necessidades do time.',
    abilities: [
      {
        id: 'multifuncoes', name: 'Multifunções',
        levels: {
          1: 'Escolha um Poder de Equipe que um aliado seu possua, você recebe ela, em seu nível I.',
          2: 'Escolha um Poder de Equipe adicional que um aliado seu possua.',
          3: 'Escolha um Poder de Equipe adicional que um aliado seu possua.',
          4: 'Escolha um Poder de Equipe adicional que um aliado seu possua.',
          5: 'Escolha um Poder de Equipe adicional que um aliado seu possua. Além disso, você pode aumentar dois Poderes de Equipe recebidos por meio desta habilidade para o nível II.'
        }
      },
      {
        id: 'melhor_em_tudo', name: 'Melhor em Tudo',
        levels: {
          1: 'Você recebe +3 em testes baseados em um atributo a sua escolha.',
          2: 'Escolha um segundo atributo adicional.',
          3: 'Escolha um terceiro atributo adicional.',
          4: 'Escolha um quarto atributo adicional.',
          5: 'Muda o efeito dessa habilidade para +3 em quaisquer testes. Além disso, você recebe +1 em um atributo a sua escolha.'
        }
      },
      {
        id: 'nao_tao_mal', name: 'Não Tão Mal',
        levels: {
          1: 'Reduz quaisquer penalidades que você e aliados adjacentes possuam em 1.',
          2: 'Muda a redução para 2.',
          3: 'Muda a redução para 3.',
          4: 'Muda a redução para 4.',
          5: 'Muda a redução para 5. Além disso, você e aliados adjacentes recebem +2d20 em testes de resistência.'
        }
      },
      {
        id: 'presenca_conveniente', name: 'Presença Conveniente',
        levels: {
          1: 'Aliados machucados em alcance curto recebem +2 em testes de Fortitude e Reflexos.',
          2: 'Adicionalmente, aliados com PE <= 50% tem os custos de habilidades reduzidos em 1 (cumulativo).',
          3: 'Adicionalmente, aliados com SAN <= 50% recebem +2 em testes de Vontade.',
          4: 'Aumenta redução de custo para 2 e bônus em testes para +5.',
          5: 'Aumenta redução de custo para 3 e bônus em testes para +10. Morrendo/Enlouquecendo dura +1 turno.'
        }
      }
    ]
  },
  {
    id: 'lobo_solitario',
    name: 'Lobo Solitário',
    description: 'Não trabalha em time. Focado em autossuficiência.',
    passive: 'Recebe -5 em quaisquer testes relacionados a interagir com um membro de time (curar um aliado, ajudar em um teste, etc.), recebe um poder de classe a sua escolha. E mais um poder de classe nos NEX 25%, 50%, 75% e 99%. Para cada poder de classe adicional (exceto o primeiro) que você receber graças a essa Classe de Time, você recebe -2 de penalidade adicional em quaisquer testes relacionados a interagir com um membro de time.'
  }
];