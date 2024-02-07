const express = require('express')
const router = express.Router()
const Customer = require('../models/customer')
const Address = require('../models/address')
const ContactPerson = require('../models/contactPerson')
const ObjectId = require('mongodb').ObjectId
const mongoose = require('mongoose')

// Getting all
router.get('/',async (req,res)=>{
    try {
        const customers = await Customer.find()
        res.json(customers)
    }
    catch (err){
        res.status(500).json({message: err.message})
    }
})

// Creating customers
router.post('/customers', getCustomersByIntr, async (req, res) => {
    try {
        const customerExistenceMap = res.customerExistenceMap
        const savedCustomers = []
        const { customers } = req.body
        let customersExisting = []

        for (const customerData of customers) {
            const existingCustomer = customerExistenceMap[customerData.intnr]

            if (existingCustomer && existingCustomer.customerExists) {
                customersExisting.push(existingCustomer)
                continue
            }

            const contactPersons = customerData.contact_persons
            const addresses = customerData.addresses

            const savedAddresses = []

            for (const address of addresses) {
                const newAddress = new Address({
                    company_name: address.company_name,
                    country: address.country,
                    city: address.city,
                    zip: address.zip,
                    fax: address.fax,
                    phone: address.phone,
                    street: address.street,
                    email: address.email
                })

                const addressSaved = await newAddress.save()
                savedAddresses.push(addressSaved._id)
            }

            const savedContactPersons = []

            for (let i = 0; i < contactPersons.length; i++) {
                const newContactPerson = new ContactPerson({
                    first_name: contactPersons[i].first_name,
                    last_name: contactPersons[i].last_name,
                    email: contactPersons[i].email,
                    mobile_phone: contactPersons[i].mobile_phone,
                    birth_date: contactPersons[i].birth_date,
                    address: savedAddresses[i] 
                })

                const contactPersonSaved = await newContactPerson.save()
                savedContactPersons.push(contactPersonSaved._id)
            }

            const customer = new Customer({
                intnr: customerData.intnr,
                type: customerData.type,
                contact_persons: savedContactPersons,
                addresses: savedAddresses,
            })

            const newCustomer = await customer.save()
            savedCustomers.push(newCustomer)
        }

        res.status(201).json({customersSaved : savedCustomers, existingCustomers : customersExisting})
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Creating contact persons
router.post('/contactPersons', getCustomersByIntrForContactPersons, async (req, res) => {
    try {
        const customerExistenceMap = res.customerExistenceMap
        const nonCustomerExistenceMap = res.nonExistingCustomerIntnrs
        const { contactPersons } = req.body
        const savedCustomers = []
        const customersNotExisting = []

        for (const contactPersonData of contactPersons) {
            const intnr = contactPersonData.intnr
            const currentCustomer = customerExistenceMap[intnr]

            if (currentCustomer && currentCustomer.customerExists) {
                const address = contactPersonData.address

                
                    const newAddress = new Address({
                        company_name: address.company_name,
                        country: address.country,
                        city: address.city,
                        zip: address.zip,
                        fax: address.fax,
                        phone: address.phone,
                        street: address.street,
                        email: address.email
                    })

                    const addressSaved = await newAddress.save()
                    
                const contactPerson = contactPersonData.contact_person
                const newContactPerson = new ContactPerson({
                    first_name: contactPerson.first_name,
                    last_name: contactPerson.last_name,
                    email: contactPerson.email,
                    mobile_phone: contactPerson.mobile_phone,
                    birth_date: contactPerson.birth_date,
                    address: addressSaved._id
                })

                const contactPersonSaved = await newContactPerson.save()

                currentCustomer.customer.contact_persons.push(contactPersonSaved._id)
                currentCustomer.customer.addresses.push(addressSaved._id)

                const updatedCustomer = await currentCustomer.customer.save()
                savedCustomers.push(updatedCustomer)
            }
            else {
                customersNotExisting.push(currentCustomer)
                continue
            }
        }

        res.status(201).json({ customersSaved: savedCustomers, notExistingCustomers: nonCustomerExistenceMap })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/addresses', getCustomersByIntrForAddresses, async (req, res) => {
    try {
        const customerExistenceMap = res.customerExistenceMap
        const nonCustomerExistenceMap = res.nonExistingCustomerIntnrs
        const { addresses } = req.body
        const savedCustomers = []
        const customersNotExisting = []

        for (const address of addresses) {
            const intnr = address.intnr
            const currentCustomer = customerExistenceMap[intnr]

            if (currentCustomer && currentCustomer.customerExists) {

                    const newAddress = new Address({
                        company_name: address.address.company_name,
                        country: address.address.country,
                        city: address.address.city,
                        zip: address.address.zip,
                        fax: address.address.fax,
                        phone: address.address.phone,
                        street: address.address.street,
                        email: address.address.email
                    })

                const addressSaved = await newAddress.save()
                currentCustomer.customer.addresses.push(addressSaved._id)

                const updatedCustomer = await currentCustomer.customer.save()
                savedCustomers.push(updatedCustomer)
            }
            else {
                customersNotExisting.push(currentCustomer)
                continue
            }
        }

        res.status(201).json({ customersSaved: savedCustomers, notExistingCustomers: nonCustomerExistenceMap })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

async function getCustomersByIntr(req, res, next) {
    try {
        const { customers } = req.body
        const existingCustomers = await Customer.find({ intnr: { $in: customers.map(customer => customer.intnr) } })

        const customerExistenceMap = {}
        existingCustomers.forEach(existingCustomer => {
            customerExistenceMap[existingCustomer.intnr] = {
                customerExists: true,
                customer: existingCustomer,
            }
        })

        res.customerExistenceMap = customerExistenceMap
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function getCustomersByIntrForContactPersons(req, res, next) {
    try {
        const { contactPersons } = req.body

        const uniqueIntnrs = Array.from(new Set(contactPersons.map(contactPerson => contactPerson.intnr)))

        const existingCustomers = await Customer.find({ intnr: { $in: uniqueIntnrs } })

        const customerExistenceMap = {}

        existingCustomers.forEach(existingCustomer => {
            const intnr = existingCustomer.intnr

            customerExistenceMap[intnr] = {
                customerExists: true,
                customer: existingCustomer,
            }
        })

        const nonExistingCustomers = uniqueIntnrs.filter(intnr => !customerExistenceMap[intnr])

        nonExistingCustomers.forEach(intnr => {
            customerExistenceMap[intnr] = {
                customerExists: false,
                customer: null,
            }
        })

        res.customerExistenceMap = customerExistenceMap
        res.nonExistingCustomerIntnrs = nonExistingCustomers
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function getCustomersByIntrForAddresses(req, res, next) {
    try {
        const { addresses } = req.body

        const uniqueIntnrs = Array.from(new Set(addresses.map(address => address.intnr)))

        const existingCustomers = await Customer.find({ intnr: { $in: uniqueIntnrs } })

        const customerExistenceMap = {}

        existingCustomers.forEach(existingCustomer => {
            const intnr = existingCustomer.intnr

            customerExistenceMap[intnr] = {
                customerExists: true,
                customer: existingCustomer,
            }
        })

        const nonExistingCustomers = uniqueIntnrs.filter(intnr => !customerExistenceMap[intnr])

        nonExistingCustomers.forEach(intnr => {
            customerExistenceMap[intnr] = {
                customerExists: false,
                customer: null,
            }
        })

        res.customerExistenceMap = customerExistenceMap
        res.nonExistingCustomerIntnrs = nonExistingCustomers
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// Updating a customer
router.put('/:_id', async (req, res) => {
    try{
    const idToEdit = req.params._id
    const objectIdToEdit = new mongoose.Types.ObjectId(idToEdit)
    const customerToEdit = await Customer.findOne({ _id: objectIdToEdit })
    if (!customerToEdit) {
        return res.status(404).json({ message: 'Customer not found' })
    }
    
    if (req.body.intnr != undefined) {
        customerToEdit.intnr = req.body.intnr
    }
    const contactPersonToUpdate = req.body.contact_person
    const addressToUpdate = req.body.address

    const foundContactPerson = await ContactPerson.findOne({_id: contactPersonToUpdate._id})
    if (contactPersonToUpdate.first_name != undefined) {
        foundContactPerson.first_name = contactPersonToUpdate.first_name
    }
    if (contactPersonToUpdate.last_name != undefined) {
        foundContactPerson.last_name = contactPersonToUpdate.last_name
    }
    
    await foundContactPerson.save()
    
    const foundAddress = await Address.findOne({_id: addressToUpdate._id})
    if (addressToUpdate.company_name != undefined) {
        foundAddress.company_name = addressToUpdate.company_name
    }
    if (addressToUpdate.country != undefined) {
        foundAddress.country = addressToUpdate.country
    }
    if (addressToUpdate.city != undefined) {
        foundAddress.city = addressToUpdate.city
    }
    if (addressToUpdate.zip != undefined) {
        foundAddress.zip = addressToUpdate.zip
    }
    if (addressToUpdate.street != undefined) {
        foundAddress.street = addressToUpdate.street
    }
    await foundAddress.save()

    customerToEdit.updated_at = new Date()
    const editedCustomer = await customerToEdit.save()
    res.json({ message: 'Updated Customer', customer: editedCustomer})

    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

// Deleting one
router.delete('/:intnr', async (req,res)=>{
    try {
        const intnrToDelete = req.params.intnr
        const customerToDelete = await Customer.findOne({ intnr: intnrToDelete })
        if (!customerToDelete) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        for (const address of customerToDelete.addresses) {
            await Address.deleteOne({ _id: address._id })
        }

        for (const contactPerson of customerToDelete.contact_persons) {
            await ContactPerson.deleteOne({ _id: contactPerson._id })
        }

        const deletedCustomer = await customerToDelete.deleteOne()
        res.json({ message: 'Deleted Customer', customer: deletedCustomer})
    }
    catch (err) {
        res.status(500).json({message: err.message})
    }

})

module.exports = router