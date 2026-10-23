'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  SimulationState,
  DeliveryRobot,
  Hub,
  Order,
  GridCell
} from '../../lib/types';
import { Language } from '../../lib/i18n';

interface CityGridCanvasProps {
  state: SimulationState;
  onSelectRobot: (robotId?: string) => void;
  onSelectOrder: (orderId?: string) => void;
  lang?: Language;
}

export const CityGridCanvas: React.FC<CityGridCanvasProps> = ({
  state,
  onSelectRobot,
  onSelectOrder,
  lang = 'en'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const {
    grid,
    robots,
    hubs,
    orders,
    showTrafficHeatmap,
    selectedRobotId,
    selectedOrderId,
    tick
  } = state;

  const gridWidth = grid.length || 18;
  const gridHeight = (grid[0] && grid[0].length) || 18;

  // Animation frame loop for continuous smooth effects (pulsing lights, radar rings)
  useEffect(() => {
    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      pulseAngle = (pulseAngle + 0.05) % (Math.PI * 2);
      drawCanvas(pulseAngle);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, hoveredEntity]);

  const drawCanvas = (pulse: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display size
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cellSize = Math.min(width / gridWidth, height / gridHeight);
    const offsetX = (width - gridWidth * cellSize) / 2;
    const offsetY = (height - gridHeight * cellSize) / 2;

    // 1. Draw Grid Base Cells
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        const cell = grid[x][y];
        const cx = offsetX + x * cellSize;
        const cy = offsetY + y * cellSize;

        if (cell.type === 'building') {
          // Cyberpunk Building structure
          ctx.fillStyle = '#0b1120';
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

          // Roof antenna / detail
          ctx.fillStyle = '#1e3a5f';
          ctx.fillRect(cx + cellSize * 0.35, cy + cellSize * 0.35, cellSize * 0.3, cellSize * 0.3);
        } else if (cell.type === 'park') {
          // Park / eco zone
          ctx.fillStyle = '#062016';
          ctx.fillRect(cx, cy, cellSize, cellSize);

          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.arc(cx + cellSize * 0.5, cy + cellSize * 0.5, cellSize * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Road / Street
          ctx.fillStyle = '#070a12';
          ctx.fillRect(cx, cy, cellSize, cellSize);

          // Subtle road borders
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(cx, cy, cellSize, cellSize);
        }

        // 2. Traffic Congestion Heatmap Overlay
        if (showTrafficHeatmap && cell.trafficMultiplier > 1.2) {
          const intensity = Math.min(1, (cell.trafficMultiplier - 1.0) / 2.5);
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx + cellSize / 2, cy + cellSize / 2, cellSize * 0.45, 0, Math.PI * 2);
          // Orange to Crimson glow
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.35})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(249, 115, 22, ${intensity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 3. Draw Hub Logistics Depots
    hubs.forEach(hub => {
      const hx = offsetX + hub.position.x * cellSize + cellSize / 2;
      const hy = offsetY + hub.position.y * cellSize + cellSize / 2;

      // Pulsing outer radar beacon
      const pulseRadius = (cellSize * 0.7) + Math.sin(pulse) * (cellSize * 0.15);
      ctx.beginPath();
      ctx.arc(hx, hy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Station base pad
      ctx.beginPath();
      ctx.arc(hx, hy, cellSize * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#083344';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hub Core Icon "H"
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.max(9, cellSize * 0.35)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', hx, hy);

      // Hub Name Label
      ctx.font = `bold ${Math.max(8, cellSize * 0.24)}px sans-serif`;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(hub.name.split(' ')[0], hx, hy + cellSize * 0.7);
    });

    // 4. Draw Waypoint Route Lines for Active Moving Robots
    robots.forEach(bot => {
      if ((bot.status === 'moving' || bot.status === 'delivering') && bot.pathQueue.length > 0) {
        ctx.save();
        ctx.beginPath();
        const startX = offsetX + bot.position.x * cellSize + cellSize / 2;
        const startY = offsetY + bot.position.y * cellSize + cellSize / 2;
        ctx.moveTo(startX, startY);

        bot.pathQueue.forEach(pt => {
          const px = offsetX + pt.x * cellSize + cellSize / 2;
          const py = offsetY + pt.y * cellSize + cellSize / 2;
          ctx.lineTo(px, py);
        });

        ctx.strokeStyle = bot.id === selectedRobotId ? '#38bdf8' : 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = bot.id === selectedRobotId ? 2.5 : 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Queued Mission Legs on Grid
      if (bot.missionQueue && bot.missionQueue.length > 0) {
        bot.missionQueue.forEach((mission, mIdx) => {
          if (mission.routeWaypoints.length > 0) {
            ctx.save();
            ctx.beginPath();
            const startX = offsetX + mission.routeWaypoints[0].x * cellSize + cellSize / 2;
            const startY = offsetY + mission.routeWaypoints[0].y * cellSize + cellSize / 2;
            ctx.moveTo(startX, startY);

            mission.routeWaypoints.forEach(pt => {
              const px = offsetX + pt.x * cellSize + cellSize / 2;
              const py = offsetY + pt.y * cellSize + cellSize / 2;
              ctx.lineTo(px, py);
            });

            ctx.strokeStyle = mIdx === 0 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 4]);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    });

    // 5. Draw Active Parcel Destination Dropoff Points
    orders.forEach(order => {
      if (order.status === 'in_transit' || order.status === 'pending') {
        const dx = offsetX + order.recipientAddress.x * cellSize + cellSize / 2;
        const dy = offsetY + order.recipientAddress.y * cellSize + cellSize / 2;

        const isUrgent = (order.deadlineTick - tick) <= 15;
        const isSelected = order.id === selectedOrderId;

        // Animated pulse ring
        ctx.save();
        ctx.beginPath();
        const destPulse = (cellSize * 0.4) + Math.sin(pulse * 1.5) * 3;
        ctx.arc(dx, dy, destPulse, 0, Math.PI * 2);
        ctx.strokeStyle = isUrgent ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Pin marker
        ctx.beginPath();
        ctx.arc(dx, dy, cellSize * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = isUrgent ? '#ef4444' : '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Order ID tag
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.max(7, cellSize * 0.22)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${order.id}`, dx, dy);

        // SLA remaining text
        const remainingTicks = Math.max(0, order.deadlineTick - tick);
        ctx.font = `bold ${Math.max(7, cellSize * 0.2)}px monospace`;
        ctx.fillStyle = isUrgent ? '#f87171' : '#34d399';
        ctx.fillText(`${remainingTicks}t`, dx, dy - cellSize * 0.45);

        ctx.restore();
      }
    });

    // 6. Draw Delivery Robots
    robots.forEach(bot => {
      const bx = offsetX + bot.position.x * cellSize + cellSize / 2;
      const by = offsetY + bot.position.y * cellSize + cellSize / 2;
      const isSelected = bot.id === selectedRobotId;

      ctx.save();

      // Selection Glow ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(bx, by, cellSize * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.stroke();
      }

      // Robot Chassis (Rounded square pod)
      const podSize = cellSize * 0.6;
      ctx.fillStyle = bot.status === 'charging' ? '#0f766e' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx - podSize / 2, by - podSize / 2, podSize, podSize, 6);
      ctx.fill();

      // Neon Accent Border
      ctx.strokeStyle = bot.color || '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Battery Status Mini-Bar (placed right above robot)
      const barWidth = podSize * 0.9;
      const barHeight = Math.max(3, cellSize * 0.08);
      const barX = bx - barWidth / 2;
      const barY = by - podSize / 2 - barHeight - 2;

      // Bar background
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Bar fill (Color-coded by battery health)
      const fillWidth = (bot.batteryPct / 100) * barWidth;
      ctx.fillStyle = bot.batteryPct > 50 ? '#10b981' : (bot.batteryPct > 25 ? '#f59e0b' : '#ef4444');
      ctx.fillRect(barX, barY, fillWidth, barHeight);

      // Robot Status Center Light
      ctx.beginPath();
      ctx.arc(bx, by, podSize * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = bot.status === 'delivering'
        ? '#f59e0b'
        : (bot.status === 'charging' ? '#10b981' : (bot.status === 'moving' ? '#06b6d4' : '#64748b'));
      ctx.fill();

      // Robot ID label below
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `bold ${Math.max(7, cellSize * 0.22)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(bot.name.replace('CyberRover-', 'R-').replace('AeroBot-', 'A-'), bx, by + podSize / 2 + 2);

      // If carrying payload, draw parcel tag
      if (bot.currentPayloadKg > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bx + podSize * 0.2, by - podSize * 0.4, 6, 6);
      }

      ctx.restore();
    });
  };

  // Resize canvas when container changes
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(rect.width, rect.height);

      canvasRef.current.width = size * dpr;
      canvasRef.current.height = size * dpr;
      canvasRef.current.style.width = `${size}px`;
      canvasRef.current.style.height = `${size}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click on canvas to select robots, hubs, or destination pins
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cellSize = Math.min(rect.width / gridWidth, rect.height / gridHeight);
    const offsetX = (rect.width - gridWidth * cellSize) / 2;
    const offsetY = (rect.height - gridHeight * cellSize) / 2;

    const gridX = Math.floor((clickX - offsetX) / cellSize);
    const gridY = Math.floor((clickY - offsetY) / cellSize);

    if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) return;

    // Check if clicked robot
    const clickedBot = robots.find(r => r.position.x === gridX && r.position.y === gridY);
    if (clickedBot) {
      onSelectRobot(clickedBot.id);
      return;
    }

    // Check if clicked order destination
    const clickedOrder = orders.find(
      o => (o.status === 'in_transit' || o.status === 'pending') &&
           o.recipientAddress.x === gridX &&
           o.recipientAddress.y === gridY
    );
    if (clickedOrder) {
      onSelectOrder(clickedOrder.id);
      return;
    }

    // Clear selection
    onSelectRobot(undefined);
    onSelectOrder(undefined);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950/90 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="cursor-pointer shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-lg"
      />

      {/* Floating Canvas Quick Legend HUD */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>{lang === 'zh' ? '机器人' : 'ROBOT'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-900 border border-cyan-400" />
          <span>{lang === 'zh' ? '中心站' : 'HUB'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{lang === 'zh' ? '收货地点' : 'DROPOFF'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>{lang === 'zh' ? 'SLA紧急' : 'URGENT SLA'}</span>
        </div>
        {showTrafficHeatmap && (
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{lang === 'zh' ? '道路拥堵' : 'CONGESTION'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
