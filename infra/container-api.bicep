targetScope = 'resourceGroup'

@description('Name prefix for container resources')
param namePrefix string = 'pmstudio'

@description('Location for all resources')
param location string = 'westus2'

@description('Anthropic API key')
@secure()
param anthropicApiKey string

@description('Claude model to use')
param coachModel string = 'claude-sonnet-4-6'

@description('Max tokens for Claude responses')
param coachMaxTokens string = '4096'

@description('CORS allowed origins (comma-separated)')
param corsOrigins string = 'https://salmon-moss-07f46dd1e.2.azurestaticapps.net,https://pmstudio.bestleon.cc,http://localhost:3000'

@description('Container image tag (e.g. git SHA)')
param imageTag string = 'latest'

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: '${namePrefix}acr'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Container Apps Managed Environment (consumption plan)
resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${namePrefix}-env'
  location: location
  properties: {}
}

// Container App
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${namePrefix}-api'
  location: location
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        corsPolicy: {
          allowedOrigins: split(corsOrigins, ',')
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['Content-Type']
          maxAge: 3600
        }
      }
      secrets: [
        {
          name: 'anthropic-api-key'
          value: anthropicApiKey
        }
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${acr.properties.loginServer}/${namePrefix}-api:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'ANTHROPIC_API_KEY', secretRef: 'anthropic-api-key' }
            { name: 'COACH_MODEL', value: coachModel }
            { name: 'COACH_MAX_TOKENS', value: coachMaxTokens }
            { name: 'CORS_ORIGINS', value: corsOrigins }
            { name: 'PORT', value: '8080' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output acrLoginServer string = acr.properties.loginServer
output containerAppName string = containerApp.name
