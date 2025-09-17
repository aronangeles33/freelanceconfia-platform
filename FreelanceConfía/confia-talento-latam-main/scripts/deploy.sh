#!/bin/bash

# =============================================================================
# FreelanceConfía Production Deployment Script
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="freelanceconfia"
DEPLOY_USER="deploy"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/freelanceconfia-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a $LOG_FILE
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker service."
    fi
    
    # Check if required files exist
    if [[ ! -f ".env.production" ]]; then
        error ".env.production file not found. Please create it from .env.production.example"
    fi
    
    if [[ ! -f "docker-compose.prod.yml" ]]; then
        error "docker-compose.prod.yml not found"
    fi
    
    # Check disk space (minimum 5GB)
    available_space=$(df / | tail -1 | awk '{print $4}')
    if [[ $available_space -lt 5242880 ]]; then
        error "Insufficient disk space. At least 5GB required."
    fi
    
    log "Pre-deployment checks passed ✓"
}

# Create backup
create_backup() {
    log "Creating backup before deployment..."
    
    mkdir -p $BACKUP_DIR
    backup_file="$BACKUP_DIR/freelanceconfia-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup database
    docker exec freelanceconfia-mongo mongodump --out /tmp/backup
    docker cp freelanceconfia-mongo:/tmp/backup ./backup
    
    # Backup application files
    tar -czf $backup_file \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        ./
    
    log "Backup created: $backup_file"
}

# Build application
build_application() {
    log "Building application..."
    
    # Build frontend
    npm ci
    npm run build
    
    # Build Docker image
    docker build -t $APP_NAME:latest .
    
    log "Application build completed ✓"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.prod.yml pull
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to start..."
    sleep 30
    
    # Health check
    if ! curl -f http://localhost/health > /dev/null 2>&1; then
        error "Health check failed. Deployment unsuccessful."
    fi
    
    log "Application deployed successfully ✓"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Run database migrations if needed
    # docker exec freelanceconfia-app npm run migrate
    
    # Clear caches
    docker exec freelanceconfia-redis redis-cli FLUSHALL
    
    # Send deployment notification
    # curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
    #      -d '{"text":"FreelanceConfía deployed successfully to production!"}'
    
    log "Post-deployment tasks completed ✓"
}

# Rollback function
rollback() {
    warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from backup
    latest_backup=$(ls -t $BACKUP_DIR/freelanceconfia-backup-*.tar.gz | head -n1)
    if [[ -f "$latest_backup" ]]; then
        tar -xzf "$latest_backup"
        docker-compose -f docker-compose.prod.yml up -d
        log "Rollback completed using backup: $latest_backup"
    else
        error "No backup found for rollback"
    fi
}

# SSL Certificate setup
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Create SSL directory
    mkdir -p ./ssl
    
    # Generate self-signed certificate for development
    # In production, use Let's Encrypt or proper CA certificates
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./ssl/freelanceconfia.key \
        -out ./ssl/freelanceconfia.crt \
        -subj "/C=US/ST=State/L=City/O=FreelanceConfia/CN=freelanceconfia.com"
    
    log "SSL certificates configured ✓"
}

# Monitoring setup
setup_monitoring() {
    log "Setting up monitoring..."
    
    mkdir -p ./monitoring
    
    # Create Prometheus configuration
    cat > ./monitoring/prometheus.yml << EOF
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
EOF
    
    log "Monitoring configured ✓"
}

# Main deployment function
main() {
    log "Starting FreelanceConfía deployment..."
    
    case "$1" in
        "deploy")
            pre_deployment_checks
            create_backup
            build_application
            deploy_application
            post_deployment
            log "Deployment completed successfully! 🚀"
            ;;
        "rollback")
            rollback
            ;;
        "setup")
            setup_ssl
            setup_monitoring
            log "Setup completed ✓"
            ;;
        "backup")
            create_backup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|setup|backup}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment with backup"
            echo "  rollback - Rollback to previous version"
            echo "  setup    - Initial setup (SSL, monitoring)"
            echo "  backup   - Create backup only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"