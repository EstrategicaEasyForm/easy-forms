import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { SignatureDrawPadPage } from './signature-draw-pad.page';
import { ComponentsModule } from '../components.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule
  ],
  declarations: [SignatureDrawPadPage],
  exports: [SignatureDrawPadPage]
})
export class SignatureDrawPadPageModule {}
