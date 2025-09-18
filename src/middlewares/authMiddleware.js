import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Access token required',
                message: 'Authorization header is missing'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Invalid token format',
                message: 'Token must be in Bearer format'
            });
        }

        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                error: 'Access token required',
                message: 'Token is missing'
            });
        }

        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId
        };

        req.tenantId = decoded.tenantId;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Token is malformed or invalid'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to verify token'
        });
    }
};

export const requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User not authenticated'
            });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};