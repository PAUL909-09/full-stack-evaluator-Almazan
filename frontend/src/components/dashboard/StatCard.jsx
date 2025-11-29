/* eslint-disable no-unused-vars */
// frontend/src/components/dashboard/StatCard.jsx
import React from "react";

export default function StatCard({ icon: Icon, label, value, color, badge }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-xl transition-all relative overflow-hidden">

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <Icon className={`w-10 h-10 ${color}`} />
      </div>

      {/* Label */}
      <p className="text-sm text-gray-600 font-medium whitespace-nowrap">
        {label}
      </p>

      {/* Value */}
      <p className={`text-4xl font-bold mt-2 ${color}`}>
        {value}
      </p>

      {/* Optional Badge */}
      {badge && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-bl-2xl font-bold shadow-lg animate-pulse">
          {badge}
        </div>
      )}
    </div>
  );
}
