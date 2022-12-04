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
        }).sort( { modify_date: 'desc' } ).skip(req.params.page * 12).limit(12)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/create-new', verifyToken, async (req, res) => {
    const file = new File({
        user_id: req.user._id,
        filename: req.body.filename,
        width: req.body.width,
        height: req.body.height
    })

    try {
        const newFile = await file.save()
        res.status(201).json(newFile)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/load', verifyToken, checkIfOwner, async (req, res) => {
    const file = await File.findById(req.body.file_id)

    const layers = await Layer.find({ file_id: file.id }).sort({index: 'asc'})

    res.status(200).send({ file, layers })
})

router.post('/save', verifyToken, checkIfOwner, async (req, res) => {
    await Layer.deleteMany({
        file_id: req.body.file_id
    })

    req.body.layers.forEach((layer, i) => {
        CreateLayer(req.body.file_id, layer.layer_name, layer.data, i, layer.opacity, layer.locked, layer.visible)
    })

    res.status(200).send({ message: "Save successful" })
})

router.delete('/delete', verifyToken, checkIfOwner, async (req, res) => {
    try {
        await File.deleteOne({
            file_id: req.body.file_id
        })

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