import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // in real-world-app we put the userId or ipAdress as a key
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }
    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
