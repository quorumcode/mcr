#!/bin/bash

docker-compose --env-file env.dev -p 'myclientreviews' -f docker-compose.yml -f docker-compose.local.yaml $@
