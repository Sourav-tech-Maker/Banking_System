import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { ThreeCircles } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";


const RegistrationPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {

            const response = await axios.post(
                "http://localhost:3000/api/auth/register",
                formData,
                {
                    withCredentials: true
                }
            );
            setErrorMessage("");
            setSuccessMessage(response.data.message);

            setTimeout(() => {
                navigate("/verify-otp", {
                    state: {
                        email: formData.email,
                    },
                });
            }, 2000);
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(
                error.response?.data?.message || "Registration Failed"
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
                            Creating your account...
                        </p>

                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Please wait while we verify your details.
                        </p>

                    </div>
                </div>
            )}

            <main className="w-full flex">
                <div className="relative flex-1 hidden items-center justify-center h-screen bg-gray-900 lg:flex">
                    <div className="relative z-10 w-full max-w-md">
                        <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl hover:scale-105 transition duration-300">
                            <img src={logo} alt="NEXORA" className="h-16 w-auto rounded-2xl object-contain" />
                        </div>
                        <div className=" mt-16 space-y-3">
                            <h3 className="text-5xl font-bold text-white leading-tight">
                                Secure Banking,
                                <span className="block text-blue-400">Simplified.</span>
                            </h3>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                Secure banking meets AI-powered technology learning. Earn <span className="text-blue-400 font-semibold">Nexora Coins</span> through interactive quizzes.
                            </p>
                            <div className="mt-8 space-y-5">
                                <div className="flex flex-wrap gap-3 mt-8">
                                    <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white text-sm">🔒 Enterprise Security</span>
                                    <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white text-sm">🤖 AI Assistant</span>
                                    <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white text-sm">📚 Tech Learning</span>
                                    <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white text-sm">🪙 Nexora Coins</span>
                                </div>
                                <p className="mt-6 text-gray-400 text-sm tracking-wider ">
                                    Secure • Fast • Reliable
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="absolute inset-0 my-auto h-[500px]"
                        style={{ background: "linear-gradient(152.92deg, rgba(192, 132, 252, 0.2) 4.54%, rgba(232, 121, 249, 0.26) 34.2%, rgba(192, 132, 252, 0.1) 77.55%)", filter: "blur(118px)" }}>
                    </div>
                </div>

                <main className="w-2xl h-screen flex flex-col items-center justify-center bg-gray-100 sm:px-4">

                    <div className="w-full space-y-6 text-gray-600 sm:max-w-lg">

                        <div className="text-center">
                            <div className="flex justify-center mb-5">
                                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-lg">
                                    <img src={logo} alt="NEXORA" className="h-12 w-auto rounded-2xl object-contain" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <h3 className="text-3xl font-bold text-gray-900">Create an account</h3>
                                <p className="text-gray-500"> Already have an account?
                                    <a href="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-700">Log in</a>
                                </p>
                            </div>
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
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="font-medium">Name</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg" />
                                </div>
                                <div>
                                    <label className="font-medium"> Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg" />
                                </div>
                                <div>
                                    <label className="font-medium"> Password </label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg" />
                                </div>
                                <button className="w-full px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 active:bg-indigo-600 rounded-lg duration-150" >
                                    Create account
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>

                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-sm text-gray-500">
                                        OR
                                    </span>
                                </div>
                                <div className="absolute inset-0 flex items-center">

                                    <div className="relative flex justify-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-x-3 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-blue-500 hover:shadow-md duration-200">
                                <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" >
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
                        </div>
                    </div>

                </main>
            </main>
        </>
    )
}

export default RegistrationPage


