FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .
RUN npx prisma generate
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "run", "start"]