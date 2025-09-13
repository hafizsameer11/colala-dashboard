import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import images from "../../constants/images";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    console.log('Login attempt:', { email: formData.email, password: formData.password }); // Debug log
    const success = await login(formData.email, formData.password);
    console.log('Login result:', success); // Debug log
    
    if (success) {
      console.log('Login successful, navigating to dashboard'); // Debug log
      navigate('/dashboard');
    } else {
      setError("Invalid email or password. Use admin@admin.com / admin");
    }
  };

  return (
    <div className="max-h-screen flex">
      {/* Left side - Image Section (797x592 - optimized for 1512px width) */}
      <div 
        className="w-[797px] h-screen bg-cover bg-center bg-no-repeat relative xl:w-[52.7%] 2xl:w-[50%]"      >
        {/* Subtle overlay to match the original design */}
        <img src={images.Login} alt="" className="max-h-screen w-200 object-cover" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[400px]">
          {/* Login Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Login</h1>
            <p className="text-gray-500 text-lg">Login to the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-lg font-medium text-gray-900 mb-3"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-500 bg-gray-50"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-lg font-medium text-gray-900 mb-3"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-500 bg-gray-50"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E53E3E] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#D32F2F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
