import { File, render } from '@asyncapi/generator-react-sdk';
import { Consumers } from '../../components/Consumers';
import { Publishers } from '../../components/Publishers';
import { Worker } from '../../components/Worker';

export default function ({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return (
    <File name="Worker.cs">
      <Worker asyncapi={asyncapi} params={params}>
        {render(<Consumers channels={[]} />)}
        {render(<Publishers channels={[]} />)}
      </Worker>
    </File>
  );
}
