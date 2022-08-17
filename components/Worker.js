export function Worker({ asyncapi, params, childrenContent }) {
  return `using System;
using System.Threading;
using System.Threading.Tasks;
using ${params.namespace}.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using ${params.namespace}.Services;
        
namespace ${params.namespace}
{
    /// <summary>
    /// Generated worker for ${asyncapi.info().title()}, ${asyncapi
  .info()
  .version()}
    /// </summary>
    public class Worker : BackgroundService
    {
        private readonly AmqpService _amqpService;

        public Worker(IConfiguration configuration)
        {
            _amqpService = new AmqpService(configuration);
        }

        ${childrenContent}
        
        public override void Dispose()
        {
            base.Dispose();
            _amqpService.Dispose();
        }
    }
}`;
}
