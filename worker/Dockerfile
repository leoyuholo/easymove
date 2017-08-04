FROM node:6

COPY worker /app/worker
COPY lib /app/lib

WORKDIR /app/lib/amqp

RUN npm install

WORKDIR /app/worker

RUN npm install

CMD [ "npm", "start" ]
