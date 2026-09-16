import { useEffect, useState } from "react";

const STORAGE_KEY = "chimuka_final_A";
const ECOCASH = "0771234567";
const WHATSAPP = "0771234567";
const SUPER_KEY = "Chimuka@2026";

const emptyStorage = {
  schools: [],
  currentId: null,
  role: null,
  isSuper: false,
};

const gradeOptions = [
  "ECD",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];

function normalizeSchool(school) {
  return {
    ...school,
    students: Array.isArray(school?.students) ? school.students : [],
    messages: Array.isArray(school?.messages) ? school.messages : [],
  };
}

function readStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== "object") return emptyStorage;

    return {
      schools: Array.isArray(raw.schools)
        ? raw.schools.map(normalizeSchool)
        : [],
      currentId: raw.currentId || null,
      role: raw.role || null,
      isSuper: raw.isSuper === true,
    };
  } catch {
    return emptyStorage;
  }
}

function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("schools", JSON.stringify(data.schools));
  localStorage.setItem("currentId", data.currentId || "");
  localStorage.setItem("role", data.role || "");
  localStorage.setItem("isSuper", String(data.isSuper));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(expiry) {
  return new Date(expiry).getTime() < Date.now();
}

function App() {
  const [storage, setStorage] = useState(readStorage);
  const [screen, setScreen] = useState("superLock");
  const [school, setSchool] = useState(null);
  const [parentPhone, setParentPhone] = useState("");

  useEffect(() => {
    saveStorage(storage);
  }, [storage]);

  function updateStorage(changes) {
    setStorage((previous) => ({ ...previous, ...changes }));
  }

  function openSuperAdmin() {
    updateStorage({
      currentId: null,
      role: null,
      isSuper: true,
    });
    setScreen("super");
  }

  function openSchool(selectedSchool) {
    const safeSchool = normalizeSchool(selectedSchool);
    setSchool(safeSchool);
    setParentPhone("");

    updateStorage({
      currentId: safeSchool.id,
      role: null,
      isSuper: false,
    });

    setScreen("schoolLogin");
  }

  function logout() {
    setSchool(null);
    setParentPhone("");

    updateStorage({
      currentId: null,
      role: null,
      isSuper: false,
    });

    setScreen("superLock");
  }

  function updateSchool(updatedSchool) {
    const safeSchool = normalizeSchool(updatedSchool);
    setSchool(safeSchool);

    setStorage((previous) => ({
      ...previous,
      schools: previous.schools.map((item) =>
        item.id === safeSchool.id ? safeSchool : item
      ),
    }));
  }

  if (screen === "superLock") {
    return <SuperLock onUnlock={openSuperAdmin} />;
  }

  if (screen === "super") {
    return (
      <SuperAdmin
        schools={storage.schools}
        onOpenSchool={openSchool}
        onUpdate={(schools) => updateStorage({ schools })}
        onLogout={logout}
      />
    );
  }

  if (screen === "schoolLogin" && school) {
    return (
      <SchoolLogin
        school={school}
        onLogin={(role, phone = "") => {
          setParentPhone(phone);
          updateStorage({ role });
          setScreen(role === "admin" ? "admin" : "parent");
        }}
        onBack={openSuperAdmin}
      />
    );
  }

  if (screen === "admin" && school) {
    return (
      <AdminDashboard
        school={school}
        onSchoolChange={updateSchool}
        onBack={openSuperAdmin}
        onLogout={logout}
      />
    );
  }

  if (screen === "parent" && school) {
    return (
      <ParentPortal
        school={school}
        phone={parentPhone}
        onSchoolChange={updateSchool}
        onLogout={logout}
      />
    );
  }

  return <SuperLock onUnlock={openSuperAdmin} />;
}

function Page({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-white text-black ${className}`}>
      {children}
    </div>
  );
}

function Header({ children }) {
  return (
    <header className="border-b-4 border-black bg-white px-4 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        {children}
      </div>
    </header>
  );
}

function Button({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border-2 border-black bg-white px-4 py-2 text-sm font-black text-black shadow-[3px_3px_0_#000] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:bg-yellow-100 ${className}`}
    />
  );
}

function Footer({ simple = false }) {
  return (
    <footer className="mt-auto border-t-4 border-black bg-black px-4 py-4 text-center text-sm font-black text-white">
      {simple
        ? "POWERED BY CHIMUKA SOFTWARES"
        : `POWERED BY CHIMUKA SOFTWARES | EcoCash: ${ECOCASH} | Harare`}
    </footer>
  );
}

