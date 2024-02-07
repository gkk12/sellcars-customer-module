const User = require('../models/user')
const userService = require('../services/userService')
const bcrypt = require('bcrypt')

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers()
        res.json(users)
    }
    catch (err){
        res.status(500).json({message: err.message})
    }
}

const getOneUserById = async (req, res) => {
    res.json(res.user)
}

const createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body)
        res.status(201).json(newUser)
    }
    catch (err) {
        res.status(400).json({message: err.message})
    }
}

const loginUser = async (req, res) => {
    try {
        const {username,password} = req.body
        const user = await User.findOne({ email: username })
        if (!user) {;
            res.send({message:"wrong username"})
            return
        }

        const isMatch = await bcrypt.compare(password, user.password_hash)
        if (!isMatch) {
            res.send({message: "wrong password"})
            return
        }
        res.status(201).json({status: "logged in", user: user.email })
    }
    catch (err) {
        res.status(400).json({message: err.message})
    }
}

const updateUser = async (req, res) => {
    try {
        const newData = req.body
        const existingData = res.user
        const updatedUser = await userService.updateUser(newData, existingData);
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
}

const deleteUser = async (req,res)=>{
    try {
        await userService.deleteUser(res.user);
        res.json({ message: 'Deleted User'})
    }
    catch (err) {
        res.status(500).json({message: err.message})
    }
}

module.exports = {getAllUsers, getOneUserById, createUser, deleteUser, updateUser,loginUser}