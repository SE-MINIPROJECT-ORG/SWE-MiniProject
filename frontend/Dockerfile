# Stage 1: build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve the built files with nginx over HTTPS
FROM nginx:1.27-alpine
# Self-signed certificate for local use (EVT-SR-004). The browser shows a warning
# once because no certificate authority signed it; the connection is still encrypted.
RUN apk add --no-cache openssl \
  && mkdir -p /etc/nginx/certs \
  && openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
     -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
     -keyout /etc/nginx/certs/ems.key -out /etc/nginx/certs/ems.crt
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
