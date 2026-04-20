import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormulaireComponent } from './formulaire/formulaire.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormulaireComponent],
  template: `<app-formulaire></app-formulaire>`,
  styleUrls: ['./app.css']
})
export class App {}
