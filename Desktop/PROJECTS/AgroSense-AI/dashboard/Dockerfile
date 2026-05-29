FROM python:3.11-slim

# System dependencies for curl/network health check
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Streamlit and visualization requirements directly
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    streamlit==1.34.0 \
    requests==2.31.0 \
    pandas==2.2.2 \
    numpy==1.26.4 \
    plotly==5.22.0 \
    folium==0.16.0 \
    streamlit-folium==0.19.2 \
    matplotlib==3.8.4

# Copy dashboard directory code
COPY . .

EXPOSE 8501

# Health check for Streamlit dev server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", "--server.port", "8501", "--server.address", "0.0.0.0"]
