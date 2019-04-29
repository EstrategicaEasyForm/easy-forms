import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ComponentsModule } from '../components.module';
import { AspirationDetailModal } from './aspiration-detail.modal';

@NgModule({
  imports: [CommonModule, IonicModule.forRoot(), ReactiveFormsModule, FormsModule],
  exports: [AspirationDetailModal],
  declarations: [AspirationDetailModal]
})
export class AspirationDetailModalModule { }
