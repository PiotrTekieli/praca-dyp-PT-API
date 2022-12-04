require('dotenv').config()

const NO_EMAIL_CONFIRM = true
const HOST = "http://localhost:3000"

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})

const { checkDuplicateUsers, verifyToken } = require('../middleware/authHelpers')


router.post('/signup', checkDuplicateUsers, async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })

    if (!NO_EMAIL_CONFIRM) {
        const emailConfirmToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        })

        transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: req.body.email,
            subject: "Please confirm your account",
            html: `<h1>Email Confirmation for Drawing App</h1>
                <h2>Hello!</h2>
                <p>Thank you for creating your account! To complete the process please confirm your email by clicking on the following link:</p>
                <a href=${HOST}/auth/confirm?key=${emailConfirmToken}>Click here!</a>
                </div>`,
        }).catch(err => console.log(err));
    }
    else
        user.active = true

    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.get('/confirm', async (req, res) => {
    if (!req.query.key)
        return res.status(400).send({ message: "Incorrect key" })


    jwt.verify(req.query.key, process.env.JWT_SECRET, async (err, decoded) => {
        if (err)
            return res.status(500).send({ message: err.message })

        const user = await User.findById(decoded.id)

        if (!user)
            return res.status(500).send({ message: "User was not found" })

        if (user.active)
            return res.status(400).send({ message: "Email was already confirmed" })

        const checkDuplicate = await User.findOne({
            email: user.email,
            active: true
        })

        if (checkDuplicate)
            return res.status(400).send({ message: "Email is already in use" })


        try {
            user.active = true
            user.save()
            return res.status(200).send({ message: "Email confirmed" })
        } catch (err) {
            return res.status(500).send({ message: err.message })
        }

    })
})

router.post('/login', async (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err)
            return res.status(500).send({ message: err.message })

        if (!user)
            return res.status(401).json({ message: "Invalid password or username" })

        if (!user.active)
            return res.status(401).json({ message: "Account has not been activated" })


        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        )

        if (!passwordIsValid)
            return res.status(401).send({ message: "Invalid password or username" })


        var token = jwt.sign({ id: user.id, logoutTime: user.logoutTime }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        res.status(200).json({ message: "Login successful", token: token })
    })
})

router.post('/logout', verifyToken, async (req, res) => {
    req.user.logoutTime = new Date().getTime()
    try {
        const loggedOutUser = await req.user.save()
        return res.status(200).send({ message: "Logged out successfully" })
    } catch (err) {
        return res.status(500).send({ message: err.message })
    }

})

router.get("/test", verifyToken, async (req, res) => {
    res.status(200).json({ message: "Token valid", user: req.user })
})

module.exports = router