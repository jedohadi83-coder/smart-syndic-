/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Calendar, 
  DollarSign, 
  User, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Percent,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";
import { BuildingInfo, CoOwner, Transaction, CategoryType } from "../types";

interface FinancialsViewProps {
  buildingInfo: BuildingInfo;
  coOwners: CoOwner[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
  onCallForFunds: (totalAmount: number, description: string) => void;
}

export default function FinancialsView({
  buildingInfo,
  coOwners,
  transactions,
  onAddTransaction,
  onCallForFunds
}: FinancialsViewProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Form states - Expense
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<CategoryType>("works");
  const [expSupplier, setExpSupplier] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  // Form states - Call for funds
  const [callAmount, setCallAmount] = useState("5000");
  const [callDesc, setCallDesc] = useState("Appel de charges - Provision Trimestre 3 2026");

  // Sums
  const totalIncomes = transactions.filter(t => t.type === "income" && t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense" && t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    
    onAddTransaction({
      date: expDate,
      description: expTitle,
      amount: Number(expAmount),
      type: "expense",
      category: expCategory,
      supplier: expSupplier || "Divers",
      receiptName: expTitle.toUpperCase().replace(/\s+/g, "_") + "_FACTURE.pdf",
      status: "paid"
    });

    setExpTitle("");
    setExpAmount("");
    setExpSupplier("");
    setShowAddExpense(false);
  };

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callAmount) return;
    const amountNum = Number(callAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onCallForFunds(amountNum, callDesc);
    setShowCallModal(false);
  };

  // Co-ownership call simulator distribution calculations
  const simulatedDistribution = coOwners.map(co => ({
    name: co.name,
    share: co.share,
    calculatedContribution: (Number(callAmount || 0) * co.share) / 1000,
  }));

  const categoryLabels: Record<CategoryType, string> = {
    water: "Eau froide/chaude",
    electricity: "Électricité d'allée",
    elevator: "Maintenance ascenseur",
    insurance: "Assurance immeuble",
    cleaning: "Entretien des parties",
    works: "Travaux ALUR / Réparations",
    other: "Frais de gestion / Divers",
  };

