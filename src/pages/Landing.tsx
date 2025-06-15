
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 px-4">
      <div className="max-w-lg rounded-lg bg-white shadow-xl p-8 space-y-6 text-center">
        <img src="/placeholder.svg" alt="Visiona Academy Logo" className="mx-auto h-16 w-16 mb-2" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">Visiona Education Academy</h1>
        <p className="text-gray-700 text-lg mt-3">
          Empowering students with quality education and holistic growth. Join the community leading exam results & achievements in our region!
        </p>
        <div className="my-4">
          <img src="/public/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" className="rounded-xl border shadow-md mx-auto max-h-48" alt="Academy Gallery" />
        </div>
        <div className="text-left text-gray-600 text-sm">
          <div><span className="font-bold text-gray-800">Address:</span> ABC Main Road, Kalaburagi, Karnataka</div>
          <div><span className="font-bold text-gray-800">Contact:</span> 0821-1234567</div>
        </div>
        <Button className="mt-6 w-full bg-blue-700 hover:bg-blue-800" size="lg" onClick={() => navigate("/login")}>
          Get Started (Admin)
        </Button>
      </div>
    </div>
  );
};

export default Landing;
