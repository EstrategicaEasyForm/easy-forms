import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { NavController } from '@ionic/angular';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { OrdersService } from '../orders.service';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public navCtrl: NavController,
    public usersService: UsersService,
	public ordersService: OrdersService,
	public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
	public eventCtrl: Events,
	public alertController: AlertController) {

  }

  ngOnInit() {
  }

  logOut() {
    this.usersService.deleteUserAuthToken();
    this.navCtrl.navigateRoot('/login');
  }
  
  async removeAgendaStogare() {
	  
	const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro que desea borrar la información almacenada en la caché del dispositivo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.ordersService.setDetailsApiStorage(null);
			this.eventCtrl.publish('sync:finish');
			const agendaPage = this.usersService.getDataParamAgenda();
			agendaPage.clearAgenda();
			this.showMessage('Datos borrados exitósamente');
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
  
  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
