// ─── Imports Angular ───────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// Service injecté globalement (singleton)
// Centralise tous les appels HTTP vers le backend Express
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // URL de base de l'API — proxifiée via nginx ou angular.json proxy
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Vérifie que l'API backend répond (route de test)
  getTest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  // Récupère la liste des utilisateurs pour le select du formulaire
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // Récupère les personnes ressources de référence (formulaire_id IS NULL)
  // Utilisées pour le pré-remplissage des champs via select
  getPersonnesRessource(): Observable<any[]> {
    console.log("👉 GET /api/personne_ressource appelé");
    return this.http.get<any[]>(`${this.apiUrl}/personne_ressource`);
  }

  // Envoie le formulaire complet (POST) au backend pour insertion en base
  envoyerFormulaire(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/formulaire`, data);
  }

  // Ajoute une nouvelle personne ressource manuellement en base
  addPersonneRessource(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personne_ressource`, data);
  }

}
