import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { error } from 'console';
require('dotenv').config();

console.log(process.env.AWS_ACCESS_KEY_ID);
const ses = new SESClient({});

function createSendEmailCommand(
  toAddress: string,
  fromAddress: string,
  message: string
) {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Source: fromAddress,
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: 'Your one-time password',
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
    },
  });
}

export async function sendEmailToken(email: string, token: string) {
  const message = `Your one time password: ${token}`;
  const command = createSendEmailCommand(
    email,
    'kien.havan321@gmail.com',
    message
  );
  try {
    return await ses.send(command);
  } catch (error) {
    console.log('Something went wrong');
    return error;
  }
}
