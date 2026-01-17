import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";

import "dotenv/config";
import { createApp } from "../src/app.js";
import { pool } from "../src/db/pool.js";

const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3f2WQAAAAASUVORK5CYII=";

function imageBuffer() {
  return Buffer.from(tinyPngBase64, "base64");
}

const app = createApp();

describe("Contacts validation (functional)", () => {
  const created = [];

  afterAll(async () => {
    for (const item of created) {
      try {
        const [rows] = await pool.query("SELECT picture_path FROM contacts WHERE id = ?", [item.id]);
        if (rows.length) {
          const pic = rows[0].picture_path;
          const filePath = path.resolve("public", pic.replace("/uploads/", "uploads/"));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await pool.query("DELETE FROM contacts WHERE id = ?", [item.id]);
      } catch (_) {}
    }
    await pool.end();
  });

  it("POST /api/contacts should fail when image is missing", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", "912345678")
      .field("email", `victor${Date.now()}@test.com`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("POST /api/contacts should fail when name is too short", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .field("name", "Abcde")
      .field("contact", "912345678")
      .field("email", `victor${Date.now()}@test.com`)
      .attach("picture", imageBuffer(), { filename: "pic.png", contentType: "image/png" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveProperty("name");
  });

  it("POST /api/contacts should fail when contact is not 9 digits", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", "91234")
      .field("email", `victor${Date.now()}@test.com`)
      .attach("picture", imageBuffer(), { filename: "pic.png", contentType: "image/png" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveProperty("contact");
  });

  it("POST /api/contacts should fail when email is invalid", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", "912345678")
      .field("email", "invalid-email")
      .attach("picture", imageBuffer(), { filename: "pic.png", contentType: "image/png" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveProperty("email");
  });

  it("POST /api/contacts should return 409 when email is duplicated", async () => {
    const stamp = Date.now();
    const email = `dup${stamp}@test.com`;

    const first = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", String(900000000 + (stamp % 99999999)).slice(0, 9))
      .field("email", email)
      .attach("picture", imageBuffer(), { filename: "pic.png", contentType: "image/png" });

    expect(first.status).toBe(201);
    created.push({ id: first.body.id });

    const second = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", String(910000000 + (stamp % 99999999)).slice(0, 9))
      .field("email", email)
      .attach("picture", imageBuffer(), { filename: "pic2.png", contentType: "image/png" });

    expect(second.status).toBe(409);
  });

  it("PUT /api/contacts/:id should fail with validation errors (no image required)", async () => {
    const stamp = Date.now();
    const create = await request(app)
      .post("/api/contacts")
      .field("name", "Victor Pimentel")
      .field("contact", String(920000000 + (stamp % 99999999)).slice(0, 9))
      .field("email", `put${stamp}@test.com`)
      .attach("picture", imageBuffer(), { filename: "pic.png", contentType: "image/png" });

    expect(create.status).toBe(201);
    const id = create.body.id;
    created.push({ id });

    const upd = await request(app).put(`/api/contacts/${id}`).send({
      name: "Abcde",
      contact: "123",
      email: "bad-email",
    });

    expect(upd.status).toBe(422);
    expect(upd.body).toHaveProperty("errors");
    expect(upd.body.errors).toHaveProperty("name");
    expect(upd.body.errors).toHaveProperty("contact");
    expect(upd.body.errors).toHaveProperty("email");
  });
});
