# pwa-prototype
Prototype of an alpheios-enabled PWA

## Docker image
PWA uses an Nginx with SSL Docker image. Before use, you need to build it.
This can be done with:
```
docker build -f docker-image/Dockerfile -t alpheios-nginx-ssl:v1 ./docker-image
```
or with Docker Compose:
```
docker-compose build
```
Both commands should be run from a project root directory.

## Private key and certificate
For testing on localhost self-signed key and certificate is the only option. Both should be placed to the `certs`
directory and named `localhost.key` and `localhost.crt` correspondingly.

Because bot private key and certificate need to be installed locally, they are not added to the version control.
They should be generated with `openssl` before running an image with the following command issued from the
project root directory:
```
openssl req -subj '/CN=localhost' -x509 -newkey rsa:4096 -nodes -keyout ./docker-nginx-config/certs/localhost.key -out ./docker-nginx-config/certs/localhost.crt -days 365`
```

## Starting an image
After an image is built, it can be started with Docker Compose:
```
docker-compose up -d
```
The server will be available via HTTP on port 8020 and via HTTPS on port 8120. If you want to use different ports,
please edit them in `docker-compose.yml`.

The web server root is mapped to the root directory of the project.

## Allow self-signed certificates in Google Chrome
The Chrome flag `allow-insecure-localhost` will allow to develop on localhost with a self signed certificate. 
Use the following URI to access it: `chrome://flags/#allow-insecure-localhost`.

## Caching Strategy

### Server Revalidated (`Cache-Control: no-cache`)
`/`, `/index.html`, `/sw.js`

### Long Max-Age (`Cache-Control: max-age=31536000`)
Rest of the files. All those files should have a hash in their names so that the cache know when its content 
was changed.