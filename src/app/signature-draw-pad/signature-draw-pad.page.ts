import { Component } from '@angular/core';
import { SignatureDrawPad } from '../signature-draw-pad/signature-draw-pad';
import { ViewChild } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';


@Component({
  selector: 'app-signature-draw-pad',
  templateUrl: './signature-draw-pad.page.html',
  styleUrls: ['./signature-draw-pad.page.scss'],
})
export class SignatureDrawPadPage {

  @ViewChild(SignatureDrawPad) public signatureDrawPad: SignatureDrawPad;
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController) {

  }

  closeModal() {
    this.navCtrl.pop();
  }

  signaturePadOptions = {};
  initSignature() {
    this.signatureDrawPad.initSignaturePad(this.signaturePadOptions);
  }

  signatureImage: any;
  drawComplete() {
    this.signatureImage = this.signatureDrawPad.toDataURL();
    let data = { signatureImage: this.signatureImage };
    this.modalCtrl.dismiss(data);
  }

  drawClear() {
    this.signatureDrawPad.clear();
  }

  ngAfterViewInit() {
    if (this.signatureDrawPad) {
      this.signatureDrawPad.initSignaturePad(this.signaturePadOptions);
      this.signatureDrawPad.clear();
      this.signatureDrawPad.minWidth = 1;
    }
  }
}
