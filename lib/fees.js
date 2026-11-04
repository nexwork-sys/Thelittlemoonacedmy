// Fee maths shared by Student ERP, Admin and Teacher screens.
// Academic session runs April -> March. "Due" = monthlyFee x months elapsed so far.
export const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function sessionMonths(now = new Date(), startMonth = 4) {
  // returns ["2026-04", ... up to current month] for the running session
  const y = now.getMonth() + 1 >= startMonth ? now.getFullYear() : now.getFullYear() - 1;
  const out = [];
  let yy = y, mm = startMonth;
  while (yy < now.getFullYear() || (yy === now.getFullYear() && mm <= now.getMonth() + 1)) {
    out.push(`${yy}-${String(mm).padStart(2, "0")}`);
    mm++; if (mm > 12) { mm = 1; yy++; }
  }
  return out;
}
export function allSessionMonths(now = new Date(), startMonth = 4) {
  const first = sessionMonths(now, startMonth)[0];
  let [yy, mm] = first.split("-").map(Number);
  return Array.from({ length: 12 }, () => {
    const v = `${yy}-${String(mm).padStart(2, "0")}`;
    mm++; if (mm > 12) { mm = 1; yy++; }
    return v;
  });
}
export function monthLabel(m) {
  const [y, mm] = m.split("-").map(Number);
  return `${MONTH_NAMES[mm - 1]} ${y}`;
}

/**
 * payments: all FeePayment docs of one student.
 * Approved money is spread over months oldest-first (waterfall), so we can show
 * "April paid, May partial, June unpaid" from a single running total.
 */
export function feeSummary({ monthlyFee, payments = [], now = new Date(), startMonth = 4, admissionDate }) {
  let months = sessionMonths(now, startMonth);
  // Don't bill months before the student joined (within the current session)
  if (admissionDate) {
    const a = new Date(admissionDate);
    const joined = `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}`;
    const filtered = months.filter((m) => m >= joined);
    if (filtered.length) months = filtered;
  }
  const approved = payments.filter((p) => p.status === "approved");
  const pending = payments.filter((p) => p.status === "pending");
  const paid = approved.reduce((s, p) => s + p.amount, 0);
  const awaiting = pending.reduce((s, p) => s + p.amount, 0);
  const due = monthlyFee * months.length;
  let remaining = paid;
  const monthRows = months.map((m) => {
    const got = Math.min(remaining, monthlyFee);
    remaining -= got;
    return { month: m, label: monthLabel(m), due: monthlyFee, paid: got,
      status: monthlyFee === 0 ? "paid" : got >= monthlyFee ? "paid" : got > 0 ? "partial" : "unpaid" };
  });
  const balance = Math.max(due - paid, 0);
  return {
    monthlyFee, due, paid, awaiting, balance,
    advance: Math.max(paid - due, 0),
    pendingMonths: monthRows.filter((r) => r.status !== "paid").length,
    months: monthRows,
  };
}

export function makeReceiptNo() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `LMA-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function currentAcademicYear(now = new Date(), startMonth = 4) {
  const y = now.getMonth() + 1 >= startMonth ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(2)}`;
}
