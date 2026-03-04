// middleware/auth.js
const { supabaseAdmin } = require('../config/db');

/**
 * authenticate
 * Validates the Supabase JWT from the Authorization header.
 * Attaches the decoded user to req.user.
 */
exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
        }

        const token = authHeader.split(' ')[1];

        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        req.user = data.user;
        req.token = token;
        next();
    } catch (err) {
        console.error('authenticate middleware error:', err);
        return res.status(500).json({ error: 'Authentication failed.' });
    }
};