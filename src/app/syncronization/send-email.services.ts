import { Injectable } from '@angular/core';
import { AspirationPdfService } from '../aspiration/aspiration.pdf.service';
import { Resolver } from 'dns';
import { DiagnosticPdfService } from '../diagnostic/diagnostic.pdf.service';
import { SexagePdfService } from '../sexage/sexage.pdf.service';
import { DeliveryPdfService } from '../delivery/delivery.pdf.service';
import { TransferPdfService } from '../transfer/transfer.pdf.service';
import { EvaluationPdfService } from '../evaluation/evaluation.pdf.service';
import { UsersService } from '../users.service';
import { OrdersService } from '../orders.service';


@Injectable({
  providedIn: 'root'
})
export class SendEmailService {

  constructor(
    public evaluationPdf: EvaluationPdfService,
    public aspirationPdf: AspirationPdfService,
    public transferPdf: TransferPdfService,
    public diagnosticPdf: DiagnosticPdfService,
    public sexagePdf: SexagePdfService,
    public deliveryPdf: DeliveryPdfService,
    public userService: UsersService,
    public orderService: OrdersService) {

  }

  async makePdf(order, detailApi, workSheet, type, response) {

    const dataPdf = {
      order: order,
      local: detailApi.local
    };
    dataPdf[type.tag] = workSheet;

    //adding watermark only if was error in grapqh mutation services
    const optionsPdf = {
      watermark: response.status !== 'success',
      open: false
    };

    let workSheetPdf;
    if(type.id === this.orderService.templates[0].id) workSheetPdf = this.evaluationPdf;
    if(type.id === this.orderService.templates[1].id) workSheetPdf = this.aspirationPdf;
    if(type.id === this.orderService.templates[2].id) workSheetPdf = this.transferPdf;
    if(type.id === this.orderService.templates[3].id) workSheetPdf = this.diagnosticPdf;
    if(type.id === this.orderService.templates[4].id) workSheetPdf = this.sexagePdf;
    if(type.id === this.orderService.templates[5].id) workSheetPdf = this.deliveryPdf;
    return workSheetPdf.makePdf(dataPdf, optionsPdf);
  }

  makeEmail(order, detailApi, workSheet, type, response, pdf) {

    return new Promise(resolve => {

	  let textBody = 'Adjunto encontrará copia del procedimiento realizado en sus instalaciones. Por favor confirmar la correcta recepción del correo.' +
	                 '<br/><br/>Archivo adjunto: ' + pdf.filename +
	                 '<br/><br/><br/>Cordialmente,<br/><br/><h2 style="font-weight: bold;"> Equipo técnico</h2><br/>In Vitro Colombia S.A.S.<br/>informes@invitro.com.co<br/>Celular: 3135911966<br/>Tel. (1) 7968626<br/>Carrera 72A # 49A-39 Normandia II Sector<br/>Bogotá-Colombia<br/><br/>Este correo es generado automáticamente por invitro.com.co';
      
      if (response.status === 'error') {
        textBody += ' <br/> <h3 style="color: red"> Ha ocurrido un error al realizar la sincronizacion de esta planilla. <br/> Por favor, pongase en contacto con el administrador del sistema. </h3><br/><ul><li>' + response.error + ' </ul><br/>';
      }
      const mailSettings = {
        emailFrom: 'estrategica.easy.form@gmail.com',
        smtp: 'smtp.gmail.com',
        smtpUserName: 'estrategica.easy.form',
        smtpPassword: 'HqXR8cnnL',

		/* Using for test /
		emailTo: 'jcontreras@estrategicaco.com,',
		emailCC: 'operaciones@estrategicaco.com, cristianjojoa01@gmail.com, edwardmartinez@hotmail.com, felizarazol@unal.edu.co, hsgarzon2020@gmail.com, davithc01@gmail.com',
		
		/* Using for e2e */
		emailTo: 'jcontreras@estrategicaco.com',
		emailCC: 'operaciones@estrategicaco.com, cristianjojoa01@gmail.com',
		
		/* Using for production */
		/*
		emailTo: order.client.email, //client contact email
		emailCC: 'informes@invitro.com.co, '  + this.userService.getUserEmail(), //operator contact email 
		*/
        attachments: [pdf.filename],
        dataDirectory: pdf.dataDirectory,
        subject: 'Orden de producción No  '+ order.id + ' - '+ ' Procedimiento de ' + type.name,
		textBody: textBody
      };

      const success = function (message) {
        resolve({ status: 'success', message: message });
      }

      const failure = function (message) {
        resolve({ status: 'error', error: message });
      }

      try {
        //'Sendding Email and PDF attached with cordova-plugin-send-email'
        // 'https://github.com/EstrategicaEasyForm/cordova-plugin-send-email.git'
        cordova.exec(success, failure, 'SMTPClient', 'execute', [mailSettings]);
      }
      catch (err) {
        resolve({ status: 'error', error: err });
      };
    });
  }

}