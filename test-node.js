const http = require('http');

// Función para hacer requests HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Probando FreelanceConfía API...\n');

  try {
    // 1. Health Check
    console.log('1. ✅ Health Check');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Status:', health.status);
    console.log('Response:', health.data);
    console.log('');

    // 2. Registrar Freelancer
    console.log('2. 👤 Registrando freelancer');
    const freelancerData = {
      email: 'freelancer@test.com',
      password: '123456',
      name: 'Juan Pérez',
      role: 'freelancer',
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'México'
    };

    const freelancer = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, freelancerData);

    console.log('Status:', freelancer.status);
    if (freelancer.status === 201) {
      console.log('✅ Freelancer registrado:', freelancer.data.user.name);
      var freelancerToken = freelancer.data.token;
      var freelancerId = freelancer.data.user._id;
    } else {
      console.log('❌ Error:', freelancer.data);
    }
    console.log('');

    // 3. Registrar Empresa
    console.log('3. 🏢 Registrando empresa');
    const companyData = {
      email: 'empresa@test.com',
      password: '123456',
      name: 'TechCorp SA',
      role: 'company',
      location: 'Colombia'
    };

    const company = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, companyData);

    console.log('Status:', company.status);
    if (company.status === 201) {
      console.log('✅ Empresa registrada:', company.data.user.name);
      var companyToken = company.data.token;
    } else {
      console.log('❌ Error:', company.data);
    }
    console.log('');

    if (!companyToken) return;

    // 4. Crear Proyecto
    console.log('4. 📋 Creando proyecto');
    const projectData = {
      title: 'Desarrollo de App Web',
      description: 'Necesitamos desarrollar una aplicación web moderna con React y Node.js',
      budget: 5000,
      category: 'Desarrollo Web',
      location: 'Remoto'
    };

    const project = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${companyToken}`
      }
    }, projectData);

    console.log('Status:', project.status);
    if (project.status === 201) {
      console.log('✅ Proyecto creado:', project.data.project.title);
      var projectId = project.data.project._id;
    } else {
      console.log('❌ Error:', project.data);
    }
    console.log('');

    // 5. Listar Proyectos
    console.log('5. 📋 Listando proyectos');
    const projects = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Status:', projects.status);
    if (projects.status === 200) {
      console.log('✅ Proyectos encontrados:', projects.data.length);
    } else {
      console.log('❌ Error:', projects.data);
    }
    console.log('');

    if (!freelancerToken || !projectId) return;

    // 6. Postularse al Proyecto
    console.log('6. 📝 Freelancer postulándose');
    const applicationData = {
      projectId: projectId,
      proposal: 'Tengo 5 años de experiencia en React y Node.js. Puedo completar este proyecto en 4 semanas.'
    };

    const application = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${freelancerToken}`
      }
    }, applicationData);

    console.log('Status:', application.status);
    if (application.status === 201) {
      console.log('✅ Postulación enviada');
      var applicationId = application.data.application._id;
    } else {
      console.log('❌ Error:', application.data);
    }
    console.log('');

    // 7. Calcular Reputación
    console.log('7. ⭐ Calculando reputación');
    const reputation = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/reputation/freelancer/${freelancerId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Status:', reputation.status);
    if (reputation.status === 200) {
      console.log('✅ Reputación:', reputation.data.reputationScore);
    } else {
      console.log('❌ Error:', reputation.data);
    }
    console.log('');

    // 8. Matching de Proyectos
    console.log('8. 🎯 Proyectos recomendados');
    const matching = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/matching/${freelancerId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Status:', matching.status);
    if (matching.status === 200) {
      console.log('✅ Proyectos recomendados:', matching.data.matchedProjects.length);
    } else {
      console.log('❌ Error:', matching.data);
    }

    console.log('\n🎉 ¡Pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testAPI();