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
// O .glb não tem clipe de idle: o idle é o trecho inicial (em pé) do próprio Sword_Judgment, em vai-e-volta.
// Ataque: salto → aterrissagem → giros → corte final para a direita, que lança o "corte" já existente;
// a pose final fica mantida até o impacto. efeito:'nenhum' (sem fogo/bola); enquadrar:'envelope' (ver boss3d.js).
// 07/11/2026: novo chefe IA Cyborg (3D desde o início, sem vídeo; .glb Meshopt + texturas WebP, 1,73MB).
// Ataque em sequência: pisada furiosa → salto com mortal → trecho final do arremesso (carga da bola encurtada
// de ~3s para ~0,7s), bola azul. Tempos tBola/tPuxada/tArremesso contados no clipe já emendado (6,43s).
window.EITA_CHEFES=[
  {
    id:'sombra',nome:'Sombra',video:'assets/chefe-7s-leve.webm',fundo:null,
    golpe:{tipo:'raio',inicio:2,fim:3.85,viagem:.22,cor:'#ff3d5e',
      trajeto:[[1.5,.884,.290],[2,.845,.232],[2.5,.866,.230],[3,.875,.233],[3.5,.870,.235],[4,.865,.236],[4.5,.866,.249],[5,.875,.300]]}
  },
  {
    id:'artemis',nome:'Artemis',video:'assets/chefes/artemis-leve.webm',fundo:'assets/chefes/artemis-fundo.webp',
    som:{src:'assets/audio/artemis.webm',ganho:.65},
    golpe:{tipo:'flecha',inicio:4.05,viagem:.34,origem:[.97,.30],cor:'#ffc83d'}
  },
  {
    id:'cao-ninja',nome:'Cão-Ninja',video:'assets/chefes/cao-ninja-leve.webm',fundo:'assets/chefes/cao-ninja-fundo.webp',
    glb3d:{url:'assets/chefes-3d/pug-ninja.glb',idle:{clip:'Sword_Judgment',de:0,ate:.3},ataque:'Sword_Judgment',
      efeito:'nenhum',enquadrar:'envelope',noLugar:true},
    golpe:{tipo:'corte',inicio:3.42,viagem:.4,origem:[.71,.35],cor:'#d4ff7a'}
  },
  {
    id:'guerreira',nome:'Guerreira',video:'assets/chefes/guerreira-leve.webm',fundo:'assets/chefes/biblioteca-fundo.webp',
    golpe:{tipo:'corte',inicio:6.2,viagem:.4,origem:[.96,.27],cor:'#ffcf5a'}
  },
  {
    id:'onca',nome:'Onça',video:'assets/chefes/onca-leve.webm',fundo:'assets/chefes/biblioteca-fundo.webp',
    golpe:{tipo:'pow',inicio:5.35,viagem:.36,origem:[.95,.42],cor:'#ff8a1f'}
  },
  {
    id:'esqueleto',nome:'Esqueleto',video:'assets/chefes/esqueleto-leve.webm',fundo:'assets/chefes/esqueleto-fundo.webp',
    glb3d:{url:'assets/chefes-3d/esqueleto-teste.glb',idle:'Idle_4',ataque:'Crouch_Charge_and_Throw',
      tIgnicao:0,tBola:2.0,tPuxada:4.5,tArremesso:5.1},
    golpe:{tipo:'pow',inicio:5.1,viagem:.55,origem:[.323,.456],cor:'#ff5a1a'}
  },
  {
    id:'ia-cyborg',nome:'IA Cyborg',video:null,fundo:'assets/chefes/ia-cyborg-fundo.webp',
    glb3d:{url:'assets/chefes-3d/ia-cyborg.glb',idle:{clip:'Angry_Ground_Stomp',de:0,ate:.07},
      ataque:[{clip:'Angry_Ground_Stomp',de:0,ate:1.37},{clip:'Wall_Push_Jump_and_Flip',de:0,ate:1.88},{clip:'Crouch_Charge_and_Throw',de:3.6,ate:6.8}],
      efeito:'bola',cor:0x2aa8ff,enquadrar:'envelope',noLugar:true,
      luz:1.8,tIgnicao:3.3,tBola:3.48,tPuxada:4.13,tArremesso:5.08},
    golpe:{tipo:'pow',inicio:5.08,viagem:.55,origem:[.67,.6],cor:'#3ad1ff'}
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
