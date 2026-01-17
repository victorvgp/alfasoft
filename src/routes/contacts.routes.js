import { Router } from "express";
import { pool } from "../db/pool.js";
import { upload } from "../middleware/upload.js";
import { validateContact } from "../utils/validateContact.js";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/contacts", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, contact, email, picture_path
      FROM contacts
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/contacts", requireAuth, upload.single("picture"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Image is required",
      });
    }

    const data = {
      name: req.body.name,
      contact: req.body.contact,
      email: req.body.email?.toLowerCase().trim(),
    };

    const errors = validateContact(data);
    if (errors) {
      return res.status(422).json({ errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO contacts (name, contact, email, picture_path)
        VALUES (?, ?, ?, ?)
        `,
      [data.name.trim(), data.contact, data.email, `/uploads/${req.file.filename}`],
    );

    res.status(201).json({
      id: result.insertId,
      ...data,
      picture_path: `/uploads/${req.file.filename}`,
    });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Conflict",
        message: "Email or contact already exists",
      });
    }
    next(e);
  }
});

router.get("/contacts/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, name, contact, email, picture_path
      FROM contacts
      WHERE id = ?
      `,
      [req.params.id],
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "NotFound",
        message: "Contact not found",
      });
    }

    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/contacts/:id", requireAuth, upload.single("picture"), async (req, res, next) => {
  try {
    const contactId = req.params.id;

    const [existingRows] = await pool.query("SELECT picture_path FROM contacts WHERE id = ?", [contactId]);

    if (!existingRows.length) {
      return res.status(404).json({
        error: "NotFound",
        message: "Contact not found",
      });
    }

    const data = {
      name: req.body.name,
      contact: req.body.contact,
      email: req.body.email?.toLowerCase().trim(),
    };

    const errors = validateContact(data, true);
    if (errors) {
      return res.status(422).json({ errors });
    }

    let picturePath = existingRows[0].picture_path;

    if (req.file) {
      const oldPath = path.resolve("public", picturePath.replace("/uploads/", "uploads/"));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      picturePath = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      `
        UPDATE contacts
        SET name = ?, contact = ?, email = ?, picture_path = ?
        WHERE id = ?
        `,
      [data.name.trim(), data.contact, data.email, picturePath, contactId],
    );

    res.json({
      id: Number(contactId),
      ...data,
      picture_path: picturePath,
    });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Conflict",
        message: "Email or contact already exists",
      });
    }
    next(e);
  }
});

router.delete("/contacts/:id", requireAuth, async (req, res, next) => {
  try {
    const contactId = req.params.id;

    const [rows] = await pool.query("SELECT picture_path FROM contacts WHERE id = ?", [contactId]);

    if (!rows.length) {
      return res.status(404).json({
        error: "NotFound",
        message: "Contact not found",
      });
    }

    await pool.query("DELETE FROM contacts WHERE id = ?", [contactId]);

    const filePath = path.resolve("public", rows[0].picture_path.replace("/uploads/", "uploads/"));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// router.get("/dbtest", async (_req, res, next) => {
//   try {
//     const [rows] = await pool.query("SELECT 1 AS ok");
//     return res.json(rows[0]);
//   } catch (e) {
//     return next(e);
//   }
// });

export default router;
