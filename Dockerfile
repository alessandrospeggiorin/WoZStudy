# pull official base image
FROM node:latest as builder

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
RUN npm install --silent
RUN npm install fetch

# add app
COPY . ./
# start app
CMD ["npm", "run","build"]

FROM nginx:latest
COPY --from=builder /app/dist/woz /usr/share/nginx/html
EXPOSE 80