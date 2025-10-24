const sgMail = require('@sendgrid/mail');

exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body || '{}');
    const name = body.name || 'No name';
    const email = body.email || 'no-reply@example.com';
    const message = body.message || '';

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@boroughbotanicals.example.com';
    const TO_EMAIL = process.env.TO_EMAIL || 'progrebnyakb@gmail.com';

    if(!SENDGRID_API_KEY){
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing SENDGRID_API_KEY in environment' }) };
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `Website contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g,'<br>')}</p>`
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Send function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
