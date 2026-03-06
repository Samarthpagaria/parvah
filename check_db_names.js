require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkSchema() {
    try {
        console.log("Checking issue_attachment (singular) table...");
        const { data, error } = await supabaseAdmin
            .from('issue_attachment')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error fetching issue_attachment:", error.message);
        } else {
            console.log("Successfully reached issue_attachment table.");
        }

        console.log("Checking issue_attachments (plural) table...");
        const { data: dataPlural, error: errorPlural } = await supabaseAdmin
            .from('issue_attachments')
            .select('*')
            .limit(1);

        if (errorPlural) {
            console.error("Error fetching issue_attachments:", errorPlural.message);
        } else {
            console.log("Successfully reached issue_attachments table.");
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkSchema();
