#!/bin/bash

echo "🐳 Testing Docker build locally..."

# Build the Docker image
echo "Building Docker image..."
docker build -t agri-ml-backend-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    echo "Testing container startup..."
    # Run the container in background
    docker run -d --name agri-ml-test -p 5001:5000 agri-ml-backend-test
    
    # Wait a bit for startup
    sleep 10
    
    # Test health endpoint
    echo "Testing health endpoint..."
    curl -f http://localhost:5001/health
    
    if [ $? -eq 0 ]; then
        echo "✅ Health check passed!"
        echo "✅ Container is running successfully!"
    else
        echo "❌ Health check failed!"
    fi
    
    # Cleanup
    echo "Cleaning up test container..."
    docker stop agri-ml-test
    docker rm agri-ml-test
    
else
    echo "❌ Docker build failed!"
    exit 1
fi

echo "🎉 Local Docker test completed!"
