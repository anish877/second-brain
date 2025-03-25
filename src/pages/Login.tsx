import { useEffect, useState } from 'react';
import { Eye, EyeClosed, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: '',
    password: ''
  });

  const api = axios.create({
    baseURL: 'https://second-brain-backend-rymw.onrender.com',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });
    useEffect(()=>{
      const user = sessionStorage.getItem('user')
      if(user){
        navigate('/')
      }
    },[])

  const handleLogin = async () => {
    if (!userDetails.username || !userDetails.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post("/api/v1/signin", userDetails);
      if (response) {
        sessionStorage.setItem("user",response.data.user)
        navigate("/");
      }
    } catch (error) {
        //@ts-ignore
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogIn className="w-12 h-12 text-gray-800" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-thin tracking-widest text-gray-900">
          LOG IN
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border-2 border-gray-200">
          {/* New demo credentials div */}
          <div className="mb-4 p-2 bg-gray-100 text-center">
            <p>Demo Credentials:</p>
            <p>Username: Anish</p>
            <p>Password: Anish2305@</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  onChange={(e) => {
                    setUserDetails({ ...userDetails, username: e.target.value });
                    setError('');
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  onChange={(e) => {
                    setUserDetails({ ...userDetails, password: e.target.value });
                    setError('');
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <div className='flex justify-center w-full items-center'>
              <Button
                text={isLoading ? "Logging in..." : "Log in"}
                variant="primary"
                size="md"
                // disabled={isLoading}
                onClick={handleLogin}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                Sign up instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
