FROM python:3.12-slim

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Ensure python can find the 'app' module inside /code
ENV PYTHONPATH=/code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# FIX 1: Copy contents into an explicit 'app' folder
# instead of flattening them into root
COPY . /code/app

EXPOSE 8000

# FIX 2: Run the module 'app.main' instead of the file 'main'
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]