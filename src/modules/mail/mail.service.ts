import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ngovansuu2004@gmail.com',
        pass: 'opwr uatp mfxt htdq', // 🔥 dùng app password
      },
    });
  }

  async sendMail(options: { to: string; subject: string; text: string }) {
    await this.transporter.sendMail({
      from: '"OTP System" <ngovansuu2004@gmail.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
  }
}
