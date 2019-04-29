import { Component, OnInit } from '@angular/core';
import { NetworkNotifyService } from '../network-notify.service';
import { Platform,  Events } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Network } from '@ionic-native/network/ngx';


@Component({
  selector: 'app-network-notify-banner',
  templateUrl: './network-notify-banner.component.html',
	styleUrls: ['./network-notify-banner.component.scss'],
	animations: [
		trigger('banner-state', [
      state('visible', style({
        overflow: 'hidden',
        height: '*',
			})),
      state('invisible', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
      })),
			transition('visible => invisible', animate('1000ms ease-in-out')),
			transition('invisible => visible', animate('1000ms ease-in-out')),
    ])
	],
})
export class NetworkNotifyBannerComponent implements OnInit {
	ejecutarAnimacion : String = 'invisible';
	textBanner : String = 'Esta conectado por';
	failedNetwork: boolean = false;
	constructor(public platform: Platform, public events: Events,
			public networkProvider: NetworkNotifyService,
			private network : Network) {
  	this.platform.ready().then(() => {

			this.networkProvider.initializeNetworkEvents();

   		// Offline event
	    this.events.subscribe('network:offline', () => {
				console.log("Network offline");
				this.textBanner = 'No se encuentra conectado';
				this.failedNetwork = true;
				this.animacion();
	    });

	    // Online event
	    this.events.subscribe('network:online', () => {
				this.textBanner = 'Está conectado por ' + this.network.type;
				console.log("Network online");
				this.failedNetwork = false;
				this.animacion();
			});

    });
	}	

  ngOnInit() { }

	animacion() {
		if (this.failedNetwork == true) {
			this.ejecutarAnimacion = 'visible';
		} else {
			setTimeout(() => {
				this.ejecutarAnimacion = 'invisible';
			}, 1000);
		}
	}

}

