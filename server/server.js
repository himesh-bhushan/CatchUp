import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

// --- 1. SETUP ---
const app = express();
const PORT = process.env.PORT || 5050; 

const allowedOrigins = [
  'http://localhost:3000',           
  'https://www.catchup.page',        
  'https://catchup.page',            
  'https://backend.catchup.page',
  'https://catchup-frontend.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("🚫 CORS blocked for origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// --- 2. SUPABASE CONFIGURATION ---
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Supabase URL or Key is missing from environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ HEALTH CHECK
app.get('/', (req, res) => {
    res.send("✅ CatchUp Backend is ALIVE and SECURED for www.catchup.page");
});

/* =========================================
   👤 PART A: USER PROFILE API
========================================= */

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

        res.json({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const updates = req.body; 

        const supabaseUpdates = {};
        if (updates.firstName) supabaseUpdates.first_name = updates.firstName;
        if (updates.lastName) supabaseUpdates.last_name = updates.lastName;
        if (updates.phone) supabaseUpdates.phone = updates.phone;

        const { error } = await supabase
            .from('profiles')
            .update(supabaseUpdates)
            .eq('id', uid);

        if (error) throw error;
        res.json({ success: true, profile: updates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =========================================
   👤 PART B: USER SIGNUP SYNC
========================================= */
app.post('/api/users/sync', async (req, res) => {
    try {
        const { uid, email, name } = req.body;
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', uid)
            .maybeSingle();

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
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =========================================
   🎯 PART C: CALORIE GOAL API
========================================= */

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
        res.json({ calorieGoal: 500 });
    }
});

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
   💬 PART D: CHATBOT (Groq Llama 3)
========================================= */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.json({ reply: "Assistant config error." });

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
    res.status(500).json({ reply: "I'm currently resting. Try again soon!" });
  }
});

/* =========================================
   ⌚ PART E: WEARABLES DATA
========================================= */
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
            res.json({ steps: 7500, calories: 450, distance: 5.2, sleep: 27000, heart_rate: 72 });
        }
    } catch (err) {
        res.status(500).json({ error: "Stats unavailable" });
    }
});

/* =========================================
   📄 PART F: PDF REPORT GENERATOR
========================================= */
app.get('/api/report/pdf/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { data: user } = await supabase.from('profiles').select('*').eq('id', uid).single();
        
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Health_Report.pdf`);
        doc.pipe(res);

        doc.fontSize(25).text('CatchUp Health Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${user?.first_name || "User"} ${user?.last_name || ""}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.fontSize(16).text('Current Vitals', { underline: true });
        doc.fontSize(12).text(`• Heart Rate: ${user?.heart_rate || 72} bpm`);
        doc.text(`• Daily Steps: ${user?.steps || 0}`);
        doc.end();
    } catch (error) {
        res.status(500).send("PDF Error");
    }
});

/* =========================================
   ⌚ PART G: GOOGLE HEALTH SYNC (CONSOLIDATED)
========================================= */

// 1. OAuth2 Callback
app.get('/api/auth/google/callback', async (req, res) => {
    const { code, state } = req.query; 
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const { refresh_token } = response.data;

        if (refresh_token) {
            await supabase
                .from('profiles')
                .update({ google_refresh_token: refresh_token, google_connected: true })
                .eq('id', state);
        }
        res.redirect('https://www.catchup.page/dashboard?sync=success');
    } catch (error) {
        console.error("Google Auth Error:", error.response?.data || error.message);
        res.redirect('https://www.catchup.page/dashboard?sync=error');
    }
});

// 2. Data Sync
app.post('/api/wearables/google-sync/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { data: user } = await supabase.from('profiles')
            .select('google_refresh_token')
            .eq('id', uid)
            .single();

        if (!user?.google_refresh_token) return res.status(400).json({ error: "Google not connected" });

        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            refresh_token: user.google_refresh_token,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
        });

        const accessToken = tokenResponse.data.access_token;
        const fitResponse = await axios.post('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            {
                aggregateBy: [{ dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }],
                bucketByTime: { durationMillis: 86400000 }, 
                startTimeMillis: Date.now() - 86400000,
                endTimeMillis: Date.now()
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const steps = fitResponse.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
        const todayStr = new Date().toISOString().split('T')[0];

        // Calculation for Activity Ring
        const calories = Math.round(steps * 0.04); 
        const distance = parseFloat((steps * 0.0008).toFixed(2));

        await supabase.from('profiles').update({ steps }).eq('id', uid);
        
        // This is the most important part for your Dashboard Ring
        await supabase.from('activity_logs').upsert({
            user_id: uid,
            date: todayStr,
            steps: steps,
            calories: calories,
            distance: distance
        }, { onConflict: 'user_id,date' });

        res.json({ success: true, steps, calories });
    } catch (error) {
        console.error("Google Sync Error:", error.message);
        res.status(500).json({ error: "Sync failed" });
    }
});


/* =========================================
   ⌚ APPLE SHORTCUTS SYNC (RECEIVER)
========================================= */
app.post('/api/wearables/manual-sync/:uid', async (req, res) => {
    try {
        const cleanUid = req.params.uid.trim(); 
        const { steps, calories } = req.body; 
        const todayStr = new Date().toISOString().split('T')[0]; 
        const now = new Date().toISOString(); 

        const roundedSteps = Math.round(steps || 0);
        const roundedCalories = Math.round(calories || (roundedSteps * 0.04));
        const distance = parseFloat((roundedSteps * 0.0008).toFixed(2));

        // 🟢 STEP 1: Use UPSERT instead of UPDATE
        // This creates the profile row if it's missing, fixing the "Not Found" error
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
                id: cleanUid,
                steps: roundedSteps,
                last_synced_at: now 
            }, { onConflict: 'id' })
            .select();

        if (profileError) throw profileError;

        // 🟢 STEP 2: Update activity logs as usual
        const { error: logError } = await supabase.from('activity_logs').upsert({
            user_id: cleanUid,
            date: todayStr,
            steps: roundedSteps,
            calories: roundedCalories,
            distance: distance
        }, { onConflict: 'user_id,date' });

        if (logError) throw logError;

        res.json({ success: true, message: "Profile synced and timestamped!" });
    } catch (error) {
        console.error("Manual Sync Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
// --- 3. START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CatchUp Server running on port ${PORT}`);
});