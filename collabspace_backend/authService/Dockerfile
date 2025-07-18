FROM amazoncorretto:21.0.4-alpine3.18 as builder

# Install Maven and other required tools
RUN apk update && apk add maven

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

CMD ["java", "-jar", "app.jar"]
