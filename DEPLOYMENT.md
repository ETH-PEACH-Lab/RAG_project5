# Using the GitHub Container Registry for Deployment

1. Create a personal token: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

```
docker login ghcr.io --username github-account
[Paste your GitHub token on this prompt]
```
2. Build the image for the server
```
docker-compose build rag-amd64
```

2. Tag and push your Docker image
```
docker tag <your-image-id> ghcr.io/eth-peach-lab/competilearn/rag-amd64:latest
docker push ghcr.io/eth-peach-lab/competilearn/rag-amd64:latest
```