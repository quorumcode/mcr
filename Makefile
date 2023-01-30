build:
	docker-compose --env-file .env.dev -p 'myclientreviews' build

up:
	docker-compose --env-file .env.dev -p 'myclientreviews' up

build-prod-on-dev:
	docker-compose --env-file .env.dev -p 'myclientreviews' -f docker-compose.yml -f docker-compose.prod.yml build

up-prod-on-dev:
	docker-compose --env-file .env.dev -p 'myclientreviews' -f docker-compose.yml -f docker-compose.prod.yml up

build-prod:
	docker-compose --env-file .env.prod -p 'myclientreviews' -f docker-compose.yml -f docker-compose.prod.yml build

up-prod:
	docker-compose --env-file .env.prod -p 'myclientreviews' -f docker-compose.yml -f docker-compose.prod.yml up -d
