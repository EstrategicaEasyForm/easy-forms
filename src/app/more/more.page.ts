import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public navCtrl: NavController,
    public usersService: UsersService) {

  }

  ngOnInit() {
  }

  logOut() {
    this.usersService.deleteUserAuthToken();
    this.navCtrl.navigateRoot('/login');
  }

}
