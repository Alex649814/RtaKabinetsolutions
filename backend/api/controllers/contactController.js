import db from '../../config/db.js';
import nodemailer from 'nodemailer';

export const saveContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, contactBy, message } = req.body;

    // Convertir opciones de contacto a texto
    const contactByString = [
      contactBy.phone ? 'phone' : '',
      contactBy.email ? 'email' : ''
    ].filter(Boolean).join(', ');

    // Guardar en base de datos
    const sql = `
      INSERT INTO contactinfo (FirstName, LastName, Email, Phone, ContactBy, Message, ShippingDate)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [firstName, lastName, email, phone, contactByString, message];
    const [result] = await db.query(sql, params);

    // Configurar transporte con nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu cuenta (por ejemplo, Carpentry.ido@gmail.com)
        pass: process.env.EMAIL_PASS
      }
    });

    // Crear correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      replyTo: email, // <-- Esto hace que puedas responder directamente al visitante
      subject: `Nuevo mensaje de contacto de ${firstName} ${lastName}`,
      text: `
Nombre: ${firstName} ${lastName}
Email: ${email}
Teléfono: ${phone}
Contactar por: ${contactByString}

Mensaje:
${message}
      `
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Contacto guardado y correo enviado con éxito.',
      id: result.insertId
    });

  } catch (err) {
    console.error('Error del servidor:', err);
    res.status(500).json({ error: 'Error al enviar el formulario.' });
  }
};