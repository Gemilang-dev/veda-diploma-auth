FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port (Hugging Face uses 7860 by default)
EXPOSE 7860

# Command to run the application
# We use uvicorn directly. Note the path veda_backend.main:app
CMD ["python", "-m", "uvicorn", "veda_backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
