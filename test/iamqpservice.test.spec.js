import { render } from '@asyncapi/generator-react-sdk';
import AsyncAPIDocument from '@asyncapi/parser/lib/models/asyncapi';
import { IAmqpService } from '../components/templates/amqpservice.interface';
import { cleanString } from '../utils/common';

describe('AMQP interface component', () => {
  it('should render a amqp service interface', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      info: {
        title: 'Test',
        version: '1.0.0',
      },
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

    const result = render(
      <IAmqpService asyncapi={asyncapi} params={{ namespace: 'Demo' }} />
    );

    expect(cleanString(result)).toContain(
      'void OnSpecificSensorTemperatureReceived();'
    );
  });

  it('should handle empty specification', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: 'application/json',
    });

    const expected = '';

    const result = render(<IAmqpService asyncapi={asyncapi} params={{}} />);

    expect(cleanString(result)).toEqual(cleanString(expected));
  });
});
