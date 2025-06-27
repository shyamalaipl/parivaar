import { styled } from "@mui/material";
import { useState, useRef } from "react";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [registrationType, setRegistrationType] = useState(null); // 'committee' or 'code'

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent  px-4">
      <div className="bg-transparent p-6 border border-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F] rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-[#1A2B49] text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>

        {isLogin ? (
          isOtpLogin ? (
            <OtpLogin setIsOtpLogin={setIsOtpLogin} />
          ) : (
            <LoginForm setIsOtpLogin={setIsOtpLogin} />
          )
        ) : registrationType ? (
          <RegisterForm
            type={registrationType}
            setRegistrationType={setRegistrationType}
          />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setRegistrationType("committee")}
              className="w-full bg-[#2F875C] cursor-pointer text-white p-3 rounded-lg hover:bg-[#218a48] transition-colors duration-300"
            >
              Register Your Committee
            </button>
            <button
              onClick={() => setRegistrationType("code")}
              className="w-full bg-[#1A2B49] cursor-pointer text-white p-3 rounded-lg hover:bg-[#152238] transition-colors duration-300"
            >
              Register via Committee Code
            </button>
          </div>
        )}

        <p className="text-center text-[#464748] mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-[#1A2B49] cursor-pointer font-semibold"
            onClick={() => {
              setIsLogin(!isLogin);
              setRegistrationType(null);
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

const LoginForm = ({ setIsOtpLogin }) => {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(number)) {
      alert("Number must be exactly 10 digits");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    alert("Login successful!");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter your number"
        className="w-full p-2 border rounded"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
        maxLength={10}
      />
      <input
        type="password"
        placeholder="Enter your password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full cursor-pointer bg-[#1A2B49] text-white p-2 rounded"
      >
        Login
      </button>
      <button
        type="button"
        className="w-full cursor-pointer text-[#1A2B49] mt-2"
        onClick={() => setIsOtpLogin(true)}
      >
        Forgett Password
      </button>
    </form>
  );
};

const OtpLogin = ({ setIsOtpLogin }) => {
  const [phone, setPhone] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsOtpSent(true);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key == "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Please enter all 6 digits of the OTP.");
      return;
    }
    alert(`OTP Verified: ${otpValue}`);
  };

  return (
    <div className="space-y-4 text-center">
      {!isOtpSent ? (
        <div>
          <input
            type="text"
            placeholder="Enter your phone number"
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onInput={(e) =>
              (e.target.value = e.target.value.replace(/\D/g, ""))
            }
            maxLength={10}
          />
          <button
            type="button"
            className="w-full bg-[#1A2B49] cursor-pointer text-white p-2 rounded mt-2"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>
        </div>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                className="w-12 h-12 text-center text-xl border border-gray-400 rounded focus:outline-none focus:ring-2 focus:[#1A2B49]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-[#1A2B49] text-white p-2 rounded mt-2"
          >
            Verify OTP
          </button>
        </form>
      )}

      <button
        type="button"
        className="w-full cursor-pointer  text-blue-500 mt-2"
        onClick={() => setIsOtpLogin(false)}
      >
        Back to Login
      </button>
    </div>
  );
};

const RegisterForm = ({ type, setRegistrationType }) => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [committeeCode, setCommitteeCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Username is required");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (type == "code" && !committeeCode.trim()) {
      alert("Committee code is required");
      return;
    }
    alert("Registration successful!");
  };

  return (
    <div>
      <button
        onClick={() => setRegistrationType(null)}
        className="mb-4 cursor-pointer text-[#1A2B49] hover:underline"
      >
        ← Back to registration options
      </button>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
          maxLength={10}
        />
        {type == "code" && (
          <input
            type="text"
            placeholder="Committee Code"
            className="w-full p-2 border rounded"
            value={committeeCode}
            onChange={(e) => setCommitteeCode(e.target.value)}
          />
        )}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-[#1A2B49] cursor-pointer text-white p-2 rounded hover:bg-[#152238] transition-colors duration-300"
        >
          Register {type == "committee" ? "Committee" : "with Code"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
