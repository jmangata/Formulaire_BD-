import { Request, Response, NextFunction } from 'express';
import { FormulaireSchema } from '../schemas/formulaire.schema';
import { ZodError } from 'zod';

export const validateFormulaire = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = FormulaireSchema.parse(req.body);
    next();
  } catch(err: unknown) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: "Données invalides",
          details: err.issues.map(e => ({
          champ: e.path.length > 0 ? e.path.join('.') : 'body',
          message: e.message
      }))
    });
    return;
  }
  console.error("Erreur middleware validation", err);
  res.status(500).json({error : "Erreur serveur interne"})
}
};