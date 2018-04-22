FROM node:carbon AS builder

WORKDIR /etc/mlg2048
ADD ./package.json ./
ADD ./package-lock.json ./
RUN npm install
ADD . .
RUN npm run build


FROM nginx

COPY --from=builder /etc/mlg2048/dist /usr/share/nginx/html
COPY --from=builder /etc/mlg2048/privacy.txt /usr/share/nginx/html

EXPOSE 80
