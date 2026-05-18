import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserModel, UserRole } from "@/types"; 

export const AuthService = {
  // 1. Sign Up
  async signUp(email: string, pass: string, name: string, role: UserRole, extraId: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;

    const userData: UserModel = {
      uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      ...(role === 'student' ? { matricNumber: extraId } : { staffId: extraId })
    };

    // Save user profile to Firestore
    await setDoc(doc(db, "users", uid), userData);
    return userData;
  },

  // 2. Sign In
  async signIn(email: string, pass: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserModel;
    }
    throw new Error("User profile not found in database.");
  },

  // 3. Sign Out
  async logout() {
    await firebaseSignOut(auth);
  }
};