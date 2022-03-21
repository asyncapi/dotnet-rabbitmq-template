export function Consumers({ channels }) {
  if (channels?.length == 0) {
    return null;
  }

  return `_amqpService.OnSensorTemperatureChange();`;
}
