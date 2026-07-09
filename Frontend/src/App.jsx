import { Navigate, Route, Routes } from "react-router-dom";

import Footer from "@/components/Footer";
import Home from "@/components/Dashboard/Home";
import LoginPage from "@/components/LoginPage";
import RegistrationPage from "@/components/RegistrationPage";
import VerifyOtp from "@/components/VerifyUser";


const App = () => {

  return (
   
    <Routes>
      <Route element={<RegistrationPage />} path="/" />
      <Route element={<RegistrationPage />} path="/register" />
      <Route element={<VerifyOtp />} path="/verify-otp" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Home />} path="/home" />
      <Route element={<Navigate replace to="/home" />} path="/Home" />
      <Route element={<Footer />} path="/footer" />
    </Routes>
  
   
  );
};

export default App;
