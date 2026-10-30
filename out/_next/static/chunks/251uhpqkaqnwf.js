(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,71400,e=>{e.v(t=>Promise.all(["static/chunks/1isww-nkwqy_c.js"].map(t=>e.l(t))).then(()=>t(32322)))},64614,e=>{"use strict";var t=e.i(43476),r=e.i(71645),o=e.i(11407),n=e.i(83283),a=e.i(59502),i=e.i(91511),s=e.i(56420);let l={name:"compass",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}]]};l.node;let d=(0,s.f)(l),c={name:"zoom-in",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};c.node;let p=(0,s.f)(c),u={name:"zoom-out",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};u.node;let b=(0,s.f)(u);e.s(["RealLifeCityMap",0,({state:s,onSelectRobot:l,onSelectOrder:c,onSwitchCity:u,onSetWeather:x,onToggleRushHour:h,onToggleRoadClosure:f,onBuildHub:g,onUpgradeHub:m,onSellHub:y,lang:v="en",theme:$="dark"})=>{let w=(0,r.useRef)(null),z=(0,r.useRef)(null),k=(0,r.useRef)(null),N=(0,r.useRef)(null),j=(0,r.useRef)(null),T=(0,r.useRef)(null),S=(0,r.useRef)(null),C=(0,r.useRef)(new Map),[I,A]=(0,r.useState)("light"===$?"streets":"dark"),[R,E]=(0,r.useState)(!0),[L,O]=(0,r.useState)(s.currentCityId||"singapore");(0,r.useEffect)(()=>{A("light"===$?"streets":"dark")},[$]);let D=o.Y[L]||o.Y.singapore,B=(0,o.t)(D,s.hubs),_=(0,r.useRef)(B.unlockedSector);(0,r.useEffect)(()=>{B.unlockedSector>_.current&&z.current&&e.A(71400).then(e=>{let t=B.unlockedNodes.map(e=>[e.lat,e.lng]);if(t.length>1&&z.current){let r=e.latLngBounds(t);z.current.flyToBounds(r,{padding:[55,55],maxZoom:15,duration:1.2})}}),_.current=B.unlockedSector},[B.unlockedSector,B.unlockedNodes]),(0,r.useEffect)(()=>{if(!w.current)return;let t=!0;return e.A(71400).then(e=>{if(!t||!w.current)return;z.current&&(z.current.remove(),z.current=null),delete e.Icon.Default.prototype._getIconUrl,e.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});let r=e.map(w.current,{center:D.center,zoom:D.zoom,zoomControl:!1,attributionControl:!1}),o=e.layerGroup().addTo(r),n=e.layerGroup().addTo(r),a=e.layerGroup().addTo(r),i=e.layerGroup().addTo(r);z.current=r,j.current=o,T.current=n,k.current=a,N.current=i,P(I,r,e);let s=()=>{z.current&&z.current.invalidateSize({pan:!1})};s(),setTimeout(s,100),setTimeout(s,300),setTimeout(s,800),window.addEventListener("resize",s);"u">typeof ResizeObserver&&w.current&&new ResizeObserver(()=>{s()}).observe(w.current)}),()=>{t=!1,C.current.clear(),z.current&&(z.current.remove(),z.current=null)}},[L]);let P=(t,r,o)=>{let n=r||z.current;n&&(S.current&&n.removeLayer(S.current),e.A(71400).then(e=>{let r="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",a="abc";"satellite"===t?(r="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",a=["0","1","2","3"]):"streets"===t&&(r=R?"https://mt{s}.google.com/vt/lyrs=m,traffic%7Cseconds_into_week:-1&x={x}&y={y}&z={z}":"https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",a=["0","1","2","3"]),S.current=(o||e).tileLayer(r,{maxZoom:19,subdomains:a,keepBuffer:8}).addTo(n),n.invalidateSize()}))};return(0,r.useEffect)(()=>{P(I)},[I,R]),(0,r.useEffect)(()=>{z.current&&j.current&&e.A(71400).then(e=>{j.current.clearLayers(),R&&D.trafficCorridors.forEach(t=>{let r=s.rushHourActive,o="#10b981",n=r?7:5,a=.7;r||"severe"===t.status?(o="#ef4444",n=r?8:7,a=.95):"moderate"===t.status?(o="#f59e0b",a=.8):"congested"===t.status&&(o="#f97316",n=6,a=.85);let i=r?Math.max(4,1.6*t.multiplier):t.multiplier,l=e.polyline(t.coordinates,{color:o,weight:n,opacity:a,lineCap:"round",lineJoin:"round",className:r||"severe"===t.status?"traffic-pulse-line":""}),d=`
          <div style="font-family: monospace; font-size: 11px; padding: 4px 6px;">
            <strong style="color: ${o};">${"zh"===v?t.nameZh:t.name}</strong><br/>
            <span>${"zh"===v?"当前车速":"Speed"}: ${r?Math.round(.45*t.speedKmh):t.speedKmh} km/h (${i.toFixed(1)}x ${"zh"===v?"严重延迟":"delay"})${r?"zh"===v?" 🚨 晚高峰峰值":" 🚨 RUSH HOUR":""}</span>
          </div>
        `;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(j.current)})})},[R,D,s.rushHourActive,v]),(0,r.useEffect)(()=>{z.current&&T.current&&e.A(71400).then(e=>{T.current.clearLayers(),s.robots.forEach(t=>{if("moving"===t.status||"delivering"===t.status||"returning"===t.status){let r=[];if(t.position.lat&&t.position.lng&&r.push([t.position.lat,t.position.lng]),t.pathQueue.forEach(e=>{e.lat&&e.lng&&r.push([e.lat,e.lng])}),t.targetDestination?.lat&&t.targetDestination?.lng&&r.length>1){let e=r[r.length-1];.0025>Math.hypot(e[0]-t.targetDestination.lat,e[1]-t.targetDestination.lng)&&r.push([t.targetDestination.lat,t.targetDestination.lng])}if(r.length>1){let o=t.id===s.selectedRobotId,n="returning"===t.status,a="delivering"===t.status,i=n?"#c084fc":a?"#22d3ee":"#38bdf8";e.polyline(r,{color:i,weight:o?8:5,opacity:.35,lineCap:"round",lineJoin:"round"}).addTo(T.current);let l=e.polyline(r,{color:i,weight:o?4:3,opacity:.95,lineCap:"round",lineJoin:"round",className:n?"animated-return-route":"animated-delivery-route"}),d=n?`⚡ <b>${t.name}</b> ${"zh"===v?"自主返航充电":"Returning to Base Recharge"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Hub"}</span>`:`📦 <b>${t.name}</b> ${"zh"===v?"派送中":"Delivering"}: Order #${t.currentOrderId||"Active"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Recipient"}</span>`;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(T.current)}}if(t.carriedOrderIds&&t.carriedOrderIds.length>1&&t.targetDestination){let r=t.carriedOrderIds.find(e=>e!==t.currentOrderId)||t.carriedOrderIds[1],o=s.orders.find(e=>e.id===r);if(o&&o.recipientAddress.lat&&o.recipientAddress.lng&&t.targetDestination.lat&&t.targetDestination.lng){let a=(0,n.G)({x:0,y:0,lat:t.targetDestination.lat,lng:t.targetDestination.lng},{x:0,y:0,lat:o.recipientAddress.lat,lng:o.recipientAddress.lng},D,{}).filter(e=>void 0!==e.lat&&void 0!==e.lng).map(e=>[e.lat,e.lng]);if(a.length>1){let t=e.polyline(a,{color:"#a855f7",weight:3.5,opacity:.85,dashArray:"5, 6",lineCap:"round",lineJoin:"round"});t.bindTooltip(`📦📦 <b>${"zh"===v?"一车多单·第2站":"Multi-Drop Stop 2"}</b>: #${r}<br/><span style="color:#cbd5e1;">➔ ${o.recipientAddress.zone}</span>`,{sticky:!0,opacity:.95}),t.addTo(T.current)}}}if(t.missionQueue&&t.missionQueue.length>0){let r=["#f59e0b","#10b981","#ec4899","#8b5cf6"];t.missionQueue.forEach((o,n)=>{let a=[];if(o.routeWaypoints.forEach(e=>{e.lat&&e.lng&&a.push([e.lat,e.lng])}),o.targetDestination?.lat&&o.targetDestination?.lng){let e=a[a.length-1];if(e){let t=Math.hypot(e[0]-o.targetDestination.lat,e[1]-o.targetDestination.lng);t>1e-4&&t<.0025&&a.push([o.targetDestination.lat,o.targetDestination.lng])}}if(a.length>1){let i=r[n%r.length],s=e.polyline(a,{color:i,weight:3,opacity:.75,dashArray:"6, 8",lineCap:"round",lineJoin:"round"}),l=n+2,d=`🗓️ <b>${t.name}</b> ${"zh"===v?`已排程第 ${l} 序位行动`:`Scheduled Leg #${l}`}: Order #${o.orderId}<br/><span style="color:#fde68a;">➔ ${o.targetDestination.label}</span><br/><span style="color:#94a3b8; font-size:10px;">${o.priorityReasoning||""}</span>`;s.bindTooltip(d,{sticky:!0,opacity:.95}),s.addTo(T.current)}})}})})},[s.robots,s.selectedRobotId,v]),(0,r.useEffect)(()=>{z.current&&k.current&&e.A(71400).then(e=>{if(k.current.clearLayers(),s.hubs.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.level||1,o=3===r?"#a855f7":2===r?"#38bdf8":"#06b6d4",n=r>1?`<span style="color:#fde047; font-size:8px; margin-left:2px;">Lv.${r}</span>`:"",a=3===r?900:2===r?650:450;e.circle([t.position.lat,t.position.lng],{radius:a,color:o,weight:1.5,opacity:.6,dashArray:3===r?"4, 4":void 0,fillColor:o,fillOpacity:3===r?.09:2===r?.06:.04}).addTo(k.current);let i=`
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #083344;
              border: 2px solid ${o};
              box-shadow: 0 0 16px ${o}99;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #38bdf8;
              font-family: monospace;
              font-weight: 900;
              font-size: 13px;
            ">${3===r?"⚡🏢":2===r?"🏢⚡":"🏢"}</div>
            <div style="
              margin-top: 3px;
              background: rgba(8, 51, 68, 0.9);
              border: 1px solid ${o};
              padding: 1px 6px;
              border-radius: 4px;
              color: #7dd3fc;
              font-family: sans-serif;
              font-weight: bold;
              font-size: 9px;
              white-space: nowrap;
            ">${t.name.split(" ")[0]}${n}</div>
          </div>
        `,l=e.divIcon({html:i,className:"custom-hub-marker",iconSize:[36,48],iconAnchor:[18,20]}),d=e.marker([t.position.lat,t.position.lng],{icon:l}),c=1===r?2:3,p=2===c?80:160,u=r<3,b=s.hubs.length>1,x=document.createElement("div");x.style.cssText="min-width: 190px; font-family: monospace; padding: 4px; color: #f8fafc;",x.innerHTML=`
          <div style="font-weight: bold; font-size: 12px; color: ${o}; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${t.name}</span>
            <span style="font-size: 9px; background: #083344; padding: 1px 5px; border-radius: 4px; border: 1px solid ${o};">LEVEL ${r}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-bottom: 8px; line-height: 1.5;">
            ⚡ ${"zh"===v?"回充速率":"Charge Speed"}: <b style="color: #34d399;">+${t.chargingRatePerTick||(3===r?14:2===r?9:6)}% / tick</b><br/>
            🔌 ${"zh"===v?"充电机位":"Charging Bays"}: <b style="color: #38bdf8;">${t.chargingBays||2} ${"zh"===v?"台同时":"Bays"}</b><br/>
            📍 ${"zh"===v?"辐射半径":"Radius"}: <b>${a}m</b>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            ${u?`<button id="btn-upg-${t.id}" style="flex: 1; background: #0284c7; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;">⚡ ${"zh"===v?`升级 Lv.${c} ($${p})`:`Upgrade Lv.${c} ($${p})`}</button>`:'<div style="flex: 1; text-align: center; color: #fde047; font-size: 10px; font-weight: bold; background: rgba(234, 179, 8, 0.15); padding: 4px; border-radius: 4px;">⚡ MAX LEVEL</div>'}
            ${b?`<button id="btn-sell-${t.id}" style="background: #881337; color: #fecdd3; border: 1px solid #f43f5e; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" title="${"zh"===v?"撤除站点回收资金 (+$100)":"Decommission Hub (+$100)"}">🗑️ +$100</button>`:""}
          </div>
        `,d.bindPopup(x,{maxWidth:260}),d.on("popupopen",()=>{let e=document.getElementById(`btn-upg-${t.id}`);e&&m&&(e.onclick=()=>{m(t.id,c),d.closePopup()});let r=document.getElementById(`btn-sell-${t.id}`);r&&y&&(r.onclick=()=>{y(t.id),d.closePopup()})}),d.addTo(k.current)}),(s.levelProgression?.currentLevel||1)>=2&&g&&(B.availableBuildNodes.forEach(t=>{let r=t.sector||1,o=`
            <div style="
              position: relative;
              background: rgba(88, 28, 135, 0.95);
              border: 1.5px dashed #e879f9;
              color: #fae8ff;
              padding: 2px 7px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 8.5px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 0 14px rgba(217,70,239,0.65);
              white-space: nowrap;
              display: inline-flex;
              align-items: center;
              gap: 3px;
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #e879f9; box-shadow: 0 0 6px #f472b6;"></span>
              <span>${"zh"===v?`➕ 建站 [第${r}区]`:`➕ BUILD [S${r}]`}</span>
            </div>
          `,n=e.divIcon({html:o,className:"node-build-marker",iconSize:[74,20],iconAnchor:[37,10]}),a=e.marker([t.lat,t.lng],{icon:n,zIndexOffset:600}),i=document.createElement("div");i.style.cssText="min-width: 195px; font-family: monospace; padding: 4px; color: #f8fafc;",i.innerHTML=`
            <div style="font-weight: bold; color: #e879f9; font-size: 12px; margin-bottom: 4px;">
              🏢 ${"zh"===v?`新建充电枢纽 (第 ${r} 区)`:`Construct Hub (Sector ${r})`}
            </div>
            <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 8px; line-height: 1.45;">
              📍 <b>${"zh"===v?t.nameZh:t.name}</b><br/>
              🗺️ ${"zh"===v?`当前本区进度: ${B.currentSectorBuilt}/${B.currentSectorTotal} 座 (建满解锁下一区)`:`Sector Progress: ${B.currentSectorBuilt}/${B.currentSectorTotal} Hubs`}<br/>
              💰 ${"zh"===v?"建造成本: $200":"Build Cost: $200"} &bull; 💵 $${s.financials.balance.toFixed(0)}
            </div>
            <button id="btn-build-${t.id}" style="width: 100%; background: #9333ea; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" ${s.financials.balance<200?"disabled":""}>
              ${s.financials.balance<200?"zh"===v?"资金不足 ($200)":"Insufficient Funds ($200)":"zh"===v?"确认在此投资建站 ($200)":"Confirm Build Hub ($200)"}
            </button>
          `,a.bindPopup(i,{maxWidth:250}),a.on("popupopen",()=>{let e=document.getElementById(`btn-build-${t.id}`);e&&g&&s.financials.balance>=200&&(e.onclick=()=>{g("zh"===v?`${t.nameZh}中心站`:`${t.name} Depot`,t.lat,t.lng),a.closePopup()})}),a.addTo(k.current)}),B.nextLockedSectorNodes.forEach(t=>{let r=t.sector||2,o=`
            <div style="
              background: rgba(15, 23, 42, 0.82);
              border: 1px dashed rgba(148, 163, 184, 0.55);
              color: #94a3b8;
              padding: 1.5px 6px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 8px;
              font-weight: 700;
              white-space: nowrap;
              opacity: 0.85;
            ">🔒 ${"zh"===v?`待解锁 [${r}区]`:`LOCKED [S${r}]`}</div>
          `,n=e.divIcon({html:o,className:"node-locked-marker",iconSize:[70,18],iconAnchor:[35,9]}),a=e.marker([t.lat,t.lng],{icon:n});a.bindTooltip("zh"===v?`<b>🔒 ${t.nameZh} (第 ${r} 扩张区)</b><br/>请先建满当前第 ${B.unlockedSector} 区的剩余站点 (${B.currentSectorBuilt}/${B.currentSectorTotal}) 即可解锁本区域！`:`<b>🔒 ${t.name} (Sector ${r})</b><br/>Complete all Hub sites in Sector ${B.unlockedSector} (${B.currentSectorBuilt}/${B.currentSectorTotal}) to unlock this district!`,{direction:"top",opacity:.95}),a.addTo(k.current)})),s.orders.forEach(t=>{if(("in_transit"===t.status||"pending"===t.status)&&t.recipientAddress.lat&&t.recipientAddress.lng){let r=t.deadlineTick-s.tick<=15,o=t.id===s.selectedOrderId,n=Math.max(0,t.deadlineTick-s.tick),a=r?"#ef4444":"#10b981",i=`
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="
                background: ${a};
                color: #ffffff;
                border: ${o?"2px solid #ffffff":"1px solid rgba(255,255,255,0.7)"};
                border-radius: 6px;
                padding: 1px 5px;
                font-family: monospace;
                font-weight: bold;
                font-size: 9px;
                box-shadow: 0 0 12px ${a}88;
                white-space: nowrap;
              ">📦 #${t.id} &bull; ${n}t</div>
              <div style="
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${a};
              "></div>
            </div>
          `,l=e.divIcon({html:i,className:"custom-drop-marker",iconSize:[50,30],iconAnchor:[25,26]}),d=e.marker([t.recipientAddress.lat,t.recipientAddress.lng],{icon:l});d.on("click",()=>c(t.id)),d.bindTooltip(`<b>Order #${t.id}</b> (${t.sender})<br/>SLA: ${n} ticks remaining`,{direction:"top"}),d.addTo(k.current)}}),s.roadClosureNodeId){let t=D.roadNodes.find(e=>e.id===s.roadClosureNodeId);if(t){let r=`
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div class="hazard-roadblock-pulse" style="
                background: #b91c1c;
                color: #ffffff;
                border: 2px solid #fecaca;
                border-radius: 8px;
                padding: 3px 8px;
                font-family: monospace;
                font-weight: 900;
                font-size: 10px;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 0 20px rgba(239,68,68,0.8);
              ">
                <span>🚧</span>
                <span>${"zh"===v?"道路施工封闭":"ROAD CLOSED"}</span>
              </div>
              <div style="
                background: rgba(15,23,42,0.92);
                color: #fca5a5;
                border: 1px solid #ef4444;
                border-radius: 4px;
                padding: 1px 6px;
                font-size: 8px;
                font-weight: bold;
                margin-top: 3px;
                white-space: nowrap;
                font-family: monospace;
              ">${"zh"===v?t.nameZh:t.name}</div>
            </div>
          `,o=e.divIcon({html:r,className:"custom-roadblock-marker",iconSize:[130,42],iconAnchor:[65,21]}),n=e.marker([t.lat,t.lng],{icon:o,zIndexOffset:1500});n.bindTooltip(`<b>🚧 ${"zh"===v?"突发紧急施工封闭":"EMERGENCY ROAD CLOSURE"}</b><br/>${"zh"===v?"全向双向交通阻断，途经机器人必须执行绕行":"All lanes blocked. Fleet must detour."}`,{direction:"top",opacity:.95}),n.addTo(k.current)}}})},[s.hubs,s.orders,s.selectedOrderId,s.tick,s.roadClosureNodeId,s.financials.balance,s.levelProgression?.currentLevel,g,m,y,v]),(0,r.useEffect)(()=>{z.current&&N.current&&e.A(71400).then(e=>{let t=new Set(s.robots.map(e=>e.id));C.current.forEach((e,r)=>{t.has(r)||(N.current&&N.current.removeLayer(e),C.current.delete(r))}),s.robots.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.id===s.selectedRobotId,o=t.batteryPct>50?"#10b981":t.batteryPct>25?"#f59e0b":"#ef4444",n="delivering"===t.status,a="returning"===t.status,i="charging"===t.status,d=n||a||"moving"===t.status,c='<div style="background:#334155; color:#94a3b8; border-radius:4px; padding:1px 4px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace;">STANDBY</div>',p=t.carriedOrderIds&&t.carriedOrderIds.length>0?t.carriedOrderIds.length:+!!t.currentOrderId;if(n){let e=p>1?`📦📦 ${p} PKGS`:`📦 #${t.currentOrderId||"PKG"}`;c=`<div style="background:#0284c7; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(2,132,199,0.8);">${e}</div>`}else a?c=`<div style="background:#7c3aed; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(124,58,237,0.8);">⚡ ${"zh"===v?"返航":"RETURN"}</div>`:i&&(c=`<div style="background:#059669; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(5,150,105,0.8);">🔋 ${t.batteryPct.toFixed(0)}%</div>`);let u=r?"#38bdf8":a?"#a855f7":n?"#06b6d4":t.color||"#64748b",b=`
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <!-- Radar Halo when moving -->
            ${d?`<div class="robot-radar-ping" style="
              position: absolute;
              top: 10px;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 2px solid ${u};
              pointer-events: none;
            "></div>`:""}

            <!-- Status Badge -->
            ${c}

            <!-- Battery Gauge -->
            <div style="
              width: 32px;
              height: 3.5px;
              background: rgba(0,0,0,0.85);
              border-radius: 2px;
              overflow: hidden;
              margin-bottom: 2px;
              border: 0.5px solid rgba(255,255,255,0.2);
            ">
              <div style="width: ${t.batteryPct}%; height: 100%; background: ${o};"></div>
            </div>

            <!-- Pod Vehicle Chassis -->
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 10px;
              background: ${i?"#064e3b":a?"#2e1065":n?"#0c4a6e":"#0f172a"};
              border: 2px solid ${u};
              box-shadow: 0 0 ${r?"18px #38bdf8":"10px rgba(6,182,212,0.4)"};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #f8fafc;
              font-family: monospace;
              font-weight: 900;
              font-size: 9px;
            ">
              <span style="font-size:12px;">${"speedy"===t.archetype?"🏎️":"heavy"===t.archetype?"🚚":i?"🔌":a?"⚡":"🤖"}</span>
              <span style="font-size:7px; opacity:0.9;">${t.name.replace(/[^0-9]/g,"").slice(-2)||"01"}</span>
            </div>
          </div>
        `,x=e.divIcon({html:b,className:"custom-bot-marker",iconSize:[44,52],iconAnchor:[22,28]}),h=`
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <strong style="color: ${u}; font-size: 12px;">${t.name}</strong><br/>
            <span>${"zh"===v?"状态":"Status"}: <b>${t.status.toUpperCase()}</b></span><br/>
            <span>${"zh"===v?"电量":"Battery"}: <b>${t.batteryPct.toFixed(0)}%</b></span><br/>
            <span>${"zh"===v?"载重":"Payload"}: <b>${t.currentPayloadKg} / ${t.maxCapacityKg} kg</b></span><br/>
            <span>${"zh"===v?"累计送达":"Completed"}: <b>${t.totalDeliveriesCompleted}</b></span><br/>
            ${t.targetDestination?`<span style="color:#38bdf8;">➔ ${t.targetDestination.label}</span>`:""}
          </div>
        `,f=C.current.get(t.id);if(f)N.current.hasLayer(f)||N.current.addLayer(f),f.setLatLng([t.position.lat,t.position.lng]),f.setIcon(x),f.setTooltipContent(h);else{let r=e.marker([t.position.lat,t.position.lng],{icon:x,zIndexOffset:1e3});r.on("click",()=>{l(t.id),z.current&&t.position.lat&&t.position.lng&&z.current.flyTo([t.position.lat,t.position.lng],16,{duration:.8})}),r.bindTooltip(h,{direction:"top",opacity:.95}),r.addTo(N.current),C.current.set(t.id,r)}})})},[s.robots,s.selectedRobotId,v]),(0,t.jsxs)("div",{className:"relative w-full h-full min-h-0 bg-slate-950 overflow-hidden select-none",children:[(0,t.jsx)("div",{ref:w,className:"absolute inset-0 w-full h-full z-0"}),"rain"===s.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] rain-overlay"}),"typhoon"===s.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] typhoon-overlay"}),(0,t.jsxs)("div",{className:"absolute top-3 left-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-cyan-900/60 shadow-xl select-none",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1 px-1.5 text-[11px] font-mono font-bold text-slate-400",children:[(0,t.jsx)(i.f,{className:"w-3.5 h-3.5 text-cyan-400"}),(0,t.jsx)("span",{className:"hidden md:inline",children:"zh"===v?"城市:":"CITY:"})]}),Object.values(o.Y).map(e=>(0,t.jsxs)("button",{onClick:()=>{var t;let r;return t=e.id,N.current&&N.current.clearLayers(),C.current.clear(),O(t),u(t),void((r=o.Y[t])&&z.current&&z.current.flyTo(r.center,r.zoom,{duration:1.5}))},className:`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-all ${L===e.id?"bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-bold":"text-slate-300 hover:bg-slate-800"}`,children:[(0,t.jsx)("span",{children:e.flag}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?e.nameZh:e.name})]},e.id))]}),(0,t.jsxs)("div",{className:"absolute top-12 left-3 z-10 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] font-mono shadow-xl",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"zh"===v?"车队跟踪:":"FLEET TRACKER:"}),(0,t.jsx)("div",{className:"flex items-center gap-1.5",children:s.robots.map(e=>{let r="delivering"===e.status,o="returning"===e.status,n="charging"===e.status,a=e.id===s.selectedRobotId;return(0,t.jsxs)("button",{onClick:()=>{l(e.id),e.position.lat&&e.position.lng&&z.current&&z.current.flyTo([e.position.lat,e.position.lng],16,{duration:.8})},title:e.targetDestination?`${e.name}: ${e.targetDestination.label}`:e.name,className:`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all ${a?"border-cyan-400 bg-cyan-950 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]":r?"border-cyan-700/60 bg-cyan-950/40 text-cyan-200":o?"border-purple-700/60 bg-purple-950/40 text-purple-200":n?"border-emerald-700/60 bg-emerald-950/40 text-emerald-300":"border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"}`,children:[(0,t.jsx)("span",{children:r?"📦":o?"⚡":n?"🔋":"⚪"}),(0,t.jsx)("span",{children:e.name.replace(/[^0-9]/g,"").slice(-2)?`R${e.name.replace(/[^0-9]/g,"").slice(-2)}`:e.name.split("-")[0]}),(0,t.jsxs)("span",{className:"text-slate-500 font-sans",children:[e.batteryPct.toFixed(0),"%"]})]},e.id)})})]}),(s.levelProgression?.currentLevel||1)>=2&&(0,t.jsxs)("div",{className:"absolute top-[86px] left-3 z-10 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-purple-500/50 text-[10px] font-mono shadow-xl",children:[(0,t.jsxs)("span",{className:"text-purple-300 font-bold",children:["🗺️ ","zh"===v?B.currentSectorNameZh:B.currentSectorNameEn]}),(0,t.jsx)("span",{className:"px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-200 font-bold",children:"zh"===v?`本区站点: ${B.currentSectorBuilt}/${B.currentSectorTotal}`:`Sector Hubs: ${B.currentSectorBuilt}/${B.currentSectorTotal}`}),B.availableBuildNodes.length>0?(0,t.jsxs)("button",{onClick:()=>{e.A(71400).then(e=>{let t=B.availableBuildNodes.map(e=>[e.lat,e.lng]);if(1===t.length&&z.current)z.current.flyTo(t[0],15,{duration:.9});else if(t.length>1&&z.current){let r=e.latLngBounds(t);z.current.flyToBounds(r,{padding:[70,70],maxZoom:15,duration:.9})}})},className:"px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)]",title:"zh"===v?"点击在地图上聚焦显示当前可建站的位置":"Pan map to available Hub build sites",children:["📍 ","zh"===v?`定位可建站点 (${B.availableBuildNodes.length})`:`Locate Build Sites (${B.availableBuildNodes.length})`]}):(0,t.jsxs)("span",{className:"text-purple-300 font-bold animate-pulse",children:["⚡ ","zh"===v?"正在解锁下一片大都会拓建区...":"Unlocking next metropolis sector..."]})]}),(0,t.jsxs)("div",{className:"absolute top-3 right-3 z-10 flex items-center justify-end gap-1.5 max-w-[calc(100%-160px)] flex-wrap",children:[(0,t.jsxs)("div",{title:"zh"===v?`全城气象感知：当前天气为【${"typhoon"===s.weather?"⚡ 强雷暴台风 (能耗+75%，接单享有+25%极端天气津贴)":"rain"===s.weather?"🌧️ 热带暴雨 (路面湿滑，能耗消耗+35%)":"☀️ 晴天万里 (标准能耗 1.0x)"}】（系统根据气象模型自动随机演进，无需学生手动设定）`:`Atmospheric Sensor: Current weather [${s.weather.toUpperCase()}] (${"typhoon"===s.weather?"+75% drain, +25% hazard pay":"rain"===s.weather?"+35% drain":"1.0x standard"}). Autonomously evolving.`,className:`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all shadow-md shrink-0 ${"typhoon"===s.weather?"bg-indigo-950/90 border-indigo-400/80 text-indigo-200 shadow-[0_0_14px_rgba(99,102,241,0.5)] animate-pulse":"rain"===s.weather?"bg-cyan-950/90 border-cyan-500/70 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]":"bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]"}`,children:[(0,t.jsx)("span",{className:"text-sm",children:"typhoon"===s.weather?"⚡":"rain"===s.weather?"🌧️":"☀️"}),(0,t.jsx)("span",{className:"whitespace-nowrap",children:"zh"===v?"typhoon"===s.weather?"雷暴台风":"rain"===s.weather?"热带暴雨":"晴天万里":"typhoon"===s.weather?"TYPHOON":"rain"===s.weather?"RAIN":"CLEAR"}),(0,t.jsx)("span",{className:"text-[10px] px-1 py-0.5 rounded bg-black/40 text-slate-300 font-normal",children:"typhoon"===s.weather?"+75%⚡":"rain"===s.weather?"+35%⚡":"1.0x"})]}),(0,t.jsxs)("div",{title:"zh"===v?s.rushHourActive?"主干道高峰大拥堵中 (延误高达 4.2x，建议提示词加入避堵指令)":"全市路网畅通，车流处于常态流速":s.rushHourActive?"Evening Rush Hour Active (delays up to 4.2x, evaluate detours)":"Standard traffic flow",className:`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all shadow-md shrink-0 ${s.rushHourActive?"bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.55)] animate-pulse":"bg-slate-900/90 border-slate-800 text-slate-400"}`,children:[(0,t.jsx)("span",{children:"🚦"}),(0,t.jsx)("span",{className:"whitespace-nowrap",children:"zh"===v?s.rushHourActive?"晚高峰 4.2x":"路况畅通":s.rushHourActive?"RUSH HOUR 4.2x":"FLOW NORMAL"})]}),s.roadClosureNodeId&&(0,t.jsxs)("div",{title:"zh"===v?`突发市政施工封闭：[${D.roadNodes.find(e=>e.id===s.roadClosureNodeId)?.nameZh||s.roadClosureNodeId}] 发生紧急抢修双向全封闭！智能体路线算法将自动避障绕行！`:`Emergency Roadblock: [${D.roadNodes.find(e=>e.id===s.roadClosureNodeId)?.name||s.roadClosureNodeId}] closed for repairs! Fleet must detour.`,className:"flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border bg-amber-950/90 border-amber-500/80 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.55)] animate-pulse backdrop-blur-md shrink-0",children:[(0,t.jsx)("span",{children:"🚧"}),(0,t.jsx)("span",{children:"zh"===v?"突发封路中":"ROADBLOCK"}),(0,t.jsx)("span",{className:"text-[10px] text-amber-200 truncate max-w-[90px]",children:D.roadNodes.find(e=>e.id===s.roadClosureNodeId)?.nameZh||s.roadClosureNodeId})]}),(0,t.jsxs)("button",{onClick:()=>E(!R),className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all shrink-0 ${R?"bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)(a.f,{className:"w-3.5 h-3.5"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"路况":"TRAFFIC"})]}),(0,t.jsxs)("div",{className:"flex items-center bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-800 text-xs font-mono shrink-0",children:[(0,t.jsx)("button",{onClick:()=>A("dark"),className:`px-2 py-0.5 rounded-lg transition-colors ${"dark"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"深色":"DARK"}),(0,t.jsx)("button",{onClick:()=>A("satellite"),className:`px-2 py-0.5 rounded-lg transition-colors ${"satellite"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"卫星":"SATELLITE"}),(0,t.jsx)("button",{onClick:()=>A("streets"),className:`px-2 py-0.5 rounded-lg transition-colors ${"streets"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"街道":"STREETS"})]})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 right-4 z-10 flex flex-col gap-1.5",children:[(0,t.jsx)("button",{onClick:()=>z.current?.zoomIn(),title:"Zoom In",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(p,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>z.current?.zoomOut(),title:"Zoom Out",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(b,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>z.current?.flyTo(D.center,D.zoom),title:"Recenter City",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg",children:(0,t.jsx)(d,{className:"w-4 h-4"})})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 text-[10px] font-mono text-slate-300 shadow-xl",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400"}),(0,t.jsxs)("span",{children:[">40 km/h (","zh"===v?"畅通":"Fast",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-amber-400"}),(0,t.jsxs)("span",{children:["20-40 km/h (","zh"===v?"缓行":"Slow",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"}),(0,t.jsxs)("span",{children:["<15 km/h (","zh"===v?"重度拥堵":"Jam",")"]})]})]})]})}],64614)},59666,function(e){e.n(e.i(64614))}]);