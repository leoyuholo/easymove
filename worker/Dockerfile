FROM node:6

RUN npm install -g yarn

COPY worker /app/worker
COPY lib /app/lib

WORKDIR /app/lib/amqp

RUN yarn install

WORKDIR /app/worker

RUN yarn install

CMD [ "npm", "start" ]
