const { FormulaireSchema } = require('../schemas/formulaire.schema');

function validateFormulaire(req, res, next) {
  const parsed = FormulaireSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Données invalides",
      details: parsed.error.issues
    });
  }
  req.body = parsed.data;
  next();
}

module.exports = { validateFormulaire };