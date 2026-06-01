/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildingInfo, CoOwner, Transaction, Incident, GeneralAssembly } from "./types";

export const initialBuildingInfo: BuildingInfo = {
  name: "Le Belvédère Parmentier",
  address: "142 Avenue Parmentier, 75011 Paris",
  totalLots: 24,
  fiscalYearStart: "2026-01-01",
  bankAccount: "FR76 3000 4000 1200 3456 7890 123",
  reserveFund: 12500,
  totalCash: 42800,
};

export const initialCoOwners: CoOwner[] = [
  {
    id: "co-1",
    name: "Sophie Laurent",
    email: "sophie.laurent@gmail.com",
    phone: "06 12 34 56 78",
    lotNumber: "Lots 1, 2 - RDC Gauche / Cave 1",
    share: 120, // 120 / 1000
    balance: 0,
    status: "up_to_date",
    avatar: "SL",
  },
  {
    id: "co-2",
    name: "Jean-Pierre Moretti",
    email: "jp.moretti@wanadoo.fr",
    phone: "06 87 65 43 21",
    lotNumber: "Lots 3, 4 - Étage 1 Centre / Cave 5",
    share: 180, // 180 / 1000
    balance: -350, // Late by 1 quarter
    status: "late",
    avatar: "JM",
  },
  {
    id: "co-3",
    name: "Amina Belkacem",
    email: "amina.belkacem@outlook.fr",
    phone: "07 43 21 09 87",
    lotNumber: "Lots 5, 10 - Étage 2 Droite / Parking 1",
    share: 150, // 150 / 1000
    balance: 0,
    status: "up_to_date",
    avatar: "AB",
  },
  {
    id: "co-4",
    name: "Christian Dupont",
    email: "c.dupont@orange.fr",
    phone: "06 55 44 33 22",
    lotNumber: "Lot 7 - Étage 3 Gauche / Cave 3",
    share: 230, // 230 / 1000
    balance: -1450, // High arrears (multiple cycles)
    status: "warning",
    avatar: "CD",
  },
  {
    id: "co-5",
    name: "Thomas & Clara Roux",
    email: "thomas.clara.roux@mac.com",
    phone: "06 88 99 00 11",
    lotNumber: "Lots 8, 9, 22 - Duplex Étage 4 & Terasse / Cave 8",
    share: 320, // 320 / 1000
    balance: 400, // Pre-paid next call
    status: "up_to_date",
    avatar: "TR",
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-01-10",
    description: "Appel de fonds - T1 2026 (Charges courantes)",
    amount: 5500,
    type: "income",
    category: "other",
    supplier: "Copropriété",
    status: "paid",
  },
  {
    id: "tx-2",
    date: "2026-02-15",
    description: "Facture Eau de Paris (Semestre 2 2025)",
    amount: 1450,
    type: "expense",
    category: "water",
    supplier: "Eau de Paris",
    receiptName: "EAU_PARIS_INV_4528.pdf",
    status: "paid",
  },
  {
    id: "tx-3",
    date: "2026-03-01",
    description: "Contrat Entretien Ascenseur Trimestriel",
    amount: 620,
    type: "expense",
    category: "elevator",
    supplier: "Otis Ascenseurs",
    receiptName: "OTIS_CONTRAT_93A.pdf",
    status: "paid",
  },
  {
    id: "tx-4",
    date: "2026-03-22",
    description: "Contrat Nettoyage Parties Communes (Mensuel)",
    amount: 450,
    type: "expense",
    category: "cleaning",
    supplier: "ProNet Service Paris",
    receiptName: "PRONET_INV_901.pdf",
    status: "paid",
  },
  {
    id: "tx-5",
    date: "2026-04-05",
    description: "Consommation Électrique Parties Communes",
    amount: 380,
    type: "expense",
    category: "electricity",
    supplier: "EDF Pro",
    receiptName: "EDF_COM_INV_8832.pdf",
    status: "paid",
  },
  {
    id: "tx-6",
    date: "2026-04-10",
    description: "Appel de fonds - T2 2026 (Inclus fonds travaux)",
    amount: 6000,
    type: "income",
    category: "other",
    supplier: "Copropriété",
    status: "paid",
  },
  {
    id: "tx-7",
    date: "2026-04-25",
    description: "Prime Assurance Multirisque Immeuble (Annuelle)",
    amount: 2400,
    type: "expense",
    category: "insurance",
    supplier: "AXA Courtage",
    receiptName: "AXA_MRI_POL-44112.pdf",
    status: "paid",
  },
  {
    id: "tx-8",
    date: "2026-05-14",
    description: "Acompte Travaux Étanchéité (Terrasse)",
    amount: 1800,
    type: "expense",
    category: "works",
    supplier: "Toiture & Co.",
    receiptName: "TOITURE_DEVIS_892_AC_1.pdf",
    status: "paid",
  },
  {
    id: "tx-9",
    date: "2026-05-25",
    description: "Devis Diagnostic Plomb Parties Communes",
    amount: 520,
    type: "expense",
    category: "other",
    supplier: "DiagExpert SARL",
    receiptName: "DIAGEXPERT_QUOTE.pdf",
    status: "pending",
  }
];

