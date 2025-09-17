# =============================================================================
# FreelanceConfía Production Deployment Script for Windows
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "rollback", "setup", "backup")]
    [string]$Action
)

# Configuration
$AppName = "freelanceconfia"
$BackupDir = ".\backups"
$LogFile = ".\deployment.log"

# Helper Functions
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor Green
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Error-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] ERROR: $Message"
    Write-Host $logMessage -ForegroundColor Red
    Add-Content -Path $LogFile -Value $logMessage
    exit 1
}

function Write-Warning-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] WARNING: $Message"
    Write-Host $logMessage -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value $logMessage
}

# Pre-deployment checks
function Test-PreRequisites {
    Write-Log "Starting pre-deployment checks..."
    
    # Check Docker
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error-Log "Docker is not running. Please start Docker Desktop."
    }
    
    # Check required files
    if (-not (Test-Path ".env.production")) {
        Write-Error-Log ".env.production file not found. Please create it from .env.production.example"
    }
    
    if (-not (Test-Path "docker-compose.prod.yml")) {
        Write-Error-Log "docker-compose.prod.yml not found"
    }
    
    # Check disk space (minimum 5GB)
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB
    if ($freeSpace -lt 5) {
        Write-Error-Log "Insufficient disk space. At least 5GB required. Available: $([math]::Round($freeSpace, 2))GB"
    }
    
    Write-Log "Pre-deployment checks passed ✓"
}

# Create backup
function New-Backup {
    Write-Log "Creating backup before deployment..."
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = "$BackupDir\freelanceconfia-backup-$timestamp.zip"
    
    # Backup database
    try {
        docker exec freelanceconfia-mongo mongodump --out /tmp/backup
        docker cp freelanceconfia-mongo:/tmp/backup ./backup
    }
    catch {
        Write-Warning-Log "Could not backup database - container may not be running"
    }
    
    # Backup application files
    $excludeItems = @("node_modules", "dist", ".git", "backups")
    $itemsToBackup = Get-ChildItem -Path . | Where-Object { $_.Name -notin $excludeItems }
    
    Compress-Archive -Path $itemsToBackup -DestinationPath $backupFile -Force
    
    Write-Log "Backup created: $backupFile"
}

# Build application
function Invoke-ApplicationBuild {
    Write-Log "Building application..."
    
    # Install dependencies and build frontend
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "npm ci failed"
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "npm run build failed"
    }
    
    # Build Docker image
    docker build -t "$AppName`:latest" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Docker build failed"
    }
    
    Write-Log "Application build completed ✓"
}

# Deploy application
function Invoke-ApplicationDeploy {
    Write-Log "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.prod.yml pull
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Failed to start services"
    }
    
    # Wait for services to start
    Write-Log "Waiting for services to start..."
    Start-Sleep -Seconds 30
    
    # Health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($response.StatusCode -ne 200) {
            Write-Error-Log "Health check failed. Deployment unsuccessful."
        }
    }
    catch {
        Write-Error-Log "Health check failed. Deployment unsuccessful."
    }
    
    Write-Log "Application deployed successfully ✓"
}

# Post-deployment tasks
function Complete-PostDeployment {
    Write-Log "Running post-deployment tasks..."
    
    # Clear Redis cache
    try {
        docker exec freelanceconfia-redis redis-cli FLUSHALL
    }
    catch {
        Write-Warning-Log "Could not clear Redis cache"
    }
    
    # Display status
    docker-compose -f docker-compose.prod.yml ps
    
    Write-Log "Post-deployment tasks completed ✓"
}

# Rollback function
function Restore-Previous {
    Write-Warning-Log "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Find latest backup
    $latestBackup = Get-ChildItem -Path $BackupDir -Filter "freelanceconfia-backup-*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestBackup) {
        Expand-Archive -Path $latestBackup.FullName -DestinationPath ".\restore" -Force
        docker-compose -f docker-compose.prod.yml up -d
        Write-Log "Rollback completed using backup: $($latestBackup.Name)"
    }
    else {
        Write-Error-Log "No backup found for rollback"
    }
}

# SSL Certificate setup
function Set-SSLCertificates {
    Write-Log "Setting up SSL certificates..."
    
    if (-not (Test-Path "ssl")) {
        New-Item -ItemType Directory -Path "ssl"
    }
    
    # Note: In production, use proper CA certificates
    Write-Log "SSL certificate directory created. Please add your certificates:"
    Write-Log "- freelanceconfia.crt (certificate file)"
    Write-Log "- freelanceconfia.key (private key file)"
    
    Write-Log "SSL setup completed ✓"
}

# Monitoring setup
function Set-Monitoring {
    Write-Log "Setting up monitoring..."
    
    if (-not (Test-Path "monitoring")) {
        New-Item -ItemType Directory -Path "monitoring"
    }
    
    # Create Prometheus configuration
    $prometheusConfig = @"
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'freelanceconfia'
    static_configs:
      - targets: ['app:5000']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-lb:80']
      
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
"@
    
    Set-Content -Path "monitoring\prometheus.yml" -Value $prometheusConfig
    
    Write-Log "Monitoring configured ✓"
}

# Main execution
Write-Log "Starting FreelanceConfía deployment on Windows..."

switch ($Action) {
    "deploy" {
        Test-PreRequisites
        New-Backup
        Invoke-ApplicationBuild
        Invoke-ApplicationDeploy
        Complete-PostDeployment
        Write-Log "Deployment completed successfully! 🚀"
        Write-Host "Access your application at: http://localhost" -ForegroundColor Cyan
        Write-Host "Monitoring dashboard: http://localhost:3000" -ForegroundColor Cyan
    }
    "rollback" {
        Restore-Previous
    }
    "setup" {
        Set-SSLCertificates
        Set-Monitoring
        Write-Log "Setup completed ✓"
    }
    "backup" {
        New-Backup
    }
}

Write-Log "Script execution completed."