
import { initAds, showRewarded, showInterstitial, showBanner, hideBanner } from './native-ads.js';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const screens=['home','pause','over','shop'];let W=0,H=0,dpr=1,raf=0,last=0,state='home';
let score=0,runCoins=0,coins=Number(localStorage.coins||0),best=Number(localStorage.best||0),speed=250,spawn=0,obstacles=[],particles=[],revived=false,gravity=1,player={x:0,y:0,r:13,vy:0};
const skins=[{name:'CYAN',cost:0,color:'#39efff'},{name:'VIOLET',cost:80,color:'#b58aff'},{name:'GOLD',cost:180,color:'#ffd66b'},{name:'LIME',cost:350,color:'#a6ff72'}];let skinIndex=Number(localStorage.skin||0);
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);player.x=W*.24;if(state==='home'||state==='shop')player.y=H*.5;}
addEventListener('resize',resize);resize();
function screen(name){screens.forEach(s=>$(s).classList.toggle('hidden',s!==name));state=name; $('hud').classList.toggle('hidden',name!=='playing');}
function toast(t){$('toast').textContent=t;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),1900)}
function updateStats(){$('best').textContent=best;$('coins').textContent=coins;$('shopCoins').textContent=coins}
function start(){score=0;runCoins=0;speed=255;spawn=0;obstacles=[];particles=[];gravity=1;revived=false;player.y=H*.5;player.vy=0;last=performance.now();screen('playing');hideBanner();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function flip(){if(state!=='playing')return;gravity*=-1;player.vy=gravity*240;for(let i=0;i<7;i++)particles.push({x:player.x,y:player.y,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,life:.35})}
function addObstacle(){let gap=Math.max(128,190-score*.22),center=H*.5+(Math.random()-.5)*Math.min(H*.24,130);let width=24;obstacles.push({x:W+35,w:width,top:Math.max(70,center-gap/2),bottom:Math.min(H-70,center+gap/2),coin:false});if(Math.random()<.72)obstacles[obstacles.length-1].coin=true}
function end(){if(state!=='playing')return;best=Math.max(best,score);localStorage.best=best;coins+=runCoins;localStorage.coins=coins;updateStats();$('finalScore').textContent=score;$('finalBest').textContent=best;$('finalCoins').textContent=runCoins;$('continueBtn').disabled=revived;screen('over');showBanner();if(score>0&&score%1===0)showInterstitialMaybe()}
let lastInterstitial=0;async function showInterstitialMaybe(){let now=Date.now();if(now-lastInterstitial>180000){lastInterstitial=now;await showInterstitial()}}
function loop(now){if(state!=='playing')return;let dt=Math.min((now-last)/1000,.035);last=now;score+=Math.floor(dt*10);speed=Math.min(470,255+score*.65);spawn-=dt;if(spawn<=0){addObstacle();spawn=Math.max(.72,1.25-score*.002)}
player.vy+=gravity*900*dt;player.y+=player.vy*dt;player.y=Math.max(42,Math.min(H-42,player.y));
for(let o of obstacles){o.x-=speed*dt;if(o.coin&&!o.collected&&Math.abs(o.x-player.x)<22){o.collected=true;runCoins++;$('runCoins').textContent=runCoins}}
obstacles=obstacles.filter(o=>o.x>-60);
for(let o of obstacles){let hitX=player.x+player.r>o.x&&player.x-player.r<o.x+o.w;if(hitX&&(player.y-player.r<o.top||player.y+player.r>o.bottom)){end();return}}
if(player.y<=player.r+12||player.y>=H-player.r-12){end();return}
particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
draw();$('score').textContent=score;raf=requestAnimationFrame(loop)}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#070b16';ctx.fillRect(0,0,W,H);
ctx.strokeStyle='#142746';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
ctx.fillStyle='#152b4b';ctx.fillRect(0,22,W,3);ctx.fillRect(0,H-25,W,3);
obstacles.forEach(o=>{ctx.shadowBlur=16;ctx.shadowColor='#ff3f89';ctx.fillStyle='#ff3f89';ctx.fillRect(o.x,25,o.w,o.top-25);ctx.fillRect(o.x,o.bottom,o.w,H-25-o.bottom);ctx.shadowBlur=0;if(o.coin&&!o.collected){ctx.beginPath();ctx.arc(o.x+o.w/2,(o.top+o.bottom)/2,8,0,Math.PI*2);ctx.fillStyle='#ffd66b';ctx.shadowBlur=14;ctx.shadowColor='#ffd66b';ctx.fill();ctx.shadowBlur=0}});
particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*3);ctx.fillStyle='#48eaff';ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);let g=ctx.createRadialGradient(player.x-5,player.y-6,2,player.x,player.y,player.r+4);g.addColorStop(0,'#fff');g.addColorStop(.3,skins[skinIndex].color);g.addColorStop(1,'#1161b5');ctx.fillStyle=g;ctx.shadowBlur=22;ctx.shadowColor=skins[skinIndex].color;ctx.fill();ctx.shadowBlur=0;
ctx.fillStyle='#5d779d';ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText('TAP TO FLIP',W/2,H-48)}
function togglePause(){if(state==='playing'){cancelAnimationFrame(raf);screen('pause');showBanner()}else if(state==='pause')startResume()}
function startResume(){screen('playing');hideBanner();last=performance.now();raf=requestAnimationFrame(loop)}
canvas.addEventListener('pointerdown',e=>{if(state==='playing'){e.preventDefault();flip()}});
$('playBtn').onclick=start;$('pauseBtn').onclick=togglePause;$('resumeBtn').onclick=startResume;$('homeBtn').onclick=()=>{screen('home');updateStats();showBanner()};$('retryBtn').onclick=start;$('overHomeBtn').onclick=()=>{screen('home');updateStats();showBanner()};
$('shopBtn').onclick=()=>{renderShop();screen('shop');showBanner()};$('closeShopBtn').onclick=()=>{screen('home');updateStats();showBanner()};
$('continueBtn').onclick=async()=>{if(revived)return;let ok=await showRewarded();if(ok){revived=true;player.y=H*.5;player.vy=0;screen('playing');hideBanner();last=performance.now();raf=requestAnimationFrame(loop)}else toast('Ad not ready. Please try again.')};
$('doubleBtn').onclick=async()=>{let ok=await showRewarded();if(ok){coins+=runCoins;localStorage.coins=coins;updateStats();$('doubleBtn').disabled=true;toast('Bonus coins added!')}else toast('Ad not ready. Please try again.')};
function renderShop(){$('shopCoins').textContent=coins;$('skinList').innerHTML='';skins.forEach((s,i)=>{let d=document.createElement('div');d.className='skin';d.innerHTML=`<span style="color:${s.color}">●</span> ${s.name}<br><small>${i===skinIndex?'EQUIPPED':s.cost+' COINS'}</small>`;let b=document.createElement('button');b.textContent=i===skinIndex?'SELECTED':(coins>=s.cost?'UNLOCK / EQUIP':'LOCKED');b.onclick=()=>{if(i===skinIndex)return;if(coins>=s.cost){if(!localStorage['skinUnlocked'+i]&&s.cost>0){coins-=s.cost;localStorage.coins=coins;localStorage['skinUnlocked'+i]='1'}if(s.cost===0||localStorage['skinUnlocked'+i]){skinIndex=i;localStorage.skin=i;updateStats();renderShop()}}else toast('Not enough coins')};d.appendChild(b);$('skinList').appendChild(d)})}
updateStats();screen('home');initAds().then(()=>showBanner());
