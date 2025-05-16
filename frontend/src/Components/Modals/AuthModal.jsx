import React, { useState } from "react";
import { FaGoogle, FaGithub, FaUpload } from "react-icons/fa";
import UploadFileService from "../../Services/UploadFileService";
import AuthService from "../../Services/AuthService";
import UserService from "../../Services/UserService";

const uploader = new UploadFileService();

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [signinFocused, setSigninFocused] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm: "",
    email: "",
    file: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleFocus = () => {
    setSigninFocused(!signinFocused);
    setFormData({
      username: "",
      password: "",
      confirm: "",
      email: "",
      file: null,
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, file: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (signinFocused) {
        const response = await AuthService.login(
          formData.username,
          formData.password
        );
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("accessToken", response.accessToken);
        if (onSuccess) onSuccess();
        onClose();
        window.location.reload();
      } else {
        const exists = await UserService.checkIfUserExists(formData.username);
        if (exists) {
          setError("User already exists with this username");
          setIsLoading(false);
          return;
        }

        const response = await AuthService.register(
          formData.username,
          formData.password
        );
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("accessToken", response.accessToken);

        let imageUrl = "";
        if (formData.file?.length > 0) {
          imageUrl = await uploader.uploadFile(
            formData.file[0],
            "userImages"
          );
        }

        await UserService.createProfile({
          userId: response.userId,
          image: imageUrl,
          email: formData.email,
        });

        if (onSuccess) onSuccess();
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  const passwordRules = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "At least 1 uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "At least 1 lowercase letter", valid: /[a-z]/.test(formData.password) },
    { label: "At least 1 number", valid: /\d/.test(formData.password) },
    { label: "At least 1 special character", valid: /[!@#$%^&*]/.test(formData.password) },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white w-full max-w-md mx-auto p-6 rounded-xl shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          {signinFocused ? "Sign In" : "Sign Up"}
        </h2>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            <FaGoogle /> Continue with Google
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
          >
            <FaGithub /> Continue with GitHub
          </button>
        </div>

        <div className="my-4 border-t border-gray-300" />

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            type="text"
            placeholder="Username"
            className="w-full border p-2 rounded text-gray-400"
            required
                     />

          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded text-gray-400"
            required
          />

          {!signinFocused && (
            <>
              <ul className="text-sm space-y-1">
                {passwordRules.map((rule, idx) => (
                  <li
                    key={idx}
                    className={rule.valid ? "text-green-600" : "text-gray-500"}
                  >
                    {rule.label}
                  </li>
                ))}
              </ul>

              <input
                name="confirm"
                value={formData.confirm}
                onChange={handleChange}
                type="password"
                placeholder="Confirm Password"
                className="w-full border p-2 rounded text-gray-400"
                required
              /> 

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded text-gray-400"
                required
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <FaUpload className="text-green-500" />
                <span>Upload Profile Image</span>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {formData.file?.[0]?.name && (
                <p className="text-sm text-gray-600 ml-1">
                  Selected: {formData.file[0].name}
                </p>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isLoading
              ? "Processing..."
              : signinFocused
              ? "Sign In"
              : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={toggleFocus}
            className="w-full text-blue-600 hover:underline"
          >
            {signinFocused
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
