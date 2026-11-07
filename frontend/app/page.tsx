"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { defaults, initial, type Config, type Result, type Signals, type Parameters, type Initial, type Sweep } from "../lib/types";
import { download, post } from "../lib/api";
const Charts = dynamic(() => import("../components/Charts"), { ssr: false, loading: () => <div className="empty">Loading scientific plot…</div> });
const Bone = dynamic(() => import("../components/Bone"), { ssr: false, loading: () => <div className="empty">Loading illustrative model…</div> });
const names: Record<keyof Signals, string> = { ihh: "IHH", pthrp: "PTHrP", bmp: "BMP", fgf: "FGF", wnt: "Wnt", gh_igf: "GH / IGF-1" };
function Slider({ label, value, max = 2, step = .01, onChange }: { label: string; value: number; max?: number; step?: number; onChange: (v: number) => void }) { return <label className="slider"><span>{label}<output>{value.toFixed(2)}</output></span><input type="range" min="0" max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></label>; }
export default function Workspace() {
  const [config, setConfig] = useState<Config>(structuredClone(defaults));
  const [result, setResult] = useState<Result | null>(null);
  const [compare, setCompare] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready to simulate");
  const [tab, setTab] = useState("Populations");
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [experiment, setExperiment] = useState<Sweep | null>(null);
  const [sweepParameter, setSweepParameter] = useState("proliferation");
  const [sweepValues, setSweepValues] = useState("0.10, 0.25, 0.40");
  useEffect(() => {
    if (!playing || !result) return;
    const timer = setInterval(() => setFrame(f => { if (f >= result.time.length-1) { setPlaying(false); return f; } return Math.min(f+3, result.time.length-1); }), 60);
    return () => clearInterval(timer);
  }, [playing, result]);
  function parameter(key: keyof Parameters, value: number) { setConfig(c => ({ ...c, parameters: { ...c.parameters, [key]: value } })); }
  async function run() {
    setBusy(true); setError(""); setPlaying(false); setStatus("Integrating ODE system…");
    try { const data = await post<Result>("/simulations", config); setResult(data); setFrame(data.time.length-1); setStatus(`Run complete · ${data.run_id}`); }
    catch (e) { setError(e instanceof Error ? e.message : "Simulation failed."); setStatus("Run failed · previous results retained"); }
    finally { setBusy(false); }
  }
  async function runSweep() {
    setBusy(true); setError("");
    try {
      const values = sweepValues.split(",").map(v => v.trim() === "" ? NaN : Number(v));
      if (values.some(v => !Number.isFinite(v))) throw new Error("Enter comma-separated numerical sweep values.");
      setExperiment(await post<Sweep>("/experiments/sweep", { config, parameter: sweepParameter, values }));
    } catch (e) { setError(e instanceof Error ? e.message : "Sweep failed."); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    if (!result) return;
    const keys = Object.keys(result.series);
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const metadata = [result.run_id, result.model_version, quote(JSON.stringify(result.config))];
    download(`${result.run_id}.csv`, [["time", ...keys, "run_id", "model_version", "config_json"].join(","), ...result.time.map((t, i) => [t, ...keys.map(k => result.series[k][i]), ...metadata].join(","))].join("\n"), "text/csv");
  }
  const chartKeys: Record<string, string[]> = { Populations: ["resting", "proliferating", "hypertrophic"], Tissue: ["cartilage", "mineralized", "bone"], Signaling: ["signal_ihh", "signal_pthrp", "signal_bmp", "signal_fgf", "signal_wnt", "signal_gh_igf"], Function: ["organization", "competence", "stability"], Expansion: ["displacement", "thickness", "expansion", "ossify"] };
  return <div className="shell">
    <header className="topbar"><a className="brand" href="/"><span className="brandmark" aria-hidden="true">O<span>G</span></span><span>OsteoGenesis <b>AI</b><small>COMPUTATIONAL BIOLOGY</small></span></a><div className="topmeta"><span className="dot" /> Local research workspace<span className="version">MODEL v0.1.0</span></div></header>
    <div className="workspace-heading"><div><div className="eyebrow">RESEARCH WORKSPACE / GROWTH PLATE DYNAMICS</div><h1>Explore the conditions for growth.</h1><p>A mechanistic sandbox for cartilage dynamics and hypothetical tissue regeneration.</p></div><span className="badge">EXPLORATORY MODEL</span></div>
    <div className="notice"><strong>Computational thought experiment.</strong> All values are uncalibrated, dimensionless indices. Results do not demonstrate adult regeneration or predict human height gains.</div>
    <main className="workspace">
      <aside className="panel controls"><div className="section-heading"><h2>Simulation setup</h2><span className="eyebrow">01</span></div>
        <label className="field">Scenario<select value={config.scenario} onChange={e => { setConfig(c => ({ ...c, scenario: e.target.value as Config["scenario"], initial: null })); }}><option value="engineered">B · Engineered growth plate</option><option value="mature">A · Mature bone baseline</option></select></label>
        <p className="hint">{config.scenario === "engineered" ? "Assumes an existing, organized tissue compartment. Integration and surgical access are outside this model." : "No growth plate cells. Raising GH / IGF-1 cannot initiate longitudinal growth in this baseline."}</p>
        <label className="field">Duration · model time<input type="number" min="1" max="200" value={config.duration} onChange={e => setConfig(c => ({ ...c, duration: Number(e.target.value) }))} /></label>
        <div className="divider" /><h3>Cell & tissue kinetics</h3>
        {([['proliferation','Proliferation'],['differentiation','Differentiation'],['matrix_deposition','Matrix deposition'],['ossification','Bone replacement']] as [keyof Parameters,string][]).map(([k,label]) => <Slider key={k} label={label} value={config.parameters[k]} onChange={v => parameter(k,v)} />)}
        <details><summary>Environment & initial tissue</summary><Slider label="Nutrient availability" value={config.parameters.nutrient} max={1} onChange={v => parameter("nutrient",v)} /><Slider label="Mechanical loading" value={config.parameters.loading} max={3} onChange={v => parameter("loading",v)} /><Slider label="Scaffold degradation" value={config.parameters.scaffold_degradation} onChange={v => parameter("scaffold_degradation",v)} /><Slider label="Senescence" value={config.parameters.senescence} step={.001} max={.1} onChange={v => parameter("senescence",v)} />
          {config.scenario === "engineered" && (Object.keys(initial) as (keyof Initial)[]).map(k => <label className="field compact" key={k}>{k.replaceAll("_"," ")}<input type="number" min="0" max={["scaffold","organization","competence"].includes(k) ? 1 : 10} step=".05" value={(config.initial || initial)[k]} onChange={e => setConfig(c => ({ ...c, initial: { ...(c.initial || initial), [k]: Number(e.target.value) } }))} /></label>)}
        </details>
        <div className="divider" /><h3>Signaling activity <span className="subtle">relative inputs</span></h3>
        {(Object.keys(names) as (keyof Signals)[]).map(k => <Slider key={k} label={names[k]} value={config.signals[k]} max={4} step={.1} onChange={v => setConfig(c => ({ ...c, signals: { ...c.signals, [k]: v } }))} />)}
        <p className="hint">Phenomenological modifiers, not concentrations or established dose–response curves.</p>
        <button className="primary w-full" onClick={run} disabled={busy}>{busy ? "Computing…" : "Run simulation →"}</button><div className="button-row"><button onClick={() => { setConfig(structuredClone(defaults)); setError(""); }} disabled={busy}>Reset setup</button><button onClick={() => download("osteogenesis-config.json", JSON.stringify(config,null,2))}>Save config</button></div>
        <label className="import-label">Load saved configuration<input aria-label="Load saved configuration" type="file" accept=".json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); setError(""); try { const data = await post<Result>("/simulations",JSON.parse(await file.text())); setConfig(data.config); setResult(data); setFrame(data.time.length-1); setStatus(`Imported run · ${data.run_id}`); } catch { setError("Could not load configuration. Check its format and that the API is available."); } finally { setBusy(false); e.target.value=""; } }} disabled={busy} /></label>
      </aside>
      <section className="results"><div className="result-bar"><span role="status" className="status"><span className="dot" />{status}</span><div className="button-row"><button disabled={!result || busy} onClick={() => setCompare(result)}>Pin for comparison</button><button disabled={!result} onClick={exportCsv}>CSV ↓</button><button disabled={!result} onClick={() => result && download(`${result.run_id}.json`,JSON.stringify(result,null,2))}>JSON ↓</button></div></div>
        {error && <div role="alert" className="error">{error}</div>}
        {compare && <div className="compare">Pinned: {compare.config.scenario} · {compare.run_id} · dotted traces <button onClick={() => setCompare(null)}>Clear comparison</button></div>}
        <div className="metric-grid">{[["Displacement index",result?.metrics.final_displacement.toFixed(3),"Theoretical · no physical units"],["New bone index",result?.metrics.final_bone.toFixed(3),"Net material compartment"],["Organization",result?.metrics.final_organization.toFixed(3),"Assumed structural proxy"],["Functional lifetime",result ? `${result.metrics.lifetime_right_censored ? "≥ " : ""}${result.metrics.functional_lifetime.toFixed(1)}` : undefined,"Threshold-based · model time"]].map(([label,value,desc]) => <article className="metric" key={label}><span>{label}</span><strong>{value || "—"}</strong><small>{desc}</small></article>)}</div>
        <article className="panel plot-panel"><div className="section-heading"><div><div className="eyebrow">MODEL TRAJECTORIES</div><h2>Growth plate dynamics</h2></div><span className="subtle">ODE · LSODA</span></div><div className="tabs" role="tablist" aria-label="Scientific plots">{Object.keys(chartKeys).map(t => <button key={t} role="tab" aria-selected={t===tab} onClick={() => setTab(t)}>{t}</button>)}</div>
          {result ? <Charts result={result} compare={compare} keys={chartKeys[tab]} title={tab} unit={tab === "Populations" ? "Cell abundance" : "Dimensionless index"} /> : <div className="empty"><span className="empty-line" aria-hidden="true">∿</span><h3>Your experiment starts here</h3><p>Choose a scenario and run the model to inspect its trajectories.</p><button onClick={run} disabled={busy}>Run default experiment →</button></div>}
        </article>
        <div className="lower-grid"><article className="panel"><div className="section-heading"><div><div className="eyebrow">SPATIAL CONCEPT</div><h2>Long-bone schematic</h2></div><span className="tag">ILLUSTRATIVE</span></div><div className="bone-view"><Bone displacement={result?.series.displacement[frame] || 0} engineered={(result?.config.scenario || config.scenario)==="engineered"} /><span className="bone-label">{(result?.config.scenario || config.scenario)==="engineered" ? "Engineered compartment" : "Former growth plate location"}</span></div><div className="timeline"><button disabled={!result} onClick={() => { if (result && frame === result.time.length-1) setFrame(0); setPlaying(p => !p); }}>{playing ? "Pause" : "Play"}</button><input aria-label="Illustration model time" type="range" min="0" max={(result?.time.length || 2)-1} value={frame} disabled={!result} onChange={e => { setPlaying(false); setFrame(Number(e.target.value)); }} /><output>{result?.time[frame].toFixed(1) || "0.0"}</output></div><p className="hint inset">Gap uses a bounded visual mapping of displacement. Geometry is illustrative, not an anatomical or mechanical prediction.</p></article>
          <article className="panel model-note"><div className="eyebrow">MODEL TRANSPARENCY</div><h2>Assumptions in view.</h2><p>Cell recruitment, proliferation and differentiation feed a separate cartilage-to-bone material system.</p><ol><li>Normalized compartments; no human calibration.</li><li>Organization and load enter as assumed modifiers.</li><li>No spontaneous tissue creation in mature bone.</li><li>Bone replacement does not itself add displacement.</li></ol><div className="balance"><span>Numerical balance residual</span><strong>{result ? Math.max(result.metrics.cell_balance_error,result.metrics.tissue_balance_error).toExponential(1) : "Awaiting simulation"}</strong><small>Accounting check, not biological validation</small></div></article></div>
        <article className="panel experiment"><div className="section-heading"><div><div className="eyebrow">ONE-FACTOR EXPLORATION</div><h2>Parameter sweep</h2></div></div><div className="sweep-form"><label className="field">Parameter<select value={sweepParameter} onChange={e => setSweepParameter(e.target.value)}>{["proliferation","differentiation","matrix_deposition","ossification","nutrient","loading","scaffold_degradation","senescence"].map(k => <option key={k} value={k}>{k.replaceAll("_"," ")}</option>)}</select></label><label className="field">Values · comma separated<input value={sweepValues} onChange={e => setSweepValues(e.target.value)} /></label><button onClick={runSweep} disabled={busy}>Run sweep →</button></div>{experiment && <><div className="table-wrap"><table><thead><tr><th>Input</th><th>Displacement index</th><th>Organization</th><th>Lifetime</th></tr></thead><tbody>{experiment.rows.map((r,i) => <tr key={i}><td>{r.value}</td><td>{r.metrics.final_displacement.toFixed(4)}</td><td>{r.metrics.final_organization.toFixed(4)}</td><td>{r.metrics.lifetime_right_censored ? "≥ " : ""}{r.metrics.functional_lifetime.toFixed(1)}</td></tr>)}</tbody></table></div><p className="hint">{experiment.summary} Endpoint slope: {experiment.displacement_slope?.toFixed(4) ?? "undefined"}.</p><button onClick={() => download("sweep.json",JSON.stringify(experiment,null,2))}>Export sweep JSON ↓</button></>}</article>
        {result && <details className="panel data"><summary>Trajectory data & model diagnostics</summary>{result.warnings.map(w => <p className="hint" key={w}>{w}</p>)}<p className="hint">Displayed run: {result.config.scenario}, duration {result.config.duration}. Charts and exports reflect this completed run; changed controls apply on the next run.</p><div className="table-wrap"><table><thead><tr><th>Time</th>{chartKeys[tab].map(k => <th key={k}>{k.replaceAll("_"," ")}</th>)}</tr></thead><tbody>{result.time.map((t,i) => <tr key={i}><td>{t.toFixed(2)}</td>{chartKeys[tab].map(k => <td key={k}>{result.series[k][i].toFixed(5)}</td>)}</tr>)}</tbody></table></div></details>}
        <footer>OsteoGenesis AI · Research foundation v0.1.0 <span>Reproducible by configuration. Unvalidated by experiment.</span></footer>
      </section>
    </main>
  </div>;
}
