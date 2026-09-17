# --- Stage 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite "hornea" las variables VITE_* en el bundle en tiempo de build, no en
# runtime (a diferencia de un server Node). Por eso va como ARG: si necesitás
# apuntar a otra URL de API, se define al buildear la imagen, no al correrla.
ARG VITE_API_BASE_URL=http://localhost:8081/tp_parte3/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- Stage 2: serve ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