export const initialIncidents: Incident[] = [
  {
    id: "inc-1",
    date: "2026-05-28",
    title: "Panne complète de l'ascenseur principal",
    description: "Le câble de traction semble faire un bruit anormal et la cabine s'est bloquée au 3ème étage. Hors service pour sécurité.",
    category: "elevator",
    status: "in_progress",
    urgency: "critical",
    assignedTo: "Technicien Otis (Stéphane)",
    cost: 450,
  },
  {
    id: "inc-2",
    date: "2026-05-12",
    title: "Infiltration d'eau dans les caves",
    description: "Suintement constant sur le mur porteur de la cave n°4. Suspiçion d'un tuyau d'évacuation d'eaux usées fissuré derrière.",
    category: "plumbing",
    status: "reported",
    urgency: "high",
    assignedTo: "Sébastien Plomberie 11",
  },
  {
    id: "inc-3",
    date: "2026-04-20",
    title: "Remplacement ampoules d'allée RDC",
    description: "3 ampoules sur 4 étaient grillées dans l'allée d'entrée, rendant l'accès sombre la nuit. Changées pour des LED durables.",
    category: "electrical",
    status: "resolved",
    urgency: "low",
    assignedTo: "Syndic bénévole",
    cost: 45,
  }
];

export const initialGeneralAssemblies: GeneralAssembly[] = [
  {
    id: "ga-1",
    date: "2026-06-25",
    time: "18:45",
    title: "Assemblée Générale Ordinaire Annuelle 2026",
    location: "Salon de la Mairie du 11e ou Visioconférence Zoom",
    status: "scheduled",
    agenda: [
      "Approbation des comptes de l'exercice financier clos 2025.",
      "Vote du quitus au Syndic bénévole pour sa gestion.",
      "Vérification et vote du budget prévisionnel de fonctionnement 2027.",
      "Autorisation de mener les travaux d'étanchéité de la toiture-terrasse sur devis.",
      "Élection des membres du conseil syndical et renouvellement du syndic."
    ],
    resolutions: [
      {
        id: "res-1",
        title: "Résolution 1 : Approbation des comptes de l'exercice clos 2025",
        description: "Vote sur la validation définitive du bilan comptable et de la répartition finale des charges de l'année 2025.",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: "pending"
      },
      {
        id: "res-2",
        title: "Résolution 2 : Quitus au syndic bénévole",
        description: "Acte d'approbation globale de la gestion administrative et financière du syndic pour l'exercice précédent.",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: "pending"
      },
      {
        id: "res-3",
        title: "Résolution 3 : Vote du budget prévisionnel 2027 fixé à 22 500 €",
        description: "Approbation du budget pour les dépenses habituelles d'exploitation (eau, électricité, nettoyage, petits diagnostics).",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: "pending"
      },
      {
        id: "res-4",
        title: "Résolution 4 : Travaux de réfection d'étanchéité de la terrasse (6 800 €)",
        description: "Validation du devis 'Toiture & Co.' pour refaire l'étanchéité du toit-terrasse en urgence afin de stopper les micro-fuites au 4e.",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: "pending"
      }
    ],
    pvGenerated: false,
  },
  {
    id: "ga-completed-2025",
    date: "2025-06-18",
    time: "19:00",
    title: "Assemblée Générale Ordinaire 2025",
    location: "Salle associative, 142 Av Parmentier, 75011",
    status: "completed",
    agenda: [
      "Rapport moral du syndic bénévole.",
      "Point sur le diagnostic technique global (DTG) de l'immeuble.",
      "Remplacement des corbeilles et interphones."
    ],
    resolutions: [
      {
        id: "res-old-1",
        title: "Adoption du changement d'interphones pour des badges Vigik",
        description: "Installation du nouveau digicode sécurisé dans le SAS principal d'entrée.",
        votesFor: 780,
        votesAgainst: 120,
        votesAbstain: 100,
        status: "approved"
      },
      {
        id: "res-old-2",
        title: "Réparation ponctuelle du local poubelle",
        description: "Remplacement du ferme-porte et lavage haute pression du sol.",
        votesFor: 920,
        votesAgainst: 0,
        votesAbstain: 80,
        status: "approved"
      }
    ],
    pvGenerated: true,
  }
];
