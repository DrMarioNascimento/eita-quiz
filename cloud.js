import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
export const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
export async function identify(){await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser.uid;}
export {doc,collection,setDoc,updateDoc,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
