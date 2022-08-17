import { File } from '@asyncapi/generator-react-sdk';

export default function({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return (
    <File name={`${params.namespace}.csproj`}>
      {`<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>net6.0</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="Masking.Serilog" Version="1.0.13" />
        <PackageReference Include="Microsoft.AspNetCore.Hosting" Version="2.2.7" />
        <PackageReference Include="Microsoft.Extensions.Hosting" Version="6.0.0" />
        <PackageReference Include="RabbitMQ.Client" Version="6.2.2" />
        <PackageReference Include="Serilog" Version="2.10.0" />
        <PackageReference Include="Serilog.Extensions.Hosting" Version="4.2.0" />
        <PackageReference Include="Serilog.Settings.Configuration" Version="3.3.0" />
        <PackageReference Include="Serilog.Sinks.Console" Version="4.0.1" />
        <PackageReference Include="Serilog.Sinks.Seq" Version="5.1.0" />
    </ItemGroup>
</Project>`
      }
    </File>
  );
}