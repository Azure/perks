# Perks Libraries

Perks are a collection of common libraries that provide useful functionality (originall targeted at the AutoRest project.)

## Package moved

Some pacakges were moved to https://github.com/Azure/autorest, see [legacy branch](https://github.com/Azure/perks/tree/legacy/) for the code before move.

- [@azure-tools/oai-to-oai3](https://github.com/Azure/perks/tree/legacy/oai-to-oai3)
- [@azure-tools/codegen](https://github.com/Azure/perks/tree/legacy/codegen)
- [@azure-tools/codemodel](https://github.com/Azure/perks/tree/legacy/codemodel)
- [@azure-tools/autorest-extension-base](https://github.com/Azure/perks/tree/legacy/autorest-extension-base)

## Building

### Prerequisites

Install [Rush](https://rushjs.io/pages/intro/welcome/) to manage the build process:

- `npm install -g "@microsoft/rush" `

Use Rush to install packages

- `rush update`

Use Rush to build packages

- `rush rebuild`
