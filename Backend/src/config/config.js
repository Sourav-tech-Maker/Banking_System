require('dotenv').config();


if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environment variables");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables")
}   
if(!process.env.CLIENT_ID){
    throw new Error("CLIENT_ID is not defined in environment variables")
}   
if(!process.env.CLIENT_SECRET){
    throw new Error("CLIENT_SECRET is not defined in environment variables")
}   
if(!process.env.REFRESH_TOKEN){
    throw new Error("REFRESH_TOKEN is not defined in environment variables")
}   
if(!process.env.EMAIL_USER){
    throw new Error("EMAIL_USER is not defined in environment variables")
}  

if(!process.env.RBAC_REGISTRATION_KEY){
    throw new Error('RBAC_REGISTRATION_KEY is not defined in environment variables')
}

const imageKitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim()

if(!imageKitPrivateKey){
    throw new Error('IMAGEKIT_PRIVATE_KEY is not defined in environment variables')
}

if(!imageKitPrivateKey.startsWith('private_')){
    throw new Error('IMAGEKIT_PRIVATE_KEY must be your ImageKit private key. It should start with private_, not public_.')
}


const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    RBAC_REGISTRATION_KEY:process.env.RBAC_REGISTRATION_KEY,
    IMAGEKIT_PRIVATE_KEY: imageKitPrivateKey,
    IMAGEKIT_KYC_FOLDER: process.env.IMAGEKIT_KYC_FOLDER || "/banking-system/kyc-documents",

}
module.exports = config
