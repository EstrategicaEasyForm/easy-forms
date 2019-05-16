import { Component } from '@angular/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import * as jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { OrdersService } from '../orders.service';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
	selector: 'app-pdf-viewer-aspiration',
	templateUrl: './pdf-viewer-aspiration.page.html',
	styleUrls: ['./pdf-viewer-aspiration.page.scss'],
})
export class PdfViewerAspirationPage {
	loading: any;
	aspiration: any;
	order: any;
	local: any;

	constructor(
		public loadingController: LoadingController,
		private file: File,
		private fileOpener: FileOpener,
		public platform: Platform,
		public toastCtrl: ToastController,
		public ordersService: OrdersService) {
		const detail = this.ordersService.getDetailApiParam();
		this.aspiration = detail.aspiration;
		this.order = detail.order;
		this.local = detail.local;
	}
	async presentLoading(msg) {
		this.loading = await this.loadingController.create({
			message: msg
		});
		return await this.loading.present();
	}
	async makePdf() {

		let _self = this;
		pdfmake.vfs = pdfFonts.pdfMake.vfs;

		var aspirationDetails = [];
		var workTeam = [];
		var localsTe = [];
		var i = {};
		var j = {};
		var k = [];

		aspirationDetails.push(['Donadora', 'Raza', 'Toro', 'Raza','Tipo','GI','GII','GIII','Otros','Viables','Total']);
		for (let i of this.aspiration.details) {
			aspirationDetails.push([i.donor, 
									i.donor_breed, 
									i.bull, 
									i.bull_breed,
									i.type,
									i.gi,
									i.gii,
									i.giii,
									i.others,
									i.gi + i.gii + i.giii,
								    i.gi + i.gii + i.giii + i.others
								  ]);
		}
		
		workTeam.push(['Nombre','Teléfono','Correo','Evento','Observación','Departamento','Municipio','Direccion','Fecha']);
		for (let j of this.order.agenda) {
			workTeam.push([j.user.name, 
						   '', 
						   j.user.email, 
						   j.event.name,
						   j.observation,
						   j.department.name,
						   j.municipality.name,
						   j.address,
						   j.start_date
						 ]);
		}
		
		localsTe.push(['Nombre Local','Ciudad','Departamento','Teléfono','Correo','Contacto']);
		for (let k of this.local) {
			localsTe.push([k.name, 
						   k.city, 
						   k.department,
						   '',
						   '',
						   ''
						 ]);
		}


		let logoSrc = 'assets/imgs/logoInvitroAlfa_968x576.png';
		var docDefinition = {
			pageSize: 'A5',
			pageOrientation: 'landscape',
			pageMargins: [ 40, 60, 40, 60 ],
			content: [
				'Cra 72A N° 49A-39 Bogotá',
				'Invitro',
				'(+57 1) 796 86 26 | 313 570 00 23',
				'ivc.logistica@genusplc.com',
				'EQUIPO DE TRABAJO:',
				'Órden de Producción: ' +  this.order.id,
				{
					table: {
							widths: ['*','*','*','*','*','*','*','*','*'],
							body: workTeam
					},
					
				},
				'DETALLES DE ASPIRACION:',
				{
					table: {
							widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
							body: aspirationDetails
					},
					
				},
				'LOCALES TE:',
				{
					table: {
							widths: ['*','*','*','*','*','*'],
							body: localsTe
					},
					
				},
			],
			styles: {
				header: {
					bold: true,
					fontSize: 20,
					alignment: 'right'
				},
				sub_header: {
					fontSize: 18,
					alignment: 'right'
				},
				url: {
					fontSize: 16,
					alignment: 'right'
				}
			},
		};

		try {
			console.log('Iniciando carga de archivo');
			pdfmake.createPdf(docDefinition).getBuffer(function (buffer: Uint8Array) {
				try {
					let utf8 = new Uint8Array(buffer);
					let binaryArray = utf8.buffer;
					_self.saveToDevice(binaryArray, "Invitro.pdf");
					_self.fileOpener.open(_self.file.dataDirectory + "Invitro.pdf", 'application/pdf')
						.then(() => console.log('File is opened'))
						.catch(e => console.log('Error opening file', e));
				} catch (e) {
					this.showMessage(e);
				}
			});

		} catch (err) {
			this.showMessage(err);
		}


	}

	saveToDevice(data: any, savefile: any) {
		let options: IWriteOptions = { replace: true };

		this.file.writeFile(this.file.dataDirectory, savefile, data, options);
		console.log('File saved to your device in ' + this.file.dataDirectory);
	}
	
	async showMessage(message: string) {
     const toast = await this.toastCtrl.create({
       message: message,
       duration: 2000
     });
     toast.present();
    }

}
