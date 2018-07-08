server {
	listen 443 ssl;
	listen [::]:443 ssl;
	server_name game.mlg2048.com;

	ssl_certificate     "/etc/letsencrypt/live/game.mlg2048.com/fullchain.pem";
	ssl_certificate_key "/etc/letsencrypt/live/game.mlg2048.com/privkey.pem";

	gzip on;
	gzip_static on;

	root "/opt/www/game.mlg2048.com/dist";

	include "snippets/letsencrypt.conf";
}

server {
	listen 80;
	listen [::]:80;
	server_name *.mlg2048.com mlg2048.com;

	location / {
		rewrite ^/(.*) https://game.mlg2048.com/$1 permanent;
	}
}
