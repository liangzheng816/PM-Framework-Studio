using './container-api.bicep'

param namePrefix = 'pmstudio'
param location = 'westus2'
param coachModel = 'claude-sonnet-4-6'
param coachMaxTokens = '4096'
param corsOrigins = 'https://salmon-moss-07f46dd1e.2.azurestaticapps.net,https://pmstudio.bestleon.cc,http://localhost:3000'
// anthropicApiKey and imageTag are passed at deploy time:
//   az deployment group create ... --parameters anthropicApiKey='<key>' imageTag='<sha>'
