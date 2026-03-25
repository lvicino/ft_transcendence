# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.6.1

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
COPY package*.json ./
RUN npm install --omit=dev

FROM base as production
ENV NODE_ENV=production
RUN chown node:node /usr/src/app
USER node
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 443
CMD node src/server.js

FROM base as development
ENV NODE_ENV=development
RUN chown node:node /usr/src/app
USER node
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 443
CMD npm run dev
