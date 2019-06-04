import { Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { OrdersService } from '../orders.service';
import * as moment from 'moment-timezone';
import { HttpClient } from '@angular/common/http';
import { ImageSrc } from '../imageSrc';

@Injectable({
	providedIn: 'root'
})
export class DeliveryPdfService {

	constructor(
		public loadingController: LoadingController,
		private file: File,
		private fileOpener: FileOpener,
		public platform: Platform,
		public toastCtrl: ToastController,
		public ordersService: OrdersService,
		public http: HttpClient,
		public imageSrc: ImageSrc) {

	}

	// params: 
	// data: {
	//		delivery: any,
	//		order: any,
	//		local: any
	// }
	// callback: function,
	// options {
	//   watermark: true|false,
	//	 open: true|false
	// }
	async makePdf(data, options) {

		pdfmake.vfs = pdfFonts.pdfMake.vfs;

		var deliveryDetails = [];
		var workTeam = [];
		var localsTe = [];
		var i = {};
		var j = {};
		var k = [];

		deliveryDetails.push(['Donadora', 'Raza', 'Toro', 'Raza', 'Tipo', 'GI', 'GII', 'GIII', 'Otros', 'Viables', 'Total']);
		for (let i of data.deliveryApi.details) {
			deliveryDetails.push([i.donor,
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

		workTeam.push(['Nombre', 'Teléfono', 'Correo', 'Evento', 'Observación', 'Departamento', 'Municipio', 'Direccion', 'Fecha']);
		for (let j of data.order.agenda) {
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

		localsTe.push(['Nombre Local', 'Ciudad', 'Departamento', 'Teléfono', 'Correo', 'Contacto']);
		for (let k of data.local) {
			localsTe.push([k.name,
			k.city,
			k.department,
				'',
				'',
				''
			]);
		}

		const docDefinition = {
			pageSize: 'A5',
			pageOrientation: 'landscape',
			pageMargins: [40, 60, 40, 60],
			content: [
				'Cra 72A N° 49A-39 Bogotá',
				'Invitro',
				'(+57 1) 796 86 26 | 313 570 00 23',
				'ivc.logistica@genusplc.com',
				'EQUIPO DE TRABAJO:',
				'Órden de Producción: ' + data.order.id,
				{
					image: this.imageSrc.logoSrcBase64,
					width: 150,
					height: 150,
				},
				{
					table: {
						widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],
						body: workTeam
					},

				},
				'DETALLES DE ENTREGA:',
				{
					table: {
						widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
						body: deliveryDetails
					},

				},
				'LOCALES TE:',
				{
					table: {
						widths: ['*', '*', '*', '*', '*', '*'],
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

		const _self = this;

		return new Promise(resolve => {
			
			const dataDirectory = this.file.dataDirectory;
			const filename = "InvitroAspiracion_" + data.order.id + "_" + moment().format('YYYYMMDD_HHmm') + ".pdf";

			try {
				pdfmake.createPdf(docDefinition).getBuffer(function (buffer: Uint8Array) {
					try {
						let utf8 = new Uint8Array(buffer);
						let binaryArray = utf8.buffer;

						_self.saveToDevice(binaryArray, filename);

						if (options && options.open) {
							_self.fileOpener.open(dataDirectory + filename, 'application/pdf')
								.then(() => resolve({ status: "success", message: "File is opened", filename: filename, dataDirectory: dataDirectory }))
								.catch(e => resolve({ status: "error", error: e, filename: filename }));
						}
						//Retorna el codigo binario del archivo pdf generado
						else {
							resolve({ status: "success", filename: filename, dataDirectory: dataDirectory });
						}

					} catch (e) {
						const errm = e.message ? e.message : typeof e === 'string' ? e : '';
						resolve({ status: "error", error: errm, filename: filename });
					}
				});

			} catch (err) {
				const errm = err.message ? err.message : typeof err === 'string' ? err : '';
				resolve({ status: "error", error: errm, filename: filename });
			}
		});

	}
	saveToDevice(data: any, savefile: any) {
		let options: IWriteOptions = { replace: true };

		this.file.writeFile(this.file.dataDirectory, savefile, data, options);
		console.log('File saved to your device in ' + this.file.dataDirectory);
	}
}
