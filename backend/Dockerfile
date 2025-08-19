FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from the backend directory
COPY . .

# Verify the models directory and files exist
RUN echo "=== Checking models directory ===" && \
    ls -la && \
    echo "=== Models directory contents ===" && \
    ls -la models/ && \
    echo "=== Checking for .pkl files ===" && \
    find . -name "*.pkl" -exec echo "Found: {}" \; && \
    echo "=== Verifying model files ===" && \
    test -f models/market_price_model.pkl && echo "✅ market_price_model.pkl exists" && \
    test -f models/encoders.pkl && echo "✅ encoders.pkl exists" && \
    test -f models/feature_columns.pkl && echo "✅ feature_columns.pkl exists" && \
    test -f models/model_metadata.pkl && echo "✅ model_metadata.pkl exists"

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "app:app"]


