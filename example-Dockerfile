# better to stick with lts
FROM node:lts

# copy current data to container
WORKDIR /app

COPY . .

# install deps
RUN yarn install

ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
