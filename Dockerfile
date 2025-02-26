FROM node:20-slim

RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5001

CMD ["npm", "start"]