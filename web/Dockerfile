FROM node:6

RUN npm install -g yarn

COPY web /app/web
COPY lib /app/lib

WORKDIR /app/lib/amqp

RUN yarn install

WORKDIR /app/web

RUN yarn install

CMD [ "npm", "start" ]
