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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: role,
        department: formData.department,
        createdAt: new Date().toISOString(),
        ...(role === "student"
          ? { matricNumber: formData.matricNumber }
          : { staffId: formData.staffId }),
      };

      await setDoc(doc(db, "users", user.uid), userData);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">SmartAttend</h1>
          <p className="text-indigo-200 mt-2">Create your account</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Role Selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-3 rounded-md border-2 font-semibold transition-all ${
                role === "student"
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-indigo-400"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`flex-1 py-3 rounded-md border-2 font-semibold transition-all ${
                role === "staff"
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-indigo-400"
              }`}
            >
              Lecturer
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {role === "student" ? (
              <input
                type="text"
                placeholder="Matric Number"
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
              />
            ) : (
              <input
                type="text"
                placeholder="Staff ID"
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              />
            )}

            <input
              type="text"
              placeholder="Department"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md font-bold text-white transition ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Creating Account..." : "REGISTER"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
