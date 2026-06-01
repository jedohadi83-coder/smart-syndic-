/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Building, 
  Users, 
  Wallet, 
  Gavel, 
  Wrench, 
  MessageSquare, 
  Sparkles,
  AlertTriangle,
  LayoutDashboard
} from "lucide-react";
import { BuildingInfo } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  buildingInfo: BuildingInfo;
  unpaidTotal: number;
  activeIncidentsCount: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  buildingInfo, 
  unpaidTotal, 
  activeIncidentsCount 
}: SidebarProps) {
  
  const categories = [
    {
      title: "Gestion",
      items: [
        { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
        { id: "coowners", label: "Copropriétaires", icon: Users },
        { id: "financials", label: "Comptabilité & Charges", icon: Wallet },
      ]
    },
    {
      title: "Opérations",
      items: [
        { id: "incidents", label: "Suivi des Incidents", icon: Wrench, badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined },
        { id: "assemblies", label: "Assemblées Générales", icon: Gavel },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { id: "assistant", label: "Assistant IA Copro", icon: MessageSquare, highlighted: true },
      ]
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <aside id="sidebar-container" className="w-64 bg-[#0F172A] text-slate-400 flex flex-col shrink-0 border-r border-slate-800 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
        <div className="flex flex-col">
          <span className="text-white font-semibold tracking-tight text-sm flex items-center gap-1.5 leading-none">
            SyndicFlow <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-normal font-mono scale-90">PRO</span>
          </span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5 leading-none uppercase tracking-widest">SaaS Copropriété</span>
        </div>
      </div>

      {/* Building Summary Card - High Density style */}
      <div className="px-4 pt-4 shrink-0">
        <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-lg">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Copropriété Active</span>
          <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{buildingInfo.name}</p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{buildingInfo.address}</p>
          
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-[10px]">
            <div>
              <span className="text-[9px] text-slate-500 block">Banque</span>
              <span className="font-semibold text-slate-300 font-mono">{formatCurrency(buildingInfo.totalCash)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Travaux s/Alur</span>
              <span className="font-semibold text-slate-300 font-mono">{formatCurrency(buildingInfo.reserveFund)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav id="sidebar-menu" className="flex-1 px-3 py-4 space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
              {cat.title}
            </span>
            {cat.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-xs font-medium transition-all duration-150 outline-none ${
                    isActive 
                      ? "bg-blue-600 text-white font-semibold" 
                      : item.highlighted 
                        ? "text-emerald-400 hover:bg-slate-800 border border-emerald-500/20 hover:border-emerald-500/40" 
                        : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? "text-white" 
                      : item.highlighted 
                        ? "text-emerald-400" 
                        : "text-slate-400"
                  }`} />
                  
                  <span className="flex-1 truncate">{item.label}</span>
                  
                  {item.highlighted && (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                  )}

                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Warning Box */}
      {unpaidTotal > 0 && (
        <div className="mx-4 mb-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex gap-2 items-start shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-red-300 block">Impayés</span>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">
              <span className="font-mono text-red-300 font-semibold">{formatCurrency(unpaidTotal)}</span> de charges à recouvrer.
            </p>
            <button 
              onClick={() => setActiveTab("coowners")}
              className="text-[9px] font-bold text-red-300 hover:text-red-200 uppercase tracking-wider block mt-1.5 hover:underline"
            >
              Relancer →
            </button>
          </div>
        </div>
      )}

      {/* User info at Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-[#0B111E] shrink-0">
        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
          SB
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-white font-medium truncate">Syndic Bénévole</div>
          <div className="text-[9px] text-slate-500 font-mono truncate">142avparmentier@copro.fr</div>
        </div>
      </div>
    </aside>
  );
}
