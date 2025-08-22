


// import React from "react";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import "../styles/SocialPoofChartsStyles.css";


// const COLORS = ["#f68b1e", "#e0e0e0"]; // Orange for value, light grey for remainder

// const SMEsData = [
//   { name: "SMEs in Kenya", value: 90 },
//   { name: "Other Businesses", value: 10 },
// ];

// const GDPData = [
//   { name: "SME GDP Contribution", value: 40 },
//   { name: "Other GDP", value: 60 },
// ];

// const SocialProofChart = () => {
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         gap: "50px",
//         flexWrap: "wrap",
//       }}
//     >
//       {/* SMEs in Kenya Chart */}
//       <div style={{ textAlign: "center" }}>
//         <ResponsiveContainer width={200} height={200}>
//           <PieChart>
//             <Pie
//               data={SMEsData}
//               innerRadius={60}
//               outerRadius={80}
//               paddingAngle={2}
//               dataKey="value"
//             >
//               {SMEsData.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//         <h3
//           style={{ color: "#f68b1e", fontSize: "24px", margin: "10px 0 5px" }}
//         >
//           90%
//         </h3>
//         <p style={{ fontSize: "14px", color: "#333" }}>
//           of all businesses in Kenya are SMEs
//         </p>
//       </div>

//       {/* GDP Contribution Chart */}
//       <div style={{ textAlign: "center" }}>
//         <ResponsiveContainer width={200} height={200}>
//           <PieChart>
//             <Pie
//               data={GDPData}
//               innerRadius={60}
//               outerRadius={80}
//               paddingAngle={2}
//               dataKey="value"
//             >
//               {GDPData.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//         <h3
//           style={{ color: "#f68b1e", fontSize: "24px", margin: "10px 0 5px" }}
//         >
//           40%
//         </h3>
//         <p style={{ fontSize: "14px", color: "#333" }}>
//           of Kenya's GDP comes from SMEs
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SocialProofChart;


import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "../styles/SocialPoofChartsStyles.css";

const COLORS = ["#f68b1e", "#e0e0e0"];

const SMEsData = [
  { name: "SMEs in Kenya", value: 90 },
  { name: "Other Businesses", value: 10 },
];

const GDPData = [
  { name: "SME GDP Contribution", value: 40 },
  { name: "Other GDP", value: 60 },
];

const SocialProofChart = () => {
  return (
    <div className="charts-container">
      {/* SMEs in Kenya Chart */}
      <div className="chart-block">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SMEsData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {SMEsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <h3 className="chart-percentage">90%</h3>
        <p className="chart-description">of all businesses in Kenya are SMEs</p>
      </div>

      {/* GDP Contribution Chart */}
      <div className="chart-block">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={GDPData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {GDPData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <h3 className="chart-percentage">40%</h3>
        <p className="chart-description">of Kenya's GDP comes from SMEs</p>
      </div>
    </div>
  );
};

export default SocialProofChart;
