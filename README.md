# README

## Run Docker Locally
1. Download the `data.zip` and unzip it to `./data`

2. Create `./.env` for the OPENAI API

```
# .env
OPENAI_API_KEY=YOUR_API_KEY

```
3. Build docker
```
docker-compose -f docker-compose_local.yml build
```
4. Run docker
```
docker-compose -f docker-compose_local.yml up
```

## Run Server and Frontend Locally
1. Create `./server/.env.local` for the OPENAI API

```
touch ./server/.env.local
export OPENAI_API_KEY=DONTSHAREWITHOTHERS
```

2. Run frontend at port `3000`:
```
cd frontend
npm install
npm run start
```

3. Run server at port `5001`:

```
cd server
pip install -r requirements.txt
python app.py
```
