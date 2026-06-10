# =============================================
# STAGE 1 — Build: Compile Java source với Maven
# =============================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml trước để cache dependencies (chỉ re-download khi pom.xml thay đổi)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# =============================================
# STAGE 2 — Runtime: Chỉ chứa JRE + file .jar
# Image nhỏ gọn, không có Maven/source code
# =============================================
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Tạo user non-root để tăng bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy file .jar từ stage builder
COPY --from=builder /app/target/*.jar app.jar

# Đổi owner về user non-root
RUN chown appuser:appgroup app.jar
USER appuser

# Port mà Spring Boot lắng nghe
EXPOSE 8080

# Khởi động ứng dụng với profile "prod"
# Tất cả secrets được inject qua ENV VARS của Render.com
ENTRYPOINT ["java", \
  "-Dspring.profiles.active=prod", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
