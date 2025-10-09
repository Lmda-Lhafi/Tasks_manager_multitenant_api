const Admin = require("../models/admin.model");
const Client = require("../models/client.model");
const { body, validationResult } = require("express-validator");

// add new admin (admin only)
exports.createAdmin = [
  body("email").isEmail().withMessage("Invalid email"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email } = req.body;
    try {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Admin with this email already exists" });
      }
      const admin = new Admin(req.body);
      await admin.save();
      res.status(201).json(admin);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
];

// get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update admin by id
exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete admin by id
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// create new client (admin only)
exports.createClient = [
  body("email").isEmail().withMessage("Invalid email"),
  body("passwordHash").isLength({ min: 6 }).withMessage("Password too short"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email } = req.body;
    try {
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res
          .status(400)
          .json({ error: "Client with this email already exists" });
      }
      const client = new Client(req.body);
      await client.save();
      res.status(201).json(client);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
];

// get all clients (admin only)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get client by id (admin only)
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update client by id (admin only)
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete client by id (admin only)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

