"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [role, setRole] = useState<"student" | "staff">("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    matricNumber: "",
    staffId: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Prepare the User Model (matches your Flutter UserModel.dart)
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: role,
        department: formData.department,
        createdAt: new Date().toISOString(),
        ...(role === "student" 
            ? { matricNumber: formData.matricNumber } 
            : { staffId: formData.staffId }
        ),
      };

      // 3. Save to Firestore "users" collection
      await setDoc(doc(db, "users", user.uid), userData);

      // 4. Send to login page
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-textDark">Create Account</h1>
          <p className="text-textLight text-sm">Join SmartAttend System</p>
        </div>

        {/* Role Selector (Matches your Flutter _RoleCard) */}
        <div className="flex gap-4">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-3 rounded-md border-2 transition-all ${
              role === "student" ? "border-primary bg-primary text-white" : "border-gray-200 text-textLight"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("staff")}
            className={`flex-1 py-3 rounded-md border-2 transition-all ${
              role === "staff" ? "border-primary bg-primary text-white" : "border-gray-200 text-textLight"
            }`}
          >
            Lecturer
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && <p className="text-error text-xs text-center">{error}</p>}

          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          {role === "student" ? (
            <input
              type="text"
              placeholder="Matric Number"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, matricNumber: e.target.value})}
            />
          ) : (
            <input
              type="text"
              placeholder="Staff ID"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, staffId: e.target.value})}
            />
          )}

          <input
            type="text"
            placeholder="Department"
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary outline-none"
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          />

          <button
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-md hover:opacity-90 transition-opacity"
          >
            {loading ? "Creating Account..." : "REGISTER"}
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}