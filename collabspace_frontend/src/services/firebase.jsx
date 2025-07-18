import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBITBb00nlfcDLIRMBkehKA1cHkwqsWVxc",
  authDomain: "collab-doc-editor-221ce.firebaseapp.com",
  projectId: "collab-doc-editor-221ce",
  storageBucket: "collab-doc-editor-221ce.appspot.com",
  messagingSenderId: "528218424649",
  appId: "1:528218424649:web:3d16ee47a5a1a077270698"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
