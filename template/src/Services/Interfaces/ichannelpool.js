import { File, render } from '@asyncapi/generator-react-sdk';
import { IChannelPool } from '../../../../components/templates/channelpool.interface';

export default function ({ asyncapi, params }) {
  // if (!asyncapi.hasComponents()) {
  //   return null;
  // }

  return (
    <File name="IChannelPool.cs">
      {render(<IChannelPool asyncapi={asyncapi} params={params} />)}
    </File>
  );
}
