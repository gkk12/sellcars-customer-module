const User = require('../models/user')

const getAllUsers = async () => {
    try {
        const users = await User.find()
        return users
    }
    catch (err){
        return err
    }
}

const createUser = async (req_body) => {
    try {
        const user = new User({
            first_name: req_body.first_name,
            last_name: req_body.last_name, 
            password_hash: req_body.password_hash,
            email: req_body.email,
            created_at: req_body.created_at,
            updated_at: req_body.updated_at
        })
        const newUser = await user.save()
        return newUser
    }
    catch (err){
        return err
    }
}

const updateUser = async (newData, existingData) => {
    try {
        if (newData.first_name != undefined) {
            existingData.first_name = newData.first_name
        }
        if (newData.last_name != undefined) {
            existingData.last_name = newData.last_name
        }
        if (newData.password_hash != undefined) {
            existingData.password_hash = newData.password_hash
        }
        if (newData.email != undefined) {
            existingData.email = newData.email
        }
        existingData.updated_at = new Date();
    
        const updatedUser = await existingData.save()
        return updatedUser;
    } catch (err) {
        return err;
    }
}

const deleteUser = async(user) => {
    await user.deleteOne()
}

module.exports = {
    getAllUsers,
    createUser,
    deleteUser,
    updateUser
}
