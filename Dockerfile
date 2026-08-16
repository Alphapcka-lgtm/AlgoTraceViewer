# =========================
# 1. Build frontend
# =========================
FROM node:22-bookworm-slim AS frontend-build

WORKDIR /frontend

# Dependencies zuerst kopieren, damit Docker diesen Layer cachen kann
COPY frontend/package*.json ./
RUN npm ci

# Restliches Frontend kopieren und bauen
COPY frontend/ .
RUN npm run build


# =========================
# 2. Build Spring Boot backend
# =========================
FROM maven:3.9-eclipse-temurin-25 AS backend-build

WORKDIR /app

# Backend kopieren
COPY backend/ .

# Gebautes Frontend in Spring Boots static resources kopieren
RUN rm -rf src/main/resources/static
COPY --from=frontend-build /frontend/dist/ ./src/main/resources/static/

# Spring Boot JAR bauen
RUN mvn clean package -DskipTests


# =========================
# 3. Runtime image
# =========================
FROM eclipse-temurin:25-jre

WORKDIR /app

# Spring Boot Anwendung
COPY --from=backend-build /app/target/*.jar app.jar

# Default presets
COPY --from=backend-build /app/data ./data

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]