import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD7ckqdouYiTiwBFVXBDvvtrb2oLFOfR3s",
  authDomain: "merilipi-22ea6.firebaseapp.com",
  projectId: "merilipi-22ea6",
  storageBucket: "merilipi-22ea6.firebasestorage.app",
  messagingSenderId: "1059715160088",
  appId: "1:1059715160088:web:cb2274a9f21ed151038b6d",
  measurementId: "G-BBW96C5DTY"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References
const coursesCol = collection(db, "courses");
const coursesList = document.querySelector(".courses-list");
const courseSelect = document.getElementById("course-select");
const lecturesList = document.querySelector(".lectures-list");

// =================== FUNCTIONS ===================

// 🟢 Load courses from Firestore
async function loadCourses() {
  const snap = await getDocs(coursesCol);
  const courses = [];
  snap.forEach(doc => courses.push({ id: doc.id, ...doc.data() }));
  renderCourses(courses);
}

// 🟢 Render courses in UI
function renderCourses(courses) {
  coursesList.innerHTML = "";
  courseSelect.innerHTML = "<option value=''>Select Course</option>";

  courses.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("item-card");
    div.innerHTML = `
      <span><strong>${c.title}</strong></span>
      <div>
        <button class="edit-course" data-id="${c.id}">Edit</button>
        <button class="delete-course" data-id="${c.id}">Delete</button>
      </div>
    `;
    coursesList.appendChild(div);

    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.title;
    courseSelect.appendChild(opt);
  });

  attachCourseListeners();
}

// 🟢 Add new course
document.getElementById("add-course-btn").addEventListener("click", async () => {
  const title = document.getElementById("new-course-title").value.trim();
  const desc = document.getElementById("new-course-desc").value.trim();
  const img = document.getElementById("new-course-img").value.trim();

  if (!title || !desc) return alert("Please enter title and description.");

  await addDoc(coursesCol, {
    title,
    description: desc,
    image: img || "images/alphabet.png",
    lectures: []
  });

  alert("✅ Course added!");
  loadCourses();
});

// 🟢 Delete / Edit course
function attachCourseListeners() {
  document.querySelectorAll(".delete-course").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Delete this course?")) {
        await deleteDoc(doc(db, "courses", id));
        alert("🗑️ Deleted successfully!");
        loadCourses();
      }
    });
  });

  document.querySelectorAll(".edit-course").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const ref = doc(db, "courses", id);
      const snap = await getDoc(ref);
      const c = snap.data();

      const newTitle = prompt("Edit course title:", c.title);
      const newDesc = prompt("Edit course description:", c.description);
      const newImg = prompt("Edit image URL:", c.image);

      await updateDoc(ref, {
        title: newTitle || c.title,
        description: newDesc || c.description,
        image: newImg || c.image
      });

      alert("✏️ Updated!");
      loadCourses();
    });
  });
}

// 🟢 Load lectures for a course
courseSelect.addEventListener("change", async (e) => {
  const id = e.target.value;
  lecturesList.innerHTML = "";
  if (!id) return;

  const snap = await getDoc(doc(db, "courses", id));
  const data = snap.data();
  const lectures = data.lectures || [];

  lectures.forEach((lec, i) => {
    const div = document.createElement("div");
    div.classList.add("item-card");
    div.innerHTML = `
      <span>${lec.title}</span>
      <div>
        <button class="edit-lecture" data-idx="${i}" data-id="${id}">Edit</button>
        <button class="delete-lecture" data-idx="${i}" data-id="${id}">Delete</button>
      </div>
    `;
    lecturesList.appendChild(div);
  });

  attachLectureListeners(id, lectures);
});

// 🟢 Add new lecture
document.getElementById("add-lecture-btn").addEventListener("click", async () => {
  const id = courseSelect.value;
  const title = document.getElementById("lecture-title").value.trim();
  const link = document.getElementById("lecture-link").value.trim();

  if (!id || !title || !link) return alert("Select course and fill all fields.");

  const ref = doc(db, "courses", id);
  const snap = await getDoc(ref);
  const data = snap.data();
  const lectures = data.lectures || [];

  lectures.push({ title, link });
  await updateDoc(ref, { lectures });

  alert("🎥 Lecture added!");
  courseSelect.dispatchEvent(new Event("change"));
});

// 🟢 Edit / Delete lecture
function attachLectureListeners(courseId, lectures) {
  document.querySelectorAll(".delete-lecture").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const idx = e.target.dataset.idx;
      if (!confirm("Delete this lecture?")) return;

      lectures.splice(idx, 1);
      await updateDoc(doc(db, "courses", courseId), { lectures });
      alert("🗑️ Lecture deleted!");
      courseSelect.dispatchEvent(new Event("change"));
    });
  });

  document.querySelectorAll(".edit-lecture").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const idx = e.target.dataset.idx;
      const lec = lectures[idx];

      const newTitle = prompt("Edit lecture title:", lec.title);
      const newLink = prompt("Edit lecture YouTube link:", lec.link);

      lectures[idx] = {
        title: newTitle || lec.title,
        link: newLink || lec.link
      };

      await updateDoc(doc(db, "courses", courseId), { lectures });
      alert("✏️ Lecture updated!");
      courseSelect.dispatchEvent(new Event("change"));
    });
  });
}

// Load all on start
loadCourses();

