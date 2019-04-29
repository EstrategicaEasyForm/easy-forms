import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from 'src/app/network-notify-banner/network-notify-banner.component';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [NetworkNotifyBannerComponent],
	imports: [IonicModule, CommonModule],
	exports: [NetworkNotifyBannerComponent]
})
export class ComponentsModule {}
