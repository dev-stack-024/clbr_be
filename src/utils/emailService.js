const nodemailer = require('nodemailer');

// Create transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "devstack024@gmail.com",
    pass: "pmwxjdqhcgmuvtyr"
  }
});



const sendEmail = async (emailData) => {
  const mailOptions = {
    from: "devstack024@gmail.com",
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
