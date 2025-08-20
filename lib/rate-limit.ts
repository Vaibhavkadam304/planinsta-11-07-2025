import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const ratelimit = new Ratelimit({
  redis,
  // 1 request allowed every 19 seconds per key (sliding window)
  limiter: Ratelimit.slidingWindow(1, "19 s"),
  analytics: true,
  prefix: "rl:gen19",
});