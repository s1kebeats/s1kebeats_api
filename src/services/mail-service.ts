import nodemailer from "nodemailer";

class MailService {
  transporter: nodemailer.Transporter;
  constructor() {
    // nodemailer config
    const opts = {
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT!,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };
    this.transporter = nodemailer.createTransport(opts);
  }

  async sendActivationMail(to: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активация аккаунта на ${process.env.BASE_URL}`,
      html: `
                    <div>
                        <h1>Для активации перейдите по ссылке:</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `,
    });
  }
}

export default new MailService();
