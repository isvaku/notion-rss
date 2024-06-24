FROM node:22-alpine as build
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:22-alpine as ts-remover
WORKDIR /usr/app
COPY --from=build /usr/app/package*.json ./
COPY --from=build /usr/app/dist ./
RUN npm install --only=production

FROM node:22-alpine
RUN apk add --update tzdata
WORKDIR /usr/app
COPY --from=ts-remover /usr/app ./
USER 1000
CMD ["index.js"]