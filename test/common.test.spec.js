import AsyncAPIDocument from '@asyncapi/parser/lib/models/asyncapi';
import { addBasicProperty } from '../utils/common';

describe('Common utilities tests', () => {
  it('should return valid basic property on not null binding input', () => {
    const asyncapi = new AsyncAPIDocument({
      asyncapi: '2.2.0',
      defaultContentType: 'application/json',
      channels: {
        temperature: {
          subscribe: {
            bindings: {
              amqp: {
                expiration: 0,
                cc: [],
                priority: 0,
                deliveryMode: 0,
                bcc: [],
                ack: true,
              },
            },
          },
        },
      },
    });

    expect(addBasicProperty()).toEqual('test');
  });
});
