
require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const signToken = (inviteId, rawToken) => {
    return crypto
        .createHmac("sha256", process.env.INVITE_TOKEN_SECRET)
        .update(`${inviteId}.${rawToken}`)
        .digest("hex");
};

async function test() {
    const org_id = '778ed23b-fb7e-472f-9c84-c0804ce82a44';
    const invitee_email = 'test-' + Date.now() + '@example.com';
    const role = 'staff';
    const userId = 'f3a50853-ada1-41f3-97b7-55c256361f1f'; // The admin user ID we found earlier

    try {
        const rawToken = crypto.randomUUID();
        const tokenHash = await bcrypt.hash(rawToken, 10);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        console.log('Inserting invitation...');
        const { data: invitation, error } = await supabaseAdmin
            .from("admin_invitations")
            .insert({
                org_id,
                invited_by: userId,
                invitee_email,
                role,
                token: tokenHash,
                status: "pending",
                expires_at: expiresAt,
            })
            .select()
            .single();

        if (error) {
            console.error("DB_ERROR:", error);
            return;
        }

        console.log('Success:', invitation);
        const signature = signToken(invitation.id, rawToken);
        console.log('Signed Token:', `${invitation.id}.${rawToken}.${signature}`);
    } catch (err) {
        console.error("FATAL ERROR:", err);
    }
}

test();
