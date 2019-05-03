import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PdfViewerAspirationPage } from './pdf-viewer-aspiration.page';

const routes: Routes = [
  {
    path: '',
    component: PdfViewerAspirationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PdfViewerAspirationPage]
})
export class PdfViewerAspirationPageModule {}
