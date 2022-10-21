FROM node:16.14.0-alpine3.14

WORKDIR /home

COPY ./src ./

CMD ["node", "index.js"]
