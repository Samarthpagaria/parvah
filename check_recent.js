require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkRecent() {
    try {
        const now = new Date();
        const tenMinsAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

        console.log("Checking for issues created in the last 20 minutes...");
        const { data: issues, error: issueErr } = await supabaseAdmin
            .from('issues')
            .select('id, title, created_at')
            .gt('created_at', tenMinsAgo);

        if (issueErr) console.error("Issue fetch error:", issueErr.message);
        else console.log("Recent issues found:", issues.length, issues);

        console.log("Checking for attachments created in the last 20 minutes...");
        const { data: attachments, error: attachErr } = await supabaseAdmin
            .from('issue_attachments')
            .select('id, issue_id, file_name, created_at')
            .gt('created_at', tenMinsAgo);

        if (attachErr) console.error("Attachment fetch error:", attachErr.message);
        else console.log("Recent attachments found:", attachments.length, attachments);

    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkRecent();
