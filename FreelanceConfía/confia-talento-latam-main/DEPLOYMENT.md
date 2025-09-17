# 🚀 FreelanceConfía - Guía de Deployment

Esta guía detalla cómo deployar FreelanceConfía en producción de manera segura y eficiente.

## 📋 Pre-requisitos

### Servidor de Producción
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **RAM:** Mínimo 4GB, Recomendado 8GB
- **Storage:** Mínimo 50GB SSD
- **CPU:** Mínimo 2 cores, Recomendado 4 cores
- **Network:** Puerto 80 (HTTP) y 443 (HTTPS) abiertos

### Software Requerido
- Docker 24.0+ y Docker Compose v2
- Node.js 18+ (para builds locales)
- Git
- Nginx (si no se usa el contenedor)
- SSL Certificate (Let's Encrypt recomendado)

### Servicios Externos
- **Base de Datos:** MongoDB Atlas (recomendado) o instancia propia
- **Cache:** Redis Cloud o instancia propia
- **Email:** SendGrid / Mailgun / Amazon SES
- **Storage:** Cloudinary / Amazon S3
- **Payments:** Stripe (cuentas live)
- **SMS:** Twilio
- **Monitoring:** Sentry (opcional)

## 🔧 Configuración Inicial

### 1. Preparar el Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear usuario para deployment
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
```

### 2. Configurar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/freelanceconfia.git
cd freelanceconfia

# Copiar archivo de variables de entorno
cp .env.production.example .env.production

# Editar variables de producción
nano .env.production
```

### 3. Configurar Variables de Entorno

Edita `.env.production` y configura todas las variables:

```bash
# Base de datos (usa MongoDB Atlas para producción)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/freelanceconfia

# Stripe (usar claves live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (configurar servicio real)
EMAIL_SERVICE=sendgrid
EMAIL_USER=tu-email@freelanceconfia.com
EMAIL_PASS=tu-api-key

# SSL y dominio
FRONTEND_URL=https://freelanceconfia.com
BACKEND_URL=https://api.freelanceconfia.com
```

## 🔐 Configurar SSL

### Opción 1: Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot

# Obtener certificados
sudo certbot certonly --standalone -d freelanceconfia.com -d www.freelanceconfia.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/freelanceconfia.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/freelanceconfia.com/privkey.pem ./ssl/
```

### Opción 2: Certificado Propio

```bash
# Crear directorio SSL
mkdir -p ssl

# Generar certificado (solo para desarrollo)
./scripts/deploy.sh setup
```

## 🚀 Deployment

### Deployment Automático (Recomendado)

```bash
# Hacer el script ejecutable
chmod +x scripts/deploy.sh

# Ejecutar deployment completo
./scripts/deploy.sh deploy
```

### Deployment Manual

```bash
# 1. Crear backup
./scripts/deploy.sh backup

# 2. Build de la aplicación
npm ci
npm run build

# 3. Build imagen Docker
docker build -t freelanceconfia:latest .

# 4. Deploy con Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar health
curl http://localhost/health
```

### Deployment en Windows

```powershell
# Ejecutar con PowerShell como administrador
.\scripts\deploy.ps1 -Action deploy
```

## 📊 Monitoreo

### Acceso a Dashboards

- **Aplicación:** https://freelanceconfia.com
- **Grafana:** http://tu-servidor:3000 (admin/password configurado)
- **Prometheus:** http://tu-servidor:9090

### Logs

```bash
# Ver logs de la aplicación
docker-compose -f docker-compose.prod.yml logs -f app

# Ver logs de nginx
docker-compose -f docker-compose.prod.yml logs -f nginx-lb

# Ver logs de base de datos
docker-compose -f docker-compose.prod.yml logs -f mongodb
```

### Health Checks

```bash
# Check general de salud
curl https://freelanceconfia.com/health

# Check de API
curl https://freelanceconfia.com/api/health

# Check de base de datos
docker exec freelanceconfia-app npm run health:db
```

## 🔄 Mantenimiento

### Actualizaciones

```bash
# Actualizar código
git pull origin main

# Redeploy
./scripts/deploy.sh deploy
```

### Backups

```bash
# Backup manual
./scripts/deploy.sh backup

# Restaurar backup
./scripts/deploy.sh rollback
```

### Escalado

```bash
# Escalar aplicación (múltiples instancias)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🆘 Solución de Problemas

### Problemas Comunes

1. **Contenedor no inicia**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Base de datos no conecta**
   ```bash
   # Verificar variables de entorno
   docker exec freelanceconfia-app env | grep MONGO
   ```

3. **SSL/HTTPS no funciona**
   ```bash
   # Verificar certificados
   ls -la ssl/
   ```

4. **Performance lenta**
   ```bash
   # Verificar recursos
   docker stats
   ```

### Rollback

```bash
# Rollback automático
./scripts/deploy.sh rollback

# Rollback manual
docker-compose -f docker-compose.prod.yml down
# Restaurar desde backup
# Iniciar servicios
```

## 📈 Optimizaciones de Producción

### Performance

1. **CDN:** Configurar CloudFlare o AWS CloudFront
2. **Cache:** Configurar Redis para cache de sesiones
3. **Database:** Usar réplicas de MongoDB para lectura
4. **Assets:** Comprimir y optimizar imágenes

### Seguridad

1. **Firewall:** Configurar UFW o iptables
2. **Fail2ban:** Protección contra ataques de fuerza bruta
3. **Rate Limiting:** Configurado en Nginx
4. **HTTPS:** Forzar redirección SSL

### Monitoreo

1. **Alerts:** Configurar alertas en Grafana
2. **Uptime:** Usar servicios como UptimeRobot
3. **Error Tracking:** Integrar Sentry
4. **Performance:** Configurar New Relic o DataDog

## 🔧 Configuración de CI/CD

### GitHub Actions

El archivo `.github/workflows/deploy.yml` incluye:

- ✅ Tests automatizados
- ✅ Security scanning
- ✅ Build y push de imágenes
- ✅ Deploy automático
- ✅ Health checks
- ✅ Notificaciones

### Variables Secretas Requeridas

En GitHub Settings > Secrets:

```
PRODUCTION_SSH_KEY      # Clave SSH para el servidor
PRODUCTION_HOST         # IP del servidor de producción
PRODUCTION_USER         # Usuario para deployment
SLACK_WEBHOOK          # Webhook para notificaciones
```

## 📞 Soporte

Para soporte técnico:
- **Email:** tech@freelanceconfia.com
- **Documentación:** Ver carpeta `/docs`
- **Issues:** GitHub Issues

---

**¡FreelanceConfía está listo para producción!** 🚀