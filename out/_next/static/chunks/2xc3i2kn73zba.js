(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,71400,e=>{e.v(t=>Promise.all(["static/chunks/1isww-nkwqy_c.js"].map(t=>e.l(t))).then(()=>t(32322)))},64614,e=>{"use strict";var t=e.i(43476),r=e.i(71645),n=e.i(11407),o=e.i(83283),a=e.i(59502),s=e.i(91511),i=e.i(56420);let l={name:"compass",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}]]};l.node;let d=(0,i.f)(l),c={name:"zoom-in",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};c.node;let p=(0,i.f)(c),b={name:"zoom-out",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};b.node;let u=(0,i.f)(b);e.s(["RealLifeCityMap",0,({state:i,onSelectRobot:l,onSelectOrder:c,onSwitchCity:b,onSetWeather:x,onToggleRushHour:f,onToggleRoadClosure:g,onBuildHub:h,onUpgradeHub:m,onSellHub:y,lang:v="en",theme:$="dark"})=>{let z=(0,r.useRef)(null),w=(0,r.useRef)(null),k=(0,r.useRef)(null),j=(0,r.useRef)(null),N=(0,r.useRef)(null),C=(0,r.useRef)(null),T=(0,r.useRef)(null),R=(0,r.useRef)(new Map),[I,A]=(0,r.useState)("light"===$?"streets":"dark"),[E,D]=(0,r.useState)(!0),[L,O]=(0,r.useState)(i.currentCityId||"singapore");(0,r.useEffect)(()=>{A("light"===$?"streets":"dark")},[$]);let S=n.f[L]||n.f.singapore;(0,r.useEffect)(()=>{if(!z.current)return;let t=!0;return e.A(71400).then(e=>{if(!t||!z.current)return;w.current&&(w.current.remove(),w.current=null),delete e.Icon.Default.prototype._getIconUrl,e.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});let r=e.map(z.current,{center:S.center,zoom:S.zoom,zoomControl:!1,attributionControl:!1}),n=e.layerGroup().addTo(r),o=e.layerGroup().addTo(r),a=e.layerGroup().addTo(r),s=e.layerGroup().addTo(r);w.current=r,N.current=n,C.current=o,k.current=a,j.current=s,_(I,r,e);let i=()=>{w.current&&w.current.invalidateSize({pan:!1})};i(),setTimeout(i,100),setTimeout(i,300),setTimeout(i,800),window.addEventListener("resize",i);"u">typeof ResizeObserver&&z.current&&new ResizeObserver(()=>{i()}).observe(z.current)}),()=>{t=!1,R.current.clear(),w.current&&(w.current.remove(),w.current=null)}},[L]);let _=(t,r,n)=>{let o=r||w.current;o&&(T.current&&o.removeLayer(T.current),e.A(71400).then(e=>{let r="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",a="abc";"satellite"===t?(r="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",a=["0","1","2","3"]):"streets"===t&&(r=E?"https://mt{s}.google.com/vt/lyrs=m,traffic%7Cseconds_into_week:-1&x={x}&y={y}&z={z}":"https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",a=["0","1","2","3"]),T.current=(n||e).tileLayer(r,{maxZoom:19,subdomains:a,keepBuffer:8}).addTo(o),o.invalidateSize()}))};return(0,r.useEffect)(()=>{_(I)},[I,E]),(0,r.useEffect)(()=>{w.current&&N.current&&e.A(71400).then(e=>{N.current.clearLayers(),E&&S.trafficCorridors.forEach(t=>{let r=i.rushHourActive,n="#10b981",o=r?7:5,a=.7;r||"severe"===t.status?(n="#ef4444",o=r?8:7,a=.95):"moderate"===t.status?(n="#f59e0b",a=.8):"congested"===t.status&&(n="#f97316",o=6,a=.85);let s=r?Math.max(4,1.6*t.multiplier):t.multiplier,l=e.polyline(t.coordinates,{color:n,weight:o,opacity:a,lineCap:"round",lineJoin:"round",className:r||"severe"===t.status?"traffic-pulse-line":""}),d=`
          <div style="font-family: monospace; font-size: 11px; padding: 4px 6px;">
            <strong style="color: ${n};">${"zh"===v?t.nameZh:t.name}</strong><br/>
            <span>${"zh"===v?"当前车速":"Speed"}: ${r?Math.round(.45*t.speedKmh):t.speedKmh} km/h (${s.toFixed(1)}x ${"zh"===v?"严重延迟":"delay"})${r?"zh"===v?" 🚨 晚高峰峰值":" 🚨 RUSH HOUR":""}</span>
          </div>
        `;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(N.current)})})},[E,S,i.rushHourActive,v]),(0,r.useEffect)(()=>{w.current&&C.current&&e.A(71400).then(e=>{C.current.clearLayers(),i.robots.forEach(t=>{if("moving"===t.status||"delivering"===t.status||"returning"===t.status){let r=[];if(t.position.lat&&t.position.lng&&r.push([t.position.lat,t.position.lng]),t.pathQueue.forEach(e=>{e.lat&&e.lng&&r.push([e.lat,e.lng])}),t.targetDestination?.lat&&t.targetDestination?.lng&&r.length>1){let e=r[r.length-1];.0025>Math.hypot(e[0]-t.targetDestination.lat,e[1]-t.targetDestination.lng)&&r.push([t.targetDestination.lat,t.targetDestination.lng])}if(r.length>1){let n=t.id===i.selectedRobotId,o="returning"===t.status,a="delivering"===t.status,s=o?"#c084fc":a?"#22d3ee":"#38bdf8";e.polyline(r,{color:s,weight:n?8:5,opacity:.35,lineCap:"round",lineJoin:"round"}).addTo(C.current);let l=e.polyline(r,{color:s,weight:n?4:3,opacity:.95,lineCap:"round",lineJoin:"round",className:o?"animated-return-route":"animated-delivery-route"}),d=o?`⚡ <b>${t.name}</b> ${"zh"===v?"自主返航充电":"Returning to Base Recharge"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Hub"}</span>`:`📦 <b>${t.name}</b> ${"zh"===v?"派送中":"Delivering"}: Order #${t.currentOrderId||"Active"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Recipient"}</span>`;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(C.current)}}if(t.carriedOrderIds&&t.carriedOrderIds.length>1&&t.targetDestination){let r=t.carriedOrderIds.find(e=>e!==t.currentOrderId)||t.carriedOrderIds[1],n=i.orders.find(e=>e.id===r);if(n&&n.recipientAddress.lat&&n.recipientAddress.lng&&t.targetDestination.lat&&t.targetDestination.lng){let a=(0,o.G)({x:0,y:0,lat:t.targetDestination.lat,lng:t.targetDestination.lng},{x:0,y:0,lat:n.recipientAddress.lat,lng:n.recipientAddress.lng},S,{}).filter(e=>void 0!==e.lat&&void 0!==e.lng).map(e=>[e.lat,e.lng]);if(a.length>1){let t=e.polyline(a,{color:"#a855f7",weight:3.5,opacity:.85,dashArray:"5, 6",lineCap:"round",lineJoin:"round"});t.bindTooltip(`📦📦 <b>${"zh"===v?"一车多单·第2站":"Multi-Drop Stop 2"}</b>: #${r}<br/><span style="color:#cbd5e1;">➔ ${n.recipientAddress.zone}</span>`,{sticky:!0,opacity:.95}),t.addTo(C.current)}}}if(t.missionQueue&&t.missionQueue.length>0){let r=["#f59e0b","#10b981","#ec4899","#8b5cf6"];t.missionQueue.forEach((n,o)=>{let a=[];if(n.routeWaypoints.forEach(e=>{e.lat&&e.lng&&a.push([e.lat,e.lng])}),n.targetDestination?.lat&&n.targetDestination?.lng){let e=a[a.length-1];if(e){let t=Math.hypot(e[0]-n.targetDestination.lat,e[1]-n.targetDestination.lng);t>1e-4&&t<.0025&&a.push([n.targetDestination.lat,n.targetDestination.lng])}}if(a.length>1){let s=r[o%r.length],i=e.polyline(a,{color:s,weight:3,opacity:.75,dashArray:"6, 8",lineCap:"round",lineJoin:"round"}),l=o+2,d=`🗓️ <b>${t.name}</b> ${"zh"===v?`已排程第 ${l} 序位行动`:`Scheduled Leg #${l}`}: Order #${n.orderId}<br/><span style="color:#fde68a;">➔ ${n.targetDestination.label}</span><br/><span style="color:#94a3b8; font-size:10px;">${n.priorityReasoning||""}</span>`;i.bindTooltip(d,{sticky:!0,opacity:.95}),i.addTo(C.current)}})}})})},[i.robots,i.selectedRobotId,v]),(0,r.useEffect)(()=>{w.current&&k.current&&e.A(71400).then(e=>{if(k.current.clearLayers(),i.hubs.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.level||1,n=3===r?"#a855f7":2===r?"#38bdf8":"#06b6d4",o=r>1?`<span style="color:#fde047; font-size:8px; margin-left:2px;">Lv.${r}</span>`:"",a=3===r?900:2===r?650:450;e.circle([t.position.lat,t.position.lng],{radius:a,color:n,weight:1.5,opacity:.6,dashArray:3===r?"4, 4":void 0,fillColor:n,fillOpacity:3===r?.09:2===r?.06:.04}).addTo(k.current);let s=`
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
              border: 2px solid ${n};
              box-shadow: 0 0 16px ${n}99;
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
              border: 1px solid ${n};
              padding: 1px 6px;
              border-radius: 4px;
              color: #7dd3fc;
              font-family: sans-serif;
              font-weight: bold;
              font-size: 9px;
              white-space: nowrap;
            ">${t.name.split(" ")[0]}${o}</div>
          </div>
        `,l=e.divIcon({html:s,className:"custom-hub-marker",iconSize:[36,48],iconAnchor:[18,20]}),d=e.marker([t.position.lat,t.position.lng],{icon:l}),c=1===r?2:3,p=2===c?80:160,b=r<3,u=i.hubs.length>1,x=document.createElement("div");x.style.cssText="min-width: 190px; font-family: monospace; padding: 4px; color: #f8fafc;",x.innerHTML=`
          <div style="font-weight: bold; font-size: 12px; color: ${n}; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${t.name}</span>
            <span style="font-size: 9px; background: #083344; padding: 1px 5px; border-radius: 4px; border: 1px solid ${n};">LEVEL ${r}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-bottom: 8px; line-height: 1.5;">
            ⚡ ${"zh"===v?"回充速率":"Charge Speed"}: <b style="color: #34d399;">+${t.chargingRatePerTick||(3===r?14:2===r?9:6)}% / tick</b><br/>
            🔌 ${"zh"===v?"充电机位":"Charging Bays"}: <b style="color: #38bdf8;">${t.chargingBays||2} ${"zh"===v?"台同时":"Bays"}</b><br/>
            📍 ${"zh"===v?"辐射半径":"Radius"}: <b>${a}m</b>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            ${b?`<button id="btn-upg-${t.id}" style="flex: 1; background: #0284c7; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;">⚡ ${"zh"===v?`升级 Lv.${c} ($${p})`:`Upgrade Lv.${c} ($${p})`}</button>`:'<div style="flex: 1; text-align: center; color: #fde047; font-size: 10px; font-weight: bold; background: rgba(234, 179, 8, 0.15); padding: 4px; border-radius: 4px;">⚡ MAX LEVEL</div>'}
            ${u?`<button id="btn-sell-${t.id}" style="background: #881337; color: #fecdd3; border: 1px solid #f43f5e; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" title="${"zh"===v?"撤除站点回收资金 (+$100)":"Decommission Hub (+$100)"}">🗑️ +$100</button>`:""}
          </div>
        `,d.bindPopup(x,{maxWidth:260}),d.on("popupopen",()=>{let e=document.getElementById(`btn-upg-${t.id}`);e&&m&&(e.onclick=()=>{m(t.id,c),d.closePopup()});let r=document.getElementById(`btn-sell-${t.id}`);r&&y&&(r.onclick=()=>{y(t.id),d.closePopup()})}),d.addTo(k.current)}),(i.levelProgression?.currentLevel||1)>=2&&h&&S.roadNodes.filter(e=>!i.hubs.some(t=>.003>Math.abs((t.position.lat||0)-e.lat)&&.003>Math.abs((t.position.lng||0)-e.lng))).slice(0,4).forEach(t=>{let r=`
            <div style="
              background: rgba(88, 28, 135, 0.85);
              border: 1px dashed #c084fc;
              color: #f3e8ff;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 8px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(168,85,247,0.4);
              white-space: nowrap;
            ">➕ ${"zh"===v?"建站点":"BUILD HUB"}</div>
          `,n=e.divIcon({html:r,className:"node-build-marker",iconSize:[56,18],iconAnchor:[28,9]}),o=e.marker([t.lat,t.lng],{icon:n}),a=document.createElement("div");a.style.cssText="min-width: 180px; font-family: monospace; padding: 4px; color: #f8fafc;",a.innerHTML=`
            <div style="font-weight: bold; color: #c084fc; font-size: 12px; margin-bottom: 4px;">
              🏢 ${"zh"===v?"新建物流充电枢纽":"Construct Logistics Hub"}
            </div>
            <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 8px; line-height: 1.4;">
              📍 <b>${"zh"===v?t.nameZh:t.name}</b><br/>
              💰 ${"zh"===v?"建造成本: $200":"Build Cost: $200"}<br/>
              💵 ${"zh"===v?"当前财库: $"+i.financials.balance.toFixed(2):"Cash Available: $"+i.financials.balance.toFixed(2)}
            </div>
            <button id="btn-build-${t.id}" style="width: 100%; background: #9333ea; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" ${i.financials.balance<200?"disabled":""}>
              ${i.financials.balance<200?"zh"===v?"资金不足 ($200)":"Insufficient Funds ($200)":"zh"===v?"确认在此投资建站 ($200)":"Confirm Build Hub ($200)"}
            </button>
          `,o.bindPopup(a,{maxWidth:240}),o.on("popupopen",()=>{let e=document.getElementById(`btn-build-${t.id}`);e&&h&&i.financials.balance>=200&&(e.onclick=()=>{h("zh"===v?`${t.nameZh}中心站`:`${t.name} Depot`,t.lat,t.lng),o.closePopup()})}),o.addTo(k.current)}),i.orders.forEach(t=>{if(("in_transit"===t.status||"pending"===t.status)&&t.recipientAddress.lat&&t.recipientAddress.lng){let r=t.deadlineTick-i.tick<=15,n=t.id===i.selectedOrderId,o=Math.max(0,t.deadlineTick-i.tick),a=r?"#ef4444":"#10b981",s=`
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="
                background: ${a};
                color: #ffffff;
                border: ${n?"2px solid #ffffff":"1px solid rgba(255,255,255,0.7)"};
                border-radius: 6px;
                padding: 1px 5px;
                font-family: monospace;
                font-weight: bold;
                font-size: 9px;
                box-shadow: 0 0 12px ${a}88;
                white-space: nowrap;
              ">📦 #${t.id} &bull; ${o}t</div>
              <div style="
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${a};
              "></div>
            </div>
          `,l=e.divIcon({html:s,className:"custom-drop-marker",iconSize:[50,30],iconAnchor:[25,26]}),d=e.marker([t.recipientAddress.lat,t.recipientAddress.lng],{icon:l});d.on("click",()=>c(t.id)),d.bindTooltip(`<b>Order #${t.id}</b> (${t.sender})<br/>SLA: ${o} ticks remaining`,{direction:"top"}),d.addTo(k.current)}}),i.roadClosureNodeId){let t=S.roadNodes.find(e=>e.id===i.roadClosureNodeId);if(t){let r=`
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
          `,n=e.divIcon({html:r,className:"custom-roadblock-marker",iconSize:[130,42],iconAnchor:[65,21]}),o=e.marker([t.lat,t.lng],{icon:n,zIndexOffset:1500});o.bindTooltip(`<b>🚧 ${"zh"===v?"突发紧急施工封闭":"EMERGENCY ROAD CLOSURE"}</b><br/>${"zh"===v?"全向双向交通阻断，途经机器人必须执行绕行":"All lanes blocked. Fleet must detour."}`,{direction:"top",opacity:.95}),o.addTo(k.current)}}})},[i.hubs,i.orders,i.selectedOrderId,i.tick,i.roadClosureNodeId,i.financials.balance,i.levelProgression?.currentLevel,h,m,y,v]),(0,r.useEffect)(()=>{w.current&&j.current&&e.A(71400).then(e=>{let t=new Set(i.robots.map(e=>e.id));R.current.forEach((e,r)=>{t.has(r)||(j.current&&j.current.removeLayer(e),R.current.delete(r))}),i.robots.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.id===i.selectedRobotId,n=t.batteryPct>50?"#10b981":t.batteryPct>25?"#f59e0b":"#ef4444",o="delivering"===t.status,a="returning"===t.status,s="charging"===t.status,d=o||a||"moving"===t.status,c='<div style="background:#334155; color:#94a3b8; border-radius:4px; padding:1px 4px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace;">STANDBY</div>',p=t.carriedOrderIds&&t.carriedOrderIds.length>0?t.carriedOrderIds.length:+!!t.currentOrderId;if(o){let e=p>1?`📦📦 ${p} PKGS`:`📦 #${t.currentOrderId||"PKG"}`;c=`<div style="background:#0284c7; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(2,132,199,0.8);">${e}</div>`}else a?c=`<div style="background:#7c3aed; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(124,58,237,0.8);">⚡ ${"zh"===v?"返航":"RETURN"}</div>`:s&&(c=`<div style="background:#059669; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(5,150,105,0.8);">🔋 ${t.batteryPct.toFixed(0)}%</div>`);let b=r?"#38bdf8":a?"#a855f7":o?"#06b6d4":t.color||"#64748b",u=`
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
              border: 2px solid ${b};
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
              <div style="width: ${t.batteryPct}%; height: 100%; background: ${n};"></div>
            </div>

            <!-- Pod Vehicle Chassis -->
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 10px;
              background: ${s?"#064e3b":a?"#2e1065":o?"#0c4a6e":"#0f172a"};
              border: 2px solid ${b};
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
              <span style="font-size:12px;">${"speedy"===t.archetype?"🏎️":"heavy"===t.archetype?"🚚":s?"🔌":a?"⚡":"🤖"}</span>
              <span style="font-size:7px; opacity:0.9;">${t.name.replace(/[^0-9]/g,"").slice(-2)||"01"}</span>
            </div>
          </div>
        `,x=e.divIcon({html:u,className:"custom-bot-marker",iconSize:[44,52],iconAnchor:[22,28]}),f=`
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <strong style="color: ${b}; font-size: 12px;">${t.name}</strong><br/>
            <span>${"zh"===v?"状态":"Status"}: <b>${t.status.toUpperCase()}</b></span><br/>
            <span>${"zh"===v?"电量":"Battery"}: <b>${t.batteryPct.toFixed(0)}%</b></span><br/>
            <span>${"zh"===v?"载重":"Payload"}: <b>${t.currentPayloadKg} / ${t.maxCapacityKg} kg</b></span><br/>
            <span>${"zh"===v?"累计送达":"Completed"}: <b>${t.totalDeliveriesCompleted}</b></span><br/>
            ${t.targetDestination?`<span style="color:#38bdf8;">➔ ${t.targetDestination.label}</span>`:""}
          </div>
        `,g=R.current.get(t.id);if(g)j.current.hasLayer(g)||j.current.addLayer(g),g.setLatLng([t.position.lat,t.position.lng]),g.setIcon(x),g.setTooltipContent(f);else{let r=e.marker([t.position.lat,t.position.lng],{icon:x,zIndexOffset:1e3});r.on("click",()=>{l(t.id),w.current&&t.position.lat&&t.position.lng&&w.current.flyTo([t.position.lat,t.position.lng],16,{duration:.8})}),r.bindTooltip(f,{direction:"top",opacity:.95}),r.addTo(j.current),R.current.set(t.id,r)}})})},[i.robots,i.selectedRobotId,v]),(0,t.jsxs)("div",{className:"relative w-full h-full min-h-0 bg-slate-950 overflow-hidden select-none",children:[(0,t.jsx)("div",{ref:z,className:"absolute inset-0 w-full h-full z-0"}),"rain"===i.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] rain-overlay"}),"typhoon"===i.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] typhoon-overlay"}),(0,t.jsxs)("div",{className:"absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-900/60 shadow-xl",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1 px-2 text-[11px] font-mono font-bold text-slate-400",children:[(0,t.jsx)(s.f,{className:"w-3.5 h-3.5 text-cyan-400"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"仿真城市:":"CITY:"})]}),Object.values(n.f).map(e=>(0,t.jsxs)("button",{onClick:()=>{var t;let r;return t=e.id,j.current&&j.current.clearLayers(),R.current.clear(),O(t),b(t),void((r=n.f[t])&&w.current&&w.current.flyTo(r.center,r.zoom,{duration:1.5}))},className:`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${L===e.id?"bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold":"text-slate-300 hover:bg-slate-800"}`,children:[(0,t.jsx)("span",{children:e.flag}),(0,t.jsx)("span",{children:"zh"===v?e.nameZh:e.name})]},e.id))]}),(0,t.jsxs)("div",{className:"absolute top-14 left-3 z-10 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono shadow-xl",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"zh"===v?"车队跟踪:":"FLEET TRACKER:"}),(0,t.jsx)("div",{className:"flex items-center gap-1.5",children:i.robots.map(e=>{let r="delivering"===e.status,n="returning"===e.status,o="charging"===e.status,a=e.id===i.selectedRobotId;return(0,t.jsxs)("button",{onClick:()=>{l(e.id),e.position.lat&&e.position.lng&&w.current&&w.current.flyTo([e.position.lat,e.position.lng],16,{duration:.8})},title:e.targetDestination?`${e.name}: ${e.targetDestination.label}`:e.name,className:`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all ${a?"border-cyan-400 bg-cyan-950 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]":r?"border-cyan-700/60 bg-cyan-950/40 text-cyan-200":n?"border-purple-700/60 bg-purple-950/40 text-purple-200":o?"border-emerald-700/60 bg-emerald-950/40 text-emerald-300":"border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"}`,children:[(0,t.jsx)("span",{children:r?"📦":n?"⚡":o?"🔋":"⚪"}),(0,t.jsx)("span",{children:e.name.replace(/[^0-9]/g,"").slice(-2)?`R${e.name.replace(/[^0-9]/g,"").slice(-2)}`:e.name.split("-")[0]}),(0,t.jsxs)("span",{className:"text-slate-500 font-sans",children:[e.batteryPct.toFixed(0),"%"]})]},e.id)})})]}),(0,t.jsxs)("div",{className:"absolute top-3 right-3 z-10 flex flex-wrap items-center justify-end gap-1.5 max-w-[90vw]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl",children:[(0,t.jsxs)("button",{onClick:()=>x?.("clear"),title:"zh"===v?"晴天万里 (标准能耗 1.0x)":"Clear Skies (Standard 1.0x battery)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"clear"===i.weather?"bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"☀️"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"晴天":"Clear"})]}),(0,t.jsxs)("button",{onClick:()=>x?.("rain"),title:"zh"===v?"热带暴雨 (路面湿滑，能耗消耗+35%)":"Rainstorm (Wet roads, +35% battery drain)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"rain"===i.weather?"bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🌧️"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"暴雨":"Rain"})]}),(0,t.jsxs)("button",{onClick:()=>x?.("typhoon"),title:"zh"===v?"强雷暴台风 (极寒强风，能耗+75%，配送享有+25%风险津贴)":"Typhoon (Extreme weather, +75% battery drain, +25% hazard pay)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"typhoon"===i.weather?"bg-indigo-500/30 text-indigo-200 border border-indigo-400/70 font-bold shadow-[0_0_14px_rgba(99,102,241,0.5)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"⚡"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"台风":"Storm"})]})]}),(0,t.jsxs)("button",{onClick:f,title:"zh"===v?"点击切换晚高峰主干道大拥堵状态 (延误最高达 4.2x)":"Toggle Evening Rush Hour Congestion (delays up to 4.2x)",className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${i.rushHourActive?"bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.55)] animate-pulse":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🚦"}),(0,t.jsx)("span",{children:"zh"===v?"晚高峰":"RUSH HOUR"}),i.rushHourActive&&(0,t.jsx)("span",{className:"text-[10px] text-rose-400 font-sans font-black",children:"4.2x"})]}),(0,t.jsxs)("button",{onClick:()=>g?.(),title:"zh"===v?"点击触发突发道路施工封闭，测试系统提示词避障绕行能力":"Trigger Emergency Roadblock to test prompt detour capabilities",className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${i.roadClosureNodeId?"bg-amber-950/90 border-amber-500/80 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.55)]":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🚧"}),(0,t.jsx)("span",{children:"zh"===v?"突发封路":"ROADBLOCK"})]}),(0,t.jsxs)("button",{onClick:()=>D(!E),className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${E?"bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)(a.f,{className:"w-3.5 h-3.5"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"路况":"TRAFFIC"})]}),(0,t.jsxs)("div",{className:"flex items-center bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-800 text-xs font-mono",children:[(0,t.jsx)("button",{onClick:()=>A("dark"),className:`px-2 py-1 rounded-lg transition-colors ${"dark"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"深色":"DARK"}),(0,t.jsx)("button",{onClick:()=>A("satellite"),className:`px-2 py-1 rounded-lg transition-colors ${"satellite"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"卫星":"SATELLITE"}),(0,t.jsx)("button",{onClick:()=>A("streets"),className:`px-2 py-1 rounded-lg transition-colors ${"streets"===I?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"街道":"STREETS"})]})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 right-4 z-10 flex flex-col gap-1.5",children:[(0,t.jsx)("button",{onClick:()=>w.current?.zoomIn(),title:"Zoom In",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(p,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>w.current?.zoomOut(),title:"Zoom Out",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(u,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>w.current?.flyTo(S.center,S.zoom),title:"Recenter City",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg",children:(0,t.jsx)(d,{className:"w-4 h-4"})})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 text-[10px] font-mono text-slate-300 shadow-xl",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400"}),(0,t.jsxs)("span",{children:[">40 km/h (","zh"===v?"畅通":"Fast",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-amber-400"}),(0,t.jsxs)("span",{children:["20-40 km/h (","zh"===v?"缓行":"Slow",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"}),(0,t.jsxs)("span",{children:["<15 km/h (","zh"===v?"重度拥堵":"Jam",")"]})]})]})]})}],64614)},59666,function(e){e.n(e.i(64614))}]);