#!/bin/sh
set -e

celery -A meteringapi worker -E -l INFO --concurrency=1 &
celery -A meteringapi worker -E -l INFO -n worker.low -Q low --concurrency=1 &
celery -A meteringapi worker -E -l INFO -n worker.high -Q high --concurrency=1
