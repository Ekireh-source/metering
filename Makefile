build:
	docker-compose build

up:
	docker-compose up

show-logs:
	docker-compose logs

bash-app:
	docker-compose exec api /bin/bash

bash-client:
	docker-compose exec client /bin/bash

shell:
	docker-compose exec app python manage.py shell

shellplus:
	docker-compose exec app python manage.py shell_plus

migrations:
	docker-compose exec app python manage.py makemigrations ${APP}

migrate:  # run migration in docker-compose
	docker-compose exec app python manage.py migrate ${APP}

superuser:  # run migration in docker-compose
	docker-compose exec app python manage.py createsuperuser

collectstatic:
	docker compose exec app python3 manage.py collectstatic --no-input --clear

down:  # bring down docker compose stack
	docker-compose down

startapp:
	docker-compose exec app python manage.py startapp ${APP}

test-app:
	docker-compose run --rm app python manage.py test -v 2 ${CASE}

test-client:
	docker-compose exec client yarn test ${CASE}

add-countries:
	docker-compose exec app python manage.py cities --import=country

lint-apply:
	@echo "applying lint changes ..."
	docker-compose exec api black --pxclude='''/(client|migrations*)/''' .
	docker-compose exec api flake8 --ignore=D401,W503 --exclude client,migrations .
	docker-compose exec api /bin/sh -c "isort --profile black ./*/*.py"