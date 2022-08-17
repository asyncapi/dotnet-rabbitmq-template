import { render } from '@asyncapi/generator-react-sdk';
import AsyncAPIDocument from '@asyncapi/parser/lib/models/asyncapi';
import { Consumers } from '../components/Consumers';
import { cleanString, getChannels } from '../utils/common';

describe('Consumers component', () => {
  it('should render consumer implementation', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: 'application/json',
      channels: {
        '{sensorId}.temperature': {
          subscribe: {
            operationId: 'onSpecificSensorTemperatureReceived',
            description:
              'Subscribe to a temperature change from a specific sensor.',
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
              exchange: { name: 'temperature', type: 'topic', vhost: '/' },
              queue: { name: 'temperatures' },
            },
          },
        },
      },
    });

    const expected = `protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
      _amqpService.OnSpecificSensorTemperatureReceived();
      return Task.CompletedTask;
    }`;

    const result = render(<Consumers channels={getChannels(asyncapi)} />);

    expect(cleanString(result)).toEqual(cleanString(expected));
  });
});
