import { useState, useMemo } from 'react';
import { hudAudio } from '../../utils/hudAudio';

export default function TreePanel({ data }) {
  // --- ALL HOOKS DECLARED AT THE VERY TOP (Strict Rules of Hooks compliance) ---
  const [filterText, setFilterText] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({
    ports: true,
    subdomains: true,
    phone: false,
    social: false,
    emails: true,
    breach: true
  });
  const [activeItemKey, setActiveItemKey] = useState(null);

  const target = data?.target || '';
  const modules = data?.modules || [];

  // Toggle Folder State
  const toggleFolder = (key) => {
    hudAudio.playClick();
    setExpandedFolders(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle All Folders
  const expandAll = (shouldExpand) => {
    hudAudio.playSweep();
    const nextState = {};
    modules.forEach(m => {
      if (m && m.key) nextState[m.key] = shouldExpand;
    });
    setExpandedFolders(nextState);
  };

  // Threat Matrix classification helper
  const getSeverity = (label) => {
    if (!label || typeof label !== 'string') return { text: 'LOW', css: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    const txt = label.toLowerCase();
    if (txt.includes('ssh') || txt.includes('open') || txt.includes('breach') || txt.includes('old')) {
      return { text: 'HIGH', css: 'text-red-400 bg-red-500/10 border-red-500/20' };
    }
    if (txt.includes('resolves') || txt.includes('github') || txt.includes('reliance')) {
      return { text: 'INFO', css: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
    return { text: 'LOW', css: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
  };

  // Handle click on evidence (leaf node)
  const handleItemSelect = (item, key, index) => {
    hudAudio.playClick();
    const leafId = `${key}-${index}`;
    setActiveItemKey(leafId);

    // --- DECOUPLED HUD CROSS-PANEL BROADCASTER ---
    const focusEvent = new CustomEvent('cyberxrecon-focus', {
      detail: { id: leafId, label: item }
    });
    window.dispatchEvent(focusEvent);
  };

  // Filter items dynamically based on search box input
  const filteredModules = useMemo(() => {
    const modulesList = modules || [];
    return modulesList.map(m => {
      if (!m) return null;
      const itemsList = m.items || [];
      const matchedItems = itemsList.map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item && typeof item === 'string' && item.toLowerCase().includes(filterText.toLowerCase()));
      
      return {
        ...m,
        matchedItems
      };
    }).filter(Boolean);
  }, [modules, filterText]);

  // --- ABSOLUTE SAFETY GUARD SHIFTED TO BOTTOM (Bypasses rendering, doesn't skip hooks) ---
  if (!data) {
    return (
      <div className="relative bg-[#020205]/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 items-center justify-center font-mono text-[10px] text-gray-500">
        Waiting for ingestion pipeline...
      </div>
    );
  }

  return (
    <div className="relative bg-[#020205]/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 select-none">
      
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 bg-black/40 z-10">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">🌿</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recon Ingestion Tree</h3>
        </div>

        {/* HUD Collapse Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => expandAll(true)}
            className="px-2 py-0.5 border border-white/5 bg-white/[0.02] hover:bg-white/10 text-gray-500 hover:text-white rounded text-[8px] font-mono transition cursor-pointer"
          >
            [📂 Expand All]
          </button>
          <button
            onClick={() => expandAll(false)}
            className="px-2 py-0.5 border border-white/5 bg-white/[0.02] hover:bg-white/10 text-gray-500 hover:text-white rounded text-[8px] font-mono transition cursor-pointer"
          >
            [📁 Collapse All]
          </button>
        </div>
      </div>

      {/* Dynamic Search Box */}
      <div className="px-4 py-2 border-b border-white/5 bg-black/20 shrink-0">
        <input
          type="text"
          placeholder="🔍 Filter Ingested Evidence..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full bg-[#080810] border border-white/10 focus:border-emerald-500/30 text-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none transition font-mono placeholder:text-gray-600"
        />
      </div>

      {/* Interactive Git-Style Directory Tree */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0 font-mono text-xs scrollbar-thin scrollbar-thumb-white/5">
        
        {/* Root Directory Host */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-emerald-400 font-bold">🎯</span>
          <span className="text-white font-bold tracking-tight text-[11px]">{target}</span>
          <span className="text-[8px] text-gray-600 uppercase font-bold tracking-wider">// ROOT ASSET</span>
        </div>

        <div className="space-y-2 pl-2 border-l border-white/5 relative">
          
          {filteredModules.map((m) => {
            if (!m) return null;
            const isFolderExpanded = expandedFolders[m.key] || filterText !== '';
            const itemsCount = m.items ? m.items.length : 0;
            const matchedItemsList = m.matchedItems || [];
            const matchedCount = matchedItemsList.length;

            // If searching, hide empty folders
            if (filterText !== '' && matchedCount === 0) return null;

            return (
              <div key={m.key} className="relative animate-fade-in">
                
                {/* Folder Item */}
                <div 
                  onClick={() => toggleFolder(m.key)}
                  className="group/folder flex items-center justify-between p-1.5 hover:bg-white/[0.02] rounded-lg border border-transparent hover:border-white/5 cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-gray-500 transition-transform duration-150 transform group-hover/folder:scale-110">
                      {isFolderExpanded ? '▼' : '▶'}
                    </span>
                    <span className="text-sm shrink-0">{m.icon}</span>
                    <span className="font-bold text-gray-200 text-[11px] truncate">{m.title}</span>
                  </div>

                  <span className="text-[8px] font-bold px-2 py-0.5 bg-white/5 border border-white/5 text-gray-400 rounded-full">
                    {filterText !== '' ? `${matchedCount}/${itemsCount}` : itemsCount} nodes
                  </span>
                </div>

                {/* Nested Leaves */}
                {isFolderExpanded && (
                  <div className="pl-6 mt-1.5 space-y-1 relative border-l border-emerald-500/10 ml-3.5 pb-1">
                    
                    {/* SVG Branch visualization mapping */}
                    {matchedItemsList.map(({ item, idx }) => {
                      const leafId = `${m.key}-${idx}`;
                      const isActive = activeItemKey === leafId;
                      const severity = getSeverity(item);

                      return (
                        <div 
                          key={leafId}
                          onClick={() => handleItemSelect(item, m.key, idx)}
                          className={`group/item flex items-center justify-between p-1 rounded-md border text-[10px] transition-all duration-150 cursor-pointer min-w-0 relative ${
                            isActive 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' 
                              : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                          }`}
                        >
                          {/* Simulated tree connector guidelines */}
                          <div className="absolute left-[-15px] top-3.5 w-3 h-[1px] bg-emerald-500/10 pointer-events-none" />

                          <div className="flex items-center gap-2 min-w-0 pr-3">
                            <span className="text-gray-600 shrink-0 select-none">├─</span>
                            <span className="truncate leading-relaxed font-semibold">{item}</span>
                          </div>

                          {/* Classification Matrix Severity badge */}
                          <span className={`px-1.5 py-0.5 rounded border text-[7px] font-bold tracking-wider shrink-0 ${severity.css}`}>
                            {severity.text}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {/* Real-Time Live Activity Log Ticker */}
      <div className="h-8 border-t border-white/5 bg-black/40 flex items-center justify-between px-4 shrink-0 pointer-events-none font-mono text-[8px] text-gray-500">
        <span>[STATUS: INTELLIGENCE RECON PIPELINE ACTIVE]</span>
        {activeItemKey && (
          <span className="text-emerald-400 animate-pulse">
            [FOCUSING EXPOSURE NODE: {activeItemKey}]
          </span>
        )}
      </div>

    </div>
  );
}