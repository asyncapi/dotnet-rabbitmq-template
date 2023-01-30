import { render } from '@asyncapi/generator-react-sdk';
import AsyncAPIDocument from '@asyncapi/parser/lib/models/asyncapi';
import { Publishers } from '../components/Publishers';
import { cleanString, getChannels } from '../utils/common';

describe('Producer component tests', () => {
  it('should handle empty specification', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: 'application/json',
    });

    const expected = ``;

    const result = render(<Publishers channels={getChannels(asyncapi)} />);

    expect(cleanString(result)).toEqual(cleanString(expected));
  });

  it('should render producer implementation', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: 'application/json',
      channels: {
        '{sensorId}.temperature': {
          publish: {
            operationId: 'onSpecificSensorTemperatureChanged',
            description: 'Publish a temperature change from a specific sensor.',
            bindings: {
              amqp: {
                expiration: 100000,
                userId: 'guest',
                cc: ['lkab.user.logs'],
                bcc: ['lkab.audit'],
                priority: 10,
                deliveryMode: 2,
                mandatory: false,
                replyTo: 'user.signedup',
                timestamp: true,
                ack: true,
              },
            },
            message: {
              payload: {
                id: 'temperature',
                type: 'object',
                additionalProperties: false,
                properties: {
                  celsius: { type: 'number', format: 'decimal' },
                  kelvin: { type: 'number', format: 'decimal' },
                  fahrenheit: { type: 'number', format: 'decimal' },
                  origin: { type: ['null', 'string'] },
                  created: { type: 'string', format: 'date-time' },
                },
              },
              name: 'temperature',
            },
          },
          parameters: {
            sensorId: {
              'x-example': 'SENSOR-001',
              description: 'Id of the temperature sensor.',
              schema: { type: 'string' },
            },
          },
          bindings: {
            amqp: {
              is: 'routingKey',
              exchange: {
                'x-alternate-exchange': 'lkab.iot.other',
                name: 'lkab.iot.temperature',
                type: 'topic',
                durable: true,
                autoDelete: false,
              },
            },
          },
        },
      },
    });

    const expected = `protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // TODO: Send message on custom events, below is a timing example. 
        var rnd = new Random((int) DateTime.Now.Ticks);
        while (!stoppingToken.IsCancellationRequested)
        {
            var message = new Temperature();
            _amqpService.OnSpecificSensorTemperatureChanged(message);
            await Task.Delay(rnd.Next(500, 3000), stoppingToken);
        }
    }`;

    const result = render(<Publishers channels={getChannels(asyncapi)} />);

    expect(cleanString(result)).toEqual(cleanString(expected));
  });
});
