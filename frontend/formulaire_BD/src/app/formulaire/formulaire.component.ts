// ─── Imports Angular ───────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Service API pour communication backend
import { ApiService } from '../services/api.service';
import { FormulaireSchema } from '../../schemas/formulaire.schema';


// ─── Interfaces (Typage des données) ───────────────────────

// Utilisateur existant (table users)
interface User {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
  unite_fonctionnelle?: string;
}

// Personne ressource existante (pré-remplissage possible)
interface PersonneDisponible {
  id: number;
  nom: string;
  prenom: string;
  entites_fonctionnelles?: string | null;
  role?: string | null;
}


// ─── Composant Angular ─────────────────────────────────────
@Component({
  selector: 'app-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css']
})
export class FormulaireComponent implements OnInit {

  // ─── Etat global ─────────────────────────────────────────
  formulaire: FormGroup;                 // Formulaire principal
  users: User[] = [];                    // Liste utilisateurs (select)
  personnesDisponibles: PersonneDisponible[] = []; // Liste personnes existantes

  isLoading = true;                      // Chargement users
  isLoadingPersonnes = true;            // Chargement personnes
  success = false;                      // Succès envoi
  erreur = '';

  // Classes CSS pour badges (affichage profils)
  private badgeClasses = ['badge-blue', 'badge-purple', 'badge-green'];


  // ─── Constructeur ────────────────────────────────────────
  constructor(private fb: FormBuilder, private api: ApiService) {

    // Initialisation du formulaire principal
    this.formulaire = this.fb.group({
      userid: ['', Validators.required], // utilisateur sélectionné
      description_besoin: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      date_realisation: [''],

      // Tableaux dynamiques
      personnes_ressource: this.fb.array([]),
      fonctionnalites: this.fb.array([])
    });
  }

  private readonly STORAGE_KEY = 'formulaire_brouillon';

