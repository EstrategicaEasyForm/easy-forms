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
export class EvaluationPdfService {

	constructor(
		public loadingController: LoadingController,
		private file: File,
		private fileOpener: FileOpener,
		public platform: Platform,
		public toastCtrl: ToastController,
		public ordersService: OrdersService,
		public http: HttpClient,
		public imageSrc: ImageSrc
	) { }

	// params: 
	// data: {
	//		Evaluation: any,
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

		var evaluationDetails = [];
		var workTeam = [];
		var localsTe = [];
		var i = {};
		var j = {};
		var k = [];

		evaluationDetails.push([{ text: 'Id. Animal', alignment: 'center', bold: true },
		{ text: 'Chapeta', alignment: 'center', bold: true },
		{ text: 'Apta', alignment: 'center', bold: true },
		{ text: 'Sincronizada', alignment: 'center', bold: true },
		{ text: 'Local', alignment: 'center', bold: true },
		{ text: 'Diagnóstico', alignment: 'center', bold: true }
		]);
		for (let i of data.evaluationApi.details) {
			evaluationDetails.push([
			i.id_animal,
			i.chapeta,
			i.fit,
			i.synchronized,
			i.local,
			i.diagnostic
			]);
		}

		workTeam.push(['Nombre',
			{ text: 'Correo', alignment: 'center', bold: true },
			{ text: 'Evento', alignment: 'center', bold: true },
			{ text: 'Observación', alignment: 'center', bold: true },
			{ text: 'Departamento', alignment: 'center', bold: true },
			{ text: 'Municipio', alignment: 'center', bold: true },
			{ text: 'Fecha', alignment: 'center', bold: true }]);
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

		const docDefinition = {
			pageSize: 'A4',
			watermark: { text: 'Borrador', color: 'gray', opacity: 0.3, bold: true, italics: false },
			pageMargins: [40, 60, 40, 60],
			pageOrientation: 'landscape',
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
				{ text: '\n\ ÓRDEN DE PRODUCCIÓN: ' + data.order.id, bold: true, fontSize: 18, alignment: 'left' },
				{ text: '\n\ DATOS:', bold: true, fontSize: 15, alignment: 'left' },
				{ text: '\n\ ' },
				{
					columns: [
						{
							width: '*', text: ''
						},
						{
							width: 'auto',
							table: {
								fontSize: 12,
								widths: ['*', '*', '*', '*'],
								body: [
									[{ text: 'Fecha:', alignment: 'right' }, data.order.date, { text: 'Correo Electrónico:', alignment: 'right' }, { text: data.order.client.email, alignment: 'left' }],
									[{ text: 'N° Identificación:', alignment: 'right' }, data.order.client_id, { text: 'Contacto:', alignment: 'right' }, { text: data.order.client.contact, alignment: 'left' }],
									[{ text: 'Razon Social:', alignment: 'right' }, data.order.client.bussiness_name, { text: 'Cargo:', alignment: 'right' }, { text: data.order.client.position, alignment: 'left' }],
									[{ text: 'Departamento:', alignment: 'right' }, data.order.client.departmentOne.name, { text: 'Dirección:', alignment: 'right' }, { text: data.order.client.address, alignment: 'left' }],
									[{ text: 'Ciudad:', alignment: 'right' }, data.order.client.citiesOne.name, { text: 'Teléfono:', alignment: 'right' }, { text: data.order.client.cellphone, alignment: 'left' }],
								]
							},
							layout: 'noBorders'
						},
						{
							width: '*', text: ''
						},
					]
				},
				{ text: '\n\n\ INFORMACIÓN DEL EVENTO:', bold: true, fontSize: 15, alignment: 'left' },
				{ text: '\n\ EQUIPO DE TRABAJO: ', bold: true, fontSize: 15, alignment: 'left' },
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
								widths: [100, 140, 60, 120, 80, 60, 60],
								header: { alignment: 'center', bold: true },
								body: workTeam
							},
							layout: {
								fillColor: function (rowIndex, node, columnIndex) {
									return (rowIndex === 0) ? '#b9d2e8' : null;
								}
							}
						},
						{
							width: '*', text: ''
						},
					]
				},
				{ text: '\n\n\ LOCALES TE:', alignment: 'left', fontSize: 15, bold: true },
				{ text: '\n\ ' },
				{
					columns: [
						{
							width: '*', text: ''
						},
						{
							width: 'auto',
							table: {
								fontSize: 12,
								widths: [120, 'auto', 'auto', 'auto', 120, 120],
								body: [
									[
										{ text: 'Nombre Local', alignment: 'center', bold: true },
										{ text: 'Ciudad', alignment: 'center', bold: true },
										{ text: 'Departamento', alignment: 'center', bold: true },
										{ text: 'Teléfono', alignment: 'center', bold: true },
										{ text: 'Correo', alignment: 'center', bold: true },
										{ text: 'Contacto', alignment: 'center', bold: true }
									],
									[
										{ text: data.local.name, alignment: 'left' },
										{ text: data.local.city, alignment: 'left' },
										{ text: data.local.department, alignment: 'left' },
										{ text: data.order.client.cellphone, alignment: 'left' },
										{ text: data.order.client.email, alignment: 'left' },
										{ text: data.order.client.contact, alignment: 'left' }
									],
								],
							},
							layout: {
								fillColor: function (rowIndex, node, columnIndex) {
									return (rowIndex === 0) ? '#b9d2e8' : null;
								}
							}
						},
						{
							width: '*', text: ''
						},
					]
				}, { text: '\n\n\ DETALLES DE EVALUACIÓN:', alignment: 'left', fontSize: 15, bold: true },
				{ text: '\n\ ' },
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
								fontSize: 9,
								widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
								body: evaluationDetails,
							},
							layout: {
								fillColor: function (rowIndex, node, columnIndex) {
									return (rowIndex === 0) ? '#b9d2e8' : null;
								}
							}
						},
						{
							width: '*', text: ''
						},
					]
				},
				{ text: '\n\n\ NOMBRE Y FIRMA DEL ENCARGADO', alignment: 'center', pageBreak: 'before', fontSize: 18, bold: true },
				{ text: '\n\n\ ' },
				{
					columns: [
						{
							width: '*', text: ''
						},
						{
							image: data.evaluationApi.signatureImage,
							width: 700,
							height: 300,
						},
						{
							width: '*', text: ''
						},
					],
				},
				{ text: data.evaluationApi.receiver_name, alignment: 'center', fontSize: 15, bold: true },
				{ text: data.evaluationApi.identification_number, alignment: 'center', fontSize: 15, bold: true },
				{ text: '\n\n\ FOTO EVIDENCIA DEL EVENTO', alignment: 'center', pageBreak: 'before', fontSize: 18, bold: true },
				{ text: '\n\n\ ' },
				{
					columns: [
						{
							width: '*', text: ''
						},
						{
							image: data.evaluationApi.photoImage,
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
				header: {
					bold: true,
					fontSize: 10,
					alignment: 'center'
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
			},
		};

		const _self = this;

		return new Promise(resolve => {

			const dataDirectory = this.file.dataDirectory;
			const filename = "InvitroEvaluacion_" + data.order.id + "_" + moment().format('YYYYMMDD_HHmm') + ".pdf";

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