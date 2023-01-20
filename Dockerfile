FROM node:lts-alpine
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_SECRET="This is supposed to be a secret.shhh."
ENV TOKEN_HEADER_KEY=TOKEN_HEADER
ENV MONGODB_URL=CONFIDENTIAL_URL
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
