import { z } from "zod";

// ⚠️ SYNCHRONISER AVEC backend/schemas/formulaire.schema.js

const PersonneRessourceSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('existing'),
    personne_existante_id: z.coerce.number().int().positive()
  }),
  z.object({
    mode: z.literal('manual'),
    nom: z.string().min(1, "Nom requis").max(150, "Nom trop long"),
    prenom: z.string().min(1, "Prénom requis").max(150, "Prénom trop long"),
    entites_fonctionnelles: z.string().max(100).optional().nullable(),
    role: z.string().max(100).optional().nullable()
  })
]);

export const FormulaireSchema = z.object({
  userid: z.coerce.number()
    .int("L'identifiant doit être un entier")
    .positive("L'identifiant doit être positif"),

  description_besoin: z.string()
    .min(10, "Description trop courte (min 10 caractères)")
    .max(2000, "Description trop longue (max 2000 caractères)"),

  date_realisation: z.preprocess(
    val => (val === "" || val === null ? undefined : val),
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)")
      .optional()
  ),

  personnes_ressource: z.array(PersonneRessourceSchema)
    .min(1).max(10).optional().nullable(),

  fonctionnalites: z.array(
    z.object({
      nom: z.string().min(1).max(200),
      profils: z.array(
        z.object({ nom: z.string().min(1).max(100) })
      ).min(1).max(20).optional().nullable()
    })
  ).min(1).max(20).optional().nullable()
});
