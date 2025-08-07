let students = [];
let selectedStudentIndex = null;
let subjects = [];

function getSubjects(classValue, sectionValue) {
  if (classValue >= 1 && classValue <= 10) {
    return ["Tamil", "English", "Maths", "Science", "Social Science"];
  }
  if (classValue >= 11) {
    if (["A1", "A2"].includes(sectionValue)) {
      return ["Tamil", "English", "Maths", "Physics", "Chemistry", "Biology"];
    } else if (sectionValue === "A3") {
      return ["Tamil", "English", "Physics", "Chemistry", "Biology", "Computer Science"];
    } else if (["B1", "B2", "B3"].includes(sectionValue)) {
      return ["Tamil", "English", "Maths", "Physics", "Chemistry", "Computer Science"];
    } else if (sectionValue === "C") {
      return ["Tamil", "English", "Economics", "Accountancy", "Commerce", "Computer Application"];
    }
  }
  return [];
}

function addStudent() {
  const newStudent = {
    name: "Student " + (students.length + 1),
    class: "",
    section: "",
    marks: [],
    status: [],
    total: 0,
    average: 0,
    percentage: 0
  };
  students.push(newStudent);
  saveToLocalStorage(); // ✅ Save to localStorage
  renderStudentList();
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    saveToLocalStorage(); // ✅ Save to localStorage
    renderStudentList();
  }
}

function renderStudentList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const sortedStudents = [...students].sort((a, b) => b.total - a.total);

  sortedStudents.forEach((student, index) => {
    const li = document.createElement("li");
    li.className = "student";
    li.innerHTML = `
      <span>${index + 1}. ${student.name}</span>
      <span>Total: ${student.total}</span>
      <button onclick="loadStudent(${students.indexOf(student)})">Edit</button>
      <button onclick="deleteStudent(${students.indexOf(student)})">Delete</button>
    `;
    list.appendChild(li);
  });

  if (students.length > 0) {
    const topper = sortedStudents[0];
    const totalAll = students.reduce((sum, s) => sum + s.total, 0);
    const avg = totalAll / students.length;

    document.getElementById("summaryInfo").innerHTML = `
      🏆 Topper: ${topper.name} - ${topper.total} marks (${topper.percentage.toFixed(2)}%)<br>
      📊 Class Average: ${avg.toFixed(2)} marks
    `;
  } else {
    document.getElementById("summaryInfo").innerHTML = "";
  }
}

function loadStudent(index) {
  selectedStudentIndex = index;
  const student = students[index];

  document.getElementById("name").value = student.name;
  document.getElementById("class").value = student.class;
  updateSectionOptions();
  document.getElementById("section").value = student.section;

  subjects = getSubjects(parseInt(student.class), student.section);

  const marksInputsDiv = document.getElementById("marksInputs");
  marksInputsDiv.innerHTML = "";

  subjects.forEach((subject, i) => {
    const mark = student.marks[i] || 0;
    const status = student.status[i] || "Present";

    const subjectDiv = document.createElement("div");
    subjectDiv.innerHTML = `
      <label>${subject}:</label>
      <input type="number" id="mark-${i}" value="${mark}" />
      <select id="status-${i}">
        <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
        <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
      </select>
    `;
    marksInputsDiv.appendChild(subjectDiv);
  });

  document.getElementById("percentageDisplay").textContent =
    `Percentage: ${student.percentage.toFixed(2)}%`;
}

function saveMarks() {
  if (selectedStudentIndex === null) return alert("Select a student");

  const student = students[selectedStudentIndex];
  student.name = document.getElementById("name").value;
  student.class = document.getElementById("class").value;
  student.section = document.getElementById("section").value;

  subjects = getSubjects(parseInt(student.class), student.section);

  student.marks = [];
  student.status = [];

  for (let i = 0; i < subjects.length; i++) {
    const mark = parseFloat(document.getElementById(`mark-${i}`).value) || 0;
    const status = document.getElementById(`status-${i}`).value;
    student.marks[i] = status === "Absent" ? 0 : mark;
    student.status[i] = status;
  }

  student.total = student.marks.reduce((a, b) => a + b, 0);
  student.average = student.total / subjects.length;
  student.percentage = (student.total / (subjects.length * 100)) * 100;

  document.getElementById("percentageDisplay").textContent =
    `Percentage: ${student.percentage.toFixed(2)}%`;

  saveToLocalStorage(); // ✅ Save to localStorage
  renderStudentList();
  alert("Marks Saved!");
}

