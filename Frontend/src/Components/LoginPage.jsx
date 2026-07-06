import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { ThreeCircles } from "react-loader-spinner";
import {Link, useNavigate } from "react-router-dom";
const LoginPage = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    roleAccessKey: ""
  });
  const [loading, setLoading] = useState(false);

  const needsRbac = formData.role === "admin" || formData.role === "systemUser";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "role" && value === "user") {
        updated.roleAccessKey = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        {
          withCredentials: true
        }
      );
      setErrorMessage("");
      setSuccessMessage(response.data.message);
      sessionStorage.setItem("nexoraUser", JSON.stringify(response.data.user || {}));

      setTimeout(() => {
        navigate("/home", {
          state: {
            email: formData.email,
          },
        });
      }, 2000);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(
        error.response?.data?.message || "Login Failed"
      )
    } finally {
      setLoading(false);
    }
  };
  return (

    <>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">

            <ThreeCircles
              visible={true}
              height="70"
              width="70"
              color="#2563EB"
              outerCircleColor="#2563EB"
              innerCircleColor="#60A5FA"
              middleCircleColor="#1D4ED8"
            />

            <p className="mt-5 text-lg font-semibold text-gray-800">
               Signing you in...
            </p>

            <p className="text-sm text-gray-500 mt-2 text-center">
            Please wait while we verify your credentials.
            </p>

          </div>
        </div>
      )}
      <main className="w-full h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-gray-600 space-y-5">
          <div className="text-center pb-8">
            <img src={logo} alt="NEXORA" width={150} className="mx-auto" />
            <div className="mt-5">
              <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Log in to your account</h3>
            </div>
            {/* Success Alert */}
            {successMessage && (
              <div className="mb-6 px-4 rounded-md border-l-4 border-green-500 bg-green-50">
                <div className="flex justify-between py-3">
                  <div className="flex">
                    <div>
                      {/* Success Icon */}
                    </div>
                    <div className="ml-3">
                      <span className="text-green-600 font-semibold">Success</span>
                      <p className="text-green-600 mt-1">{successMessage}</p>
                    </div>
                  </div>
                  <button onClick={() => setSuccessMessage("")} className="text-green-500" >✕</button>
                </div>
              </div>
            )}
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 px-4 rounded-md border-l-4 border-red-500 bg-red-50">
                <div className="flex justify-between py-3">
                  <div className="flex">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <span className="text-red-600 font-semibold"> Error</span>
                      <p className="text-red-600 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                  <button onClick={() => setErrorMessage("")} className="text-red-500">✕</button>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium">
                Email
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg" />
            </div>
            <div>
              <label className="font-medium">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="current-password" required className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg" />
            </div>
            <div>
              <label className="font-medium">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="systemUser">System User</option>
              </select>
            </div>
            {needsRbac && (
              <div>
                <label className="font-medium">RBAC Access Key</label>
                <input type="password" name="roleAccessKey" value={formData.roleAccessKey} onChange={handleChange} required placeholder="Enter privileged role key" className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"/>
                <p className="mt-1 text-xs text-gray-500"> Required for admin and system user login.</p>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-x-3">
                <input type="checkbox" id="remember-me-checkbox" className="checkbox-item peer hidden" />
                <label htmlFor="remember-me-checkbox" className="relative flex w-5 h-5 bg-white peer-checked:bg-indigo-600 rounded-md border ring-offset-2 ring-indigo-600 duration-150 peer-active:ring cursor-pointer after:absolute after:inset-x-0 after:top-[3px] after:m-auto after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45">
                </label>
                <span>Remember me</span>
              </div>
              <a href="javascript:void(0)" className="text-center text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
            <button className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150">
              Sign in
            </button>
          </form>
          <button className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 duration-150 active:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_17_40)">
                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Continue with Google
          </button>
          <p className="text-center">Don't have an account?{" "} <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500"> Sign up</Link> </p>
        </div>
      </main>
    </>
  )
}

export default LoginPage

