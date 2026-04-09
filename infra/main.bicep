targetScope = 'resourceGroup'

@description('Name of the Static Web App')
param staticWebAppName string = 'frameworkstudio'

@description('Location for the Static Web App')
param location string = 'eastus2'

@description('SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

@description('Anthropic API key for the Azure Functions backend')
@secure()
param anthropicApiKey string

@description('Claude model to use for Coach chat')
param coachModel string = 'claude-sonnet-4-6'

@description('Max tokens for Claude responses')
param coachMaxTokens string = '4096'

@description('GitHub repository URL')
param repositoryUrl string = 'https://github.com/liangzheng816/framework_studio'

@description('Branch to deploy from')
param branch string = 'main'

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: '/'
      apiLocation: 'api'
      outputLocation: 'out'
    }
  }
}

resource appSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    ANTHROPIC_API_KEY: anthropicApiKey
    COACH_MODEL: coachModel
    COACH_MAX_TOKENS: coachMaxTokens
  }
}

output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id
