import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInAnonymously,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
export const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
export async function identify(){await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser.uid;}
export {doc,collection,setDoc,updateDoc,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where,deleteDoc,writeBatch} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

// Chamado diretamente no gesto do professor, antes de qualquer await.
// 20/10/2026: testes públicos — qualquer conta Google abre sala (não há mais lista de mestres).
// Os alunos continuam entrando pelo código ou QR, sem conta.
export function identifyTeacher(){
 const user=auth.currentUser;
 const google=user?.providerData.some(provider=>provider.providerId==='google.com');
 const entrada=google?Promise.resolve(user):signInWithPopup(auth,new GoogleAuthProvider()).then(credential=>credential.user);
 return entrada.then(u=>u.uid);
}

export function observeTeacher(callback){return onAuthStateChanged(auth,user=>callback(!!user?.providerData.some(p=>p.providerId==='google.com')));}
