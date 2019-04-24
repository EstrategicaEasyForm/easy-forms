import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  constructor(private router: ActivatedRoute) { 
    this.router.queryParamMap.subscribe(params => {
      if (params && params.keys) {
        console.log(params.keys);
      }
    });
  }

  ngOnInit() {
  }

}
