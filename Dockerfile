FROM node:18.18.2
WORKDIR /home-page
EXPOSE 4869
LABEL org.opencontainers.image.authors="castamere"
CMD ["npm", "run", "start"]