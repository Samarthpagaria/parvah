require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkSchema() {
    try {
        console.log("Checking issue_attachments table...");
        const { data, error } = await supabaseAdmin
            .from('issue_attachments')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error fetching issue_attachments:", error.message);
        } else {
            console.log("Successfully reached issue_attachments table.");
            if (data.length > 0) {
                console.log("First row columns:", Object.keys(data[0]));
            } else {
                console.log("Table is empty.");
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkSchema();
