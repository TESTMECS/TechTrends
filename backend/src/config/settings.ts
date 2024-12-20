import { urlSchema } from "../validation/common";

export const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017/',
  database: 'TechTrends',
};

export const redisConfig = {
  url: process.env.REDIS_SERVER_URL || 'redis://localhost:6379',
};

export const redisConfigV2 = {
  host: 'localhost',
  port: 6379,
  url: process.env.REDIS_SERVER_URL || 'redis://localhost:6379',
};

export const rabbitMQConfig = {
  url: process.env.RABBITMQ_SERVER_URL || 'amqp://localhost:5672',
};

export const elasticConfig = {
  node: process.env.ELASTIC_SERVER_URL || 'http://localhost:9200',
};

export const frontendConfig = {
  url: 'http://localhost:3000',
};
