import { File, render } from '@asyncapi/generator-react-sdk';
import { IAmqpService } from '../../../../components/templates/amqpservice.interface';

export default function ({ asyncapi, params }) {
  return (
    <File name="IAmqpService.cs">
      {render(<IAmqpService asyncapi={asyncapi} params={params} />)}
    </File>
  );
}
