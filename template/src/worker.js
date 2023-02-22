import { File, render } from '@asyncapi/generator-react-sdk';
import { Consumers } from '../../components/Consumers';
import { Publishers } from '../../components/Publishers';
import { Worker } from '../../components/Worker';
import { getChannels } from '../../utils/common';

export default function ({ asyncapi, params }) {
  const channels = getChannels(asyncapi);

  if (channels.length === 0) {
    return null;
  }

  return (
    <File name="Worker.cs">
      <Worker asyncapi={asyncapi} params={params}>
        {render(<Consumers channels={channels} />)}
        {render(<Publishers channels={channels} />)}
      </Worker>
    </File>
  );
}
