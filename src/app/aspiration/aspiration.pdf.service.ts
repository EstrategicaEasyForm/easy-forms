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
import { url } from 'inspector';

@Injectable({
	providedIn: 'root'
})
export class AspirationPdfService {

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
	//		aspiration: any,
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

		var aspirationDetails = [];
		var workTeam = [];
		var localsTe = {};
		var i = {};
		var j = {};
		var k = [];

		aspirationDetails.push(['Donadora', 'Raza', 'Toro', 'Raza', 'Tipo', 'GI', 'GII', 'GIII', 'Otros', 'Viables', 'Total']);
		for (let i of data.aspirationApi.details) {
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

		workTeam.push(['Nombre', 'Correo', 'Evento', 'Observación', 'Departamento', 'Municipio', 'Fecha']);
		for (let j of data.order.agenda) {
			workTeam.push([j.user.name,
			j.user.email,
			j.event.name,
			j.observation,
			j.department.name,
			j.municipality.name,
			j.start_date
			]);
		}

		//localsTe.(['Nombre Local', 'Ciudad', 'Departamento', 'Teléfono', 'Correo', 'Contacto']);
		/*for (let k of data.local) {
			k.name = data.local.name,
			k.city = data.local.city,
			k.department = data.local.department
		}*/

		const docDefinition = {
			pageSize: 'A4',
			watermark: { text: 'Borrador', color: 'blue', opacity: 0.5, bold: true, italics: false },
			pageOrientation: 'landscape',
			pageMargins: [40, 60, 40, 60],
			content: [
				{
					columns: [
						{
							image: this.imageSrc.logoSrcBase64,
							width: 120,
							height: 80,
						},
						{
							fontSize: 12,
							alignment: 'right',
							bold: true,
							text: 'Cra 72A N° 49A-39 Bogotá \n\ Invitro \n\ (+57 1) 796 86 26 | 313 570 00 23 \n\ ivc.logistica@genusplc.com \n\ '
						},
					]
				},
				{ text: '\n\ ÓRDEN DE PRODUCCIÓN: ' + data.order.id, styles: 'header' },
				{ text: '\n\n\ DATOS:', styles: 'sub_header' },
				{ text: '\n\n\ ' },
				{
					columns: [
						[
							{ text: 'Fecha:', styles: 'sub_header2' }, { text: data.order.date, styles: 'sub_header2' },
							{ text: '\n\ N° Identificación:', styles: 'sub_header2' }, { text: data.order.client_id, styles: 'sub_header2' },
							{ text: '\n\ Razon Social:', styles: 'sub_header2' }, { text: data.order.client.bussiness_name, styles: 'sub_header2' },
							{ text: '\n\ Departamento:', styles: 'sub_header2' }, { text: data.order.client.departmentOne.name, styles: 'sub_header2' },
							{ text: '\n\ Ciudad:', styles: 'sub_header2' }, { text: data.order.client.citiesOne.name, styles: 'sub_header2' }
						], [
							{ text: 'Correo Electrónico:', styles: 'sub_header2' }, { text: data.order.client.email, styles: 'sub_header2' },
							{ text: '\n\ Contacto:', styles: 'sub_header2' }, { text: data.order.client.contact, styles: 'sub_header2' },
							{ text: '\n\ Cargo:', styles: 'sub_header2' }, { text: data.order.client.position, styles: 'sub_header2' },
							{ text: '\n\ Dirección:', styles: 'sub_header2' }, { text: data.order.client.address, styles: 'sub_header2' },
							{ text: '\n\ Teléfono:', styles: 'sub_header2' }, { text: data.order.client.cellphone, styles: 'sub_header2' }

						]
					]
				},
				{ text: '\n\n\ INFORMACIÓN DEL EVENTO:', styles: 'header' },
				{ text: '\n\n\ EQUIPO DE TRABAJO: \n\n', styles: 'sub_header' },
				{
					columns: [
						{
							width: '*', text: ''
						},
						{
							width: 'auto',
							table: {
								fontSize: 9,
								widths: [100, 140, 60, 120, 80, 60, 60],
								body: workTeam,
							},
							layout: {
								fillColor: function (rowIndex, node, columnIndex) {
									return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
								}
							}
						},
						{
							width: '*', text: ''
						},
					]
				},
				{ text: '\n\n\n\ DETALLES DE ASPIRACION:', alignment: 'left', fontSize: 15, bold: true },
				{
					table: {
						widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
						body: aspirationDetails
					},

				},
				/*'LOCALES TE:',
				{
					table: {
						widths: ['*', '*', '*', '*', '*', '*'],
						body: localsTe
					},
				
				},*/
				{
					image: data.aspirationApi.signatureImage,
					width: 150,
					height: 150,
				},
				{
					image: data.aspirationApi.photoImage,
					width: 150,
					height: 150,
				},
			],
			styles: {
				header: {
					bold: true,
					fontSize: 18,
					alignment: 'left'
				},
				sub_header: {
					bold: true,
					fontSize: 15,
					alignment: 'left'
				},
				sub_header2: {
					bold: true,
					fontSize: 12,
					alignment: 'right'
				},
				defaultStyle: {
					fontSize: 12,
					alignment: 'left'
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
