
// Dummy Documents page (replace with real upload form as needed)
import React from "react";
import Navigation from "@/components/Navigation";
const Documents = () => (
  <div className="flex flex-col min-h-screen">
    <Navigation activeSection="documents" onSectionChange={()=>{}} />
    <div className="flex-grow pt-24 px-6">
      <h1 className="text-2xl font-bold mb-4">Upload Documents</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Document upload and management functionality here.</p>
      </div>
    </div>
  </div>
);

export default Documents;
