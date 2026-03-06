require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkBuckets() {
    try {
        console.log("Checking storage buckets...");
        const { data, error } = await supabaseAdmin.storage.listBuckets();

        if (error) {
            console.error("Error listing buckets:", error.message);
        } else {
            console.log("Buckets:", data.map(b => b.name));
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkBuckets();
