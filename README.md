# The Little Moon Academy — School Website + ERP (Next.js)

Nursery → Class VIII · Basani Bazar, Babatpur, Varanasi

## Setup
1. `.env.local` me `MONGODB_URI`, `JWT_SECRET`, Cloudinary keys daalein.
2. `npm install`
3. `npm run seed`  (Admin PIN **12345** banata hai; purane email/password data ko clean karta hai)
4. `npm run dev`  → http://localhost:3000   (deploy par `npm run build` seed khud chalata hai)

## Login (email/password nahi, sirf PIN / ID)
| Kaun | Kaise | Kahan |
|---|---|---|
| Admin | PIN `12345` | Header → ERP LOGIN → Admin / Teacher |
| Teacher | Admin ka diya 5-digit PIN (har PIN unique) | same |
| Student | Student ID (jaise `LMA26-0001`) | ERP LOGIN → Student |

## Flow
- **Teacher add (Admin → Teachers):** naam, PIN, class teacher (subject nahi), face capture. Location check punch ke time school radius (Settings) se hota hai.
- **Student add (Teacher → Add Student):** Student ID auto banti hai → usi se Student ERP khulta hai.
- **Student ERP:** Fees, Attendance %, Exam Time Table, Admit Card, Results.
- **Fees:** student naam/ID/class/roll auto-filled → month chunta hai, amount, **UPI (admin ka QR khulta hai)** ya **Cash (teacher ka naam)** → Receipt No. milta hai → status **Pending** jab tak Admin *Approve* na kare. Approve hone par hi fees jama hoti hai.
- **Admin → Fees:** collected / pending / approval-pending, defaulters list, reminder + WhatsApp link, class-wise monthly fees, receipt check.
- **Admin → Exams:** time table, Admit Card open/close, marks entry, Result publish.
- Hata diya: Results & Grading, Exam Config, Result Template, Fee Defaults, Copy Audit, Accountant, Principal, Subject teacher.
