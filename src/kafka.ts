import { TODO } from "./utils/types";
import { Consumer, Kafka, Producer, logLevel } from "kafkajs";

class KafkaConfig {
  kafka: Kafka;
  producer: Producer;
  consumer: Consumer;
  constructor() {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER as string],
      ssl: true,
      sasl: {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_USERNAME as string,
        password: process.env.KAFKA_PASSWORD as string,
      },
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "test-group" });
  }

  async produce(topic: TODO, messages: TODO) {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      console.error(error);
    } finally {
      await this.producer.disconnect();
    }
  }

  async consume(topic: TODO, callback: TODO) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value?.toString();
          callback(value);
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default KafkaConfig;
