import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
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
	public ordersService: OrdersService) {
		const detail = this.ordersService.getDetailApiParam();
		this.aspiration = detail.aspiration;
		this.order= detail.order;
		this.local=detail.local;
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
		aspirationDetails.push (['Donadora','Raza','Toro','Raza']);
		
		for(var i of [this.aspiration.details.length]) {
			aspirationDetails.push([i.donor, i.donor_breed, i.bull, i.bull_breed]);
		}
		
		let logoSrc = 'assets/imgs/logoInvitroAlfa_968x576.png';
		var docDefinition = {
		content:[
					{
						image :'assets/imgs/logoInvitroAlfa_968x576.png',
						fit: [100, 100],
						alignment: 'left',
						pageBreak: 'after',	
						
					},{	columns:[
									[
										{ text: 'BITCOIN', style: 'header' }, 
										{ text: 'Cryptocurrency Payment System', style: 'sub_header' }, 
										{ text: 'WEBSITE: https://bitcoin.org/', style: 'url' },
									]
								]
					},{
						
						table: {
							widths: ['*', 100, 200, '*', '*', '*'],
							body: aspirationDetails
						}
					}
				],
		styles: {
					header:	{
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
				pageSize: 'A4',
				pageOrientation: 'portrait'
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
							console.log('error 1' + e);
						}
					}); 
				
				} catch (err) {
					console.log('error 2' + err);
				} 

			
	}
	
     saveToDevice(data: any, savefile: any) {
		let options: IWriteOptions = { replace: true };
		 
		this.file.writeFile(this.file.dataDirectory, savefile, data, options);
		console.log('File saved to your device in ' + this.file.dataDirectory);
	}

}
