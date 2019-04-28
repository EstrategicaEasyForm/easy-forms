import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';

@Component({
  selector: 'app-sexage',
  templateUrl: './sexage.page.html',
  styleUrls: ['./sexage.page.scss'],
})
export class SexagePage implements OnInit {

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;  
  constructor() { }

  ngOnInit() {
  }

}
