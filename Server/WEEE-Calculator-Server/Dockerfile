#Build
# Use the official Node.js 18 image as the base image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g typescript
#Compiles the app
RUN tsc

#Exposes port 3000, the app is available on port 3000
EXPOSE 3000

CMD ["node", "dist/main.js"]