function downloadExcel() {
  let csvContent = "data:text/csv;charset=utf-8,";

  if (subjects.length === 0 && students.length > 0) {
    subjects = getSubjects(parseInt(students[0].class), students[0].section);
  }

  csvContent += "No,Name,Class,Section," + subjects.map(s => `${s} Mark,${s} Status`).join(",") + ",Total,Average,Percentage\n";

  students.forEach((student, index) => {
    const row = [
      index + 1,
      student.name,
      student.class,
      student.section,
      ...student.marks.flatMap((m, i) => [m, student.status[i]]),
      student.total,
      student.average.toFixed(2),
      student.percentage.toFixed(2)
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "student_marks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadPDF() {
  const win = window.open('', '', 'height=700,width=900');
  win.document.write('<html><head><title>Student Mark List</title></head><body>');
  win.document.write('<h1>VMHSS MLP - Student Mark List</h1>');

  win.document.write('<table border="1" cellspacing="0" cellpadding="5">');
  win.document.write('<tr><th>No</th><th>Name</th><th>Class</th><th>Section</th>' +
    subjects.map(s => `<th>${s} Mark</th><th>${s} Status</th>`).join('') +
    '<th>Total</th><th>Average</th><th>Percentage</th></tr>');

  students.forEach((s, i) => {
    win.document.write(`<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.class}</td><td>${s.section}</td>` +
      s.marks.map((m, j) => `<td>${m}</td><td>${s.status[j]}</td>`).join('') +
      `<td>${s.total}</td><td>${s.average.toFixed(2)}</td><td>${s.percentage.toFixed(2)}%</td></tr>`);
  });

  win.document.write('</table>');
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function updateSectionOptions() {
  const classSelect = document.getElementById("class");
  const sectionSelect = document.getElementById("section");
  const selectedClass = parseInt(classSelect.value);

  let sections = [];

  if (selectedClass >= 11) {
    sections = ["A1", "A2", "A3", "B1", "B2", "B3", "C"];
  } else if (selectedClass >= 1 && selectedClass <= 10) {
    sections = ["A", "B", "C", "D"];
  }

  sectionSelect.innerHTML = `<option value="">Select Section</option>`;
  sections.forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = sec;
    sectionSelect.appendChild(opt);
  });

  sectionSelect.onchange = updateSubjectFields;
}

function updateSubjectFields() {
  const classVal = parseInt(document.getElementById("class").value);
  const sectionVal = document.getElementById("section").value;
  if (!classVal || !sectionVal) return;

  subjects = getSubjects(classVal, sectionVal);

  const marksInputsDiv = document.getElementById("marksInputs");
  marksInputsDiv.innerHTML = "";

  subjects.forEach((subject, i) => {
    const subjectDiv = document.createElement("div");
    subjectDiv.innerHTML = `
      <label>${subject}:</label>
      <input type="number" id="mark-${i}" value="0" />
      <select id="status-${i}">
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
    `;
    marksInputsDiv.appendChild(subjectDiv);
  });

  document.getElementById("percentageDisplay").textContent = "";
}

// ✅ LocalStorage functions
function saveToLocalStorage() {
  localStorage.setItem("vmhss_students", JSON.stringify(students));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("vmhss_students");
  if (saved) {
    students = JSON.parse(saved);
    renderStudentList();
  }
}

// ✅ Load saved data on page load
window.onload = function () {
  loadFromLocalStorage();
};
function printFullMarkList() {
  if (students.length === 0) {
    alert("No students to print.");
    return;
  }

  const printWindow = window.open('', '', 'width=1000,height=800');
  const studentHeaders = students[0].marks.map((_, i) => subjects[i] || `Subject ${i + 1}`);

  let html = `
    <html>
    <head>
      <title>Student Mark List</title>
      <style>
        body { font-family: Arial, sans-serif; color: #000; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 14px; }
        
        th { background-color: #f2f2f2; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <h1>VMHSS Student Mark List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>`;

  studentHeaders.forEach(sub => {
    html += `<th>${sub}</th>`;
  });

  html += `<th>Total</th><th>Percentage</th></tr></thead><tbody>`;

  students.forEach(student => {
    const total = student.marks.reduce((a, b) => a + Number(b), 0);
    const percentage = (total / student.marks.length).toFixed(2);

    html += `<tr><td>${student.name}</td>`;
    student.marks.forEach(mark => {
      html += `<td>${mark}</td>`;
    });
    html += `<td>${total}</td><td>${percentage}%</td></tr>`;
  });

  html += `</tbody></table></body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("VMHSS Student Mark List", 10, 10);

  let y = 20;

  students.forEach((student, index) => {
    let line = `${index + 1}. ${student.name} - Total: ${student.total}, %: ${student.percentage}`;
    doc.text(line, 10, y);
    y += 10;

    // If subject marks are available, show them too
    if (student.marks) {
      Object.entries(student.marks).forEach(([subject, mark]) => {
        doc.text(`   ${subject}: ${mark}`, 15, y);
        y += 8;
      });
    }

    y += 5;

    // Add page if content overflows
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("VMHSS-MarkList.pdf");
}
function printFullMarkList() {
  const element = document.getElementById('studentList'); // Or entire container
  if (!element) return alert("Content not found.");

  const opt = {
    margin: 0.5,
    filename: 'VMHSS_Student_Marks.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
