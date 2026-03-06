require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkSchema() {
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'issue_activity_log' });
    if (error) {
        // Fallback: try to select 1 and see what we get
        const { data: cols, error: err2 } = await supabaseAdmin.from('issue_activity_log').select('*').limit(1);
        if (err2) console.error(err2);
        else console.log("Columns:", Object.keys(cols[0] || {}));
    } else {
        console.log("Columns:", data);
    }
}
checkSchema();
