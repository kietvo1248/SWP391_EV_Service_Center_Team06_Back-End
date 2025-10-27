/**
 * Health check endpoint cho Render deployment
 * Endpoint: GET /health
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Kiểm tra sức khỏe của server và database
 */
async function healthCheck(req, res) {
    try {
        const startTime = Date.now();

        // Kiểm tra database connection
        await prisma.$queryRaw`SELECT 1`;
        const dbResponseTime = Date.now() - startTime;

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: {
                    status: 'connected',
                    responseTime: `${dbResponseTime}ms`
                },
                server: {
                    status: 'running',
                    memory: process.memoryUsage(),
                    pid: process.pid
                }
            }
        };

        res.status(200).json(healthStatus);
    } catch (error) {
        console.error('Health check failed:', error);

        const errorStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                database: {
                    status: 'disconnected',
                    error: error.message
                },
                server: {
                    status: 'running',
                    memory: process.memoryUsage(),
                    pid: process.pid
                }
            }
        };

        res.status(503).json(errorStatus);
    }
}

/**
 * Kiểm tra database connection chi tiết
 */
async function databaseHealthCheck(req, res) {
    try {
        const startTime = Date.now();

        // Test basic query
        await prisma.$queryRaw`SELECT 1 as test`;

        // Test table existence
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        const responseTime = Date.now() - startTime;

        res.json({
            status: 'healthy',
            database: {
                connected: true,
                responseTime: `${responseTime}ms`,
                tables: tables.length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            database: {
                connected: false,
                error: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = {
    healthCheck,
    databaseHealthCheck
};
