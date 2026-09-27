# ---- Build stage ----
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Cache dependencies in their own layer: this only re-runs when pom.xml changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads && chown -R app:app /app
USER app

COPY --from=build --chown=app:app /app/target/*.jar app.jar

# Persist uploaded files (avatars, product/blog images) outside the container.
VOLUME ["/app/uploads"]
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
