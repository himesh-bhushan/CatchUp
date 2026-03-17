import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer'; 

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
        
        let calculatedBmi = '';
        if (user?.weight && user?.height) {
            const heightInMeters = user.height / 100;
            calculatedBmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
        }

        const formattedConditions = Array.isArray(user?.conditions) ? user.conditions.join(', ') : (user?.conditions || '');
        const formattedMedications = user?.medications || ''; 
        const formattedAllergies = user?.allergies || '';
        
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${user?.first_name || 'CatchUp'}_Health_Report.pdf"`);
        doc.pipe(res);

        const bgColor = '#F4EFE6'; 
        const primaryRed = '#DE4B4E'; 
        const textColor = '#333333';
        const lineColor = '#D8D0C5'; 

        doc.rect(0, 0, doc.page.width, doc.page.height).fill(bgColor);

        doc.moveDown(2);
        doc.fillColor(primaryRed).font('Helvetica-Bold').fontSize(42).text('HEALTH REPORT', { align: 'center', characterSpacing: 2 });
        doc.moveDown(2);

        const drawSectionHeader = (title, yPos) => {
            doc.fillColor(primaryRed).fontSize(10).font('Helvetica-Bold').text(title.toUpperCase(), 50, yPos);
            const textWidth = doc.widthOfString(title.toUpperCase());
            doc.moveTo(50 + textWidth + 10, yPos + 4).lineTo(545, yPos + 4).lineWidth(0.5).strokeColor(primaryRed).stroke();
        };

        const drawFormRow = (label, value, x, y, width, labelWidth = 100) => {
            doc.fillColor(textColor).fontSize(10).font('Helvetica');
            doc.text(label, x, y);
            doc.text(':', x + labelWidth, y);
            const stringValue = value ? String(value).trim() : '';
            const displayText = stringValue.length > 0 ? stringValue : 'Nil';
            doc.text(displayText, x + labelWidth + 15, y);
            doc.moveTo(x + labelWidth + 15, y + 10).lineTo(x + width, y + 10).lineWidth(0.5).strokeColor(lineColor).stroke();
        };

        let currentY = doc.y;
        doc.fillColor(textColor).fontSize(10).font('Helvetica').text('Date:', 50, currentY);
        doc.text(`${new Date().toLocaleDateString()}`, 90, currentY);
        doc.moveDown(2);

        currentY = doc.y;
        drawSectionHeader('PERSONAL INFORMATION', currentY);
        currentY += 25;
        drawFormRow('Full Name', `${user?.first_name || ""} ${user?.last_name || ""}`.trim(), 50, currentY, 495);
        currentY += 25;
        drawFormRow('Date of Birth', user?.dob || '', 50, currentY, 495);
        currentY += 25;
        drawFormRow('Gender', user?.gender || '', 50, currentY, 495);
        currentY += 25;
        drawFormRow('Blood Type', user?.blood_type || '', 50, currentY, 495);

        currentY += 40;
        drawSectionHeader('VITAL SIGNS SUMMARY', currentY);
        currentY += 25;
        drawFormRow('Blood Pressure', user?.blood_pressure || '', 50, currentY, 235, 80);
        drawFormRow('Body Mass Index', calculatedBmi, 310, currentY, 235, 80);
        currentY += 25;
        drawFormRow('Heart Rate', user?.heart_rate ? `${user.heart_rate} bpm` : '', 50, currentY, 235, 80);
        drawFormRow('Weight', user?.weight ? `${user.weight} kg` : '', 310, currentY, 235, 80);
        currentY += 25;
        drawFormRow('Active Calories', user?.calories_burned ? `${user.calories_burned} kcal` : '', 50, currentY, 235, 80);
        drawFormRow('Height', user?.height ? `${user.height} cm` : '', 310, currentY, 235, 80);

        currentY += 40;
        drawSectionHeader('CLINICAL BACKGROUND', currentY);
        currentY += 25;
        drawFormRow('Pre-existing\nCondition', formattedConditions, 50, currentY, 495);
        currentY += 35; 
        drawFormRow('Current\nMedication', formattedMedications, 50, currentY, 495);
        currentY += 35;
        drawFormRow('Allergies', formattedAllergies, 50, currentY, 495);

        const hr = user?.heart_rate || 72; 
        let hrScore = 100;
        if (hr >= 60 && hr <= 80) hrScore = 100;
        else if (hr > 80 && hr <= 100) hrScore = Math.max(0, 100 - (hr - 80) * 2);
        else if (hr > 100) hrScore = Math.max(0, 60 - (hr - 100) * 3);
        else if (hr < 60) hrScore = Math.max(0, 100 - (60 - hr) * 2);

        const sleepHrs = (user?.sleep_seconds || 28800) / 3600; 
        let sleepScore = 100;
        if (sleepHrs >= 7 && sleepHrs <= 9) sleepScore = 100;
        else sleepScore = Math.max(0, 100 - Math.abs(sleepHrs - 8) * 15);

        const activeCals = user?.calories_burned || 0;
        const calScore = Math.min(100, (activeCals / 500) * 100);

        const waterLiters = user?.water_intake || 2.0; 
        const waterScore = Math.min(100, (waterLiters / 2.5) * 100);

        const finalScore = Math.round((hrScore * 0.35) + (sleepScore * 0.25) + (calScore * 0.25) + (waterScore * 0.15));

        currentY += 50;
        drawSectionHeader('AUTOMATED HEALTH SCORE', currentY);
        currentY += 25;
        doc.fillColor(primaryRed).fontSize(24).font('Helvetica-Bold').text(`${finalScore} / 100`, 50, currentY);
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Heart Rate: ${Math.round(hrScore)}/100  |  Sleep: ${Math.round(sleepScore)}/100  |  Activity: ${Math.round(calScore)}/100  |  Hydration: ${Math.round(waterScore)}/100`, 50, currentY + 30);

        doc.end();
    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).send("PDF Error");
    }
});

/* =========================================
   ⌚ PART G: GOOGLE HEALTH SYNC (CONSOLIDATED)
========================================= */
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
        const calories = Math.round(steps * 0.04); 
        const distance = parseFloat((steps * 0.0008).toFixed(2));

        await supabase.from('profiles').update({ steps }).eq('id', uid);
        await supabase.from('activity_logs').upsert({
            user_id: uid, date: todayStr, steps: steps, calories: calories, distance: distance
        }, { onConflict: 'user_id,date' });

        res.json({ success: true, steps, calories });
    } catch (error) {
        console.error("Google Sync Error:", error.message);
        res.status(500).json({ error: "Sync failed" });
    }
});

/* =========================================
   📧 EMAIL APPLE HEALTH SHORTCUT (RESEND)
========================================= */
app.post('/api/send-tracker-email', async (req, res) => {
    try {
        const { email, userId, firstName } = req.body;

        if (!email || !userId) {
            return res.status(400).json({ error: "Missing email or user ID" });
        }

        // 🌟 Transporter is now correctly inside the function
        const transporter = nodemailer.createTransport({
            host: 'smtp.resend.com',
            secure: true,
            port: 465,
            auth: {
                user: 'resend', 
                pass: process.env.RESEND_API_KEY, 
            },
        });

        const mailOptions = {
            from: `"CatchUp Health" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Setup your CatchUp Apple Health Tracker 🍎',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h2 style="color: #111;">Hi ${firstName || 'there'},</h2>
                    <p>Sync your daily activity rings with CatchUp by following these two steps:</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <span style="display: block; color: #666; font-size: 12px; margin-bottom: 5px;">YOUR USER ID</span>
                        <strong style="font-family: monospace; font-size: 20px; letter-spacing: 2px;">${userId}</strong>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.icloud.com/shortcuts/525c6fb259844e4eb3e838d4553f77ca" 
                           style="background-color: #DE4B4E; color: white; padding: 16px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                           Install Apple Shortcut
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #888;">Stay healthy,<br/>The CatchUp Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent via Resend" });
    } catch (error) {
        console.error("Resend Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

/* =========================================
   ⌚ APPLE SHORTCUTS SYNC (RECEIVER)
========================================= */
app.post('/api/wearables/manual-sync/:uid', async (req, res) => {
    try {
        const cleanUid = req.params.uid.trim(); 
        const { steps, calories, water_liters, sleep_hours, bp_systolic, bp_diastolic, heart_rate } = req.body; 
        const todayStr = new Date().toISOString().split('T')[0]; 
        const now = new Date().toISOString(); 
        const roundedSteps = Math.round(steps || 0);
        const roundedCalories = Math.round(calories || (roundedSteps * 0.04));
        const distance = parseFloat((roundedSteps * 0.0008).toFixed(2));
        const sleepSeconds = sleep_hours ? Math.round(sleep_hours) : null;
        const bloodPressure = (bp_systolic && bp_diastolic) ? `${Math.round(bp_systolic)}/${Math.round(bp_diastolic)}` : null;

        const profileUpdates = { last_synced_at: now, steps: roundedSteps, calories_burned: roundedCalories };
        if (water_liters) profileUpdates.water_intake = water_liters;
        if (sleepSeconds) profileUpdates.sleep_seconds = sleepSeconds;
        if (bloodPressure) profileUpdates.blood_pressure = bloodPressure;
        if (heart_rate) profileUpdates.heart_rate = heart_rate;

        await supabase.from('profiles').update(profileUpdates).eq('id', cleanUid);
        await supabase.from('activity_logs').upsert({
            user_id: cleanUid, date: todayStr, steps: roundedSteps, calories: roundedCalories, distance: distance
        }, { onConflict: 'user_id,date' });

        if (sleep_hours) {
            await supabase.from('sleep_logs').upsert({
                user_id: cleanUid, date: todayStr, hours: parseFloat(sleep_hours) / 3600, seconds: Math.round(sleep_hours) 
            }, { onConflict: 'user_id,date' });
        }

        if (bp_systolic && bp_diastolic) {
            await supabase.from('blood_pressure_logs').upsert({
                user_id: cleanUid, date: todayStr, systolic: Math.round(bp_systolic), diastolic: Math.round(bp_diastolic)
            }, { onConflict: 'user_id,date' });
        }

        res.json({ success: true, message: "Sync successful!" });
    } catch (error) {
        console.error("Manual Sync Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CatchUp Server running on port ${PORT}`);
});