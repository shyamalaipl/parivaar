"use client";

import {
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Crown,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";

// Gradient Card component that matches the design in the image
export const GradientCard = ({
  title,
  description,
  label,
  color = "green",
  icon,
  actionText = "Learn more",
  onClick,
}) => {
  // Define gradient and border colors based on the color prop
  const getStyles = () => {
    switch (color) {
      case "green":
        return {
          background: "bg-gradient-to-br from-green-50 to-green-100",
          border: "border-green-100",
          labelBg: "bg-white text-green-700",
          iconColor: "text-green-500 opacity-20",
        };
      case "pink":
        return {
          background: "bg-gradient-to-br from-pink-50 to-pink-100",
          border: "border-pink-100",
          labelBg: "bg-white text-pink-700",
          iconColor: "text-pink-500 opacity-20",
        };
      case "blue":
        return {
          background: "bg-gradient-to-br from-blue-50 to-indigo-50",
          border: "border-blue-100",
          labelBg: "bg-white text-blue-700",
          iconColor: "text-blue-500 opacity-20",
        };
      case "purple":
        return {
          background: "bg-gradient-to-br from-purple-50 to-violet-50",
          border: "border-purple-100",
          labelBg: "bg-white text-purple-700",
          iconColor: "text-purple-500 opacity-20",
        };
      case "amber":
        return {
          background: "bg-gradient-to-br from-amber-50 to-yellow-50",
          border: "border-amber-100",
          labelBg: "bg-white text-amber-700",
          iconColor: "text-amber-500 opacity-20",
        };
      case "teal":
        return {
          background: "bg-gradient-to-br from-teal-50 to-cyan-50",
          border: "border-teal-100",
          labelBg: "bg-white text-teal-700",
          iconColor: "text-teal-500 opacity-20",
        };
      case "slate":
        return {
          background: "bg-gradient-to-br from-slate-50 to-gray-50",
          border: "border-slate-100",
          labelBg: "bg-white text-slate-700",
          iconColor: "text-slate-500 opacity-20",
        };
      default:
        return {
          background: "bg-gradient-to-br from-gray-50 to-gray-100",
          border: "border-gray-100",
          labelBg: "bg-white text-gray-700",
          iconColor: "text-gray-500 opacity-20",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 ${styles.background} ${styles.border} hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
      onClick={onClick}
    >
      {label && (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles.labelBg} mb-4`}
        >
          {label}
        </span>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex items-center text-sm font-medium hover:underline">
        {actionText} <ArrowRight size={16} className="ml-1" />
      </div>

      {/* Decorative icon in the background */}
      <div
        className={`absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 ${styles.iconColor}`}
      >
        {icon}
      </div>
    </div>
  );
};

// Stat Card component with the same gradient style
export const StatGradientCard = ({
  title,
  value,
  description,
  color = "blue",
  icon,
  trend,
  onClick,
}) => {
  // Define gradient and border colors based on the color prop
  const getStyles = () => {
    switch (color) {
      case "green":
        return {
          background: "bg-gradient-to-br from-green-50 to-green-100",
          border: "border-green-100",
          iconBg: "bg-green-100 text-green-600",
        };
      case "pink":
        return {
          background: "bg-gradient-to-br from-pink-50 to-pink-100",
          border: "border-pink-100",
          iconBg: "bg-pink-100 text-pink-600",
        };
      case "blue":
        return {
          background: "bg-gradient-to-br from-blue-50 to-indigo-50",
          border: "border-blue-100",
          iconBg: "bg-blue-100 text-blue-600",
        };
      case "purple":
        return {
          background: "bg-gradient-to-br from-purple-50 to-violet-50",
          border: "border-purple-100",
          iconBg: "bg-purple-100 text-purple-600",
        };
      case "amber":
        return {
          background: "bg-gradient-to-br from-amber-50 to-yellow-50",
          border: "border-amber-100",
          iconBg: "bg-amber-100 text-amber-600",
        };
      case "teal":
        return {
          background: "bg-gradient-to-br from-teal-50 to-cyan-50",
          border: "border-teal-100",
          iconBg: "bg-teal-100 text-teal-600",
        };
      case "slate":
        return {
          background: "bg-gradient-to-br from-slate-50 to-gray-50",
          border: "border-slate-100",
          iconBg: "bg-slate-100 text-slate-600",
        };
      default:
        return {
          background: "bg-gradient-to-br from-gray-50 to-gray-100",
          border: "border-gray-100",
          iconBg: "bg-gray-100 text-gray-600",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      onClick={onClick}
      className={`rounded-xl ${styles.background} border ${styles.border} p-6 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-700 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${styles.iconBg} shadow-sm`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {trend.icon}
            <span className={`text-xs ${trend.color} font-medium`}>
              {trend.text}
            </span>
          </div>
          <span className="text-sm text-gray-700 flex items-center hover:text-blue-600 transition-colors">
            View
            <ChevronRight size={16} className="ml-1" />
          </span>
        </div>
      )}
    </div>
  );
};

// Subscription Plan Card with gradient style
export const SubscriptionGradientCard = ({ plan, isActive, onUpgrade }) => {
  return (
    <div
      className={`rounded-xl border p-6 transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md"
          : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-white ${
              isActive ? "text-blue-700" : "text-gray-700"
            } mb-2`}
          >
            {isActive ? "Current" : "Available"}
          </span>
          <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        <div
          className={`p-2 rounded-full ${
            isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? <CheckCircle size={20} /> : <Crown size={20} />}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-800">₹{plan.price}</span>
        <span className="text-gray-500 text-sm ml-1">/ month</span>
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <CheckCircle
              size={16}
              className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onUpgrade(plan)}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-gray-200 text-gray-800 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        disabled={isActive}
      >
        {isActive ? "Current Plan" : "Upgrade"}
      </button>
    </div>
  );
};

// Chart Card with gradient style
export const ChartGradientCard = ({
  type,
  data,
  title,
  height = 200,
  color = "blue",
}) => {
  // Define gradient and border colors based on the color prop
  const getStyles = () => {
    switch (color) {
      case "green":
        return {
          background: "bg-gradient-to-br from-green-50 to-green-100",
          border: "border-green-100",
          chartColor: "#10b981",
          chartBgColor: "#d1fae5",
        };
      case "blue":
        return {
          background: "bg-gradient-to-br from-blue-50 to-indigo-50",
          border: "border-blue-100",
          chartColor: "#3b82f6",
          chartBgColor: "#dbeafe",
        };
      case "purple":
        return {
          background: "bg-gradient-to-br from-purple-50 to-violet-50",
          border: "border-purple-100",
          chartColor: "#8b5cf6",
          chartBgColor: "#ede9fe",
        };
      default:
        return {
          background: "bg-white",
          border: "border-gray-200",
          chartColor: "#3b82f6",
          chartBgColor: "#dbeafe",
        };
    }
  };

  const styles = getStyles();
  const maxValue = Math.max(...data.map((item) => item.value));
  const chartHeight = height;

  return (
    <div
      className={`rounded-xl border ${styles.border} p-6 shadow-sm ${styles.background}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle size={16} />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {type == "bar" && (
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full relative">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 ease-in-out"
                      style={{
                        height: `${percentage}%`,
                        backgroundColor: styles.chartBgColor,
                      }}
                    ></div>
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-700 ease-in-out"
                      style={{
                        height: `${percentage * 0.8}%`,
                        backgroundColor: styles.chartColor,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -mt-1">
            <span>{maxValue}</span>
            <span>{Math.floor(maxValue / 2)}</span>
            <span>0</span>
          </div>
        </div>
      )}

      {type == "line" && (
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <svg width="100%" height="100%" className="overflow-visible">
            <line
              x1="0"
              y1={chartHeight}
              x2="100%"
              y2={chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={chartHeight / 2}
              x2="100%"
              y2={chartHeight / 2}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            <polyline
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 100 + "%";
                  const y = chartHeight - (item.value / maxValue) * chartHeight;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={styles.chartColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100 + "%";
              const y = chartHeight - (item.value / maxValue) * chartHeight;
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="4" fill={styles.chartColor} />
                  <circle cx={x} cy={y} r="2" fill="white" />
                </g>
              );
            })}
          </svg>

          <div className="flex justify-between mt-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 whitespace-nowrap"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
