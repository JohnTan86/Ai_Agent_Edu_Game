'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  SimulationState,
  DeliveryRobot,
  Hub,
  Order,
  CityWeather
} from '../../lib/types';
import { CITIES_DATA, CityData, getCitySectorStatus } from '../../lib/cityData';
import { Language } from '../../lib/i18n';
import { findCityRoadPath } from '../../lib/pathfinding';
import {
  Layers,
  Flame,
  Globe,
  Navigation,
  Compass,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface RealLifeCityMapProps {
  state: SimulationState;
  onSelectRobot: (robotId?: string) => void;
  onSelectOrder: (orderId?: string) => void;
  onSwitchCity: (cityId: string) => void;
  onSetWeather?: (weather: CityWeather) => void;
  onToggleRushHour?: () => void;
  onToggleRoadClosure?: (nodeId?: string) => void;
  onBuildHub?: (name: string, lat: number, lng: number) => void;
  onUpgradeHub?: (hubId: string, targetLevel: 2 | 3) => void;
  onSellHub?: (hubId: string) => void;
  lang?: Language;
  theme?: 'dark' | 'light';
}

export const RealLifeCityMap: React.FC<RealLifeCityMapProps> = ({
  state,
  onSelectRobot,
  onSelectOrder,
  onSwitchCity,
  onSetWeather,
  onToggleRushHour,
  onToggleRoadClosure,
  onBuildHub,
  onUpgradeHub,
  onSellHub,
  lang = 'en',
  theme = 'dark'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const pinsGroupRef = useRef<any>(null);
  const robotsGroupRef = useRef<any>(null);
  const trafficGroupRef = useRef<any>(null);
  const routesGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const robotMarkersMapRef = useRef<Map<string, any>>(new Map());

  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'streets'>(theme === 'light' ? 'streets' : 'dark');
  const [showTraffic, setShowTraffic] = useState(true);
  const [activeCityId, setActiveCityId] = useState<string>(state.currentCityId || 'singapore');

  // Sync map basemap style when global light/dark theme is toggled
  useEffect(() => {
    setMapStyle(theme === 'light' ? 'streets' : 'dark');
  }, [theme]);

  const currentCity: CityData = CITIES_DATA[activeCityId] || CITIES_DATA.singapore;
  const sectorStatus = getCitySectorStatus(currentCity, state.hubs);
  const prevUnlockedSectorRef = useRef<number>(sectorStatus.unlockedSector);

  // Smoothly expand map viewport bounds whenever a new City Sector unlocks!
  useEffect(() => {
    if (sectorStatus.unlockedSector > prevUnlockedSectorRef.current && mapInstanceRef.current) {
      import('leaflet').then(L => {
        const coords = sectorStatus.unlockedNodes.map(n => [n.lat, n.lng] as [number, number]);
        if (coords.length > 1 && mapInstanceRef.current) {
          const bounds = L.latLngBounds(coords);
          mapInstanceRef.current.flyToBounds(bounds, { padding: [55, 55], maxZoom: 15, duration: 1.2 });
        }
      });
    }
    prevUnlockedSectorRef.current = sectorStatus.unlockedSector;
  }, [sectorStatus.unlockedSector, sectorStatus.unlockedNodes]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet
    let isMounted = true;
    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      const map = L.map(mapContainerRef.current, {
        center: currentCity.center,
        zoom: currentCity.zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Layer groups (traffic at base, routes in middle, pins, then robots on top)
      const trafficLayer = L.layerGroup().addTo(map);
      const routesLayer = L.layerGroup().addTo(map);
      const pinsLayer = L.layerGroup().addTo(map);
      const robotsLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      trafficGroupRef.current = trafficLayer;
      routesGroupRef.current = routesLayer;
      pinsGroupRef.current = pinsLayer;
      robotsGroupRef.current = robotsLayer;

      // Add Tile Layer
      updateTileLayer(mapStyle, map, L);

      // Force Leaflet to recalculate container dimensions and fill the entire screen edge-to-edge
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      };

      invalidate();
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 300);
      setTimeout(invalidate, 800);

      window.addEventListener('resize', invalidate);

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        observer = new ResizeObserver(() => {
          invalidate();
        });
        observer.observe(mapContainerRef.current);
      }
    });

    return () => {
      isMounted = false;
      robotMarkersMapRef.current.clear();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeCityId]);

  // Helper to switch tile providers
  const updateTileLayer = (style: 'dark' | 'satellite' | 'streets', map?: any, L?: any) => {
    const activeMap = map || mapInstanceRef.current;
    if (!activeMap) return;

    if (tileLayerRef.current) {
      activeMap.removeLayer(tileLayerRef.current);
    }

    import('leaflet').then(leaflet => {
      const lib = L || leaflet;
      // High-performance, zero-API-key basemap endpoints
      let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      let subdomains: string | string[] = 'abc';
      let maxZoom = 19;

      if (style === 'satellite') {
        // Google Hybrid Satellite (Photographic imagery + Streets & Landmark labels)
        tileUrl = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
        subdomains = ['0', '1', '2', '3'];
      } else if (style === 'streets') {
        // Google Maps Standard Roadmap (with live traffic layer when enabled)
        tileUrl = showTraffic
          ? 'https://mt{s}.google.com/vt/lyrs=m,traffic%7Cseconds_into_week:-1&x={x}&y={y}&z={z}'
          : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        subdomains = ['0', '1', '2', '3'];
      }

      tileLayerRef.current = lib.tileLayer(tileUrl, {
        maxZoom,
        subdomains,
        keepBuffer: 8
      }).addTo(activeMap);

      activeMap.invalidateSize();
    });
  };

  // Change Map Style effect
  useEffect(() => {
    updateTileLayer(mapStyle);
  }, [mapStyle, showTraffic]);

  // 2. Render Real Traffic Corridors
  useEffect(() => {
    if (!mapInstanceRef.current || !trafficGroupRef.current) return;

    import('leaflet').then(L => {
      trafficGroupRef.current.clearLayers();

      if (!showTraffic) return;

      currentCity.trafficCorridors.forEach(corridor => {
        const isRush = state.rushHourActive;
        let color = '#10b981'; // Green (Flowing)
        let weight = isRush ? 7 : 5;
        let opacity = 0.7;

        if (isRush || corridor.status === 'severe') {
          color = '#ef4444'; // Red
          weight = isRush ? 8 : 7;
          opacity = 0.95;
        } else if (corridor.status === 'moderate') {
          color = '#f59e0b'; // Amber
          opacity = 0.8;
        } else if (corridor.status === 'congested') {
          color = '#f97316'; // Orange
          weight = 6;
          opacity = 0.85;
        }

        const effectiveMultiplier = isRush ? Math.max(4.0, corridor.multiplier * 1.6) : corridor.multiplier;

        const polyline = L.polyline(corridor.coordinates, {
          color,
          weight,
          opacity,
          lineCap: 'round',
          lineJoin: 'round',
          className: isRush || corridor.status === 'severe' ? 'traffic-pulse-line' : ''
        });

        const tooltipContent = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px 6px;">
            <strong style="color: ${color};">${lang === 'zh' ? corridor.nameZh : corridor.name}</strong><br/>
            <span>${lang === 'zh' ? '当前车速' : 'Speed'}: ${isRush ? Math.round(corridor.speedKmh * 0.45) : corridor.speedKmh} km/h (${effectiveMultiplier.toFixed(1)}x ${lang === 'zh' ? '严重延迟' : 'delay'})${isRush ? (lang === 'zh' ? ' 🚨 晚高峰峰值' : ' 🚨 RUSH HOUR') : ''}</span>
          </div>
        `;
        polyline.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 });

        polyline.addTo(trafficGroupRef.current);
      });
    });
  }, [showTraffic, currentCity, state.rushHourActive, lang]);

  // 3. Render Route Paths for Active Moving Robots
  useEffect(() => {
    if (!mapInstanceRef.current || !routesGroupRef.current) return;

    import('leaflet').then(L => {
      routesGroupRef.current.clearLayers();

      state.robots.forEach(bot => {
        const isMoving = (bot.status === 'moving' || bot.status === 'delivering' || bot.status === 'returning');
        if (isMoving) {
          const latLngs: Array<[number, number]> = [];

          if (bot.position.lat && bot.position.lng) {
            latLngs.push([bot.position.lat, bot.position.lng]);
          }

          bot.pathQueue.forEach(wp => {
            if (wp.lat && wp.lng) {
              latLngs.push([wp.lat, wp.lng]);
            }
          });

          // Ensure route polyline connects smoothly to target destination along actual path
          if (bot.targetDestination?.lat && bot.targetDestination?.lng && latLngs.length > 1) {
            const last = latLngs[latLngs.length - 1];
            const distToDest = Math.hypot(last[0] - bot.targetDestination.lat, last[1] - bot.targetDestination.lng);
            if (distToDest < 0.0025) {
              latLngs.push([bot.targetDestination.lat, bot.targetDestination.lng]);
            }
          }

          if (latLngs.length > 1) {
            const isSelected = bot.id === state.selectedRobotId;
            const isReturning = bot.status === 'returning';
            const isDelivering = bot.status === 'delivering';

            const routeColor = isReturning ? '#c084fc' : (isDelivering ? '#22d3ee' : '#38bdf8');
            const routeClass = isReturning ? 'animated-return-route' : 'animated-delivery-route';

            // Glow underlay polyline
            const glowLine = L.polyline(latLngs, {
              color: routeColor,
              weight: isSelected ? 8 : 5,
              opacity: 0.35,
              lineCap: 'round',
              lineJoin: 'round'
            });
            glowLine.addTo(routesGroupRef.current);

            // Animated dashed core polyline
            const routeLine = L.polyline(latLngs, {
              color: routeColor,
              weight: isSelected ? 4 : 3,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
              className: routeClass
            });

            const routeDesc = isReturning
              ? `⚡ <b>${bot.name}</b> ${lang === 'zh' ? '自主返航充电' : 'Returning to Base Recharge'}<br/><span style="color:#cbd5e1;">➔ ${bot.targetDestination?.label || 'Hub'}</span>`
              : `📦 <b>${bot.name}</b> ${lang === 'zh' ? '派送中' : 'Delivering'}: Order #${bot.currentOrderId || 'Active'}<br/><span style="color:#cbd5e1;">➔ ${bot.targetDestination?.label || 'Recipient'}</span>`;

            routeLine.bindTooltip(routeDesc, { sticky: true, opacity: 0.95 });
            routeLine.addTo(routesGroupRef.current);
          }
        }

        // Render Multi-Drop Secondary Leg Connecting Polyline
        if (bot.carriedOrderIds && bot.carriedOrderIds.length > 1 && bot.targetDestination) {
          const secondOrderId = bot.carriedOrderIds.find(id => id !== bot.currentOrderId) || bot.carriedOrderIds[1];
          const secondOrder = state.orders.find(o => o.id === secondOrderId);
          if (secondOrder && secondOrder.recipientAddress.lat && secondOrder.recipientAddress.lng && bot.targetDestination.lat && bot.targetDestination.lng) {
            const multiLegCoords = findCityRoadPath(
              { x: 0, y: 0, lat: bot.targetDestination.lat, lng: bot.targetDestination.lng },
              { x: 0, y: 0, lat: secondOrder.recipientAddress.lat, lng: secondOrder.recipientAddress.lng },
              currentCity,
              {}
            );
            const multiLatLngs: Array<[number, number]> = multiLegCoords
              .filter((p: any) => p.lat !== undefined && p.lng !== undefined)
              .map((p: any) => [p.lat!, p.lng!]);

            if (multiLatLngs.length > 1) {
              const multiDropLine = L.polyline(multiLatLngs, {
                color: '#a855f7',
                weight: 3.5,
                opacity: 0.85,
                dashArray: '5, 6',
                lineCap: 'round',
                lineJoin: 'round'
              });
              multiDropLine.bindTooltip(`📦📦 <b>${lang === 'zh' ? '一车多单·第2站' : 'Multi-Drop Stop 2'}</b>: #${secondOrderId}<br/><span style="color:#cbd5e1;">➔ ${secondOrder.recipientAddress.zone}</span>`, { sticky: true, opacity: 0.95 });
              multiDropLine.addTo(routesGroupRef.current);
            }
          }
        }

        // Render Scheduled Future Mission Queue Legs (Visualizing Complete Upfront Plan on Street Map)
        if (bot.missionQueue && bot.missionQueue.length > 0) {
          const queueColors = ['#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
          bot.missionQueue.forEach((mission, qIdx) => {
            const qLatLngs: Array<[number, number]> = [];
            mission.routeWaypoints.forEach(wp => {
              if (wp.lat && wp.lng) {
                qLatLngs.push([wp.lat, wp.lng]);
              }
            });

            if (mission.targetDestination?.lat && mission.targetDestination?.lng) {
              const last = qLatLngs[qLatLngs.length - 1];
              if (last) {
                const dist = Math.hypot(last[0] - mission.targetDestination.lat, last[1] - mission.targetDestination.lng);
                if (dist > 0.0001 && dist < 0.0025) {
                  qLatLngs.push([mission.targetDestination.lat, mission.targetDestination.lng]);
                }
              }
            }

            if (qLatLngs.length > 1) {
              const color = queueColors[qIdx % queueColors.length];
              const qLine = L.polyline(qLatLngs, {
                color,
                weight: 3,
                opacity: 0.75,
                dashArray: '6, 8',
                lineCap: 'round',
                lineJoin: 'round'
              });

              const legNum = qIdx + 2;
              const qDesc = `🗓️ <b>${bot.name}</b> ${lang === 'zh' ? `已排程第 ${legNum} 序位行动` : `Scheduled Leg #${legNum}`}: Order #${mission.orderId}<br/><span style="color:#fde68a;">➔ ${mission.targetDestination.label}</span><br/><span style="color:#94a3b8; font-size:10px;">${mission.priorityReasoning || ''}</span>`;
              qLine.bindTooltip(qDesc, { sticky: true, opacity: 0.95 });
              qLine.addTo(routesGroupRef.current);
            }
          });
        }
      });
    });
  }, [state.robots, state.selectedRobotId, lang]);

  // 4. Render Hubs and Customer Dropoff Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !pinsGroupRef.current) return;

    import('leaflet').then(L => {
      pinsGroupRef.current.clearLayers();

      // A. Logistics Hubs
      state.hubs.forEach(hub => {
        if (!hub.position.lat || !hub.position.lng) return;

        const hubLvl = hub.level || 1;
        const hubBorder = hubLvl === 3 ? '#a855f7' : (hubLvl === 2 ? '#38bdf8' : '#06b6d4');
        const hubEmoji = hubLvl === 3 ? '⚡🏢' : (hubLvl === 2 ? '🏢⚡' : '🏢');
        const hubBadge = hubLvl > 1 ? `<span style="color:#fde047; font-size:8px; margin-left:2px;">Lv.${hubLvl}</span>` : '';

        // Visual Signal Coverage Circle
        const radiusMeters = hubLvl === 3 ? 900 : (hubLvl === 2 ? 650 : 450);
        const coverageCircle = L.circle([hub.position.lat, hub.position.lng], {
          radius: radiusMeters,
          color: hubBorder,
          weight: 1.5,
          opacity: 0.6,
          dashArray: hubLvl === 3 ? '4, 4' : undefined,
          fillColor: hubBorder,
          fillOpacity: hubLvl === 3 ? 0.09 : (hubLvl === 2 ? 0.06 : 0.04)
        });
        coverageCircle.addTo(pinsGroupRef.current);

        const hubHtml = `
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
              border: 2px solid ${hubBorder};
              box-shadow: 0 0 16px ${hubBorder}99;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #38bdf8;
              font-family: monospace;
              font-weight: 900;
              font-size: 13px;
            ">${hubEmoji}</div>
            <div style="
              margin-top: 3px;
              background: rgba(8, 51, 68, 0.9);
              border: 1px solid ${hubBorder};
              padding: 1px 6px;
              border-radius: 4px;
              color: #7dd3fc;
              font-family: sans-serif;
              font-weight: bold;
              font-size: 9px;
              white-space: nowrap;
            ">${hub.name.split(' ')[0]}${hubBadge}</div>
          </div>
        `;

        const hubIcon = L.divIcon({
          html: hubHtml,
          className: 'custom-hub-marker',
          iconSize: [36, 48],
          iconAnchor: [18, 20]
        });

        const marker = L.marker([hub.position.lat, hub.position.lng], { icon: hubIcon });

        // Interactive Hub Management Popup
        const nextLvl = hubLvl === 1 ? 2 : 3;
        const upgradeCost = nextLvl === 2 ? 80 : 160;
        const canUpgrade = hubLvl < 3;
        const canSell = state.hubs.length > 1;

        const popupDiv = document.createElement('div');
        popupDiv.style.cssText = 'min-width: 190px; font-family: monospace; padding: 4px; color: #f8fafc;';
        popupDiv.innerHTML = `
          <div style="font-weight: bold; font-size: 12px; color: ${hubBorder}; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${hub.name}</span>
            <span style="font-size: 9px; background: #083344; padding: 1px 5px; border-radius: 4px; border: 1px solid ${hubBorder};">LEVEL ${hubLvl}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-bottom: 8px; line-height: 1.5;">
            ⚡ ${lang === 'zh' ? '回充速率' : 'Charge Speed'}: <b style="color: #34d399;">+${hub.chargingRatePerTick || (hubLvl === 3 ? 14 : (hubLvl === 2 ? 9 : 6))}% / tick</b><br/>
            🔌 ${lang === 'zh' ? '充电机位' : 'Charging Bays'}: <b style="color: #38bdf8;">${hub.chargingBays || 2} ${lang === 'zh' ? '台同时' : 'Bays'}</b><br/>
            📍 ${lang === 'zh' ? '辐射半径' : 'Radius'}: <b>${radiusMeters}m</b>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            ${canUpgrade ? `<button id="btn-upg-${hub.id}" style="flex: 1; background: #0284c7; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;">⚡ ${lang === 'zh' ? `升级 Lv.${nextLvl} ($${upgradeCost})` : `Upgrade Lv.${nextLvl} ($${upgradeCost})`}</button>` : `<div style="flex: 1; text-align: center; color: #fde047; font-size: 10px; font-weight: bold; background: rgba(234, 179, 8, 0.15); padding: 4px; border-radius: 4px;">⚡ MAX LEVEL</div>`}
            ${canSell ? `<button id="btn-sell-${hub.id}" style="background: #881337; color: #fecdd3; border: 1px solid #f43f5e; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" title="${lang === 'zh' ? '撤除站点回收资金 (+$100)' : 'Decommission Hub (+$100)'}">🗑️ +$100</button>` : ''}
          </div>
        `;

        marker.bindPopup(popupDiv, { maxWidth: 260 });
        marker.on('popupopen', () => {
          const upgBtn = document.getElementById(`btn-upg-${hub.id}`);
          if (upgBtn && onUpgradeHub) {
            upgBtn.onclick = () => {
              onUpgradeHub(hub.id, nextLvl as 2 | 3);
              marker.closePopup();
            };
          }
          const sellBtn = document.getElementById(`btn-sell-${hub.id}`);
          if (sellBtn && onSellHub) {
            sellBtn.onclick = () => {
              onSellHub(hub.id);
              marker.closePopup();
            };
          }
        });

        marker.addTo(pinsGroupRef.current);
      });

      // Quick Build Hub Node Markers on Unlocked Sectors + Locked Preview Markers on Next Sector (in Level 2+)
      if ((state.levelProgression?.currentLevel || 1) >= 2 && onBuildHub) {
        const candidateNodes = sectorStatus.availableBuildNodes;

        candidateNodes.forEach(node => {
          const secNum = node.sector || 1;
          const nodeHtml = `
            <div style="
              background: rgba(88, 28, 135, 0.92);
              border: 1.5px dashed #e879f9;
              color: #fae8ff;
              padding: 2px 7px;
              border-radius: 5px;
              font-family: monospace;
              font-size: 8.5px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 0 12px rgba(217,70,239,0.55);
              white-space: nowrap;
            ">➕ ${lang === 'zh' ? `建站点 [${secNum}区]` : `BUILD HUB [S${secNum}]`}</div>
          `;
          const nodeIcon = L.divIcon({ html: nodeHtml, className: 'node-build-marker', iconSize: [74, 20], iconAnchor: [37, 10] });
          const nodeMarker = L.marker([node.lat, node.lng], { icon: nodeIcon, zIndexOffset: 600 });

          const nodePopup = document.createElement('div');
          nodePopup.style.cssText = 'min-width: 195px; font-family: monospace; padding: 4px; color: #f8fafc;';
          nodePopup.innerHTML = `
            <div style="font-weight: bold; color: #e879f9; font-size: 12px; margin-bottom: 4px;">
              🏢 ${lang === 'zh' ? `新建充电枢纽 (第 ${secNum} 区)` : `Construct Hub (Sector ${secNum})`}
            </div>
            <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 8px; line-height: 1.45;">
              📍 <b>${lang === 'zh' ? node.nameZh : node.name}</b><br/>
              🗺️ ${lang === 'zh' ? `当前本区进度: ${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal} 座 (建满解锁下一区)` : `Sector Progress: ${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal} Hubs`}<br/>
              💰 ${lang === 'zh' ? '建造成本: $200' : 'Build Cost: $200'} &bull; 💵 $${state.financials.balance.toFixed(0)}
            </div>
            <button id="btn-build-${node.id}" style="width: 100%; background: #9333ea; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;" ${state.financials.balance < 200 ? 'disabled' : ''}>
              ${state.financials.balance < 200 ? (lang === 'zh' ? '资金不足 ($200)' : 'Insufficient Funds ($200)') : (lang === 'zh' ? '确认在此投资建站 ($200)' : 'Confirm Build Hub ($200)')}
            </button>
          `;
          nodeMarker.bindPopup(nodePopup, { maxWidth: 250 });
          nodeMarker.on('popupopen', () => {
            const buildBtn = document.getElementById(`btn-build-${node.id}`);
            if (buildBtn && onBuildHub && state.financials.balance >= 200) {
              buildBtn.onclick = () => {
                onBuildHub(lang === 'zh' ? `${node.nameZh}中心站` : `${node.name} Depot`, node.lat, node.lng);
                nodeMarker.closePopup();
              };
            }
          });
          nodeMarker.addTo(pinsGroupRef.current);
        });

        // Render Locked Next-Sector Preview Nodes so player knows where the city will expand next!
        sectorStatus.nextLockedSectorNodes.forEach(lockedNode => {
          const nextSec = lockedNode.sector || 2;
          const lockedHtml = `
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
            ">🔒 ${lang === 'zh' ? `待解锁 [${nextSec}区]` : `LOCKED [S${nextSec}]`}</div>
          `;
          const lockedIcon = L.divIcon({ html: lockedHtml, className: 'node-locked-marker', iconSize: [70, 18], iconAnchor: [35, 9] });
          const lockedMarker = L.marker([lockedNode.lat, lockedNode.lng], { icon: lockedIcon });
          lockedMarker.bindTooltip(
            lang === 'zh'
              ? `<b>🔒 ${lockedNode.nameZh} (第 ${nextSec} 扩张区)</b><br/>请先建满当前第 ${sectorStatus.unlockedSector} 区的剩余站点 (${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal}) 即可解锁本区域！`
              : `<b>🔒 ${lockedNode.name} (Sector ${nextSec})</b><br/>Complete all Hub sites in Sector ${sectorStatus.unlockedSector} (${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal}) to unlock this district!`,
            { direction: 'top', opacity: 0.95 }
          );
          lockedMarker.addTo(pinsGroupRef.current);
        });
      }

      // B. Dropoff Customer Pins
      state.orders.forEach(order => {
        if ((order.status === 'in_transit' || order.status === 'pending') && order.recipientAddress.lat && order.recipientAddress.lng) {
          const isUrgent = (order.deadlineTick - state.tick) <= 15;
          const isSelected = order.id === state.selectedOrderId;
          const remainingTicks = Math.max(0, order.deadlineTick - state.tick);

          const pinColor = isUrgent ? '#ef4444' : '#10b981';
          const dropHtml = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="
                background: ${pinColor};
                color: #ffffff;
                border: ${isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.7)'};
                border-radius: 6px;
                padding: 1px 5px;
                font-family: monospace;
                font-weight: bold;
                font-size: 9px;
                box-shadow: 0 0 12px ${pinColor}88;
                white-space: nowrap;
              ">📦 #${order.id} &bull; ${remainingTicks}t</div>
              <div style="
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${pinColor};
              "></div>
            </div>
          `;

          const dropIcon = L.divIcon({
            html: dropHtml,
            className: 'custom-drop-marker',
            iconSize: [50, 30],
            iconAnchor: [25, 26]
          });

          const marker = L.marker([order.recipientAddress.lat, order.recipientAddress.lng], { icon: dropIcon });
          marker.on('click', () => onSelectOrder(order.id));
          marker.bindTooltip(`<b>Order #${order.id}</b> (${order.sender})<br/>SLA: ${remainingTicks} ticks remaining`, { direction: 'top' });
          marker.addTo(pinsGroupRef.current);
        }
      });

      // C. Active Roadblock / Emergency Road Closure Hazard Marker
      if (state.roadClosureNodeId) {
        const closedNode = currentCity.roadNodes.find(n => n.id === state.roadClosureNodeId);
        if (closedNode) {
          const roadblockHtml = `
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
                <span>${lang === 'zh' ? '道路施工封闭' : 'ROAD CLOSED'}</span>
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
              ">${lang === 'zh' ? closedNode.nameZh : closedNode.name}</div>
            </div>
          `;

          const roadblockIcon = L.divIcon({
            html: roadblockHtml,
            className: 'custom-roadblock-marker',
            iconSize: [130, 42],
            iconAnchor: [65, 21]
          });

          const roadblockMarker = L.marker([closedNode.lat, closedNode.lng], {
            icon: roadblockIcon,
            zIndexOffset: 1500
          });
          roadblockMarker.bindTooltip(
            `<b>🚧 ${lang === 'zh' ? '突发紧急施工封闭' : 'EMERGENCY ROAD CLOSURE'}</b><br/>${lang === 'zh' ? '全向双向交通阻断，途经机器人必须执行绕行' : 'All lanes blocked. Fleet must detour.'}`,
            { direction: 'top', opacity: 0.95 }
          );
          roadblockMarker.addTo(pinsGroupRef.current);
        }
      }
    });
  }, [state.hubs, state.orders, state.selectedOrderId, state.tick, state.roadClosureNodeId, state.financials.balance, state.levelProgression?.currentLevel, onBuildHub, onUpgradeHub, onSellHub, lang]);

  // 5. Render Autonomous Delivery Robots (Persistent markers for smooth continuous road gliding)
  useEffect(() => {
    if (!mapInstanceRef.current || !robotsGroupRef.current) return;

    import('leaflet').then(L => {
      const activeBotIds = new Set(state.robots.map(b => b.id));

      // Remove obsolete markers
      robotMarkersMapRef.current.forEach((marker, id) => {
        if (!activeBotIds.has(id)) {
          if (robotsGroupRef.current) {
            robotsGroupRef.current.removeLayer(marker);
          }
          robotMarkersMapRef.current.delete(id);
        }
      });

      // Update or create active robot markers
      state.robots.forEach(bot => {
        if (!bot.position.lat || !bot.position.lng) return;

        const isSelected = bot.id === state.selectedRobotId;
        const batteryColor = bot.batteryPct > 50 ? '#10b981' : (bot.batteryPct > 25 ? '#f59e0b' : '#ef4444');
        const isDelivering = bot.status === 'delivering';
        const isReturning = bot.status === 'returning';
        const isCharging = bot.status === 'charging';
        const isMoving = isDelivering || isReturning || bot.status === 'moving';

        let statusBadge = `<div style="background:#334155; color:#94a3b8; border-radius:4px; padding:1px 4px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace;">STANDBY</div>`;

        const carriedCount = bot.carriedOrderIds && bot.carriedOrderIds.length > 0 ? bot.carriedOrderIds.length : (bot.currentOrderId ? 1 : 0);

        if (isDelivering) {
          const badgeText = carriedCount > 1 ? `📦📦 ${carriedCount} PKGS` : `📦 #${bot.currentOrderId || 'PKG'}`;
          statusBadge = `<div style="background:#0284c7; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(2,132,199,0.8);">${badgeText}</div>`;
        } else if (isReturning) {
          statusBadge = `<div style="background:#7c3aed; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(124,58,237,0.8);">⚡ ${lang === 'zh' ? '返航' : 'RETURN'}</div>`;
        } else if (isCharging) {
          statusBadge = `<div style="background:#059669; color:#ffffff; border-radius:4px; padding:1px 5px; font-size:7px; font-weight:800; white-space:nowrap; margin-bottom:2px; font-family:monospace; box-shadow:0 0 10px rgba(5,150,105,0.8);">🔋 ${bot.batteryPct.toFixed(0)}%</div>`;
        }

        const chassisBg = isCharging ? '#064e3b' : (isReturning ? '#2e1065' : (isDelivering ? '#0c4a6e' : '#0f172a'));
        const chassisBorder = isSelected ? '#38bdf8' : (isReturning ? '#a855f7' : (isDelivering ? '#06b6d4' : (bot.color || '#64748b')));

        const botHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <!-- Radar Halo when moving -->
            ${isMoving ? `<div class="robot-radar-ping" style="
              position: absolute;
              top: 10px;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 2px solid ${chassisBorder};
              pointer-events: none;
            "></div>` : ''}

            <!-- Status Badge -->
            ${statusBadge}

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
              <div style="width: ${bot.batteryPct}%; height: 100%; background: ${batteryColor};"></div>
            </div>

            <!-- Pod Vehicle Chassis -->
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 10px;
              background: ${chassisBg};
              border: 2px solid ${chassisBorder};
              box-shadow: 0 0 ${isSelected ? '18px #38bdf8' : '10px rgba(6,182,212,0.4)'};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #f8fafc;
              font-family: monospace;
              font-weight: 900;
              font-size: 9px;
            ">
              <span style="font-size:12px;">${bot.archetype === 'speedy' ? '🏎️' : (bot.archetype === 'heavy' ? '🚚' : (isCharging ? '🔌' : (isReturning ? '⚡' : '🤖')))}</span>
              <span style="font-size:7px; opacity:0.9;">${bot.name.replace(/[^0-9]/g, '').slice(-2) || '01'}</span>
            </div>
          </div>
        `;

        const botIcon = L.divIcon({
          html: botHtml,
          className: 'custom-bot-marker',
          iconSize: [44, 52],
          iconAnchor: [22, 28]
        });

        const tooltipDetails = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <strong style="color: ${chassisBorder}; font-size: 12px;">${bot.name}</strong><br/>
            <span>${lang === 'zh' ? '状态' : 'Status'}: <b>${bot.status.toUpperCase()}</b></span><br/>
            <span>${lang === 'zh' ? '电量' : 'Battery'}: <b>${bot.batteryPct.toFixed(0)}%</b></span><br/>
            <span>${lang === 'zh' ? '载重' : 'Payload'}: <b>${bot.currentPayloadKg} / ${bot.maxCapacityKg} kg</b></span><br/>
            <span>${lang === 'zh' ? '累计送达' : 'Completed'}: <b>${bot.totalDeliveriesCompleted}</b></span><br/>
            ${bot.targetDestination ? `<span style="color:#38bdf8;">➔ ${bot.targetDestination.label}</span>` : ''}
          </div>
        `;

        let existingMarker = robotMarkersMapRef.current.get(bot.id);
        if (existingMarker) {
          if (!robotsGroupRef.current.hasLayer(existingMarker)) {
            robotsGroupRef.current.addLayer(existingMarker);
          }
          existingMarker.setLatLng([bot.position.lat, bot.position.lng]);
          existingMarker.setIcon(botIcon);
          existingMarker.setTooltipContent(tooltipDetails);
        } else {
          const marker = L.marker([bot.position.lat, bot.position.lng], {
            icon: botIcon,
            zIndexOffset: 1000
          });
          marker.on('click', () => {
            onSelectRobot(bot.id);
            if (mapInstanceRef.current && bot.position.lat && bot.position.lng) {
              mapInstanceRef.current.flyTo([bot.position.lat, bot.position.lng], 16, { duration: 0.8 });
            }
          });
          marker.bindTooltip(tooltipDetails, { direction: 'top', opacity: 0.95 });
          marker.addTo(robotsGroupRef.current);
          robotMarkersMapRef.current.set(bot.id, marker);
        }
      });
    });
  }, [state.robots, state.selectedRobotId, lang]);

  // Handler for Switching Cities
  const handleSelectCity = (cityId: string) => {
    if (robotsGroupRef.current) {
      robotsGroupRef.current.clearLayers();
    }
    robotMarkersMapRef.current.clear();
    setActiveCityId(cityId);
    onSwitchCity(cityId);

    const city = CITIES_DATA[cityId];
    if (city && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(city.center, city.zoom, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-0 bg-slate-950 overflow-hidden select-none">
      {/* Real Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Atmospheric Weather Canvas Overlays */}
      {state.weather === 'rain' && (
        <div className="absolute inset-0 pointer-events-none z-[1] rain-overlay" />
      )}
      {state.weather === 'typhoon' && (
        <div className="absolute inset-0 pointer-events-none z-[1] typhoon-overlay" />
      )}

      {/* 1. Top Left: City Selector Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-900/60 shadow-xl">
        <div className="flex items-center gap-1 px-2 text-[11px] font-mono font-bold text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{lang === 'zh' ? '仿真城市:' : 'CITY:'}</span>
        </div>

        {Object.values(CITIES_DATA).map(city => (
          <button
            key={city.id}
            onClick={() => handleSelectCity(city.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeCityId === city.id
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{city.flag}</span>
            <span>{lang === 'zh' ? city.nameZh : city.name}</span>
          </button>
        ))}
      </div>

      {/* 1.5. Fleet Live Quick-Tracker Bar */}
      <div className="absolute top-14 left-3 z-10 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono shadow-xl">
        <span className="text-slate-400 font-bold">{lang === 'zh' ? '车队跟踪:' : 'FLEET TRACKER:'}</span>
        <div className="flex items-center gap-1.5">
          {state.robots.map(bot => {
            const isDelivering = bot.status === 'delivering';
            const isReturning = bot.status === 'returning';
            const isCharging = bot.status === 'charging';
            const isSelected = bot.id === state.selectedRobotId;

            return (
              <button
                key={bot.id}
                onClick={() => {
                  onSelectRobot(bot.id);
                  if (bot.position.lat && bot.position.lng && mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([bot.position.lat, bot.position.lng], 16, { duration: 0.8 });
                  }
                }}
                title={bot.targetDestination ? `${bot.name}: ${bot.targetDestination.label}` : bot.name}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : isDelivering
                    ? 'border-cyan-700/60 bg-cyan-950/40 text-cyan-200'
                    : isReturning
                    ? 'border-purple-700/60 bg-purple-950/40 text-purple-200'
                    : isCharging
                    ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{isDelivering ? '📦' : isReturning ? '⚡' : isCharging ? '🔋' : '⚪'}</span>
                <span>{bot.name.replace(/[^0-9]/g, '').slice(-2) ? `R${bot.name.replace(/[^0-9]/g, '').slice(-2)}` : bot.name.split('-')[0]}</span>
                <span className="text-slate-500 font-sans">{bot.batteryPct.toFixed(0)}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1.8. Progressive City Sector Expansion HUD Bar (Level 2+) */}
      {(state.levelProgression?.currentLevel || 1) >= 2 && (
        <div className="absolute top-[94px] left-3 z-10 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/50 text-[10px] font-mono shadow-xl">
          <span className="text-purple-300 font-bold">
            🗺️ {lang === 'zh' ? sectorStatus.currentSectorNameZh : sectorStatus.currentSectorNameEn}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-200 font-bold">
            {lang === 'zh'
              ? `本区站点: ${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal}`
              : `Sector Hubs: ${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal}`}
          </span>
          {sectorStatus.availableBuildNodes.length > 0 ? (
            <button
              onClick={() => {
                import('leaflet').then(L => {
                  const coords = sectorStatus.availableBuildNodes.map(n => [n.lat, n.lng] as [number, number]);
                  if (coords.length === 1 && mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(coords[0], 15, { duration: 0.9 });
                  } else if (coords.length > 1 && mapInstanceRef.current) {
                    const bounds = L.latLngBounds(coords);
                    mapInstanceRef.current.flyToBounds(bounds, { padding: [70, 70], maxZoom: 15, duration: 0.9 });
                  }
                });
              }}
              className="px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              title={lang === 'zh' ? '点击在地图上聚焦显示当前可建站的位置' : 'Pan map to available Hub build sites'}
            >
              📍 {lang === 'zh' ? `定位可建站点 (${sectorStatus.availableBuildNodes.length})` : `Locate Build Sites (${sectorStatus.availableBuildNodes.length})`}
            </button>
          ) : (
            <span className="text-emerald-400 font-bold">
              🏆 {lang === 'zh' ? '全城4大区域全部建满!' : 'All 4 City Sectors Maxed!'}
            </span>
          )}
        </div>
      )}

      {/* 2. Top Right: Atmospheric Weather, Hazards & Map Layer Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center justify-end gap-1.5 max-w-[90vw]">
        {/* Weather Selector Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={() => onSetWeather?.('clear')}
            title={lang === 'zh' ? '晴天万里 (标准能耗 1.0x)' : 'Clear Skies (Standard 1.0x battery)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              state.weather === 'clear'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>☀️</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '晴天' : 'Clear'}</span>
          </button>
          <button
            onClick={() => onSetWeather?.('rain')}
            title={lang === 'zh' ? '热带暴雨 (路面湿滑，能耗消耗+35%)' : 'Rainstorm (Wet roads, +35% battery drain)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              state.weather === 'rain'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌧️</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '暴雨' : 'Rain'}</span>
          </button>
          <button
            onClick={() => onSetWeather?.('typhoon')}
            title={lang === 'zh' ? '强雷暴台风 (极寒强风，能耗+75%，配送享有+25%风险津贴)' : 'Typhoon (Extreme weather, +75% battery drain, +25% hazard pay)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              state.weather === 'typhoon'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/70 font-bold shadow-[0_0_14px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '台风' : 'Storm'}</span>
          </button>
        </div>

        {/* Rush Hour Peak Surge Toggle */}
        <button
          onClick={onToggleRushHour}
          title={lang === 'zh' ? '点击切换晚高峰主干道大拥堵状态 (延误最高达 4.2x)' : 'Toggle Evening Rush Hour Congestion (delays up to 4.2x)'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${
            state.rushHourActive
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.55)] animate-pulse'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🚦</span>
          <span>{lang === 'zh' ? '晚高峰' : 'RUSH HOUR'}</span>
          {state.rushHourActive && <span className="text-[10px] text-rose-400 font-sans font-black">4.2x</span>}
        </button>

        {/* Emergency Road Closure Hazard Toggle */}
        <button
          onClick={() => onToggleRoadClosure?.()}
          title={lang === 'zh' ? '点击触发突发道路施工封闭，测试系统提示词避障绕行能力' : 'Trigger Emergency Roadblock to test prompt detour capabilities'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${
            state.roadClosureNodeId
              ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.55)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🚧</span>
          <span>{lang === 'zh' ? '突发封路' : 'ROADBLOCK'}</span>
        </button>

        {/* Traffic Layer Toggle */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md transition-all ${
            showTraffic
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'zh' ? '路况' : 'TRAFFIC'}</span>
        </button>

        {/* Map Style Selector */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              mapStyle === 'dark' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '深色' : 'DARK'}
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              mapStyle === 'satellite' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '卫星' : 'SATELLITE'}
          </button>
          <button
            onClick={() => setMapStyle('streets')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              mapStyle === 'streets' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '街道' : 'STREETS'}
          </button>
        </div>
      </div>

      {/* 3. Bottom Right: Zoom & Reset Center Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo(currentCity.center, currentCity.zoom)}
          title="Recenter City"
          className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Bottom Left: Real-Life Traffic Speed Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 text-[10px] font-mono text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>&gt;40 km/h ({lang === 'zh' ? '畅通' : 'Fast'})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>20-40 km/h ({lang === 'zh' ? '缓行' : 'Slow'})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>&lt;15 km/h ({lang === 'zh' ? '重度拥堵' : 'Jam'})</span>
        </div>
      </div>
    </div>
  );
};
