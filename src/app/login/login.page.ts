import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showFingerPrint = false;
  constructor(public router: Router) {
  }

  ngOnInit() {

  }

  goToHome() {
    //continue with access to the app
    this.router.navigateByUrl('/agenda');
  }

}
