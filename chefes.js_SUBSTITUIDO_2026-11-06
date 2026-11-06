// Catálogo de chefes, fundos e trilhas do Eita!
// 03/11/2026: mídias mais leves — vídeos VP9 com transparência em até 1080/1280 px, fundos em WebP 1920 px e
// músicas em Opus 96 kbps. Os originais continuam na pasta (as versões em uso têm o sufixo -leve ou extensão nova).
// Cada partida sorteia um chefe (com o seu papel de parede) e uma música, passando por todos antes de repetir.
// som (opcional): áudio próprio que toca junto com o vídeo do ataque (o som do vídeo fica mudo).
// Golpe: tempos em segundos do vídeo; origem/trajeto em coordenadas normalizadas do quadro (0–1).
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
    golpe:{tipo:'corte',inicio:2.45,viagem:.4,origem:[.93,.45],cor:'#d4ff7a'}
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
    golpe:{tipo:'pow',inicio:5.15,viagem:.38,origem:[.96,.30],cor:'#ff5a1a'}
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
