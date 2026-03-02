import React from 'react';

export default function LoginPage({ onLogin }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 to-indigo-600">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-80"
        onSubmit={onLogin}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <label className="block mb-4">
          <span className="text-gray-700">Username</span>
          <input
            name="username"
            type="text"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <label className="block mb-6">
          <span className="text-gray-700">Password</span>
          <input
            name="password"
            type="password"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
