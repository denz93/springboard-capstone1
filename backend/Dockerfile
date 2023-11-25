FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN mkdir -p $HOME/.postgresql && cp .postgresql/root.crt $HOME/.postgresql/root.crt
RUN mkdir -p /home/.postgresql && cp .postgresql/root.crt /home/.postgresql/root.crt
RUN apt-get update \
    && apt-get -y install libpq-dev gcc

RUN pip install -r requirements.txt
CMD gunicorn --preload --bind :$PORT --workers 2 --threads 2 app:app