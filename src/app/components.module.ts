import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NetworkNotifyBannerComponent } from './network-notify-banner/network-notify-banner.component';
import { SignatureDrawPad } from './signature-draw-pad/signature-draw-pad';


@NgModule({
    declarations: [NetworkNotifyBannerComponent,SignatureDrawPad],
    imports: [CommonModule,IonicModule],
    exports: [NetworkNotifyBannerComponent,SignatureDrawPad]
})
export class ComponentsModule {}
