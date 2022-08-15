import { getChannels, toPascalCase } from '../../utils/common';

const template = (asyncapi, params) => {
  const publishers = getChannels(asyncapi).filter(
    (channel) => channel.isPublish
  );
  const consumers = getChannels(asyncapi).filter(
    (channel) => !channel.isPublish
  );

  return `using System;
using System.Collections.Generic;
using ${params.namespace}.Services.Interfaces;
using RabbitMQ.Client;

namespace ${params.namespace}.Services;

/// <summary>
/// A channel pool for all channels defined in the async api specification
/// </summary>
public class ChannelPool : IChannelPool
{
    private class Channel : IDisposable
    {
        /// <summary>
        /// The confirm mode for the channel
        /// </summary>
        public bool Confirm { get; init; }
        
        /// <summary>
        /// The prefetch count for the channel
        /// </summary>
        public ushort PrefetchCount { get; init; }
        
        /// <summary>
        /// The underlying amqp model/channel
        /// </summary>
        public IModel Model { get; init; }

        public void Dispose()
        {
            Model?.Close();
            Model?.Dispose();
        }
    }
    
    private readonly IConnection _connection;
    private readonly IDictionary<string, Channel> _channels = new Dictionary<string, Channel>();

    private ChannelPool(IConnection connection)
    {
        _connection = connection;
        
        // creating producer channels
        ${publishers.map(
    (publisher) => `_channels.Add(
            "${toPascalCase(publisher.operationId)}",
            CreateChannel(connection));`
  )}

        // creating consumer channels
        ${consumers.map(
    (consumer) => `_channels.Add(
            "${toPascalCase(consumer.operationId)}",
            CreateChannel(
                connection, 
                ${consumer.prefetchCount},
                ${consumer.confirm}));`
  )}
        
    }

    public static IChannelPool Create(IConnection connection)
    {
        return new ChannelPool(connection);
    }
    
    public IModel GetChannel(string operationId)
    {
        // check for channel
        if (!_channels.TryGetValue(operationId, out var channel))
        {
            throw new KeyNotFoundException($"No channel found for {operationId}");
        }

        if (!channel.Model.IsClosed)
        {
            return channel.Model;
        }

        // recreate channel if it is closed
        _channels[operationId] = CreateChannel(
            _connection,
            channel.PrefetchCount, // prefetch from x-prefetch-count on channel binding
            channel.Confirm); // confirm from confirm on operation binding

        return _channels[operationId].Model;
    }
    
    private Channel CreateChannel(
        IConnection connection,
        ushort prefetchCount = 100,
        bool confirm = false)
    {
        var model = connection.CreateModel();

        if (confirm)
        {
            model.ConfirmSelect();
        }
        
        model.BasicQos(0, prefetchCount, false);

        return new Channel
        {
            PrefetchCount = prefetchCount,
            Confirm = confirm,
            Model = model
        };
    }

    public void Dispose()
    {
        foreach (var (_, channel) in _channels)
        {
            channel?.Dispose();
        }
    }
}`;
};

export function ChannelPool({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return template(asyncapi, params);
}
