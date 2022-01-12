import { toPascalCase } from '../utils/common';

export function Publishers({ channels }) {
    const publishers = Object.entries(channels)
      .map(([channelName, channel]) => {
        if(channel.hasPublish() && channel.hasBinding('amqp')){
            const operation = channel.publish();
            const binding = channel.binding('amqp');
            return {
                routingKey: channelName,
                operationId: operation.id(),
                operationDescription: operation.description(),
                queue: binding.queue.name,
                exchange: binding.exchange.name,
                messageType: toPascalCase(operation._json.message.name) // TODO: handle multiple messages on a operation
            }
        }
      });

    return publishers.some(c => c !== null && c !== undefined) ? publishers.map(publisher =>`
            // Handler for '${publisher.operationDescription}'
            _channel.ExchangeDeclare(exchange: "${publisher.exchange}", type: "topic");

            // TODO: Send message on custom events, below is a timing example. 
            var rnd = new Random((int) DateTime.Now.Ticks);
            while (!stoppingToken.IsCancellationRequested)
            {
                var message = new ${publisher.messageType}();
                
                _logger.Verbose("Sending {@${publisher.messageType}}", message);
                
                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
                _channel.BasicPublish(exchange: "${publisher.exchange}",
                    routingKey: "${publisher.routingKey}",
                    basicProperties: null,
                    body: body);
                
                await Task.Delay(rnd.Next(500, 3000), stoppingToken);
            }
            
            `)
            .join('\t\t\t\t') : ``;
}