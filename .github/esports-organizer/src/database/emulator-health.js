#!/usr/bin/env node
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//NOTA: ESTO ES SOLO PARA USARSE CUANDO QUERAMOS USAR UN EMULADOR PARA NO AFECTAR LA DATA QUE ESTA CORRIENDO 

function loadEnvFile() {
  const possiblePaths = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env')
  ];
  
  const env = {};
  
  for (const envPath of possiblePaths) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log(`Found .env file at: ${envPath}`);
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      return env; 
    } catch (error) {
      //Aqui solo continua por eso vacio 
    }
  }
  
  return env;
}

function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    try {
      socket.connect(port, host);
    } catch (error) {
      resolve(false);
    }
  });
}

async function healthCheck() {
  console.log(' Emulator Health Check');
  const env = loadEnvFile();

  const firestorePort = parseInt(env.FIRESTORE_EMULATOR_PORT || process.env.FIRESTORE_EMULATOR_PORT || '8080');
  const authPort = parseInt(env.AUTH_EMULATOR_PORT || process.env.AUTH_EMULATOR_PORT || '9099');
  
  const host = '127.0.0.1';
  

  const checks = [
    { name: 'Firestore', port: firestorePort },
    { name: 'Auth', port: authPort }
  ];
  
  let allHealthy = true;
  
  for (const check of checks) {
    process.stdout.write(`${check.name} (port ${check.port}): `);
    
    const isReachable = await checkPort(host, check.port);
    
    if (isReachable) {
      console.log( 'OK');
    } else {
      console.log(' FAIL');
      allHealthy = false;
    }
  }
  
  
  if (allHealthy) {
    console.log(' All emulators are healthy!');
    process.exit(0);
  } else {
    console.log('Some emulators are not reachable!');
    process.exit(1);
  }
}

// Esto corre el health check btw
healthCheck().catch(error => {
  console.error(' Health check failed:', error.message);
  process.exit(1);
});