require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkRecentIssues() {
    try {
        console.log("Fetching latest 5 issues...");
        const { data: issues, error } = await supabaseAdmin
            .from('issues')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error("Error fetching issues:", error.message);
            return;
        }

        for (const issue of issues) {
            const { count, data: logs } = await supabaseAdmin
                .from('issue_activity_log')
                .select('id, action, created_at', { count: 'exact' })
                .eq('issue_id', issue.id);
            console.log(`\nISSUE: ${issue.title} (${issue.id}) | Created: ${issue.created_at}`);
            console.log(`LOG COUNT: ${count}`);
            if (logs && logs.length > 0) {
                logs.forEach(l => console.log(`  - [${l.created_at}] Action: ${l.action}`));
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkRecentIssues();
