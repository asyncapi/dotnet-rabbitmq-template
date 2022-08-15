import { toPascalCase } from '../utils/common';

export function Publishers({ channels }) {
  if (channels.length === 0) {
    return null;
  }

  return `protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // TODO: Send message on custom events, below is a timing example. 
            var rnd = new Random((int) DateTime.Now.Ticks);
            while (!stoppingToken.IsCancellationRequested)
            {
                var message = new ${toPascalCase(channels[0].messageType)}();
                _amqpService.${toPascalCase(channels[0].operationId)}(message);
                await Task.Delay(rnd.Next(500, 3000), stoppingToken);
            }
        }`;
}
