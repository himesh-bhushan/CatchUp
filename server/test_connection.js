import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPEN_WEARABLES_API_KEY;
const URL = "http://127.0.0.1:8000"; 

console.log("\n🔑 TESTING API CONNECTION (FINAL ATTEMPT)...");
console.log(`👉 Key Check: ${API_KEY ? API_KEY.substring(0, 10) + "..." : "MISSING"}`);

async function testMethod(name, path, headers) {
    try {
        console.log(`Testing: ${name} -> ${path}`);
        const res = await axios.post(`${URL}${path}`, 
            { name: "Test User", external_user_id: "test_uid_999" }, 
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    ...headers 
                }, 
                timeout: 5000 
            }
        );
        console.log(`✅ SUCCESS! User created. ID: ${res.data.id || "OK"}`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.response?.status || err.message} - ${JSON.stringify(err.response?.data || {})}`);
        return false;
    }
}

(async () => {
    // Attempt 3: The Documentation Fix
    // Using the header from your screenshot: 'X-Open-Wearables-API-Key'
    console.log("--- Attempt 3: The Documentation Fix ---");
    
    await testMethod("Correct Header", "/api/v1/users/", { 
        'X-Open-Wearables-API-Key': API_KEY 
    });

})();