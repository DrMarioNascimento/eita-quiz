(()=>{
 const el=id=>document.getElementById(id),frame=el('previewFrame');
 function update(){
  const width=Number(el('previewWidth').value);frame.style.width=width+'px';
  const url=new URL(el('previewSurface').value,location.href),code=new URLSearchParams(location.search).get('sala');
  if(url.pathname.endsWith('aluno.html')&&/^\d{6}$/.test(code||''))url.searchParams.set('sala',code);
  if(frame.getAttribute('src')!==url.pathname+url.search)frame.src=url.pathname+url.search;
  el('previewStatus').textContent='Tela de '+(el('previewSurface').value==='aluno.html'?'participante':'professor')+' · largura de '+width+' px';
 }
 el('previewWidth').onchange=update;el('previewSurface').onchange=update;update();
})();
