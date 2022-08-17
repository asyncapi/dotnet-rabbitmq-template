import { getChannels, toPascalCase } from '../../utils/common';

const template = (publishers, consumers, params) => `using System;
using ${params.namespace}.Models;

namespace ${params.namespace}.Services.Interfaces;

public interface IAmqpService : IDisposable
{
    ${publishers
    .map(
      (publisher) => `
    /// <summary>
    /// Operations from async api specification
    /// </summary>
    /// <param name="message">The message to be handled by this amqp operation</param>
    void ${toPascalCase(publisher.operationId)}(${
  publisher.messageType
} message);
        
        `
    )
    .join('')}

      ${consumers
    .map(
      (consumer) => `
      /// <summary>
      /// Operations from async api specification
      /// </summary>
      /// <param name="message">The message to be handled by this amqp operation</param>
      void ${toPascalCase(consumer.operationId)}();
          
          `
    )
    .join('')}
}`;

export function IAmqpService({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  const publishers = getChannels(asyncapi).filter(
    (channel) => channel.isPublish
  );
  const consumers = getChannels(asyncapi).filter(
    (channel) => !channel.isPublish
  );

  return template(publishers, consumers, params);
}
