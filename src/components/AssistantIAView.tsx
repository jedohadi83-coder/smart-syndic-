/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Info, 
  HelpCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
  Bot,
  User,
  Gavel,
  ShieldCheck
} from "lucide-react";
import { Message } from "../types";

interface AssistantIAViewProps {
  chatHistory: Message[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
}

export default function AssistantIAView({
  chatHistory,
  onSendMessage,
  onClearChat,
  isLoading
}: AssistantIAViewProps) {
  
  const [inputText, setInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Pre-loaded legal queries standard for syndic management in France
  const defaultPrompts = [
    {
      title: "Rédiger convocation AG",
      description: "Modèle de lettre officielle pour convoquer les copropriétaires rattachés.",
      prompt: "Rédige-moi un modèle formel et juridique de convocation de copropriétaires pour l'Assemblée Générale Ordinaire de l'immeuble. Inclus les mentions légales de la loi du 10 juillet 1965."
    },
    {
      title: "Loi Alur & Fonds travaux",
      description: "Quelles sont les obligations de réserve financière ?",
      prompt: "Quellse sont les règles et taux obligatoires de provisionnement de fonds travaux fixés par la Loi ALUR en France pour une copropriété d'immeuble de 24 lots ?"
    },
    {
      title: "Dégât des eaux parties communes",
      description: "Comment gérer le rapport et déclaration d'assurance ?",
      prompt: "Quel est la procédure exacte et les délais pour déclarer un dégât des eaux survenu dans les parties communes d'un immeuble en France ? Comment faire le constat amiable ?"
    },
    {
      title: "Régulariser un copropriétaire impayé",
      description: "Modèle de relance amiable et étapes de contentieux.",
      prompt: "Je gère un copropriétaire avec 1 500 € d'arriérés de charges. Rédige un modèle de lettre de mise en demeure amiable chaleureuse mais ferme avec rappel des lois de 1965, et détaille les étapes de recouvrement."
    }
  ];

  // Auto-scroll chat history
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const messageToSend = inputText;
    setInputText("");
    await onSendMessage(messageToSend);
  };

  const handlePromptClick = (p: string) => {
    setInputText(p);
  };

  return (
    <div id="assistant-ia-view" className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
      
      {/* Split left panel: Pre-loaded prompts & Info instructions */}
      <div className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">Expert IA Réglementaire</h2>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Posez vos questions à l'intelligence artificielle entraînée sur le droit de la copropriété immobilière en France (Code de la copropriété, loi de 1965, loi ALUR, loi Elan).
        </p>

        {/* Prompt template list */}
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#000] mb-3">Modèles Prêts à poser</h3>
        <div className="space-y-3.5 flex-1">
          {defaultPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(p.prompt)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-xs transition-all duration-150 block outline-none"
            >
              <div className="font-bold text-slate-800 tracking-tight leading-snug">{p.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">{p.description}</div>
            </button>
          ))}
        </div>

        {/* Warning label footer */}
        <div className="mt-8 p-3 bg-amber-50 rounded border border-amber-100 flex gap-2 items-start">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-normal">
            L'assistant fournit des orientations juridiques et administratives basées sur les textes de loi français, mais ne remplace pas une consultation ou avocat spécialisé.
          </p>
        </div>
      </div>

      {/* Split right panel: Conversational chat interface */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        
        {/* Chat top header banner bar */}
        <div className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
              Conseiller Juridique & Administratif
            </h1>
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              ALIMENTÉ PAR GEMINI 3.5 FLASH • CONTEXTUALISÉ SUR L'IMMEUBLE
            </p>
          </div>
          
          <button
            onClick={onClearChat}
            disabled={chatHistory.length === 1 && chatHistory[0].role === "assistant"}
            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 rounded border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-sans cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>

        {/* Message scroll viewport */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          
          {chatHistory.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar sphere */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isBot 
                    ? "bg-slate-900 text-slate-100 border-slate-800" 
                    : "bg-blue-600 text-white border-blue-500"
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble frame */}
                <div>
                  <div className={`p-4 rounded-lg shadow-xs leading-relaxed text-xs border ${
                    isBot 
                      ? "bg-white text-slate-800 border-slate-200" 
                      : "bg-[#1E3A8A] text-slate-100 border-[#1E40AF]"
                  }`}>
                    {/* Preserve line jumps to keep templates structured */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>
                  </div>
                  
                  {/* Local timestamp */}
                  <span className={`block text-[9px] text-slate-400 mt-1 font-mono ${!isBot && "text-right"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Assistant computing typewriter state */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-100 border border-slate-800 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="bg-white text-slate-800 border border-slate-200 p-4 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-450 italic ml-1">L'assistant IA rédige sa réponse juridique...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Floating input submission form */}
        <div className="px-8 py-5 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ex: Comment convoquer une AG extraordinaire ? Rédiger modèle..."
              className="flex-1 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 border border-slate-200 px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500/80 focus:bg-white transition-all font-sans"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-[#1E3A8A] hover:bg-blue-700 text-white rounded-md font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow disabled:opacity-40 transition-colors"
            >
              Envoyer <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
