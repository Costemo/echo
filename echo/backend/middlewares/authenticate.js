const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token has expired.');
        }
        res.status(401).send('Invalid token.');
    }
};

module.exports = authenticate;
