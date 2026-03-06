require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkAttachments() {
    try {
        console.log("Checking for ANY rows in issue_attachments...");
        const { data, error, count } = await supabaseAdmin
            .from('issue_attachments')
            .select('*', { count: 'exact' });

        if (error) {
            console.error("Error:", error.message);
        } else {
            console.log("Total rows in issue_attachments:", count);
            console.log("Rows:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkAttachments();
