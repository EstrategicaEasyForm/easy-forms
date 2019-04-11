import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FingerprintAIO, FingerprintAIOOriginal } from '@ionic-native/fingerprint-aio';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showFingerPrint = false;
  constructor(public router: Router,
    public faio: FingerprintAIOOriginal) { 
    
    //initialize the FingerPrint control
		this.faio.isAvailable().then(result => {
			this.showFingerPrint = true;
		}).catch(err => {
			this.showFingerPrint = false;
		});
  }

  ngOnInit() {
    
  }

  goToHome() {
		//continue with access to the app
    this.router.navigateByUrl('/agenda');
	}

}
