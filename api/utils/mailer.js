import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendConfirmationEmail = (to, reservationDetails) => {
  const mailOptions = {
    from: `"Serendib Savor" <${process.env.EMAIL_ADDRESS}>`, 
    to: to,
    subject: "Reservation Confirmation",
    text: `Your reservation for ${reservationDetails.people} people at the ${reservationDetails.branch} branch on ${reservationDetails.date} at ${reservationDetails.time} has been confirmed.`,
    html: `
      <html>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap">
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="text-align: center; color: #FF0000;">Reservation Confirmed!</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">
            We are thrilled to confirm your reservation!
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Branch:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.branch}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Number of People:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.people}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Date:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Time:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.time}</td>
            </tr>
          </table>
          <p style="font-size: 16px; margin-top: 20px; font-weight: bold; color: #FF0000;">
            Your reservation has been successfully confirmed! 🎉
          </p>
          <p style="font-size: 16px; margin-top: 20px;">
            We look forward to welcoming you soon!
          </p>
          <p style="font-size: 16px; margin-top: 40px; text-align: center;">
            <strong>Serendib Savor</strong><br/>
            123 Main Street, Colombo<br/>
            <a href="tel:+94123456789" style="color: #FF0000; text-decoration: none;">+94 123 456 789</a><br/>
            <a href="mailto:info@serendibsavor.com" style="color: #FF0000; text-decoration: none;">info@serendibsavor.com</a>
          </p>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendRejectionEmail = (to, reservationDetails) => {
  const mailOptions = {
    from: `"Serendib Savor" <${process.env.EMAIL_ADDRESS}>`,
    to: to,
    subject: "Reservation Rejection",
    text: `We're sorry, but your reservation for ${reservationDetails.people} people at the ${reservationDetails.branch} branch on ${reservationDetails.date} at ${reservationDetails.time} has been rejected.`,
    html: `
      <html>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap">
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="text-align: center; color: #FF0000;">Reservation Rejected</h2>
          <p style="font-size: 16px;">Dear Customer,</p>
          <p style="font-size: 16px;">
            We regret to inform you that your reservation could not be confirmed.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Branch:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.branch}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Number of People:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.people}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Date:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Time:</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${reservationDetails.time}</td>
            </tr>
          </table>
          <p style="font-size: 16px; margin-top: 20px;">
            We apologize for any inconvenience this may have caused. If you have any questions, feel free to contact us.
          </p>
          <p style="font-size: 16px; margin-top: 40px; text-align: center;">
            <strong>Serendib Savor</strong><br/>
            123 Main Street, Colombo<br/>
            <a href="tel:+94123456789" style="color: #FF0000; text-decoration: none;">+94 123 456 789</a><br/>
            <a href="mailto:info@serendibsavor.com" style="color: #FF0000; text-decoration: none;">info@serendibsavor.com</a>
          </p>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export { sendConfirmationEmail, sendRejectionEmail };
