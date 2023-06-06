# Pulse Client

Client for Pulse Messenger

## How to run

- install the dependencies with node lts/hydrogen

```bash
npm i
```
  
- create a .env file

```env
VITE_API_PATH=Your API path
VITE_MEDIA_PATH=Your media service path
```

- run the client with

```bash
npm run build

npm preview
```

- test the client with

```bash
npm run dev
```

## Docker

```bash
# build with
docker build -t client .

# run with
docker run 
  -p 8080:80
```
