FROM node:18-slim as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g @ionic/cli
RUN ionic build --prod

FROM nginx:latest AS ngi
COPY --from=node /app/www /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
