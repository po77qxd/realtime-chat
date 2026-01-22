import { createClient } from "redis";

const redisClient = createClient({
	url: "redis://default:admin@localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

export { redisClient };
