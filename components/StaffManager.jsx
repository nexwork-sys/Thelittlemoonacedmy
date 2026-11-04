"use client";

import { useEffect, useRef, useState } from "react";
import { getFaceDescriptor } from "@/lib/faceApi";

const CLASSES = ["Nursery","LKG","UKG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9"];
const empty = { name: "", pin: "", phone: "", classTeacherOf: "" };

// Admin adds teachers: name, 5-digit PIN, Class-Teacher class (no subject), face capture.
// Location checking happens at punch-in against the school geofence set in Settings.
export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceBusy, setFaceBusy] = useState(false);
  const [faceNote, setFaceNote] = useState("");

  const load = () => fetch("/api/staff").then((r) => r.json()).then((d) => setStaff((d.staff || []).filter((u) => u.role === "teacher")));
  useEffect(() => { load(); }, []);

  async function startCamera() {
    try {
      setError("");
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      setCamOn(true);
    } catch { setError("Camera access nahi mila. Browser permission check karein."); }
  }
  useEffect(() => {
    if (camOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [camOn]);
  function stopCamera() {
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null; setCamOn(false);
  }
  async function captureFace() {
    const video = videoRef.current;
    if (!video) return;
    setFaceBusy(true); setFaceNote("");
    try {
      const descriptor = await getFaceDescriptor(video);
      if (!descriptor) return setFaceNote("Face detect nahi hua — seedha camera me dekhein, roshni me try karein.");
      const c = document.createElement("canvas");
      c.width = video.videoWidth || 320; c.height = video.videoHeight || 240;
      c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
      setFaceImage(c.toDataURL("image/jpeg", 0.85)); setFaceDescriptor(descriptor); stopCamera();
    } catch { setFaceNote("Face capture fail hua. Dobara try karein."); }
    finally { setFaceBusy(false); }
  }

  function reset() {
    stopCamera(); setForm(empty); setEditingId(null); setFaceImage(null); setFaceDescriptor(null); setFaceNote(""); setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError(""); setOk("");
    try {
      const payload = {
        ...form, classTeacherOf: form.classTeacherOf || null,
        ...(faceImage ? { faceCaptured: true, faceImageUrl: faceImage } : {}),
        ...(faceDescriptor ? { faceDescriptor } : {}),
      };
      if (editingId && !payload.pin) delete payload.pin;
      const res = await fetch(editingId ? `/api/staff/${editingId}` : "/api/staff", {
        method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save nahi hua");
      setOk(editingId ? "Teacher update ho gaya." : `Teacher add ho gaya. PIN: ${form.pin}`);
      reset(); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  function edit(u) {
    setEditingId(u._id);
    setForm({ name: u.name, pin: "", phone: u.phone || "", classTeacherOf: u.classTeacherOf || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(u) {
    if (!confirm(`${u.name} ko hataayein?`)) return;
    await fetch(`/api/staff/${u._id}`, { method: "DELETE" }); load();
  }

  const input = "w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-brass";
  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy">{editingId ? "Teacher Edit Karein" : "Naya Teacher Add Karein"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="text-xs text-navy-400">Naam *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Mobile</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} /></div>
          <div>
            <label className="text-xs text-navy-400">Login PIN (5 digit) {editingId ? "— badalna ho tabhi bharein" : "*"}</label>
            <input required={!editingId} inputMode="numeric" maxLength={5} pattern="\d{5}" value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} className={`${input} tracking-[0.4em]`} />
          </div>
          <div>
            <label className="text-xs text-navy-400">Class Teacher of (optional)</label>
            <select value={form.classTeacherOf} onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value })} className={input}>
              <option value="">— None —</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-navy-100 p-4">
          <p className="text-sm font-semibold text-navy">Face Recognition (attendance ke liye)</p>
          {faceImage ? (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={faceImage} alt="Captured face" className="h-24 w-24 rounded-lg object-cover" />
              <div><p className="text-sm text-emerald-700">✔ Face capture ho gaya</p>
                <button type="button" onClick={() => { setFaceImage(null); setFaceDescriptor(null); startCamera(); }} className="text-xs underline">Dobara lein</button></div>
            </div>
          ) : camOn ? (
            <div className="mt-2">
              <video ref={videoRef} muted playsInline className="h-48 rounded-lg bg-black" />
              <div className="mt-2 flex gap-2">
                <button type="button" disabled={faceBusy} onClick={captureFace} className="rounded-lg bg-navy px-4 py-1.5 text-sm text-white">{faceBusy ? "Processing…" : "Capture"}</button>
                <button type="button" onClick={stopCamera} className="rounded-lg border px-4 py-1.5 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={startCamera} className="mt-2 rounded-lg border border-navy px-4 py-1.5 text-sm text-navy">📷 Camera chalu karein</button>
          )}
          {faceNote && <p className="mt-2 text-sm text-red-600">{faceNote}</p>}
          <p className="mt-2 text-xs text-navy-400">Location: teacher sirf school ke andar (Settings me set radius) punch kar payega.</p>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</p>}
        <div className="flex gap-2">
          <button disabled={saving} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy disabled:opacity-50">{saving ? "Saving…" : editingId ? "Update" : "Add Teacher"}</button>
          {editingId && <button type="button" onClick={reset} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full min-w-[620px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="px-4 py-3">Teacher</th><th>ID</th><th>Class Teacher</th><th>Face</th><th /></tr></thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u._id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-3"><b>{u.name}</b><p className="text-xs text-navy-400">{u.phone}</p></td>
                <td>{u.teacherId}</td><td>{u.classTeacherOf || "—"}</td>
                <td>{u.faceCaptured ? <span className="text-emerald-700">✔</span> : <span className="text-navy-400">—</span>}</td>
                <td className="space-x-3 pr-4 text-right">
                  <button onClick={() => edit(u)} className="text-navy underline">Edit</button>
                  <button onClick={() => remove(u)} className="text-red-600 underline">Remove</button>
                </td>
              </tr>
            ))}
            {!staff.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-400">Abhi koi teacher nahi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
