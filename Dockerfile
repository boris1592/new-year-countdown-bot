FROM node:20
ENV TZ="Europe/Moscow"

WORKDIR /bot
COPY . .

RUN npm i --production
CMD ["node", "src/index"]
