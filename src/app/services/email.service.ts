import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private publicKey = environment.emailServicePublicKey;

  sendEmail(templateParams: any, serviceID: string, templateID: string): Promise<EmailJSResponseStatus> {
    return emailjs.send(
      serviceID,
      templateID,
      templateParams,
      this.publicKey
    );
  }
}
