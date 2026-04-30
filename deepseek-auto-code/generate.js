const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("❌ Aucune instruction fournie. Exemple : node generate.js \"crée une fonction qui trie un tableau\"");
  process.exit(1);
}

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("❌ DEEPSEEK_API_KEY manquant dans le fichier .env");
  process.exit(1);
}

const MAX_RETRIES = 3;

async function callDeepSeek(attempt = 1) {
  try {
    console.log(`⏳ Envoi à DeepSeek... (tentative ${attempt}/${MAX_RETRIES})`);

    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a senior developer. Only return clean code without any explanation, comments or markdown. No code fences."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    const isRetryable = !err.response && attempt < MAX_RETRIES;
    if (isRetryable) {
      const wait = attempt * 2000;
      console.warn(`⚠️  Erreur réseau (${err.message}), nouvelle tentative dans ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      return callDeepSeek(attempt + 1);
    }
    throw err;
  }
}

async function generateCode() {
  try {
    const raw = await callDeepSeek();

    const code = raw
      .replace(/^```[\w]*\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    fs.writeFileSync("output.js", code);
    console.log("✅ Code généré dans output.js");
  } catch (err) {
    if (err.response) {
      console.error("❌ Erreur API DeepSeek :", err.response.status, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("❌ Erreur réseau :", err.message);
    }
    process.exit(1);
  }
}

generateCode();





