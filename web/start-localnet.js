const os = require('os');
const { exec } = require('child_process');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const ipv4Interfaces = interfaces['Wi-Fi'] || interfaces['Ethernet'] || [];

  for (const iface of ipv4Interfaces) {
    if (iface.family === 'IPv4') {
      return iface.address;
    }
  }

  throw new Error('Nie można uzyskać aktualnego adresu IP.');
}

async function runServer() {
  try {
    const localIp = await getLocalIp();
    const ngServeCommand = `ng serve --host ${localIp} --disable-host-check`;

    process.env.FORCE_COLOR = 'true';

    console.log('Aktualny adres IP:', localIp);
    console.log('Komenda:', ngServeCommand);

    const childProcess = exec(ngServeCommand);

    childProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('ng serve został zakończony pomyślnie.');
      } else {
        console.error(`ng serve zakończony kodem błędu: ${code}`);
      }
    });
  } catch (error) {
    console.error('Błąd:', error);
  }
}

runServer();
