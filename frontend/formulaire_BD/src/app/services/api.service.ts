import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getTest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getPersonnesRessource(): Observable<any[]> {
    console.log("👉 GET /api/personne_ressource appelé");
    return this.http.get<any[]>(`${this.apiUrl}/personne_ressource`);
  }

  envoyerFormulaire(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/formulaire`, data);
  }

  addPersonneRessource(data: any): Observable<any> {
    
  return this.http.post(`${this.apiUrl}/personne_ressource`, data);
}


}
