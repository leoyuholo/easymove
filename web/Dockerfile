FROM node:6

COPY web /app/web
COPY lib /app/lib

WORKDIR /app/lib/amqp

RUN npm install

WORKDIR /app/web

RUN npm install

CMD [ "npm", "start" ]
