import jwt from 'jsonwebtoken'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_SECRET = process.env.JWT_SECRET || 'MY_JWT_SCERET';



export const createToken=(payload)=>{
    return jwt.sign(payload , JWT_SECRET , {expiresIn :JWT_EXPIRES_IN})
}

export const verifyToken=(token)=>{
    return jwt.verify(token, JWT_SECRET)
}