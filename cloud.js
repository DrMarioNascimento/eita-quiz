import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import {getAuth,signInAnonymously,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
export const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
export async function identify(){await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser.uid;}
export {doc,collection,setDoc,updateDoc,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

// Chamado diretamente no gesto do professor, antes de qualquer await.
export function identifyTeacher(){
 const user=auth.currentUser;
 if(user?.providerData.some(provider=>provider.providerId==='google.com'))return Promise.resolve(user.uid);
 return signInWithPopup(auth,new GoogleAuthProvider()).then(credential=>credential.user.uid);
}
