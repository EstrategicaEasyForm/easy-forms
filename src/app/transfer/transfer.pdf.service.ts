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
export class TransferPdfService {

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
	async makePdf(data, options) {

		const _self = this;
		let filename = "InVitroTransferencia_";
		if(data && data.order) filename = "InvitroTransferencia_" + data.order.id + "_" + moment().format('YYYYMMDD_HHmm') + ".pdf";
		
		return new Promise(resolve => {
		try {
			const dataDirectory = this.file.dataDirectory;

			pdfmake.vfs = pdfFonts.pdfMake.vfs;

				const photoImage = data.transferApi.photoImage || this.imageSrc.imagePhotoDefault;
				const signatureImage = data.transferApi.signatureImage || this.imageSrc.imageBlank;

				var transferDetails = [];
				var workTeam = [];
				var cont_details = 1;
				var con_discard = {transfers: 0, discards: 0};

				transferDetails.push([
					{ text: 'No.', style: 'title_detail_style' },
					{ text: 'Receptora', style: 'title_detail_style' },
					{ text: 'Embrión', style: 'title_detail_style' },
					{ text: 'Cl', style: 'title_detail_style' },
					{ text: 'Donadora', style: 'title_detail_style' },
					{ text: 'Raza', style: 'title_detail_style' },
					{ text: 'Toro', style: 'title_detail_style' },
					{ text: 'Raza', style: 'title_detail_style' },
					{ text: 'Transferidor', style: 'title_detail_style' },
					{ text: 'Sinc.', style: 'title_detail_style' },
					{ text: 'Obs. para éxamen', style: 'title_detail_style' },
					{ text: 'Local', style: 'title_detail_style' },
				]);
				for (let i of data.transferApi.details_view) {
					if (i.discard === '1') {
						con_discard.transfers++;
					} else {
						con_discard.discards++;
					}
					transferDetails.push([
						{ text: cont_details++, style: 'normal_detail_style' },
						{ text: i.receiver, style: 'normal_detail_style' },
						{ text: i.embryo, style: 'normal_detail_style' },
						{ text: i.embryo_class, style: 'normal_detail_style' },
						{ text: i.donor, style: 'normal_detail_style' },
						{ text: i.donor_breed, style: 'normal_detail_style' },
						{ text: i.bull, style: 'normal_detail_style' },
						{ text: i.bull_breed, style: 'normal_detail_style' },
						{ text: i.transferor, style: 'normal_detail_style' },
						{ text: i.evaluation_detail_id == null ? 'No' : 'Si', style: 'normal_detail_style' },
						{ text: i.comments, style: 'normal_detail_style' },
						{ text: i.local != null ? i.local.name : ' ', style: 'normal_detail_style' },
					]);
				}

				workTeam.push([
					{ text: 'Nombre del técnico', style: 'title_table_style' },
					{ text: 'Evento', style: 'title_table_style' },
					{ text: 'Fecha', style: 'title_table_style' },
					{ text: 'Observaciones', style: 'title_table_style' }
				]);
				
				const employees = [];
				let employee: string;
				for (let agenda of data.order.agenda) {
				  if (agenda.event.id === '3' && data.local.name === agenda.name_local) {
					if(agenda.user) {
						employee = agenda.user.name;
					}
					else if(agenda.other_user) {
						employee = agenda.other_user.name;
					}
					else {
						employee = '';
					}
					const start_date = agenda.all_day ? agenda.start_date.substr(0,10)  : agenda.start_date;
					employees.push({ 
						name: employee, 
						eventName:agenda.event.name, 
						start_date: start_date,
						observation: agenda.observation 
					});
				  }
				}
				
				for (let j of employees) {
					workTeam.push([
						j.name,
						j.eventName,
						j.start_date,
						j.observation,
					]);
				}
				if(employees.length < 3) {
					for(let i=0;i<3-employees.length;i++) {
						workTeam.push([
							'\r',
							'\r',
							'\r',
							'\r',
						]);
					}	
				}

				let docDefinition = {
					pageSize: 'LETTER',
					pageMargins: [72,72,72,72],
					pageOrientation: 'landscape',
					header: {
						image: this.imageSrc.logoSrcBase64,
						width: 90,
						height: 55,
						alignment: 'right',
						margin: [25,25],
						opacity: 0.5,
					},
					footer: {
						text: 'Carrera 72A # 49A - 39 Bogotá, (+57 1) 7968626 – 3135700023 – logística@invitro.com.co',
						alignment: 'center',
						fontSize: 12,
						opacity: 0.3,
					},
					content: [
						{
							text: 'REPORTE DE SERVICIO TÉCNICO',
							fontSize: 16,
							alignment: 'left',
						},
						{
							text: ' ',
							fontSize: 15,
						},
						{
							text: 'FECHA DE REPORTE: ' + moment().format('DD-MM-YYYY'),
							fontSize: 12,
							alignment: 'right',
						},
						{
							text: 'DATOS DEL CLIENTE',
							style: 'subtitle_style'
						},
						{
							text: ' ',
							fontSize: 12,
						},
						{
							columns: [
								{
									width: 'auto',
									table: {
										fontSize: 12,
										widths: ['auto', '*'],
										body: [
											[{ text: 'Razón Social:', style: 'normal_style' }, { text: data.order.client.bussiness_name, style: 'normal_style' }],
											[{ text: 'No. Identificación:', style: 'normal_style' }, { text: data.order.client.identification_number, style: 'normal_style' }],
											[{ text: 'Contacto:', style: 'normal_style' }, { text: data.order.client.contact, style: 'normal_style' }],
											[{ text: 'Correo electrónico:', style: 'normal_style' }, { text: data.order.client.email, style: 'normal_style' }],
											[{ text: 'Móvil:', style: 'normal_style' }, { text: data.order.client.cellphone, style: 'normal_style' }],
										]
									},
									layout: 'noBorders'
								},
								{
									width: '*', text: ''
								},
								{
									width: '*', text: ''
								},
							]
						},
						{ text: '\n\ ' },
						{
							text: 'PERSONAL ASIGNADO',
							style: 'subtitle_style'
						},
						{
							text: ' ',
							fontSize: 12,
						},
						{
							columns: [
								{
									width: '*', text: ''
								},
								{
									width: 'auto',
									table: {
										headerRows: 1,
										widths: [140, 100, 100, 140],
										body: workTeam
									},
								},
								{
									width: '*', text: ''
								},
							]
						},
						{ text: '\n\ ' },
						{
							text: 'INFORMACIÓN DEL SERVICIO',
							style: 'subtitle_style'
						},
						{
							text: ' ',
							fontSize: 12,
						},
						{
							columns: [
								{
									width: '*', text: ''
								},
								{
									width: 'auto',
									table: {
										fontSize: 12,
										widths: ['auto', 120, 40, 'auto', 120],
										body: [
											[{ text: 'Orden de prod.: ', style: 'normal_style' },
											{ text: data.order.id, style: 'normal_style' },
												'',
											{ text: 'Fecha transferencia: ', style: 'normal_style' },
											{ text: data.transferApi.date, style: 'normal_style' },
											],
											[{ text: 'Ciudad: ', style: 'normal_style' },
											{ text: data.local.city, style: 'normal_style' },
												'',
											{ text: 'Local: ', style: 'normal_style' },
											{ text: data.local.name, style: 'normal_style' },
											]
										]
									},
									layout: 'noBorders'
								},
								{
									width: '*', text: ''
								},
							]
						},
						{
							text: 'DETALLES DEL SERVICIO',
							style: 'subtitle_style',
							pageBreak: 'before',
						},
						{
							text: ' ',
							fontSize: 12,
						},
						{
							columns: [
								{
									width: '*', text: ''
								},
								{
									width: 'auto',
									table: {
										headerRows: 1,
										alignment: 'center',
										widths: ['auto', 55, 45, 'auto', 50, 45, 50, 45, 65, 'auto', 65, 60],
										body: transferDetails,
									},
								},
								{
									width: '*', text: ''
								},
							]
						},
						{
							text: 'Total transferidos: ' + con_discard.transfers,
							style: 'normal_style',
						},
						{
							text: 'Total descartados: ' + con_discard.discards,
							style: 'normal_style',
						},
						{ text: '\n\ ' },
						{
							text: 'DATOS GENERALES',
							style: 'subtitle_style'
						},
						{
							text: ' ',
							fontSize: 12,
						},
						{
							text: 'Nombre del técnico  : ' + data.transferApi.transferor,
							style: 'normal_style',
						},
						{ text: '\n\ ' },
						{
							text: 'Observaciones  : ' + data.transferApi.comments,
							style: 'normal_style',
						},
						{
							columns: [
								[	{ text: '\n\ ' },
									{
										image: signatureImage,
										width: 400,
										height: 120,
									},
								],
								[	{ text: '\n\ ' },
									{ text: '\n\ ' },
									{
										image: photoImage,
										width: 100,
										height: 120,
									}
								],
							]
						},
						{ text: 'Nombre del encargado  : ' + data.transferApi.received_by, alignment: 'left' },
						{ text: 'Cédula  : ' + data.transferApi.identification_number, alignment: 'left'  }
					],
					styles: {
						subtitle_style: {
							bold: true,
							fontSize: 12,
							decoration: 'underline',
							alignment: 'left',
						},
						normal_style: {
							fontSize: 12,
							bold: false,
							alignment: 'left',
						},
						normal_detail_style: {
							fontSize: 11,
							bold: false,
							alignment: 'left',
						},
						title_detail_style: {
							fontSize: 11,
							bold: true,
							alignment: 'center',
						},
						title_table_style: {
							fontSize: 11,
							bold: true,
							alignment: 'center',
						}
					},
				};

				if (options.watermark) {
					docDefinition = Object.assign(docDefinition, { watermark: { text: 'Borrador', color: 'gray', opacity: 0.2, bold: true, italics: false } });
				}
		
				pdfmake.createPdf(docDefinition).getBuffer(function (buffer: Uint8Array) {
					try {
						let utf8 = new Uint8Array(buffer);
						let binaryArray = utf8.buffer;

						_self.saveToDevice(binaryArray, filename)
							.then((result:any) => {
								if(result.status==="success") {
									if (options && options.open) {
										_self.fileOpener.open(dataDirectory + filename, 'application/pdf')
											.then(() => resolve({ status: "success", message: "File is opened", filename: filename, dataDirectory: dataDirectory }))
											.catch(e => resolve({ status: "error", error: e, filename: filename }));
									}
									//Retorna el codigo binario del archivo pdf generado
									else {
										resolve({ status: "success", filename: filename, dataDirectory: dataDirectory });
									}
								}
								else {
									/*if (options && options.open) {
										var file = new Blob([binaryArray], { type: 'application/pdf' });
										var fileUrl = URL.createObjectURL(file);

										//open it via a link
										var fileName = "test.pdf";
										var a = document.createElement("a");
										document.body.appendChild(a);
										a.href = fileUrl;
										a.download = fileName;
										a.click();
										//open it directly 
										window.open(fileUrl);
									}*/
									resolve({ status: "error", error: result.error, filename: filename });
								}
							});

					} catch (e) {
						const errm = e.message ? e.message : typeof e === 'string' ? e : JSON.stringify(e);
						resolve({ status: "error", error: errm, filename: filename });
					}
				});

			} catch (err) {
				const errm = err.message ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
				resolve({ status: "error", error: errm, filename: filename });
			}
		});
	}
	saveToDevice(data: any, savefile: any) {
		return new Promise(resolve => {
			let options: IWriteOptions = { replace: true };
			try {
				this.file.writeFile(this.file.dataDirectory, savefile, data, options)
				.then((result) => {
					resolve({ status: "success"});
				}).catch((error) => {
					const errm = error.message ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
					resolve({ status: "error", error: errm});
				});
			} catch(error){
				const errm = error.message ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
				resolve({ status: "error", error: errm});
			};
		});	
	}
}
 