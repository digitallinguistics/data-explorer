$env:PSModulePath += ";$env:ProgramFiles\Azure Cosmos DB Emulator\PSModules"
Import-Module Microsoft.Azure.CosmosDB.Emulator
Start-CosmosDbEmulator