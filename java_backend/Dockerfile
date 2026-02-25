# Use JDK 21 as the base image
FROM eclipse-temurin:21-jdk-jammy AS build

# Set working directory inside the container
WORKDIR /app

# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Give execution permission to mvnw
RUN chmod +x mvnw

# Resolve dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render uses 10000 by default but matches the PORT env)
EXPOSE 10000

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
