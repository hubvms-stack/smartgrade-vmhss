let students = [];
let selectedStudentIndex = null;

const subjectNames = ["Tamil", "English", "Maths", "Physics", "Chemistry", "Computer"];

function addStudent() {
  const newStudent = {
    name: "Student " + (students.length + 1),
    class: "",
    section: "",
    marks: [0, 0, 0, 0, 0, 0],
    total: 0,
    average: 0,
    percentage: 0,
    status: "Present"
  };
  students.push(newStudent);
  renderStudentList();
}

function renderStudentList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const sortedStudents = [...students].sort((a, b) => b.total - a.total);

  sortedStudents.forEach((student, index) => {
    const li = document.createElement("li");
    li.className = "student";
    li.innerHTML = `
      <span>${index + 1}. ${student.name} (${student.status})</span>
      <span>Total: ${student.total}</span>
    `;
    if (student.status === "Absent") {
      li.style.background = "#ffe6e6";
    } else {
      li.style.background = "#e6ffe6";
    }
    li.onclick = () => loadStudent(students.indexOf(student));
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
  }
}

function loadStudent(index) {
  selectedStudentIndex = index;
  const student = students[index];
  document.getElementById("name").value = student.name;
  document.getElementById("class").value = student.class;
  document.getElementById("section").value = student.section;
  document.getElementById("status").value = student.status;

  const marksInputs = document.getElementById("marksInputs");
  marksInputs.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const label = document.createElement("label");
    label.textContent = subjectNames[i];
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = subjectNames[i];
    input.value = student.marks[i];
    marksInputs.appendChild(label);
    marksInputs.appendChild(input);
  }

  document.getElementById("percentageDisplay").textContent =
    `Percentage: ${student.percentage.toFixed(2)}%`;
}

function saveMarks() {
  if (selectedStudentIndex === null) return alert("Select a student");

  const student = students[selectedStudentIndex];
  student.name = document.getElementById("name").value;
  student.class = document.getElementById("class").value;
  student.section = document.getElementById("section").value;
  student.status = document.getElementById("status").value;

  const inputs = document.querySelectorAll("#marksInputs input");
  student.marks = Array.from(inputs).map(i => parseFloat(i.value) || 0);
  student.total = student.marks.reduce((a, b) => a + b, 0);
  student.average = student.total / 6;
  student.percentage = (student.total / 600) * 100;

  document.getElementById("percentageDisplay").textContent =
    `Percentage: ${student.percentage.toFixed(2)}%`;

  renderStudentList();
  alert("Marks Saved!");
}

function downloadExcel() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "No,Name,Class,Section,Status," + subjectNames.join(",") + ",Total,Average,Percentage\n";

  students.forEach((student, index) => {
    const row = [
      index + 1,
      student.name,
      student.class,
      student.section,
      student.status,
      ...student.marks,
      student.total,
      student.average,
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

// Add 10 sample students
for (let i = 0; i < 10; i++) addStudent();