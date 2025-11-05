/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

/**
 * ✨ Enhanced Reusable Data Table (Elegant Blue Theme)
 * Props:
 * - title?: string
 * - columns: [{ key: string, label: string }]
 * - data: array of objects
 * - actions?: (item) => JSX
 */
const DataTable = ({ title, columns, data, actions }) => {
  return (
    <motion.div
      initial={{ y: 25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-[#A0DCFC]/40 bg-white shadow-xl backdrop-blur-sm"
    >
      {/* 🔷 Table Header */}
      {title && (
        <div className="bg-gradient-to-r from-[#0A66B3] to-[#4CB5F5] p-4">
          <h2 className="text-lg font-semibold text-white tracking-wide">
            {title}
          </h2>
        </div>
      )}

      {/* 🧾 Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#F5FAFF]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-sm font-semibold text-[#0A66B3] uppercase tracking-wider border-b border-[#A0DCFC]/50"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-center text-sm font-semibold text-[#0A66B3] uppercase tracking-wider border-b border-[#A0DCFC]/50">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {data.length > 0 ? (
              data.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: "#F0F8FF",
                  }}
                  className="transition-all duration-200 cursor-pointer hover:shadow-sm"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-gray-700 text-sm font-medium"
                    >
                      {col.key === "status" ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            item[col.key] === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item[col.key]}
                        </span>
                      ) : (
                        item[col.key] || "-"
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-center">{actions(item)}</td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DataTable;
