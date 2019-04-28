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
  order: any;
  agenda: any;
  signatureImage: any;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(public ordersService: OrdersService) {
  }

  ngOnInit() {
    const detail = this.ordersService.getDetailApiParam();
    this.aspiration = detail.aspiration;
    this.order = detail.order;
    this.agenda = detail.agendas ? detail.agendas[0] : {};
  }

}