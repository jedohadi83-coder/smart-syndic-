/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Gavel, 
  Plus, 
  CheckSquare, 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  Vote, 
  Archive, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  TrendingUp,
  Download,
  ClipboardList,
  AlertCircle,
  X
} from "lucide-react";
import { GeneralAssembly, Resolution } from "../types";

interface AssembliesViewProps {
  assemblies: GeneralAssembly[];
  onAddAssembly: (assembly: Omit<GeneralAssembly, "id" | "pvGenerated">) => void;
  onUpdateVotes: (assemblyId: string, resolutionId: string, votesFor: number, votesAgainst: number, votesAbstain: number) => void;
  onGeneratePV: (assemblyId: string) => void;
}

export default function AssembliesView({
  assemblies,
  onAddAssembly,
  onUpdateVotes,
  onGeneratePV
}: AssembliesViewProps) {
  
  const [selectedAssembly, setSelectedAssembly] = useState<GeneralAssembly | null>(assemblies[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeVoteResolution, setActiveVoteResolution] = useState<Resolution | null>(null);

  // Form states - Add assembly
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [agendaInput, setAgendaInput] = useState("");
  const [resTitle1, setResTitle1] = useState("");
  const [resDesc1, setResDesc1] = useState("");

  // Form states - Quick vote simulation
  const [pvContent, setPVContent] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const agenda = agendaInput ? agendaInput.split("\n").filter(Boolean) : [
      "Approbation des comptes.",
      "Renouvellement du syndic."
    ];

    const resolutions: Resolution[] = [];
    if (resTitle1) {
      resolutions.push({
        id: `res-${Date.now()}-1`,
        title: resTitle1,
        description: resDesc1 || "Mise aux voix réglementaire.",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: "pending"
      });
    }

    onAddAssembly({
      title,
      date,
      time,
      location: location || "Salle de réunion / Visioconférence",
      status: "scheduled",
      agenda,
      resolutions
    });

    // Reset Form
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setAgendaInput("");
    setResTitle1("");
    setResDesc1("");
    setShowAddModal(false);
  };

  const handleSimulateVote = (assemblyId: string, resolution: Resolution) => {
    // Generate organic, realistic distribution of millièmes voting out of 1000
    // e.g. 520 For, 210 Against, 270 Abstain
    const vFor = Math.floor(Math.random() * 300) + 400; // 400 - 700
    const remaining = 1000 - vFor;
    const vAgainst = Math.floor(Math.random() * (remaining * 0.7));
    const vAbstain = 1000 - vFor - vAgainst;

    onUpdateVotes(assemblyId, resolution.id, vFor, vAgainst, vAbstain);
    
    // Auto-update if selected
    if (selectedAssembly) {
      const updatedResolutions = selectedAssembly.resolutions.map(r => {
        if (r.id === resolution.id) {
          return {
            ...r,
            votesFor: vFor,
            votesAgainst: vAgainst,
            votesAbstain: vAbstain,
            status: vFor > 500 ? "approved" as const : "rejected" as const
          };
        }
        return r;
      });
      setSelectedAssembly({
        ...selectedAssembly,
        resolutions: updatedResolutions
      });
    }
  };

  const handleGenerateMinutes = (assembly: GeneralAssembly) => {
    onGeneratePV(assembly.id);
    
    // Mark as generated
    if (selectedAssembly && selectedAssembly.id === assembly.id) {
      setSelectedAssembly({
        ...selectedAssembly,
        pvGenerated: true
      });
    }

    // Build elegant visual PV text in French
    const dateFormatted = new Date(assembly.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    let minutes = `PROCÈS-VERBAL D'ASSEMBLÉE GÉNÉRALE DES COPROPRIÉTAIRES\n`;
    minutes += `=========================================================\n\n`;
    minutes += `Immeuble : Le Belvédère Parmentier\n`;
    minutes += `Adresse : 142 Avenue Parmentier, 75011 Paris\n`;
    minutes += `Date : ${dateFormatted} à ${assembly.time}\n`;
    minutes += `Lieu de la réunion : ${assembly.location}\n\n`;
    minutes += `Présidence de séance : Syndic Bénévole\n\n`;
    minutes += `ORDRE DU JOUR TRAITÉ :\n`;
    assembly.agenda.forEach((item, idx) => {
      minutes += `   ${idx + 1}. ${item}\n`;
    });
    minutes += `\n---------------------------------------------------------\n\n`;
    minutes += `RÉSOLUTIONS VOTÉES & RÉSULTATS :\n\n`;
    
    assembly.resolutions.forEach((res, index) => {
      const approved = res.votesFor > 500;
      minutes += `Resolution n°${index + 1} : ${res.title}\n`;
      minutes += `   Description : ${res.description}\n`;
      minutes += `   Résultats des votes (en tantièmes / 1000) :\n`;
      minutes += `      - POUR : ${res.votesFor || "Brouillon"} tantièmes\n`;
      minutes += `      - CONTRE : ${res.votesAgainst || "Brouillon"} tantièmes\n`;
      minutes += `      - ABSTENTION : ${res.votesAbstain || "Brouillon"} tantièmes\n`;
      minutes += `   Décision de l'Assemblée : [${approved ? "ADOPTÉE À LA MAJORITÉ ABSOLUE" : "REJETÉE"}]\n\n`;
    });

    minutes += `\nPlus aucun sujet n'étant à l'ordre du jour, la séance est levée.\n`;
    minutes += `Le Procès-Verbal est certifié conforme et signé par le secrétaire.\n`;
    minutes += `Fait à Paris, le ${new Date().toLocaleDateString("fr-FR")}.`;

    setPVContent(minutes);
  };

  return (
    <div id="assemblies-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
      
      {/* View Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Gavel className="w-5 h-5 text-blue-600" />
            Votations & Assemblées Générales
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Convocations conformes, scrutin par tantièmes & procès-verbaux d'AG
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Convoquer une AG
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Side: List of Convocations */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 font-mono">Historique des AG</h3>
            
            <div className="space-y-3">
              {assemblies.map((ag) => {
                const isActive = selectedAssembly?.id === ag.id;
                return (
                  <button
                    key={ag.id}
                    onClick={() => { setSelectedAssembly(ag); setPVContent(null); }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3 outline-none ${
                      isActive 
                        ? "bg-blue-50/50 border-blue-400 text-slate-900 font-semibold shadow-sm" 
                        : "bg-transparent border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="p-1.5 rounded bg-white border border-slate-200 shrink-0 text-slate-400">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold leading-normal truncate">{ag.title}</h4>
                      <div className="flex gap-2 items-center text-[10px] text-slate-400 mt-1 font-mono">
                        <span>{ag.date}</span>
                        <span>•</span>
                        <span className="capitalize">{ag.status === "scheduled" ? "Prévue" : "Clôturée"}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0F172A] text-slate-300 p-4 rounded-lg">
            <h3 className="text-xs text-white font-bold uppercase tracking-wider font-mono mb-2">Notice de scrutin</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Conformément à la Loi du 10 juillet 1965, chaque propriétaire vote au prorata de ses tantièmes de charges courantes (millièmes). Pour être approuvée à la majorité absolue de l'article 25, une résolution doit réunir au moins <strong>501 voix "POUR"</strong>.
            </p>
          </div>
        </div>

        {/* Right Side: Detailed AG focus screen */}
        <div className="col-span-8 space-y-6">
          {selectedAssembly ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              
              {/* Meeting meta banner */}
              <div className="p-6 bg-slate-50/60 border-b border-slate-200">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-[9px] tracking-widest font-mono">
                  <Vote className="w-3.5 h-3.5" />
                  <span>Dossier Assemblée Générale</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedAssembly.title}</h2>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Prévue le : {selectedAssembly.date} à {selectedAssembly.time}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded truncate">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedAssembly.location}</span>
                  </div>
                </div>
              </div>

              {/* Agenda of items */}
              <div className="p-6 border-b border-slate-205">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">Ordre du Jour Rédigé</h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                  {selectedAssembly.agenda.map((item, id) => (
                    <li key={id} className="leading-relaxed font-sans">{item}</li>
                  ))}
                </ol>
              </div>

              {/* Resolutions table with voting trigger */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Résolutions Soumises au vote</h3>
                  <span className="text-[10px] text-slate-400 italic">Clics sur les boutons pour simuler le scrutin</span>
                </div>

                <div className="space-y-4">
                  {selectedAssembly.resolutions.map((res) => {
                    const hasVotes = res.votesFor > 0 || res.votesAgainst > 0;
                    const isApproved = res.votesFor > 500;
                    
                    return (
                      <div key={res.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-1">{res.description}</p>
                          </div>
                          
                          {/* Live decision icon */}
                          {hasVotes && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}>
                              {isApproved ? "Adoptée article 25" : "Rejetée"}
                            </span>
                          )}
                        </div>

                        {/* Votes score or simulation bar */}
                        <div className="mt-4 pt-3.5 border-t border-slate-200 flex justify-between items-center gap-6">
                          <div className="flex gap-4 text-[11px] font-mono font-medium">
                            <span className="flex items-center gap-1 text-slate-550">
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Pour : <strong>{res.votesFor || "Brouillon"} /1000</strong>
                            </span>
                            <span className="flex items-center gap-1 text-slate-550">
                              <ThumbsDown className="w-3.5 h-3.5 text-rose-500" /> Contre : <strong>{res.votesAgainst || 0}</strong>
                            </span>
                            <span className="text-slate-400">Abstention : {res.votesAbstain || 0}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSimulateVote(selectedAssembly.id, res)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1 transition-all"
                          >
                            <Vote className="w-3.5 h-3.5 text-blue-500" /> Simuler Scrutin
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Generate Minutes trigger */}
                <div className="mt-8 flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleGenerateMinutes(selectedAssembly)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                  >
                    <FileText className="w-4 h-4" />
                    {selectedAssembly.pvGenerated ? "Mettre à jour le PV d'AG" : "Générer et Clore le Procès-Verbal (PV)"}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-white border border-slate-200 rounded p-8 text-center shadow-xs">
              Veuillez sélectionner un dossier d'assemblée générale à gauche
            </p>
          )}

          {/* RENDER MINUTES PREVIEW AREA */}
          {pvContent && (
            <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 text-slate-200 animate-fadeIn font-mono">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 text-xs font-sans text-slate-400">
                <span className="flex items-center gap-2 text-emerald-400 uppercase font-black tracking-wider">
                  ✓ PV officiel d'AG généré sous format réglementaire
                </span>
                <button onClick={() => setPVContent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <pre className="text-xs leading-relaxed overflow-x-auto bg-[#070b13] p-4 rounded text-slate-300 border border-slate-800 max-h-[350px] whitespace-pre-wrap">
                {pvContent}
              </pre>
              
              <div className="mt-4 flex justify-between items-center text-xs font-sans">
                <span className="text-slate-500">Mise à disposition en téléchargement pour les copropriétaires</span>
                <button
                  onClick={() => alert("Simulé : PV d'AG téléchargé avec succès sur votre ordinateur sous format PDF certifié.")}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-[10px] text-white rounded flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Télécharger en PDF
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL - Convoquer AG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center animate-fadeIn">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-blue-600" />
                Convoquer une Assemblée Générale (AG)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intitulé de l'AG</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Assemblée Générale Extraordinaire d'urgence" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Heure</label>
                  <input 
                    type="time" 
                    required 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lieu / Salle ou visioconférence</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: Hall d'immeuble, Salle Municipale ou Zoom" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ordre du jour (Un sujet par ligne)</label>
                <textarea 
                  rows={2}
                  value={agendaInput} 
                  onChange={(e) => setAgendaInput(e.target.value)}
                  placeholder="ex : Approbation des devis étanchéité&#10;Remplacement des ampoules LED" 
                  className="w-full text-xs mt-1.5 px-3 py-2 bg-slate-50 rounded border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none font-sans"
                />
              </div>

              <div className="p-3 bg-blue-50/50 rounded border border-dashed border-blue-200">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Ajouter la résolution initiale n°1</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={resTitle1}
                    onChange={(e) => setResTitle1(e.target.value)}
                    placeholder="ex: Vote pour le devis étanchéité terrasse"
                    className="w-full text-xs px-2.5 py-1.5 bg-white rounded border border-slate-200 outline-none"
                  />
                  <input
                    type="text"
                    value={resDesc1}
                    onChange={(e) => setResDesc1(e.target.value)}
                    placeholder="ex: Approbation finale du devis Toiture & Co de 6 800 €"
                    className="w-full text-xs px-2.5 py-1.5 bg-white rounded border border-slate-200 outline-none"
                  />
                </div>
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
                  Envoyer les Convocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
