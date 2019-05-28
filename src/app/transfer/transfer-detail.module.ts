import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { TransferDetailPage } from './transfer-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransferDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    FormsModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransferDetailPage]
})
export class TransferDetailPageModule {}
