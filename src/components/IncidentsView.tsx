/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Wrench, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  UserPlus, 
  Trash2,
  CheckSquare,
  ShieldCheck,
  X
} from "lucide-react";
import { Incident } from "../types";

interface IncidentsViewProps {
  incidents: Incident[];
  onAddIncident: (incident: Omit<Incident, "id" | "date">) => void;
  onUpdateIncidentStatus: (id: string, status: "reported" | "in_progress" | "resolved", assignedTo?: string, cost?: number) => void;
  onRemoveIncident: (id: string) => void;
}

export default function IncidentsView({
  incidents,
  onAddIncident,
  onUpdateIncidentStatus,
  onRemoveIncident
}: IncidentsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form states - Add
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Incident["category"]>("other");
  const [urgency, setUrgency] = useState<Incident["urgency"]>("medium");
  const [description, setDescription] = useState("");

  // Form states - Update Status / Contractor
  const [updateStatus, setUpdateStatus] = useState<Incident["status"]>("in_progress");
  const [contractor, setContractor] = useState("");
  const [cost, setCost] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    onAddIncident({
      title,
      category,
      urgency,
      description,
      status: "reported"
    });

    // Reset Form
    setTitle("");
    setCategory("other");
    setUrgency("medium");
    setDescription("");
    setShowAddModal(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    
    onUpdateIncidentStatus(
      selectedIncident.id,
      updateStatus,
      contractor || undefined,
      cost ? Number(cost) : undefined
    );

    setSelectedIncident(null);
    setShowUpdateModal(false);
  };

  const openUpdateModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setUpdateStatus(incident.status);
    setContractor(incident.assignedTo || "");
    setCost(incident.cost ? String(incident.cost) : "");
    setShowUpdateModal(true);
  };

  // Label helpers
  const categoryLabels: Record<Incident["category"], string> = {
    elevator: "Ascenseur",
    plumbing: "Plomberie",
    electrical: "Électricité / Éclairage",
    security: "Sécurité & SAS",
    cleaning: "Entretien / Ménage",
    structure: "Gros œuvre / Façade",
    other: "Divers / Services"
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
  };

  return (
    <div id="incidents-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
      
      {/* View Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-blue-600" />
            Suivi des Incidents & Travaux
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Signalement en temps réel, dépannages techniques & devis prestataires
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Déclarer un Nouvel Incident
        </button>
      </div>

      {/* Grid listing all ongoing reports */}
      <section className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left main: Directory of ongoing alerts */}
        <div className="col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 uppercase font-mono">Alertes et Travaux de Maintenance</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {incidents.filter(i => i.status !== "resolved").length} actifs
              </span>
            </div>

            {incidents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {incidents.map((incident) => {
                  
                  // Alert colors based on priority
                  let priorityColor = "bg-slate-150 text-slate-600";
                  if (incident.urgency === "critical") priorityColor = "bg-red-100 text-red-800 font-bold border border-red-200";
                  else if (incident.urgency === "high") priorityColor = "bg-orange-100 text-orange-850 border border-orange-200";
                  else if (incident.urgency === "medium") priorityColor = "bg-amber-100 text-amber-800 border-amber-200";

                  // Status indicator icon representation
                  let statusIcon = <Clock className="w-4 h-4 text-blue-500" />;
                  if (incident.status === "in_progress") {
                    statusIcon = <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />;
                  } else if (incident.status === "resolved") {
                    statusIcon = <ShieldCheck className="w-4 h-4 text-emerald-500" />;
                  }

                  return (
                    <div key={incident.id} className="p-5 flex gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="mt-0.5">{statusIcon}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{incident.title}</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityColor}`}>
                            {incident.urgency}
                          </span>
                          <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                            {categoryLabels[incident.category] || incident.category}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-[#F8FAFC]/55 p-2 rounded">
                          {incident.description}
                        </p>
                        
                        {/* Assignment Details */}
                        <div className="flex items-center gap-6 mt-3 text-[11px] text-slate-400 font-mono">
                          <span>Date: {incident.date}</span>
                          {incident.assignedTo && (
                            <span className="flex items-center gap-1">
                              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                              Prestataire: <strong className="text-slate-600 font-sans">{incident.assignedTo}</strong>
                            </span>
                          )}
                          {incident.cost && (
                            <span>Coût: <strong className="text-slate-700">{formatCurrency(incident.cost)}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 justify-center align-middle shrink-0">
                        {incident.status !== "resolved" ? (
                          <button
                            onClick={() => openUpdateModal(incident)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded font-bold text-[10px] uppercase tracking-wider border border-blue-200 cursor-pointer text-center"
                          >
                            Dépanner / Clore
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-100 text-center flex items-center gap-1">
                            ✓ Résolu
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveIncident(incident.id)}
                          className="text-[10px] text-slate-400 hover:text-rose-600 hover:underline text-center"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-8 text-xs text-slate-400 italic text-center">Aucun incident technique référencé</p>
            )}
          </div>
        </div>

        {/* Right side: Instructions or Statistics on works */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Prestataires Partenaires</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Voici les artisans en charge des maintenances courantes souscrites par la copropriété :
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-[#F8FAFC] border border-slate-100 rounded">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Otis Ascenseurs</h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">CONTRAT ANNUEL ACTIVE</span>
                </div>
                <span className="text-xs font-mono text-slate-500">01 40 89 22 11</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#F8FAFC] border border-slate-100 rounded">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Eau de Paris</h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">URGENCE EAU ET FUITE</span>
                </div>
                <span className="text-xs font-mono text-slate-500">08 00 12 14 16</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#F8FAFC] border border-slate-100 rounded">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Sébastien Plomberie 11</h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">ARTISAN DE QUARTIER</span>
                </div>
                <span className="text-xs font-mono text-slate-500">06 88 44 22 11</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-4 leading-normal italic">
              *En cas de sinistre important (incendie, dégât des eaux généralisé), contactez en priorité l'assistance de notre assureur AXA au dossier MRI-44112.
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block font-mono">Procédure Dépannage</span>
            <p className="text-xs font-semibold text-blue-900 mt-1">L'engagement du Syndic Bénévole</p>
            <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
              Pour toute réparation supérieure à 500 €, le conseil syndical doit être impérativement consulté et au moins deux devis concurrentiels doivent être soumis au vote de la prochaine assemblée générale.
            </p>
          </div>
        </div>

      </section>

      {/* MODAL - Add Incident report */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Déclarer un nouvel incident d'immeuble
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intitulé court de la panne / anomalie</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Porte d'entrée principale ne ferme plus" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Catégorie technique</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as Incident["category"])}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="elevator">Ascenseur</option>
                    <option value="plumbing">Plomberie / Fuites</option>
                    <option value="electrical">Électricité / Ampoules</option>
                    <option value="security">Sécurité / Interphones</option>
                    <option value="cleaning">Entretien & parties</option>
                    <option value="structure">Gros œuvre / Toit / Façade</option>
                    <option value="other">Autre incident</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Niveau d'Urgence</label>
                  <select 
                    value={urgency} 
                    onChange={(e) => setUrgency(e.target.value as Incident["urgency"])}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="low">Faible priority (Confort / Esthétique)</option>
                    <option value="medium">Moyenne (Problème d'usage courant)</option>
                    <option value="high">Haute priority (Sécurité ou Fuite d'eau)</option>
                    <option value="critical">Critique (Grave danger ou Blocage total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description précise & localisation (ex: Etage, Bâtiment)</label>
                <textarea 
                  required 
                  rows={3}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ex: Le ferme-porte hydraulique de la porte d'entrée principale est désaxé, empêchant la fermeture complète. Les badges Vigik fonctionnent bien." 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none animate-fadeIn"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 bg-transparent rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow"
                >
                  Signaler l'incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Update Status / Contractor Assignment */}
      {showUpdateModal && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Mise à jour de l'incident
              </h3>
              <button onClick={() => { setShowUpdateModal(false); setSelectedIncident(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs">
                <p className="font-bold text-slate-800 leading-tight truncate">{selectedIncident.title}</p>
                <p className="text-slate-500 mt-1 leading-normal line-clamp-2">{selectedIncident.description}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avancement du traitement</label>
                <select 
                  value={updateStatus} 
                  onChange={(e) => setUpdateStatus(e.target.value as Incident["status"])}
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="reported">Signalé (En attente d'évaluation)</option>
                  <option value="in_progress">En cours (Artisan informé ou planifié)</option>
                  <option value="resolved">Résolu / Clôturé définitivement</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Artisan / Entrepreneur désigné</label>
                <input 
                  type="text" 
                  value={contractor} 
                  onChange={(e) => setContractor(e.target.value)}
                  placeholder="ex: Stéphane (Ascenseurs Otis)" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coût d'intervention TTC réel (€)</label>
                <input 
                  type="number" 
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="ex: 250" 
                  className="w-full text-xs font-mono mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowUpdateModal(false); setSelectedIncident(null); }}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 bg-transparent rounded font-sans text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider shadow"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