function SuperLock({ onUnlock }) {
  const [passKey, setPassKey] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    if (passKey === SUPER_KEY) {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect pass key.");
    }
  }

  return (
    <Page className="flex items-center justify-center p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]"
      >
        <h1 className="mb-2 text-3xl font-black">CHIMUKA SOFTWARES</h1>
        <p className="mb-6 text-lg font-black">SUPER ADMIN LOCK SCREEN</p>

        <label className="mb-2 block text-sm font-black">
          SUPER ADMIN PASS KEY
        </label>

        <Input
          type="password"
          value={passKey}
          onChange={(event) => setPassKey(event.target.value)}
          placeholder="Enter pass key"
          autoFocus
        />

        {error && (
          <p className="mt-3 border-2 border-black bg-red-200 p-2 font-black">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-5 w-full bg-yellow-300">
          UNLOCK
        </Button>
      </form>
    </Page>
  );
}

function SuperAdmin({ schools, onOpenSchool, onUpdate, onLogout }) {
  const [name, setName] = useState("");

  function createSchool(event) {
    event.preventDefault();
    if (!name.trim()) return;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const newSchool = {
      id: Date.now().toString(),
      name: name.trim(),
      code: `SCH${Math.floor(100 + Math.random() * 900)}`,
      adminPass: "admin123",
      expiry: expiry.toISOString(),
      students: [],
      messages: [],
    };

    onUpdate([...schools, newSchool]);
    setName("");
  }

  function addDays(school) {
    const days = Number(window.prompt("Enter number of days to add:"));
    if (!Number.isFinite(days) || days <= 0) return;

    const startDate = isExpired(school.expiry)
      ? new Date()
      : new Date(school.expiry);

    startDate.setDate(startDate.getDate() + days);

    onUpdate(
      schools.map((item) =>
        item.id === school.id
          ? { ...item, expiry: startDate.toISOString() }
          : item
      )
    );
  }

  function deleteSchool(school) {
    if (!window.confirm(`Delete ${school.name}?`)) return;
    onUpdate(schools.filter((item) => item.id !== school.id));
  }

  return (
    <Page className="flex flex-col">
      <Header>
        <div>
          <h1 className="text-2xl font-black">SUPER ADMIN</h1>
          <p className="font-black">EcoCash: {ECOCASH}</p>
        </div>

        <Button onClick={onLogout}>LOCK SCREEN</Button>
      </Header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4">
        <form
          onSubmit={createSchool}
          className="mb-8 border-4 border-black p-4"
        >
          <h2 className="mb-3 text-xl font-black">CREATE SCHOOL</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="School name"
            />

            <Button type="submit" className="bg-yellow-300">
              + CREATE SCHOOL
            </Button>
          </div>
        </form>

        <h2 className="mb-3 text-2xl font-black">ALL SCHOOLS</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {schools.map((item) => {
            const expired = isExpired(item.expiry);

            return (
              <div key={item.id} className="border-4 border-black p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{item.name}</h3>

                  <span
                    className={`border-2 border-black px-2 py-1 text-xs font-black ${
                      expired ? "bg-red-300" : "bg-green-300"
                    }`}
                  >
                    {expired ? "EXPIRED" : "ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm font-black sm:grid-cols-2">
                  <p>CODE: {item.code}</p>
                  <p>PASS: {item.adminPass}</p>
                  <p>LEARNERS: {item.students?.length || 0}</p>
                  <p>EXPIRY: {formatDate(item.expiry)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => onOpenSchool(item)}
                    className="bg-yellow-300"
                  >
                    OPEN SCHOOL
                  </Button>

                  <Button onClick={() => addDays(item)}>+ ADD DAYS</Button>

                  <Button
                    onClick={() => deleteSchool(item)}
                    className="bg-red-300"
                  >
                    DELETE
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {schools.length === 0 && (
          <p className="border-2 border-black p-4 text-center font-black">
            No schools created yet.
          </p>
        )}
      </main>
    </Page>
  );
}

function SchoolLogin({ school, onLogin, onBack }) {
  const expired = isExpired(school.expiry);

  const [adminPass, setAdminPass] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function loginAdmin(event) {
    event.preventDefault();

    if (expired) {
      setError(
        `SUBSCRIPTION EXPIRED - ${school.name} Expired: ${formatDate(
          school.expiry
        )} - Renew now: EcoCash ${ECOCASH} WhatsApp ${WHATSAPP}`
      );
      return;
    }

    if (adminPass === school.adminPass) {
      onLogin("admin");
    } else {
      setError("Incorrect school official password.");
    }
  }

  function loginParent(event) {
    event.preventDefault();

    if (expired) {
      setError(
        `Dear Parent/Guardian, The school portal for ${school.name} is currently undergoing system maintenance and renewal. Student reports are temporarily unavailable. Please contact the school administration for assistance. We apologize for the inconvenience.`
      );
      return;
    }

    const found = school.students.some(
      (student) => student.phone === phone && student.pin === pin
    );

    if (found) {
      onLogin("parent", phone);
    } else {
      setError("Phone number or PIN is incorrect.");
    }
  }

  return (
    <Page className="flex flex-col">
      <Header>
        <div>
          <h1 className="text-2xl font-black">{school.name}</h1>

          {!expired && (
            <p className="font-black">
              Active till {formatDate(school.expiry)}
            </p>
          )}
        </div>

        <Button onClick={onBack}>BACK TO SCHOOLS</Button>
      </Header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-5 p-4 md:grid-cols-2">
        <form onSubmit={loginAdmin} className="border-4 border-black p-5">
          <h2 className="mb-4 text-2xl font-black">SCHOOL OFFICIAL</h2>

          <label className="mb-2 block font-black">ADMIN PASSWORD</label>

          <Input
            type="password"
            value={adminPass}
            onChange={(event) => setAdminPass(event.target.value)}
            placeholder="admin123"
          />

          <Button type="submit" className="mt-5 w-full bg-yellow-300">
            OFFICIAL LOGIN
          </Button>
        </form>

        <form onSubmit={loginParent} className="border-4 border-black p-5">
          <h2 className="mb-4 text-2xl font-black">PARENT PORTAL</h2>

          <label className="mb-2 block font-black">PHONE</label>

          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Parent phone"
          />

          <label className="mb-2 mt-4 block font-black">4-DIGIT PIN</label>

          <Input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Student PIN"
            maxLength={4}
          />

          <Button type="submit" className="mt-5 w-full bg-yellow-300">
            PARENT LOGIN
          </Button>
        </form>

        {error && (
          <p className="border-4 border-black bg-red-200 p-4 font-black md:col-span-2">
            {error}
          </p>
        )}
      </main>

      <Footer simple />
    </Page>
  );
}

function AdminDashboard({ school, onSchoolChange, onBack, onLogout }) {
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("ECD");
  const [phone, setPhone] = useState("");
  const [activeGrade, setActiveGrade] = useState("ECD");
  const [modal, setModal] = useState(null);
  const [messageText, setMessageText] = useState("");

  const visibleStudents = [...school.students]
    .filter((student) => student.grade === activeGrade)
    .sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, {
        sensitivity: "base",
      })
    );

  const gradeMessages = (school.messages || [])
    .filter((message) => message.grade === activeGrade)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  function addStudent(event) {
    event.preventDefault();

    if (!fullName.trim() || !phone.trim()) return;

    const newStudent = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      grade,
      phone: phone.trim(),
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      paid: 0,
      baseFee: 100,
      report:
        "Student is progressing well. Continue supporting regular attendance and homework.",
    };

    onSchoolChange({
      ...school,
      students: [...school.students, newStudent],
    });

    setFullName("");
    setPhone("");
    setActiveGrade(grade);
  }

  function updateStudent(studentId, changes) {
    onSchoolChange({
      ...school,
      students: school.students.map((student) =>
        student.id === studentId ? { ...student, ...changes } : student
      ),
    });
  }

  function deleteStudent(studentId) {
    if (!window.confirm("Delete this learner?")) return;

    onSchoolChange({
      ...school,
      students: school.students.filter((student) => student.id !== studentId),
    });
  }

  function sendAdminMessage(event) {
    event.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      grade: activeGrade,
      text: messageText.trim(),
      from: "School Official",
      date: new Date().toISOString(),
    };

    onSchoolChange({
      ...school,
      messages: [...(school.messages || []), newMessage],
    });

    setMessageText("");
  }

  return (
    <Page className="flex flex-col">
      <Header>
        <div>
          <h1 className="text-xl font-black">{school.name}</h1>
          <p className="font-black">
            Active till {formatDate(school.expiry)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onBack}>BACK TO SCHOOLS</Button>
          <Button onClick={onLogout}>LOGOUT</Button>
        </div>
      </Header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4">
        <form
          onSubmit={addStudent}
          className="mb-6 border-4 border-black p-4"
        >
          <h2 className="mb-3 text-xl font-black">ADD LEARNER</h2>

          <div className="grid gap-3 md:grid-cols-4">
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full Name"
            />

            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 font-black"
            >
              {gradeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Parent Phone"
            />

            <Button type="submit" className="bg-yellow-300">
              + ADD
            </Button>
          </div>
        </form>

        <div className="mb-6 flex flex-wrap gap-2 border-4 border-black p-3">
          {gradeOptions.map((item) => {
            const count = school.students.filter(
              (student) => student.grade === item
            ).length;

            return (
              <Button
                key={item}
                onClick={() => setActiveGrade(item)}
                className={activeGrade === item ? "bg-yellow-300" : ""}
              >
                {item} ({count})
              </Button>
            );
          })}
        </div>

        <div className="mb-5 border-4 border-black p-4">
          <h2 className="mb-3 text-xl font-black">
            CHAT WITH {activeGrade} PARENTS
          </h2>

          <div className="mb-3 max-h-64 overflow-y-auto border-2 border-black p-3">
            {gradeMessages.length === 0 && (
              <p className="font-black">No messages yet.</p>
            )}

            {gradeMessages.map((message) => (
              <div key={message.id} className="mb-3 border-b-2 border-black pb-2">
                <p className="font-black">
                  {message.from} - {formatDate(message.date)}
                </p>
                <p className="font-bold">{message.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendAdminMessage} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder={`Message ${activeGrade} parents`}
            />

            <Button type="submit" className="bg-yellow-300">
              SEND
            </Button>
          </form>
        </div>

        <h2 className="mb-3 text-2xl font-black">{activeGrade} LEARNERS</h2>

        <div className="overflow-x-auto border-4 border-black">
          <table className="w-full min-w-[850px] table-fixed border-collapse bg-white text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="w-[24%] border-2 border-white p-3 font-black">
                  FULLNAME
                </th>
                <th className="w-[15%] border-2 border-white p-3 font-black">
                  GRADE
                </th>
                <th className="w-[15%] border-2 border-white p-3 font-black">
                  PIN
                </th>
                <th className="w-[20%] border-2 border-white p-3 font-black">
                  PAID / OWES
                </th>
                <th className="w-[26%] border-2 border-white p-3 font-black">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleStudents.map((student) => {
                const paid = Number(student.paid) || 0;
                const baseFee = Number(student.baseFee) || 100;
                const owes = Math.max(0, baseFee - paid);

                return (
                  <tr key={student.id} className="border-2 border-black">
                    <td className="border-2 border-black p-3 font-black">
                      {student.fullName}
                    </td>

                    <td className="border-2 border-black p-3 font-black">
                      {student.grade}
                    </td>

                    <td className="border-2 border-black p-3 font-black">
                      <span className="inline-block border-2 border-black bg-yellow-300 px-2 py-1">
                        {student.pin}
                      </span>
                    </td>

                    <td className="border-2 border-black p-3 font-black">
                      <div>PAID: ${paid}</div>
                      <div>OWES: ${owes}</div>
                    </td>

                    <td className="border-2 border-black p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setModal({ type: "payment", student })}
                          className="bg-green-300"
                        >
                          PAID $
                        </Button>

                        <Button
                          onClick={() => setModal({ type: "report", student })}
                        >
                          VIEW
                        </Button>

                        <Button
                          onClick={() => deleteStudent(student.id)}
                          className="bg-red-300"
                        >
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleStudents.length === 0 && (
          <p className="mt-4 border-2 border-black p-4 text-center font-black">
            No learners found in {activeGrade}.
          </p>
        )}
      </main>

      <Footer />

      {modal?.type === "payment" && (
        <PaymentModal
          student={modal.student}
          onClose={() => setModal(null)}
          onSave={(amount) => {
            updateStudent(modal.student.id, {
              paid: (Number(modal.student.paid) || 0) + amount,
            });
            setModal(null);
          }}
        />
      )}

      {modal?.type === "report" && (
        <ReportModal
          student={modal.student}
          onClose={() => setModal(null)}
        />
      )}
    </Page>
  );
}

function PaymentModal({ student, onClose, onSave }) {
  const [amount, setAmount] = useState("");

  function savePayment() {
    const value = Number(amount);
    if (Number.isFinite(value) && value > 0) {
      onSave(value);
    }
  }

  return (
    <Modal title={`ADD PAYMENT - ${student.fullName}`} onClose={onClose}>
      <Input
        type="number"
        min="0"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Payment amount"
      />

      <Button onClick={savePayment} className="mt-4 w-full bg-green-300">
        SAVE PAYMENT
      </Button>
    </Modal>
  );
}

function ReportModal({ student, onClose }) {
  return (
    <Modal title={`REPORT - ${student.fullName}`} onClose={onClose}>
      <p className="border-2 border-black p-4 font-bold">
        {student.report || "No report available."}
      </p>

      <p className="mt-3 font-black">Grade: {student.grade}</p>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border-4 border-black bg-white p-5 shadow-[8px_8px_0_#000]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <Button onClick={onClose}>X</Button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ParentPortal({ school, phone, onSchoolChange, onLogout }) {
  const [modalStudent, setModalStudent] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [activeGrade, setActiveGrade] = useState("");

  const students = school.students
    .filter((student) => student.phone === phone)
    .sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, {
        sensitivity: "base",
      })
    );

  const grades = [...new Set(students.map((student) => student.grade))];
  const selectedGrade = activeGrade || grades[0] || "";

  const gradeMessages = (school.messages || [])
    .filter((message) => message.grade === selectedGrade)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  function sendParentMessage(event) {
    event.preventDefault();
    if (!messageText.trim() || !selectedGrade) return;

    const newMessage = {
      id: Date.now().toString(),
      grade: selectedGrade,
      text: messageText.trim(),
      from: `Parent - ${phone}`,
      date: new Date().toISOString(),
    };

    onSchoolChange({
      ...school,
      messages: [...(school.messages || []), newMessage],
    });

    setMessageText("");
  }

  return (
    <Page className="flex flex-col">
      <Header>
        <h1 className="text-2xl font-black">
          {school.name} - PARENT PORTAL
        </h1>

        <Button onClick={onLogout}>LOGOUT</Button>
      </Header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        {grades.length > 1 && (
          <div className="mb-5 flex flex-wrap gap-2 border-4 border-black p-3">
            {grades.map((grade) => (
              <Button
                key={grade}
                onClick={() => setActiveGrade(grade)}
                className={selectedGrade === grade ? "bg-yellow-300" : ""}
              >
                {grade}
              </Button>
            ))}
          </div>
        )}

        <div className="mb-5 border-4 border-black p-4">
          <h2 className="mb-3 text-xl font-black">
            CHAT WITH {selectedGrade || "SCHOOL"}
          </h2>

          <div className="mb-3 max-h-64 overflow-y-auto border-2 border-black p-3">
            {gradeMessages.length === 0 && (
              <p className="font-black">No messages yet.</p>
            )}

            {gradeMessages.map((message) => (
              <div
                key={message.id}
                className="mb-3 border-b-2 border-black pb-2"
              >
                <p className="font-black">
                  {message.from} - {formatDate(message.date)}
                </p>
                <p className="font-bold">{message.text}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={sendParentMessage}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Write a message to the school"
            />

            <Button type="submit" className="bg-yellow-300">
              SEND
            </Button>
          </form>
        </div>

        <h2 className="mb-3 text-2xl font-black">YOUR LEARNERS</h2>

        {students.map((student) => {
          const paid = Number(student.paid) || 0;
          const baseFee = Number(student.baseFee) || 100;
          const owes = Math.max(0, baseFee - paid);

          return (
            <div
              key={student.id}
              className="mb-4 border-4 border-black p-4"
            >
              <h2 className="text-xl font-black">{student.fullName}</h2>
              <p className="font-black">Grade: {student.grade}</p>
              <p className="font-black">Amount Owing: ${owes}</p>

              <Button
                onClick={() => setModalStudent(student)}
                className="mt-3 bg-yellow-300"
              >
                VIEW REPORT
              </Button>
            </div>
          );
        })}

        {students.length === 0 && (
          <p className="border-2 border-black p-4 font-black">
            No matching student records found.
          </p>
        )}
      </main>

      <Footer simple />

      {modalStudent && (
        <ReportModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
        />
      )}
    </Page>
  );
}

export default App;