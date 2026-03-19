import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_key_here' 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export const sendDivineEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn('🕉️ Resend not configured. Divine message logged to console:');
    console.log(`TO: ${to}\nSUBJECT: ${subject}\n---CONTENT---\n${html}\n---`);
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Devlok <noreply@devlok.site>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('🕉️ Divine Email Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('🕉️ Divine Email Exception:', err);
    return { success: false, error: err.message };
  }
};

export default resend;
