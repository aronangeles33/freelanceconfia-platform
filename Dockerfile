# Usa Node.js 18 LTS
FROM node:18-alpine

# Establece directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala TODAS las dependencias (incluyendo devDependencies como Vite)
RUN npm ci

# Copia el código fuente
COPY . .

# Expone el puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]