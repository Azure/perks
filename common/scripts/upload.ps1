param( $npmauthtoken ) 

dir $PSScriptRoot/../temp/artifacts/packages/*.tgz |% { 
  pnpm publish $_ --tag preview --scope public "--$npmauthtoken" 
}