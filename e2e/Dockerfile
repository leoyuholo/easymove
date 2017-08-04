FROM node:6

RUN npm install -g yarn

COPY . /app/e2e

WORKDIR /app/e2e

RUN yarn install

CMD [ "npm", "test" ]
