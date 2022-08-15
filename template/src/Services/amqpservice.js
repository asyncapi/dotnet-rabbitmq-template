import { File, render } from '@asyncapi/generator-react-sdk';
import { AmqpService } from '../../../components/templates/amqpservice';

export default function ({ asyncapi, params }) {
  return (
    <File name="AmqpService.cs">
      {render(<AmqpService asyncapi={asyncapi} params={params} />)}
    </File>
  );
}
