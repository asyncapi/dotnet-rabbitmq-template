<h1 align="center">.NET C# RabbitMQ template</h1>

<p align="center">
  <em>This is a .NET C# RabbitMQ template for the AsyncAPI generator</em>
</p>


<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](##Contributors-✨)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

This template is for generating a .NET C# wrapper for the RabbitMQ client based on your AsyncAPI document. The template uses the [RabbitMQ C# Client](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.html) library.

Have you found a bug or have an idea for improvement? Feel free to contribute! See [the contribution guidelines](#Contributing) how to do so.

## Example usage
Given any AsyncAPI file (`AsyncAPI.yml`) first generate the client with the [AsyncAPI generator](https://github.com/asyncapi/generator) such as 
```bash
ag .\asyncapi.yaml .\dotnet-rabbitmq-template\ -o .\output --force-write -p server=production
```

# How to use
The generated output shall be seen a subscriber and/or publisher of message on/from a rabbit mq broker.

## Requirements
* @asyncapi/generator < v2.0.0 >v1.1.1

Install the generator through [npm or run it from docker official installer](https://github.com/asyncapi/generator#install).

# Contributing

Before contributing please read the [CONTRIBUTING](CONTRIBUTING.md) document.


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/mr-nuno"><img src="https://avatars.githubusercontent.com/u/1067841?v=4" width="100px;" alt=""/><br /><sub><b>Peter Wikström</b></sub></a><br /><a href="https://github.com/@asyncapi/dotnet-nats-template/commits?author=jonaslagoni" title="Code">💻</a> <a href="#maintenance-jonaslagoni" title="Maintenance">🚧</a> <a href="#question-mr-nuno" title="Answering Questions">💬</a> <a href="#ideas-mr-nuno" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/@asyncapi/dotnet-rabbitmq-template/commits?author=mr-nuno" title="Documentation">📖</a> <a href="https://github.com/@asyncapi/dotnet-rabbitmq-template/issues?q=author%3Amr-nuno" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!