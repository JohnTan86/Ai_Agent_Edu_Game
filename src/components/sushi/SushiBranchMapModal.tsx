import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Building2, Check, ArrowRight } from 'lucide-react';
import { PRESET_BRANCH_CANDIDATES, BranchLocationCandidate } from '../../lib/sushi/branchConfig';
import { SushiBranch, RestaurantFinancials } from '../../lib/sushi/types';
import { useSushiI18n } from '../../lib/sushi/i18n';

interface SushiBranchMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: SushiBranch[];
  activeBranchId: string;
  hasReachedMaxTables: boolean;
  financials: RestaurantFinancials;
  onSelectBranch: (branchId: string) => void;
  onOpenNewBranch: (candidate: BranchLocationCandidate) => void;
}

export const SushiBranchMapModal: React.FC<SushiBranchMapModalProps> = ({
  isOpen,
  onClose,
  branches,
  activeBranchId,
  hasReachedMaxTables,
  financials,
  onSelectBranch,
  onOpenNewBranch
}) => {
  const { language, t, translateBranch } = useSushiI18n();
  const isEn = language === 'en';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [selectedCandidate, setSelectedCandidate] = useState<BranchLocationCandidate | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<SushiBranch | null>(null);
  const [customPin, setCustomPin] = useState<{ lat: number; lng: number } | null>(null);
  const [customBranchName, setCustomBranchName] = useState('');

  // 1. Initialize Leaflet Map with Google Maps Tile Layer
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Tokyo Coordinates Default Center
      const defaultCenter: [number, number] = [35.6825, 139.7392];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Google Maps Roadmap Layer
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 19,
        subdomains: ['0', '1', '2', '3'],
        keepBuffer: 6
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Allow clicking on map to set a custom prospective branch pin
      map.on('click', (e: any) => {
        setCustomPin({ lat: e.latlng.lat, lng: e.latlng.lng });
        setSelectedBranch(null);
        setSelectedCandidate({
          id: `branch_custom_${Date.now()}`,
          name: customBranchName.trim() || (isEn ? 'Custom Sushi Branch' : '自訂・特色連鎖分店'),
          districtName: isEn ? `Custom (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})` : `自訂坐標 (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          openingCost: 350,
          emoji: '🍣',
          footTrafficTag: isEn ? 'Custom Street' : '自選街道',
          specialtyTag: isEn ? 'Prime Location' : '特色旗艦',
          description: isEn
            ? `Custom branch located at [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}].`
            : `玩家在地圖上點擊選址的自訂分店位置 [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]。`
        });
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, isEn, customBranchName]);

  // 2. Render Markers onto Leaflet Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || typeof window === 'undefined') return;

    import('leaflet').then(L => {
      markersLayerRef.current.clearLayers();

      // Existing Operating Branches (Green Markers with 🍣)
      branches.forEach(branch => {
        const isCurrentActive = branch.id === activeBranchId;
        const isSelected = selectedBranch?.id === branch.id;

        const iconHtml = `
          <div style="
            width: ${isSelected ? '44px' : '38px'};
            height: ${isSelected ? '44px' : '38px'};
            background: ${isCurrentActive ? '#059669' : '#047857'};
            border: 3px solid ${isSelected ? '#fbbf24' : '#6ee7b7'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '22px' : '18px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            ${branch.emoji || '🍣'}
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'sushi-map-pin',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([branch.lat, branch.lng], { icon });
        marker.on('click', () => {
          setSelectedBranch(branch);
          setSelectedCandidate(null);
        });

        markersLayerRef.current.addLayer(marker);
      });

      // Prospective Candidate Locations (Amber Markers with 🏮)
      const existingBranchNames = new Set(branches.map(b => b.name));
      PRESET_BRANCH_CANDIDATES.filter(c => !existingBranchNames.has(c.name)).forEach(cand => {
        const isSelected = selectedCandidate?.id === cand.id;

        const iconHtml = `
          <div style="
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            background: #1e293b;
            border: 2px dashed ${isSelected ? '#f59e0b' : '#94a3b8'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '20px' : '16px'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            ${cand.emoji}
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'sushi-cand-pin',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([cand.lat, cand.lng], { icon });
        marker.on('click', () => {
          setSelectedCandidate(cand);
          setSelectedBranch(null);
        });

        markersLayerRef.current.addLayer(marker);
      });

      // Custom User Pin if placed
      if (customPin) {
        const iconHtml = `
          <div style="
            width: 44px;
            height: 44px;
            background: #e11d48;
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 4px 15px rgba(225,29,72,0.8);
            transform: translate(-50%, -50%);
            animation: bounce 1s infinite;
          ">
            📍
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'sushi-custom-pin',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        const marker = L.marker([customPin.lat, customPin.lng], { icon });
        markersLayerRef.current.addLayer(marker);
      }
    });
  }, [isOpen, branches, activeBranchId, selectedCandidate, selectedBranch, customPin]);

  if (!isOpen) return null;

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  const canAffordCandidate = selectedCandidate ? financials.balance >= selectedCandidate.openingCost : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-amber-600/40 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {t('mapModalTitle')}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {isEn ? `Branches: ${branches.length}` : `連鎖分店: ${branches.length} 家`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('mapModalSub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Strip & Qualification Alert */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{isEn ? 'Current Branch:' : '當前管理分店:'}</span>
              <strong className="text-amber-300 font-bold">{translateBranch ? translateBranch(currentBranch?.name) : currentBranch?.name}</strong>
              <span className="text-slate-500 font-mono">({currentBranch?.tables.length}/16 {isEn ? 'Tables' : '席'})</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">{isEn ? 'Available Cash:' : '可用資金:'}</span>
              <span className="font-bold text-emerald-400">${financials.balance.toFixed(0)}</span>
            </div>
          </div>

          <div>
            {hasReachedMaxTables ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {isEn ? '16 Tables Maximum Reached! Ready to open new branches anytime!' : '已達成 16 桌滿載！隨時可選址開設新分行'}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                {isEn
                  ? `💡 Tip: Expand current branch to 16 tables (${currentBranch?.tables.length}/16) to unlock new branch opening!`
                  : `💡 提示：任一分店餐桌擴展至 16 桌滿載（目前 ${currentBranch?.tables.length}/16 席）即解鎖開設新分行！`}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Area: Left Google Map + Right Branch Inspector Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
          {/* Left: Google Map View Container */}
          <div className="flex-1 relative h-full w-full bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-xs text-slate-300 shadow-xl backdrop-blur-sm flex flex-col gap-1.5 select-none pointer-events-none">
              <span className="font-bold text-white text-xs mb-0.5">📌 {isEn ? 'Map Legend:' : '地圖圖例 (Map Legend)：'}</span>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-emerald-300 flex items-center justify-center text-[9px]">🍣</span>
                <span>{isEn ? 'Active Operating Branch' : '已開設營運中分店'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-dashed border-slate-300 flex items-center justify-center text-[9px]">🏮</span>
                <span>{isEn ? 'Recommended Prospective District' : '黃金推薦待選址商圈'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span>💡 {isEn ? 'Tip: Click anywhere on map to add custom branch pin!' : '提示：在地圖任意位置點擊，可自訂落點選址！'}</span>
              </div>
            </div>
          </div>

          {/* Right: Branch Inspector & Opening Action Sidebar */}
          <div className="w-full md:w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col overflow-y-auto p-4 gap-4 flex-shrink-0">
            {/* 1. Existing Branches Quick Switcher List */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                🏢 {isEn ? 'My Branches' : '我的連鎖分店陣列'} ({branches.length})
              </span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {branches.map(b => {
                  const isActive = b.id === activeBranchId;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBranch(b);
                        setSelectedCandidate(null);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([b.lat, b.lng], 14, { duration: 0.8 });
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{b.emoji || '🍣'}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{translateBranch ? translateBranch(b.name) : b.name}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {b.districtName.split(' ')[1] || b.districtName} • {isEn ? 'Tables' : '餐桌'} {b.tables.length}/16
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          {isEn ? 'Active' : '視角中'}
                        </span>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectBranch(b.id);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition flex items-center gap-1"
                        >
                          <span>{isEn ? 'Switch' : '切換'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* 2. Inspector Detail Card (Candidate or Existing Branch) */}
            {selectedBranch ? (
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-emerald-500/40 flex flex-col gap-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">{isEn ? '● Active Operating Branch' : '● 已營運連鎖分店'}</span>
                  <span className="text-xs text-slate-400 font-mono">{isEn ? `Established Day ${selectedBranch.establishedAtDay}` : `第 ${selectedBranch.establishedAtDay} 天開業`}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedBranch.emoji || '🍣'}</span>
                  <div>
                    <h3 className="font-black text-sm text-white">{translateBranch ? translateBranch(selectedBranch.name) : selectedBranch.name}</h3>
                    <p className="text-xs text-slate-400">{selectedBranch.districtName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-750">
                  <div>
                    <span className="text-slate-400 text-xs">{isEn ? 'Dining Tables' : '餐桌席位'}</span>
                    <p className="font-bold text-amber-300">{selectedBranch.tables.length} / 16 {isEn ? 'Tables' : '席'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">{isEn ? 'Stations' : '料理台數'}</span>
                    <p className="font-bold text-sky-300">{selectedBranch.kitchenStations?.length ?? 3} {isEn ? 'Stn' : '席台'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectBranch(selectedBranch.id);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>{isEn ? 'Switch to this Branch View' : '切換至此分店管理實景 (Overcooked 劇場)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : selectedCandidate ? (
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-amber-500/50 flex flex-col gap-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold">{isEn ? '✨ Prospective District' : '✨ 勘察推薦選址'}</span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {isEn ? 'Cost: ' : '加盟金: '}${selectedCandidate.openingCost}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedCandidate.emoji}</span>
                  <div>
                    <h3 className="font-black text-sm text-white">{selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-400">{selectedCandidate.districtName}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-750">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{isEn ? 'Traffic Trend:' : '客流特點:'}</span>
                    <span className="font-semibold text-sky-300">{selectedCandidate.footTrafficTag}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{isEn ? 'Specialty:' : '主打特色:'}</span>
                    <span className="font-semibold text-amber-300">{selectedCandidate.specialtyTag}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {selectedCandidate.description}
                  </p>
                </div>

                {/* Open Branch Action Button */}
                {hasReachedMaxTables ? (
                  <button
                    onClick={() => {
                      onOpenNewBranch(selectedCandidate);
                      onClose();
                    }}
                    disabled={!canAffordCandidate}
                    className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:opacity-95 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950 transition flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isEn ? `Open This Branch (-$${selectedCandidate.openingCost})` : `在此簽約開設新分店 (-$${selectedCandidate.openingCost})`}</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 leading-snug">
                    🔒 <strong>{isEn ? 'Expansion Locked' : '尚未達成開設資格'}</strong>：{isEn ? 'Please expand current branch to 16 tables to unlock new branch expansion!' : '請先將當前分店擴建至滿載上限（16 桌席位），即可在此簽約開業！'}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-750 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                <MapPin className="w-8 h-8 text-slate-600" />
                <span className="text-xs font-bold text-slate-300">{isEn ? 'Click on a district pin on map' : '請在地圖上點選商圈地標'}</span>
                <p className="text-xs leading-relaxed">
                  {isEn
                    ? 'Click any district marker or anywhere on the map to survey and expand your restaurant empire.'
                    : '點擊地圖上的各個商圈標記，或直接在地圖任意位置點擊以勘察選址。'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {isEn
              ? '🗺️ Google Maps Roadmap View • Infinite Chain Expansion Mode Active'
              : '🗺️ Google Maps 地圖實景圖層 • 無限連鎖拓展模式已啟用'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {isEn ? 'Return to Floor' : '返回餐廳實景'}
          </button>
        </div>
      </div>
    </div>
  );
};
