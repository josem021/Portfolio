import * as fs from 'fs';
import * as path from 'path';

const envFile = path.resolve(process.cwd(), '.env');
const envContent = `
EMAIL_SERVICE_PUBLIC_KEY=${process.env["EMAIL_SERVICE_PUBLIC_KEY"] || ''}
`;

fs.writeFileSync(envFile, envContent);
