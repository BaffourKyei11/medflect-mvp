import jwt from 'jsonwebtoken';
export const requireAuth = (req, res, next) => {
    try {
        const header = req.headers['authorization'] || req.headers['Authorization'];
        if (!header || Array.isArray(header))
            return res.status(401).json({ error: 'Missing Authorization header' });
        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token)
            return res.status(401).json({ error: 'Invalid Authorization header' });
        const secret = process.env.JWT_SECRET || 'dev';
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};
