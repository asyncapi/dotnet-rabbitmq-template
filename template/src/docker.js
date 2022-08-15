import { File } from '@asyncapi/generator-react-sdk';

export default function({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  return (
    <File name="Dockerfile">
      {`FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /app

ARG VERSION=0.0.0.0

WORKDIR /src

COPY ["${params.namespace}.csproj", "/src"]
RUN dotnet restore "${params.namespace}.csproj"

COPY . .
WORKDIR "/src"
RUN dotnet build "${params.namespace}.csproj" /p:NuGetVersion=\${VERSION} /p:Version=\${VERSION} -c Release -o /app/build --no-restore

FROM build AS publish
RUN dotnet publish "${params.namespace}.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "${params.namespace}.dll"]`
      }
    </File>
  );
}
