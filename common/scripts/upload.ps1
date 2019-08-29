param( $npmauthtoken ) 
set-content -Value "//registry.npmjs.org/:_authToken=$npmauthtoken" -path ./.npmrc 
$ErrorActionPreference = 'silentlycontinue'

dir $PSScriptRoot/../temp/artifacts/packages/*.tgz | % { 
  & "$PSScriptRoot/../temp/pnpm-local/node_modules/.bin/pnpm" publish $_ --tag preview --access public 
}