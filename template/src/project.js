import { File } from '@asyncapi/generator-react-sdk';

export default function ({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return (
    <File name={`${params.namespace}.csproj`}>
      {`<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>net7.0</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
      <PackageReference Include="Masking.Serilog" Version="1.0.13" />
      <PackageReference Include="Microsoft.AspNetCore.Hosting" Version="2.2.7" />
      <PackageReference Include="Microsoft.Extensions.Hosting" Version="7.0.1" />
      <PackageReference Include="RabbitMQ.Client" Version="6.4.0" />
      <PackageReference Include="Serilog" Version="2.12.0" />
      <PackageReference Include="Serilog.Extensions.Hosting" Version="5.0.1" />
      <PackageReference Include="Serilog.Settings.Configuration" Version="3.4.0" />
      <PackageReference Include="Serilog.Sinks.Console" Version="4.1.0" />
      <PackageReference Include="Serilog.Sinks.Seq" Version="5.2.2" />
    </ItemGroup>
</Project>`}
    </File>
  );
}
