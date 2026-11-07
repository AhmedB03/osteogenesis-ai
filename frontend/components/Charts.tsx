"use client";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-basic-dist-min";
import type { Result } from "../lib/types";
const Plot = createPlotlyComponent(Plotly);
const colors = ["#187b77", "#d18330", "#786bb0", "#3c76ae", "#bb596d", "#7a8652"];
export default function Charts({ result, compare, keys, title, unit }: { result: Result; compare: Result | null; keys: string[]; title: string; unit: string }) {
  const traces = keys.flatMap((key, i) => {
    const current = { x: result.time, y: result.series[key], type: "scatter" as const, mode: "lines" as const, name: key.replaceAll("_", " "), line: { color: colors[i % colors.length], width: 2.5 } };
    return compare ? [current, { ...current, x: compare.time, y: compare.series[key], name: `${current.name} · pinned`, line: { ...current.line, width: 1.5, dash: "dot" as const } }] : [current];
  });
  return <div className="chart" role="img" aria-label={`${title}. Time-series values are also available in the data table and exports.`}>
    <Plot data={traces} layout={{ autosize: true, height: 300, margin: { l: 58, r: 18, t: 14, b: 70 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent", font: { family: "Arial, sans-serif", size: 11, color: "#52635f" }, xaxis: { title: { text: "Model time · dimensionless" }, gridcolor: "#edf0ec", zeroline: false }, yaxis: { title: { text: unit }, gridcolor: "#edf0ec", zeroline: false }, legend: { orientation: "h", y: -0.25, x: 0 }, hovermode: "x unified" }} config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] }} useResizeHandler style={{ width: "100%", height: 300 }} />
  </div>;
}
