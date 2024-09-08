import { EmailClient, EmailMessage } from "@azure/communication-email";

const connectionString = process.env.AZURE_MAIL_CONNECTION_STRING;
const client = new EmailClient(connectionString);

export const sendEmail = async ({
  subject,
  body,
  to,
}: {
  subject: string;
  body: string;
  to: string;
}) => {
  try {
    const emailMessage: EmailMessage = {
      senderAddress: process.env.AZURE_SENDER_MAIL,
      content: {
        subject,
        plainText: body,
      },
      recipients: {
        to: [{ address: to }],
      },
    };

    const poller = await client.beginSend(emailMessage);
    await poller.pollUntilDone();

    console.log(`EMail sent to ${to}`);
  } catch (err) {
    console.error(`Error sending email to ${to}`, err);
  }
};
