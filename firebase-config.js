// ==========================================
// ឯកសារ js/firebase-config.js - ភ្ជាប់ទៅកាន់ Cloud Database
// ==========================================

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOOAEgvGBAFw3eSvZU7Ebuejp1EA3XfCY",
  authDomain: "classroom-management-ed280.firebaseapp.com",
  projectId: "classroom-management-ed280",
  storageBucket: "classroom-management-ed280.firebasestorage.app",
  messagingSenderId: "414827617127",
  appId: "1:414827617127:web:c8ece6c5ca739176a76dc2",
  measurementId: "G-P56EXEQV00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ១. ចាប់ផ្តើមដំណើរការ Firebase
firebase.initializeApp(firebaseConfig);

// ២. បង្កើតអថេរ db សម្រាប់ហៅប្រើពេញប្រព័ន្ធ
const db = firebase.firestore();

// ៣. បើកមុខងាររក្សាទុកទិន្នន័យពេលដាច់អ៊ីនធឺណិត (Offline Persistence) 🌟
db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn("មាន Tab កម្មវិធីបើកច្រើនពេក Offline mode មិនអាចដើរបានទេ។");
      } else if (err.code == 'unimplemented') {
          console.warn("Browser នេះមិនគាំទ្រ Offline mode ទេ។");
      }
  });

console.log("Firebase ត្រូវបានភ្ជាប់ដោយជោគជ័យ!");