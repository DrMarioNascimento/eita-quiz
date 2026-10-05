/* Amplia textos somente enquanto cabem no espaço e nas linhas originais. */
(()=>{
 const selector='button:not(.fullscreen-button),label,select,input,small,.muted,.student-name,.squad-member,.control-card h2,.question h2,.option,.status,.log,.battle-label,.author-credit';
 const original=new WeakMap();let scheduled=false;
 function fit(){
  scheduled=false;
  document.querySelectorAll(selector).forEach(el=>{
   if(!el.getClientRects().length)return;
   if(original.has(el)){const old=original.get(el);el.style.fontSize=old.font;el.style.lineHeight=old.line;el.style.height=old.height;}
   else original.set(el,{font:el.style.fontSize,line:el.style.lineHeight,height:el.style.height});
   const cs=getComputedStyle(el),base=parseFloat(cs.fontSize);
   if(cs.display==='inline')return;
   const line=cs.lineHeight==='normal'?base*1.2:parseFloat(cs.lineHeight);
   const width=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
   if(width<=0)return;
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   const single=/^(BUTTON|INPUT|SELECT)$/.test(el.tagName);
   const text=el.tagName==='SELECT'?Array.from(el.options).map(o=>o.text):[el.value||el.textContent];
   const range=document.createRange();range.selectNodeContents(el);
   const boxHeight=el.getBoundingClientRect().height;
   const height=single?line:range.getBoundingClientRect().height;
   if(single)el.style.height=boxHeight+'px';
   el.style.lineHeight=line+'px';
   for(let size=base+1;size<=Math.max(base,Math.min(26,base+4));size++){
    el.style.fontSize=size+'px';
    ctx.font=cs.fontWeight+' '+size+'px '+cs.fontFamily;
    const fits=single?text.every(t=>ctx.measureText(t.trim()).width<=width-(el.tagName==='SELECT'?22:0)):range.getBoundingClientRect().height<=height+.5&&el.scrollWidth<=el.clientWidth;
    if(!fits){el.style.fontSize=(size-1)+'px';break;}
   }
   if(!single&&Math.abs(el.getBoundingClientRect().height-boxHeight)>.1){const old=original.get(el);el.style.fontSize=old.font;el.style.lineHeight=old.line;}
  });
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fit);}}
 addEventListener('resize',schedule);addEventListener('load',schedule);
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
 schedule();
})();
