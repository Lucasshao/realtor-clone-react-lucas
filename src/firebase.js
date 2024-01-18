// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA9FGLqo8acX0xwINaVX0OGhflw4QpbFo",
  authDomain: "realtor-clone-react-lucas.firebaseapp.com",
  projectId: "realtor-clone-react-lucas",
  storageBucket: "realtor-clone-react-lucas.appspot.com",
  messagingSenderId: "1031152099849",
  appId: "1:1031152099849:web:f5346e43da4851fb198ed8",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
