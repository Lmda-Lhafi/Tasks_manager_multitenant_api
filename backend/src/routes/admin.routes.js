const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/admin.controller");

// Admin CRUD
// @route   POST /api/admins
// @desc    Create a new admin
// @access  Private
router.post("/admins", createAdmin);

// @route   GET /api/admins
// @desc    Get all admins
// @access  Private
router.get("/admins", getAdmins);

// @route   PUT /api/admins/:id
// @desc    Update admin by ID
// @access  Private
router.put("/admins/:id", updateAdmin);

// @route   DELETE /api/admins/:id
// @desc    Delete admin by ID
// @access  Private
router.delete("/admins/:id", deleteAdmin);

// Client CRUD (admin only)
// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/clients', createClient);

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/clients', getClients);

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/clients/:id', getClientById);

// @route   PUT /api/clients/:id
// @desc    Update client by ID
// @access  Private
router.put('/clients/:id', updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client by ID
// @access  Private
router.delete('/clients/:id', deleteClient);

module.exports = router;
