"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.TZ = 'Asia/Ho_Chi_Minh';
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const body_parser_1 = require("body-parser");
async function bootstrap() {
    const PORT = process.env.APP_PORT || 3001;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('DA-TTTN API')
        .setDescription('Hệ thống quản lý tòa nhà / khu dân cư')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    app.use((0, body_parser_1.json)({ limit: '20mb' }));
    app.use((0, body_parser_1.urlencoded)({ limit: '20mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: true,
        transformOptions: { enableImplicitConversion: true },
        stopAtFirstError: false,
    }));
    await app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://localhost:${PORT} and 0.0.0.0:${PORT}`);
        console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map