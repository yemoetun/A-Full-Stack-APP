import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ProjectFlow</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
