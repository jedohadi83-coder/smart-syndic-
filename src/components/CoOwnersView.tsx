/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Trash2,
  X,
  Send,
  Download,
  AlertTriangle,
  BadgeCent
} from "lucide-react";
import { CoOwner } from "../types";

interface CoOwnersViewProps {
  coOwners: CoOwner[];
  onAddCoOwner: (coOwner: Omit<CoOwner, "id" | "status">) => void;
  onUpdateBalance: (id: string, amount: number) => void;
  onRemoveCoOwner: (id: string) => void;
  onTriggerSingleReminder: (coOwner: CoOwner) => void;
}

export default function CoOwnersView({
  coOwners,
  onAddCoOwner,
  onUpdateBalance,
  onRemoveCoOwner,
  onTriggerSingleReminder
}: CoOwnersViewProps) {
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDunningModal, setShowDunningModal] = useState(false);
  const [selectedCoOwner, setSelectedCoOwner] = useState<CoOwner | null>(null);

  // Form states - Add
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLot, setNewLot] = useState("");
  const [newShare, setNewShare] = useState(100);

  // Form states - Payment
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("virement");

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newLot || !newShare) return;
    onAddCoOwner({
      name: newName,
      email: newEmail,
      phone: newPhone || "Non renseigné",
      lotNumber: newLot,
      share: Number(newShare),
      balance: 0,
      avatar: newName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    });
    // Reset
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewLot("");
    setNewShare(100);
    setShowAddModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoOwner || !payAmount) return;
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    onUpdateBalance(selectedCoOwner.id, amountNum);
    setPayAmount("");
    setShowPayModal(false);
    setSelectedCoOwner(null);
  };

  const openPaymentModal = (coOwner: CoOwner) => {
    setSelectedCoOwner(coOwner);
    setShowPayModal(true);
  };

  const openDunningModal = (coOwner: CoOwner) => {
    setSelectedCoOwner(coOwner);
    setShowDunningModal(true);
  };

  const triggerReminder = () => {
    if (!selectedCoOwner) return;
    onTriggerSingleReminder(selectedCoOwner);
    setShowDunningModal(false);
    setSelectedCoOwner(null);
  };

  return (
    <div id="coowners-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600" />
            Registre des Copropriétaires
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Charges, tantièmes de copropriété & relances de paiement
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Lot / Propriétaire
        </button>
      </div>

      {/* Main registry list - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Copropriétaire</th>
                <th className="px-6 py-4 border-b border-slate-200">Contact</th>
                <th className="px-6 py-4 border-b border-slate-200">Lots & Affectations</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Part (Millièmes)</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Balance Financière</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Statut</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {coOwners.map((owner) => {
                const isLate = owner.balance < 0;
                const isPrepaid = owner.balance > 0;
                
                let balanceColor = "text-slate-700 font-medium";
                let rowBg = "hover:bg-slate-50/50";
                
                if (isLate) {
                  balanceColor = "text-rose-600 font-bold font-mono";
                  rowBg = owner.balance <= -1000 ? "bg-red-50/20 hover:bg-red-50/40" : "hover:bg-slate-50/50";
                } else if (isPrepaid) {
                  balanceColor = "text-emerald-600 font-mono font-semibold";
                }

                return (
                  <tr key={owner.id} className={`${rowBg} transition-colors`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-bold flex items-center justify-center text-xs">
                          {owner.avatar || owner.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{owner.name}</div>
                          <span className="text-[9px] text-slate-400 font-mono">ID: {owner.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-0.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{owner.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium">{owner.lotNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-slate-700">
                      {owner.share} / 1000
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <span className={balanceColor}>
                        {isPrepaid ? "+" : ""}
                        {formatCurrency(owner.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {owner.balance === 0 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wider">à jour</span>
                      )}
                      {owner.balance > 0 && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 justify-center max-w-[120px] mx-auto">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Créditeur
                        </span>
                      )}
                      {owner.balance < 0 && owner.balance > -1000 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 justify-center max-w-[120px] mx-auto animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" /> Relance T1
                        </span>
                      )}
                      {owner.balance <= -1000 && (
                        <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 justify-center max-w-[120px] mx-auto animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> Contentieux
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openPaymentModal(owner)}
                          title="Enregistrer un encaissement"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold text-[10px] uppercase tracking-wider border border-emerald-200 flex items-center gap-1 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Encaisser
                        </button>

                        {isLate && (
                          <button
                            onClick={() => openDunningModal(owner)}
                            title="Générer mise en demeure et mail"
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded font-bold text-[10px] uppercase tracking-wider border border-amber-200 flex items-center gap-1 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Relancer
                          </button>
                        )}

                        <button
                          onClick={() => onRemoveCoOwner(owner.id)}
                          title="Supprimer"
                          className="p-1 px-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Add Coowner */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Nouveau Copropriétaire & Lot
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nom complet</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Marc Vanhoutte" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ex: marc@gmail.com" 
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Téléphone</label>
                  <input 
                    type="text" 
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="ex: 06 11 22 33 44" 
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description des Lots (Appartement, Cave...)</label>
                <input 
                  type="text" 
                  required 
                  value={newLot} 
                  onChange={(e) => setNewLot(e.target.value)}
                  placeholder="ex: Lots 8, 14 - 3è étage Gauche / Parking 3" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tantièmes / Millièmes de Charges (sur 1000)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  max="1000"
                  value={newShare} 
                  onChange={(e) => setNewShare(Number(e.target.value))}
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                />
                <span className="text-[9px] text-slate-400 mt-1 block">Sert à répartir automatiquement les appels de fonds de l'immeuble.</span>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow"
                >
                  Créer le co-propriétaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Record payment (Encaisser) */}
      {showPayModal && selectedCoOwner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Enregistrer un paiement reçut
              </h3>
              <button onClick={() => { setShowPayModal(false); setSelectedCoOwner(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  {selectedCoOwner.avatar || "SL"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-850 leading-tight">{selectedCoOwner.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Solde actuel: {formatCurrency(selectedCoOwner.balance)}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Montant reçu (€)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  step="0.01"
                  value={payAmount} 
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="ex: 350.00" 
                  className="w-full text-xs font-mono mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Moyen de règlement</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="virement">Virement bancaire (Recommandé SEP)</option>
                  <option value="cheque">Chèque bancaire</option>
                  <option value="especes">Espèces</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowPayModal(false); setSelectedCoOwner(null); }}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow"
                >
                  Valider l'encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Dunning / Relance simulation */}
      {showDunningModal && selectedCoOwner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Aperçu de la Relance amiable syndic
              </h3>
              <button onClick={() => { setShowDunningModal(false); setSelectedCoOwner(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                L'outil simule la génération automatisée d'une relance réglementaire (Loi de 1965). Voici le modèle rédigé qui sera envoyé par mail et mis à disposition dans son espace :
              </p>

              {/* Legal Email Preview Pane */}
              <div className="border border-slate-200 rounded p-4 bg-slate-50 max-h-[300px] overflow-y-auto text-xs font-serif leading-relaxed text-slate-800">
                <div className="font-sans font-bold pb-2 border-b border-slate-250 mb-3 text-slate-500">
                  De: <span className="text-slate-800 uppercase font-serif">Mairie / Syndic de l'immeuble Belvédère Parmentier</span><br/>
                  À: <span className="text-slate-850 font-semibold">{selectedCoOwner.email}</span><br/>
                  Objet: <span className="text-rose-700 font-semibold">Relance pour syndic - Solde de charges Impayé - {selectedCoOwner.lotNumber}</span>
                </div>
                
                <p>Madame, Monsieur {selectedCoOwner.name.split(" ").slice(-1)[0]},</p>
                <p className="mt-2">
                  Sauf erreur ou omission de notre part, votre compte de copropriétaire pour le lot <strong>{selectedCoOwner.lotNumber}</strong> fait apparaître un solde débiteur de <strong>{formatCurrency(Math.abs(selectedCoOwner.balance))}</strong>, correspondant aux appels de fonds trimestriels pour l'exercice en cours.
                </p>
                <p className="mt-2">
                  Nous vous rappelons que l'article 35 du décret du 17 mars 1967 oblige les copropriétaires à s'acquitter des provisions de charges communes auprès du Syndic de l'immeuble.
                </p>
                <p className="mt-2">
                  Nous vous invitons à procéder au règlement de cette somme dans les meilleurs délais par virement sur le compte bancaire de la copropriété.
                </p>
                <p className="mt-3">
                  Nous vous remercions pour votre collaboration active.
                </p>
                <div className="mt-4 pt-2 text-[10px] font-sans border-t border-slate-100 text-slate-400">
                  Généré technologiquement via CoSyndic l'outil de gestion des copropriétés.
                </div>
              </div>

              <div className="flex gap-2 justify-between items-center pt-2">
                <div className="text-[10px] text-slate-400 italic">
                  *Un email réel simulé sera notifié en arrière-plan.
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowDunningModal(false); setSelectedCoOwner(null); }}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                  <button 
                    type="button" 
                    onClick={triggerReminder}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Confirmer l'envoi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
