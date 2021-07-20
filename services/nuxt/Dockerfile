FROM node:lts

WORKDIR /usr/src/app

COPY ./nuxt-app/ ./

RUN yarn install && yarn build

ENV HOST 0.0.0.0

ENV NUXT_PORT 80

EXPOSE $NUXT_PORT

CMD ["yarn", "start"]