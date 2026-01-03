import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f7e0] font-inter overflow-hidden">
      {/* Custom animation styles */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(20deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row items-center justify-between w-11/12 max-w-5xl gap-8">
        {/* Left Section */}
        <div className="flex-1 text-left md:pl-4 text-center md:text-left">
          <h1 className="font-poppins text-[4rem] md:text-[6rem] text-[#497A3A] mb-2">
            404
          </h1>
          <p className="text-lg md:text-xl text-[#7C4F2B] mb-6">
            We couldn’t find that page.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#497A3A] hover:bg-[#365d2b] text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Return Home
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center relative mt-6 md:mt-0">
          <img
            src="/assets/leaf.svg"
            alt="Tree"
            className="max-w-full h-auto"
          />
          <img
            src="/assets/leaf.svg"
            alt="Floating leaf"
            className="absolute w-10 h-10 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[10%] left-[20%]"
          />
          <img
            src="/assets/leaf.svg"
            alt="Floating leaf"
            className="absolute w-10 h-10 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[50%] left-[10%] [animation-delay:1.5s]"
          />
          <img
            src="/assets/leaf.svg"
            alt="Floating leaf"
            className="absolute w-10 h-10 opacity-60 animate-[float_6s_ease-in-out_infinite] bottom-[15%] left-[30%] [animation-delay:3s]"
          />
        </div>
      </div>
    </div>
  );
}
