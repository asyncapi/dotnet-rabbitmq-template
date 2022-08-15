import { FormatHelpers } from '@asyncapi/modelina';
// eslint-disable-next-line no-unused-vars
import { Message, Schema } from '@asyncapi/parser';
import _ from 'lodash';
const contentTypeJSON = 'application/json';
const contentTypeString = 'text/plain';
const contentTypeBinary = 'application/octet-stream';

/**
 * @typedef TemplateParameters
 * @type {object}
 * @property {boolean} generateTestClient - whether or not test client should be generated.
 * @property {boolean} promisifyReplyCallback - whether or not reply callbacks should be promisify.
 */

/**
 * Should the callbacks be promisify.
 *
 * @param {TemplateParameters} params passed to the template
 * @returns {boolean} should it promisify callbacks
 */
export function shouldPromisifyCallbacks(params) {
  return params.promisifyReplyCallback;
}

export function toCamelCase(string) {
  return _.camelCase(string);
}
export function toPascalCase(string) {
  string = _.camelCase(string);
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function toKebabCase(string) {
  return _.kebabCase(string);
}

/**
 * Returns the schema file name
 *
 * @param {string} schemaName
 * @returns
 */
export function getSchemaFileName(schemaName) {
  return FormatHelpers.toPascalCase(schemaName);
}

/**
 * Figure out if our message content type or default content type matches a given payload.
 *
 * @param {string} messageContentType to check against payload
 * @param {string} defaultContentType to check against payload
 * @param {string} payload to check
 */
function containsPayload(messageContentType, defaultContentType, payload) {
  if (
    (messageContentType !== undefined &&
      messageContentType.toLowerCase() === payload) ||
    (defaultContentType !== undefined && defaultContentType === payload)
  ) {
    return true;
  }
  return false;
}
export function isBinaryPayload(messageContentType, defaultContentType) {
  return containsPayload(
    messageContentType,
    defaultContentType,
    contentTypeBinary
  );
}
export function isStringPayload(messageContentType, defaultContentType) {
  return containsPayload(
    messageContentType,
    defaultContentType,
    contentTypeString
  );
}
export function isJsonPayload(messageContentType, defaultContentType) {
  return containsPayload(
    messageContentType,
    defaultContentType,
    contentTypeJSON
  );
}

/**
 * Checks if the message payload is of type null
 *
 * @param {Schema} messagePayload to check
 * @returns {boolean} does the payload contain null type
 */
export function messageHasNotNullPayload(messagePayload) {
  return `${messagePayload.type()}` !== 'null';
}

/**
 * Get message type ensure that the correct message type is returned.
 *
 * @param {Message} message to find the message type for
 */
export function getMessageType(message) {
  if (`${message.payload().type()}` === 'null') {
    return 'null';
  }
  return `${getSchemaFileName(message.payload().uid())}`;
}

/**
 * Convert JSON schema draft 7 types to typescript types
 * @param {*} jsonSchemaType
 * @param {*} property
 */
export function toCType(jsonSchemaType, property) {
  switch (jsonSchemaType.toLowerCase()) {
  case 'string':
    return 'String';
  case 'integer':
    return 'int';
  case 'number':
    return 'decimal';
  case 'boolean':
    return 'bool';
  case 'object':
    if (property) {
      return `${property.uid()}Schema`;
    }
    return 'object';

  default:
    return 'object';
  }
}

/**
 * Cast JSON schema variable to csharp type
 *
 * @param {*} jsonSchemaType
 * @param {*} variableToCast
 */
export function castToCType(jsonSchemaType, variableToCast) {
  switch (jsonSchemaType.toLowerCase()) {
  case 'string':
    return `$"{${variableToCast}}"`;
  case 'integer':
    return `int.Parse(${variableToCast})`;
  case 'number':
    return `decimal.Parse(${variableToCast}, System.Globalization.CultureInfo.InvariantCulture)`;
  case 'boolean':
    return `bool.Parse(${variableToCast})`;
  default:
    throw new Error(`Parameter type not supported - ${jsonSchemaType}`);
  }
}

/**
 * Realize parameters without using types without trailing comma
 */
export function realizeParametersForChannelWithoutType(parameters) {
  let returnString = '';
  for (const [paramName] of parameters) {
    returnString += `${paramName},`;
  }
  if (returnString.length >= 1) {
    returnString = returnString.slice(0, -1);
  }
  return returnString;
}

/**
 * Realize parameters using types without trailing comma
 */
export function realizeParametersForChannel(parameters, required = true) {
  let returnString = '';
  const requiredType = !required ? '?' : '';
  for (const parameter of parseParameters(parameters)) {
    returnString += `${parameter.csharpType}${requiredType} ${parameter.name} ${parameter.example},`;
  }
  if (returnString.length >= 1) {
    returnString = returnString.slice(0, -1);
  }
  return returnString;
}

export function parseParameters(parameters) {
  const params = [];
  for (const [paramName, parameter] of Object.entries(parameters)) {
    params.push({
      csharpType: toCType(parameter.schema().type()),
      name: paramName,
      example: parameter.extension('x-example'),
    });
  }
  return params;
}

export function cleanString(str) {
  return str.replace(/ {2}|\r\n|\n|\r/gm, '').trim();
}

export function getChannels(asyncapi) {
  const channels = asyncapi.channels();
  return Object.entries(channels)
    .map(([channelName, channel]) => {
      if (channel.hasPublish() && channel.hasBinding('amqp')) {
        const operation = channel.publish();
        const channelBinding = channel.binding('amqp');
        const operationBinding = operation.binding('amqp');

        // this should generate a consumer
        return {
          isPublish: true,
          routingKey: channelName,
          operationId: operation.id(),
          expiration: operationBinding['expiration'],
          userId: operationBinding['userId'],
          cc: operationBinding['cc'],
          bcc: operationBinding['bcc'],
          priority: operationBinding['priority'],
          deliveryMode: operationBinding['deliveryMode'],
          mandatory: operationBinding['mandatory'],
          replyTo: operationBinding['replyTo'],
          timestamp: operationBinding['timestamp'],
          ack: operationBinding['ack'],
          exchange: channelBinding.exchange.name,
          exchangeType: channelBinding.exchange.type,
          isDurable: channelBinding.exchange.durable,
          isAutoDelete: channelBinding.exchange.autoDelete,
          alternateExchange: channelBinding.exchange['x-alternate-exchange'],
          messageType: toPascalCase(operation._json.message.name), // TODO: handle multiple messages on a operation
        };
      }

      if (channel.hasSubscribe() && channel.hasBinding('amqp')) {
        const operation = channel.subscribe();
        const channelBinding = channel.binding('amqp');

        // this should generate a publisher
        return {
          isPublish: false,
          routingKey: channelName,
          operationId: operation.id(),
          operationDescription: operation.description(),
          queue: channelBinding.queue.name,
          prefetchCount: channelBinding.queue['x-prefetch-count'],
          confirm: channelBinding.queue['x-confirm'],
          exchange: channelBinding.exchange.name,
          exchangeType: channelBinding.exchange.type,
          messageType: toPascalCase(operation._json.message.name), // TODO: handle multiple messages on a operation
        };
      }
    })
    .filter((publisher) => publisher);
}

export function getPublishers(asyncapi) {
  const channels = asyncapi.channels();
  return Object.entries(channels)
    .map(([channelName, channel]) => {
      if (channel.hasPublish() && channel.hasBinding('amqp')) {
        const operation = channel.publish();
        const binding = channel.binding('amqp');

        const publisher = {
          routingKey: channelName,
          operationId: operation.id(),
          operationDescription: operation.description(),
          queue: binding.queue.name,
          prefetchCount: binding.exchange['x-prefetch-count'],
          exchange: binding.exchange.name,
          alternateExchange: binding.exchange['x-alternate-exchange'],
          messageType: toPascalCase(operation._json.message.name), // TODO: handle multiple messages on a operation
        };

        console.log();

        return publisher;
      }
    })
    .filter((publisher) => publisher);
}

export const addBasicProperty = () => {
  return 'test';
};
