export function Publishers({ channels }) {
  if (channels?.length == 0) {
    return null;
  }
  return `var rnd = new Random((int) DateTime.Now.Ticks);
            while (!stoppingToken.IsCancellationRequested)
            {
                var t = new Temperature
                {
                    Celcius = rnd.Next(-25, 120),
                    Created = $"{DateTimeOffset.Now:yyyy-MM-dd HH:mm:ss}",
                    Origin = "SENSOR-001"
                };

                _amqpService.OnSpecificSensorTemperatureReceived(t);
                
                await Task.Delay(rnd.Next(500, 3000), stoppingToken);
            }`;
}
