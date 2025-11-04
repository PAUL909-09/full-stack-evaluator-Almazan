// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Animated Data Table Component
 * Props:
 * - title: string (optional)
 * - columns: [{ key: string, label: string }]
 * - data: array of objects
 * - actions: (item) => JSX (optional)
 */
const DataTable = ({ title, columns, data, actions }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="overflow-hidden rounded-xl bg-white shadow-lg"
    >
      {title && (
        <h2 className="border-b bg-gray-50 p-4 text-lg font-semibold text-gray-800">
          {title}
        </h2>
      )}

      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {data.length > 0 ? (
            data.map((item, index) => (
              <motion.tr
                key={item.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#f8fafc",
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
                }}
                className="transition-all"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-gray-800">
                    {col.key === "status" ? (
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          item[col.key] === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item[col.key]}
                      </span>
                    ) : (
                      item[col.key]
                    )}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(item)}</td>}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-4 text-center text-gray-500"
              >
                No records available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default DataTable;
