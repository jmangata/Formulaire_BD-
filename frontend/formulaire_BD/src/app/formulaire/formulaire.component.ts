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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css']
})
export class FormulaireComponent implements OnInit {

  // ─── Etat global ─────────────────────────────────────────
  formulaire: FormGroup;                 // Formulaire principal
  users: User[] = [];                    // Liste utilisateurs (select)
  personnes: any[] = [];
  form:any[] = [];
  personnesDisponibles: PersonneDisponible[] = []; // Liste personnes existantes
  personnesFormArray: any[] = [];

  isLoading = true;                      // Chargement users
  isLoadingPersonnes = true;            // Chargement personnes
  success = false;                      // Succès envoi
  erreur = '';                       // Message erreur

  // Classes CSS pour badges (affichage profils)
  private badgeClasses = ['badge-blue', 'badge-purple', 'badge-green'];


  // ─── Constructeur ────────────────────────────────────────
  constructor(private fb: FormBuilder, private api: ApiService) {

    // Initialisation du formulaire principal
    this.formulaire = this.fb.group({
      userid: ['', Validators.required], // utilisateur sélectionné
      description_besoin: ['', [Validators.required, Validators.minLength(10)]],
      date_realisation: [''],

      // Tableaux dynamiques
      personnes_ressource: this.fb.array([]),
      fonctionnalites: this.fb.array([])
    });
  }


  // ─── Initialisation du composant ─────────────────────────
  ngOnInit(): void {
    this.ensureStarterBlocks();          // Ajoute au moins 1 bloc par défaut
    this.loadUsers();                   // Charge utilisateurs
    this.loadPersonnesDisponibles();    // Charge personnes existantes
  }
isManual(index: number): boolean {
    return this.personnes_ressource.at(index).get('mode')?.value === 'manual';
  }

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


  // ─── Gestion Personnes ressources ────────────────────────

 


  // Ajouter une nouvelle personne
  addPersonne(): void {
    this.personnes_ressource.push(this.createPersonne());
  }

  // Supprimer une personne
  removePersonne(index: number): void {
    const el = document.querySelectorAll('.personnes-list .card')[index] as HTMLElement;
    if (el) {
      el.classList.add('removing');
      setTimeout(() => this.personnes_ressource.removeAt(index), 200);
    } else {
      this.personnes_ressource.removeAt(index);
    }
  }

  // Lorsqu'on sélectionne une personne existante
  // → auto-remplissage des champs
  onPersonneSelectionnee(index: number): void {
  const groupe = this.personnes_ressource.at(index) as FormGroup;

  const selectedId = groupe.get('personne_existante_id')?.value;
  const personne = this.personnesDisponibles.find(
    p => p.id === Number(selectedId)
  );

  if (!personne) return;

  // 🔥 mode existant
  groupe.patchValue({ mode: 'existing' });

  // remplissage auto
  groupe.patchValue({
    nom: personne.nom,
    prenom: personne.prenom,
    entites_fonctionnelles: personne.entites_fonctionnelles,
    role: personne.role
  });

  // verrouillage champs
  groupe.get('nom')?.disable();
  groupe.get('prenom')?.disable();
  groupe.get('entites_fonctionnelles')?.disable();
  groupe.get('role')?.disable();
  }

  setManualMode(index: number): void {
  const groupe = this.personnes_ressource.at(index) as FormGroup;

  groupe.patchValue({
    mode: 'manual',
    personne_existante_id: ''
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
    const el = document.querySelectorAll('.fonctionnalites-list .card')[index] as HTMLElement;
    if (el) {
      el.classList.add('removing');
      setTimeout(() => this.fonctionnalites.removeAt(index), 200);
    } else {
      this.fonctionnalites.removeAt(index);
    }
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
  onSubmit(): void {
  console.log("🚀 SUBMIT TRIGGERED");
  this.success = false;
  this.erreur = '';

  if (this.formulaire.invalid) {
    this.formulaire.markAllAsTouched();
    this.erreur = 'Veuillez compléter les champs obligatoires.';
    return;
  }

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

  // Payload déjà correct dans ton code — pas de changement ici
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
    },
    error: (err) => {
      console.error('Erreur chargement personnes ressources', err);
      this.personnesDisponibles = [];
      this.isLoadingPersonnes = false;
    }
  });
}

addPersonneManuelle(): void {
  const data = this.formulaire.get('personnes_ressource')?.value;
  this.api.addPersonneRessource(data).subscribe({
    next: (res) => {
      console.log('Ajout OK', res);
    },
    error: (err) => {
      console.error('Erreur ajout personne', err);
    }
  });
}

  // ─── Initialisation UX ───────────────────────────────────

  // Assure qu'il y a toujours au moins 1 bloc affiché
  private ensureStarterBlocks(): void {
    if (this.personnes_ressource.length === 0) {
      this.addPersonne();
    }

    if (this.fonctionnalites.length === 0) {
      this.addFonctionnalite(false);
    }
  }


  // ─── Factory functions (création des objets FormGroup) ───

  private createPersonne(): FormGroup {
    return this.fb.group({
      mode: ['existing'],
      personne_existante_id: [''], // sélection existante
      nom: [''],
      prenom: [''],
      entites_fonctionnelles: [''],
      role: ['']
    });
  }

  private createFonctionnalite(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      profils: this.fb.array([this.createProfil()])
    });
  }

  private createProfil(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required]
    });
  }


  // ─── UX : Scroll automatique ─────────────────────────────
  private scrollToBottom(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }
}
