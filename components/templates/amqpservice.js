import { getChannels } from '../../utils/common';

const template = (asyncapi, params) => {
  const channels = getChannels(asyncapi);

  if (channels.length === 0) {
    return null;
  }

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
            Uri = new Uri($"amqps://{user}:{password}@{host}"),
            RequestedHeartbeat = TimeSpan.FromSeconds(10)
        };

        _connection = factory.CreateConnection();
        _channelPool = ChannelPool.Create(_connection);
    }

    ${channels
    .filter((channel) => channel.publisher)
    .map(
      (channel) => `/// <summary>
    /// Operations from async api specification
    /// </summary>
    /// <param name="message">The message to be handled by this amqp operation</param>
    public void ${channel.publisher.operationId}(${channel.publisher.messageType} message)
    {
        var exchange = "${channel.exchange}";
        var routingKey = "${channel.routingKey}";

        var channel = _channelPool.GetChannel("${channel.publisher.operationId}");
        var exchangeProps = new Dictionary<string, object>
        {
            {"CC", "${channel.publisher.cc}"},
            {"BCC", "${channel.publisher.bcc}"},
            {"alternate-exchange", "${channel.publisher.alternateExchange}"},
        };
        
        channel.ExchangeDeclare(
            exchange: exchange, // exchange.name from channel binding
            type: "${channel.publisher.exchangeType}", // type from channel binding
            ${channel.isDurable}, // durable from channel binding
            ${channel.isAutoDelete}, // autoDelete from channel binding
            exchangeProps);

        var props = channel.CreateBasicProperties();
        
        props.CorrelationId = $"{Guid.NewGuid()}";
        props.ReplyTo = "${channel.publisher.replyTo}";
        props.DeliveryMode = Byte.Parse("${channel.publisher.deliveryMode}");
        props.Priority = ${channel.publisher.priority};
        props.Timestamp = new AmqpTimestamp(DateTimeOffset.UnixEpoch.Ticks);
        props.Expiration = "${channel.publisher.expiration}";

        _logger.Verbose("Sending message {@${channel.publisher.messageType}} with correlation id {CorrelationId}", 
            message, 
            props.CorrelationId);
        
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

        channel.BasicPublish(exchange: exchange,
            routingKey: routingKey,
            mandatory: ${channel.publisher.mandatory},
            basicProperties: props,
            body: body);
    }
    
    `
    )
    .join('')}

    ${channels
    .filter((channel) => channel.subscriber)
    .map(
      (channel) => `public void ${channel.subscriber.operationId}()
    {
        var queue = "${channel.queue}"; // queue from specification
        var channel = _channelPool.GetChannel("${channel.subscriber.operationId}");

        // TODO: declare passive?
        channel.QueueDeclare(queue);

        // IMPORTANT! If the routing key contains {some-parameter-name}
        // you must change the routing key below to something meaningful for amqp service listening for messages.
        // For demo purposes you can just replace it with the wildcard '#' which means it recieves 
        // all messages no matter what the parameter is.
        channel.QueueBind(queue: queue,
                  exchange: "${channel.exchange}",
                  routingKey: "${channel.routingKey}");

        var consumer = new EventingBasicConsumer(channel);
        consumer.Received += (_, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = JsonSerializer.Deserialize<${channel.subscriber.messageType}>(Encoding.UTF8.GetString(body));
            _logger.Verbose("${channel.subscriber.messageType} received, {@${channel.subscriber.messageType}}", message);

            try
            {
                // Handle message
                
                channel.BasicAck(ea.DeliveryTag, true);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Something went wrong trying to process message {@${channel.subscriber.messageType}},", message);
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
  if (!asyncapi.hasChannels()) {
    return null;
  }

  return template(asyncapi, params);
}
