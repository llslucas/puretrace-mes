import * as mqtt from 'mqtt';

const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log(`Simulador MQTT conectado!`);

  // Loop infinito enviando dados a cada 2 segundos
  setInterval(() => {
    const temp = Math.random() * 40 + 70; // 70 a 110 graus
    const MACHINE_ID = generateMachineId();

    const payload = JSON.stringify({
      machineId: MACHINE_ID,
      temperature: parseFloat(temp.toFixed(2)),
      powerConsumption: parseFloat((Math.random() * 10).toFixed(2)),
    });

    const topic = `fabrica/maquinas/${MACHINE_ID}/environment`;
    client.publish(topic, payload);

    console.log(`Enviado: ${topic} -> ${payload}`);
  }, 2000);
});

function generateMachineId() {
  const machineNumber = parseInt((Math.random() * 10).toFixed(0));

  return `MACHINE-${machineNumber}`;
}
