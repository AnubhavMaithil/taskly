import mongoose from "mongoose";
import { env } from "./env";

let connected = false;

export async function connectDatabase() {
  if (connected) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongoUri);
  connected = true;
  return mongoose.connection;
}
