FROM node:24.13-alpine3.22 AS base
WORKDIR /usr/src/app
RUN chown node:node .
COPY --chown=node:node package.json package-lock.json ./
USER node

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY --chown=node:node . .
RUN npm run build

# a test
FROM nginx:1.29-alpine AS production 
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
