# 🔌 FreelanceConfía API Documentation

Documentación completa de la API REST de FreelanceConfía para desarrolladores.

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Usuario](#endpoints-de-usuario)
4. [Endpoints de Proyectos](#endpoints-de-proyectos)
5. [Endpoints de Pagos](#endpoints-de-pagos)
6. [Endpoints de Chat](#endpoints-de-chat)
7. [Webhooks](#webhooks)
8. [Rate Limiting](#rate-limiting)
9. [Errores](#errores)
10. [SDKs](#sdks)

---

## 🌐 Introducción

### Base URL
```
Production: https://api.freelanceconfia.com/v1
Staging: https://api-staging.freelanceconfia.com/v1
```

### Características
- ✅ **RESTful API** con JSON
- ✅ **OAuth 2.0** y JWT authentication
- ✅ **Rate limiting** inteligente
- ✅ **Webhooks** en tiempo real
- ✅ **Pagination** automática
- ✅ **Versioning** de API
- ✅ **CORS** configurado
- ✅ **OpenAPI 3.0** specification

### Headers Requeridos
```http
Content-Type: application/json
Authorization: Bearer {token}
User-Agent: YourApp/1.0.0
Accept: application/json
```

---

## 🔐 Autenticación

### OAuth 2.0 Flow

#### 1. Obtener Authorization Code
```http
GET /oauth/authorize
  ?response_type=code
  &client_id={client_id}
  &redirect_uri={redirect_uri}
  &scope=read write
  &state={random_state}
```

#### 2. Intercambiar Code por Token
```http
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "code": "received_auth_code",
  "redirect_uri": "your_redirect_uri"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200e54b1b0e2b4c...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

### JWT Token Authentication

#### Login Directo
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "two_factor_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "type": "freelancer",
      "verified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "def50200e54b1b0e2b4c...",
      "expires_in": 900
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "def50200e54b1b0e2b4c..."
}
```

---

## 👤 Endpoints de Usuario

### Obtener Perfil Actual
```http
GET /users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "freelancer@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "user_type": "freelancer",
    "profile": {
      "title": "Full Stack Developer",
      "bio": "Desarrollador con 5 años de experiencia...",
      "hourly_rate": 25,
      "skills": ["React", "Node.js", "Python"],
      "portfolio": [
        {
          "id": "portfolio_1",
          "title": "E-commerce App",
          "description": "App de comercio electrónico...",
          "images": ["https://cdn.freelanceconfia.com/..."],
          "technologies": ["React", "Node.js"]
        }
      ]
    },
    "verification": {
      "level": 4,
      "email_verified": true,
      "phone_verified": true,
      "identity_verified": true,
      "address_verified": true
    },
    "stats": {
      "projects_completed": 45,
      "total_earnings": 15670.50,
      "rating": 4.8,
      "response_time": "2 hours"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "last_active": "2024-09-17T14:25:00Z"
  }
}
```

### Actualizar Perfil
```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Juan Carlos",
  "profile": {
    "title": "Senior Full Stack Developer",
    "bio": "Desarrollador senior con 7 años de experiencia...",
    "hourly_rate": 35,
    "skills": ["React", "Node.js", "Python", "TypeScript"]
  }
}
```

### Buscar Usuarios
```http
GET /users/search
  ?q=react developer
  &type=freelancer
  &skills=react,nodejs
  &hourly_rate_min=20
  &hourly_rate_max=50
  &rating_min=4.0
  &location=mexico
  &verified=true
  &page=1
  &limit=20
Authorization: Bearer {token}
```

### Obtener Perfil Público
```http
GET /users/{user_id}/public
Authorization: Bearer {token}
```

---

## 💼 Endpoints de Proyectos

### Listar Proyectos
```http
GET /projects
  ?status=active
  &category=development
  &budget_min=500
  &budget_max=5000
  &skills=react,nodejs
  &duration=short
  &client_verified=true
  &page=1
  &limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_123",
        "title": "Desarrollo de E-commerce",
        "description": "Necesito desarrollar una tienda online...",
        "category": "development",
        "subcategory": "web-development",
        "budget": {
          "type": "fixed",
          "amount": 2500,
          "currency": "USD"
        },
        "duration": {
          "type": "weeks",
          "value": 4
        },
        "skills_required": ["React", "Node.js", "MongoDB"],
        "experience_level": "intermediate",
        "client": {
          "id": "client_456",
          "name": "TechCorp S.A.",
          "rating": 4.9,
          "projects_posted": 12,
          "verified": true,
          "location": "Mexico City, MX"
        },
        "proposals_count": 15,
        "created_at": "2024-09-15T09:00:00Z",
        "deadline": "2024-10-15T23:59:59Z",
        "status": "active"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 156,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Crear Proyecto
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Desarrollo de App Móvil",
  "description": "Necesito desarrollar una aplicación móvil para iOS y Android...",
  "category": "mobile-development",
  "budget": {
    "type": "fixed",
    "amount": 5000,
    "currency": "USD"
  },
  "duration": {
    "type": "months",
    "value": 2
  },
  "skills_required": ["React Native", "JavaScript", "API Integration"],
  "experience_level": "senior",
  "requirements": [
    "Experiencia mínima 3 años en React Native",
    "Portfolio con apps publicadas",
    "Disponibilidad full-time"
  ],
  "attachments": [
    {
      "type": "file",
      "name": "mockups.pdf",
      "url": "https://cdn.freelanceconfia.com/..."
    }
  ],
  "deadline": "2024-11-15T23:59:59Z"
}
```

### Obtener Proyecto Específico
```http
GET /projects/{project_id}
Authorization: Bearer {token}
```

### Aplicar a Proyecto
```http
POST /projects/{project_id}/proposals
Authorization: Bearer {token}
Content-Type: application/json

{
  "cover_letter": "Hola, he revisado tu proyecto y creo que soy el candidato perfecto...",
  "budget": {
    "amount": 4500,
    "currency": "USD"
  },
  "delivery_time": {
    "type": "weeks",
    "value": 6
  },
  "milestones": [
    {
      "title": "Análisis y Diseño",
      "description": "Análisis de requerimientos y diseño de la aplicación",
      "amount": 1350,
      "duration": "1 week"
    },
    {
      "title": "Desarrollo MVP",
      "description": "Desarrollo de funcionalidades básicas",
      "amount": 2250,
      "duration": "3 weeks"
    },
    {
      "title": "Testing y Entrega",
      "description": "Testing completo y entrega final",
      "amount": 900,
      "duration": "2 weeks"
    }
  ],
  "attachments": [
    {
      "type": "portfolio",
      "title": "App Similar Desarrollada",
      "url": "https://portfolio.example.com/..."
    }
  ]
}
```

### Gestionar Propuestas
```http
GET /projects/{project_id}/proposals
Authorization: Bearer {token}
```

```http
PUT /projects/{project_id}/proposals/{proposal_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted" // "pending", "accepted", "rejected"
}
```

---

## 💰 Endpoints de Pagos

### Crear Pago Escrow
```http
POST /payments/escrow
Authorization: Bearer {token}
Content-Type: application/json

{
  "project_id": "project_123",
  "freelancer_id": "user_456",
  "amount": 2500,
  "currency": "USD",
  "payment_method": {
    "type": "credit_card",
    "card_token": "tok_1234567890"
  },
  "milestones": [
    {
      "title": "Milestone 1",
      "amount": 750,
      "auto_release": false
    },
    {
      "title": "Milestone 2", 
      "amount": 1000,
      "auto_release": false
    },
    {
      "title": "Final Delivery",
      "amount": 750,
      "auto_release": true,
      "auto_release_days": 7
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "escrow_id": "escrow_789",
    "status": "created",
    "total_amount": 2500,
    "currency": "USD",
    "milestones": [
      {
        "id": "milestone_1",
        "title": "Milestone 1",
        "amount": 750,
        "status": "pending",
        "auto_release": false
      }
    ],
    "fees": {
      "platform_fee": 125,
      "payment_processing": 75,
      "total_fees": 200
    },
    "created_at": "2024-09-17T14:30:00Z"
  }
}
```

### Liberar Milestone
```http
POST /payments/escrow/{escrow_id}/milestones/{milestone_id}/release
Authorization: Bearer {token}
Content-Type: application/json

{
  "feedback": "Excelente trabajo, entregado a tiempo y con alta calidad.",
  "rating": 5
}
```

### Historial de Transacciones
```http
GET /payments/transactions
  ?status=completed
  &date_from=2024-09-01
  &date_to=2024-09-17
  &type=escrow
  &page=1
  &limit=50
Authorization: Bearer {token}
```

### Métodos de Pago
```http
GET /payments/methods
Authorization: Bearer {token}
```

```http
POST /payments/methods
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "bank_account",
  "bank_name": "Banco Nacional",
  "account_number": "1234567890",
  "account_type": "checking",
  "routing_number": "021000021"
}
```

---

## 💬 Endpoints de Chat

### Listar Conversaciones
```http
GET /chat/conversations
  ?status=active
  &page=1
  &limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "project_id": "project_456",
        "participants": [
          {
            "id": "user_123",
            "name": "Juan Pérez",
            "type": "freelancer",
            "avatar": "https://cdn.freelanceconfia.com/..."
          },
          {
            "id": "user_789",
            "name": "TechCorp S.A.",
            "type": "client",
            "avatar": "https://cdn.freelanceconfia.com/..."
          }
        ],
        "last_message": {
          "id": "msg_456",
          "sender_id": "user_123",
          "content": "He terminado el primer milestone, ¿puedes revisarlo?",
          "type": "text",
          "sent_at": "2024-09-17T13:45:00Z"
        },
        "unread_count": 2,
        "created_at": "2024-09-15T10:00:00Z",
        "updated_at": "2024-09-17T13:45:00Z"
      }
    ]
  }
}
```

### Obtener Mensajes de Conversación
```http
GET /chat/conversations/{conversation_id}/messages
  ?page=1
  &limit=50
  &before=msg_456
Authorization: Bearer {token}
```

### Enviar Mensaje
```http
POST /chat/conversations/{conversation_id}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "text",
  "content": "¡Hola! He revisado tu propuesta y me parece excelente.",
  "attachments": [
    {
      "type": "file",
      "name": "requirements.pdf",
      "url": "https://cdn.freelanceconfia.com/...",
      "size": 245760
    }
  ]
}
```

### Marcar como Leído
```http
PUT /chat/conversations/{conversation_id}/read
Authorization: Bearer {token}
Content-Type: application/json

{
  "message_id": "msg_456"
}
```

---

## 🔔 Webhooks

### Configurar Webhook
```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://yourapp.com/webhooks/freelanceconfia",
  "events": [
    "payment.completed",
    "project.created",
    "proposal.submitted",
    "message.received"
  ],
  "secret": "your_webhook_secret"
}
```

### Eventos Disponibles

#### Pagos
```json
{
  "event": "payment.completed",
  "timestamp": "2024-09-17T14:30:00Z",
  "data": {
    "payment_id": "pay_123",
    "escrow_id": "escrow_456",
    "amount": 1000,
    "currency": "USD",
    "freelancer_id": "user_789",
    "client_id": "user_123",
    "project_id": "project_456"
  }
}
```

#### Proyectos
```json
{
  "event": "project.created",
  "timestamp": "2024-09-17T14:30:00Z",
  "data": {
    "project_id": "project_789",
    "title": "Nuevo Proyecto de Desarrollo",
    "client_id": "user_123",
    "budget": 2500,
    "category": "development"
  }
}
```

#### Mensajes
```json
{
  "event": "message.received",
  "timestamp": "2024-09-17T14:30:00Z",
  "data": {
    "message_id": "msg_789",
    "conversation_id": "conv_123",
    "sender_id": "user_456",
    "recipient_id": "user_789",
    "content": "¿Podrías revisar el último entregable?",
    "type": "text"
  }
}
```

### Verificación de Webhook
```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(
        f"sha256={expected_signature}",
        signature
    )
```

---

## ⚡ Rate Limiting

### Límites por Endpoint

```
📊 Rate Limits:
├── 🔐 Authentication: 5 req/min
├── 👤 User Profile: 100 req/hour
├── 💼 Projects: 200 req/hour
├── 💰 Payments: 50 req/hour
├── 💬 Chat: 500 req/hour
├── 🔍 Search: 100 req/hour
└── 📊 Analytics: 50 req/hour
```

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695825600
X-RateLimit-Retry-After: 60
```

### Error de Rate Limit
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 100 requests per hour.",
    "retry_after": 3600
  }
}
```

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_123456789"
  }
}
```

### Códigos de Error Comunes

#### Autenticación
- `INVALID_CREDENTIALS` - Email/password incorrectos
- `TOKEN_EXPIRED` - JWT token expirado
- `TWO_FACTOR_REQUIRED` - 2FA requerido
- `ACCOUNT_SUSPENDED` - Cuenta suspendida

#### Validación
- `VALIDATION_ERROR` - Error en datos de entrada
- `MISSING_REQUIRED_FIELD` - Campo requerido faltante
- `INVALID_FORMAT` - Formato de dato incorrecto
- `VALUE_OUT_OF_RANGE` - Valor fuera de rango

#### Negocio
- `INSUFFICIENT_FUNDS` - Fondos insuficientes
- `PROJECT_NOT_AVAILABLE` - Proyecto ya no disponible
- `DUPLICATE_PROPOSAL` - Propuesta duplicada
- `UNAUTHORIZED_ACTION` - Acción no autorizada

---

## 📦 SDKs

### JavaScript/Node.js
```bash
npm install @freelanceconfia/sdk
```

```javascript
import { FreelanceConfiaSDK } from '@freelanceconfia/sdk';

const client = new FreelanceConfiaSDK({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Obtener perfil del usuario
const profile = await client.users.getMe();

// Buscar proyectos
const projects = await client.projects.search({
  category: 'development',
  budget_min: 1000,
  skills: ['react', 'nodejs']
});

// Crear propuesta
const proposal = await client.proposals.create(projectId, {
  cover_letter: 'Mi propuesta...',
  budget: 2500,
  delivery_time: '4 weeks'
});
```

### Python
```bash
pip install freelanceconfia-sdk
```

```python
from freelanceconfia import FreelanceConfiaClient

client = FreelanceConfiaClient(
    api_key='your_api_key',
    environment='production'
)

# Obtener perfil
profile = client.users.get_me()

# Buscar proyectos
projects = client.projects.search(
    category='development',
    budget_min=1000,
    skills=['react', 'nodejs']
)

# Crear pago escrow
escrow = client.payments.create_escrow(
    project_id='project_123',
    amount=2500,
    currency='USD'
)
```

### PHP
```bash
composer require freelanceconfia/sdk
```

```php
<?php
use FreelanceConfia\Client;

$client = new Client([
    'api_key' => 'your_api_key',
    'environment' => 'production'
]);

// Obtener perfil
$profile = $client->users()->getMe();

// Buscar proyectos
$projects = $client->projects()->search([
    'category' => 'development',
    'budget_min' => 1000,
    'skills' => ['react', 'nodejs']
]);
```

---

## 🔧 Herramientas de Desarrollo

### Postman Collection
Descarga nuestra colección completa de Postman:
```
https://api.freelanceconfia.com/docs/postman-collection.json
```

### OpenAPI Specification
```
https://api.freelanceconfia.com/docs/openapi.yaml
```

### Sandbox Environment
Usa nuestro entorno de pruebas para desarrollo:
```
Base URL: https://api-sandbox.freelanceconfia.com/v1
Dashboard: https://sandbox.freelanceconfia.com
```

### Test Credentials
```json
{
  "freelancer": {
    "email": "freelancer@test.freelanceconfia.com",
    "password": "TestPassword123!"
  },
  "client": {
    "email": "client@test.freelanceconfia.com", 
    "password": "TestPassword123!"
  }
}
```

---

## 📞 Soporte para Desarrolladores

### Canales de Soporte
- 📧 **Email:** developers@freelanceconfia.com
- 💬 **Discord:** [FreelanceConfía Developers](https://discord.gg/freelanceconfia-dev)
- 📚 **Stack Overflow:** Tag `freelanceconfia`
- 🐛 **GitHub Issues:** [freelanceconfia/api-issues](https://github.com/freelanceconfia/api-issues)

### Office Hours
- 🕐 **Horario:** Martes y Jueves, 2-4 PM (UTC-5)
- 🎥 **Video Call:** [Zoom Link](https://zoom.us/j/freelanceconfia-dev)
- 📅 **Calendly:** [Agendar consulta](https://calendly.com/freelanceconfia-dev)

---

**🚀 ¡Comienza a construir con FreelanceConfía API hoy mismo!**

*Documentación actualizada: Septiembre 2025 | Versión API: v1.2.3*