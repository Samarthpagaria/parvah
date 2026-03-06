require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkActivityLogs() {
    try {
        console.log("Fetching latest 10 activity logs...");
        const { data, error } = await supabaseAdmin
            .from('issue_activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Error fetching logs:", error.message);
        } else {
            console.log("Recent activity logs count:", data.length);
            data.forEach((log, i) => {
                console.log(`[${i}] Issue ID: ${log.issue_id} | Action: ${log.action} | Actor: ${log.actor_type} | Created At: ${log.created_at}`);
                console.log(`    New Value: ${JSON.stringify(log.new_value)}`);
            });
        }

        console.log("\nChecking for issues without any logs...");
        const { data: issues } = await supabaseAdmin.from('issues').select('id, title').limit(5);
        for (const issue of issues) {
            const { count } = await supabaseAdmin
                .from('issue_activity_log')
                .select('*', { count: 'exact', head: true })
                .eq('issue_id', issue.id);
            console.log(`Issue: ${issue.title} (${issue.id}) | Log Count: ${count}`);
        }

    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkActivityLogs();
