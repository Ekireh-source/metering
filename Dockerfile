# Use the official Python image.
FROM python:3.11-slim as builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt update \
    && apt install -y tzdata libgdal-dev --no-install-recommends \
    && apt install -y binutils libproj-dev gdal-bin git \
    && apt install -y gcc g++ python3-dev musl-dev netcat-traditional\
    && apt clean -y \
    && pip install cython \
    && pip install psycopg2-binary \
    && pip install gdal==3.4.1

# Update C env vars so compiler can find gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# RUN pip install --upgrade pip
RUN pip3 install --upgrade pip
COPY ./requirements*.txt ./
RUN pip install -r requirements.txt -r requirements_dev.txt

COPY ./scripts/entrypoint.sh .
COPY ./scripts/run-local-workers.sh .

RUN chmod +x run-local-workers.sh

COPY ./meteringapi .

# run entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]