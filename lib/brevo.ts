import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: "Trackiy", email: process.env.BREVO_FROM_EMAIL! },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  });
}