  // ─── Initialisation du composant ─────────────────────────
  ngOnInit(): void {
    this.loadUsers();                   // Charge utilisateurs
    this.loadPersonnesDisponibles();    // Charge personnes existantes + restaure brouillon

    this.formulaire.valueChanges.subscribe(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.formulaire.getRawValue()));
    });
  }
  // Retourne true si la personne à cet index est en mode saisie manuelle
  isManual(index: number): boolean {
    return this.personnes_ressource.at(index).get('mode')?.value === 'manual';
  }

  // Retourne true si la personne à cet index est issue d'une sélection existante
  isExisting(index: number): boolean {
    return this.personnes_ressource.at(index).get('mode')?.value === 'existing';
  }


  // ─── Getters pour accéder facilement aux FormArray ───────
  get personnes_ressource(): FormArray {
    return this.formulaire.get('personnes_ressource') as FormArray;
  }

  get fonctionnalites(): FormArray {
    return this.formulaire.get('fonctionnalites') as FormArray;
  }

  // Récupère les profils d’une fonctionnalité
  getProfils(fIndex: number): FormArray {
    return this.fonctionnalites.at(fIndex).get('profils') as FormArray;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private moveControl(array: FormArray, fromIndex: number, direction: -1 | 1): void {
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
      return;
    }

    const control = array.at(fromIndex);
    array.removeAt(fromIndex);
    array.insert(toIndex, control);
  }

  movePersonne(index: number, direction: -1 | 1): void {
    this.moveControl(this.personnes_ressource, index, direction);
  }

  moveFonctionnalite(index: number, direction: -1 | 1): void {
    this.moveControl(this.fonctionnalites, index, direction);
  }

  // ─── Drag & Drop handlers ─────────────────────────────────
  onPersonneDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const control = this.personnes_ressource.at(event.previousIndex);
    this.personnes_ressource.removeAt(event.previousIndex);
    this.personnes_ressource.insert(event.currentIndex, control);
  }

  onFonctionnaliteDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const control = this.fonctionnalites.at(event.previousIndex);
    this.fonctionnalites.removeAt(event.previousIndex);
    this.fonctionnalites.insert(event.currentIndex, control);
  }

  isDuplicatePersonne(index: number): boolean {
    const signatures = this.personnes_ressource.controls.map((control) => {
      const raw = control.getRawValue();
      if (raw.mode === 'existing') {
        const id = this.normalizeText(raw.personne_existante_id);
        return id ? `existing:${id}` : '';
      }

      const manualSignature = [raw.nom, raw.prenom, raw.entites_fonctionnelles, raw.role]
        .map((item) => this.normalizeText(item))
        .join('|');

      return manualSignature.replace(/\|/g, '') ? `manual:${manualSignature}` : '';
    });

    const current = signatures[index];
    return current !== undefined && signatures.filter((signature) => signature === current).length > 1;
  }

  isDuplicateFonctionnalite(index: number): boolean {
    const names = this.fonctionnalites.controls.map((control) => this.normalizeText(control.get('nom')?.value));
    const current = names[index];
    return current !== '' && names.filter((name) => name === current).length > 1;
  }

  getPersonneSuggestions(index: number): PersonneDisponible[] {
    const groupe = this.personnes_ressource.at(index) as FormGroup;
    const query = this.normalizeText([
      groupe.get('nom')?.value,
      groupe.get('prenom')?.value,
      groupe.get('entites_fonctionnelles')?.value,
      groupe.get('role')?.value
    ].join(' '));

    if (query.length < 2) {
      return [];
    }

    return this.personnesDisponibles
      .filter((personne) => {
        const haystack = this.normalizeText([
          personne.nom,
          personne.prenom,
          personne.entites_fonctionnelles,
          personne.role
        ].join(' '));
        return haystack.includes(query);
      })
      .slice(0, 5);
  }

  applyPersonneSuggestion(index: number, personne: PersonneDisponible): void {
    const groupe = this.personnes_ressource.at(index) as FormGroup;
    groupe.patchValue({
      mode: 'manual',
      personne_existante_id: '',
      nom: personne.nom ?? '',
      prenom: personne.prenom ?? '',
      entites_fonctionnelles: personne.entites_fonctionnelles ?? '',
      role: personne.role ?? ''
    });
    groupe.get('nom')?.enable();
    groupe.get('prenom')?.enable();
    groupe.get('entites_fonctionnelles')?.enable();
    groupe.get('role')?.enable();
  }

  getSelectedUserLabel(): string {
    const userId = Number(this.formulaire.get('userid')?.value);
    const user = this.users.find((item) => item.id === userId);
    return user ? `${user.nom} ${user.prenom} — ${user.fonction}` : 'Non sélectionné';
  }

  getDescriptionPreview(maxLength = 140): string {
    const value = String(this.formulaire.get('description_besoin')?.value ?? '').trim();
    if (!value) {
      return 'Aucune description saisie';
    }
    return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
  }

  getSummaryCounts(): { personnes: number; fonctionnalites: number; profils: number } {
    const profils = this.fonctionnalites.controls.reduce((total, fonctionnalite) => {
      return total + ((fonctionnalite.get('profils') as FormArray)?.length ?? 0);
    }, 0);

    return {
      personnes: this.personnes_ressource.length,
      fonctionnalites: this.fonctionnalites.length,
      profils
    };
  }

  getPersonneSummary(index: number): string {
    const groupe = this.personnes_ressource.at(index) as FormGroup;
    const raw = groupe.getRawValue();
    if (raw.mode === 'existing') {
      const personne = this.personnesDisponibles.find((item) => item.id === Number(raw.personne_existante_id));
      return personne ? `${personne.nom} ${personne.prenom}` : 'Personne existante sélectionnée';
    }

    const pieces = [raw.nom, raw.prenom, raw.entites_fonctionnelles, raw.role]
      .map((item: string) => this.normalizeText(item) ? item : '')
      .filter(Boolean);

    return pieces.length > 0 ? pieces.join(' — ') : 'Personne manuelle vide';
  }

  getFonctionnaliteSummary(index: number): string {
    const nom = this.normalizeText(this.fonctionnalites.at(index).get('nom')?.value);
    const profils = this.getProfils(index).length;
    return `${nom || 'Fonctionnalité sans nom'} (${profils} profil${profils > 1 ? 's' : ''})`;
  }

  // Messages d'erreur précis pour chaque champ
  getErrorMessage(controlName: string, control: any, label: string): string {
    if (!control || !control.invalid || !control.touched) return '';
    if (control.errors?.['required']) return `${label} est obligatoire`;
    if (control.errors?.['minlength']) return `${label} : minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors?.['maxlength']) return `${label} : maximum ${control.errors['maxlength'].requiredLength} caractères`;
    return `${label} invalide`;
  }

  getPersonneFieldError(index: number, fieldName: string): string {
    const control = this.personnes_ressource.at(index).get(fieldName);
    const labels: Record<string, string> = {
      nom: 'Nom',
      prenom: 'Prénom',
      entites_fonctionnelles: 'Entité fonctionnelle',
      role: 'Rôle'
    };
    return this.getErrorMessage(fieldName, control, labels[fieldName] || fieldName);
  }

  getFonctionnaliteFieldError(index: number, fieldName: string): string {
    const control = this.fonctionnalites.at(index).get(fieldName);
    const labels: Record<string, string> = {
      nom: 'Nom de la fonctionnalité'
    };
    return this.getErrorMessage(fieldName, control, labels[fieldName] || fieldName);
  }

  getProfilFieldError(fIndex: number, pIndex: number): string {
    const control = this.getProfils(fIndex).at(pIndex).get('nom');
    return this.getErrorMessage('nom', control, 'Profil');
  }

  // Validation complète du formulaire avec messages précis
  getDetailedValidationErrors(): string[] {
    const errors: string[] = [];

    // Utilisateur
    const userid = this.formulaire.get('userid');
    if (userid?.invalid && userid?.touched) {
      errors.push('Utilisateur : veuillez sélectionner un demandeur');
    }

    // Description
    const desc = this.formulaire.get('description_besoin');
    if (desc?.invalid && desc?.touched) {
      if (desc.errors?.['required']) errors.push('Description : champ obligatoire');
      else if (desc.errors?.['minlength']) errors.push(`Description : minimum ${desc.errors['minlength'].requiredLength} caractères`);
      else if (desc.errors?.['maxlength']) errors.push(`Description : maximum ${desc.errors['maxlength'].requiredLength} caractères`);
    }

    // Personnes ressources
    this.personnes_ressource.controls.forEach((control, i) => {
      const raw = control.getRawValue();
      if (raw.mode === 'manual') {
        if (!raw.nom?.trim()) errors.push(`Personne ressource ${i + 1} : le nom est obligatoire`);
        if (!raw.prenom?.trim()) errors.push(`Personne ressource ${i + 1} : le prénom est obligatoire`);
      }
      if (raw.mode === 'existing' && !raw.personne_existante_id) {
        errors.push(`Personne ressource ${i + 1} : veuillez sélectionner une personne`);
      }
    });

    // Fonctionnalités
    this.fonctionnalites.controls.forEach((control, i) => {
      const nom = control.get('nom');
      if (nom?.invalid && nom?.touched) {
        if (nom.errors?.['required']) errors.push(`Fonctionnalité ${i + 1} : le nom est obligatoire`);
        else if (nom.errors?.['maxlength']) errors.push(`Fonctionnalité ${i + 1} : nom trop long (max ${nom.errors['maxlength'].requiredLength} caractères)`);
      }
      const profils = this.getProfils(i);
      profils.controls.forEach((profil, j) => {
        const profilNom = profil.get('nom');
        if (profilNom?.invalid && profilNom?.touched) {
          if (profilNom.errors?.['required']) errors.push(`Fonctionnalité ${i + 1}, Profil ${j + 1} : le nom est obligatoire`);
          else if (profilNom.errors?.['maxlength']) errors.push(`Fonctionnalité ${i + 1}, Profil ${j + 1} : nom trop long (max ${profilNom.errors['maxlength'].requiredLength} caractères)`);
        }
      });
    });

    return errors;
  }


  // ─── Gestion Personnes ressources ────────────────────────

 


  // Ajouter une nouvelle personne
  addPersonne(): void {
    this.personnes_ressource.push(this.createPersonne());
  }

  // Supprimer une personne
  removePersonne(index: number): void {
    this.personnes_ressource.removeAt(index);
  }

  // Lorsqu'on sélectionne une personne existante depuis le select :
  // 1. Recherche la personne dans la liste locale (évite un appel API supplémentaire)
  // 2. Pré-remplit les champs nom/prénom/entité/rôle avec ses données
  // 3. Verrouille ces champs (disable) pour éviter que l'utilisateur
  //    modifie des données qui ne correspondraient plus à la personne en base
  onPersonneSelectionnee(index: number): void {
  const groupe = this.personnes_ressource.at(index) as FormGroup;

  const selectedId = groupe.get('personne_existante_id')?.value;
  const personne = this.personnesDisponibles.find(
    p => p.id === Number(selectedId)
  );

  if (!personne) return;

  // Bascule le mode en 'existing' pour que le payload envoyé au backend
  // ne contienne que l'ID (et non les champs texte redondants)
  groupe.patchValue({ mode: 'existing' });

  // Pré-remplissage visuel uniquement (les champs seront disabled)
  groupe.patchValue({
    nom: personne.nom,
    prenom: personne.prenom,
    entites_fonctionnelles: personne.entites_fonctionnelles,
    role: personne.role
  });

  // Verrouillage : empêche toute modification manuelle après sélection
  // (setManualMode() permet de les réactiver si l'utilisateur change d'avis)
  groupe.get('nom')?.disable();
  groupe.get('prenom')?.disable();
  groupe.get('entites_fonctionnelles')?.disable();
  groupe.get('role')?.disable();
  }

  // Bascule une personne en mode saisie manuelle :
  // réinitialise le select et réactive les champs de texte
  setManualMode(index: number): void {
    const groupe = this.personnes_ressource.at(index) as FormGroup;

    // On repasse en mode manuel et on vide les valeurs préremplies
    // pour éviter de conserver les données de la personne sélectionnée.
    groupe.patchValue({
      mode: 'manual',
      personne_existante_id: '',
      nom: '',
      prenom: '',
      entites_fonctionnelles: '',
      role: ''
    });

    groupe.get('nom')?.enable();
    groupe.get('prenom')?.enable();
    groupe.get('entites_fonctionnelles')?.enable();
    groupe.get('role')?.enable();
}

  // ─── Gestion Fonctionnalités ─────────────────────────────

  addFonctionnalite(shouldScroll = true): void {
    this.fonctionnalites.push(this.createFonctionnalite());

    // Scroll automatique vers le bas (UX)
    if (shouldScroll) {
      this.scrollToBottom();
    }
  }

  removeFonctionnalite(index: number): void {
    this.fonctionnalites.removeAt(index);
  }


  // ─── Gestion Profils ─────────────────────────────────────

  // Ajouter un profil à une fonctionnalité
  addProfil(fIndex: number): void {
    this.getProfils(fIndex).push(this.createProfil());
  }

  // Supprimer un profil
  removeProfil(fIndex: number, pIndex: number): void {
    const profils = this.getProfils(fIndex);
    profils.removeAt(pIndex);

    // Toujours garder au moins 1 profil
    if (profils.length === 0) {
      profils.push(this.createProfil());
    }
  }
  


  // ─── UI Helpers ──────────────────────────────────────────

  // Retourne une classe CSS pour badge (couleurs alternées)
  getBadgeClass(index: number): string {
    return this.badgeClasses[index % this.badgeClasses.length];
  }


  // ─── Soumission du formulaire ────────────────────────────
  // Flux de validation en 3 étapes avant envoi :
  //   1. Validation Angular (champs required, minLength…)
  //   2. Validation métier manuelle (mode manual/existing cohérent)
  //   3. Validation Zod du payload final (même schéma que le backend)
  // Cette double validation (Angular + Zod) n'est pas un doublon :
  //   - Angular valide l'état du formulaire UI
  //   - Zod valide la structure exacte du JSON qui sera envoyé au backend
  onSubmit(): void {
  console.log("🚀 SUBMIT TRIGGERED");
  this.success = false;
  this.erreur = '';

  if (this.formulaire.invalid) {
    this.formulaire.markAllAsTouched();
    this.erreur = 'Veuillez compléter les champs obligatoires.';
    return;
  }

  // getRawValue() au lieu de .value : indispensable pour récupérer aussi
  // les champs désactivés (disabled) comme nom/prénom des personnes en mode 'existing'.
  // formulaire.value les ignorerait silencieusement.
  const raw = this.formulaire.getRawValue();

  // ✅ Validation manuelle des personnes en mode manual
  for (let i = 0; i < raw.personnes_ressource.length; i++) {
    const p = raw.personnes_ressource[i];
    if (p.mode === 'manual' && (!p.nom?.trim() || !p.prenom?.trim())) {
      this.erreur = `Personne ressource ${i + 1} : nom et prénom obligatoires en saisie manuelle.`;
      return;
    }
    if (p.mode === 'existing' && !p.personne_existante_id) {
      this.erreur = `Personne ressource ${i + 1} : veuillez sélectionner une personne.`;
      return;
    }
  }

  const duplicatePersonneIndex = this.personnes_ressource.controls.findIndex((_, index) => this.isDuplicatePersonne(index));
  if (duplicatePersonneIndex !== -1) {
    this.erreur = `Doublon détecté : la personne ressource ${duplicatePersonneIndex + 1} est déjà présente.`;
    return;
  }

  const duplicateFonctionnaliteIndex = this.fonctionnalites.controls.findIndex((_, index) => this.isDuplicateFonctionnalite(index));
  if (duplicateFonctionnaliteIndex !== -1) {
    this.erreur = `Doublon détecté : la fonctionnalité ${duplicateFonctionnaliteIndex + 1} est déjà ajoutée.`;
    return;
  }

  // Construction du payload : on nettoie chaque personne selon son mode
  // - 'existing' : on n'envoie que l'ID (le backend retrouve les données en base)
  // - 'manual'   : on envoie les champs saisis (le backend les insère directement)
  const payload = {
    ...raw,
    personnes_ressource: raw.personnes_ressource.map((p: any) => {
      if (p.mode === 'existing') {
        return {
          mode: 'existing',
          personne_existante_id: Number(p.personne_existante_id)
        };
      }
      return {
        mode: 'manual',
        nom: p.nom,
        prenom: p.prenom,
        entites_fonctionnelles: p.entites_fonctionnelles,
        role: p.role
      };
    })
  };

  const validationResult = FormulaireSchema.safeParse(payload);

  if (!validationResult.success) {
    const messages = validationResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(' | ');

    this.erreur = `Validation invalide : ${messages}`;
    console.error('Zod validation errors', validationResult.error.format());
    return;
  }
  this.api.envoyerFormulaire(validationResult.data).subscribe({
    next: () => {
      this.success = true;
      this.erreur = '';

    localStorage.removeItem(this.STORAGE_KEY);

      this.formulaire.reset();
      this.personnes_ressource.clear();
      this.fonctionnalites.clear();

      this.ensureStarterBlocks();
    },
    error: (err) => {
      this.success = false;
      this.erreur = err.error?.error || 'Erreur lors de l’envoi.';
    }
  });
  }


  // ─── Chargement des données ──────────────────────────────

  // Récupération utilisateurs
private loadUsers(): void {
  this.formulaire.get('userid')?.disable(); // ✅ via FormControl

  this.api.getUsers().subscribe({
    next: (data: User[]) => {
      this.users = data;
      this.isLoading = false;
      this.formulaire.get('userid')?.enable(); // ✅ réactivation
    },
    error: (err) => {
      console.error('Erreur chargement users', err);
      this.erreur = 'Impossible de charger la liste des utilisateurs.';
      this.isLoading = false;
      this.formulaire.get('userid')?.enable();
    }
  });
}
  // Récupération personnes ressources existantes
 private loadPersonnesDisponibles(): void {
  this.api.getPersonnesRessource().subscribe({
    
    next: (data: PersonneDisponible[]) => {
      this.personnesDisponibles = data ?? [];

      if (this.personnesDisponibles.length === 0) {
        console.warn('Aucune personne ressource de référence en base (formulaire_id IS NULL)');
      }

      this.isLoadingPersonnes = false;
        this.restoreBrouillon(); // Restaure après que la liste est disponible
    },
    
  });
}

  // ─── Brouillon localStorage ───────────────────────────────────────────────

  // Restaure le formulaire depuis localStorage si un brouillon existe.
  // Pour les FormArrays (personnes, fonctionnalités) on doit d'abord
  // créer le bon nombre de groupes avant de patcher les valeurs,
  // car patchValue seul n'ajoute pas de contrôles dynamiquement.
  private restoreBrouillon(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      this.ensureStarterBlocks();
      return;
    }

    try {
      const data = JSON.parse(saved);

      // Recréer les groupes personnes_ressource
      this.personnes_ressource.clear();
      (data.personnes_ressource || []).forEach(() => {
        this.personnes_ressource.push(this.createPersonne());
      });

      // Recréer les groupes fonctionnalités avec leurs profils
      this.fonctionnalites.clear();
      (data.fonctionnalites || []).forEach((f: any) => {
        const groupe = this.createFonctionnalite();
        const profils = groupe.get('profils') as FormArray;
        profils.clear();
        (f.profils || []).forEach(() => profils.push(this.createProfil()));
        this.fonctionnalites.push(groupe);
      });

      // Patcher toutes les valeurs en une seule fois
      this.formulaire.patchValue(data);
    } catch {
      // Brouillon corrompu — on le supprime pour éviter une boucle d'erreur
      localStorage.removeItem(this.STORAGE_KEY);
      this.ensureStarterBlocks();
    }
  }


  // ─── Initialisation UX ───────────────────────────────────

  // Assure qu'il y a toujours au moins 1 bloc affiché au démarrage et après reset.
  // Appelé dans ngOnInit() et après un envoi réussi (formulaire.reset() vide les FormArrays).
  // Le paramètre false dans addFonctionnalite(false) désactive le scroll au démarrage.
  private ensureStarterBlocks(): void {
    if (this.personnes_ressource.length === 0) {
      this.addPersonne();
    }

    if (this.fonctionnalites.length === 0) {
      this.addFonctionnalite(false);
    }
  }


  // ─── Factory functions (création des objets FormGroup) ───
  // Chaque factory retourne un FormGroup vierge prêt à être poussé dans un FormArray

  // Crée un groupe personne ressource (mode existant par défaut)
  private createPersonne(): FormGroup {
    return this.fb.group({
      mode: ['existing'],
      personne_existante_id: [''], // sélection existante
      nom: ['', [Validators.maxLength(100)]],
      prenom: ['', [Validators.maxLength(100)]],
      entites_fonctionnelles: ['', [Validators.maxLength(150)]],
      role: ['', [Validators.maxLength(100)]]
    });
  }

  // Crée un groupe fonctionnalité avec un profil vide par défaut
  private createFonctionnalite(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(200)]],
      profils: this.fb.array([this.createProfil()])
    });
  }

  // Crée un groupe profil (nom du rôle utilisateur)
  private createProfil(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }


  // ─── UX : Scroll automatique ─────────────────────────────
  // Fait défiler la page vers le bas après ajout d'une fonctionnalité
  private scrollToBottom(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }
}
