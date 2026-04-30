// ─── Imports des modules Node.js nécessaires ─────────────────────────────
const fs = require("fs");      // Module pour interagir avec le système de fichiers
const path = require("path");  // Module pour gérer les chemins de fichiers de manière cross-platform

// ─── Base de connaissances du projet (mapping métier) ───────────────────────
// Cette structure centralise toute la connaissance spécifique du projet
// pour permettre aux prompts d'être contextualisés avec les bonnes informations
const PROJECT_KNOWLEDGE = {
  // Configuration pour la partie frontend (Angular)
  frontend: {
    files: [
      "frontend/formulaire_BD/src/app/formulaire/formulaire.component.ts",
      "frontend/formulaire_BD/src/app/formulaire/formulaire.component.html",
      "frontend/formulaire_BD/src/app/formulaire/formulaire.component.css",
      "frontend/formulaire_BD/src/schemas/formulaire.schema.ts"
    ],
    tech: "Angular 21, ReactiveForms, FormArray, Zod validation, Drag & Drop CDK",
    features: "Formulaire dynamique avec validation temps réel, compteurs de caractères, messages d'erreur précis"
  },
  // Configuration pour la partie backend (Node.js/Express)
  backend: {
    files: [
      "backend/index.js",
      "backend/formulaire.service.js",
      "backend/formulaire.repository.js",
      "backend/schemas/formulaire.schema.js",
      "backend/db.js"
    ],
    tech: "Express 5, Zod validation, PostgreSQL, transactions",
    features: "API REST avec validation Zod, persistence PostgreSQL"
  },
  // Configuration pour l'infrastructure Docker
  docker: {
    files: ["docker-compose.yml", "Dockerfile", "vhost.conf"],
    tech: "Docker Compose, PostGIS, pm2, Nginx",
    features: "Conteneurisation complète avec base PostGIS"
  }
};

// ─── Fonction de détection de la structure du projet ───────────────────────
// Analyse le répertoire courant pour déterminer si nous sommes dans le projet docker-test
// et quelles parties du projet sont présentes (frontend, backend, docker)
function detectProjectStructure(rootPath = process.cwd()) {
  // Vérifie la présence du projet Angular en cherchant le fichier angular.json caractéristique
  const hasAngular = fs.existsSync(path.join(rootPath, "frontend", "formulaire_BD", "angular.json"));
  
  // Vérifie la présence du backend en cherchant le point d'entrée principal
  const hasBackend = fs.existsSync(path.join(rootPath, "backend", "index.js"));
  
  // Retourne un objet résumant la structure détectée
  return {
    isDockerTestProject: hasAngular && hasBackend,  // Vrai seulement si les 2 parties sont présentes
    hasAngular,                                   // Présence du frontend Angular
    hasBackend,                                   // Présence du backend Node.js
    hasDocker: fs.existsSync(path.join(rootPath, "docker-compose.yml"))  // Présence de la config Docker
  };
}

// ─── Constructeur de prompt optimisé pour Windsurf/Cascade ───────────────────
// Génère un prompt détaillé et contextualisé en utilisant la connaissance du projet
// Permet à l'IA de générer du code précis et adapté à l'architecture existante
function buildSmartWindsurfPrompt(decision, question, projectStructure) {
  // Détermine le scope cible (frontend par défaut si général)
  const scope = decision.scope === "general" ? "frontend" : decision.scope;
  const knowledge = PROJECT_KNOWLEDGE[scope] || PROJECT_KNOWLEDGE.frontend;

  // Formate la liste des fichiers concernés pour le prompt
  const filesList = knowledge.files.map(f => `- \`${f}\``).join('\n');

  // Construit le prompt structuré avec toutes les informations nécessaires
  return `## 🎯 Contexte du projet
- **Type**: ${scope === 'frontend' ? 'Angular 21' : scope === 'backend' ? 'Node.js/Express' : 'Docker'}
- **Stack**: ${knowledge.tech}
- **Fonctionnalités existantes**: ${knowledge.features}

## 📁 Fichiers concernés
${filesList}

## 🔧 Contraintes techniques
- Respecter l'architecture existante (ReactiveForms, validation Zod)
- Maintenir la cohérence avec le drag & drop déjà implémenté
- Ajouter des validators maxLength où pertinent
- Formater les messages d'erreur avec les helpers existants

## ❓ Ta demande
${question}

## 📊 Métadonnées
- **Type de tâche**: ${decision.type}
- **Priorité**: ${decision.priority}
- **Scope détecté**: ${scope}

## 📝 Instructions pour l'IA
1. Analyse les fichiers listés ci-dessus
2. Propose du code Angular/TypeScript concret et immédiatement utilisable
3. Cite les fichiers avec le format: \`@chemin/fichier:1-10\`
4. Monte le code complet, pas seulement des extraits
5. Respecte les patterns déjà en place (FormArray, validation, etc.)
`;
}

// ─── Constructeur de prompt standard (basique) ──────────────────────────────
// Génère un prompt simple sans contexte approfondi du projet
// Utilisé lorsque le mode smart/windsurf n'est pas activé
function buildStandardPrompt(decision, question) {
  return `## Contexte
Scope: ${decision.scope}
Type: ${decision.type}
Priorité: ${decision.priority}

## Demande
${question}

## Instructions
Analyse et propose une solution structurée.`;
}

// ─── Export des fonctions et données ─────────────────────────────────────────
// Rend les fonctions et la base de connaissances disponibles pour les autres modules
module.exports = { 
  detectProjectStructure,      // Fonction de détection de structure
  buildSmartWindsurfPrompt,    // Constructeur de prompt optimisé
  buildStandardPrompt,         // Constructeur de prompt basique
  PROJECT_KNOWLEDGE           // Base de connaissances du projet
};