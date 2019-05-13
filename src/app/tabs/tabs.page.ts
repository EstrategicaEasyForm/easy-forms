import { Component } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  newAgenda: boolean = false;

  constructor(
    public navCtrl: NavController,
    public usersService: UsersService,
    public events: Events) {

    usersService.getUserAuthToken().then((userAuth) => {

      if (userAuth) {
        this.usersService.setUserAuthToken(userAuth);

        this.events.subscribe('sync:finish', () => {
          this.newAgenda = true;
        }); 
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }
}
