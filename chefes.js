// Catálogo de chefes, fundos e trilhas do Eita!
// 03/11/2026: mídias mais leves — vídeos VP9 com transparência em até 1080/1280 px, fundos em WebP 1920 px e
// músicas em Opus 96 kbps. Os originais continuam na pasta (as versões em uso têm o sufixo -leve ou extensão nova).
// 06/11/2026: Esqueleto migrado de vídeo para modelo 3D (glb3d) — ver boss3d.js. Melhora o enquadramento
// (sem corte da animação) e reduz o tráfego (glb 4,98MB em texturas 2048px vs vídeo 7,89MB). O campo "video"
// continua aqui como caminho de rollback (se glb3d for removido, o chefe volta a usar o vídeo normalmente).
// Cada partida sorteia um chefe (com o seu papel de parede) e uma música, passando por todos antes de repetir.
// som (opcional): áudio próprio que toca junto com o vídeo do ataque (o som do vídeo fica mudo).
// Golpe: tempos em segundos do vídeo (ou do clipe 3D, se glb3d); origem/trajeto em coordenadas normalizadas do quadro (0–1).
// glb3d (opcional): chefe renderizado em three.js em vez de vídeo. idle/ataque = nomes dos clipes de animação
// no .glb; tIgnicao/tBola/tPuxada/tArremesso = tempos (s) do efeito de fogo e da bola na mão, dentro do clipe
// de ataque — ajustados visualmente no protótipo teste-chefe-esqueleto-3d.html.
// 07/11/2026: Cão-Ninja migrado para 3D (Pug Ninja, Meshy + Mixamo; .glb sem compressão Draco, 2,98MB vs vídeo).
// O .glb não tem clipe de idle: o idle é a pose PARADA do 1º quadro do Walking (de frente, espadas para baixo —
// igual à arte original do Pug); o vai-e-volta do início do Sword_Judgment parecia um loop estranho.
// Ataque: salto → aterrissagem → giros → corte final para a direita, que lança o "corte" já existente;
// a pose final fica mantida até o impacto. efeito:'nenhum' (sem fogo/bola); enquadrar:'envelope' (ver boss3d.js).
// 07/11/2026: novo chefe IA Cyborg (3D desde o início, sem vídeo; .glb Meshopt + texturas WebP, 1,73MB).
// Ataque em sequência: pisada furiosa → salto com mortal → trecho final do arremesso (carga da bola encurtada
// de ~3s para ~0,7s), bola azul. Idle = pose PARADA do 1º quadro da pisada (em pé, braços para baixo, como a arte);
// 07/11 20h: novo papel de parede do Esqueleto (parque assombrado); "?v=" no caminho força o navegador a baixar
// a imagem nova (o site guarda imagens em cache por 7 dias). Ao trocar um fundo de novo, mude o ?v=.
// reflexo:1 porque o material é metálico (sem ambiente para refletir ele ficava quase preto).
// 07/11 20h30: Onça migrada para 3D (jaguar Meshy + Mixamo; .glb 29,6MB → 1,59MB com texturas 2048 WebP + Meshopt)
// e com fundo próprio (floresta). Idle = pose parada do 1º quadro do rolamento (em pé). Ataque: rolamento no lugar
// (noLugar:'xz') → arremesso: bola laranja se forma na mão e é lançada em 2,19s com o braço esticado para a direita;
// no fim volta suave à pose inicial. O vídeo continua como rollback. Tempos tBola/tPuxada/tArremesso contados no clipe já emendado (6,43s).
// 08/11/2026: IA Cyborg com novo .glb (mesmo modelo + clipe Idle_11; 16,3MB → 2,03MB, só os 3 clipes usados, WebP + Meshopt).
// Idle = Idle_11 em loop (posição inicial e final). Ataque: cambalhota empurrando a parede (Wall_Push_Jump_and_Flip,
// clipe inteiro, 2s) → agacha e carrega o tiro (Crouch_Charge_and_Throw inteiro, 7,67s; a bola se forma entre as mãos,
// passa para a mão direita e é lançada) → volta suave ao Idle_11. Tempos = os do Esqueleto no mesmo clipe (+2s da cambalhota).
// 08/11/2026: Onça com novo .glb (mesmo jaguar + clipes Idle_11 e Wave_One_Hand; 11,3MB → 0,95MB, só os 4 clipes usados).
// Idle = Idle_11 em loop, virado ~15° para a direita de quem olha (giro gravado no próprio clipe do .glb; no ataque ela
// volta de frente na transição). Ataque: rolamento → corte com a espada (lança a bola laranja, tempos iguais aos de antes)
// → acena com a mão (Wave_One_Hand inteiro, 4,1s) → volta suave ao Idle_11.
// 08/11/2026: Artemis migrada para 3D (Meshy em pose T + rig e animações do Mixamo, pacote Longbow; .glb WebP + Meshopt).
// Espelhada e girada 45° para mirar para a direita (onde fica o grupo) com o rosto visível; arco da versão Tripo preso na mão.
// Idle = Standing_Idle_01 (postura de arqueira). Ataque: puxa a flecha (Draw) → mira 1s (Overdraw) → solta (Recoil, flecha sai
// no começo do recoil) → volta ao idle. O vídeo continua como rollback; o som do ataque é o mesmo de antes.
window.EITA_CHEFES=[
  {
    id:'sombra',nome:'Sombra',video:'assets/chefe-7s-leve.webm',fundo:null,
    golpe:{tipo:'raio',inicio:2,fim:3.85,viagem:.22,cor:'#ff3d5e',
      trajeto:[[1.5,.884,.290],[2,.845,.232],[2.5,.866,.230],[3,.875,.233],[3.5,.870,.235],[4,.865,.236],[4.5,.866,.249],[5,.875,.300]]}
  },
  {
    id:'artemis',nome:'Artemis',video:'assets/chefes/artemis-leve.webm',fundo:'assets/chefes/artemis-fundo.webp',
    som:{src:'assets/audio/artemis.webm',ganho:.65},
    glb3d:{url:'assets/chefes-3d/artemis.glb?v=20261108',idle:'Standing_Idle_01',
      ataque:[{clip:'Standing_Draw_Arrow'},{clip:'Standing_Aim_Overdraw',de:0,ate:1.0},{clip:'Standing_Aim_Recoil'}],
      efeito:'nenhum',enquadrar:'envelope',noLugar:'xz'},
    golpe:{tipo:'flecha',inicio:2.27,viagem:.34,origem:[.64,.24],cor:'#ffc83d'}
  },
  {
    id:'cao-ninja',nome:'Cão-Ninja',video:'assets/chefes/cao-ninja-leve.webm',fundo:'assets/chefes/cao-ninja-fundo.webp',
    glb3d:{url:'assets/chefes-3d/pug-ninja.glb',idle:{clip:'Walking',quadro:0},ataque:'Sword_Judgment',
      efeito:'nenhum',enquadrar:'envelope',noLugar:true},
    golpe:{tipo:'corte',inicio:3.42,viagem:.4,origem:[.71,.35],cor:'#d4ff7a'}
  },
  {
    id:'guerreira',nome:'Guerreira',video:'assets/chefes/guerreira-leve.webm',fundo:'assets/chefes/biblioteca-fundo.webp',
    golpe:{tipo:'corte',inicio:6.2,viagem:.4,origem:[.96,.27],cor:'#ffcf5a'}
  },
  {
    id:'onca',nome:'Onça',video:'assets/chefes/onca-leve.webm',fundo:'assets/chefes/onca-fundo.webp',
    glb3d:{url:'assets/chefes-3d/onca.glb?v=20261108b',idle:'Idle_11',
      ataque:[{clip:'Roll_Dodge_3',de:0,ate:1.63},{clip:'Right_Hand_Sword_Slash',de:0,ate:1.5},{clip:'Wave_One_Hand',de:0,ate:4.1}],
      efeito:'bola',cor:0xff8a1f,enquadrar:'envelope',noLugar:'xz',
      tIgnicao:1.6,tBola:1.7,tPuxada:1.75,tArremesso:2.19},
    golpe:{tipo:'pow',inicio:2.19,viagem:.36,origem:[.64,.38],cor:'#ff8a1f'}
  },
  {
    id:'esqueleto',nome:'Esqueleto',video:'assets/chefes/esqueleto-leve.webm',fundo:'assets/chefes/esqueleto-fundo.webp?v=20261107c',
    glb3d:{url:'assets/chefes-3d/esqueleto-teste.glb',idle:'Idle_4',ataque:'Crouch_Charge_and_Throw',
      tIgnicao:0,tBola:2.0,tPuxada:4.5,tArremesso:5.1},
    golpe:{tipo:'pow',inicio:5.1,viagem:.55,origem:[.323,.456],cor:'#ff5a1a'}
  },
  {
    id:'ia-cyborg',nome:'IA Cyborg',video:null,fundo:'assets/chefes/ia-cyborg-fundo.webp',
    glb3d:{url:'assets/chefes-3d/ia-cyborg.glb?v=20261108',idle:'Idle_11',
      ataque:[{clip:'Wall_Push_Jump_and_Flip',de:0,ate:2},{clip:'Crouch_Charge_and_Throw',de:0,ate:7.67}],
      efeito:'bola',cor:0x2aa8ff,enquadrar:'envelope',noLugar:true,
      reflexo:1,luz:1.2,tIgnicao:3.8,tBola:4.0,tPuxada:6.5,tArremesso:7.1},
    golpe:{tipo:'pow',inicio:7.1,viagem:.55,origem:[.67,.6],cor:'#3ad1ff'}
  }
];

// "ganho" iguala o volume percebido entre as faixas (medido em LUFS; alvo ≈ −17 LUFS).
window.EITA_MUSICAS=[
  {src:'assets/audio/funny1.webm',ganho:.38},
  {src:'assets/audio/funny2.webm',ganho:.67},
  {src:'assets/audio/funny3.webm',ganho:.23},
  {src:'assets/audio/funny4.webm',ganho:.74},
  {src:'assets/audio/funny5.webm',ganho:.21}
];
window.EITA_AUDIO_FINAL={src:'assets/audio/final.webm',ganho:.86};
