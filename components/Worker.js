export function Worker({ asyncapi, params, childrenContent }) {

    const protocol = Object.entries(asyncapi.servers())
    .map(([serverName, server]) => {
      if(serverName === params.server){
        return server.protocol();
      }
    })
    .join('');

    return `using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using ${params.namespace}.Models;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Serilog;
using JsonSerializer = System.Text.Json.JsonSerializer;
        
namespace ${params.namespace}
{
    /// <summary>
    /// Generated consumer for ${asyncapi.info().title()}, ${asyncapi.info().version()}
    /// </summary>
    public class Worker : BackgroundService
    {
        private readonly IHostEnvironment _environment;
        private readonly ILogger _logger = Log.ForContext<Worker>();
        private readonly IConnection _connection;
        private readonly IModel _channel;
        
        public Worker(IConfiguration configuration, IHostEnvironment environment)
        {
            _environment = environment;
            var cfg = configuration;
        
            var user = cfg["Amqp:User"];
            var password = cfg["Amqp:Password"];
            var host = cfg["Amqp:Host"];
        
            var factory = new ConnectionFactory
            {
                Uri = new Uri($"${protocol}://{user}:{password}@{host}")
            };
        
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            ${childrenContent}
        }
        
        public override void Dispose()
        {
            base.Dispose();
            _connection?.Dispose();
            _channel?.Dispose();
        }
    }
}`;
}