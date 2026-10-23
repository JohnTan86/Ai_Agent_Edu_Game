(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,71400,e=>{e.v(t=>Promise.all(["static/chunks/1isww-nkwqy_c.js"].map(t=>e.l(t))).then(()=>t(32322)))},64614,e=>{"use strict";var t=e.i(43476),r=e.i(71645),n=e.i(11407),o=e.i(83283),a=e.i(59502),i=e.i(91511),s=e.i(56420);let l={name:"compass",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}]]};l.node;let d=(0,s.f)(l),c={name:"zoom-in",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};c.node;let p=(0,s.f)(c),b={name:"zoom-out",size:24,node:[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]};b.node;let u=(0,s.f)(b);e.s(["RealLifeCityMap",0,({state:s,onSelectRobot:l,onSelectOrder:c,onSwitchCity:b,onSetWeather:x,onToggleRushHour:f,onToggleRoadClosure:g,onBuildHub:h,onUpgradeHub:m,onSellHub:y,lang:v="en"})=>{let $=(0,r.useRef)(null),z=(0,r.useRef)(null),w=(0,r.useRef)(null),k=(0,r.useRef)(null),j=(0,r.useRef)(null),N=(0,r.useRef)(null),C=(0,r.useRef)(null),T=(0,r.useRef)(new Map),[R,I]=(0,r.useState)("dark"),[A,E]=(0,r.useState)(!0),[D,L]=(0,r.useState)(s.currentCityId||"singapore"),O=n.f[D]||n.f.singapore;(0,r.useEffect)(()=>{if(!$.current)return;let t=!0;return e.A(71400).then(e=>{if(!t||!$.current)return;z.current&&(z.current.remove(),z.current=null),delete e.Icon.Default.prototype._getIconUrl,e.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});let r=e.map($.current,{center:O.center,zoom:O.zoom,zoomControl:!1,attributionControl:!1}),n=e.layerGroup().addTo(r),o=e.layerGroup().addTo(r),a=e.layerGroup().addTo(r),i=e.layerGroup().addTo(r);z.current=r,j.current=n,N.current=o,w.current=a,k.current=i,S(R,r,e);let s=()=>{z.current&&z.current.invalidateSize({pan:!1})};s(),setTimeout(s,100),setTimeout(s,300),setTimeout(s,800),window.addEventListener("resize",s);"u">typeof ResizeObserver&&$.current&&new ResizeObserver(()=>{s()}).observe($.current)}),()=>{t=!1,T.current.clear(),z.current&&(z.current.remove(),z.current=null)}},[D]);let S=(t,r,n)=>{let o=r||z.current;o&&(C.current&&o.removeLayer(C.current),e.A(71400).then(e=>{let r="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",a="abc";"satellite"===t?(r="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",a=["0","1","2","3"]):"streets"===t&&(r=A?"https://mt{s}.google.com/vt/lyrs=m,traffic%7Cseconds_into_week:-1&x={x}&y={y}&z={z}":"https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",a=["0","1","2","3"]),C.current=(n||e).tileLayer(r,{maxZoom:19,subdomains:a,keepBuffer:8}).addTo(o),o.invalidateSize()}))};return(0,r.useEffect)(()=>{S(R)},[R,A]),(0,r.useEffect)(()=>{z.current&&j.current&&e.A(71400).then(e=>{j.current.clearLayers(),A&&O.trafficCorridors.forEach(t=>{let r=s.rushHourActive,n="#10b981",o=r?7:5,a=.7;r||"severe"===t.status?(n="#ef4444",o=r?8:7,a=.95):"moderate"===t.status?(n="#f59e0b",a=.8):"congested"===t.status&&(n="#f97316",o=6,a=.85);let i=r?Math.max(4,1.6*t.multiplier):t.multiplier,l=e.polyline(t.coordinates,{color:n,weight:o,opacity:a,lineCap:"round",lineJoin:"round",className:r||"severe"===t.status?"traffic-pulse-line":""}),d=`
          <div style="font-family: monospace; font-size: 11px; padding: 4px 6px;">
            <strong style="color: ${n};">${"zh"===v?t.nameZh:t.name}</strong><br/>
            <span>${"zh"===v?"当前车速":"Speed"}: ${r?Math.round(.45*t.speedKmh):t.speedKmh} km/h (${i.toFixed(1)}x ${"zh"===v?"严重延迟":"delay"})${r?"zh"===v?" 🚨 晚高峰峰值":" 🚨 RUSH HOUR":""}</span>
          </div>
        `;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(j.current)})})},[A,O,s.rushHourActive,v]),(0,r.useEffect)(()=>{z.current&&N.current&&e.A(71400).then(e=>{N.current.clearLayers(),s.robots.forEach(t=>{if("moving"===t.status||"delivering"===t.status||"returning"===t.status){let r=[];if(t.position.lat&&t.position.lng&&r.push([t.position.lat,t.position.lng]),t.pathQueue.forEach(e=>{e.lat&&e.lng&&r.push([e.lat,e.lng])}),t.targetDestination?.lat&&t.targetDestination?.lng&&r.length>1){let e=r[r.length-1];.0025>Math.hypot(e[0]-t.targetDestination.lat,e[1]-t.targetDestination.lng)&&r.push([t.targetDestination.lat,t.targetDestination.lng])}if(r.length>1){let n=t.id===s.selectedRobotId,o="returning"===t.status,a="delivering"===t.status,i=o?"#c084fc":a?"#22d3ee":"#38bdf8";e.polyline(r,{color:i,weight:n?8:5,opacity:.35,lineCap:"round",lineJoin:"round"}).addTo(N.current);let l=e.polyline(r,{color:i,weight:n?4:3,opacity:.95,lineCap:"round",lineJoin:"round",className:o?"animated-return-route":"animated-delivery-route"}),d=o?`⚡ <b>${t.name}</b> ${"zh"===v?"自主返航充电":"Returning to Base Recharge"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Hub"}</span>`:`📦 <b>${t.name}</b> ${"zh"===v?"派送中":"Delivering"}: Order #${t.currentOrderId||"Active"}<br/><span style="color:#cbd5e1;">➔ ${t.targetDestination?.label||"Recipient"}</span>`;l.bindTooltip(d,{sticky:!0,opacity:.95}),l.addTo(N.current)}}if(t.carriedOrderIds&&t.carriedOrderIds.length>1&&t.targetDestination){let r=t.carriedOrderIds.find(e=>e!==t.currentOrderId)||t.carriedOrderIds[1],n=s.orders.find(e=>e.id===r);if(n&&n.recipientAddress.lat&&n.recipientAddress.lng&&t.targetDestination.lat&&t.targetDestination.lng){let a=(0,o.G)({x:0,y:0,lat:t.targetDestination.lat,lng:t.targetDestination.lng},{x:0,y:0,lat:n.recipientAddress.lat,lng:n.recipientAddress.lng},O,{}).filter(e=>void 0!==e.lat&&void 0!==e.lng).map(e=>[e.lat,e.lng]);if(a.length>1){let t=e.polyline(a,{color:"#a855f7",weight:3.5,opacity:.85,dashArray:"5, 6",lineCap:"round",lineJoin:"round"});t.bindTooltip(`📦📦 <b>${"zh"===v?"一车多单·第2站":"Multi-Drop Stop 2"}</b>: #${r}<br/><span style="color:#cbd5e1;">➔ ${n.recipientAddress.zone}</span>`,{sticky:!0,opacity:.95}),t.addTo(N.current)}}}if(t.missionQueue&&t.missionQueue.length>0){let r=["#f59e0b","#10b981","#ec4899","#8b5cf6"];t.missionQueue.forEach((n,o)=>{let a=[];if(n.routeWaypoints.forEach(e=>{e.lat&&e.lng&&a.push([e.lat,e.lng])}),n.targetDestination?.lat&&n.targetDestination?.lng){let e=a[a.length-1];if(e){let t=Math.hypot(e[0]-n.targetDestination.lat,e[1]-n.targetDestination.lng);t>1e-4&&t<.0025&&a.push([n.targetDestination.lat,n.targetDestination.lng])}}if(a.length>1){let i=r[o%r.length],s=e.polyline(a,{color:i,weight:3,opacity:.75,dashArray:"6, 8",lineCap:"round",lineJoin:"round"}),l=o+2,d=`🗓️ <b>${t.name}</b> ${"zh"===v?`已排程第 ${l} 序位行动`:`Scheduled Leg #${l}`}: Order #${n.orderId}<br/><span style="color:#fde68a;">➔ ${n.targetDestination.label}</span><br/><span style="color:#94a3b8; font-size:10px;">${n.priorityReasoning||""}</span>`;s.bindTooltip(d,{sticky:!0,opacity:.95}),s.addTo(N.current)}})}})})},[s.robots,s.selectedRobotId,v]),(0,r.useEffect)(()=>{z.current&&w.current&&e.A(71400).then(e=>{if(w.current.clearLayers(),s.hubs.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.level||1,n=3===r?"#a855f7":2===r?"#38bdf8":"#06b6d4",o=r>1?`<span style="color:#fde047; font-size:8px; margin-left:2px;">Lv.${r}</span>`:"",a=3===r?900:2===r?650:450;e.circle([t.position.lat,t.position.lng],{radius:a,color:n,weight:1.5,opacity:.6,dashArray:3===r?"4, 4":void 0,fillColor:n,fillOpacity:3===r?.09:2===r?.06:.04}).addTo(w.current);let i=`
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
        `,l=e.divIcon({html:i,className:"custom-hub-marker",iconSize:[36,48],iconAnchor:[18,20]}),d=e.marker([t.position.lat,t.position.lng],{icon:l}),c=1===r?2:3,p=2===c?80:160,b=r<3,u=s.hubs.length>1,x=document.createElement("div");x.style.cssText="min-width: 190px; font-family: monospace; padding: 4px; color: #f8fafc;",x.innerHTML=`
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
        `,d.bindPopup(x,{maxWidth:260}),d.on("popupopen",()=>{let e=document.getElementById(`btn-upg-${t.id}`);e&&m&&(e.onclick=()=>{m(t.id,c),d.closePopup()});let r=document.getElementById(`btn-sell-${t.id}`);r&&y&&(r.onclick=()=>{y(t.id),d.closePopup()})}),d.addTo(w.current)}),(s.levelProgression?.currentLevel||1)>=2&&h&&O.roadNodes.filter(e=>!s.hubs.some(t=>.003>Math.abs((t.position.lat||0)-e.lat)&&.003>Math.abs((t.position.lng||0)-e.lng))).slice(0,4).forEach(t=>{let r=`
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
              💵 ${"zh"===v?"当前财库: $"+s.financials.balance.toFixed(2):"Cash Available: $"+s.financials.balance.toFixed(2)}
            </div>
            <button id="btn-build-${t.id}" style="width: 100%; background: #9333ea; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" ${s.financials.balance<200?"disabled":""}>
              ${s.financials.balance<200?"zh"===v?"资金不足 ($200)":"Insufficient Funds ($200)":"zh"===v?"确认在此投资建站 ($200)":"Confirm Build Hub ($200)"}
            </button>
          `,o.bindPopup(a,{maxWidth:240}),o.on("popupopen",()=>{let e=document.getElementById(`btn-build-${t.id}`);e&&h&&s.financials.balance>=200&&(e.onclick=()=>{h("zh"===v?`${t.nameZh}中心站`:`${t.name} Depot`,t.lat,t.lng),o.closePopup()})}),o.addTo(w.current)}),s.orders.forEach(t=>{if(("in_transit"===t.status||"pending"===t.status)&&t.recipientAddress.lat&&t.recipientAddress.lng){let r=t.deadlineTick-s.tick<=15,n=t.id===s.selectedOrderId,o=Math.max(0,t.deadlineTick-s.tick),a=r?"#ef4444":"#10b981",i=`
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
          `,l=e.divIcon({html:i,className:"custom-drop-marker",iconSize:[50,30],iconAnchor:[25,26]}),d=e.marker([t.recipientAddress.lat,t.recipientAddress.lng],{icon:l});d.on("click",()=>c(t.id)),d.bindTooltip(`<b>Order #${t.id}</b> (${t.sender})<br/>SLA: ${o} ticks remaining`,{direction:"top"}),d.addTo(w.current)}}),s.roadClosureNodeId){let t=O.roadNodes.find(e=>e.id===s.roadClosureNodeId);if(t){let r=`
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
          `,n=e.divIcon({html:r,className:"custom-roadblock-marker",iconSize:[130,42],iconAnchor:[65,21]}),o=e.marker([t.lat,t.lng],{icon:n,zIndexOffset:1500});o.bindTooltip(`<b>🚧 ${"zh"===v?"突发紧急施工封闭":"EMERGENCY ROAD CLOSURE"}</b><br/>${"zh"===v?"全向双向交通阻断，途经机器人必须执行绕行":"All lanes blocked. Fleet must detour."}`,{direction:"top",opacity:.95}),o.addTo(w.current)}}})},[s.hubs,s.orders,s.selectedOrderId,s.tick,s.roadClosureNodeId,s.financials.balance,s.levelProgression?.currentLevel,h,m,y,v]),(0,r.useEffect)(()=>{z.current&&k.current&&e.A(71400).then(e=>{let t=new Set(s.robots.map(e=>e.id));T.current.forEach((e,r)=>{t.has(r)||(k.current&&k.current.removeLayer(e),T.current.delete(r))}),s.robots.forEach(t=>{if(!t.position.lat||!t.position.lng)return;let r=t.id===s.selectedRobotId,n=t.batteryPct>50?"#10b981":t.batteryPct>25?"#f59e0b":"#ef4444",o="delivering"===t.status,a="returning"===t.status,i="charging"===t.status,d=o||a||"moving"===t.status,c='<div style="background:#334155; color:#94a3b8; border-radius:4px; padding:1px 4px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace;">STANDBY</div>',p=t.carriedOrderIds&&t.carriedOrderIds.length>0?t.carriedOrderIds.length:+!!t.currentOrderId;if(o){let e=p>1?`📦📦 ${p} PKGS`:`📦 #${t.currentOrderId||"PKG"}`;c=`<div style="background:#0284c7; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(2,132,199,0.8);">${e}</div>`}else a?c=`<div style="background:#7c3aed; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(124,58,237,0.8);">⚡ ${"zh"===v?"返航":"RETURN"}</div>`:i&&(c=`<div style="background:#059669; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(5,150,105,0.8);">🔋 ${t.batteryPct.toFixed(0)}%</div>`);let b=r?"#38bdf8":a?"#a855f7":o?"#06b6d4":t.color||"#64748b",u=`
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
              background: ${i?"#064e3b":a?"#2e1065":o?"#0c4a6e":"#0f172a"};
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
              <span style="font-size:12px;">${"speedy"===t.archetype?"🏎️":"heavy"===t.archetype?"🚚":i?"🔌":a?"⚡":"🤖"}</span>
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
        `,g=T.current.get(t.id);if(g)k.current.hasLayer(g)||k.current.addLayer(g),g.setLatLng([t.position.lat,t.position.lng]),g.setIcon(x),g.setTooltipContent(f);else{let r=e.marker([t.position.lat,t.position.lng],{icon:x,zIndexOffset:1e3});r.on("click",()=>{l(t.id),z.current&&t.position.lat&&t.position.lng&&z.current.flyTo([t.position.lat,t.position.lng],16,{duration:.8})}),r.bindTooltip(f,{direction:"top",opacity:.95}),r.addTo(k.current),T.current.set(t.id,r)}})})},[s.robots,s.selectedRobotId,v]),(0,t.jsxs)("div",{className:"relative w-full h-full min-h-0 bg-slate-950 overflow-hidden select-none",children:[(0,t.jsx)("div",{ref:$,className:"absolute inset-0 w-full h-full z-0"}),"rain"===s.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] rain-overlay"}),"typhoon"===s.weather&&(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none z-[1] typhoon-overlay"}),(0,t.jsxs)("div",{className:"absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-900/60 shadow-xl",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1 px-2 text-[11px] font-mono font-bold text-slate-400",children:[(0,t.jsx)(i.f,{className:"w-3.5 h-3.5 text-cyan-400"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"仿真城市:":"CITY:"})]}),Object.values(n.f).map(e=>(0,t.jsxs)("button",{onClick:()=>{var t;let r;return t=e.id,k.current&&k.current.clearLayers(),T.current.clear(),L(t),b(t),void((r=n.f[t])&&z.current&&z.current.flyTo(r.center,r.zoom,{duration:1.5}))},className:`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${D===e.id?"bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold":"text-slate-300 hover:bg-slate-800"}`,children:[(0,t.jsx)("span",{children:e.flag}),(0,t.jsx)("span",{children:"zh"===v?e.nameZh:e.name})]},e.id))]}),(0,t.jsxs)("div",{className:"absolute top-14 left-3 z-10 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono shadow-xl",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"zh"===v?"车队跟踪:":"FLEET TRACKER:"}),(0,t.jsx)("div",{className:"flex items-center gap-1.5",children:s.robots.map(e=>{let r="delivering"===e.status,n="returning"===e.status,o="charging"===e.status,a=e.id===s.selectedRobotId;return(0,t.jsxs)("button",{onClick:()=>{l(e.id),e.position.lat&&e.position.lng&&z.current&&z.current.flyTo([e.position.lat,e.position.lng],16,{duration:.8})},title:e.targetDestination?`${e.name}: ${e.targetDestination.label}`:e.name,className:`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all ${a?"border-cyan-400 bg-cyan-950 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]":r?"border-cyan-700/60 bg-cyan-950/40 text-cyan-200":n?"border-purple-700/60 bg-purple-950/40 text-purple-200":o?"border-emerald-700/60 bg-emerald-950/40 text-emerald-300":"border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"}`,children:[(0,t.jsx)("span",{children:r?"📦":n?"⚡":o?"🔋":"⚪"}),(0,t.jsx)("span",{children:e.name.replace(/[^0-9]/g,"").slice(-2)?`R${e.name.replace(/[^0-9]/g,"").slice(-2)}`:e.name.split("-")[0]}),(0,t.jsxs)("span",{className:"text-slate-500 font-sans",children:[e.batteryPct.toFixed(0),"%"]})]},e.id)})})]}),(0,t.jsxs)("div",{className:"absolute top-3 right-3 z-10 flex flex-wrap items-center justify-end gap-1.5 max-w-[90vw]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl",children:[(0,t.jsxs)("button",{onClick:()=>x?.("clear"),title:"zh"===v?"晴天万里 (标准能耗 1.0x)":"Clear Skies (Standard 1.0x battery)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"clear"===s.weather?"bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"☀️"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"晴天":"Clear"})]}),(0,t.jsxs)("button",{onClick:()=>x?.("rain"),title:"zh"===v?"热带暴雨 (路面湿滑，能耗消耗+35%)":"Rainstorm (Wet roads, +35% battery drain)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"rain"===s.weather?"bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🌧️"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"暴雨":"Rain"})]}),(0,t.jsxs)("button",{onClick:()=>x?.("typhoon"),title:"zh"===v?"强雷暴台风 (极寒强风，能耗+75%，配送享有+25%风险津贴)":"Typhoon (Extreme weather, +75% battery drain, +25% hazard pay)",className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${"typhoon"===s.weather?"bg-indigo-500/30 text-indigo-200 border border-indigo-400/70 font-bold shadow-[0_0_14px_rgba(99,102,241,0.5)]":"text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"⚡"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"台风":"Storm"})]})]}),(0,t.jsxs)("button",{onClick:f,title:"zh"===v?"点击切换晚高峰主干道大拥堵状态 (延误最高达 4.2x)":"Toggle Evening Rush Hour Congestion (delays up to 4.2x)",className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${s.rushHourActive?"bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.55)] animate-pulse":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🚦"}),(0,t.jsx)("span",{children:"zh"===v?"晚高峰":"RUSH HOUR"}),s.rushHourActive&&(0,t.jsx)("span",{className:"text-[10px] text-rose-400 font-sans font-black",children:"4.2x"})]}),(0,t.jsxs)("button",{onClick:()=>g?.(),title:"zh"===v?"点击触发突发道路施工封闭，测试系统提示词避障绕行能力":"Trigger Emergency Roadblock to test prompt detour capabilities",className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${s.roadClosureNodeId?"bg-amber-950/90 border-amber-500/80 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.55)]":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)("span",{children:"🚧"}),(0,t.jsx)("span",{children:"zh"===v?"突发封路":"ROADBLOCK"})]}),(0,t.jsxs)("button",{onClick:()=>E(!A),className:`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${A?"bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]":"bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"}`,children:[(0,t.jsx)(a.f,{className:"w-3.5 h-3.5"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"zh"===v?"路况":"TRAFFIC"})]}),(0,t.jsxs)("div",{className:"flex items-center bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-800 text-xs font-mono",children:[(0,t.jsx)("button",{onClick:()=>I("dark"),className:`px-2 py-1 rounded-lg transition-colors ${"dark"===R?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"深色":"DARK"}),(0,t.jsx)("button",{onClick:()=>I("satellite"),className:`px-2 py-1 rounded-lg transition-colors ${"satellite"===R?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"卫星":"SATELLITE"}),(0,t.jsx)("button",{onClick:()=>I("streets"),className:`px-2 py-1 rounded-lg transition-colors ${"streets"===R?"bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold":"text-slate-400 hover:text-slate-200"}`,children:"zh"===v?"街道":"STREETS"})]})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 right-4 z-10 flex flex-col gap-1.5",children:[(0,t.jsx)("button",{onClick:()=>z.current?.zoomIn(),title:"Zoom In",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(p,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>z.current?.zoomOut(),title:"Zoom Out",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg",children:(0,t.jsx)(u,{className:"w-4 h-4"})}),(0,t.jsx)("button",{onClick:()=>z.current?.flyTo(O.center,O.zoom),title:"Recenter City",className:"w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg",children:(0,t.jsx)(d,{className:"w-4 h-4"})})]}),(0,t.jsxs)("div",{className:"absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 text-[10px] font-mono text-slate-300 shadow-xl",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400"}),(0,t.jsxs)("span",{children:[">40 km/h (","zh"===v?"畅通":"Fast",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-amber-400"}),(0,t.jsxs)("span",{children:["20-40 km/h (","zh"===v?"缓行":"Slow",")"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"}),(0,t.jsxs)("span",{children:["<15 km/h (","zh"===v?"重度拥堵":"Jam",")"]})]})]})]})}],64614)},59666,function(e){e.n(e.i(64614))}]);