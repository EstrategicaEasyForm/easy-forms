import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AspirationPage } from './aspiration.page';
import { ComponentsModule } from '../components.module';
import { SignatureDrawPadPageModule } from '../signature-draw-pad/signature-draw-pad.module';

const routes: Routes = [
  {
    path: '',
    component: AspirationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    ComponentsModule,
    SignatureDrawPadPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AspirationPage]
})
export class AspirationPageModule {}
