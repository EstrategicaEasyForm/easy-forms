import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEyeDropper, faSearch, faFlask, faMagic, faRandom, faTruck, faStethoscope } from '@fortawesome/free-solid-svg-icons';


import { IonicModule } from '@ionic/angular';

import { AgendaPage } from './agenda.page';

const routes: Routes = [
  {
    path: '',
    component: AgendaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AgendaPage]
})
export class AgendaPageModule {
  constructor() { 
    // Add an icon to the library for convenient access in other components
    library.add( faEyeDropper, faSearch, faFlask, faMagic, faRandom, faTruck, faStethoscope);
  }
}