# Script de pruebas para FreelanceConfía API
# Ejecutar: .\test-api.ps1

Write-Host "🧪 Probando FreelanceConfía API..." -ForegroundColor Green
Write-Host ""

# 1. Health Check
Write-Host "1. ✅ Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✅ Health check exitoso:" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Registrar usuario freelancer
Write-Host "2. 👤 Registrando usuario freelancer" -ForegroundColor Yellow
$freelancerData = @{
    email = "freelancer@test.com"
    password = "123456"
    name = "Juan Pérez"
    role = "freelancer"
    skills = @("JavaScript", "React", "Node.js")
    location = "México"
} | ConvertTo-Json

try {
    $freelancer = Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method POST -Body $freelancerData -ContentType "application/json"
    Write-Host "✅ Freelancer registrado:" -ForegroundColor Green
    $freelancer | ConvertTo-Json
    $freelancerToken = $freelancer.token
} catch {
    Write-Host "❌ Error registrando freelancer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Registrar usuario empresa
Write-Host "3. 🏢 Registrando usuario empresa" -ForegroundColor Yellow
$companyData = @{
    email = "empresa@test.com"
    password = "123456"
    name = "TechCorp SA"
    role = "company"
    location = "Colombia"
} | ConvertTo-Json

try {
    $company = Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method POST -Body $companyData -ContentType "application/json"
    Write-Host "✅ Empresa registrada:" -ForegroundColor Green
    $company | ConvertTo-Json
    $companyToken = $company.token
} catch {
    Write-Host "❌ Error registrando empresa: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Login freelancer
Write-Host "4. 🔐 Login freelancer" -ForegroundColor Yellow
$loginData = @{
    email = "freelancer@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login exitoso:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Crear proyecto (empresa)
Write-Host "5. 📋 Creando proyecto" -ForegroundColor Yellow
$projectData = @{
    title = "Desarrollo de App Web"
    description = "Necesitamos desarrollar una aplicación web moderna con React y Node.js"
    budget = 5000
    category = "Desarrollo Web"
    location = "Remoto"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $companyToken"
    "Content-Type" = "application/json"
}

try {
    $project = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method POST -Body $projectData -Headers $headers
    Write-Host "✅ Proyecto creado:" -ForegroundColor Green
    $project | ConvertTo-Json
    $projectId = $project.project._id
} catch {
    Write-Host "❌ Error creando proyecto: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Listar proyectos
Write-Host "6. 📋 Listando proyectos abiertos" -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method GET
    Write-Host "✅ Proyectos encontrados: $($projects.Count)" -ForegroundColor Green
    $projects | ConvertTo-Json
} catch {
    Write-Host "❌ Error listando proyectos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Postularse al proyecto (freelancer)
Write-Host "7. 📝 Freelancer postulándose al proyecto" -ForegroundColor Yellow
$applicationData = @{
    projectId = $projectId
    proposal = "Tengo 5 años de experiencia en React y Node.js. Puedo completar este proyecto en 4 semanas."
} | ConvertTo-Json

$freelancerHeaders = @{
    "Authorization" = "Bearer $freelancerToken"
    "Content-Type" = "application/json"
}

try {
    $application = Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method POST -Body $applicationData -Headers $freelancerHeaders
    Write-Host "✅ Postulación enviada:" -ForegroundColor Green
    $application | ConvertTo-Json
    $applicationId = $application.application._id
} catch {
    Write-Host "❌ Error en postulación: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 8. Ver postulaciones del proyecto (empresa)
Write-Host "8. 👥 Viendo postulaciones del proyecto" -ForegroundColor Yellow
try {
    $applications = Invoke-RestMethod -Uri "http://localhost:5000/api/applications/project/$projectId" -Method GET -Headers $headers
    Write-Host "✅ Postulaciones encontradas: $($applications.Count)" -ForegroundColor Green
    $applications | ConvertTo-Json
} catch {
    Write-Host "❌ Error viendo postulaciones: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 9. Aceptar postulación (empresa)
Write-Host "9. ✅ Aceptando postulación" -ForegroundColor Yellow
$acceptData = @{
    status = "accepted"
} | ConvertTo-Json

try {
    $acceptedApp = Invoke-RestMethod -Uri "http://localhost:5000/api/applications/$applicationId" -Method PATCH -Body $acceptData -Headers $headers
    Write-Host "✅ Postulación aceptada:" -ForegroundColor Green
    $acceptedApp | ConvertTo-Json
} catch {
    Write-Host "❌ Error aceptando postulación: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 10. Calcular reputación del freelancer
Write-Host "10. ⭐ Calculando reputación del freelancer" -ForegroundColor Yellow
$freelancerId = $freelancer.user._id
try {
    $reputation = Invoke-RestMethod -Uri "http://localhost:5000/api/reputation/freelancer/$freelancerId" -Method GET
    Write-Host "✅ Reputación calculada:" -ForegroundColor Green
    $reputation | ConvertTo-Json
} catch {
    Write-Host "❌ Error calculando reputación: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 11. Proyectos recomendados para el freelancer
Write-Host "11. 🎯 Obteniendo proyectos recomendados" -ForegroundColor Yellow
try {
    $matching = Invoke-RestMethod -Uri "http://localhost:5000/api/matching/$freelancerId" -Method GET
    Write-Host "✅ Proyectos recomendados:" -ForegroundColor Green
    $matching | ConvertTo-Json
} catch {
    Write-Host "❌ Error obteniendo recomendaciones: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ¡Pruebas completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen de funcionalidades probadas:" -ForegroundColor Cyan
Write-Host "✅ Health check de la API" -ForegroundColor White
Write-Host "✅ Registro de usuarios (freelancer y empresa)" -ForegroundColor White
Write-Host "✅ Autenticación (login)" -ForegroundColor White
Write-Host "✅ Creación de proyectos" -ForegroundColor White
Write-Host "✅ Listado de proyectos" -ForegroundColor White
Write-Host "✅ Postulaciones a proyectos" -ForegroundColor White
Write-Host "✅ Gestión de postulaciones" -ForegroundColor White
Write-Host "✅ Sistema de reputación" -ForegroundColor White
Write-Host "✅ Sistema de matching/recomendaciones" -ForegroundColor White