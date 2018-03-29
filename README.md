# pwa-prototype
Protype of an alpheios-enabled PWA

## Docker image
PWA uses an Nginx with SSL Docker image. Before use, an image has to be built with the following command from 
the project's root directory:
```
docker build -f docker-image/Dockerfile -t alpheios-nginx-ssl:v1 ./docker-image

```

## Private key and certificate
For testing on localhost self-signed key and certificate is the only option. Both should be placed to the `certs`
directory and named `localhost.key` and `localhost.crt` correspondingly.

Because bot private key and certificate need to be installed locally, they are not added to the version control.
They should be generated with `openssl` before running an image with the following command issued from the
project root directory:
```
openssl req -subj '/CN=localhost' -x509 -newkey rsa:4096 -nodes -keyout ./certs/localhost.key -out ./certs/localhost.crt -days 365`
```

## Starting an image
After an image is built, it can be started using the `docker-compose.yml` file in the project root directory as:
```
docker-compose up -d
```
The server will be available via HTTP on port 8020 and via HTTPS on port 8120. If you want to use different ports,
please edit them in `docker-compose.yml`.

The web server root is mapped to the project's root directory.