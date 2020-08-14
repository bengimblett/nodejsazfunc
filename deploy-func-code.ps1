[CmdletBinding()]
Param(

)
Remove-Item -Path ".\Deploy" -Force -Recurse

npm install

Copy-Item -Path ".\jsHttpTrigger1" -Destination ".\deploy\jshttptrigger1" -Recurse
Copy-Item -Path ".\node_modules" -Destination ".\deploy\node_modules" -Recurse
Copy-Item -Path ".\*.json" -Destination ".\deploy" -Recurse

$rg = 'appinsightscorr-rg'
$funcName='begimdemonodefn'
$zipName = '.\begimdemonodefn.zip'


$compress = @{
  Path= ".\Deploy\*"
  CompressionLevel = "Fastest"
  DestinationPath = $zipName
}
Compress-Archive @compress -Force

write-host "zipped" -ForegroundColor Green

az functionapp deployment source config-zip  -g $rg -n $funcName --src $zipName

write-host "published" -ForegroundColor Green

