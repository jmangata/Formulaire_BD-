# 🧠 AI CLI — Niveau d’autonomie 2 (Décision assistée)

## 🎯 Définition

Le CLI dispose d’un niveau d’autonomie limité appelé **niveau 2**.

Il peut analyser le contexte du projet et prendre des **micro-décisions non critiques** afin d’améliorer la pertinence des réponses IA.

---

# ⚙️ Capacités autorisées

## ✔ Analyse intelligente
- détecter le domaine concerné (frontend / backend / infra)
- identifier le type de demande (bug, refactor, feature, doc)

## ✔ Priorisation
- déterminer les éléments les plus importants dans une demande
- filtrer le contexte inutile

## ✔ Structuration
- organiser une réponse IA en étapes logiques
- proposer un plan d’action

## ✔ Suggestion de direction
- proposer des solutions techniques possibles
- comparer des options (ex: Angular Material vs Tailwind)

---

# 🚫 Capacités interdites

Le système NE DOIT PAS :

- modifier le code source automatiquement
- créer ou supprimer des fichiers
- exécuter des commandes système
- déployer une application
- prendre une décision finale sans validation utilisateur

---

# 🧠 Rôle du CLI en niveau 2

Le CLI agit comme :

- 🔎 analyseur de contexte avancé
- 🧭 routeur de décision (scope detection)
- 🧠 générateur de structure de réponse
- 📊 assistant de priorisation

---

# 🔁 Nouveau cycle de fonctionnement

1. L’utilisateur fait une demande
2. Le CLI analyse le contexte
3. Le CLI détermine :
   - scope (frontend/backend/docker)
   - type de tâche
   - niveau de complexité
4. Le CLI structure le prompt IA
5. L’IA répond
6. L’utilisateur valide ou corrige

---

# 🧭 Principe fondamental

> Le CLI peut orienter la décision, mais ne peut jamais l’imposer.

---

# 🧠 Exemple concret

## Entrée utilisateur
"Refactor mon formulaire Angular"

## Décision CLI (niveau 2)
- scope : frontend
- type : refactor UI
- priorité : élevée
- contexte : FormArray + validation Zod

## Résultat
Prompt IA enrichi et structuré automatiquement

---

# 🚀 Objectif du niveau 2

- améliorer la qualité des réponses IA
- réduire les prompts ambigus
- accélérer la prise de décision
- garder le contrôle humain total

---

# 🧠 Conclusion

Le niveau 2 permet au CLI de devenir :

👉 un **assistant de décision structurant**

sans jamais devenir un agent autonome.
