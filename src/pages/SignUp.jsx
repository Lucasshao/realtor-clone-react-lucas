import React, { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { name, email, password } = formData; //created the form data hook and destructure the email and password from the form data
  const navigate = useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState, //thing typed before
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e) {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      updateProfile(auth.currentUser, {
        displayName: name,
      });
      const user = userCredential.user;
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      // toast.success("Sign up was successful")
      // navigate("/");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    }
  }

  return (
    <section>
      <h1 className="mt-6 text-3xl font-bold text-center">Sign Up</h1>
      <div className="flex flex-wrap items-center justify-center max-w-6xl px-6 py-12 mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?q=80&w=1673&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              id="name"
              value={name}
              onChange={onChange}
              placeholder="Full name"
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition ease-in-out bg-white border-gray-300 rounded"
            />
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email address"
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition ease-in-out bg-white border-gray-300 rounded"
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4 py-2 text-xl text-gray-700 transition ease-in-out bg-white border-gray-300 rounded"
              />
              {showPassword ? (
                <AiFillEyeInvisible className="absolute text-xl cursor-pointer right-3 top-3" />
              ) : (
                <AiFillEye
                  className="absolute text-xl cursor-pointer right-3 top-3"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <div className="flex justify-between text-sm whitespace-nowrap sm:text-lg">
              {/* prevent them to go to the second line */}
              <p className="mb-6">
                Have an account?
                <Link
                  to="/sign-in"
                  className="ml-1 text-red-600 transition duration-200 ease-in-out hover:text-red-700"
                >
                  Sign in
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm font-medium text-white uppercase transition duration-150 ease-in-out bg-blue-600 rounded shadow-md px-7 hover:bg-blue-700 hover:shadow-lg active:bg-blue-800"
            >
              Sign up
            </button>
            <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              {/* flex-1 use all the space (half each) */}
              <p className="mx-4 font-semibold text-center">OR</p>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}
