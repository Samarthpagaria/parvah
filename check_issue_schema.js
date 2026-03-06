require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkIssueSchema() {
    try {
        console.log("Checking issues table schema...");
        const { data, error } = await supabaseAdmin
            .from('issues')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error:", error.message);
        } else if (data.length > 0) {
            console.log("Columns in issues table:", Object.keys(data[0]));
        } else {
            console.log("Table is empty, can't easily check columns without data.");
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkIssueSchema();
