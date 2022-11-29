require('dotenv').config()

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const { checkDuplicateUsers, verifyToken } = require('../middleware/authHelpers');


router.post('/signup', checkDuplicateUsers, async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })

    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/login', async (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err)
            return res.status(500).send({ message: err })

        if (!user)
            return res.status(401).json({ message: "Invalid password or username" })


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
    res.user.logoutTime = new Date().getTime()
    try {
        const loggedOutUser = await res.user.save()
        res.json(loggedOutUser)
    } catch (err) {
        return res.status(500).send({ message: err.message })
    }

})

router.get("/test", verifyToken, async (req, res) => {
    res.status(200).json({ message: "Token valid", user: req.user })
})

router.get("*", (req, res) => {
    res.status(404)
})

module.exports = router