import { getChannels, toPascalCase } from '../../utils/common';

const template = (asyncapi, params) => {
  const publishers = getChannels(asyncapi).filter(
    (channel) => channel.isPublish
  );
  const consumers = getChannels(asyncapi).filter(
    (channel) => !channel.isPublish
  );

  const protocol = Object.entries(asyncapi.servers())
    .map(([serverName, server]) => {
      if (serverName === params.server) {
        return server.protocol();
      }
    })
    .join('');

  return `using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using ${params.namespace}.Models;
using ${params.namespace}.Services.Interfaces;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Serilog;

namespace ${params.namespace}.Services;

/// <summary>
/// Generated consumer for ${asyncapi.info().title()}, ${asyncapi
  .info()
  .version()}
/// </summary>
public class AmqpService : IAmqpService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger _logger = Log.ForContext<AmqpService>();
    private readonly IChannelPool _channelPool;
    private readonly IConnection _connection;

    public AmqpService(IConfiguration configuration)
    {
        _configuration = configuration;

        var user = _configuration["RabbitMq:User"];
        var password = _configuration["RabbitMq:Password"];
        var host = _configuration["RabbitMq:Host"];

        var factory = new ConnectionFactory
        {
            Uri = new Uri($"${protocol}://{user}:{password}@{host}"),
            RequestedHeartbeat = TimeSpan.FromSeconds(10)
        };

        _connection = factory.CreateConnection();
        _channelPool = ChannelPool.Create(_connection);
    }

    ${publishers
    .map(
      (publisher) => `/// <summary>
    /// Operations from async api specification
    /// </summary>
    /// <param name="message">The message to be handled by this amqp operation</param>
    public void ${toPascalCase(publisher.operationId)}(${
  publisher.messageType
} message)
    {
        var exchange = "${publisher.exchange}";
        var routingKey = "${publisher.routingKey}";

        var channel = _channelPool.GetChannel("${toPascalCase(
    publisher.operationId
  )}");
        var exchangeProps = new Dictionary<string, object>
        {
            {"CC", "${publisher.cc}"},
            {"BCC", "${publisher.bcc}"},
            {"alternate-exchange", "${publisher.alternateExchange}"},
        };
        
        channel.ExchangeDeclare(
            exchange: exchange, // exchange.name from channel binding
            type: "${publisher.exchangeType}", // type from channel binding
            ${publisher.isDurable}, // durable from channel binding
            ${publisher.isAutoDelete}, // autoDelete from channel binding
            exchangeProps);

        var props = channel.CreateBasicProperties();
        
        props.CorrelationId = $"{Guid.NewGuid()}";
        props.ReplyTo = "${publisher.replyTo}";
        props.DeliveryMode = Byte.Parse("${publisher.deliveryMode}");
        props.Priority = ${publisher.priority};
        props.Timestamp = new AmqpTimestamp(DateTimeOffset.UnixEpoch.Ticks);
        props.Expiration = "${publisher.expiration}";

        _logger.Verbose("Sending message {@${
  publisher.messageType
}} with correlation id {CorrelationId}", 
            message, 
            props.CorrelationId);
        
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

        channel.BasicPublish(exchange: exchange,
            routingKey: routingKey,
            mandatory: ${publisher.mandatory},
            basicProperties: props,
            body: body);
    }
    
    `
    )
    .join('')}

    ${consumers
    .map(
      (consumer) => `public void ${toPascalCase(consumer.operationId)}()
    {
        var queue = "${consumer.queue}"; // queue from specification
        var channel = _channelPool.GetChannel("${toPascalCase(
    consumer.operationId
  )}");

        // TODO: declare passive?
        channel.QueueDeclare(queue);

        channel.QueueBind(queue: queue,
                  exchange: "${consumer.exchange}",
                  routingKey: "${consumer.routingKey}");

        var consumer = new EventingBasicConsumer(channel);
        consumer.Received += (_, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = JsonSerializer.Deserialize<${
  consumer.messageType
}>(Encoding.UTF8.GetString(body));
            _logger.Verbose("${toPascalCase(
    consumer.messageType
  )} received, {@${toPascalCase(consumer.messageType)}}", message);

            try
            {
                // Handle message
                
                channel.BasicAck(ea.DeliveryTag, true);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Something went wrong trying to process message {@${toPascalCase(
    consumer.messageType
  )}},", message);
                channel.BasicReject(ea.DeliveryTag, false);
            }
        };

        channel.BasicConsume(queue: queue,
            autoAck: false,
            consumer: consumer);
    }      
      `
    )
    .join('')}

    public void Dispose()
    {
        _channelPool?.Dispose();
        _connection?.Dispose();
    }
}`;
};

export function AmqpService({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return template(asyncapi, params);
}
