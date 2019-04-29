import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { PdfViewerPage } from './pdf-viewer.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: PdfViewerPage
      }
    ])
  ],
  declarations: [PdfViewerPage]
})
export class PdfViewerPageModule {}
