import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const sessionStart = localStorage.getItem("sessionStart");
    const sessionDuration = 60 * 60 * 1000;
    const isSessionValid = sessionStart && (Date.now() - parseInt(sessionStart) < sessionDuration);
    
    if (token && isSessionValid) {
      try {
        const user = JSON.parse(atob(token.split(".")[1]));
        if (user.role === "admin") {
          navigate("/dashboard/admin", { replace: true });
        } else if (user.role === "faculty") {
          navigate("/dashboard/faculty", { replace: true });
        } else {
          navigate("/dashboard/student", { replace: true });
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("sessionStart");
      }
    }
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.message);
        localStorage.setItem("sessionStart", Date.now().toString());
        const user = JSON.parse(atob(data.message.split(".")[1]));
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/dashboard/admin");
          } else if (user.role === "faculty") {
            navigate("/dashboard/faculty");
          } else {
            navigate("/dashboard/student");
          }
        }, 1000);
      } else {
        toast.error(data.message, { position: "top-right" });
        setMessage(data.message);
      }
    } catch (error) {
      toast.error("Connection error. Please try again.", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-row bg-[#141e49]">
      <div className="w-1/2 relative hidden md:block bg-[#070D24]">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="https://i.pinimg.com/736x/bf/49/7f/bf497f8e4ce13c334fecdec4f7118de5.jpg"
            alt="Educational background"
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(1.2) contrast(1.1)",
              height: "100vh", 
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#070D24]/80 via-transparent to-[#070D24]/80"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12">
          <div className={`transform transition-all duration-700 ease-out mb-10 text-center ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-10 h-10 text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <h1 className="text-4xl font-bold text-gray-200">
                EduSpace
              </h1>
            </div>
            <p className="text-blue-300 text-xl font-semibold tracking-wide mt-2">
              Empowering Learning, One Click at a Time
            </p>
          </div>
          <div className="flex justify-center items-center space-x-16 py-6 mt-auto backdrop-blur-sm bg-slate-800/50 px-10 rounded-lg shadow-lg border border-slate-700/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-300">500+</p>
              <p className="text-sm text-gray-300 font-semibold mt-1">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-300">10,000+</p>
              <p className="text-sm text-gray-300 font-semibold mt-1">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-300">50+</p>
              <p className="text-sm text-gray-300 font-semibold mt-1">Educators</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-[#070D24] flex flex-col items-center justify-center px-4 py-10 relative">
        <div className="absolute inset-0 opacity-5 pattern-bg"></div>
        <div className={`md:hidden transform transition-all duration-700 ease-out mb-8 z-10 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white">
              EduSpace
            </h1>
          </div>
          <p className="text-gray-300 text-center text-sm font-medium">
            Empowering Learning, One Click at a Time
          </p>
        </div>


        <div className={`w-full max-w-md z-10 transition-all duration-700 ease-out ${animationComplete ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
          <div className="px-8 py-8 md:py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Login to your account
              </h2>
              <p className="text-gray-300 text-base">
                Join our community of learners today
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 relative overflow-hidden"
              >
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Login"
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
        <div className="md:hidden flex justify-center items-center space-x-8 py-5 mt-6 bg-slate-700/40 rounded-lg shadow-sm border border-gray-700 w-full max-w-md">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-300">500+</p>
            <p className="text-xs text-gray-300 font-semibold">Courses</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-300">10k+</p>
            <p className="text-xs text-gray-300 font-semibold">Students</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-300">50+</p>
            <p className="text-xs text-gray-300 font-semibold">Educators</p>
          </div>
        </div>
      </div>

      
      <style jsx global>{`
        .pattern-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  );
};

export default Login;