import { toPascalCase } from '../utils/common';

export function Consumers({ channels }) {
    const consumers = Object.entries(channels)
      .map(([channelName, channel]) => {
        if(channel.hasSubscribe() && channel.hasBinding('amqp')){
            const operation = channel.subscribe();
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

    return consumers.some(c => c !== null && c !== undefined) ? consumers.map(consumer =>`
            // Handler for '${consumer.operationDescription}'
            _channel.QueueDeclare("${consumer.queue}");
            _channel.QueueBind(queue: "${consumer.queue}",
                    exchange: "${consumer.exchange}",
                    routingKey: "${consumer.routingKey}");
            
            var ${consumer.operationId} = new EventingBasicConsumer(_channel);
            ${consumer.operationId}.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = JsonSerializer.Deserialize<${consumer.messageType}>(Encoding.UTF8.GetString(body));
                _logger.Verbose("${consumer.messageType} received, {@${consumer.messageType}}", message);
            
                // TODO - handle message
            };
            
            _channel.BasicConsume(queue: "${consumer.queue}",
                    autoAck: true,
                    consumer: ${consumer.operationId});`)
            .join('\t\t\t\t') : ``
}