import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  orders: any;
  
  constructor(public ordersService:OrdersService) { }

  ngOnInit() {
    const _self = this;
    const onSuccess = function(ordersList) {
      if(ordersList){
        _self.orders = ordersList;
      }
    }
    const onError = function(error) {
      console.log(error);
    }
    this.ordersService.getOrderList(onSuccess,onError);
  }

}
