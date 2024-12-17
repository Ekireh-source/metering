#!/bin/sh
if [ "$POSTGRES_DB" = "metering" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $PG_HOST $PG_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"

    if [ "$#" -ne 0 ]; then
        exec "$@"
    elif [ ${LAUNCH_TYPE:-"webserver"} = "worker" ]; then 
        mkdir -p /var/run/celery /var/log/celery
        chown -R $(whoami):$(whoami) /var/run/celery /var/log/celery
        chown -R $(whoami):$(whoami) /tmp
        python manage.py migrate django_celery_beat --noinput
        python manage.py migrate django_celery_results --noinput
        python manage.py makemigrations
        python manage.py migrate
        celery -A meteringapi worker -E -l INFO  --logfile=/var/log/celery/worker.log --uid=$(whoami) --gid=$(whoami) --concurrency=1 &
        celery -A meteringapi worker -E -l INFO  --logfile=/var/log/celery/worker.log --uid=$(whoami) --gid=$(whoami) -n worker.low -Q low --concurrency=1 &
        celery -A meteringapi worker -E -l INFO  --logfile=/var/log/celery/worker.log --uid=$(whoami) --gid=$(whoami)  -n worker.high -Q high --concurrency=1
    elif [ ${LAUNCH_TYPE:-"webserver"} = "webserver" ]; then 
        echo "API started"
        python manage.py collectstatic --noinput
        python manage.py makemigrations
        python manage.py migrate
        python manage.py migrate cities --noinput
        python manage.py migrate sessions --noinput
        python manage.py runserver 0.0.0.0:8000
    elif [ ${LAUNCH_TYPE:-"webserver"} = "beat" ]; then
        python manage.py migrate django_celery_beat --noinput
        celery -A meteringapi beat -l INFO
    fi
    
fi