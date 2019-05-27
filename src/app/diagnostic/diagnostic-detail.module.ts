import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { DiagnosticDetailPage } from './diagnostic-detail.page';

const routes: Routes = [
  {
    path: '',
    component: DiagnosticDetailPage
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
  declarations: [DiagnosticDetailPage]
})
export class DiagnosticDetailPageModule {}
