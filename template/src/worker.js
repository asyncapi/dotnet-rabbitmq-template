import { File, render } from '@asyncapi/generator-react-sdk';
import { Consumers } from '../../components/Consumers';
import { Publishers } from '../../components/Publishers';
import { Worker } from '../../components/Worker';
import { getChannels } from '../../utils/common';

export default function ({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  const channels = getChannels(asyncapi);
  const publishers = channels.filter((channel) => channel.isPublish);
  const consumers = channels.filter((channel) => !channel.isPublish);

  console.log(publishers);
  console.log(consumers);

  return (
    <File name="Worker.cs">
      <Worker asyncapi={asyncapi} params={params}>
        {render(<Consumers channels={[]} />)}
        {render(<Publishers channels={[]} />)}
      </Worker>
    </File>
  );
}
