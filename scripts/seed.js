/**
 * Run with: npm run seed   (also runs automatically before `npm run build`)
 * Creates the Super Admin (PIN 12345 by default) if none exists, and cleans
 * up the old email/password index so PIN-only accounts can be created.
 */
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const pinKeyOf = (pin) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET || "dev-secret").update(String(pin)).digest("hex");

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local first.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection("users");

  // Old versions had a unique email index; PIN-only accounts have no email.
  try { await users.dropIndex("email_1"); console.log("Dropped legacy email index."); } catch { /* not present */ }
  // Accountant / Principal roles no longer exist.
  const removed = await users.deleteMany({ role: { $in: ["accountant", "principal"] } });
  if (removed.deletedCount) console.log(`Removed ${removed.deletedCount} old accountant/principal account(s).`);

  const pin = process.env.SEED_ADMIN_PIN || "12345";
  const key = pinKeyOf(pin);
  const admin = await users.findOne({ role: { $in: ["superadmin", "admin"] } });

  if (!admin) {
    await users.insertOne({
      name: "Super Admin", role: "superadmin", teacherId: "ADM-0001", active: true, deletedAt: null,
      pinKey: key, pinHash: await bcrypt.hash(pin, 10), createdAt: new Date(), updatedAt: new Date(),
    });
    console.log(`Created Super Admin. Login PIN: ${pin}`);
  } else if (!admin.pinKey) {
    // Existing admin from the old version: give them the PIN login key.
    await users.updateOne({ _id: admin._id }, { $set: { pinKey: key, pinHash: await bcrypt.hash(pin, 10) } });
    console.log(`Existing admin upgraded to PIN login (${pin}).`);
  } else {
    console.log("Admin already has a PIN. Skipping.");
  }
  // Existing teachers (old accounts) without pinKey need a new PIN from Admin > Teachers.
  const orphan = await users.countDocuments({ role: "teacher", pinKey: { $exists: false } });
  if (orphan) console.log(`${orphan} teacher(s) need a new PIN: Admin > Teachers > Edit.`);

  // Students from the old version need a Student ID.
  const students = mongoose.connection.collection("students");
  const yy = String(new Date().getFullYear()).slice(2);
  let n = (await students.countDocuments({ studentId: { $exists: true } })) + 1;
  for await (const s of students.find({ studentId: { $exists: false } })) {
    await students.updateOne({ _id: s._id }, { $set: { studentId: `LMA${yy}-${String(n++).padStart(4, "0")}` } });
  }
  try { await students.dropIndex("admissionNumber_1"); } catch { /* not present */ }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
