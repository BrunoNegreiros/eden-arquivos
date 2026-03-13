export const NATIONALITIES = {
    br: { country: "Brasil", names: ["Arthur", "Bruno", "César", "Daniel", "Eduardo", "Felipe", "Gabriel", "Hugo", "Igor", "João", "Ana", "Beatriz", "Carla", "Daniela", "Fernanda", "Gabriela", "Heloísa", "Isabela", "Júlia", "Luana"], surnames: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins"] },
    us: { country: "EUA", names: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"], surnames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"] },
    es: { country: "Espanha", names: ["Antonio", "Manuel", "Jose", "Francisco", "David", "Juan", "Javier", "Daniel", "Carlos", "Jesus", "Maria", "Carmen", "Ana", "Isabel", "Dolores", "Pilar", "Teresa", "Rosa", "Cristina", "Laura"], surnames: ["Garcia", "Gonzalez", "Rodriguez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin"] },
    mx: { country: "México", names: ["Santiago", "Mateo", "Sebastian", "Leonardo", "Matias", "Emiliano", "Diego", "Miguel", "Daniel", "Alexander", "Sofía", "Valentina", "Regina", "Camila", "Ximena", "Fernanda", "Valeria", "Victoria", "Renata", "Mariana"], surnames: ["Hernandez", "Garcia", "Martinez", "Gonzalez", "Lopez", "Rodriguez", "Perez", "Sanchez", "Ramirez", "Flores"] },
    fr: { country: "França", names: ["Gabriel", "Léo", "Raphaël", "Arthur", "Louis", "Lucas", "Adam", "Jules", "Hugo", "Maël", "Jade", "Louise", "Emma", "Ambre", "Alice", "Rose", "Anna", "Alba", "Mia", "Léna"], surnames: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent"] },
    it: { country: "Itália", names: ["Francesco", "Alessandro", "Leonardo", "Lorenzo", "Mattia", "Andrea", "Gabriele", "Riccardo", "Tommaso", "Edoardo", "Sofia", "Giulia", "Aurora", "Alice", "Ginevra", "Emma", "Giorgia", "Greta", "Beatrice", "Anna"], surnames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco"] },
    de: { country: "Alemanha", names: ["Maximilian", "Alexander", "Paul", "Elias", "Ben", "Noah", "Leon", "Louis", "Jonas", "Felix", "Mia", "Emma", "Hannah", "Sofia", "Anna", "Lea", "Emilia", "Marie", "Lena", "Leonie"], surnames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"] },
    ru: { country: "Rússia", names: ["Alexander", "Sergey", "Dmitry", "Andrey", "Alexey", "Maxim", "Ivan", "Mikhail", "Artem", "Nikita", "Anastasia", "Elena", "Olga", "Natalia", "Ekaterina", "Anna", "Tatiana", "Maria", "Irina", "Svetlana"], surnames: ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Vasiliev", "Petrov", "Sokolov", "Mikhailov", "Novikov", "Fedorov"] },
    kr: { country: "Coreia", names: ["Min-jun", "Seo-jun", "Ha-jun", "Do-yoon", "Yi-han", "Jun-woo", "Ji-ho", "Ye-jun", "Hyun-woo", "Ji-hu", "Seo-ah", "Ji-an", "Ha-yoon", "Seo-yoon", "Ha-eun", "Ji-woo", "Min-seo", "So-yoon", "Ji-yoo", "Chae-won"], surnames: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim"] },
    jp: { country: "Japão", names: ["Hiroshi", "Takashi", "Kenji", "Akira", "Kazuo", "Tadashi", "Yoshi", "Yoshio", "Tsuyoshi", "Hideo", "Yoko", "Yuki", "Kyoko", "Keiko", "Yumi", "Mayumi", "Kazuko", "Akemi", "Emiko", "Satoko"], surnames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"] }
};

export const ORIGINS_LIST = [
    { text: "Um profissional da saúde", cat: "Saúde, educação e cuidado humano" },
    { text: "Um monge", cat: "Administração, negócios e organização" },
    { text: "Um programador", cat: "Ciência, tecnologia e dados" },
    { text: "Um arqueólogo", cat: "Administração, negócios e organização" },
    { text: "Um cientista", cat: "Ciência, tecnologia e dados" },
    { text: "Um professor", cat: "Saúde, educação e cuidado humano" },
    { text: "Um detetive particular", cat: "Investigação, mídia e comunicação" },
    { text: "Um jornalista", cat: "Investigação, mídia e comunicação" },
    { text: "Um engenheiro", cat: "Engenharia, obras e planejamento urbano" },
    { text: "Um mecânico", cat: "Engenharia, obras e planejamento urbano" },
    { text: "Um policial", cat: "Segurança, emergência e combate" },
    { text: "Um bombeiro", cat: "Segurança, emergência e combate" },
    { text: "Um militar", cat: "Segurança, emergência e combate" },
    { text: "Um hacker", cat: "Ciência, tecnologia e dados" },
    { text: "Um estudante universitário", cat: "Saúde, educação e cuidado humano" },
    { text: "Um artista de rua", cat: "Arte, cultura e entretenimento" },
    { text: "Um músico", cat: "Arte, cultura e entretenimento" },
    { text: "Um atleta", cat: "Arte, cultura e entretenimento" },
    { text: "Um segurança particular", cat: "Segurança, emergência e combate" },
    { text: "Um motorista de aplicativo", cat: "Logística, transporte e operação" },
    { text: "Um caminhoneiro", cat: "Logística, transporte e operação" },
    { text: "Um fotógrafo", cat: "Investigação, mídia e comunicação" },
    { text: "Um cinegrafista", cat: "Investigação, mídia e comunicação" },
    { text: "Um historiador", cat: "Administração, negócios e organização" },
    { text: "Um guia turístico", cat: "Administração, negócios e organização" },
    { text: "Um bibliotecário", cat: "Saúde, educação e cuidado humano" },
    { text: "Um arquivista", cat: "Administração, negócios e organização" },
    { text: "Um urbanista", cat: "Engenharia, obras e planejamento urbano" },
    { text: "Um economista", cat: "Administração, negócios e organização" },
    { text: "Um contador", cat: "Administração, negócios e organização" },
    { text: "Um analista de dados", cat: "Ciência, tecnologia e dados" },
    { text: "Um designer gráfico", cat: "Arte, cultura e entretenimento" },
    { text: "Um arquiteto", cat: "Engenharia, obras e planejamento urbano" },
    { text: "Um editor de vídeos", cat: "Arte, cultura e entretenimento" },
    { text: "Um produtor de eventos", cat: "Arte, cultura e entretenimento" },
    { text: "Um publicitário", cat: "Investigação, mídia e comunicação" },
    { text: "Um profissional em relações públicas", cat: "Investigação, mídia e comunicação" },
    { text: "Um tradutor", cat: "Investigação, mídia e comunicação" },
    { text: "Um intérprete", cat: "Investigação, mídia e comunicação" },
    { text: "Um redator", cat: "Investigação, mídia e comunicação" },
    { text: "Um revisor de textos", cat: "Investigação, mídia e comunicação" },
    { text: "Um técnico de informática", cat: "Ciência, tecnologia e dados" },
    { text: "Um operador de telemarketing", cat: "Investigação, mídia e comunicação" },
    { text: "Um atendente de suporte", cat: "Investigação, mídia e comunicação" },
    { text: "Um supervisor de logística", cat: "Logística, transporte e operação" },
    { text: "Um estoquista", cat: "Logística, transporte e operação" },
    { text: "Um almoxarife", cat: "Logística, transporte e operação" },
    { text: "Um sócio de uma grande empresa", cat: "Administração, negócios e organização" },
    { text: "Um fiscal de obras", cat: "Engenharia, obras e planejamento urbano" },
    { text: "Um topógrafo", cat: "Engenharia, obras e planejamento urbano" }
];

export const PERSONALITIES = [
    "é meio deprê, mas tenta disfarçar com piada", "finge que não se importa, mas guarda rancor", "é confiante em público, inseguro por dentro", "fala pouco, mas observa tudo", "age no impulso e se arrepende depois", "tem medo de falhar e por isso trava", "faz piada em hora errada por nervosismo", "é gentil com estranhos, frio com quem conhece", "quer agradar todo mundo e se perde nisso", "é teimoso e odeia admitir erro", "se acha mais esperto do que realmente é", "evita conflitos, mesmo quando devia bater de frente", "tem dificuldade em confiar nas pessoas", "se apega fácil e sofre quando perde alguém", "vive cansado, mesmo sem motivo claro", "parece calmo, mas explode quando acumula demais", "se sente deslocado em quase todo lugar", "tem síndrome de impostor constantemente", "prefere fugir do problema a encarar", "é prático ao extremo e odeia papo emocional", "tenta controlar tudo porque odeia surpresas", "é leal até demais, mesmo quando não vale a pena", "desconfia de elogios e espera o pior", "se cobra muito mais do que cobra os outros", "faz promessas grandes e cumpre só metade", "tem dificuldade em pedir ajuda", "guarda segredos que só machucam a si mesmo", "é otimista na teoria, pessimista na prática", "finge que é durão, mas se abala fácil", "se sente responsável por problemas que não são seus", "vive comparando a própria vida com a dos outros", "é carismático, mas usa isso pra manipular às vezes", "se entedia rápido e larga projetos no meio", "gosta de estar certo mais do que de resolver o problema", "evita se apegar pra não se machucar", "leva tudo no sarcasmo pra não se expor", "é protetor demais com quem gosta", "odeia mudanças, mas vive se metendo nelas", "tem medo de ser esquecido", "prefere trabalhar sozinho porque confia pouco nos outros", "se fecha quando está mal e ninguém percebe", "se arrepende mais do que assume", "fica na defensiva quando se sente criticado", "tem dificuldade em dizer “não”", "quer ser reconhecido, mas finge que não liga", "é impulsivo quando se sente ameaçado", "se sente culpado por coisas fora do controle", "tem dificuldade em relaxar de verdade", "vive no “e se…” e se paralisa com isso", "tenta ser racional, mas decide pelo coração"
];

export const MANIAS = [
    "estala os dedos quando fica nervoso", "fica batucando na mesa enquanto pensa", "morde o lábio quando está mentindo", "evita contato visual em conversa difícil", "arruma objetos tortos sem perceber", "pede desculpa por coisas que não fez", "ri em momentos inadequados por nervosismo", "repete a última palavra da frase sem notar", "fica mexendo no celular sem necessidade", "balança a perna quando está ansioso", "suspira alto antes de responder perguntas simples", "corrige a gramática dos outros sem querer", "cutuca feridas antigas por hábito", "ajusta a roupa o tempo todo", "faz listas até pra coisas pequenas", "fala sozinho quando acha que ninguém vê", "evita pisar em rachaduras no chão", "reorganiza a mochila toda hora", "gira o anel no dedo quando está pensando", "aperta os punhos quando está com raiva", "confere o bolso várias vezes pra ver se perdeu algo", "olha para trás ao ouvir qualquer barulho", "coça a nuca quando está constrangido", "arranca a pele dos lábios quando está tenso", "checa portas e janelas mais de uma vez", "organiza tudo por cor sem perceber", "conta passos mentalmente ao andar", "fica ajustando o volume da TV o tempo todo", "se distrai fácil com qualquer barulho", "evita sentar de costas para a porta", "fica mexendo no cabelo quando está entediado", "lê a mesma frase várias vezes por insegurança", "bebe água em goles minúsculos", "faz caretas enquanto pensa", "tamborila os pés no chão sem perceber", "se desculpa antes de discordar", "arruma a cama mesmo sem necessidade", "fica alinhando talheres no prato", "revisa mensagens mil vezes antes de enviar", "fala baixo quando está inseguro", "suspira quando fica impaciente", "evita passar por lugares escuros", "muda de posição toda hora quando está sentado", "cutuca a unha dos dedos quando está ansioso", "organiza arquivos por data, não por nome", "aperta o maxilar quando está concentrado", "evita tocar em objetos pegajosos", "olha o relógio mesmo sem estar com pressa", "ajusta os óculos mesmo quando estão no lugar", "assobia baixinho quando está distraído"
];

export const FEARS = [
    "decepcionar quem confia nele", "ser abandonado quando mais precisa", "ficar sozinho por muito tempo", "perder alguém sem se despedir", "não ser bom o suficiente", "falhar quando depende dele", "repetir erros do passado", "ser esquecido por todos", "nunca sair do lugar", "não ter controle da própria vida", "ser traído por quem ama", "confiar na pessoa errada", "machucar quem gosta", "dizer a coisa errada", "tomar a decisão errada", "se arrepender tarde demais", "não conseguir proteger ninguém", "perder tudo de uma vez", "ser visto como fraco", "ser descartado quando não é útil", "ficar preso em uma rotina vazia", "nunca ser reconhecido", "não deixar nenhum legado", "ser um peso para os outros", "não conseguir mudar", "ser enganado de novo", "ser manipulado sem perceber", "perder o pouco que tem", "não ter para onde voltar", "se tornar alguém que odeia", "que descubram seus segredos", "ser exposto em público", "ficar dependente de alguém", "não conseguir dizer adeus", "ser substituído facilmente", "errar quando tudo depende dele", "se apegar e se machucar", "nunca se perdoar", "perder o controle numa crise", "não aguentar outra perda", "ser deixado para trás", "não ser levado a sério", "se tornar irrelevante", "nunca ser realmente entendido", "ficar preso ao passado", "não conseguir seguir em frente", "ser julgado por quem é", "falhar quando é observado", "que tudo dê errado de uma vez", "não encontrar um propósito"
];

export const SECRETS = [
    "deixou alguém assumir a culpa por um erro grave", "roubou dinheiro de alguém próximo quando estava desesperado", "mentiu em um processo importante e prejudicou outra pessoa", "abandonou alguém em um momento crítico", "sabotou o trabalho de um colega para se destacar", "escondeu uma denúncia que poderia ter evitado um problema grave", "traiu a confiança de alguém que nunca desconfiou", "manipulou uma situação para sair como vítima", "denunciou alguém inocente para se livrar de um problema", "se aproveitou da fragilidade emocional de alguém", "forjou um documento para conseguir uma oportunidade", "mentiu sobre o próprio passado para esconder um fracasso grave", "deixou alguém se dar mal para não perder o próprio emprego", "acobertou um erro que causou prejuízo a terceiros", "espalhou um boato que destruiu a reputação de alguém", "usou informações confidenciais para benefício próprio", "enganou alguém por meses para manter uma vantagem", "escondeu uma falha que colocou pessoas em risco", "roubou de alguém que confiava totalmente nele", "empurrou a responsabilidade para alguém mais fraco", "se beneficiou de um erro alheio sem avisar", "mentiu em um depoimento para proteger a própria imagem", "chantageou alguém para conseguir o que queria", "explorou o trabalho de outra pessoa e levou o crédito", "fingiu não ver uma injustiça para não se envolver", "causou um prejuízo grande e nunca assumiu", "traiu um amigo em troca de uma vantagem pessoal", "destruiu uma prova que poderia incriminá-lo", "manipulou alguém para fazer algo errado por ele", "se omitiu quando poderia ter impedido algo grave", "enganou alguém vulnerável para sair por cima", "vendeu uma informação que não lhe pertencia", "deixou alguém ser punido por algo que ele fez", "mentiu em um momento decisivo para salvar a própria pele", "usou uma pessoa como bode expiatório", "sabotou um projeto importante por inveja", "prejudicou alguém de propósito para se vingar", "encobriu um erro que causou demissões", "explorou a confiança de alguém por interesse financeiro", "se beneficiou de um golpe sem participar diretamente", "mentiu para a família sobre algo que causou grande dano", "provocou um conflito entre duas pessoas para se favorecer", "escondeu provas para não enfrentar consequências", "se aproveitou de um erro administrativo para ganhar dinheiro", "enganou alguém em um acordo importante", "omitiu uma informação que teria mudado tudo", "fez alguém duvidar da própria sanidade para se livrar de culpa", "manipulou documentos para esconder um problema sério", "traiu alguém que o ajudou quando ninguém mais ajudava", "destruiu a chance de alguém para proteger a própria reputação"
];

export const APPEARANCES = [
    "Veste uma camisa irada da sua banda favorita", "Sempre anda com um casaco largo, mesmo no calor", "Usa roupas simples e gastas, mas sempre limpas", "Tem uma cicatriz visível na boca causada por uma briga familiar", "Mantém o cabelo sempre preso, mesmo quando não precisa", "Usa óculos com armação torta, mas se recusa a trocar", "Tem olheiras profundas de noites mal dormidas", "Veste roupas escuras para não chamar atenção", "Sempre anda com uma mochila cheia de coisas inúteis", "Tem uma tatuagem antiga que tenta esconder", "Usa anéis ou pulseiras que nunca tira", "Veste roupas sociais fora de contexto", "Tem as mãos marcadas por calos de trabalho", "Sempre anda com fones de ouvido, mesmo sem música", "Usa boné para esconder o cabelo bagunçado", "Tem uma postura meio curvada, como se quisesse sumir", "Veste roupas largas para esconder o próprio corpo", "Tem um sorriso fácil, mesmo quando está mal", "Carrega um caderno velho cheio de anotações", "Usa um relógio antigo que vive atrasando", "Veste roupas chamativas que não combinam entre si", "Sempre anda com um copo de café na mão", "Tem o olhar cansado de quem dorme pouco", "Usa uma jaqueta surrada que já teve dias melhores", "Tem uma cicatriz discreta no antebraço", "Veste roupas muito arrumadas para parecer profissional", "Sempre anda com as mãos nos bolsos", "Tem marcas de sol no rosto e no pescoço", "Usa botas pesadas mesmo em ambientes formais", "Veste roupas velhas por apego emocional", "Sempre anda com um chaveiro barulhento preso na mochila", "Tem o cabelo descolorido de forma irregular", "Usa maquiagem leve para esconder cansaço", "Veste uma camisa social amassada quase todo dia", "Sempre anda com um pendrive preso no chaveiro", "Tem uma expressão séria que assusta quem não conhece", "Usa um cachecol fora de época", "Veste roupas confortáveis demais para o ambiente", "Tem um jeito inquieto de se mover", "Sempre anda com um bloco de notas no bolso", "Usa uma corrente no pescoço por superstição pessoal", "Veste uma jaqueta com patches costurados à mão", "Tem um corte recente que ainda não cicatrizou direito", "Usa luvas sem dedo para trabalhar", "Veste roupas neutras para não ser lembrado", "Sempre anda com uma câmera pendurada no pescoço", "Tem o cabelo sempre bagunçado, não importa o quanto tente arrumar", "Usa um sapato gasto que já foi confortável", "Veste uma peça de roupa que claramente não combina com o resto", "Sempre anda com um item de valor sentimental no bolso"
];

export const PARANORMAL_EVENTS: Record<string, string[]> = {
    "Saúde, educação e cuidado humano": [
        "notou que os sinais vitais de um indivíduo formavam uma melodia fúnebre em vez de batimentos rítmicos",
        "um livro antigo em seu local de trabalho começou a sangrar palavras que apenas ele conseguia ler",
        "um paciente ou aluno descreveu com detalhes uma criatura que estava parada logo atrás dele",
        "encontrou um prontuário ou registro histórico que datava a morte de uma pessoa para o dia seguinte",
        "uma epidemia súbita de pesadelos idênticos atingiu todos sob sua responsabilidade",
        "percebeu que o reflexo de uma pessoa em tratamento ou estudo não correspondia aos movimentos dela",
        "uma prece ou ensinamento causou uma manifestação física de lodo nas paredes",
        "descobriu que um ferimento em alguém que ele ajudava estava repleto de pequenos olhos dourados",
        "o silêncio de uma sala vazia foi quebrado por centenas de vozes sussurrando seu nome completo",
        "entrou em contato com um objeto de estudo que envelheceu suas mãos em décadas apenas pelo toque"
    ],
    "Ciência, tecnologia e dados": [
        "um código de programação ou fórmula matemática gerou uma imagem do \"Outro Lado\" no monitor",
        "interceptou um sinal de dados que continha gritos processados em frequências impossíveis para humanos",
        "um hardware começou a pulsar como um coração orgânico sob seus dedos",
        "notou que os resultados de uma análise previam um evento apocalíptico que começou a ocorrer minutos depois",
        "uma falha no sistema revelou um usuário logado que havia falecido há mais de dez anos",
        "documentou uma anomalia física que ignorava completamente as leis da gravidade e da entropia",
        "um vírus digital começou a se manifestar como marcas de queimadura na pele de quem operava a máquina",
        "processou um banco de dados que continha a consciência fragmentada de algo que nunca foi humano",
        "uma simulação de realidade virtual se tornou real demais, impedindo sua saída",
        "encontrou uma sequência numérica que, quando lida em voz alta, paralisou o tempo ao seu redor"
    ],
    "Investigação, mídia e comunicação": [
        "revelou uma fotografia ou vídeo onde as sombras das pessoas tinham vida própria e garras afiadas",
        "uma entrevista ou depoimento gravado foi substituído por uma voz gutural ditando rituais de Morte",
        "seguiu uma pista que o levou a um prédio que tecnicamente nunca existiu no mapa",
        "traduziu um texto ou mensagem que causou uma combustão espontânea em todos os papéis da sala",
        "uma transmissão de sinal aberto foi sequestrada por uma entidade que olhava diretamente para ele através da tela",
        "investigou um desaparecimento e encontrou apenas uma poça de lodo preto e o cheiro de mofo",
        "percebeu que um anúncio ou notícia pública continha mensagens subliminares que induziam ao pânico",
        "recebeu uma ligação de suporte onde o interlocutor descrevia exatamente como seria o seu próprio cadáver",
        "um arquivo morto revelou conspirações sobre uma seita que controlava os meios de comunicação",
        "notou que as palavras que ele escrevia ou revisava estavam mudando para símbolos de Conhecimento sozinhas"
    ],
    "Engenharia, obras e planejamento urbano": [
        "encontrou um espaço vazio entre duas paredes que era vastamente maior do que o tamanho do prédio",
        "uma escavação ou reparo atingiu uma estrutura feita inteiramente de ossos humanos petrificados",
        "uma planta arquitetônica mudou o desenho das ruas para formar um símbolo ritualístico",
        "percebeu que o metal e o concreto de uma obra estavam \"respirando\" de forma lenta e pesada",
        "uma ferramenta de precisão começou a indicar a presença de algo invisível e denso no centro da sala",
        "inspecionou um túnel ou subsolo e encontrou inscrições que brilhavam em um tom doentio de Energia",
        "uma falha estrutural revelou uma sala selada repleta de relíquias de um século passado",
        "notou que a bússola ou o nível laser apontavam para uma direção que não seguia as leis da física",
        "um acidente em uma obra foi causado por uma sombra que empurrou um colega para o abismo",
        "descobriu que a fundação de um bairro inteiro foi construída sobre o local de um massacre paranormal"
    ],
    "Segurança, emergência e combate": [
        "respondeu a um chamado e encontrou uma cena de crime onde o sangue subia pelas paredes em vez de escorrer",
        "uma arma falhou porque o tempo pareceu congelar no momento exato do disparo",
        "uma patrulha ou resgate o levou a uma área onde a floresta ou o asfalto tentou devorá-lo",
        "entrou em um incêndio e percebeu que as chamas eram azuis e não queimavam, mas sim apagavam a existência",
        "tentou conter um indivíduo que possuía a força física de dez homens e olhos completamente negros",
        "revisou as câmeras de segurança e viu a si mesmo conversando com uma criatura que ele não lembrava de ter visto",
        "uma granada ou explosivo abriu um buraco na realidade em vez de apenas destruir o alvo",
        "escoltou um pacote que emitia sussurros capazes de enlouquecer qualquer um que chegasse perto",
        "percebeu que o rastro que estava seguindo não pertencia a nenhum animal ou humano conhecido",
        "sobreviveu a um ataque que dizimou todo o seu esquadrão através de forças invisíveis e violentas"
    ],
    "Arte, cultura e entretenimento": [
        "compôs ou ouviu uma melodia que fazia as plantas ao redor murcharem e os espelhos racharem",
        "uma performance artística atraiu algo da penumbra que começou a imitar seus movimentos no palco",
        "uma pintura ou escultura que ele criou começou a chorar um líquido viscoso e escuro",
        "notou que o público de um evento estava entrando em um transe coletivo violento devido ao espetáculo",
        "um figurino ou instrumento antigo pareceu possuir seu corpo e ditar suas ações",
        "projetou um design que, quando finalizado, revelou uma verdade terrível sobre a origem do mundo",
        "percebeu que uma obra de arte famosa escondia um mapa para uma dimensão de dor",
        "viu uma edição de vídeo onde frames estranhos mostravam cenas de rituais ocorrendo no fundo da gravação",
        "um esforço físico extremo durante uma competição fez com que ele enxergasse o fluxo de Energia do universo",
        "organizou um evento em um local histórico e descobriu que os convidados \"extras\" não possuíam rosto"
    ],
    "Logística, transporte e operação": [
        "dirigiu por uma estrada que não acabava e cujas placas indicavam destinos em línguas esquecidas",
        "uma carga lacrada começou a bater desesperadamente por dentro, mesmo sendo apenas \"peças mecânicas\"",
        "o GPS indicou um caminho através de um lago ou parede, e o veículo realmente atravessou",
        "percebeu que o estoque que ele gerenciava continha itens que alteravam o peso e o tamanho aleatoriamente",
        "um passageiro desapareceu do banco de trás com o veículo em movimento e as portas travadas",
        "encontrou um contêiner ou caixa que estava coberta por uma névoa que nunca se dissipava",
        "um erro na contagem de inventário revelou que ele estava guardando objetos de outra linha temporal",
        "notou que o combustível do veículo foi substituído por um fluido dourado que o fazia acelerar além do limite humano",
        "uma entrega o levou a uma mansão que aparecia no endereço apenas durante as noites de lua nova",
        "operou um maquinário pesado que começou a falar com ele através de vibrações no metal"
    ],
    "Administração, negócios e organização": [
        "analisou um balanço financeiro cujos números negativos representavam anos de vida tirados dos funcionários",
        "uma reunião de diretoria foi interrompida por um acionista que não respirava e não possuía batimentos",
        "um contrato assinado em sangue começou a queimar sua pele toda vez que ele pensava em quebrá-lo",
        "organizou um arquivo e encontrou documentos que descreviam rituais realizados pelos fundadores da empresa",
        "percebeu que o sucesso súbito de um negócio estava ligado a sacrifícios ocultos feitos no escritório",
        "notou que o tempo passava de forma diferente dentro da sala de arquivos, onde minutos eram na verdade horas",
        "uma auditoria revelou que a empresa possuía propriedades em locais que não existem fisicamente",
        "encontrou um artefato histórico em um leilão ou acervo que sussurrava promessas de poder absoluto",
        "percebeu que todos os seus colegas de trabalho eram na verdade a mesma entidade trocando de pele",
        "descobriu que a hierarquia da sua organização era baseada em níveis de exposição a uma relíquia paranormal"
    ]
};

export const POSITIVE_TRAITS = [
    "sua lealdade aos companheiros é mais forte do que qualquer pesadelo", "seu senso de justiça brilha mais do que a escuridão", "nunca deixa ninguém para trás, independentemente do que precise enfrentar", "sua mente analítica consegue encontrar ordem até no caos mais absoluto", "mantém uma esperança inabalável de que o mundo ainda pode ser salvo", "sua coragem consegue inspirar aqueles que já perderam a vontade de lutar", "acredita que cada vida poupada justifica todo o horror que já testemunhou", "sua facilidade em se adaptar o torna um sobrevivente nato em qualquer cenário", "consegue manter a calma enquanto tudo ao redor parece desmoronar", "seu instinto de proteção é capaz de silenciar seus receios mais profundos", "carrega consigo um otimismo que serve de âncora para a sanidade da equipe", "sua determinação em descobrir a verdade é maior que seu instinto de sobrevivência", "enxerga beleza e humanidade mesmo nas situações mais desoladoras", "sua criatividade permite achar saídas onde os outros veem apenas paredes", "leva o legado dos que se foram como se fosse uma armadura de honra", "sua empatia permite entender a dor alheia e oferecer um conforto real", "nunca desiste de um rastro, por mais perigoso que ele pareça ser", "sua força de vontade é um escudo que quase nada consegue atravessar", "sabe que a união da equipe é a única arma que realmente faz diferença", "possui uma resiliência mental que desafia qualquer explicação lógica", "sua busca por redenção o transforma em alguém que nunca para de lutar", "trata cada novo amanhecer como uma oportunidade de mudar as coisas", "sua paciência é a virtude que salva o grupo de cometer erros fatais", "recusa-se terminantemente a ser apenas mais uma vítima do acaso", "sua fé no método e no progresso humano o mantém focado no objetivo", "é o porto seguro para quem sente que está prestes a perder o controle", "sua habilidade em improvisar torna o impossível algo ao alcance de todos", "carrega uma bondade genuína que nenhuma tragédia conseguiu corromper", "sua disciplina é o que mantém as engrenagens funcionando sob pressão", "entende que o frio na espinha é apenas um aviso, não uma barreira", "sua curiosidade é o que traz luz para os cantos que ninguém quer olhar", "é capaz de perdoar os erros do passado para conseguir focar no agora", "sua integridade moral é o que o impede de se tornar aquilo que combate", "possui um talento natural para guiar os outros quando o caminho desaparece", "sua memória impecável garante que nenhum sacrifício seja esquecido", "vê cada investigação como um dever sagrado para com quem é inocente", "sua agilidade mental permite que esteja sempre um passo à frente do perigo", "é a prova viva de que a vontade humana pode moldar o que é real", "sua capacidade de ouvir o torna o melhor confidente em horas de crise", "luta para que as próximas gerações nunca precisem ver o que ele viu", "sua coragem não vem da ausência de medo, mas de encará-lo todo dia", "encontra força na própria vulnerabilidade e poder na sua verdade", "sua dedicação aos estudos o torna uma fonte vital de respostas para o grupo", "possui uma intuição que raramente falha nos momentos mais decisivos", "seu humor ácido ajuda a aliviar o peso nos momentos de maior tensão", "acredita que o conhecimento é a única forma de vencer o desconhecido", "sua humildade permite aprender algo novo com cada erro cometido", "é o elo que mantém todos unidos quando as forças começam a acabar", "sua paixão pela vida é a maior defesa contra o fim de todas as coisas", "sabe que, enquanto houver alguém disposto a resistir, ainda haverá uma chance"
];