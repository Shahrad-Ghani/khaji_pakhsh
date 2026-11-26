# Khaji Pakhsh - run the PostgreSQL schema test suite (Windows PowerShell 5.1)
# Keep this .ps1 file in the same folder as khaji_database_test_suite_v1_1.sql.

$ErrorActionPreference = 'Stop'
$ContainerName = 'khaji-pg-test'
$DatabaseName = 'khaji_test'
$SqlFileName = 'khaji_database_test_suite_v1_1.sql'
$SqlPath = Join-Path $PSScriptRoot $SqlFileName
$ContainerSqlPath = '/tmp/khaji_database_test_suite_v1_1.sql'

Write-Host '=== Khaji Pakhsh PostgreSQL Test Runner ===' -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $SqlPath)) {
    throw "SQL test file not found: $SqlPath`nPut $SqlFileName in the same folder as this PowerShell script."
}

# Confirm Docker Engine is reachable.
docker info --format '{{.ServerVersion}}' | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Docker Engine is not running. Start Docker Desktop and try again.'
}

# Confirm the expected test container exists.
docker inspect $ContainerName *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Container '$ContainerName' was not found. Create it first using the PostgreSQL setup instructions."
}

# Start the test container if it is stopped.
$RunningState = docker inspect -f '{{.State.Running}}' $ContainerName
if ($LASTEXITCODE -ne 0) {
    throw "Could not inspect container '$ContainerName'."
}
if ($RunningState.Trim() -ne 'true') {
    Write-Host 'Starting PostgreSQL test container...' -ForegroundColor Yellow
    docker start $ContainerName | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not start PostgreSQL test container.' }
}

# Wait up to 30 seconds for PostgreSQL to accept connections.
$DatabaseReady = $false
for ($Attempt = 1; $Attempt -le 30; $Attempt++) {
    docker exec $ContainerName pg_isready -U postgres -d $DatabaseName *> $null
    if ($LASTEXITCODE -eq 0) {
        $DatabaseReady = $true
        break
    }
    Start-Sleep -Seconds 1
}
if (-not $DatabaseReady) {
    throw "PostgreSQL did not become ready in container '$ContainerName' within 30 seconds."
}

Write-Host 'Copying SQL test suite into the container...' -ForegroundColor Gray
docker cp $SqlPath "${ContainerName}:$ContainerSqlPath"
if ($LASTEXITCODE -ne 0) { throw 'Could not copy the SQL test suite into the container.' }

Write-Host 'Running all database tests...' -ForegroundColor Gray
docker exec $ContainerName psql -U postgres -d $DatabaseName -v ON_ERROR_STOP=1 -f $ContainerSqlPath
if ($LASTEXITCODE -ne 0) {
    throw 'One or more database tests failed. Copy the complete error output and send it for diagnosis.'
}

Write-Host ''
Write-Host 'ALL DATABASE SCHEMA TESTS PASSED.' -ForegroundColor Green
Write-Host 'Test rows were rolled back. PostgreSQL identity sequence gaps are normal.' -ForegroundColor Gray
