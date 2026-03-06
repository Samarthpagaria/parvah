require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function check() {
    const { data } = await supabaseAdmin.from('notifications').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("NOTIFICATION COLUMNS:", Object.keys(data[0]));
    } else {
        console.log("NO NOTIFICATIONS FOUND");
    }
}
check();
