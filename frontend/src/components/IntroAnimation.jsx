import { useEffect, useRef, useState } from "react";

// Logo -> shatter -> atom lattice -> collapse -> galaxy -> glowing plexus tunnel -> glowing block chain.
// Plays on every fresh page load. Skipped for reduced-motion users and on /payment-success.
// Add ?intro to the address to force it.
export default function IntroAnimation() {
  const canvasRef = useRef(null);
  const endRef = useRef(() => {});
  const [fade, setFade] = useState(false);
  const [show, setShow] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.has("intro")) return true;
      if (window.location.pathname.startsWith("/payment-success")) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (!show) return undefined;
    const c = canvasRef.current;
    const g = c.getContext("2d");
    var raf=0,W,H,dpr=Math.min(window.devicePixelRatio||1,2),pts=[],gal=[],bok=[],tz=[],tw=[],R0=1,L=1,t0=0,done=false,img=new Image(),TR=24,TM=32,TG=.6,tcam=0,lt2=0,lm=null,lmC=null,lmR=null,COL=["#00f0ff","#ff2bd6","#fcee0a","#ffffff"];
    var KL=12,NU=24,NV=8,AA=1,BB=.55,RH=.2,DD=2*AA-3*RH,lk=[],sxs=[],sys=[],GL=[[.9,.5],[-.9,.5],[.9,-.5],[-.9,-.5],[0,1.2],[0,-1.2],[1.5,0],[-1.5,0]];
    var A=1800,B=2400,C=3900,D=4600,E=5100,F=6900,G=9100,X=9700;
    var i,j,k;
    function fit(){W=window.innerWidth;H=window.innerHeight;c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0)}
    function end(){if(done)return;done=true;setFade(true);setTimeout(function(){setShow(false)},800)}
    function clamp(x){return Math.max(0,Math.min(1,x))}
    function ease(x){return 1-Math.pow(1-x,3)}
    function newRow(){var r=[],q;for(q=0;q<TM;q++)r.push([(Math.random()-.5)*.5,(Math.random()-.5)*.08]);return r}
    function tint(src,col){var cc=document.createElement("canvas");cc.width=src.width;cc.height=src.height;var gg=cc.getContext("2d");gg.fillStyle=col;gg.fillRect(0,0,cc.width,cc.height);gg.globalCompositeOperation="destination-in";gg.drawImage(src,0,0);return cc}
    fit();window.addEventListener("resize",fit);endRef.current=end;
    // one chain link: a tube around an oval, as a grid of points (NU along the oval, NV around the tube)
    for(i=0;i<NU;i++){
      var uu=i/NU*6.283,cs=Math.cos(uu),sn=Math.sin(uu),nl=Math.sqrt(BB*BB*cs*cs+AA*AA*sn*sn),nxx=BB*cs/nl,nyy=AA*sn/nl;
      for(j=0;j<NV;j++){var vv=j/NV*6.283,cv=Math.cos(vv),sv=Math.sin(vv);
        lk.push([AA*cs+RH*cv*nxx,BB*sn+RH*cv*nyy,RH*sv])}}
    for(j=0;j<TR;j++){tz.push(1+j*TG);tw.push(newRow())}
    for(i=0;i<46;i++)bok.push({x:Math.random(),y:Math.random(),r:10+Math.random()*34,a:.05+Math.random()*.1,s:.02+Math.random()*.05,ph:Math.random()*6.283});

    // Logo: dots assemble, then the real logo fades in on top so it matches exactly
    function logo(t,cx,cy){
      var p,x,y,e,s,tt,xe,ye,la,n,sh=0,shake=t>A&&t<2000?(Math.random()-.5)*10:0;
      if(t>1100&&t<A&&Math.sin(t*.05)>.6)sh=(Math.random()-.5)*14;
      for(n=0;n<pts.length;n++){p=pts[n];
        if(t<A){e=ease(clamp((t-p.d)/700));x=cx+p.sx+(p.tx-p.sx)*e+sh;y=cy+p.sy+(p.ty-p.sy)*e;
          if(sh){g.fillStyle="rgba(255,43,214,.85)";g.fillRect(x-5,y,2.4,2.4);g.fillStyle="rgba(0,240,255,.85)";g.fillRect(x+5,y,2.4,2.4)}
          g.fillStyle="#fff";g.fillRect(x,y,2.4,2.4)}
        else{tt=Math.min(t,2150);s=(tt-A)/16;xe=cx+p.tx+Math.cos(p.a)*p.v*s*.6+shake;ye=cy+p.ty+Math.sin(p.a)*p.v*s*.6;e=ease(clamp((t-2150)/450));
          g.fillStyle=p.c;g.fillRect(xe+(cx-xe)*e,ye+(cy-ye)*e,2.4,2.4)}}
      if(lm&&t>800&&t<A+160){
        la=clamp((t-800)/500)*(1-clamp((t-A)/160));g.globalAlpha=la;
        if(sh){g.drawImage(lmR,cx-L/2+sh-6,cy-L/2,L,L);g.drawImage(lmC,cx-L/2+sh+6,cy-L/2,L,L)}
        g.drawImage(lm,cx-L/2+sh,cy-L/2,L,L);g.globalAlpha=1}}
    // Atom lattice: rings of dots on a log-polar grid that flow outward, like a field-ion image
    function ring(x0,y0,r0,ratio,rings,per,ph,rot,sc,am,maxR){
      var n,m,rn,al,sz,ang,fl;
      for(n=0;n<rings;n++){
        fl=n+ph;al=clamp(fl/2)*clamp((rings-fl)/2)*am;
        if(al<.03)continue;
        rn=r0*Math.pow(ratio,fl)*sc;
        if(rn>maxR)continue;
        sz=Math.max(.7,Math.min(4,rn*.05));
        g.fillStyle="rgba(235,245,255,"+al+")";
        for(m=0;m<per;m++){ang=rot+(m+(n%2)*.5)/per*6.283;g.fillRect(x0+Math.cos(ang)*rn-sz/2,y0+Math.sin(ang)*rn-sz/2,sz,sz)}}}
    function atom(t,cx,cy){
      var a=clamp((t-B)/400)*(1-clamp((t-D-200)/400)),e=ease(clamp((t-C)/700)),sc=1-.92*e,ph=(t*.0005)%1,ph2=(t*.0004)%1,rot=t*.00008,i2,ang,sx,sy,gr,Dd=R0*1.35,bigR=Math.max(W,H)*.6;
      if(a<=0)return;
      g.save();
      if(t>C)g.translate((Math.random()-.5)*8*e,(Math.random()-.5)*8*e);
      for(i2=0;i2<GL.length;i2++){
        sx=cx+GL[i2][0]*R0*sc;sy=cy+GL[i2][1]*R0*sc;
        gr=g.createRadialGradient(sx,sy,0,sx,sy,R0*.55*sc);gr.addColorStop(0,"rgba(255,255,255,"+.13*a+")");gr.addColorStop(1,"rgba(255,255,255,0)");
        g.globalAlpha=1;g.fillStyle=gr;g.beginPath();g.arc(sx,sy,R0*.55*sc,0,6.283);g.fill()}
      ring(cx,cy,R0*.2,1.16,24,40,ph,rot,sc,a,bigR);
      for(i2=0;i2<6;i2++){
        ang=i2*Math.PI/3+Math.PI/6;ring(cx+Math.cos(ang)*Dd*sc,cy+Math.sin(ang)*Dd*sc,R0*.06,1.22,11,29,1-ph2,-rot*1.5,sc,a*.9,R0*.62);
        ang=i2*Math.PI/3;ring(cx+Math.cos(ang)*Dd*1.95*sc,cy+Math.sin(ang)*Dd*1.95*sc,R0*.06,1.22,11,29,ph2,rot,sc,a*.8,R0*.62)}
      g.fillStyle="rgba(255,255,255,"+a+")";
      g.fillRect(cx-R0*.32*sc-2,cy-2,4,4);g.fillRect(cx+R0*.32*sc-2,cy-2,4,4);
      g.restore();
      g.globalAlpha=a;g.textAlign="center";g.font="13px 'JetBrains Mono',monospace";g.fillStyle="#fcee0a";
      g.fillText(t<C?"QUANTUM STATE: SUPERPOSITION":"WAVE FUNCTION COLLAPSE",cx,H*.12);
      g.fillStyle="#00f0ff";g.fillText("i\u210f \u2202\u03c8/\u2202t = \u0124\u03c8",cx,H*.12+22);g.globalAlpha=1}
    function burst(t,cx,cy){
      var u=t-D,k2,r,al;if(u<0)return;
      for(k2=0;k2<3;k2++){r=(u-k2*120)*1.3;if(r<0)continue;al=Math.max(0,1-r/(Math.max(W,H)*.8));g.globalAlpha=al;g.strokeStyle=COL[k2];g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,0,6.283);g.stroke()}
      if(u<500){g.globalAlpha=1-u/500;g.fillStyle="#fff";g.fillRect(0,0,W,H)}
      g.globalAlpha=1}
    function galaxy(t,cx,cy){
      var u=t-D,a=clamp(u/300)*(1-clamp((t-E-300)/700)),mx=Math.max(W,H)*.7,i2,p,r,an;if(a<=0)return;
      for(i2=0;i2<gal.length;i2++){p=gal[i2];r=p.r*mx*ease(clamp((u-p.d)/1100));an=p.a+r*.006+u*.0015;g.globalAlpha=a*p.al;g.fillStyle=p.c;g.fillRect(cx+Math.cos(an)*r,cy+Math.sin(an)*r*.6,p.s,p.s)}
      g.globalAlpha=1}

    // Glowing plexus tunnel: rings of nodes joined by lines, soft bokeh, dark centre
    function tunnel(t,cx,cy,now){
      var u=t-E,a=clamp(u/500)*(1-clamp((t-F-100)/500)),span=TR*TG,rot=t*.0003,dt,sp,f,j2,q,row,nrow,pj=[],xj,yj,cxo,cyo,an,rr,pp,rel,zj,al,gr,bxp,byp,b,nx,r;
      if(a<=0)return;
      dt=Math.min(.05,(now-lt2)/1000||.016);lt2=now;
      sp=.8+u/1000*.9+(t>F-900?3.5:0);tcam+=sp*dt;
      f=Math.min(W,H)*.95;
      cxo=Math.sin(tcam*.35)*.55;cyo=Math.cos(tcam*.27)*.4;
      for(b=0;b<bok.length;b++){
        bxp=((bok[b].x+t*bok[b].s*.00002)%1)*W;byp=bok[b].y*H+Math.sin(t*.0004+bok[b].ph)*12;
        gr=g.createRadialGradient(bxp,byp,0,bxp,byp,bok[b].r);
        gr.addColorStop(0,"rgba(40,170,255,"+bok[b].a*a+")");gr.addColorStop(1,"rgba(40,170,255,0)");
        g.globalAlpha=1;g.fillStyle=gr;g.beginPath();g.arc(bxp,byp,bok[b].r,0,6.283);g.fill()}
      for(j2=0;j2<TR;j2++){
        if(tz[j2]-tcam<.35){tz[j2]+=span;tw[j2]=newRow()}
        zj=tz[j2];rel=zj-tcam;pp=f/rel;xj=Math.sin(zj*.35)*.55;yj=Math.cos(zj*.27)*.4;row=[];
        for(q=0;q<TM;q++){
          an=q/TM*6.283+zj*.12+rot+tw[j2][q][1];
          rr=1.7+.3*Math.sin(q/TM*18.85+zj*.9+t*.0006)+.2*Math.sin(q/TM*31.4-zj*1.3)+tw[j2][q][0];
          row.push([cx+(xj+Math.cos(an)*rr-cxo)*pp,cy+(yj+Math.sin(an)*rr-cyo)*pp])}
        pj.push({rel:rel,pp:pp,row:row})}
      for(j2=0;j2<TR;j2++){
        nx=(j2+1)%TR;r=pj[j2];
        al=clamp(1-(r.rel-.4)/(span*.85))*clamp((r.rel-.35)/.6)*a;
        if(al<.02)continue;
        row=r.row;nrow=Math.abs(tz[nx]-tz[j2]-TG)<.01?pj[nx].row:null;
        g.globalAlpha=1;g.lineWidth=Math.max(.5,Math.min(1.5,r.pp*.0035));
        g.strokeStyle="rgba(70,210,255,"+al*.55+")";
        g.beginPath();
        for(q=0;q<TM;q++){
          g.moveTo(row[q][0],row[q][1]);g.lineTo(row[(q+1)%TM][0],row[(q+1)%TM][1]);
          if(nrow){g.moveTo(row[q][0],row[q][1]);g.lineTo(nrow[q][0],nrow[q][1]);
            if(q%2===0){g.moveTo(row[q][0],row[q][1]);g.lineTo(nrow[(q+1)%TM][0],nrow[(q+1)%TM][1])}}}
        g.stroke();
        rr=Math.max(.8,Math.min(3.2,r.pp*.0035));
        for(q=0;q<TM;q++){
          g.fillStyle="rgba(170,245,255,"+al+")";g.beginPath();g.arc(row[q][0],row[q][1],rr,0,6.283);g.fill();
          if(q%3===0){g.fillStyle="rgba(60,190,255,"+al*.25+")";g.beginPath();g.arc(row[q][0],row[q][1],rr*3,0,6.283);g.fill()}}}
      gr=g.createRadialGradient(cx,cy,0,cx,cy,f*.14);
      gr.addColorStop(0,"rgba(0,5,30,"+.95*a+")");gr.addColorStop(.55,"rgba(0,5,30,"+.7*a+")");gr.addColorStop(1,"rgba(0,5,30,0)");
      g.globalAlpha=1;g.fillStyle=gr;g.beginPath();g.arc(cx,cy,f*.14,0,6.283);g.fill();
      g.globalAlpha=a;g.textAlign="center";g.font="600 18px 'Rajdhani',sans-serif";g.fillStyle="#fcee0a";g.fillText("JUMPING UNIVERSES",cx,H-64);g.globalAlpha=1}

    // Glowing mesh chain: interlocking links drawn as a blue-white wire mesh, turning in 3D
    function chain(t,cx,cy){
      var u=t-F,a0=clamp(u/500),f=Math.min(W,H)*1.05,zc=5.2,
        om=t*.0006,co=Math.cos(om),so=Math.sin(om),
        pa=.55+Math.sin(t*.0003)*.1,cp=Math.cos(pa),sp=Math.sin(pa),
        th=.35+Math.sin(t*.0004)*.15,ct=Math.cos(th),st=Math.sin(th),
        off=(t*.00045)%(2*DD),k2,p,xk,odd,x,y,zz,y1,z1,qx,qy,qx2,qz,sc,avg,al,fe,sz,ia,ib,ja,jb,a,b;
      g.globalCompositeOperation="lighter";
      for(k2=0;k2<KL;k2++){
        xk=(k2-(KL-1)/2)*DD-off;odd=k2%2;avg=0;
        for(p=0;p<lk.length;p++){
          x=lk[p][0]+xk;y=odd?lk[p][2]:lk[p][1];zz=odd?lk[p][1]:lk[p][2];
          y1=y*co-zz*so;z1=y*so+zz*co;
          qx=x*cp-y1*sp;qy=x*sp+y1*cp;
          qx2=qx*ct+z1*st;qz=Math.max(.6,-qx*st+z1*ct+zc);
          sc=f/qz;sxs[p]=cx+qx2*sc;sys[p]=cy+qy*sc;avg+=qz}
        avg/=lk.length;
        fe=clamp(((KL/2)*DD-Math.abs(xk))/(1.5*DD));
        al=clamp(1-(avg-3.2)/6)*fe*a0;
        if(al<.02)continue;
        g.strokeStyle="rgba(110,185,255,"+al*.55+")";g.lineWidth=1;g.beginPath();
        for(ia=0;ia<NU;ia++){ib=(ia+1)%NU;
          for(ja=0;ja<NV;ja++){jb=(ja+1)%NV;a=ia*NV+ja;
            g.moveTo(sxs[a],sys[a]);g.lineTo(sxs[ib*NV+ja],sys[ib*NV+ja]);
            g.moveTo(sxs[a],sys[a]);g.lineTo(sxs[ia*NV+jb],sys[ia*NV+jb]);
            g.moveTo(sxs[a],sys[a]);g.lineTo(sxs[ib*NV+jb],sys[ib*NV+jb])}}
        g.stroke();
        sz=Math.max(1,Math.min(3,f/avg*.02));
        g.fillStyle="rgba(215,238,255,"+al+")";
        for(p=0;p<lk.length;p++){b=sxs[p];g.fillRect(b-sz/2,sys[p]-sz/2,sz,sz)}}
      g.globalCompositeOperation="source-over";
      g.globalAlpha=a0;g.textAlign="center";g.font="600 18px 'Rajdhani',sans-serif";g.fillStyle="#fcee0a";g.fillText("ENTERING THE CHAIN",cx,H-64);
      g.font="13px 'JetBrains Mono',monospace";g.fillStyle="#00f0ff";g.fillText("BLOCK #"+(184000+Math.floor(u/12)),cx,H-40);g.globalAlpha=1}

    function frame(now){
      if(done)return;
      var t=now-t0,cx=W/2,cy=H/2;
      g.globalAlpha=1;g.fillStyle=t<B?"#000":(t>E?"rgba(0,7,26,.4)":"rgba(0,0,0,.3)");g.fillRect(0,0,W,H);
      if(t<2600)logo(t,cx,cy);
      if(t>B&&t<D+700)atom(t,cx,cy);
      if(t>=D){galaxy(t,cx,cy);burst(t,cx,cy)}
      if(t>E&&t<F+700)tunnel(t,cx,cy,now);
      if(t>F)chain(t,cx,cy);
      if(t>G){g.fillStyle="rgba(255,255,255,"+clamp((t-G)/600)+")";g.fillRect(0,0,W,H)}
      if(t>X){end();return}
      raf=requestAnimationFrame(frame)}

    img.onerror=function(){console.warn("IntroAnimation: /logo.png not found");end()};
    img.onload=function(){
      var s=512,o=document.createElement("canvas");o.width=o.height=s;
      var og=o.getContext("2d");og.drawImage(img,0,0,s,s);
      var im=og.getImageData(0,0,s,s),d=im.data,v,x,y,S2;
      L=Math.min(W,H)*.5;R0=Math.min(W,H)*.3;S2=L/s;
      // read the shape from brightness x alpha, so any logo.png works
      for(k=0;k<d.length;k+=4){v=(d[k]*.299+d[k+1]*.587+d[k+2]*.114)*d[k+3]/255;d[k]=255;d[k+1]=255;d[k+2]=255;d[k+3]=v<90?0:v}
      og.putImageData(im,0,0);lm=o;lmC=tint(o,"#00f0ff");lmR=tint(o,"#ff003c");
      for(y=0;y<s;y+=6)for(x=0;x<s;x+=6)if(d[(y*s+x)*4+3]>128)pts.push({tx:(x-s/2)*S2,ty:(y-s/2)*S2,sx:(Math.random()-.5)*W,sy:(Math.random()-.5)*H,d:Math.random()*400,a:Math.random()*6.283,v:2+Math.random()*8,c:COL[Math.floor(Math.random()*3)]});
      for(k=0;k<650;k++)gal.push({r:Math.pow(Math.random(),.7),a:(k%3)*2.094,d:Math.random()*300,al:.4+Math.random()*.6,s:1+Math.floor(Math.random()*2.5),c:["#8ab4ff","#ff2bd6","#fcee0a","#fff"][k%4]});
      t0=performance.now();raf=requestAnimationFrame(frame)};
    img.src="/logo.png";

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [show]);

  if (!show) return null;
  return (
    <div
      aria-label="Intro animation"
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000", opacity: fade ? 0 : 1, transition: "opacity .8s" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      <button
        type="button"
        onClick={() => endRef.current()}
        style={{ position: "absolute", right: 20, top: 16, background: "transparent", color: "#fcee0a", border: "2px solid #fcee0a", padding: "6px 16px", font: "700 14px Rajdhani, sans-serif", letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Skip
      </button>
    </div>
  );
}