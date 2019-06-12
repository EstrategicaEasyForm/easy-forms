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

		const _self = this;
		let filename = "InVitroAspiracion_";
		if(data && data.order) filename = "InvitroAspiracion_" + data.order.id + "_" + moment().format('YYYYMMDD_HHmm') + ".pdf";
		
		return new Promise(resolve => {
		try {
			const dataDirectory = this.file.dataDirectory;
			

			
			pdfmake.vfs = pdfFonts.pdfMake.vfs;

				const photoImage = data.aspirationApi.photoImage || this.imageSrc.imagePhotoDefault;
				const signatureImage = data.aspirationApi.signatureImage || this.imageSrc.imageBlank;

				var aspirationDetails = [];
				var workTeam = [];
				var cont_details = 0;

				aspirationDetails.push([
					{ text: 'No.', style: 'title_table_style' },
					{ text: 'Hora', style: 'title_table_style' },
					{ text: 'Donadora', style: 'title_table_style' },
					{ text: 'Raza', style: 'title_table_style' },
					{ text: 'Toro', style: 'title_table_style' },
					{ text: 'Raza', style: 'title_table_style' },
					{ text: 'Tipo', style: 'title_table_style' },
					{ text: 'Local', style: 'title_table_style' },
					{ text: 'GI', style: 'title_table_style' },
					{ text: 'GII', style: 'title_table_style' },
					{ text: 'GIII', style: 'title_table_style' },
					{ text: 'Otros', style: 'title_table_style' },
					{ text: 'Viables', style: 'title_table_style' },
				]);
				for (let i of data.aspirationApi.details) {
					aspirationDetails.push([
						{ text: cont_details++, style: 'title_table_style' },
						{ text: i.arrived_time, style: 'title_table_style' },
						{ text: i.donor, style: 'title_table_style' },
						{ text: i.donor_breed, style: 'title_table_style' },
						{ text: i.bull, style: 'title_table_style' },
						{ text: i.bull_breed, style: 'title_table_style' },
						{ text: i.type, style: 'title_table_style' },
						{ text: i.local.name, style: 'title_table_style' },
						{ text: i.gi, style: 'title_table_style' },
						{ text: i.gii, style: 'title_table_style' },
						{ text: i.giii, style: 'title_table_style' },
						{ text: i.others, style: 'title_table_style' },
						{ text: i.gi + i.gii + i.giii, style: 'title_table_style' },
					]);
				}

				workTeam.push([
					{ text: 'Nombre del técnico', style: 'title_table_style' },
					{ text: 'Evento', style: 'title_table_style' },
					{ text: 'Fecha', style: 'title_table_style' },
					{ text: 'Observaciones', style: 'title_table_style' }
				]);
				if(data.agenda)
				for (let j of data.agenda) {
					workTeam.push([
						j.user.name,
						j.event.name,
						j.start_date,
						j.observation
					]);
				}

				let docDefinition = {
					pageSize: 'A4',
					pageMargins: [40, 60, 40, 60],
					pageOrientation: 'landscape',
					header: {
						image: this.imageSrc.logoSrcBase64,
						width: 110,
						height: 60,
						alignment: 'right',
					},
					footer: {
						text: 'Carrera 72A # 49A - 39 Bogotá, (+57 1) 7968626 – 3135700023 – logística@invitro.com.co',
						alignment: 'center',
						fontSize: 12,
						opacity: 0.3,
					},
					content: [
						{
							text: '\n\ REPORTE DE SERVICIO TÉCNICO',
							fontSize: 16,
							alignment: 'left',
						},
						{
							text: '\n\ FECHA DE REPORTE: 28-03-2019',
							fontSize: 12,
							alignment: 'right',
						},
						{
							text: 'DATOS DEL CLIENTE',
							style: 'subtitle_style'
						},
						{
							columns: [
								{
									width: 'auto',
									table: {
										fontSize: 12,
										widths: ['*', '*'],
										body: [
											[{ text: 'Razon Social:', style: 'normal_style' }, { text: data.order.client.bussiness_name, style: 'normal_style' }],
											[{ text: 'No. Identificación:', style: 'normal_style' }, { text: data.order.client_id, style: 'normal_style' }],
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
						{
							text: 'PERSONAL ASIGNADO',
							style: 'subtitle_style'
						},
						{ text: '\n\ ' },
						{
							columns: [
								{
									width: '*', text: ''
								},
								{
									width: 'auto',
									table: {
										fontSize: 9,
										headerRows: 1,
										widths: [140, 100, 60, 140],
										body: workTeam
									},
								},
								{
									width: '*', text: ''
								},
							]
						},
						{
							text: 'INFORMACIÓN DEL SERVICIO',
							style: 'subtitle_style'
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
										widths: ['*', '*', 40, '*', '*'],
										body: [
											[{ text: 'Orden de prod.: ', style: 'normal_style' },
											{ text: data.order.id, style: 'normal_style' },
												'',
											{ text: 'Fecha OPU : ', style: 'normal_style' },
											{ text: data.aspirationApi.date, style: 'normal_style' },
											],
											[{ text: 'Local: ', style: 'normal_style' },
											{ text: data.local.name, style: 'normal_style' },
												'',
											{ text: 'Receptoras sinc. : ', style: 'normal_style' },
											{ text: data.aspirationApi.synchronized_receivers, style: 'normal_style' },
											],
											[{ text: 'Medio OPU: ', style: 'normal_style' },
											{ text: data.aspirationApi.medium_opu, style: 'normal_style' },
												'',
											{ text: 'Lote medio OPU : ', style: 'normal_style' },
											{ text: data.aspirationApi.medium_lot_opu, style: 'normal_style' },
											],
											[{ text: 'Aspirador: ', style: 'normal_style' },
											{ text: data.aspirationApi.aspirator, style: 'normal_style' },
												'',
											{ text: 'Buscador : ', style: 'normal_style' },
											{ text: data.aspirationApi.searcher, style: 'normal_style' },
											],
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
							style: 'subtitle_style'
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
										widths: ['auto', 'auto', 100, 100, 100, 100, 'auto', 100, 'auto', 'auto', 'auto', 'auto', 'auto'],
										body: aspirationDetails,
									},
								},
								{
									width: '*', text: ''
								},
							]
						},
						{
							text: 'DATOS GENERALES',
							style: 'subtitle_style'
						},
						{
							text: 'Temperatura de llegada:' + data.aspirationApi.arrived_temperature,
							style: 'normal_style',
						},
						{
							text: 'Tipo de transporte:' + data.aspirationApi.transport_type,
							style: 'normal_style',
						},
						{
							text: 'Observaciones:' + data.aspirationApi.comments,
							style: 'normal_style',
						},
						{
							columns: [
								{
									width: '*', text: ''
								},
								[	{
										image: signatureImage,
										width: 500,
										height: 200,
									},
									{ text: 'Nombre del encargado: ' + data.aspirationApi.received_by },
									{ text: 'Cédula: ' + data.aspirationApi.identification_number }
								],
								['',],
								{
									image: photoImage,
									width: 300,
									height: 300,
								},
								{
									width: '*', text: ''
								},
							]
						},
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
						title_table_style: {
							fontSize: 11,
							bold: true,
							alignment: 'center',
						}
					},
				};

				if (options.watermark) {
					docDefinition = Object.assign(docDefinition, { watermark: { text: 'Borrador', color: 'gray', opacity: 0.3, bold: true, italics: false } });
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
