// ─── Validation Zod du formulaire ───────────────────────────────────────────
// Définit les schémas de validation utilisés côté backend (index.js)
// et côté frontend (formulaire.component.ts) pour garantir la cohérence.
const { z } = require("zod");

// Transforme les chaînes vides ou null en undefined
// afin que les champs optionnels soient correctement ignorés par Zod
const emptyToUndefined = (value) =>
  value === "" || value === null ? undefined : value;

// ─── Schémas des personnes ressources ────────────────────────────────

// Mode "existing" : la personne est sélectionnée depuis la base (par ID)
const PersonneRessourceExistingSchema = z.object({
  mode: z.literal("existing"),
  personne_existante_id: z.coerce.number().int().positive("L'identifiant de la personne existante est invalide")
});

// Mode "manual" : la personne est saisie manuellement dans le formulaire
const PersonneRessourceManualSchema = z.object({
  mode: z.literal("manual"),
  nom: z.string().trim().min(1, "Nom requis").max(150, "Nom trop long"),
  prenom: z.string().trim().min(1, "Prénom requis").max(150, "Prénom trop long"),
  entites_fonctionnelles: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(255, "Entité trop longue").optional()
  ),
  role: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(255, "Rôle trop long").optional()
  )
});

// Union discriminée sur "mode" : Zod sélectionne automatiquement le bon schéma
const PersonneRessourceSchema = z.discriminatedUnion("mode", [
  PersonneRessourceExistingSchema,
  PersonneRessourceManualSchema
]);

// ─── Schéma d'une fonctionnalité ───────────────────────────────────
// Chaque fonctionnalité a un nom et au moins un profil utilisateur associé
const FonctionnaliteSchema = z.object({
  nom: z.string().trim().min(1, "Nom de fonctionnalité requis").max(200, "Nom de fonctionnalité trop long"),
  profils: z.array(
    z.object({
      nom: z.string().trim().min(1, "Nom de profil requis").max(100, "Nom de profil trop long")
    })
  ).min(1, "Au moins un profil est requis").max(20, "Trop de profils")
});

// ─── Schéma principal du formulaire ─────────────────────────────────
// Valide l'intégralité du body POST /api/formulaire
const FormulaireSchema = z.object({
  userid: z.coerce.number().int().positive("L'identifiant utilisateur est invalide"),
  description_besoin: z.string()
    .trim()
    .min(10, "Description trop courte (min 10 caractères)")
    .max(2000, "Description trop longue (max 2000 caractères)"),
  date_realisation: z.preprocess(
    emptyToUndefined,
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)")
      .optional()  // champ non obligatoire
  ),
  personnes_ressource: z.array(PersonneRessourceSchema)
    .min(1, "Au moins une personne ressource est requise")
    .max(10, "Trop de personnes ressources"),
  fonctionnalites: z.array(FonctionnaliteSchema)
    .min(1, "Au moins une fonctionnalité est requise")
    .max(20, "Trop de fonctionnalités")
});

module.exports = {
  FormulaireSchema,
  PersonneRessourceSchema,
  PersonneRessourceExistingSchema,
  PersonneRessourceManualSchema,
  FonctionnaliteSchema
};
