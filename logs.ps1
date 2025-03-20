param(
    [string]$service = "all",
    [switch]$follow,
    [int]$lines = 100,
    [switch]$timestamps
)

function Show-Logs {
    param(
        [string]$containerName,
        [bool]$follow,
        [int]$lines,
        [bool]$timestamps
    )
    
    Write-Host "`n=== Logs for $containerName ===" -ForegroundColor Cyan
    
    $args = @()
    if ($follow) { $args += "-f" }
    if ($timestamps) { $args += "-t" }
    if ($lines) { $args += "--tail"; $args += $lines }
    
    docker logs $args $containerName
}

if ($service -eq "all") {
    $containers = @("main-service", "calc-service", "todo-service", "mysql-db", "frontend")
    foreach ($container in $containers) {
        Show-Logs -containerName $container -follow $follow -lines $lines -timestamps $timestamps
    }
} else {
    Show-Logs -containerName $service -follow $follow -lines $lines -timestamps $timestamps
} 