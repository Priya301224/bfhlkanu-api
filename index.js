import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.OFFICIAL_EMAIL;

// ---------- Utility Functions ----------

// Fibonacci
function getFibonacci(n) {
  let result = [];
  let a = 0, b = 1;

  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

// Prime check
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// GCD (for HCF)
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// HCF
function getHCF(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

// LCM
function getLCM(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

// ---------- Routes ----------

// Health API
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

// Main BFHL API
app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    // Exactly one key required
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Exactly one input key is required"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(req.body[key])) throw "Invalid fibonacci input";
        data = getFibonacci(req.body[key]);
        break;

      case "prime":
        if (!Array.isArray(req.body[key])) throw "Invalid prime input";
        data = req.body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(req.body[key])) throw "Invalid lcm input";
        data = getLCM(req.body[key]);
        break;

      case "hcf":
        if (!Array.isArray(req.body[key])) throw "Invalid hcf input";
        data = getHCF(req.body[key]);
        break;

      case "AI":
        if (typeof req.body[key] !== "string") throw "Invalid AI input";

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: req.body[key] }] }]
            })
          }
        );

        const aiResult = await response.json();
        data =
          aiResult?.candidates?.[0]?.content?.parts?.[0]?.text
            ?.split(" ")[0] || "Unknown";
        break;

      default:
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (error) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: "Bad Request"
    });
  }
});

app.listen(PORT, () => {
  console.log("API running on port " + PORT);
});
