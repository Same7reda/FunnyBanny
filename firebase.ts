import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0j5wDag4Lge5c1xuIBZ1JKMlpYogzwDE",
  authDomain: "funny-banny.firebaseapp.com",
  databaseURL: "https://funny-banny-default-rtdb.firebaseio.com/",
  projectId: "funny-banny",
  storageBucket: "funny-banny.appspot.com",
  messagingSenderId: "20634296579",
  appId: "1:20634296579:web:7ac9eac1c36b94b5cc8936",
  measurementId: "G-X0PS03EKCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "secondaryApp");


// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);