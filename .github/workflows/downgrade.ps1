Import-Module "$env:ProgramFiles\Azure Cosmos DB Emulator\PSModules\Microsoft.Azure.CosmosDB.Emulator"
Uninstall-CosmosDbEmulator
choco install azure-cosmosdb-emulator --version=2.14.9