// boss3d.js — chefes do Eita! em modelo 3D (.glb, Meshy + Mixamo) renderizados em three.js,
// substituindo o vídeo para os chefes que tiverem "glb3d" definido em chefes.js.
//
// Geração: 06/11/2026, a partir do protótipo isolado teste-chefe-esqueleto-3d.html (já validado
// visualmente pelo usuário — pose, fogo em labareda, bola travada na mão, retorno automático ao
// idle, loop contínuo). Este módulo reaproveita a MESMA lógica, mas:
//  - não desenha mais a própria bola arremessada em voo nem o próprio impacto — isso continua
//    sendo feito pelo sistema já existente em app.js/styles.css (updateBossShot/golpe-impacto/
//    boss-projectile), reaproveitado tal como pedido;
//  - cada chefe com glb3d tem seu próprio modelo/clipes/tempos, mas compartilha uma única cena
//    three.js (troca o personagem dentro dela), em vez de recriar cena+luzes+partículas por chefe.
//
// Contrato com app.js (todas as funções abaixo em window.Boss3D):
//  disponivel(chefe)         -> bool, true se chefe.glb3d existir
//  preparar(chefe)           -> Promise, carrega/cacheia o .glb do chefe (chamar ao sortear o chefe)
//  mostrar(chefe)            -> ativa o canvas com esse chefe em pose idle (precisa já ter sido preparado)
//  esconder()                -> desativa o canvas (volta pro vídeo/arte estática dos outros chefes)
//  iniciarAtaque()           -> toca o clipe de ataque do chefe atualmente mostrado
//  pararEVoltarAoIdle(fade)  -> interrompe o ataque e volta ao idle (fade em segundos, padrão .15)
//  pausar(sim)                -> pausa/retoma a animação (equivalente a video.pause()/play())
//  tempoAtaque()              -> segundos decorridos no clipe de ataque atual (para updateBossShot)
//  duracaoAtaque(chefe)       -> duração total do clipe de ataque (para o cálculo de "remaining")
//  aoTerminarAtaque(fn)       -> registra callback chamado quando o clipe de ataque termina sozinho
//  capturarQuadroPng()        -> dataURL do quadro atual do canvas (usado no efeito de "vitória")
// 07/11/2026 (Cão-Ninja / Pug Ninja): três opções novas por chefe em chefes.js, sem mudar o Esqueleto:
//  - glb3d.efeito: 'fogo' (padrão, fogo + bola na mão do Esqueleto) ou 'nenhum' (só a animação);
//  - glb3d.idle pode ser um trecho de clipe {clip, de, ate} (s), tocado em vai-e-volta — para .glb sem clipe de idle;
//  - glb3d.noLugar:true — zera o avanço em profundidade do quadril no clipe de ataque (golpe no lugar);
//  - glb3d.enquadrar:'envelope' — a câmera é ajustada pelo espaço que o personagem ocupa em TODAS as poses do
//    idle e do ataque (saltos, giros, espada estendida), e não pela pose T de repouso do arquivo. Evita o corte
//    da animação no quadro (refaz a antiga characterFrame). Recalculado quando o canvas muda de tamanho.
// 07/11/2026 (IA Cyborg): mais três opções em chefes.js:
//  - .glb comprimido: o carregador agora abre Meshopt (EXT_meshopt_compression) e Draco (KHR_draco_mesh_compression);
//  - glb3d.ataque pode ser uma SEQUÊNCIA de trechos [{clip,de,ate}, ...] — vira um único clipe, emendado com
//    transição suave (0,2 s) e cada trecho recomeçando no mesmo ponto do chão (sem "pular" de lugar);
//  - glb3d.luz: multiplica a luz ambiente/principal só desse chefe (personagens escuros sobre fundos escuros);
//  - glb3d.efeito:'bola' (só a bola carregada nas mãos, sem o corpo em chamas) e glb3d.cor (cor da bola, ex. 0x2aa8ff).
window.Boss3D = (function(){
  let THREE, GLTFLoader, MeshoptDecoder, DRACOLoader;
  let prontoPromise = null;
  let scene, camera, renderer, canvas;
  let fireLight, keyLight, ambLight;
  let texChama, texturasLabareda;
  let subLabaredas, fagulhas;
  let bolaMesh, bolaMat, bolaGlow, bolaGlowMat, bolaLight;

  const cache = new Map(); // chefeId -> {modelRoot, mixer, acaoIdle, acaoAtaque, mao, maoEsq, antebraco, material, bbCenter, bbSize, duracaoAtaque, tempos}
  let chefeAtivoId = null;
  let estadoAtaque = null; // {lancado:false}
  let pausado = false;
  let callbackFim = null;

  function carregarThree(){
    if(prontoPromise) return prontoPromise;
    prontoPromise = import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js').then(mod=>{
      THREE = mod;
      return import('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js');
    }).then(mod=>{
      GLTFLoader = mod.GLTFLoader;
      return Promise.all([
        import('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/meshopt_decoder.module.js').then(m=>{ MeshoptDecoder=m.MeshoptDecoder; }).catch(()=>{}),
        import('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/DRACOLoader.js').then(m=>{ DRACOLoader=m.DRACOLoader; }).catch(()=>{})
      ]);
    }).then(()=>{
      inicializarCena();
    });
    return prontoPromise;
  }

  function inicializarCena(){
    canvas = document.getElementById('bossCanvas');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    ambLight = new THREE.AmbientLight(0x8899aa, 0.55);
    scene.add(ambLight);
    keyLight = new THREE.DirectionalLight(0xfff2e0, 1.1);
    keyLight.position.set(2,4,3);
    scene.add(keyLight);
    fireLight = new THREE.PointLight(0xff5a1a, 0, 6, 2);
    scene.add(fireLight);

    texChama = texturaBrilho('#fff6d8','rgba(255,90,20,0.9)');
    texturasLabareda = [texturaLabareda(1), texturaLabareda(2), texturaLabareda(3)];

    const N_LABAREDA=110, N_FAGULHA=110;
    subLabaredas = texturasLabareda.map(tex=>criarCamadaFogo(Math.round(N_LABAREDA/3), 0.26, 0xff5a1a, 0.95, tex));
    fagulhas = criarCamadaFogo(N_FAGULHA, 0.045, 0xffd27a, 0.9, texChama);

    bolaMat = new THREE.MeshBasicMaterial({color:0xfff2b0, transparent:true, opacity:0});
    bolaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075,20,16), bolaMat);
    bolaGlowMat = new THREE.SpriteMaterial({map:texChama, color:0xff7a1a, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false});
    bolaGlow = new THREE.Sprite(bolaGlowMat);
    bolaGlow.scale.set(0.5,0.5,0.5);
    bolaMesh.add(bolaGlow);
    scene.add(bolaMesh);
    bolaLight = new THREE.PointLight(0xffb347, 0, 2.5, 2);
    scene.add(bolaLight);

    if(window.ResizeObserver){
      new ResizeObserver(()=>redimensionar()).observe(canvas);
    }
    redimensionar();

    const clock = new THREE.Clock();
    function animar(){
      requestAnimationFrame(animar);
      const dt = pausado?0:clock.getDelta();
      if(!pausado) passoFrame(dt);
      renderer.render(scene, camera);
    }
    animar();
  }

  function redimensionar(){
    if(!canvas||!renderer) return;
    const w = canvas.clientWidth||1, h = canvas.clientHeight||1;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
    const ativo=chefeAtivoId&&cache.get(chefeAtivoId);
    if(ativo&&ativo.envelope) enquadrarEnvelope(ativo.envelope);
  }

  function texturaBrilho(corNucleo, corBorda){
    const c=document.createElement('canvas'); c.width=c.height=64;
    const ctx=c.getContext('2d');
    const g=ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,corNucleo); g.addColorStop(0.4,corBorda); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }
  function texturaLabareda(seed){
    const c=document.createElement('canvas'); c.width=c.height=96;
    const ctx=c.getContext('2d');
    const j=(amp)=>(seed%7/7-0.5)*amp*2+(Math.random()-0.5)*amp;
    ctx.filter='blur(2.5px)';
    ctx.translate(48,0);
    ctx.beginPath();
    ctx.moveTo(0,8+j(4));
    ctx.bezierCurveTo(16+j(5),28,13+j(4),46,17+j(5),62);
    ctx.bezierCurveTo(20+j(4),76,14+j(3),86,0,90);
    ctx.bezierCurveTo(-14-j(3),86,-20-j(4),76,-17-j(5),62);
    ctx.bezierCurveTo(-13-j(4),46,-16-j(5),28,0,8+j(4));
    ctx.closePath();
    const g=ctx.createLinearGradient(0,96,0,0);
    g.addColorStop(0,'rgba(255,248,222,1)');
    g.addColorStop(0.32,'rgba(255,176,46,0.98)');
    g.addColorStop(0.68,'rgba(255,96,24,0.85)');
    g.addColorStop(1,'rgba(255,60,10,0)');
    ctx.fillStyle=g; ctx.fill();
    const tex=new THREE.CanvasTexture(c);
    tex.flipY=false;
    return tex;
  }
  function criarCamadaFogo(n,tam,cor,opacidadeMax,textura){
    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(n*3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({map:textura,color:cor,size:tam,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
    const pts=new THREE.Points(geo,mat);
    scene.add(pts);
    const vel=new Float32Array(n), faseX=new Float32Array(n), basePos=new Float32Array(n*3);
    for(let i=0;i<n;i++){vel[i]=0.5+Math.random()*0.9; faseX[i]=Math.random()*Math.PI*2;}
    return {pts,geo,pos,mat,vel,faseX,basePos,opacidadeMax,tamBase:tam};
  }
  function posicionarFogoNoPersonagem(box,bbCenter,bbSize){
    for(const camada of [...subLabaredas, fagulhas]){
      for(let i=0;i<camada.vel.length;i++){
        const x=bbCenter.x+(Math.random()-0.5)*bbSize.x*0.85;
        const y0=box.min.y+Math.random()*bbSize.y*0.9;
        const z=bbCenter.z+(Math.random()-0.5)*bbSize.z*0.85;
        camada.basePos[i*3+0]=x; camada.basePos[i*3+1]=box.min.y; camada.basePos[i*3+2]=z;
        camada.pos[i*3+0]=x; camada.pos[i*3+1]=y0; camada.pos[i*3+2]=z;
      }
      camada.geo.attributes.position.needsUpdate=true;
      camada.topoY=box.max.y+bbSize.y*0.35;
      camada.baseY=box.min.y;
    }
  }
  function atualizarCamadaFogo(camada,dt,prog,flicker){
    const n=camada.vel.length;
    for(let i=0;i<n;i++){
      camada.pos[i*3+1]+=camada.vel[i]*dt*(0.6+prog);
      camada.pos[i*3+0]=camada.basePos[i*3+0]+Math.sin(performance.now()*0.002+camada.faseX[i])*0.025;
      if(camada.pos[i*3+1]>camada.topoY){
        camada.pos[i*3+1]=camada.baseY+Math.random()*0.05;
        camada.basePos[i*3+0]+=(Math.random()-0.5)*0.01;
      }
    }
    camada.geo.attributes.position.needsUpdate=true;
    camada.mat.opacity=prog*camada.opacidadeMax*flicker;
  }

  function enquadrarCamera(bbCenter,bbSize){
    const maxDim=Math.max(bbSize.x,bbSize.y,bbSize.z);
    const dist=maxDim/(2*Math.tan(camera.fov*Math.PI/360))*1.2;
    camera.position.set(bbCenter.x, bbCenter.y+bbSize.y*0.05, bbCenter.z+dist);
    camera.lookAt(bbCenter.x, bbCenter.y+bbSize.y*0.05, bbCenter.z);
  }

  // Enquadramento por envelope: amostra as poses dos clipes e guarda uma nuvem de pontos do mesh deformado
  // (com skinning) — a câmera é ajustada para que TODOS esses pontos caibam no quadro, com os pés embaixo.
  function medirEnvelope(modelRoot, mixer, clipes){
    const pts=[]; const v=new THREE.Vector3();
    const meshes=[]; modelRoot.traverse(o=>{ if(o.isSkinnedMesh) meshes.push(o); });
    for(const clip of clipes){
      if(!clip) continue;
      const acao=mixer.clipAction(clip);
      const passos=Math.max(8,Math.ceil(clip.duration*12));
      for(let i=0;i<=passos;i++){
        mixer.stopAllAction(); acao.reset().play(); mixer.setTime(clip.duration*i/passos);
        modelRoot.updateMatrixWorld(true);
        for(const m of meshes){
          m.skeleton.update();
          const n=m.geometry.attributes.position.count, passo=Math.max(1,Math.floor(n/700));
          for(let k=0;k<n;k+=passo){ m.getVertexPosition(k,v); v.applyMatrix4(m.matrixWorld); pts.push(v.x,v.y,v.z); }
        }
      }
    }
    mixer.stopAllAction();
    return pts.length?new Float32Array(pts):null;
  }
  function enquadrarEnvelope(pts){
    const MARGEM_X=0.94, TOPO=0.92, BASE=-0.94; // limites em coordenadas de tela (−1..1)
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
    for(let i=0;i<pts.length;i+=3){ minX=Math.min(minX,pts[i]);maxX=Math.max(maxX,pts[i]);minY=Math.min(minY,pts[i+1]);maxY=Math.max(maxY,pts[i+1]);minZ=Math.min(minZ,pts[i+2]);maxZ=Math.max(maxZ,pts[i+2]); }
    const c=new THREE.Vector3((minX+maxX)/2,(minY+maxY)/2,(minZ+maxZ)/2);
    const v=new THREE.Vector3();
    const medir=(d,px,py)=>{
      camera.position.set(c.x+px,c.y+py,c.z+d); camera.lookAt(c.x+px,c.y+py,c.z); camera.updateMatrixWorld(true);
      let a=Infinity,b=-Infinity,e=Infinity,f=-Infinity;
      for(let i=0;i<pts.length;i+=3){ v.set(pts[i],pts[i+1],pts[i+2]).project(camera); a=Math.min(a,v.x);b=Math.max(b,v.x);e=Math.min(e,v.y);f=Math.max(f,v.y); }
      return {a,b,e,f};
    };
    let px=0,py=0,d=Math.max(maxX-minX,maxY-minY)*3+(maxZ-minZ);
    for(let it=0;it<4;it++){
      // distância: o que couber na largura e na altura disponíveis
      let lo=(maxZ-c.z)+0.05, hi=d*4+1;
      for(let k=0;k<30;k++){ const m=(lo+hi)/2, r=medir(m,px,py); if((r.b-r.a)<=2*MARGEM_X && (r.f-r.e)<=(TOPO-BASE)) hi=m; else lo=m; }
      d=hi;
      // deslocamento: centraliza na horizontal e assenta os pés na base do quadro
      const r=medir(d,px,py), meiaAlt=Math.tan(camera.fov*Math.PI/360)*d, meiaLarg=meiaAlt*camera.aspect;
      px+=((r.a+r.b)/2)*meiaLarg;
      py+=(r.e-BASE)*meiaAlt;
    }
    medir(d,px,py);
  }

  // Emenda trechos de clipes num clipe só (reamostrado a 30 qps). Cada trecho começa no mesmo ponto do chão
  // (x/z do quadril) que o primeiro; nos primeiros 0,2 s de cada trecho a pose é misturada com o fim do anterior.
  function montarSequencia(animacoes, trechos, nome){
    const FPS=30, MIX=0.2;
    const fontes=trechos.map(t=>{ const clip=THREE.AnimationClip.findByName(animacoes,t.clip); return {clip, de:t.de||0, ate:(t.ate!=null?t.ate:clip.duration)}; });
    const nomes=new Map();
    for(const f of fontes) for(const tr of f.clip.tracks) if(!nomes.has(tr.name)) nomes.set(tr.name, tr.constructor);
    const saida=new Map(); for(const [n] of nomes) saida.set(n,{times:[],values:[]});
    let offset=0, hipsBase=null;
    const q1=new THREE.Quaternion(), q2=new THREE.Quaternion();
    fontes.forEach((f,idx)=>{
      const nQuadros=Math.max(1,Math.round((f.ate-f.de)*FPS));
      const interp=new Map(); for(const tr of f.clip.tracks) interp.set(tr.name, tr.createInterpolant());
      let hipsIni=null;
      for(const [n,dest] of saida){
        const it=interp.get(n); if(!it) continue;
        const ehHips=/Hips\.position$/.test(n), ehQuat=nomes.get(n)===THREE.QuaternionKeyframeTrack;
        const tam=it.valueSize;
        const anterior=dest.values.length?dest.values.slice(dest.values.length-tam):null;
        for(let k=0;k<=nQuadros;k++){
          if(idx>0 && k===0) continue; // o 1º quadro do trecho coincide com o último do anterior
          const t=Math.min(f.ate, f.de+k/FPS);
          let v=Array.from(it.evaluate(t));
          if(ehHips){
            if(!hipsIni) hipsIni=Array.from(it.evaluate(f.de));
            if(!hipsBase) hipsBase=hipsIni.slice();
            v[0]+=hipsBase[0]-hipsIni[0]; v[2]+=hipsBase[2]-hipsIni[2];
          }
          const tl=k/FPS;
          if(idx>0 && anterior && tl<MIX){
            const w=1-tl/MIX;
            if(ehQuat){ q1.fromArray(v); q2.fromArray(anterior); q1.slerp(q2,w); v=q1.toArray(); }
            else v=v.map((x,i)=>x+(anterior[i]-x)*w);
          }
          dest.times.push(offset+tl); dest.values.push(...v);
        }
      }
      hipsIni=null;
      offset+=nQuadros/FPS;
    });
    const tracks=[];
    for(const [n,dest] of saida) if(dest.times.length) tracks.push(new (nomes.get(n))(n, dest.times, dest.values));
    return new THREE.AnimationClip(nome, offset, tracks);
  }

  function disponivel(chefe){ return !!(chefe && chefe.glb3d && chefe.glb3d.url); }

  function preparar(chefe){
    if(!disponivel(chefe)) return Promise.resolve();
    if(cache.has(chefe.id)) return Promise.resolve();
    return carregarThree().then(()=> new Promise((resolve,reject)=>{
      const loader=new GLTFLoader();
      if(MeshoptDecoder) loader.setMeshoptDecoder(MeshoptDecoder);
      if(DRACOLoader){ const draco=new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/'); loader.setDRACOLoader(draco); }
      loader.load(chefe.glb3d.url, (gltf)=>{
        const modelRoot=gltf.scene;
        let material=null;
        modelRoot.traverse(o=>{ if(o.isMesh){ material=o.material; o.frustumCulled=false; } });
        let mao=modelRoot.getObjectByName('mixamorig_RightHand')||modelRoot.getObjectByName('mixamorigRightHand')||modelRoot.getObjectByName('mixamorig:RightHand');
        let maoEsq=modelRoot.getObjectByName('mixamorig_LeftHand')||modelRoot.getObjectByName('mixamorigLeftHand')||modelRoot.getObjectByName('mixamorig:LeftHand');
        if(!mao) modelRoot.traverse(o=>{ if(/RightHand$/i.test(o.name)) mao=o; });
        if(!maoEsq) modelRoot.traverse(o=>{ if(/LeftHand$/i.test(o.name)) maoEsq=o; });
        let antebraco=modelRoot.getObjectByName('mixamorig_RightForeArm')||modelRoot.getObjectByName('mixamorigRightForeArm')||modelRoot.getObjectByName('mixamorig:RightForeArm');
        if(!antebraco) modelRoot.traverse(o=>{ if(/RightForeArm$/i.test(o.name)) antebraco=o; });

        const box=new THREE.Box3().setFromObject(modelRoot);
        const bbCenter=new THREE.Vector3(), bbSize=new THREE.Vector3();
        box.getCenter(bbCenter); box.getSize(bbSize);

        const mixer=new THREE.AnimationMixer(modelRoot);
        const idleDef=chefe.glb3d.idle;
        let clipIdle;
        if(idleDef && typeof idleDef==='object'){
          const base=THREE.AnimationClip.findByName(gltf.animations, idleDef.clip);
          const fps=30;
          clipIdle=THREE.AnimationUtils.subclip(base, (chefe.id+'-idle'), Math.round((idleDef.de||0)*fps), Math.round(idleDef.ate*fps), fps);
        } else clipIdle=THREE.AnimationClip.findByName(gltf.animations, idleDef);
        const clipAtaque=Array.isArray(chefe.glb3d.ataque)?montarSequencia(gltf.animations, chefe.glb3d.ataque, chefe.id+'-ataque'):THREE.AnimationClip.findByName(gltf.animations, chefe.glb3d.ataque);
        if(chefe.glb3d.noLugar && clipAtaque){
          // trava o avanço em profundidade (eixo z do quadril): o golpe acontece no lugar, sem vir para a câmera
          for(const tr of clipAtaque.tracks){
            if(/Hips\.position$/.test(tr.name)){ const z0=tr.values[2]; for(let i=2;i<tr.values.length;i+=3) tr.values[i]=z0; }
          }
        }
        const envelope=chefe.glb3d.enquadrar==='envelope'?medirEnvelope(modelRoot, mixer, [clipIdle, clipAtaque]):null;
        const acaoIdle=mixer.clipAction(clipIdle);
        if(idleDef && typeof idleDef==='object') acaoIdle.setLoop(THREE.LoopPingPong);
        const acaoAtaque=mixer.clipAction(clipAtaque);
        acaoAtaque.setLoop(THREE.LoopOnce);
        acaoAtaque.clampWhenFinished=true;
        mixer.addEventListener('finished', (ev)=>{
          if(chefeAtivoId===chefe.id && ev.action===acaoAtaque){
            pararEVoltarAoIdle(0.4);
            if(callbackFim) callbackFim();
          }
        });

        cache.set(chefe.id, {
          modelRoot, mixer, acaoIdle, acaoAtaque, mao, maoEsq, antebraco, material,
          bbCenter, bbSize, box, envelope, efeito:chefe.glb3d.efeito||'fogo', cor:(chefe.glb3d.cor!=null?chefe.glb3d.cor:null), duracao:clipAtaque?clipAtaque.duration:0,
          tempos:Object.assign({tIgnicao:0,tBola:2.0,tPuxada:4.5,tArremesso:5.1}, chefe.glb3d)
        });
        resolve();
      }, undefined, reject);
    }));
  }

  function mostrar(chefe){
    if(!disponivel(chefe)) return;
    const entrada=cache.get(chefe.id);
    if(!entrada) return; // precisa ter sido preparado antes
    if(chefeAtivoId && chefeAtivoId!==chefe.id){
      const anterior=cache.get(chefeAtivoId);
      if(anterior) scene.remove(anterior.modelRoot);
    }
    if(chefeAtivoId!==chefe.id){
      scene.add(entrada.modelRoot);
      posicionarFogoNoPersonagem(entrada.box, entrada.bbCenter, entrada.bbSize);
      if(entrada.envelope) enquadrarEnvelope(entrada.envelope);
      else enquadrarCamera(entrada.bbCenter, entrada.bbSize);
    }
    chefeAtivoId=chefe.id;
    estadoAtaque=null;
    aplicarCorBola(entrada);
    const luz=entrada.tempos.luz||1; // glb3d.luz: realce de iluminação do personagem (1 = padrão)
    ambLight.intensity=0.55*luz; keyLight.intensity=1.1*luz;
    soltarBolaDaMao(entrada);
    entrada.acaoAtaque.stop();
    entrada.acaoIdle.reset().play();
    zerarEfeitos(entrada);
    redimensionar();
  }

  function esconder(){
    // mantém o modelo carregado/na cena (barato) — só o canvas some via CSS no app.js;
    // garante que não fica travado em pose de ataque na próxima vez que reaparecer
    if(chefeAtivoId){
      const entrada=cache.get(chefeAtivoId);
      if(entrada){
        estadoAtaque=null;
        entrada.acaoAtaque.stop();
        entrada.acaoIdle.reset().play();
        soltarBolaDaMao(entrada);
        zerarEfeitos(entrada);
      }
    }
  }

  function aplicarCorBola(entrada){
    // padrão (Esqueleto): núcleo creme, brilho e luz alaranjados; com glb3d.cor, tudo na cor pedida
    if(entrada.cor==null){ bolaMat.color.setHex(0xfff2b0); bolaGlowMat.color.setHex(0xff7a1a); bolaLight.color.setHex(0xffb347); return; }
    const c=new THREE.Color(entrada.cor);
    bolaMat.color.copy(c).lerp(new THREE.Color(0xffffff),0.75);
    bolaGlowMat.color.copy(c);
    bolaLight.color.copy(c);
  }
  function zerarEfeitos(entrada){
    for(const c of subLabaredas) c.mat.opacity=0;
    fagulhas.mat.opacity=0; fireLight.intensity=0;
    bolaMat.opacity=0; bolaGlowMat.opacity=0; bolaLight.intensity=0;
    if(entrada && entrada.material){ entrada.material.emissive.setHex(0x000000); entrada.material.emissiveIntensity=0; }
  }

  function soltarBolaDaMao(entrada){
    if(bolaMesh.parent===entrada.mao) scene.attach(bolaMesh);
    if(bolaLight.parent===entrada.mao) scene.attach(bolaLight);
    entrada._escalaCompensaMao=1;
  }
  function posEntreAsMaos(entrada, destino){
    const vMaoDir=new THREE.Vector3(), vMaoEsq=new THREE.Vector3();
    if(entrada.mao) entrada.mao.getWorldPosition(vMaoDir);
    if(entrada.maoEsq) entrada.maoEsq.getWorldPosition(vMaoEsq);
    if(entrada.mao && entrada.maoEsq) return destino.addVectors(vMaoDir,vMaoEsq).multiplyScalar(0.5);
    return destino.copy(entrada.mao?vMaoDir:vMaoEsq);
  }
  const DIST_PALMA=0.16;
  function posNaPalma(entrada, destino){
    const vMao=new THREE.Vector3();
    entrada.mao.getWorldPosition(vMao);
    if(!entrada.antebraco) return destino.copy(vMao);
    const vAntebraco=new THREE.Vector3();
    entrada.antebraco.getWorldPosition(vAntebraco);
    const dir=new THREE.Vector3().subVectors(vMao,vAntebraco).normalize();
    return destino.copy(vMao).addScaledVector(dir, DIST_PALMA);
  }
  function prenderBolaNaMao(entrada){
    if(!entrada.mao || bolaMesh.parent===entrada.mao) return;
    const posAtual=new THREE.Vector3();
    posNaPalma(entrada, posAtual);
    bolaMesh.position.copy(posAtual);
    entrada.mao.attach(bolaMesh);
    entrada.mao.attach(bolaLight);
    const pos=new THREE.Vector3(), quat=new THREE.Quaternion(), scl=new THREE.Vector3();
    entrada.mao.matrixWorld.decompose(pos,quat,scl);
    entrada._escalaCompensaMao=1/(scl.x||1);
  }
  function aplicarEscalaBola(entrada, escalaVisual){
    bolaMesh.scale.setScalar(escalaVisual*(bolaMesh.parent===entrada.mao?(entrada._escalaCompensaMao||1):1));
  }

  function iniciarAtaque(){
    if(!chefeAtivoId) return;
    const entrada=cache.get(chefeAtivoId);
    if(!entrada) return;
    entrada.acaoIdle.fadeOut(0.3);
    entrada.acaoAtaque.reset().fadeIn(0.3).play();
    estadoAtaque={lancado:false};
    soltarBolaDaMao(entrada);
  }

  function pararEVoltarAoIdle(duracaoFade){
    if(!chefeAtivoId) return;
    const entrada=cache.get(chefeAtivoId);
    if(!entrada) return;
    const fade = duracaoFade==null?0.15:duracaoFade;
    entrada.acaoAtaque.fadeOut(fade);
    entrada.acaoIdle.reset().fadeIn(fade).play();
    estadoAtaque=null;
    soltarBolaDaMao(entrada);
    zerarEfeitos(entrada);
  }

  function pausar(sim){ pausado=!!sim; }

  function tempoAtaque(){
    if(!chefeAtivoId) return 0;
    const entrada=cache.get(chefeAtivoId);
    return entrada && entrada.acaoAtaque ? entrada.acaoAtaque.time : 0;
  }

  function duracaoAtaque(chefe){
    const entrada=chefe&&cache.get(chefe.id);
    return entrada ? entrada.duracao : 0;
  }

  function aoTerminarAtaque(fn){ callbackFim=fn; }

  function capturarQuadroPng(){
    if(!canvas) return null;
    try{ return canvas.toDataURL('image/png'); }catch(e){ return null; }
  }

  function passoFrame(dt){
    if(!chefeAtivoId) return;
    const entrada=cache.get(chefeAtivoId);
    if(!entrada) return;
    entrada.mixer.update(dt);

    if(estadoAtaque && entrada.efeito!=='nenhum'){
      const comFogo=entrada.efeito==='fogo';
      const t=entrada.acaoAtaque.time;
      const tp=entrada.tempos;
      const prog = t<tp.tIgnicao?0
        : t<tp.tIgnicao+1.0?(t-tp.tIgnicao)/1.0
        : t<tp.tArremesso+0.4?1
        : Math.max(0,1-(t-(tp.tArremesso+0.4))/0.8);
      const flicker=0.7+0.3*Math.sin(t*27.0)+0.15*Math.sin(t*53.0);

      if(comFogo) for(let i=0;i<subLabaredas.length;i++){
        const c=subLabaredas[i];
        const flickerCamada=0.7+0.3*Math.sin(t*(23+i*7))+0.15*Math.sin(t*(47+i*11));
        atualizarCamadaFogo(c,dt,prog,flickerCamada);
        c.mat.size=c.tamBase*(0.85+0.3*flickerCamada);
      }
      if(comFogo){ atualizarCamadaFogo(fagulhas,dt,prog,flicker); fireLight.intensity=prog*2.6*flicker; }
      if(comFogo && entrada.material){ entrada.material.emissive.setHex(0xff3d0a); entrada.material.emissiveIntensity=prog*1.35*flicker; }

      if((entrada.mao||entrada.maoEsq) && t>=tp.tBola && t<tp.tArremesso){
        const posMundo=new THREE.Vector3();
        if(t<tp.tPuxada || !entrada.mao){
          posEntreAsMaos(entrada, posMundo);
          bolaMesh.position.copy(posMundo);
          bolaLight.position.copy(posMundo);
        } else {
          prenderBolaNaMao(entrada);
        }
        const carregando=Math.min(1,(t-tp.tBola)/0.4);
        bolaMat.opacity=carregando;
        bolaGlowMat.opacity=carregando*0.9*flicker;
        aplicarEscalaBola(entrada, 0.6+carregando*0.4);
        bolaLight.intensity=carregando*1.8*flicker;
      } else {
        bolaMat.opacity=0; bolaGlowMat.opacity=0; bolaLight.intensity=0;
      }

      if(!estadoAtaque.lancado && t>=tp.tArremesso){
        estadoAtaque.lancado=true;
        bolaMat.opacity=0; bolaGlowMat.opacity=0; bolaLight.intensity=0;
      }
    }
  }

  return {disponivel, preparar, mostrar, esconder, iniciarAtaque, pararEVoltarAoIdle, pausar, tempoAtaque, duracaoAtaque, aoTerminarAtaque, capturarQuadroPng};
})();
