require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkIssues() {
    try {
        console.log("Checking issues table...");
        const { data, error } = await supabaseAdmin
            .from('issues')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error("Error fetching issues:", error.message);
        } else {
            console.log("Recent issues:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkIssues();
