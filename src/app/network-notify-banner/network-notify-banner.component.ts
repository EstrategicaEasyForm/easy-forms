import { Component, OnInit } from '@angular/core';
import { NetworkNotifyService } from '../network-notify.service';
import { Platform,  Events } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-network-notify-banner',
  templateUrl: './network-notify-banner.component.html',
	styleUrls: ['./network-notify-banner.component.scss'],
	animations: [
		trigger('banner-state', [
      state('visible', style({
        opacity: 1
      })),
      state('invisible', style({
        opacity: 0.1
      })),
			transition('visible => invisible', animate('1000ms linear')),
			transition('invisible => visible', animate('1000ms linear')),
    ])
	],
})
export class NetworkNotifyBannerComponent implements OnInit {
	ejecutarAnimacion : String = 'invisible';
	failedNetwork: boolean = false;
	constructor(public platform: Platform, public events: Events,
			public networkProvider: NetworkNotifyService) {
  	this.platform.ready().then(() => {

			this.networkProvider.initializeNetworkEvents();

   		// Offline event
	    this.events.subscribe('network:offline', () => {
				console.log("Network offline");
				this.failedNetwork = true;
				this.animacion();
	    });

	    // Online event
	    this.events.subscribe('network:online', () => {
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
			this.ejecutarAnimacion = 'invisible';
		}
	}

}
