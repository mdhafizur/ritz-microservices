FROM node:17 As development

WORKDIR /usr/src/app

COPY package*.json ./

# install packages
RUN npm install -g npm@8.18.0
RUN npm ci --force

COPY . .

RUN npm run build app
