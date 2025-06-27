#FROM python:3.11-slim
#
#WORKDIR /app
#
#COPY requirements.txt .
#
#RUN pip install --upgrade pip
#RUN pip install -r requirements.txt
#
#COPY . .
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

FROM python:3.10-slim

# Install dependencies: Java 17 and system utils
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"
ENV TERM=xterm

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy app source
COPY . .

# Run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

