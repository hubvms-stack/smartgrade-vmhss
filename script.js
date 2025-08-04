// JavaScript for managing student data

let studentData = {};

const studentForm = document.getElementById("markForm");
const studentListEl = document.getElementById("list");
const nameInput = document.getElementById("name");
const classInput = document.getElementById("class");
const sectionInput = document.getElementById("section");
const subjectInputs = [
  document.getElementById("subject1"),
  document.getElementById("subject2"),
  document.getElementById("subject3"),
  document.getElementById("subject4"),
  document.getElementById("subject5"),
  document.getElementById("subject6")
];
const presentInput = document.getElementById("present");
const summaryInfo = document.getElementById("summaryInfo");
const classSelector = document.getElementById("classSelector");

function updateClassSelector() {
  classSelector.innerHTML = '';
  const classes = Object.keys(studentData);
  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classSelector.appendChild(option);
  });
}

function renderStudentList(classKey) {
  studentListEl.innerHTML = "";
  if (!studentData[classKey]) return;
  const sorted = studentData[classKey].slice().sort((a, b) => b.total - a.total);

  sorted.forEach((student, index) => {
    const li = document.createElement("li");
    li.className = "student";
    li.textContent = student.name;
    li.onclick = () => alert(`Name: ${student.name}\nClass: ${student.class}\nSection: ${student.section}\nTotal: ${student.total}\nPercentage: ${student.percentage.toFixed(2)}%\nStatus: ${student.present ? 'Present' : 'Absent'}`);
    studentListEl.appendChild(li);
  });

  const totalMarks = sorted.reduce((acc, curr) => acc + curr.total, 0);
  const average = (totalMarks / sorted.length).toFixed(2);
  const topper = sorted[0];
  summaryInfo.innerHTML = `🏆 Topper: ${topper.name} - ${topper.total} marks (${topper.percentage.toFixed(2)}%)<br>📊 Class Average: ${average} marks`;
}

studentForm.onsubmit = function (e) {
  e.preventDefault();
  const name = nameInput.value;
  const cls = classInput.value;
  const sec = sectionInput.value;
  const marks = subjectInputs.map(input => parseFloat(input.value) || 0);
  const present = presentInput.checked;
  const total = marks.reduce((a, b) => a + b, 0);
  const percentage = total / marks.length;

  const classKey = `${cls}-${sec}`;
  if (!studentData[classKey]) studentData[classKey] = [];
  studentData[classKey].push({ name, class: cls, section: sec, marks, total, percentage, present });

  updateClassSelector();
  classSelector.value = classKey;
  renderStudentList(classKey);

  studentForm.reset();
};

classSelector.onchange = function () {
  renderStudentList(classSelector.value);
};