export interface Origin {
  id: string;
  name: string;
  description: string;
  skills: string[];
  power: {
    name: string;
    description: string;
  };
  source: string;
}

export const ORIGINS: Origin[] = [
  // --- LIVRO DE REGRAS ---
  {
    id: 'academico',
    name: 'Acadêmico',
    description: 'Você era um pesquisador ou professor universitário. Seus estudos tocaram em assuntos misteriosos.',
    skills: ['Ciências', 'Investigação'],
    power: { name: 'Saber é Poder', description: 'Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.' },
    source: 'Livro de Regras'
  },
  {
    id: 'agente_saude',
    name: 'Agente de Saúde',
    description: 'Você era um profissional da saúde, treinado no atendimento e cuidado de pessoas.',
    skills: ['Intuição', 'Medicina'],
    power: { name: 'Técnica Medicinal', description: 'Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados.' },
    source: 'Livro de Regras'
  },
  {
    id: 'amnesico',
    name: 'Amnésico',
    description: 'Você perdeu a memória. Sabe apenas o próprio nome, ou nem isso.',
    skills: ['(Duas a escolha do Mestre)'],
    power: { name: 'Vislumbres do Passado', description: 'Uma vez por sessão, teste de Intelecto (DT 10) para reconhecer algo familiar. Se passar, recebe 1d4 PE temporários.' },
    source: 'Livro de Regras'
  },
  {
    id: 'artista',
    name: 'Artista',
    description: 'Você era um ator, músico ou escritor. Sua arte pode ter sido inspirada pelo paranormal.',
    skills: ['Artes', 'Enganação'],
    power: { name: 'Magnum Opus', description: 'Uma vez por missão, recebe +5 em testes de Presença e perícias de Presença contra alguém que te reconheça.' },
    source: 'Livro de Regras'
  },
  {
    id: 'atleta',
    name: 'Atleta',
    description: 'Você competia em um esporte. Seu desempenho pode ser fruto de algo sobrenatural.',
    skills: ['Acrobacia', 'Atletismo'],
    power: { name: '110%', description: 'Quando faz um teste de perícia usando Força ou Agilidade (exceto Luta e Pontaria) pode gastar 2 PE para receber +5.' },
    source: 'Livro de Regras'
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Cozinheiro profissional ou amador. Sua comida tem algo de especial.',
    skills: ['Fortitude', 'Profissão (Cozinheiro)'],
    power: { name: 'Ingrediente Secreto', description: 'Em interlúdios, ao cozinhar, o grupo recebe o benefício de dois pratos.' },
    source: 'Livro de Regras'
  },
  {
    id: 'criminoso',
    name: 'Criminoso',
    description: 'Você vivia fora da lei. A Ordem viu utilidade em seus talentos escusos.',
    skills: ['Crime', 'Furtividade'],
    power: { name: 'O Crime Compensa', description: 'No final de uma missão, escolha um item encontrado. Na próxima, ele não conta no limite de itens.' },
    source: 'Livro de Regras'
  },
  {
    id: 'cultista_arrependido',
    name: 'Cultista Arrependido',
    description: 'Você fez parte de um culto, mas algo abriu seus olhos. Agora você luta pelo lado certo.',
    skills: ['Ocultismo', 'Religião'],
    power: { name: 'Traços do Outro Lado', description: 'Possui um poder paranormal à escolha. Começa com metade da Sanidade normal.' },
    source: 'Livro de Regras'
  },
  {
    id: 'desgarrado',
    name: 'Desgarrado',
    description: 'Você não vivia de acordo com as normas da sociedade. A vida dura te fortaleceu.',
    skills: ['Fortitude', 'Sobrevivência'],
    power: { name: 'Calejado', description: 'Recebe +1 PV para cada 5% de NEX.' },
    source: 'Livro de Regras'
  },
  {
    id: 'engenheiro',
    name: 'Engenheiro',
    description: 'Você coloca a mão na massa e entende como as coisas funcionam.',
    skills: ['Profissão', 'Tecnologia'],
    power: { name: 'Ferramenta Favorita', description: 'Um item a sua escolha (exceto armas) conta como uma categoria abaixo.' },
    source: 'Livro de Regras'
  },
  {
    id: 'executivo',
    name: 'Executivo',
    description: 'Trabalho de escritório e burocracia. Você descobriu algo que não devia nos papéis.',
    skills: ['Diplomacia', 'Profissão'],
    power: { name: 'Processo Otimizado', description: 'Sempre que faz um teste de perícia durante um teste estendido, pode pagar 2 PE para receber +5.' },
    source: 'Livro de Regras'
  },
  {
    id: 'investigador',
    name: 'Investigador',
    description: 'Detetive ou perito forense. Você busca a verdade acima de tudo.',
    skills: ['Investigação', 'Percepção'],
    power: { name: 'Faro para Pistas', description: 'Uma vez por cena, ao procurar pistas, gaste 1 PE para receber +5 no teste.' },
    source: 'Livro de Regras'
  },
  {
    id: 'lutador',
    name: 'Lutador',
    description: 'Você resolve problemas com os punhos. O paranormal é só mais um oponente.',
    skills: ['Luta', 'Reflexos'],
    power: { name: 'Mão Pesada', description: 'Recebe +2 em rolagens de dano com ataques corpo a corpo.' },
    source: 'Livro de Regras'
  },
  {
    id: 'magnata',
    name: 'Magnata',
    description: 'Você tem recursos financeiros quase ilimitados. Dinheiro resolve (quase) tudo.',
    skills: ['Diplomacia', 'Pilotagem'],
    power: { name: 'Patrocinador da Ordem', description: 'Seu limite de crédito é sempre considerado um acima do atual.' },
    source: 'Livro de Regras'
  },
  {
    id: 'mercenario',
    name: 'Mercenário',
    description: 'Soldado de aluguel. Você luta por quem paga, mas agora a luta é pela sobrevivência.',
    skills: ['Iniciativa', 'Intimidação'],
    power: { name: 'Posição de Combate', description: 'No primeiro turno de uma cena de ação, pode gastar 2 PE para uma ação de movimento extra.' },
    source: 'Livro de Regras'
  },
  {
    id: 'militar',
    name: 'Militar',
    description: 'Treinamento tático e disciplina. Você sabe seguir ordens e atirar.',
    skills: ['Pontaria', 'Tática'],
    power: { name: 'Para Bellum', description: 'Recebe +2 em rolagens de dano com armas de fogo.' },
    source: 'Livro de Regras'
  },
  {
    id: 'operario',
    name: 'Operário',
    description: 'Trabalho braçal e prático. Você conhece o valor do esforço físico.',
    skills: ['Fortitude', 'Profissão'],
    power: { name: 'Ferramenta de Trabalho', description: 'Escolha uma arma que pode ser uma ferramenta (ex: marreta). Recebe +1 em ataque, dano e margem de ameaça com ela.' },
    source: 'Livro de Regras'
  },
  {
    id: 'policial',
    name: 'Policial',
    description: 'Agente da lei. Você jurou proteger e servir, mesmo contra o impossível.',
    skills: ['Percepção', 'Pontaria'],
    power: { name: 'Patrulha', description: 'Recebe +2 em Defesa.' },
    source: 'Livro de Regras'
  },
  {
    id: 'religioso',
    name: 'Religioso',
    description: 'Sua fé é sua armadura. Você lida com o espiritual diariamente.',
    skills: ['Religião', 'Vontade'],
    power: { name: 'Acalentar', description: 'Recebe +5 em Religião para acalmar. Ao acalmar, a pessoa recupera 1d6 + Presença de Sanidade.' },
    source: 'Livro de Regras'
  },
  {
    id: 'servidor_publico',
    name: 'Servidor Público',
    description: 'Você conhece os meandros do sistema e como mover a máquina pública.',
    skills: ['Intuição', 'Vontade'],
    power: { name: 'Espírito Cívico', description: 'Ao fazer um teste para ajudar, pode gastar 1 PE para aumentar o bônus concedido para +5.' },
    source: 'Livro de Regras'
  },
  {
    id: 'ti',
    name: 'T.I.',
    description: 'O mundo digital é seu playground. Informação é poder.',
    skills: ['Investigação', 'Tecnologia'],
    power: { name: 'Motor de Busca', description: 'A critério do mestre, pode gastar 2 PE para substituir um teste qualquer por Tecnologia (usando a internet).' },
    source: 'Livro de Regras'
  },
  {
    id: 'teorico_conspiracao',
    name: 'Teórico da Conspiração',
    description: 'Eles te chamavam de louco, mas você estava certo o tempo todo.',
    skills: ['Investigação', 'Ocultismo'],
    power: { name: 'Eu Já Sabia', description: 'Recebe resistência a dano mental igual ao seu Intelecto.' },
    source: 'Livro de Regras'
  },
  {
    id: 'trabalhador_rural',
    name: 'Trabalhador Rural',
    description: 'Você vive da terra e conhece a natureza melhor que ninguém.',
    skills: ['Adestramento', 'Sobrevivência'],
    power: { name: 'Desbravador', description: 'Não sofre penalidade em terreno difícil. Pode gastar 2 PE para receber +5 em Adestramento ou Sobrevivência.' },
    source: 'Livro de Regras'
  },
  {
    id: 'trambiqueiro',
    name: 'Trambiqueiro',
    description: 'A vida é um jogo de confiança, e você sabe trapacear.',
    skills: ['Crime', 'Enganação'],
    power: { name: 'Impostor', description: 'Uma vez por cena, gaste 2 PE para substituir um teste de perícia qualquer por Enganação.' },
    source: 'Livro de Regras'
  },
  {
    id: 'universitario',
    name: 'Universitário',
    description: 'Estudante em busca de conhecimento (e talvez confusão).',
    skills: ['Atualidades', 'Investigação'],
    power: { name: 'Dedicação', description: 'Recebe +1 PE (e +1 a cada NEX ímpar). Seu limite de PE por turno aumenta em 1.' },
    source: 'Livro de Regras'
  },
  {
    id: 'vitima',
    name: 'Vítima',
    description: 'Você sobreviveu a algo terrível. As cicatrizes te deixaram alerta.',
    skills: ['Reflexos', 'Vontade'],
    power: { name: 'Cicatrizes Psicológicas', description: 'Recebe +1 de Sanidade para cada 5% de NEX.' },
    source: 'Livro de Regras'
  },

  // --- SOBREVIVENDO AO HORROR ---
  {
    id: 'amigo_animais',
    name: 'Amigo dos Animais',
    description: 'Você tem um vínculo profundo com um animal. Ele é sua âncora de sanidade.',
    skills: ['Adestramento', 'Percepção'],
    power: { name: 'Companheiro Animal', description: 'Você possui um companheiro animal que fornece bônus e evolui com você.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'astronauta',
    name: 'Astronauta',
    description: 'Treinado para o ambiente mais hostil de todos: o espaço.',
    skills: ['Ciências', 'Fortitude'],
    power: { name: 'Acostumado ao Extremo', description: 'Você ignora penalidades de movimento por terreno difícil e climas extremos.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'chef_outro_lado',
    name: 'Chef do Outro Lado',
    description: 'Você descobriu ingredientes que não deveriam existir e como cozinhá-los.',
    skills: ['Ocultismo', 'Profissão (cozinheiro)'],
    power: { name: 'Fome do Outro Lado', description: 'Você pode cozinhar pratos com efeitos paranormais usando partes de criaturas.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'colegial',
    name: 'Colegial',
    description: 'A escola foi um inferno, mas te ensinou a lidar com hierarquias e aprender rápido.',
    skills: ['Atualidades', 'Tecnologia'],
    power: { name: 'Poder da Amizade', description: 'Quando ajuda um aliado, o bônus fornecido aumenta.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'cosplayer',
    name: 'Cosplayer',
    description: 'Você vive outras vidas através de fantasias.',
    skills: ['Artes', 'Vontade'],
    power: { name: 'Não é fantasia, é cosplay!', description: 'Ao usar um traje, recebe bônus em perícias relacionadas ao personagem.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'diplomata',
    name: 'Diplomata',
    description: 'Mestre em evitar conflitos (ou iniciá-los) com palavras.',
    skills: ['Atualidades', 'Diplomacia'],
    power: { name: 'Conexões', description: 'Você pode solicitar favores ou acesso a lugares restritos usando sua influência.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'experimento',
    name: 'Experimento',
    description: 'Seu corpo foi modificado contra sua vontade.',
    skills: ['Atletismo', 'Fortitude'],
    power: { name: 'Mutação', description: 'Recebe RD 2 e +2 em uma perícia física, mas sofre penalidade em Diplomacia.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Não há fronteira que você não possa cruzar.',
    skills: ['Fortitude', 'Sobrevivência'],
    power: { name: 'Manual do Sobrevivente', description: 'Gaste PE para receber bônus em resistência contra perigos ambientais e doenças.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'fanatico',
    name: 'Fanático por Criaturas',
    description: 'Você coleciona informações sobre monstros como hobby.',
    skills: ['Investigação', 'Ocultismo'],
    power: { name: 'Conhecimento Oculto', description: 'Se identificar uma criatura, recebe bônus em testes contra ela.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'fotografo',
    name: 'Fotógrafo',
    description: 'Você captura a verdade através da lente.',
    skills: ['Artes', 'Percepção'],
    power: { name: 'Através da Lente', description: 'Você pode usar Percepção para encontrar pistas e notar detalhes que outros perderiam.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'inventor',
    name: 'Inventor Paranormal',
    description: 'Ciência e ocultismo se misturam nas suas invenções.',
    skills: ['Profissão (engenheiro)', 'Vontade'],
    power: { name: 'Invenção Paranormal', description: 'Você pode criar engenhocas que simulam efeitos de rituais ou itens.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'jovem_mistico',
    name: 'Jovem Místico',
    description: 'Cristais, horóscopo e energias são sua realidade.',
    skills: ['Ocultismo', 'Religião'],
    power: { name: 'A Culpa é das Estrelas', description: 'Você pode rerolar testes baseados em sorte ou intuição.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'legista',
    name: 'Legista do Turno da Noite',
    description: 'Os mortos contam as melhores histórias.',
    skills: ['Ciências', 'Medicina'],
    power: { name: 'Luto Habitual', description: 'Você é resistente a efeitos de medo e perda de sanidade causados por cadáveres.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'mateiro',
    name: 'Mateiro',
    description: 'A mata é sua casa e você sabe seus caminhos.',
    skills: ['Percepção', 'Sobrevivência'],
    power: { name: 'Mapa Celeste', description: 'Você nunca se perde e pode guiar o grupo com facilidade em ambientes naturais.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'mergulhador',
    name: 'Mergulhador',
    description: 'As profundezas escondem segredos e você foi lá ver.',
    skills: ['Atletismo', 'Fortitude'],
    power: { name: 'Fôlego de Nadador', description: 'Você prende a respiração por muito mais tempo e nada sem penalidades.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'motorista',
    name: 'Motorista',
    description: 'Se tem rodas e motor, você pilota.',
    skills: ['Pilotagem', 'Reflexos'],
    power: { name: 'Mãos no Volante', description: 'Você recebe bônus em Pilotagem e pode usar veículos como armas ou cobertura móvel.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'nerd',
    name: 'Nerd Entusiasta',
    description: 'Você leu sobre isso em algum fórum obscuro.',
    skills: ['Ciências', 'Tecnologia'],
    power: { name: 'O Inteligentão', description: 'Você pode usar Intelecto em testes sociais para explicar conceitos complexos.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'profetizado',
    name: 'Profetizado',
    description: 'O destino tem planos para você, queira ou não.',
    skills: ['Vontade', '(Uma perícia a sua escolha)'],
    power: { name: 'Luta ou Fuga', description: 'Quando em perigo extremo, você recebe bônus para atacar ou fugir.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'psicologo',
    name: 'Psicólogo',
    description: 'A mente humana é frágil, e você sabe como consertá-la.',
    skills: ['Intuição', 'Profissão (psicólogo)'],
    power: { name: 'Terapia', description: 'Durante interlúdios, você pode ajudar aliados a recuperar Sanidade extra.' },
    source: 'Sobrevivendo ao Horror'
  },
  {
    id: 'reporter',
    name: 'Repórter Investigativo',
    description: 'A verdade precisa ser dita, custe o que custar.',
    skills: ['Atualidades', 'Investigação'],
    power: { name: 'Encontrar a Verdade', description: 'Você tem facilidade em obter informações e conectar pistas.' },
    source: 'Sobrevivendo ao Horror'
  },

  // --- HQs: O SEGREDO NA FLORESTA VOL. 2 ---
  {
    id: 'blaster_hq',
    name: 'Blaster',
    description: 'Especialista em causar destruição com disparos concentrados e munições especiais.',
    skills: ['Ocultismo', 'Pontaria'],
    power: { name: 'Munição Paranormal', description: 'Gaste 2 PE e uma ação de movimento para encantar um pacote de munição ou aljava. Recebe +1d6 dano paranormal de um elemento escolhido até o fim da cena.' },
    source: 'HQ: O Segredo na Floresta Vol. 2'
  },
  {
    id: 'body_builder_hq',
    name: 'Body Builder',
    description: 'Seu corpo foi esculpido para a perfeição física e intimidação pura.',
    skills: ['Atletismo', 'Intimidação'],
    power: { name: 'O Monstro Tá Saindo da Jaula', description: 'Gaste 2 PE para receber +2 em testes de perícia baseada em Força ou Vigor (exceto Luta e Pontaria).' },
    source: 'HQ: O Segredo na Floresta Vol. 2'
  },
  {
    id: 'personal_trainer_hq',
    name: 'Personal Trainer',
    description: 'Você sabe como motivar os outros a superarem seus limites físicos.',
    skills: ['Atletismo', 'Diplomacia'],
    power: { name: 'Instrutor', description: 'Gaste uma ação padrão e 2 PE para instruir um aliado em alcance curto. Ele recebe +5 em um teste de perícia baseada em Força, Agilidade ou Vigor até o fim da rodada.' },
    source: 'HQ: O Segredo na Floresta Vol. 2'
  },

  // --- HQs: INICIAÇÃO ---
  {
    id: 'cientista_forense_hq',
    name: 'Cientista Forense',
    description: 'A cena do crime conta uma história detalhada para quem sabe olhar.',
    skills: ['Ciências', 'Investigação'],
    power: { name: 'Investigação Científica', description: 'Uma vez por cena, você pode realizar a ação Procurar Pistas como uma ação livre.' },
    source: 'HQ: Iniciação'
  },
  {
    id: 'escritor_hq',
    name: 'Escritor',
    description: 'Sua mente guarda conhecimentos variados para compor suas histórias.',
    skills: ['Artes', 'Atualidades'],
    power: { name: 'Bagagem de Leitura', description: 'Gaste 2 PE para se tornar treinado em uma perícia a sua escolha até o final da cena.' },
    source: 'HQ: Iniciação'
  },
  {
    id: 'jornalista_hq',
    name: 'Jornalista (HQ)',
    description: 'Você tem contatos e sabe onde procurar as respostas.',
    skills: ['Atualidades', 'Investigação'],
    power: { name: 'Fontes Confiáveis', description: 'Uma vez por sessão, você pode rerolar um teste de procurar pistas recém realizado. Deve aceitar o segundo resultado.' },
    source: 'HQ: Iniciação'
  },
  {
    id: 'professor_hq',
    name: 'Professor',
    description: 'Compartilhar conhecimento é sua missão, mesmo em campo.',
    skills: ['Ciências', 'Intuição'],
    power: { name: 'Aula de Campo', description: 'Gaste uma ação padrão e 2 PE para conceder +5 em um teste de perícia a um aliado em alcance curto.' },
    source: 'HQ: Iniciação'
  },

  // --- HQs: O SEGREDO NA FLORESTA VOL. 1 ---
  {
    id: 'duble_hq',
    name: 'Dublê',
    description: 'Você aprendeu a cair, pular e se arriscar sem se quebrar.',
    skills: ['Pilotagem', 'Reflexos'],
    power: { name: 'Destemido', description: 'Recebe +5 em testes de perícia se a falha resultar em dano físico.' },
    source: 'HQ: O Segredo na Floresta Vol. 1'
  },
  {
    id: 'gauderio_abutre_hq',
    name: 'Gaudério Abutre',
    description: 'Um protetor incansável, acostumado a defender os seus.',
    skills: ['Luta', 'Sobrevivência'],
    power: { name: 'Protetor', description: 'Gaste 2 PE para receber +5 na Defesa contra um ataque que atingiria um aliado adjacente. Se errar, você não sofre dano. Se acertar, você sofre o dano no lugar dele.' },
    source: 'HQ: O Segredo na Floresta Vol. 1'
  },
  {
    id: 'ginasta_hq',
    name: 'Ginasta',
    description: 'Agilidade e leveza são suas maiores armas.',
    skills: ['Acrobacia', 'Reflexos'],
    power: { name: 'Mobilidade Acrobática', description: 'Se não estiver usando proteção pesada, recebe +2 na Defesa e seu deslocamento aumenta em +3m.' },
    source: 'HQ: O Segredo na Floresta Vol. 1'
  },
  {
    id: 'revoltado_hq',
    name: 'Revoltado',
    description: 'Você trabalha melhor sozinho e canaliza sua raiva em combate.',
    skills: ['Luta', 'Vontade'],
    power: { name: 'Lobo Solitário', description: 'Se não tiver aliados em alcance curto, recebe +2 em testes de ataque e +2 em rolagens de dano.' },
    source: 'HQ: O Segredo na Floresta Vol. 1'
  }
].sort((a, b) => a.name.localeCompare(b.name));