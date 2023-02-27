import { getChannels, toPascalCase } from '../../utils/common';

const template = (channels, params) => `using System;
using ${params.namespace}.Models;

namespace ${params.namespace}.Services.Interfaces;

public interface IAmqpService : IDisposable
{
    ${channels
    .filter((channel) => channel.publisher)
    .map(
      (channel) => `
    /// <summary>
    /// Publish operation from ${channel.routingKey}
    /// </summary>
    /// <param name="message">The message to be handled by this amqp operation</param>
    void ${toPascalCase(channel.publisher.operationId)}(${toPascalCase(
  channel.publisher.messageType
)} message);
        
        `
    )
    .join('')}

      ${channels
    .filter((channel) => channel.subscriber)
    .map(
      (channel) => `
      /// <summary>
      /// Subscribe operation from ${channel.routingKey}
      /// </summary>
      void ${toPascalCase(channel.subscriber.operationId)}();
          
          `
    )
    .join('')}
}`;

export function IAmqpService({ asyncapi, params }) {
  const channels = getChannels(asyncapi);

  if (channels.length === 0) {
    return null;
  }

  return template(channels, params);
}
