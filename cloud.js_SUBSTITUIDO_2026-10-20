import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInAnonymously,GoogleAuthProvider,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {getFirestore,doc as docRef,getDoc as lerDoc} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
export const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
export async function identify(){await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser.uid;}
export {doc,collection,setDoc,updateDoc,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

// Chamado diretamente no gesto do professor, antes de qualquer await.
// 16/10/2026: só abre sala quem está na lista de mestres (Firestore: config/mestres, campo "emails").
// Os alunos continuam entrando pelo código ou QR, sem conta.
async function mestreAutorizado(user){
 const s=await lerDoc(docRef(db,'config','mestres'));
 const lista=s.exists()&&Array.isArray(s.data().emails)?s.data().emails.map(e=>String(e).toLowerCase()):[];
 return !!user.email&&lista.includes(user.email.toLowerCase());
}
export function identifyTeacher(){
 const user=auth.currentUser;
 const google=user?.providerData.some(provider=>provider.providerId==='google.com');
 const entrada=google?Promise.resolve(user):signInWithPopup(auth,new GoogleAuthProvider()).then(credential=>credential.user);
 return entrada.then(async u=>{
  if(await mestreAutorizado(u))return u.uid;
  await signOut(auth);
  throw Object.assign(new Error('Conta não autorizada'),{code:'eita/nao-autorizado'});
 });
}

export function observeTeacher(callback){return onAuthStateChanged(auth,user=>callback(!!user?.providerData.some(p=>p.providerId==='google.com')));}
