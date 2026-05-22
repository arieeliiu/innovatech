import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('MAIL_FROM');

    if (!host || !user || !pass || !from) {
      throw new Error('Faltan variables de entorno SMTP para Brevo.');
    }

    this.from = from;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(data: SendMailDto) {
    const { to, subject, text, html } = data;

    if (!to || !subject || (!text && !html)) {
      throw new BadRequestException(
        'Debe enviar destinatario, asunto y contenido del correo.',
      );
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error al enviar email con Brevo:', error);
      throw new InternalServerErrorException('Fallo al enviar correo.');
    }
  }
}