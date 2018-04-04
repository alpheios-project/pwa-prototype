FROM nginx:1.13

ENV DOCKER_HOST unix:///tmp/docker.sock

EXPOSE 80
EXPOSE 443

STOPSIGNAL SIGTERM

VOLUME ["/etc/nginx/conf.d", "/etc/nginx/ssl", "/usr/share/nginx/html"]

# Install wget and install/updates certificates
RUN apt-get update \
 && apt-get install -y -q --no-install-recommends \
    ca-certificates \
    wget \
 && apt-get clean \
 && rm -r /var/lib/apt/lists/*

CMD ["nginx", "-g", "daemon off;"]