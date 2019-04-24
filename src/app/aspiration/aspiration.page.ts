import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;

  constructor(public ordersService: OrdersService) { 
    
    this.aspiration = this.ordersService.getDetailApiParam().aspiration;
  }

  ngOnInit() {
  }

}
