FROM node:16-alpine as dependencies
WORKDIR /mcr_dependencies
COPY package.json yarn.lock ./
RUN apk add --no-cache python3 py3-pip
RUN apk add --update alpine-sdk
RUN yarn install
COPY . .

FROM node:16-alpine as builder
WORKDIR /builder
COPY . .
COPY --from=dependencies /mcr_dependencies/node_modules ./node_modules
RUN yarn build

FROM node:16-alpine as production
WORKDIR /mcr_backend
ENV NODE_ENV production
RUN apk --no-cache add curl
COPY /src ./src
COPY --from=builder /builder/dist ./dist
COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/package.json ./package.json
# COPY --from=builder /builder/src /src
# ENV NODE_PATH=./dist
CMD yarn start
