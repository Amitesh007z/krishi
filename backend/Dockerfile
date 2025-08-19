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

# Copy models directory first and verify it exists
COPY models/ ./models/
RUN echo "=== Models directory copied ===" && \
    ls -la models/ && \
    echo "=== Model files found ===" && \
    find models/ -name "*.pkl" -exec echo "Found: {}" \;

# Copy the rest of the application files
COPY app.py .
COPY export_model.py .

# Final verification that all required files exist
RUN echo "=== Final verification ===" && \
    test -f models/market_price_model.pkl && echo "✅ market_price_model.pkl exists" && \
    test -f models/encoders.pkl && echo "✅ encoders.pkl exists" && \
    test -f models/feature_columns.pkl && echo "✅ feature_columns.pkl exists" && \
    test -f models/model_metadata.pkl && echo "✅ model_metadata.pkl exists" && \
    echo "=== All model files verified successfully ==="

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "app:app"]


