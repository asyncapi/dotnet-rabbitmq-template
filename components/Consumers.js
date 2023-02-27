export function Consumers({ channels }) {
  if (channels.length === 0) {
    return null;
  }

  return `
          // Code for the subscriber: Recieves messages from RabbitMq  
          _amqpService.${channels[0].subscriber.operationId}();
        `;
}
