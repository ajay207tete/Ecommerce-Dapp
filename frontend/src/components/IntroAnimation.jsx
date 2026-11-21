import { useEffect, useRef, useState } from "react";

// Logo -> shatter -> atom -> wave collapse -> galaxy -> wormhole -> blockchain tunnel.
// Plays once per browser session. Skipped for reduced-motion users and on /payment-success.
export default function IntroAnimation() {
  const canvasRef = useRef(null);
  const endRef = useRef(() => {});
  const [fade, setFade] = useState(false);
  const [show, setShow] = useState(() => {
    try {
      if (window.location.pathname.startsWith("/payment-success")) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return !sessionStorage.getItem("th_i");
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (!show) return undefined;
    const c = canvasRef.current;
    const g = c.getContext("2d");
  var raf=0,W,H,dpr=Math.min(window.devicePixelRatio||1,2),pts=[],gal=[],nuc=[],R0=1,t0=0,done=false,img=new Image(),N=26,GAP=.9,z=[],hx=[],cam=0,lt=0,COL=["#00f0ff","#ff2bd6","#fcee0a","#ffffff"],CORN=[[-1,-1],[1,-1],[1,1],[-1,1]];
  var A=1800,B=2400,C=4400,D=5000,E=5600,F=6400,G=7900,X=8500;
  function fit(){W=window.innerWidth;H=window.innerHeight;c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0)}
  function end(){if(done)return;done=true;try{sessionStorage.setItem("th_i","1")}catch(e){}setFade(true);setTimeout(function(){setShow(false)},800)}
  function hex(){return("0000"+Math.floor(Math.random()*65536).toString(16)).slice(-4)}
  function clamp(x){return Math.max(0,Math.min(1,x))}
  function ease(x){return 1-Math.pow(1-x,3)}
  function bx(q){return Math.sin(q*.35)*1.8}
  function by(q){return Math.cos(q*.27)*1.1}
  fit();window.addEventListener("resize",fit);endRef.current=end;
  for(var i=0;i<N;i++){z.push(2+i*GAP);hx.push(hex())}
  function logo(t,cx,cy){
    var p,x,y,e,s,tt,xe,ye,sh=0,shake=t>A&&t<2000?(Math.random()-.5)*10:0;
    if(t>1100&&t<A&&Math.sin(t*.05)>.6)sh=(Math.random()-.5)*14;
    for(var i=0;i<pts.length;i++){p=pts[i];
      if(t<A){e=ease(clamp((t-p.d)/700));x=cx+p.sx+(p.tx-p.sx)*e+sh;y=cy+p.sy+(p.ty-p.sy)*e;
        if(sh){g.fillStyle="rgba(255,43,214,.85)";g.fillRect(x-5,y,3,3);g.fillStyle="rgba(0,240,255,.85)";g.fillRect(x+5,y,3,3)}
        g.fillStyle="#fff";g.fillRect(x,y,3,3)}
      else{tt=Math.min(t,2150);s=(tt-A)/16;xe=cx+p.tx+Math.cos(p.a)*p.v*s*.6+shake;ye=cy+p.ty+Math.sin(p.a)*p.v*s*.6;e=ease(clamp((t-2150)/450));
        g.fillStyle=p.c;g.fillRect(xe+(cx-xe)*e,ye+(cy-ye)*e,3,3)}}}
  function atom(t,cx,cy){
    var a=clamp((t-B)/400)*(1-clamp((t-D-200)/400)),e=ease(clamp((t-C)/700)),R=R0*(1-.95*e),i,k,x,y,th,ph,ex,ey,rr,aa,gr,pu=1+.12*Math.sin(t*.012),nr=R0*.28*(1+e*2);
    if(a<=0)return;
    g.save();
    if(t>C)g.translate((Math.random()-.5)*10*e,(Math.random()-.5)*10*e);
    g.fillStyle="#00f0ff";g.globalAlpha=a*.35;
    for(k=0;k<90;k++){rr=R*(.15+Math.random());aa=Math.random()*6.283;g.fillRect(cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr*.7,1.5,1.5)}
    g.lineWidth=1.2;
    for(i=0;i<3;i++){th=i*Math.PI/3+t*.0004;g.strokeStyle=COL[i];g.globalAlpha=a*.55;g.beginPath();g.ellipse(cx,cy,R,R*.38,th,0,6.283);g.stroke();
      for(k=0;k<2;k++){ph=t*.004*(1+i*.3)+i*2+k*Math.PI;ex=R*Math.cos(ph);ey=R*.38*Math.sin(ph);x=cx+ex*Math.cos(th)-ey*Math.sin(th);y=cy+ex*Math.sin(th)+ey*Math.cos(th);
        g.fillStyle=COL[i];g.globalAlpha=a;g.beginPath();g.arc(x,y,5,0,6.283);g.fill();g.globalAlpha=a*.3;g.beginPath();g.arc(x,y,12,0,6.283);g.fill()}}
    gr=g.createRadialGradient(cx,cy,0,cx,cy,nr);gr.addColorStop(0,"rgba(255,255,255,"+(.7+e*.3)+")");gr.addColorStop(.35,"rgba(255,43,214,.45)");gr.addColorStop(1,"rgba(255,43,214,0)");
    g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(cx,cy,nr,0,6.283);g.fill();
    nuc.forEach(function(n,j){g.fillStyle=j%2?"#ff2bd6":"#00f0ff";g.beginPath();g.arc(cx+n[0]*pu,cy+n[1]*pu,R0*.035,0,6.283);g.fill()});
    g.restore();
    g.globalAlpha=a;g.textAlign="center";g.font="13px 'JetBrains Mono',monospace";g.fillStyle="#fcee0a";
    g.fillText(t<C?"QUANTUM STATE: SUPERPOSITION":"WAVE FUNCTION COLLAPSE",cx,H*.12);
    g.fillStyle="#00f0ff";g.fillText("i\u210f \u2202\u03c8/\u2202t = \u0124\u03c8",cx,H*.12+22);g.globalAlpha=1}
  function burst(t,cx,cy){
    var u=t-D,k,r,al;if(u<0)return;
    for(k=0;k<3;k++){r=(u-k*120)*1.3;if(r<0)continue;al=Math.max(0,1-r/(Math.max(W,H)*.8));g.globalAlpha=al;g.strokeStyle=COL[k];g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,0,6.283);g.stroke()}
    if(u<500){g.globalAlpha=1-u/500;g.fillStyle="#fff";g.fillRect(0,0,W,H)}
    g.globalAlpha=1}
  function galaxy(t,cx,cy){
    var u=t-D,a=clamp(u/300)*(1-clamp((t-E-300)/700)),mx=Math.max(W,H)*.7,i,p,r,an;if(a<=0)return;
    for(i=0;i<gal.length;i++){p=gal[i];r=p.r*mx*ease(clamp((u-p.d)/1100));an=p.a+r*.006+u*.0015;g.globalAlpha=a*p.al;g.fillStyle=p.c;g.fillRect(cx+Math.cos(an)*r,cy+Math.sin(an)*r*.6,p.s,p.s)}
    g.globalAlpha=1}
  function worm(t,cx,cy){
    var u=t-E,a=clamp(u/400)*(1-clamp((t-F-200)/500)),mx=Math.max(W,H)*.75,k,ph,r,gr;if(a<=0)return;
    g.lineWidth=2.5;
    for(k=0;k<16;k++){ph=(u*.0011*(1+u*.0004)+k/16)%1;r=ph*ph*mx;g.globalAlpha=a*Math.min(1,ph*2)*.9;g.strokeStyle=COL[k%4];g.setLineDash([r*.5+6,r*.35+4]);g.lineDashOffset=-(u*.25+k*40);g.beginPath();g.arc(cx,cy,r,0,6.283);g.stroke()}
    g.setLineDash([]);
    gr=g.createRadialGradient(cx,cy,0,cx,cy,mx*.12);gr.addColorStop(0,"rgba(255,255,255,"+a+")");gr.addColorStop(1,"rgba(0,240,255,0)");
    g.globalAlpha=1;g.fillStyle=gr;g.fillRect(cx-mx*.12,cy-mx*.12,mx*.24,mx*.24);
    g.globalAlpha=a;g.textAlign="center";g.font="600 18px 'Rajdhani',sans-serif";g.fillStyle="#fcee0a";g.fillText("JUMPING UNIVERSES",cx,H-64);g.globalAlpha=1}
  function world(t,cx,cy,now){
    var dt=Math.min(.05,(now-lt)/1000||.016),vt=(t-F)/1000,sp=1.4+vt*vt*.9+(t>G-400?6:0),f=Math.min(W,H)*.9,pos=[],a0=Math.min(1,vt*1.5),i,q,n,j,al,r,s,o,k,m;
    lt=now;cam+=sp*dt;
    var cxp=bx(cam),cyp=by(cam);
    for(i=0;i<N;i++){if(z[i]-cam<.25){z[i]+=N*GAP;hx[i]=hex()}
      r=z[i]-cam;s=f/r;pos.push([cx+(bx(z[i])-cxp)*s,cy+(by(z[i])-cyp)*s,.45*s,r])}
    g.lineWidth=1.5;g.font="12px 'JetBrains Mono',monospace";g.textAlign="left";
    for(i=0;i<N;i++){q=pos[i];j=(i+1)%N;n=pos[j];al=Math.max(0,Math.min(1,(1-q[3]/(N*GAP))*1.4))*a0;
      g.globalAlpha=al;g.strokeStyle=COL[i%4];k=q[2];o=k*.35;
      g.strokeRect(q[0]-k,q[1]-k,k*2,k*2);g.strokeRect(q[0]-k*.75+o,q[1]-k*.75-o,k*1.5,k*1.5);
      g.beginPath();for(m=0;m<4;m++){g.moveTo(q[0]+CORN[m][0]*k,q[1]+CORN[m][1]*k);g.lineTo(q[0]+CORN[m][0]*k*.75+o,q[1]+CORN[m][1]*k*.75-o)}g.stroke();
      if(Math.abs(z[j]-z[i]-GAP)<.01){g.strokeStyle="#00f0ff";g.globalAlpha=al*.8;g.beginPath();g.moveTo(q[0],q[1]);g.lineTo(n[0],n[1]);g.stroke()}
      if(q[3]<4&&al>.3){g.globalAlpha=al;g.fillStyle="#00f0ff";g.fillText("0x"+hx[i],q[0]+k+6,q[1]-k)}}
    g.globalAlpha=a0;g.textAlign="center";g.font="600 18px 'Rajdhani',sans-serif";g.fillStyle="#fcee0a";g.fillText("ENTERING THE CHAIN",cx,H-64);
    g.font="13px 'JetBrains Mono',monospace";g.fillStyle="#00f0ff";g.fillText("BLOCK #"+(184000+Math.floor(cam*21)),cx,H-40);g.globalAlpha=1}
  function frame(now){
    if(done)return;
    var t=now-t0,cx=W/2,cy=H/2;
    g.globalAlpha=1;g.fillStyle=t<B?"#000":"rgba(0,0,0,.3)";g.fillRect(0,0,W,H);
    if(t<2600)logo(t,cx,cy);
    if(t>B&&t<D+700)atom(t,cx,cy);
    if(t>=D){galaxy(t,cx,cy);burst(t,cx,cy)}
    if(t>E)worm(t,cx,cy);
    if(t>F)world(t,cx,cy,now);
    if(t>G){g.fillStyle="rgba(255,255,255,"+clamp((t-G)/600)+")";g.fillRect(0,0,W,H)}
    if(t>X){end();return}
    raf=requestAnimationFrame(frame)}
  img.onerror=end;
  img.onload=function(){
    var o=document.createElement("canvas");o.width=o.height=240;var og=o.getContext("2d");og.drawImage(img,0,0,240,240);
    var d=og.getImageData(0,0,240,240).data,S=Math.min(W,H)*.5/240,x,y,k;R0=Math.min(W,H)*.3;
    for(y=0;y<240;y+=4)for(x=0;x<240;x+=4)if(d[(y*240+x)*4+3]>128)pts.push({tx:(x-120)*S,ty:(y-120)*S,sx:(Math.random()-.5)*W,sy:(Math.random()-.5)*H,d:Math.random()*400,a:Math.random()*6.283,v:2+Math.random()*8,c:COL[Math.floor(Math.random()*3)]});
    for(k=0;k<9;k++)nuc.push([Math.cos(k*2.4)*Math.sqrt(k)*R0*.03,Math.sin(k*2.4)*Math.sqrt(k)*R0*.03]);
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