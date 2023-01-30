To launch dev containers:

1) docker-compose --env-file env.dev -p 'myclientreviews' -f docker-compose.yml -f docker-compose.dev.yml build
2) docker-compose --env-file env.dev -p 'myclientreviews' -f docker-compose.yml -f docker-compose.dev.yml up
