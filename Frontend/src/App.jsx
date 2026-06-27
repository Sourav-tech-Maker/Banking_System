import { Routes, Route } from "react-router-dom";
import RegistrationPage from './Components/RegistrationPage'
import VerifyOtp from './Components/VerifyUser';
import LoginPage from './Components/LoginPage';
import Home from "./Components/Home";
import Footer from "./Components/Footer";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/Home' element={<Home />} />
      <Route path='/Footer' element={<Footer />} />
    </Routes>

  )
}


export default App




