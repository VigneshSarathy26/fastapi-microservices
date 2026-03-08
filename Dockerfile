FROM python:3.12

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Ensure python can find the 'app' module inside /code
#ENV PYTHONPATH=/code

# install build dependencies for psycopg2 and any Rust-based wheels (pydantic-core)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

EXPOSE 8000

# FIX 2: Run the module 'app.main' instead of the file 'main'
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]