# Perks Libraries [LEGACY]

**This branch is used for reference purpose, before migration of some packages to https://github.com/Azure/autorest**
Package moved:

- [@azure-tools/oai-to-oai3](./oai-to-oai3)
- [@azure-tools/codegen](./codegen)
- [@azure-tools/codemodel](./codemodel)
- [@azure-tools/autorest-extension-base](./autorest-extension-base)

Perks are a collection of common libraries that provide useful functionality (originall targeted at the AutoRest project.)

## Building

### Prerequisites

Install [Rush](https://rushjs.io/pages/intro/welcome/) to manage the build process:

- `npm install -g "@microsoft/rush" `

Use Rush to install packages

- `rush update`

Use Rush to build packages

- `rush rebuild`
