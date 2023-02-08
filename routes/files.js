require('dotenv').config()

const express = require('express')
const router = express.Router()
const File = require('../models/file')
const Layer = require('../models/layer')

const { verifyToken } = require('../middleware/authHelpers')
const { checkIfOwner } = require('../middleware/fileHelpers')
const { default: mongoose } = require('mongoose')


router.get('/:page?', verifyToken, async (req, res) => {
    try {
        const result = await File.find({
            user_id: req.user._id
        }).sort( { modify_date: 'desc' } ).skip(req.params.page * 8).limit(8)

        const count = await File.find({
            user_id: req.user._id
        }).count()

        res.status(200).json({ files: result, count: count})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/create-new', verifyToken, async (req, res) => {
    if (req.body.width < 1 || req.body.width > 2000 || req.body.height < 1 || req.body.height > 2000) {
        res.status(400).json({ message: "Unsupported file size" })
        return
    }


    const file = new File({
        user_id: req.user._id,
        filename: req.body.filename,
        width: req.body.width,
        height: req.body.height,
        modify_date: Date.now()
    })

    try {
        const newFile = await file.save()
        res.status(201).json(newFile)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/load', verifyToken, checkIfOwner, async (req, res) => {
    const layers = await Layer.find({ file_id: req.file.id }).sort({index: 'asc'})

    res.status(200).send({ file: req.file, layers })
})

router.post('/save', verifyToken, checkIfOwner, async (req, res) => {
    if (!req.body.layers)
        return res.status(400).send({ message: "Bad request" })

    let exit = false
    req.body.layers.forEach((layer, i) => {
        if (layer.layer_name == null || !layer.data || layer.opacity == null || !layer.locked == null || layer.visible == null) {
            exit = true
            return res.status(400).send({ message: "Bad request" })
        }
    })
    if (exit)
        return

    await Layer.deleteMany({
        file_id: req.body.file_id
    })

    req.body.layers.forEach((layer, i) => {
        CreateLayer(req.body.file_id, layer.layer_name, layer.data, i, layer.opacity, layer.locked, layer.visible)
    })
    req.file.modify_date = Date.now()
    req.file.thumbnail_data = req.body.thumbnail_data
    req.file.save()
    res.status(200).send({ message: "Save successful" })
})

router.post('/rename', verifyToken, checkIfOwner, async (req, res) => {
    if (!req.body.filename)
        res.status(400).send({ message: "Bad request" })

    try {
        req.file.filename = req.body.filename
        req.file.save()
        res.status(200).send({ message: "Rename successful" })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/delete', verifyToken, checkIfOwner, async (req, res) => {
    try {
        await req.file.remove()

        await Layer.deleteMany({
            file_id: req.body.file_id
        })

        res.status(200).send({ message: "File removed" })
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

module.exports = router

async function CreateLayer(id, name, data, index, opacity, locked, visible) {
    const layer = new Layer({
        file_id: mongoose.Types.ObjectId(id),
        layer_name: name,
        data: data,
        index: index,
        opacity: opacity,
        locked: locked,
        visible: visible
    })
    return await layer.save()
}