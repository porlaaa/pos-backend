const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const ACCESS_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24;
const VALID_USER_ROLES = ["Waiter", "Cashier", "Admin"];

const getAccessTokenCookieOptions = (req) => {
    const host = req.headers.host || "";
    const forwardedProto = req.headers["x-forwarded-proto"];
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const isSecureRequest = config.nodeEnv === "production" || forwardedProto === "https" || req.secure || !isLocalhost;

    return {
        httpOnly: true,
        sameSite: isSecureRequest ? "none" : "lax",
        secure: isSecureRequest,
        path: "/",
    };
};

const clearAccessTokenCookie = (req, res) => {
    const cookieOptions = getAccessTokenCookieOptions(req);

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("accessToken", {
        ...cookieOptions,
        sameSite: cookieOptions.sameSite === "none" ? "lax" : "none",
        secure: !cookieOptions.secure,
    });
};

const register = async (req, res, next) => {
    try {

        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        if(!VALID_USER_ROLES.includes(role)){
            const error = createHttpError(400, "Invalid role!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }


        const user = { name, phone, email, password, role };
        const newUser = User(user);
        await newUser.save();

        const createdUser = newUser.toObject();
        delete createdUser.password;

        res.status(201).json({success: true, message: "New user created!", data: createdUser});


    } catch (error) {
        next(error);
    }
}


const login = async (req, res, next) => {

    try {
        
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        res.cookie('accessToken', accessToken, {
            ...getAccessTokenCookieOptions(req),
            maxAge: ACCESS_TOKEN_MAX_AGE
        })

        const loggedInUser = isUserPresent.toObject();
        delete loggedInUser.password;

        res.status(200).json({
            success: true,
            message: "User login successfully!",
            data: loggedInUser
        });


    } catch (error) {
        next(error);
    }

}

const getUserData = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        
        clearAccessTokenCookie(req, res);

        res.status(200).json({
            success: true,
            message: "User logout successfully!"
        });

    } catch (error) {
        next(error);
    }
}




module.exports = { register, login, getUserData, logout }