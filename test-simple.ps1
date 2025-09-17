# Script de pruebas para FreelanceConfia API
Write-Host "Probando FreelanceConfia API..." -ForegroundColor Green

# 1. Health Check
Write-Host "1. Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "Health check exitoso:" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error en health check: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Registrar usuario freelancer
Write-Host "2. Registrando usuario freelancer" -ForegroundColor Yellow
$freelancerData = @{
    email = "freelancer@test.com"
    password = "123456"
    name = "Juan Perez"
    role = "freelancer"
    skills = @("JavaScript", "React", "Node.js")
    location = "Mexico"
} | ConvertTo-Json -Depth 3

try {
    $freelancer = Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method POST -Body $freelancerData -ContentType "application/json"
    Write-Host "Freelancer registrado exitosamente" -ForegroundColor Green
    $freelancerToken = $freelancer.token
    $freelancerId = $freelancer.user._id
    Write-Host "Token: $freelancerToken"
} catch {
    Write-Host "Error registrando freelancer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Registrar usuario empresa
Write-Host "3. Registrando usuario empresa" -ForegroundColor Yellow
$companyData = @{
    email = "empresa@test.com"
    password = "123456"
    name = "TechCorp SA"
    role = "company"
    location = "Colombia"
} | ConvertTo-Json -Depth 3

try {
    $company = Invoke-RestMethod -Uri "http://localhost:5000/api/register" -Method POST -Body $companyData -ContentType "application/json"
    Write-Host "Empresa registrada exitosamente" -ForegroundColor Green
    $companyToken = $company.token
    Write-Host "Token: $companyToken"
} catch {
    Write-Host "Error registrando empresa: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Crear proyecto
Write-Host "4. Creando proyecto" -ForegroundColor Yellow
$projectData = @{
    title = "Desarrollo de App Web"
    description = "Necesitamos desarrollar una aplicacion web moderna"
    budget = 5000
    category = "Desarrollo Web"
    location = "Remoto"
} | ConvertTo-Json -Depth 3

$headers = @{
    "Authorization" = "Bearer $companyToken"
    "Content-Type" = "application/json"
}

try {
    $project = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method POST -Body $projectData -Headers $headers
    Write-Host "Proyecto creado exitosamente" -ForegroundColor Green
    $projectId = $project.project._id
    Write-Host "Project ID: $projectId"
} catch {
    Write-Host "Error creando proyecto: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Listar proyectos
Write-Host "5. Listando proyectos" -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method GET
    Write-Host "Proyectos encontrados: $($projects.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error listando proyectos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Postularse al proyecto
Write-Host "6. Freelancer postulándose" -ForegroundColor Yellow
$applicationData = @{
    projectId = $projectId
    proposal = "Tengo experiencia en React y Node.js"
} | ConvertTo-Json -Depth 3

$freelancerHeaders = @{
    "Authorization" = "Bearer $freelancerToken"
    "Content-Type" = "application/json"
}

try {
    $application = Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method POST -Body $applicationData -Headers $freelancerHeaders
    Write-Host "Postulacion enviada exitosamente" -ForegroundColor Green
    $applicationId = $application.application._id
    Write-Host "Application ID: $applicationId"
} catch {
    Write-Host "Error en postulacion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Ver postulaciones
Write-Host "7. Viendo postulaciones del proyecto" -ForegroundColor Yellow
try {
    $applications = Invoke-RestMethod -Uri "http://localhost:5000/api/applications/project/$projectId" -Method GET -Headers $headers
    Write-Host "Postulaciones encontradas: $($applications.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error viendo postulaciones: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 8. Calcular reputacion
Write-Host "8. Calculando reputacion" -ForegroundColor Yellow
try {
    $reputation = Invoke-RestMethod -Uri "http://localhost:5000/api/reputation/freelancer/$freelancerId" -Method GET
    Write-Host "Reputacion calculada: $($reputation.reputationScore)" -ForegroundColor Green
} catch {
    Write-Host "Error calculando reputacion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pruebas completadas!" -ForegroundColor Green