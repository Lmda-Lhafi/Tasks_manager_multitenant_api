const nodemailer = require("nodemailer");


// thsi just a development mailer configuration
// it need to be changed to production ready mailer like sendgrid, mailgun, etc.
const sendemail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo || process.env.EMAIL_FROM,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendemail;
