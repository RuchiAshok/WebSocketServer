FROM node:14.16.1

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY index.js ./

EXPOSE 8000

CMD ["npm", "start"]