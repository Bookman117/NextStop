// sw.js 的快取策略測試：在 Node 模擬 service worker 環境（caches、fetch、事件），不需要瀏覽器。
// 執行：node tests/sw.test.mjs        （需要 Node 18 以上，內建 fetch／Response）
// 改了 sw.js 的快取清單或策略時，記得同步更新這裡的預期數字。
import fs from "node:fs"; import vm from "node:vm"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here=path.dirname(fileURLToPath(import.meta.url));
const src=fs.readFileSync(process.argv[2]||path.join(here,"..","sw.js"),"utf8");
const ORIGIN="https://bookman117.github.io";
class Cache{constructor(){this.m=new Map()} key(r){return new URL(typeof r==="string"?r:r.url,ORIGIN+"/NextStop/").href}
  async put(r,res){this.m.set(this.key(r),res)} async match(r,o){const k=this.key(r);if(o&&o.ignoreSearch){for(const [kk,v] of this.m)if(kk.split("?")[0]===k.split("?")[0])return v.clone()}const v=this.m.get(k);return v?v.clone():undefined}
  async addAll(a){for(const u of a){const r=await net(u);if(!r.ok)throw new Error("addAll "+u);this.m.set(this.key(u),r)}} async keys(){return [...this.m.keys()].map(u=>({url:u}))} async delete(r){return this.m.delete(typeof r==="string"?r:r.url)}}
const store=new Map();
const caches={open:async n=>{if(!store.has(n))store.set(n,new Cache());return store.get(n)},keys:async()=>[...store.keys()],delete:async n=>store.delete(n)};
let online=true;const log=[];
async function net(u){u=typeof u==="string"?new URL(u,ORIGIN+"/NextStop/").href:u.url;log.push(u);if(!online)throw new TypeError("offline");return new Response("body:"+u,{status:200})}
const handlers={};
const self={addEventListener:(t,f)=>handlers[t]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}},location:new URL(ORIGIN+"/NextStop/sw.js")};
const ctx={self,caches,fetch:net,URL,Response,location:self.location,console};
vm.createContext(ctx);vm.runInContext(src,ctx);
const run=async(t,ev)=>{let p;const e=Object.assign({waitUntil:x=>p=x},ev);handlers[t](e);await p;return e};
const fetchEv=async(url,mode="no-cors")=>{let resp=null;const pend=[];const e={request:{url,method:"GET",mode},respondWith:r=>resp=r,waitUntil:x=>pend.push(x)};handlers.fetch(e);const r=resp?await resp:null;await Promise.all(pend);return r};
let failed=0;
const ok=(n,c)=>{if(!c)failed++;console.log((c?"通過 ":"失敗 ")+n)};
await run("install");await run("activate");
const shell=await caches.open("nextstop-shell-v2");
ok("安裝時預存頁面、圖示與 MapLibre（8 個檔）",(await shell.keys()).length===8);
let r=await fetchEv(ORIGIN+"/NextStop/#route","navigate");ok("有網路時頁面走網路",r&&(await r.text()).startsWith("body:"));
online=false;r=await fetchEv(ORIGIN+"/NextStop/index.html","navigate");ok("離線時頁面改用快取",r&&(await r.text()).includes("/NextStop/"));
online=true;log.length=0;
ok("TDX API 不經過快取",(await fetchEv("https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taipei"))===null);
ok("Google Fonts 不經過快取",(await fetchEv("https://fonts.googleapis.com/css2?family=x"))===null);
log.length=0;r=await fetchEv("https://unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.js","cors");ok("MapLibre 直接用快取、不重抓",r&&log.length===0);
for(let i=0;i<305;i++)await fetchEv("https://tiles.openfreemap.org/planet/x/15/1/"+i+".pbf","cors");
const tiles=await caches.open("nextstop-tiles-v2");ok("地圖圖磚最多保留 300 筆（實際 "+(await tiles.keys()).length+")",(await tiles.keys()).length===300);
online=false;r=await fetchEv("https://tiles.openfreemap.org/planet/x/15/1/304.pbf","cors");ok("離線時用快取的圖磚",r&&r.ok);
online=true;
store.set("nextstop-shell-v1",new Cache());store.set("nextstop-tiles-v1",new Cache());await run("activate");ok("啟用新版時刪除舊版快取（含舊的點陣圖磚）",!(await caches.keys()).some(k=>k.endsWith("-v1")));
console.log(failed?`\n${failed} 項失敗`:"\n全部通過");
process.exit(failed?1:0);
