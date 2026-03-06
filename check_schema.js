require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkColumns() {
    try {
        console.log("Checking columns of issue_attachments...");
        const { data, error } = await supabaseAdmin
            .from('issue_attachments')
            .select('*')
            .limit(0); // get 0 rows but hopefully it gives info or I can try a dummy insert that fails with more info

        if (error) {
            console.error("Error:", error.message);
        } else {
            // How to get columns if table is empty?
            // Try to insert a row with invalid data to see column names in error if possible
            const { error: insertError } = await supabaseAdmin
                .from('issue_attachments')
                .insert({ dummy: 'column' });

            console.log("Insert error (to see schema info):", insertError?.message);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkColumns();
