import AsyncAPIDocument from '@asyncapi/parser/lib/models/asyncapi';
import { getChannels } from '../utils/common';

const contentType = 'application/json';

describe('Common utilities', () => {
  it('should handle multiple operations in one channel', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: contentType,
      channels: {
        '{sensorId}.temperature': {
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
              exchange: { name: 'temperature', type: 'topic', vhost: '/iot' },
              queue: { name: 'temperatures' },
            },
          },
          publish: {
            operationId: 'onSpecificSensorTemperatureReceived',
            description: 'Publish a temperature change.',
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
          subscribe: {
            operationId: 'onSensorTemperatureChange',
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
        },
      },
    });

    const channels = getChannels(asyncapi);
    expect(channels).toBeDefined();
    expect(channels.length).toBe(1);

    const subscriber = channels[0].subscriber;
    expect(subscriber).toBeDefined();
    expect(subscriber.operationId).toBe('OnSensorTemperatureChange');

    const publisher = channels[0].publisher;
    expect(publisher).toBeDefined();
    expect(publisher.operationId).toBe('OnSpecificSensorTemperatureReceived');
  });

  it('should create flat object from channels', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: contentType,
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
              exchange: { name: 'temperature', type: 'topic', vhost: '/abc' },
              queue: { name: 'temperatures' },
            },
          },
        },
      },
    });

    const channels = getChannels(asyncapi);
    expect(channels).toBeDefined();
    expect(channels.length).toBe(1);

    const channel = channels[0];
    expect(channel.subscriber.operationId).toBe(
      'OnSpecificSensorTemperatureReceived'
    );
    expect(channel.exchange).toBe('temperature');
    expect(channel.exchangeType).toBe('topic');
    expect(channel.vhost).toBe('/abc');
    expect(channel.queue).toBe('temperatures');
  });

  it('should handle empty channels', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: contentType,
    });

    const channels = getChannels(asyncapi);
    expect(channels.length).toBe(0);
  });
});
