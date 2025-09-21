# Stage 1: Build the React app
FROM node:22 AS build
ENV REACT_APP_API_DOMAIN=http://localhost REACT_APP_PORT=8000
WORKDIR /web
COPY package.json package-lock.json ./
RUN yarn
COPY . .
RUN yarn run build


# Stage 2: Serve the app with a lightweight web server
FROM nginx:alpine
COPY --from=build /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]