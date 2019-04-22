import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(public router: Router,
    public usersService: UsersService) {

    this.usersService.getToken().then((authUser) => {
      if(!authUser) {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
