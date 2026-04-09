using './main.bicep'

param staticWebAppName = 'frameworkstudio'
param location = 'eastus2'
param sku = 'Free'
param coachModel = 'claude-sonnet-4-6'
param coachMaxTokens = '4096'
param repositoryUrl = 'https://github.com/liangzheng816/framework_studio'
param branch = 'main'
// anthropicApiKey is passed at deploy time:
//   az deployment group create ... --parameters anthropicApiKey='<key>'
