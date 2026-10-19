// Catálogo de chefes, fundos e trilhas do Eita!
// Cada partida sorteia um chefe (com o seu papel de parede) e uma música, passando por todos antes de repetir.
// som (opcional): áudio próprio que toca junto com o vídeo do ataque (o som do vídeo fica mudo).
// Golpe: tempos em segundos do vídeo; origem/trajeto em coordenadas normalizadas do quadro (0–1).
window.EITA_CHEFES=[
  {
    id:'sombra',nome:'Sombra',video:'assets/chefe-7s.webm',fundo:null,
    golpe:{tipo:'raio',inicio:2,fim:3.85,viagem:.22,cor:'#ff3d5e',
      trajeto:[[1.5,.884,.290],[2,.845,.232],[2.5,.866,.230],[3,.875,.233],[3.5,.870,.235],[4,.865,.236],[4.5,.866,.249],[5,.875,.300]]}
  },
  {
    id:'artemis',nome:'Artemis',video:'assets/chefes/artemis.webm',fundo:'assets/chefes/artemis-fundo.jpg',
    som:{src:'assets/audio/artemis.mp3',ganho:.65},
    golpe:{tipo:'flecha',inicio:4.55,viagem:.34,origem:[.97,.30],cor:'#ffc83d'}
  },
  {
    id:'cao-ninja',nome:'Cão-Ninja',video:'assets/chefes/cao-ninja.webm',fundo:'assets/chefes/cao-ninja-fundo.png',
    golpe:{tipo:'corte',inicio:2.45,viagem:.4,origem:[.93,.45],cor:'#d4ff7a'}
  },
  {
    id:'guerreira',nome:'Guerreira',video:'assets/chefes/guerreira.webm',fundo:'assets/chefes/biblioteca-fundo.jpg',
    golpe:{tipo:'corte',inicio:6.2,viagem:.4,origem:[.96,.27],cor:'#ffcf5a'}
  },
  {
    id:'onca',nome:'Onça',video:'assets/chefes/onca.webm',fundo:'assets/chefes/biblioteca-fundo.jpg',
    golpe:{tipo:'pow',inicio:5.35,viagem:.36,origem:[.95,.42],cor:'#ff8a1f'}
  }
];

// "ganho" iguala o volume percebido entre as faixas (medido em LUFS; alvo ≈ −17 LUFS).
window.EITA_MUSICAS=[
  {src:'assets/audio/funny1.mp3',ganho:.38},
  {src:'assets/audio/funny2.mp3',ganho:.67},
  {src:'assets/audio/funny3.mp3',ganho:.23},
  {src:'assets/audio/funny4.mp3',ganho:.74},
  {src:'assets/audio/funny5.mp3',ganho:.21}
];
window.EITA_AUDIO_FINAL={src:'assets/audio/final.mp3',ganho:.86};
