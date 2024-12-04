import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const environmentContent = `
export const environment = {
  production: true,
  emailServicePublicKey: '${process.env['EMAIL_SERVICE_PUBLIC_KEY']}'
};
`;

fs.writeFileSync('src/environments/environment.ts', environmentContent);
