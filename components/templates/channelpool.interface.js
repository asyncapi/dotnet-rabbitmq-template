const template = (asyncapi, params) => `using System;
using RabbitMQ.Client;

namespace ${params.namespace}.Services.Interfaces;

/// <summary>
/// Channel pool holding all channels for a async api specification
/// </summary>
public interface IChannelPool : IDisposable
{
    /// <summary>
    /// Get a channel for a operation
    /// </summary>
    /// <param name="operationId">The operation id specified in the async api specification</param>
    /// <returns>A channel</returns>
    IModel GetChannel(string operationId);
}`;

export function IChannelPool({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return template(asyncapi, params);
}
