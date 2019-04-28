import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NetworkNotifyBannerComponent } from './network-notify-banner/network-notify-banner.component';

@NgModule({
    declarations: [NetworkNotifyBannerComponent],
    imports: [CommonModule,IonicModule],
    exports: [NetworkNotifyBannerComponent]
})
export class ComponentsModule {}
