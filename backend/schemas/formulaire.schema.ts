const { z } = require("zod");

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const PersonneRessourceExistingSchema = z.object({
  mode: z.literal("existing"),
  personne_existante_id: z.coerce.number().int().positive("L'identifiant de la personne existante est invalide")
});

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

const PersonneRessourceSchema = z.discriminatedUnion("mode", [
  PersonneRessourceExistingSchema,
  PersonneRessourceManualSchema
]);

const FonctionnaliteSchema = z.object({
  nom: z.string().trim().min(1, "Nom de fonctionnalité requis").max(200, "Nom de fonctionnalité trop long"),
  profils: z.array(
    z.object({
      nom: z.string().trim().min(1, "Nom de profil requis").max(100, "Nom de profil trop long")
    })
  ).min(1, "Au moins un profil est requis").max(20, "Trop de profils")
});

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
      .optional()
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
