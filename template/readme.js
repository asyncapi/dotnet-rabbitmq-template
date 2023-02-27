import { File } from '@asyncapi/generator-react-sdk';
import { getChannels } from '../utils/common';

export default function ({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  const publishers = getChannels(asyncapi).filter(
    (channel) => channel.isPublish
  );
  const consumers = getChannels(asyncapi).filter(
    (channel) => !channel.isPublish
  );

  return (
    <File name="README.md">{`
# RabbitMq Client for ${asyncapi.id()}
## IAmqpService
This interface describes the channels in the specification.
### Consumers
${consumers.map((channel) => {
      return `${channel.routingKey} `;
    })}
### Publishers
${publishers.map((channel) => {
      return `${channel.routingKey} `;
    })}

    `}</File>
  );
}
