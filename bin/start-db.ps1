# This script only works for local development. It uses the well-known key for Cosmos DB Emulator.
Write-Host "Launching Cosmos DB Emulator"
Import-Module "$env:ProgramFiles\Azure Cosmos DB Emulator\PSModules\Microsoft.Azure.CosmosDB.Emulator"
Start-CosmosDbEmulator -AllowNetworkAccess -Key C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw== -NoUI