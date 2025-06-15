
// Dummy Admission page (replace with real form as needed)
import React from "react";
import Navigation from "@/components/Navigation";
const Admission = () => (
  <div className="flex flex-col min-h-screen">
    <Navigation activeSection="admission" onSectionChange={()=>{}} />
    <div className="flex-grow pt-24 px-6">
      <h1 className="text-2xl font-bold mb-4">Admission Form</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Admission form will be shown here.</p>
      </div>
    </div>
  </div>
);

export default Admission;
