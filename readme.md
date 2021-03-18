# Perks Libraries

Perks are a collection of common libraries that provide useful functionality (originall targeted at the AutoRest project.)

| Name                                                    | Changelog                          | Latest                                                           | Next                                                                  |
| ------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Core functionality                                      |
| [@azure-tools/uri][uri_src]                             | [Changelog][uri_chg]               | ![](https://img.shields.io/npm/v/@azure-tools/uri)               | ![](https://img.shields.io/npm/v/@azure-tools/uri/next)               |
| [@azure-tools/tasks][tasks_src]                         | [Changelog][tasks_chg]             | ![](https://img.shields.io/npm/v/@azure-tools/tasks)             | ![](https://img.shields.io/npm/v/@azure-tools/tasks/next)             |
| [@azure-tools/eventing][eventing_src]                   | [Changelog][eventing_chg]          | ![](https://img.shields.io/npm/v/@azure-tools/eventing)          | ![](https://img.shields.io/npm/v/@azure-tools/eventing/next)          |
| [@azure-tools/async-io][async-io_src]                   | [Changelog][async-io_chg]          | ![](https://img.shields.io/npm/v/@azure-tools/async-io)          | ![](https://img.shields.io/npm/v/@azure-tools/async-io/next)          |
| [@azure-tools/object-comparison][object-comparison_src] | [Changelog][object-comparison_chg] | ![](https://img.shields.io/npm/v/@azure-tools/object-comparison) | ![](https://img.shields.io/npm/v/@azure-tools/object-comparison/next) |

[uri_src]: uri
[tasks_src]: tasks
[eventing_src]: eventing
[async-io_src]: async-io
[object-comparison_src]: object-comparison
[uri_chg]: uri/CHANGELOG.md
[tasks_chg]: tasks/CHANGELOG.md
[eventing_chg]: eventing/CHANGELOG.md
[async-io_chg]: async-io/CHANGELOG.md
[object-comparison_chg]: object-comparison/CHANGELOG.md

## Notice: Packages moved to Azure/autorest

Some pacakges were moved to https://github.com/Azure/autorest, see [legacy branch](https://github.com/Azure/perks/tree/legacy/) for the code before move.

- [@azure-tools/oai-to-oai3](https://github.com/Azure/perks/tree/legacy/oai-to-oai3)
- [@azure-tools/codegen](https://github.com/Azure/perks/tree/legacy/codegen)
- [@azure-tools/codemodel](https://github.com/Azure/perks/tree/legacy/codemodel)
- [@azure-tools/autorest-extension-base](https://github.com/Azure/perks/tree/legacy/autorest-extension-base)
- [@azure-tools/deduplication](https://github.com/Azure/perks/tree/legacy/deduplication)
- [@azure-tools/datastore](https://github.com/Azure/perks/tree/legacy/datastore)
- [@azure-tools/openapi](https://github.com/Azure/perks/tree/legacy/openapi)
- [@azure-tools/extension](https://github.com/Azure/perks/tree/2590a33e5f8549e03e2b8d7b0196fde23ec57f08/extension)

## Building

### Prerequisites

Install [Rush](https://rushjs.io/pages/intro/welcome/) to manage the build process:

- `npm install -g "@microsoft/rush" `

Use Rush to install packages

- `rush update`

Use Rush to build packages

- `rush rebuild`

### Publishing a new version

Bump the version and update the changelogs using

```bash
rush publish --apply
```

When merged to master it will publish those new version. If the version are not updated, the master publish will publish preview versions of the packages with `-dev.{iteration}` suffix
