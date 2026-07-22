
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import OtpInput from "./tailgrids/core/otp-input";
import { AUTH_API_BASE_URL } from "../config/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
    const email = location.state?.email;

  const handleVerify = async () => {
  try {
    const response = await axios.post(
      `${AUTH_API_BASE_URL}/api/auth/verify-otp`,
      {
        email,
        otp,
      },
      {
        withCredentials: true,
      }
    );

    alert(response.data.message);

    navigate("/login");

  } catch (error) {
    alert(error.response?.data?.message || "OTP verification failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h2 className="text-2xl font-bold mb-2">
          Verify Your Email
        </h2>

        <p className="text-gray-500 mb-6">
          Enter the 6-digit OTP sent to your email.
        </p>

        <OtpInput
          digitLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          disabled={otp.length !== 6}
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white disabled:opacity-50"
        >
          Verify OTP
        </button>

      </div>
    </div>
  );
}
