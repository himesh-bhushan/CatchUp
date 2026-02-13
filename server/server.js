import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

// --- 1. SETUP ---
const app = express();
const PORT = 5050; 

// ✅ Allow GET, POST, and PUT
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT'] }));
app.use(express.json());

// --- 2. SUPABASE CONFIGURATION ---
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Supabase URL or Key is missing from .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ HEALTH CHECK
app.get('/', (req, res) => {
    res.send("✅ CatchUp Backend (Supabase Proxy) is ALIVE on Port 5050");
});

/* =========================================
   👤 PART A: USER PROFILE API
========================================= */

// 1. GET User Profile
app.get('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone, calorie_goal') 
            .eq('id', uid)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "User not found" });

        const profile = {
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
        };

        res.json(profile);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. UPDATE User Profile
app.put('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const updates = req.body; 

        const supabaseUpdates = {};
        if (updates.firstName) supabaseUpdates.first_name = updates.firstName;
        if (updates.lastName) supabaseUpdates.last_name = updates.lastName;
        if (updates.phone) supabaseUpdates.phone = updates.phone;

        const { data, error } = await supabase
            .from('profiles')
            .update(supabaseUpdates)
            .eq('id', uid)
            .select();

        if (error) throw error;

        console.log(`✅ Updated Profile for ${uid}`);
        res.json({ success: true, profile: updates });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/* =========================================
   👤 PART B: USER SIGNUP SYNC
========================================= */
app.post('/api/users/sync', async (req, res) => {
    try {
        const { uid, email, name } = req.body;
        console.log(`👤 Syncing User: ${email}`);

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', uid)
            .single();

        if (!existingUser) {
            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: uid,
                    first_name: name || "Friend",
                    email: email, 
                    calorie_goal: 500
                });
            
            if (error) throw error;
            console.log("✅ Created new Supabase Profile");
        }

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Sync Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =========================================
   🎯 PART C: CALORIE GOAL API
========================================= */

// 1. GET Goal
app.get('/api/users/:uid/goal', async (req, res) => {
    try {
        const { uid } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('calorie_goal')
            .eq('id', uid)
            .single();

        if (error) throw error;
        
        res.json({ calorieGoal: data?.calorie_goal || 500 });
    } catch (err) {
        console.error("Get Goal Error:", err.message);
        res.json({ calorieGoal: 500 });
    }
});

// 2. UPDATE Goal
app.put('/api/users/:uid/goal', async (req, res) => {
    try {
        const { uid } = req.params;
        const { calorieGoal } = req.body;

        const { error } = await supabase
            .from('profiles')
            .update({ calorie_goal: calorieGoal })
            .eq('id', uid);

        if (error) throw error;
        res.json({ success: true, calorieGoal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =========================================
   💬 PART D: CHATBOT
========================================= */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) return res.json({ reply: "API Key Missing" });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: "You are 'CatchUp', a friendly health assistant. Keep answers short and motivating 🌿." },
          { role: "user", content: message }
        ]
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    res.json({ reply: response.data.choices?.[0]?.message?.content || "Thinking..." });

  } catch (error) {
    console.error("Groq Error:", error.message);
    res.status(500).json({ reply: "Offline." });
  }
});

/* =========================================
   ⌚ PART E: WEARABLES
========================================= */
app.post('/api/wearables/init', (req, res) => res.json({ success: true }));

app.get('/api/wearables/stats/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('steps, calories_burned, distance_km, heart_rate, sleep_seconds')
            .eq('id', uid)
            .single();

        if (data) {
            res.json({
                steps: data.steps || 0,
                calories: data.calories_burned || 0,
                distance: data.distance_km || 0,
                heart_rate: data.heart_rate || 72,
                sleep: data.sleep_seconds || 28800
            });
        } else {
            res.json({
                steps: 7000 + Math.floor(Math.random() * 2500),
                calories: 450,
                distance: 5.2,
                sleep: 27000, 
                heart_rate: 72,
            });
        }

    } catch (err) {
        console.error("Stats Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

/* =========================================
   📄 PART F: PDF REPORT GENERATOR
========================================= */
app.get('/api/report/pdf/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        console.log(`📄 Generating PDF for User: ${uid}`);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();
        
        const user = profile || { first_name: "Valued", last_name: "Guest", calorie_goal: 500 };

        const doc = new PDFDocument();
        const displayName = `${user.first_name || ""} ${user.last_name || ""}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Health_Report.pdf`);

        doc.pipe(res);

        doc.fontSize(25).text('CatchUp Health Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Patient Name: ${displayName}`);
        doc.text(`User ID: ${uid.substring(0, 10)}...`); 
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.fontSize(16).text('Current Goals', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`• Daily Calorie Goal: ${user.calorie_goal || 500} kCal`);
        doc.moveDown();

        doc.fontSize(16).text('Latest Vitals (Snapshot)', { underline: true });
        doc.moveDown(0.5);
        
        const stats = { 
            steps: user.steps || 0, 
            hr: user.heart_rate || 72, 
            sleep: user.sleep_seconds ? `${(user.sleep_seconds/3600).toFixed(1)}h` : "8h", 
            bp: "120/80" 
        };

        doc.list([
            `Heart Rate: ${stats.hr} bpm`,
            `Blood Pressure: ${stats.bp}`,
            `Daily Steps: ${stats.steps}`,
            `Sleep Duration: ${stats.sleep}`
        ]);

        doc.moveDown(2);
        doc.fontSize(10).fillColor('grey').text("Generated automatically by CatchUp System.", { align: 'center' });

        doc.end();

    } catch (error) {
        console.error("PDF Error:", error.message);
        res.status(500).send("Error generating PDF");
    }
});

// --- START SERVER ---
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SERVER STARTED ON PORT ${PORT}`);
    console.log(`👉 Supabase Proxy: Active`);
    console.log(`👉 PDF Report Generator: Active`);
});

// Capture errors (like Port already in use)
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⚠️  PORT ${PORT} IS ALREADY IN USE.`);
        console.error(`👉 Please stop the other server or change the PORT in .env`);
        process.exit(1);
    } else {
        console.error("⚠️  SERVER ERROR:", err);
    }
});