import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { SignatureDrawPadPageModule } from '../signature-draw-pad/signature-draw-pad.module';
import { TransferPage } from './transfer.page';

const routes: Routes = [
  {
    path: '',
    component: TransferPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    ComponentsModule,
    SignatureDrawPadPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransferPage]
})
export class TransferPageModule {}
