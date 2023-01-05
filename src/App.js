import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, orderBy, query, limit, serverTimestamp, addDoc } = require("firebase/firestore");
const { getAuth, GoogleAuthProvider, signInWithPopup } = require("firebase/auth");

const firebaseApp = initializeApp({
  apiKey: "AIzaSyDA-YnEpQ6g1sY2pvsLJnlF6ZKfWX2sOx4",
  authDomain: "superchat-9fa4a.firebaseapp.com",
  projectId: "superchat-9fa4a",
  storageBucket: "superchat-9fa4a.appspot.com",
  messagingSenderId: "151089659946",
  appId: "1:151089659946:web:c3851913ca643766848353",
  measurementId: "G-S729VY1MT9"
});

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <SignOut /> <p>made with &#128153; by <a href="https://shubhjohri.netlify.app/">Shubh</a></p>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const singInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  return (
    <button onClick={singInWithGoogle}>SignIn with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  const [messages, error] = useCollectionData(q);
  if (error) {
    console.log(error);
  }
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(firestore, "/messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>&#128038;</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="profile" />
      <p>{text}</p>
    </div>
  )
}

export default App;