  return (
    <div id="financials-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
      
      {/* View Header with stats */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-blue-600" />
            Comptabilité & Charges Courantes
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Balance Générale de l'immeuble, appels de fonds ALUR & factures fournisseurs
          </p>
        </div>
        
        {/* Quick action triggers */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setShowCallModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all duration-150"
          >
            <Percent className="w-4 h-4" />
            Lancer un appel de fonds
          </button>
          
          <button 
            onClick={() => setShowAddExpense(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Enregistrer une facture de charge
          </button>
        </div>
      </div>

      {/* Visual financial health widget panel */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        
        {/* Total cashflow check */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Trésorerie Actuelle</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 font-mono">
            {formatCurrency(buildingInfo.totalCash + buildingInfo.reserveFund)}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">Réel: {formatCurrency(buildingInfo.totalCash)}</span>
            <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono font-medium">Alur: {formatCurrency(buildingInfo.reserveFund)}</span>
          </div>
        </div>

        {/* Total calls paid this year */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Encaissé (Recettes)</span>
          <div className="mt-2 text-3xl font-bold text-emerald-600 font-mono flex items-center gap-1">
            <TrendingUp className="w-5 h-5 shrink-0" />
            {formatCurrency(totalIncomes)}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Somme des trimestres encaissés</p>
        </div>

        {/* Expenses paid */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Dépenses Acquittées</span>
          <div className="mt-2 text-3xl font-bold text-rose-600 font-mono flex items-center gap-1">
            <TrendingDown className="w-5 h-5 shrink-0" />
            {formatCurrency(totalExpenses)}
          </div>
          {totalPending > 0 && (
            <p className="text-[10px] text-amber-600 mt-2 font-mono font-semibold">
              En attente d'approbation : {formatCurrency(totalPending)}
            </p>
          )}
        </div>

      </div>

      {/* Main ledger list */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide font-mono">Mouvements de Trésorerie & Factures</h3>
          <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-medium">Bilan Réel</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 border-b border-slate-200">Date</th>
                <th className="px-6 py-3.5 border-b border-slate-200">Fournisseur / Débiteur</th>
                <th className="px-6 py-3.5 border-b border-slate-200">Catégorie de Charge</th>
                <th className="px-6 py-3.5 border-b border-slate-200">Description et Pièce Jointe</th>
                <th className="px-6 py-3.5 border-b border-slate-200 text-center">Statut</th>
                <th className="px-6 py-3.5 border-b border-slate-200 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isExpense = tx.type === "expense";
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{tx.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {tx.supplier || "Copropriétaires"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-600 uppercase font-semibold">
                        {categoryLabels[tx.category] || tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      {tx.receiptName && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:underline mt-1 bg-blue-50/40 border border-blue-100 px-1.5 py-0.5 rounded cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          {tx.receiptName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                        tx.status === "paid" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {tx.status === "paid" ? "Payé" : "En Attente d'Envoi"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      <span className={isExpense ? "text-rose-600" : "text-emerald-600"}>
                        {isExpense ? "-" : "+"} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Add Expense Invoice Form */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                Enregistrer une dépense d'immeuble
              </h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intitulé de la dépense / Facture</label>
                <input 
                  type="text" 
                  required 
                  value={expTitle} 
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="ex: Contrat Nettoyage Trimestre 2" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Montant Facturé TTC (€)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="0.01"
                    value={expAmount} 
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="ex: 450" 
                    className="w-full text-xs font-mono mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fournisseur</label>
                  <input 
                    type="text" 
                    value={expSupplier} 
                    onChange={(e) => setExpSupplier(e.target.value)}
                    placeholder="ex: ProNet SA" 
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Catégorie comptable</label>
                  <select 
                    value={expCategory} 
                    onChange={(e) => setExpCategory(e.target.value as CategoryType)}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="water">Eau froide / chaude</option>
                    <option value="electricity">Électricité d'allée</option>
                    <option value="elevator">Maintenance ascenseur</option>
                    <option value="insurance">Assurance multirisques</option>
                    <option value="cleaning">Nettoyage & parties communes</option>
                    <option value="works">Travaux d'immeubles</option>
                    <option value="other">Diagnostics & Divers</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Date de facturation</label>
                  <input 
                    type="date" 
                    required 
                    value={expDate} 
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 bg-slate-50 rounded border border-dashed border-slate-200 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-slate-600">Simuler l'import de pièce PDF jointe</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Le fichier sera nommé : {expTitle ? expTitle.toUpperCase().replace(/\s+/g, "_") + "_FACTURE.pdf" : "votre_piece.pdf"}</p>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 bg-transparent rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow"
                >
                  Enregistrer et Payer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Call for funds distribution simulator (The gem of this tab!) */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center animate-fadeIn">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Percent className="w-4 h-4 text-emerald-600 animate-pulse" />
                Lancer un appel de provision charges
              </h3>
              <button onClick={() => setShowCallModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCallSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Vous allez émettre un appel de fonds global. L'application calcule automatiquement la répartition exacte pour chaque copropriétaire conformément à ses tantièmes/millièmes de quote-part, décrémente leur solde et génère l'écriture comptable.
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Provision Budgétaire Commune (€)</label>
                <input 
                  type="number" 
                  required 
                  min="100"
                  value={callAmount} 
                  onChange={(e) => setCallAmount(e.target.value)}
                  placeholder="ex: 5000" 
                  className="w-full text-xs font-mono font-bold text-emerald-600 mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description pour l'appel de fonds</label>
                <input 
                  type="text" 
                  required 
                  value={callDesc} 
                  onChange={(e) => setCallDesc(e.target.value)}
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Dynamic simulation distribution list */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Simulateur de clé de répartition</label>
                <div className="border border-slate-100 rounded bg-slate-50 p-2.5 max-h-[170px] overflow-y-auto space-y-2">
                  {simulatedDistribution.map((sim, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-slate-700 bg-white p-1.5 border border-slate-100 rounded">
                      <span className="font-semibold">{sim.name}</span>
                      <div className="flex gap-4 font-mono font-medium text-slate-500 text-[11px]">
                        <span>Part: {sim.share}/1000</span>
                        <span className="text-slate-800 font-bold">{formatCurrency(sim.calculatedContribution)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end bg-slate-50 p-3 -mx-5 -mb-5 border-t border-slate-150">
                <button 
                  type="button" 
                  onClick={() => setShowCallModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 bg-white rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Émettre l'appel de fonds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
