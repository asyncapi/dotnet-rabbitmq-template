export function Publishers({ channels }) {
  if (channels.length === 0) {
    return null;
  }

  return `
            // Code for the publisher: Send message on custom events, below is a timing example. 
            // A real world example would probably read temeratures from some kind of I/O temperature sensor.
            /*
            var rnd = new Random((int) DateTime.Now.Ticks);
            while (!stoppingToken.IsCancellationRequested)
            {
                var message = new ${channels[0].publisher.messageType}();
                _amqpService.${channels[0].publisher.operationId}(message);
                await Task.Delay(rnd.Next(500, 3000), stoppingToken);
            }
            */
        `;
}
