import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;
  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(public ordersService: OrdersService) { 
    
    this.aspiration = this.ordersService.getDetailApiParam().aspiration;
  }

  ngOnInit() {
  }

}
