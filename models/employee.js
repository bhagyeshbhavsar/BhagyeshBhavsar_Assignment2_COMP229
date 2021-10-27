const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    ContactName: {
        type: String,
        required: true,
        trim: true
    },
    ContactNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    }
});
//Create and instantiate model with schema
const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;