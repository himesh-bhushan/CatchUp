import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';

// --- DEBUG: Check if API Key is loading ---
console.log("🔑 KEY CHECK:", process.env.OPEN_WEARABLES_API_KEY ? "✅ Loaded" : "❌ MISSING (Check .env file)");

const app = express();
const PORT = process.env.PORT || 5001;

/* =========================================
   🍅 PART A: GROQ CHATBOT ROUTE
========================================= */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log("💬 Chat Request:", message);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful health assistant named CatchUp. Keep answers short, motivating, and health-focused." },
        { role: "user", content: message }
      ],
      model: "llama3-8b-8192", // ✅ Using fast Llama 3 on Groq
    });

    res.json({ reply: completion.choices[0]?.message?.content || "Thinking..." });

  } catch (error) {
    console.error("❌ Groq Error:", error.message);
    res.status(500).json({ reply: "Sorry, I'm having trouble thinking right now." });
  }
});

// 1. CORS & JSON (Allow everything for dev)
app.use(cors());
app.use(express.json());

// 2. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 3. Define User Schema
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: String,
  name: String,
  profile: { firstName: String, lastName: String, dob: String, gender: String, phone: String },
  healthMetrics: { height: String, weight: String, bloodType: String },
  medical: { conditions: [String], medications: String, allergies: String },
  emergencyContact: { name: String, phone: String },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- ROUTES ---

app.post('/api/wearables/init', async (req, res) => {
    console.log("⚠️ USING FAKE CONNECTION FOR UI TESTING");
    
    // Simulate a delay
    await new Promise(r => setTimeout(r, 1000));

    // Return a google link just to test the popup redirect
    // (Or use your dashboard URL to simulate 'success')
    res.json({ url: "https://www.google.com" }); 
    return; 

    // ... (rest of the real code below is ignored) ...
});

// Health Check (Use this to test if server is running)
app.get('/', (req, res) => {
    res.send("✅ CatchUp Backend is Online!");
});

// Signup Route
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    console.log("📥 Signup Request received for:", userData.email);
    let user = await User.findOneAndUpdate(
      { firebaseUid: userData.firebaseUid },
      userData,
      { new: true, upsert: true }
    );
    console.log(`✅ User Saved: ${user.name}`);
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ Error saving user:", error);
    res.status(500).json({ error: "Failed to save user" });
  }
});

// ✅ WEARABLES CONNECTION (Bulletproof Version)
app.post('/api/wearables/init', async (req, res) => {
  console.log("\n🍅 1. Starting Wearables Init...");
  try {
    const { firebaseUid, name } = req.body;
    const API_KEY = process.env.OPEN_WEARABLES_API_KEY;
    
    // FAILSAFE: Force 127.0.0.1 if .env is missing or says localhost
    // This fixes the "Hanging" issue on Macs with Docker
    const URL = (process.env.OPEN_WEARABLES_URL || "http://127.0.0.1:8000")
                .replace("localhost", "127.0.0.1");

    console.log(`   👉 Connecting to Docker at: ${URL}`);
    console.log(`   👉 User: ${name}`);

    // STEP A: Create User (Timeout added)
    try {
        await axios.post(`${URL}/api/v1/users`, {
            name: name,
            external_user_id: firebaseUid 
        }, { 
            headers: { 'x-api-key': API_KEY },
            timeout: 5000 // 5s timeout
        });
        console.log("   ✅ User created/verified on Wearables Server.");
    } catch (err) {
        if (err.response?.status === 409) {
           console.log("   ✅ User already exists (OK).");
        } else {
           console.error("   ❌ CREATE USER ERROR:", err.message);
           if (err.code === 'ECONNREFUSED') {
               throw new Error("Cannot reach Docker at 127.0.0.1:8000. Is it running?");
           }
           // Continue anyway, maybe user exists but API failed
        }
    }

    // STEP B: Get Link
    console.log("   👉 Fetching connection link...");
    const linkResponse = await axios.get(`${URL}/api/v1/users/${firebaseUid}/connections`, {
        headers: { 'x-api-key': API_KEY },
        timeout: 5000
    });

    const redirectUrl = linkResponse.data.url || linkResponse.data;
    console.log("   ✅ Success! Link:", redirectUrl);

    if (!redirectUrl || Array.isArray(redirectUrl)) {
        throw new Error("Wearables Server returned an empty link.");
    }

    res.json({ url: redirectUrl });

  } catch (error) {
    console.error("   ❌ FINAL ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Wearables Stats (Dummy Route to prevent 404s on Dashboard)
app.get('/api/wearables/stats/:uid', async (req, res) => {
    // Return zeros so the dashboard widgets load empty instead of crashing
    res.json({ steps: 0, sleep: 0, heart_rate: 0, calories: 0 });
});

// --- START SERVER (Bind to 0.0.0.0) ---
// This ensures it listens on IPv4 AND IPv6, preventing "Connection Refused"
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SERVER STARTED!`);
  console.log(`   • Local:   http://localhost:${PORT}`);
  console.log(`   • Network: http://127.0.0.1:${PORT}\n`);
});