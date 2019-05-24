import { Injectable } from '@angular/core';
import { AspirationPdfService } from '../aspiration/aspiration.pdf.service';
import { Resolver } from 'dns';


@Injectable({
  providedIn: 'root'
})
export class SendEmailService {

  constructor(public aspirationPdf: AspirationPdfService) {

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
      open: true
    };

    let workSheetPdf;
    //if(type.id==="1") workSheetPdf = this.evaluationPdf;
    if(type.id==="2") workSheetPdf = this.aspirationPdf;
    //if(type.id==="3") workSheetPdf = this.transferPdf;
    //if(type.id==="4") workSheetPdf = this.diagnosticPdf;
    //if(type.id==="5") workSheetPdf = this.sexagePdf;
    //if(type.id==="6") workSheetPdf = this.deliveryPdf;
    return workSheetPdf.makePdf(dataPdf, optionsPdf);
  }

  makeEmail(order, detailApi, workSheet, type, response, pdf) {

    return new Promise(resolve => {

      let textBody = 'Buen día, <br/> Adjunto se encuentra la planilla de ' + type.name + ' asociada con la order de produccion No ' + order.id + ', realizada en el local ' + detailApi.local.name;

      if (response.status === 'success') {
        textBody += ' <br/> <h3 style="color: red"> Ha ocurrido un error al realizar la sincronizacion de esta planilla. <br/> Por favor, pongase en contacto con el administrador del sistema. </h3>';
      }
      const mailSettings = {
        emailFrom: "estrategica.easy.form@gmail.com",
        smtp: "smtp.gmail.com",
        smtpUserName: "estrategica.easy.form",
        smtpPassword: "HqXR8cnnL",
        emailTo: "davithc01@gmail.com",
        emailCC: "camachod@globalhitss.com",
        attachments: [pdf.filename],
        dataDirectory: pdf.dataDirectory,
        subject: "Planilla de " + type.name + " Invitro - Orden de trabajo No " + order.id,
        textBody: textBody
      };
      
      const success = function () {
        resolve({status:"success"});
      }
      
      const failure = function (message) {
        resolve({status:"error", error:message});
      }

      try {
        //"Sendding Email and PDF attached with cordova-plugin-send-email"
        // "https://github.com/EstrategicaEasyForm/cordova-plugin-send-email.git"
        cordova.exec(success, failure, "SMTPClient", "execute", [mailSettings]);
      }
      catch (err) {
        resolve({status:"error", error: err});
      };
    });
  }

}