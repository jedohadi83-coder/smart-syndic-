/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import CoOwnersView from "./components/CoOwnersView";
import FinancialsView from "./components/FinancialsView";
import IncidentsView from "./components/IncidentsView";
import AssembliesView from "./components/AssembliesView";
import AssistantIAView from "./components/AssistantIAView";

import { 
  initialBuildingInfo, 
  initialCoOwners, 
  initialTransactions, 
  initialIncidents, 
  initialGeneralAssemblies 
} from "./initialData";

import { BuildingInfo, CoOwner, Transaction, Incident, GeneralAssembly, Message } from "./types";
import { Search, Bell, AlertCircle, X, ShieldCheck } from "lucide-react";

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo>(initialBuildingInfo);
  const [coOwners, setCoOwners] = useState<CoOwner[]>(initialCoOwners);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [assemblies, setAssemblies] = useState<GeneralAssembly[]>(initialGeneralAssemblies);

  // Search filter at top
  const [searchQuery, setSearchQuery] = useState("");

  // System notification banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);

  // Assistant Chat States
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: "init-msg-1",
      role: "assistant",
      text: "Bonjour ! Je suis votre assistant juridique et administratif expert en copropriété (Loi de 1965). Comment puis-je vous assister dans la gestion de votre immeuble aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Quick Action Utilities
  const showBanner = (text: string, type: "success" | "warning" | "info" = "success") => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage(null);
    }, 5000);
  };

  // Coowners modification
  const handleAddCoOwner = (newCo: Omit<CoOwner, "id" | "status">) => {
    const nextId = `co-${coOwners.length + 1}`;
    const newRecord: CoOwner = {
      ...newCo,
      id: nextId,
      status: "up_to_date"
    };

    // Calculate sum of existing share. Warn if exceeding 1000 tantièmes
    const currentTotalShares = coOwners.reduce((s, c) => s + c.share, 0);
    if (currentTotalShares + newCo.share > 1000) {
      showBanner(`Attention : Le total des charges dépasse les 1000 millièmes (${currentTotalShares + newCo.share}/1000). Ajustements nécessaires.`, "warning");
    }

    setCoOwners([...coOwners, newRecord]);
    showBanner(`Le lot de ${newCo.name} a bien été enregistré avec ${newCo.share} millièmes d'allocations.`, "success");
  };

  const handleUpdateBalance = (id: string, amount: number) => {
    // Co-owner pays charges
    setCoOwners(prev => prev.map(co => {
      if (co.id === id) {
        const nextBalance = co.balance + amount;
        return {
          ...co,
          balance: nextBalance,
          status: nextBalance >= 0 ? "up_to_date" : "late"
        };
      }
      return co;
    }));

    const targetCo = coOwners.find(c => c.id === id);
    
    // Log payment in building treasury balance
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Règlement d'appels de charges — ${targetCo?.name || "Copropriétaire"}`,
      amount,
      type: "income",
      category: "other",
      supplier: "Copropriété",
      status: "paid"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBuildingInfo(prev => ({
      ...prev,
      totalCash: prev.totalCash + amount
    }));

    showBanner(`Encaissement de ${amount} € validé pour ${targetCo?.name || "le copropriétaire"}. Trésorerie mise à jour.`, "success");
  };

  const handleRemoveCoOwner = (id: string) => {
    const target = coOwners.find(c => c.id === id);
    setCoOwners(prev => prev.filter(c => c.id !== id));
    showBanner(`Suppression validée pour ${target?.name || "le lot"}.`, "info");
  };

  // Accounting Transactions
  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    const record: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`
    };

    setTransactions(prev => [record, ...prev]);

    // If paid expense, subtract from bank cash flow
    if (newTx.type === "expense" && newTx.status === "paid") {
      setBuildingInfo(prev => ({
        ...prev,
        totalCash: prev.totalCash - newTx.amount
      }));
    }

    showBanner(`La facture '${newTx.description}' de ${newTx.amount} € de charge a bien été payée et comptabilisée.`, "success");
  };

  // APPEL DE FONDS DYNAMIC PROPORTIONAL ALLOCATOR
  const handleCallForFunds = (totalAmount: number, description: string) => {
    // Generate actual charge calls for each owner proportional to their tantièmes / 1000
    setCoOwners(prev => prev.map(co => {
      const calculatedShareAmt = (totalAmount * co.share) / 1000;
      const nextBalance = co.balance - calculatedShareAmt;
      return {
        ...co,
        balance: nextBalance,
        status: nextBalance >= 0 ? "up_to_date" : "late"
      };
    }));

    // Generate matching transaction record as pending collection
    const callTx: Transaction = {
      id: `tx-call-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `${description} (${totalAmount} € répartis)`,
      amount: totalAmount,
      type: "income",
      category: "other",
      supplier: "Appel de fonds",
      status: "pending"
    };

    setTransactions(prev => [callTx, ...prev]);
    showBanner(`Appel de fonds général de ${totalAmount} € émis avec succès. Montants imputés au registre des millièmes.`, "success");
  };

  // Incident system triggers
  const handleAddIncident = (newInc: Omit<Incident, "id" | "date">) => {
    const record: Incident = {
      ...newInc,
      id: `inc-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };

    setIncidents(prev => [record, ...prev]);
    showBanner(`Le signalement '${newInc.title}' (${newInc.urgency}) a été créé et notifié au Conseil Syndical.`, "warning");
  };

  const handleUpdateIncidentStatus = (id: string, status: "reported" | "in_progress" | "resolved", assignedTo?: string, cost?: number) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status,
          assignedTo: assignedTo || inc.assignedTo,
          cost: cost || inc.cost
        };
      }
      return inc;
    }));

    // If resolved and has cost, log a paid expense transaction
    const targetInc = incidents.find(i => i.id === id);
    if (status === "resolved" && cost && cost > 0) {
      handleAddTransaction({
        date: new Date().toISOString().split("T")[0],
        description: `Facture Intervention - ${targetInc?.title || "Maintenance"}`,
        amount: cost,
        type: "expense",
        category: targetInc?.category || "other",
        supplier: assignedTo || "Artisan intervenant",
        receiptName: `FACT_${id.toUpperCase()}.pdf`,
        status: "paid"
      });
    }

    showBanner(`Statut de panne mis à jour : ${status === "resolved" ? "Résolu et clôturé" : "En cours de dépannage"}.`, "success");
  };

  const handleRemoveIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
    showBanner(`Fiche incident supprimée des registres d'immeuble.`, "info");
  };

  // General Assemblies voting and PV builders
  const handleAddAssembly = (newAg: Omit<GeneralAssembly, "id" | "pvGenerated">) => {
    const record: GeneralAssembly = {
      ...newAg,
      id: `ga-${Date.now()}`,
      pvGenerated: false
    };

    setAssemblies(prev => [record, ...prev]);
    showBanner(`Assemblée Générale convoquée pour le ${newAg.date} à ${newAg.time}. Convocations transmises de droit.`, "success");
  };

  const handleUpdateVotes = (assemblyId: string, resolutionId: string, votesFor: number, votesAgainst: number, votesAbstain: number) => {
    setAssemblies(prev => prev.map(ag => {
      if (ag.id === assemblyId) {
        const updatedResolutions = ag.resolutions.map(res => {
          if (res.id === resolutionId) {
            return {
              ...res,
              votesFor,
              votesAgainst,
              votesAbstain,
              status: votesFor > 500 ? "approved" as const : "rejected" as const
            };
          }
          return res;
        });
        return {
          ...ag,
          resolutions: updatedResolutions
        };
      }
      return ag;
    }));
    showBanner("Scrutin de tantièmes enregistré avec succès pour la résolution.", "success");
  };

  const handleGeneratePV = (id: string) => {
    setAssemblies(prev => prev.map(ag => {
      if (ag.id === id) {
        return {
          ...ag,
          pvGenerated: true
        };
      }
      return ag;
    }));
    showBanner("Le Procès-Verbal certifié d'AG est généré et signé par le Syndic Secrétaire.", "success");
  };

  const handleTriggerSingleReminder = (owner: CoOwner) => {
    showBanner(`La notification amiable de mise en demeure syndicale de réclamer ${Math.abs(owner.balance)} € a été envoyée par courriel certifié à ${owner.email}.`, "success");
  };

  // Bulk automated dunning simulation
  const handleSendBulkReminders = () => {
    const lateCoowners = coOwners.filter(c => c.balance < 0);
    if (lateCoowners.length === 0) {
      showBanner("Aucun copropriétaire débiteur n'a été identifié. Solde d'immeuble à jour !", "info");
      return;
    }

    showBanner(`${lateCoowners.length} relances amiables par mail intégrant un décompte de charges précis ont été notifiées automatiquement sous pavé réglementaire.`, "success");
  };

  // Server-side AI assistant proxy integration with Express backend proxying to Gemini
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          chatHistory: chatHistory.map(m => ({ role: m.role, text: m.text })),
          systemInstruction: `Vous êtes CoAssistant, un conseiller de syndic d'immeuble expert en droit de la copropriété immobilière en France (loi du 10 juillet 1965, décret de 1967, lois Alur et Elan).
          Vous répondez de façon précise, technique mais avec pédagogie. Vous aidez le syndic bénévole à rédiger des courriers juridiques, comprendre les quotes-part d'interventions, ou résoudre de petits litiges de voisinage d'allée. L'immeuble de référence est '${buildingInfo.name}' situé '${buildingInfo.address}' avec 24 lots.`
        })
      });

      const data = await response.json();
      
      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: data.text || "Désolé, je n'ai pas pu obtenir de réponse.",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory(prev => [...prev, botMsg]);
    } catch (e: any) {
      console.error(e);
      // Fallback response with beautiful simulated counseling
      setTimeout(() => {
        const botFallback: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          text: `[Simulation Locale CoAssistant]\n\nJe réponds à votre demande concernant la copropriété de l'immeuble '${buildingInfo.name}'.\n\nPour mener à bien vos tâches, veillez à bien vérifier les majorités de votes adaptées d'article 24 ou 25 lors de la tenue de l'AG.\n\n(Note d'AI Studio : Configurez la clé GEMINI_API_KEY dans votre panneau Secrets pour activer les réponses de l'IA vivante en temps réel !)`,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        };
        setChatHistory(prev => [...prev, botFallback]);
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        id: "init-msg-2",
        role: "assistant",
        text: "Fil de l'assistant IA réinitialisé. Je me tiens prêt pour toute nouvelle sollicitation sur la loi de 1965 !",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const unpaidTotal = Math.abs(coOwners.filter(c => c.balance < 0).reduce((sum, c) => sum + c.balance, 0));
  const activeIncidentsCount = incidents.filter(i => i.status !== "resolved").length;

  return (
    <div id="saas-syndic-container" className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR (Slate 900 colors matching the High Density specifications) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
        }} 
        buildingInfo={buildingInfo}
        unpaidTotal={unpaidTotal}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* CORE WORKSPACE PANEL */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* PREMIUM TOP BAR MODULE (High contrast white, with search and profile layout) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-mono">
              {activeTab === "dashboard" && "Console Tableau de bord"}
              {activeTab === "coowners" && "Registre des Lots & Saisie d'Encaissements"}
              {activeTab === "financials" && "Comptabilité Syndic & Appels"}
              {activeTab === "incidents" && "Incidents techniques & Maintenance"}
              {activeTab === "assemblies" && "Assemblées Générales & Scrutins"}
              {activeTab === "assistant" && "Conseil Expert de copropriété (Gemini AI)"}
            </h1>
            <div className="h-4 w-[1px] bg-slate-350"></div>
            <div className="text-xs text-slate-550 font-mono font-medium">Paris, {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Quick search input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Chercher un lot, proprio..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-8 pr-3.5 py-1.5 bg-slate-100 text-slate-800 placeholder-slate-400 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded text-xs outline-none transition-all font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Notification alert sphere bell */}
            <button className="p-2 text-slate-400 hover:text-slate-650 relative cursor-pointer outline-none">
              <Bell className="w-5 h-5" />
              {activeIncidentsCount > 0 && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              )}
            </button>
          </div>
        </header>

        {/* NOTIFICATION TOP BANNER */}
        {bannerMessage && (
          <div className={`p-3 border-b flex items-center justify-between text-xs font-semibold px-8 animate-slideDown ${
            bannerMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" :
            bannerMessage.type === "warning" ? "bg-red-50 text-red-800 border-red-100" :
            "bg-blue-50 text-blue-800 border-blue-100"
          }`}>
            <div className="flex items-center gap-2">
              {bannerMessage.type === "success" ? (
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4.5 h-4.5" />
              )}
              <span>{bannerMessage.text}</span>
            </div>
            <button onClick={() => setBannerMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WORKSPACE VIEW RENDERING SWITCH */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeTab === "dashboard" && (
            <DashboardView 
              buildingInfo={buildingInfo}
              coOwners={coOwners}
              transactions={transactions}
              incidents={incidents}
              generalAssemblies={assemblies}
              onNavigate={(tabId) => setActiveTab(tabId)}
              onSendBulkReminders={handleSendBulkReminders}
            />
          )}

          {activeTab === "coowners" && (
            <CoOwnersView 
              coOwners={searchQuery ? coOwners.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.lotNumber.toLowerCase().includes(searchQuery.toLowerCase())) : coOwners}
              onAddCoOwner={handleAddCoOwner}
              onUpdateBalance={handleUpdateBalance}
              onRemoveCoOwner={handleRemoveCoOwner}
              onTriggerSingleReminder={handleTriggerSingleReminder}
            />
          )}

          {activeTab === "financials" && (
            <FinancialsView 
              buildingInfo={buildingInfo}
              coOwners={coOwners}
              transactions={searchQuery ? transactions.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.supplier?.toLowerCase().includes(searchQuery.toLowerCase())) : transactions}
              onAddTransaction={handleAddTransaction}
              onCallForFunds={handleCallForFunds}
            />
          )}

          {activeTab === "incidents" && (
            <IncidentsView 
              incidents={searchQuery ? incidents.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase())) : incidents}
              onAddIncident={handleAddIncident}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onRemoveIncident={handleRemoveIncident}
            />
          )}

          {activeTab === "assemblies" && (
            <AssembliesView 
              assemblies={assemblies}
              onAddAssembly={handleAddAssembly}
              onUpdateVotes={handleUpdateVotes}
              onGeneratePV={handleGeneratePV}
            />
          )}

          {activeTab === "assistant" && (
            <AssistantIAView 
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isAiLoading}
            />
          )}

        </div>

        {/* CORE STATUS FOOTER BAR */}
        <footer className="h-8 bg-white border-t border-slate-205 flex items-center justify-between px-8 text-[9px] text-slate-400 shrink-0 uppercase tracking-widest font-mono select-none">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Serveur SaaS : Opérationnel
            </span>
            <span>Dernière synchro bancaire : À l'instant</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600">Support Copropriétaires active</span>
            <span className="text-slate-350">•</span>
            <span>CoSyndic Premium v2.4.12</span>
          </div>
        </footer>

      </main>

    </div>
  );
}
