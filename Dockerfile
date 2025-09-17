# Usa Node.js 18 LTS
FROM node:18-alpine

# Establece directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json del backend
COPY package*.json ./

# Instala dependencias del backend
RUN npm ci

# Copia el código fuente
COPY . .

# Instala dependencias del frontend e inicia el build
WORKDIR /app/FreelanceConfía/confia-talento-latam-main
RUN npm ci && npm run build

# Vuelve al directorio principal
WORKDIR /app

# Expone el puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para ejecutar la aplicación (sin build, ya está hecho)
CMD ["node", "app.js"]