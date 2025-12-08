import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendInviteEmail({ to, testName, duration, expiryDate, inviteLink, candidateName }) {
  const subject = `Rudransh — Your aptitude test invite for ${testName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .rules { background: #fff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rudransh Development</h1>
        </div>
        <div class="content">
          <p>Hi ${candidateName || 'Candidate'},</p>
          <p>You've been invited to take the "<strong>${testName}</strong>" aptitude test. The test is <strong>${duration}</strong> minutes long.</p>
          <p>Please use a desktop (Chrome recommended), allow camera access, and complete the test before <strong>${expiryDate}</strong>.</p>
          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Start Test</a>
          </div>
          <div class="rules">
            <h3>Rules:</h3>
            <ul>
              <li>Camera recording may be required.</li>
              <li>Avoid switching tabs or using external assistance.</li>
              <li>Your session will be monitored and logged.</li>
            </ul>
          </div>
          <p>If you have issues, contact support@rudransh.dev</p>
          <p>Good luck,<br>Rudransh Development Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${candidateName || 'Candidate'},

You've been invited to take the "${testName}" aptitude test. The test is ${duration} minutes long.

Please use a desktop (Chrome recommended), allow camera access, and complete the test before ${expiryDate}.

Start test: ${inviteLink}

Rules:
- Camera recording may be required.
- Avoid switching tabs or using external assistance.
- Your session will be monitored and logged.

If you have issues, contact support@rudransh.dev

Good luck,
Rudransh Development Team
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Rudransh Development <noreply@rudransh.dev>',
      to,
      subject,
      text,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

