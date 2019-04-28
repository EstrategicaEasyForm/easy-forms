import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(
    public navCtrl: NavController,
    public usersService: UsersService) {
    usersService.getUserAuthToken().then((userAuth) => {
      if (!userAuth) {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }
}
