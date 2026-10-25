import { useState } from 'react'
import { diagnostics, glossary, quiz, weekRoadmap } from './content'
import WeekOneLesson from './WeekOneLesson'
import {
  airyFirstMinimumRadiusUm,
  defocusCircleDiameterUm,
  firstSingleSlitMinimumMm,
  paraxialRayAtSensor,
  singleSlitIntensity,
  solveThinLens,
  transferMatrix,
} from './physics'

const navItems = [
  ['课程正文', '#lesson'],
  ['模拟器', '#labs'],
  ['光路图', '#diagrams'],
  ['诊断', '#diagnostics'],
  ['笔记与术语', '#notes'],
  ['自测', '#quiz'],
]

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-description">{description}</p>
    </div>
  )
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
  format?: (value: number) => string
}) {
  return (
    <label className="range-control">
      <span className="range-label">
        <span>{label}</span>
        <strong>{format ? format(value) : `${value}${unit}`}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      <span className="range-limits"><span>{min}{unit}</span><span>{max}{unit}</span></span>
    </label>
  )
}

function SingleSlitLab() {
  const [slitWidth, setSlitWidth] = useState(50)
  const [wavelength, setWavelength] = useState(550)
  const [distance, setDistance] = useState(1.2)
  const firstMinimum = firstSingleSlitMinimumMm(slitWidth, wavelength, distance)
  const smallAngle = distance * (wavelength * 1e-9 / (slitWidth * 1e-6)) * 1e3
  const span = Math.max(12, firstMinimum * 3.1)
  const chart = { x: 54, y: 20, width: 590, height: 184 }
  const curve = Array.from({ length: 241 }, (_, index) => {
    const xMm = (index / 240 * 2 - 1) * span
    const intensity = singleSlitIntensity(xMm, slitWidth, wavelength, distance)
    const x = chart.x + index / 240 * chart.width
    const y = chart.y + (1 - intensity) * chart.height
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
  const minimumX = chart.x + (firstMinimum / span) * chart.width
  const marks = [
    { x: 54, label: `−${span.toFixed(0)}` },
    { x: 54 + chart.width / 2, label: '0' },
    { x: 54 + chart.width, label: span.toFixed(0) },
  ]

  return (
    <article className="lab-card lab-card-wide">
      <div className="lab-intro">
        <div>
          <div className="lab-kicker"><span className="lab-number">01</span><span>波动光学 · 单色单缝</span></div>
          <h3>狭缝越窄，中央主峰越宽</h3>
          <p>拖动参数，观察屏幕上的归一化强度。这里用 Fraunhofer 单缝公式，并按屏幕坐标反算角度。</p>
        </div>
        <span className="model-badge model-physics">解析模型</span>
      </div>
      <div className="lab-grid">
        <div className="controls-stack">
          <RangeControl label="缝宽 a" value={slitWidth} min={20} max={100} step={1} unit=" µm" onChange={setSlitWidth} />
          <RangeControl label="波长 λ" value={wavelength} min={400} max={700} step={5} unit=" nm" onChange={setWavelength} />
          <RangeControl label="屏距 L" value={distance} min={0.5} max={2} step={0.1} unit=" m" format={(v) => `${v.toFixed(1)} m`} onChange={setDistance} />
          <div className="formula-note">
            <span className="formula-label">使用关系</span>
            <span>I/I₀ = (sin β / β)²</span>
            <span>β = πa sin θ / λ， x = L tan θ</span>
          </div>
        </div>
        <div className="chart-panel">
          <div className="chart-meta"><span>屏幕位置 x（mm）</span><span>相对强度 I / I₀</span></div>
          <svg className="plot" viewBox="0 0 680 252" role="img" aria-label="单缝衍射归一化强度曲线">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = chart.y + (1 - tick) * chart.height
              return <g key={tick}><line x1={chart.x} x2={chart.x + chart.width} y1={y} y2={y} className="plot-grid" /><text x="42" y={y + 4} className="plot-tick" textAnchor="end">{tick.toFixed(2)}</text></g>
            })}
            <line x1={chart.x} x2={chart.x + chart.width} y1={chart.y + chart.height} y2={chart.y + chart.height} className="plot-axis" />
            {[-1, 1].map((sign) => <g key={sign}>
              <line x1={chart.x + sign * (minimumX - (chart.x + chart.width / 2))} x2={chart.x + sign * (minimumX - (chart.x + chart.width / 2))} y1={chart.y + 3} y2={chart.y + chart.height} className="minimum-line" />
            </g>)}
            <path d={curve} className="curve-line" />
            {marks.map((mark) => <g key={mark.label}><line x1={mark.x} x2={mark.x} y1={chart.y + chart.height} y2={chart.y + chart.height + 4} className="plot-axis" /><text x={mark.x} y={chart.y + chart.height + 20} className="plot-tick" textAnchor="middle">{mark.label}</text></g>)}
            <text x={chart.x + chart.width / 2} y="245" className="plot-caption" textAnchor="middle">第一暗纹位置约为 ±{firstMinimum.toFixed(2)} mm</text>
          </svg>
          <div className="result-row">
            <div><span>第一暗纹（精确屏幕坐标）</span><strong>±{firstMinimum.toFixed(3)} mm</strong></div>
            <div><span>小角度估算 λL/a</span><strong>±{smallAngle.toFixed(3)} mm</strong></div>
          </div>
        </div>
      </div>
      <p className="model-limit"><b>适用范围：</b>远场 Fraunhofer、均匀照明的理想单缝、单色标量波。这里没有模拟近场传播、透镜像差、部分相干或像元积分。</p>
    </article>
  )
}

function ApertureLab() {
  const [aperture, setAperture] = useState(10)
  const [focalLength, setFocalLength] = useState(50)
  const [wavelength, setWavelength] = useState(550)
  const [defocus, setDefocus] = useState(1.2)
  const airyRadius = airyFirstMinimumRadiusUm(focalLength, aperture, wavelength)
  const blurDiameter = defocusCircleDiameterUm(focalLength, aperture, defocus)
  const centerY = 130
  const yScale = 15
  const lensX = 195
  const focalX = 505
  const xScale = (focalX - lensX) / focalLength
  const sensorX = lensX + (focalLength + defocus) * xScale
  const edge = aperture / 2
  const rays = [-edge, edge]
  const rayAtSensor = (height: number) => -height * defocus / focalLength

  return (
    <article className="lab-card">
      <div className="lab-intro">
        <div>
          <div className="lab-kicker"><span className="lab-number">02</span><span>有限孔径 · 焦面偏移</span></div>
          <h3>孔径决定衍射尺度，离焦形成弥散圈</h3>
          <p>改变光阑口径和像面位置，比较两个分开的估算：焦面 Airy 首暗环与近轴几何离焦圈。</p>
        </div>
        <span className="model-badge model-physics">两个解析近似</span>
      </div>
      <div className="aperture-visual">
        <svg viewBox="0 0 680 260" role="img" aria-label="圆孔会聚光束与离焦传感器的几何示意">
          <defs><marker id="ray-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#d6754d" /></marker></defs>
          <line x1="60" x2="615" y1={centerY} y2={centerY} className="optical-axis" />
          {rays.map((height) => {
            const edgeY = centerY - height * yScale
            const sensorY = centerY - rayAtSensor(height) * yScale
            return <g key={height}>
              <line x1="70" x2={lensX} y1={edgeY} y2={edgeY} className="ray-line" />
              <line x1={lensX} x2={sensorX} y1={edgeY} y2={sensorY} className="ray-line" markerEnd="url(#ray-arrow)" />
            </g>
          })}
          <path d={`M${lensX},${centerY - edge * yScale - 12} Q${lensX - 14},${centerY - edge * yScale / 2} ${lensX},${centerY} Q${lensX + 14},${centerY + edge * yScale / 2} ${lensX},${centerY + edge * yScale + 12}`} className="lens-shape" />
          <line x1={lensX - 10} x2={lensX + 10} y1={centerY - edge * yScale} y2={centerY - edge * yScale} className="stop-edge" />
          <line x1={lensX - 10} x2={lensX + 10} y1={centerY + edge * yScale} y2={centerY + edge * yScale} className="stop-edge" />
          <circle cx={focalX} cy={centerY} r="4" className="focus-point" />
          <line x1={sensorX} x2={sensorX} y1="28" y2="232" className="sensor-plane" />
          <circle cx={sensorX} cy={centerY} r={Math.max(1.5, blurDiameter / 2 / 1000 * yScale)} className="blur-circle" />
          <text x={lensX} y="22" className="svg-label" textAnchor="middle">理想薄透镜</text>
          <text x={lensX} y="252" className="svg-label" textAnchor="middle">圆孔直径 D</text>
          <text x={focalX} y="22" className="svg-label" textAnchor="middle">焦面 z = f</text>
          <text x={sensorX} y="252" className="svg-label" textAnchor="middle">传感器 z = f + Δz</text>
          <text x="78" y="80" className="svg-caption">平行入射光</text>
          <text x="590" y="112" className="svg-caption" textAnchor="end">几何弥散圈</text>
          <line x1="540" x2="575" y1="116" y2="127" className="annotation-line" />
        </svg>
      </div>
      <div className="lab-grid aperture-grid">
        <div className="controls-stack">
          <RangeControl label="圆孔直径 D" value={aperture} min={4} max={16} step={1} unit=" mm" onChange={setAperture} />
          <RangeControl label="焦距 f" value={focalLength} min={30} max={80} step={1} unit=" mm" onChange={setFocalLength} />
          <RangeControl label="波长 λ" value={wavelength} min={450} max={650} step={10} unit=" nm" onChange={setWavelength} />
          <RangeControl label="像面偏移 Δz" value={defocus} min={-2} max={2} step={0.1} unit=" mm" format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} mm`} onChange={setDefocus} />
        </div>
        <div className="measure-cards">
          <div className="measure-card"><span className="measure-icon airy-icon">○</span><span className="measure-label">焦面衍射 · Airy 首暗环半径</span><strong>{airyRadius.toFixed(2)} <small>µm</small></strong><code>r ≈ 1.22 λf / D</code></div>
          <div className="measure-card"><span className="measure-icon blur-icon">↔</span><span className="measure-label">离焦几何 · 弥散圈直径</span><strong>{blurDiameter.toFixed(1)} <small>µm</small></strong><code>d ≈ D |Δz| / f</code></div>
          <p className="model-limit measure-limit">两项数值描述不同机制，不是合成后的完整 PSF。图中只按几何光线画离焦圈；衍射半径按圆孔 Airy 公式单独计算。</p>
        </div>
      </div>
      <p className="model-limit"><b>适用范围：</b>理想圆孔、单色、标量近轴模型；离焦圈按平行入射的几何光锥估算，忽略像差、遮挡、像元采样和噪声。</p>
    </article>
  )
}

function AbcdLab() {
  const [focalLength, setFocalLength] = useState(50)
  const [objectDistance, setObjectDistance] = useState(150)
  const [aperture, setAperture] = useState(16)
  const [objectHeight, setObjectHeight] = useState(4)
  const [sensorOffset, setSensorOffset] = useState(0)
  const system = solveThinLens(focalLength, objectDistance)
  const imageDistance = system.imageMm
  const sensorDistance = imageDistance + sensorOffset
  const [a, b, c, d] = transferMatrix(focalLength, objectDistance, sensorDistance)
  const lensX = 285
  const horizontalScale = 335 / (objectDistance + imageDistance + sensorOffset)
  const objectX = lensX - objectDistance * horizontalScale
  const sensorX = lensX + sensorDistance * horizontalScale
  const centerY = 154
  const yScale = 7.5
  const rayHeights = [-aperture / 2, 0, aperture / 2]
  const rays = rayHeights.map((lensHeight, index) => ({
    lensHeight,
    ray: paraxialRayAtSensor(focalLength, objectDistance, objectHeight, lensHeight, sensorOffset),
    color: ['#d6754d', '#4d82a4', '#6d8f65'][index],
  }))
  const formatMatrixValue = (value: number) => Math.abs(value) < 1e-9 ? '0' : value.toFixed(4)

  return (
    <article className="lab-card lab-card-wide">
      <div className="lab-intro">
        <div>
          <div className="lab-kicker"><span className="lab-number">03</span><span>几何光学 · 一阶矩阵</span></div>
          <h3>用 ABCD 矩阵检查共轭与放大率</h3>
          <p>移动物面、改变焦距或挪动传感器，观察近轴光线是否在同一位置会聚。</p>
        </div>
        <span className="model-badge model-diagram">几何示意 + 矩阵计算</span>
      </div>
      <div className="ab-canvas">
        <svg viewBox="0 0 680 310" role="img" aria-label="物面、薄透镜、光阑和传感器的近轴光线追迹">
          <line x1="32" x2="648" y1={centerY} y2={centerY} className="optical-axis" />
          {rays.map(({ lensHeight, ray, color }, index) => {
            const startY = centerY - objectHeight * yScale
            const lensY = centerY - lensHeight * yScale
            const finalY = centerY - ray.atSensor * yScale
            return <g key={index}>
              <line x1={objectX} x2={lensX} y1={startY} y2={lensY} stroke={color} className="tracked-ray" />
              <line x1={lensX} x2={sensorX} y1={lensY} y2={finalY} stroke={color} className="tracked-ray" />
            </g>
          })}
          <line x1={objectX} x2={objectX} y1={centerY - objectHeight * yScale - 18} y2={centerY + 8} className="object-plane" />
          <path d={`M${objectX - 8},${centerY + 2} L${objectX},${centerY + 10} L${objectX + 8},${centerY + 2}`} className="object-arrow" />
          <path d={`M${lensX},${centerY - aperture / 2 * yScale - 15} Q${lensX - 15},${centerY - 18} ${lensX},${centerY} Q${lensX + 15},${centerY + 18} ${lensX},${centerY + aperture / 2 * yScale + 15}`} className="lens-shape" />
          <line x1={lensX - 14} x2={lensX + 14} y1={centerY - aperture / 2 * yScale} y2={centerY - aperture / 2 * yScale} className="stop-edge" />
          <line x1={lensX - 14} x2={lensX + 14} y1={centerY + aperture / 2 * yScale} y2={centerY + aperture / 2 * yScale} className="stop-edge" />
          <line x1={sensorX} x2={sensorX} y1="34" y2="278" className="sensor-plane" />
          <circle cx={sensorX} cy={centerY - system.magnification * objectHeight * yScale} r="4" className="focus-point" />
          <text x={objectX} y="34" className="svg-label" textAnchor="middle">物面</text>
          <text x={lensX} y="34" className="svg-label" textAnchor="middle">薄透镜 + 光阑</text>
          <text x={sensorX} y="34" className="svg-label" textAnchor="middle">像面 {sensorOffset === 0 ? '' : `${sensorOffset > 0 ? '+' : ''}${sensorOffset.toFixed(0)} mm`}</text>
          <text x={objectX + 12} y={centerY - objectHeight * yScale - 5} className="svg-caption">物高 y</text>
          <text x="630" y="293" className="svg-caption" textAnchor="end">横向压缩显示；角度未按比例绘制</text>
        </svg>
      </div>
      <div className="lab-grid abcd-grid">
        <div className="controls-stack">
          <RangeControl label="焦距 f" value={focalLength} min={30} max={80} step={1} unit=" mm" onChange={setFocalLength} />
          <RangeControl label="物距 u" value={objectDistance} min={90} max={300} step={1} unit=" mm" onChange={setObjectDistance} />
          <RangeControl label="光阑直径 D" value={aperture} min={6} max={24} step={1} unit=" mm" onChange={setAperture} />
          <RangeControl label="物高 y" value={objectHeight} min={1} max={6} step={0.5} unit=" mm" format={(v) => `${v.toFixed(1)} mm`} onChange={setObjectHeight} />
          <RangeControl label="传感器偏离像面" value={sensorOffset} min={-20} max={20} step={1} unit=" mm" format={(v) => `${v > 0 ? '+' : ''}${v} mm`} onChange={setSensorOffset} />
        </div>
        <div className="matrix-panel">
          <div className="matrix-heading"><span>系统矩阵</span><small>T(v) · L(f) · T(u)</small></div>
          <div className="matrix-equation"><span className="matrix-bracket">[</span><div className="matrix-values"><span>{formatMatrixValue(a)}</span><span className={Math.abs(b) < 1e-8 ? 'zero-value' : ''}>{formatMatrixValue(b)} mm</span><span>{formatMatrixValue(c)} / mm</span><span>{formatMatrixValue(d)}</span></div><span className="matrix-bracket">]</span><span className="matrix-vector">[ y<br /> θ ]</span><span className="matrix-equals">= [ y′<br /> θ′ ]</span></div>
          <div className="result-row abcd-results">
            <div><span>薄透镜像距 v</span><strong>{imageDistance.toFixed(2)} mm</strong></div>
            <div><span>横向放大率 m = −v/u</span><strong>{system.magnification.toFixed(3)}</strong></div>
          </div>
          <div className="matrix-insight"><span className={Math.abs(b) < 1e-8 ? 'status-dot good' : 'status-dot'} />B = {Math.abs(b) < 1e-8 ? '0' : b.toFixed(3)} mm <span>{Math.abs(b) < 1e-8 ? '此时物面与像面共轭' : 'B 偏离 0，光线高度仍依赖入射角'}</span></div>
        </div>
      </div>
      <p className="model-limit"><b>适用范围：</b>近轴一阶几何光学。矩阵元素按光线向量 [y, θ]；T(u) 表示传播 u，L(f) 表示理想薄透镜，系统矩阵为 T(v)L(f)T(u)。它能检查对焦与放大率，不能单独预测球差、彗差或衍射斑。</p>
    </article>
  )
}

function PathDiagram({ kind }: { kind: 'sensor' | 'projector' }) {
  if (kind === 'sensor') {
    return (
      <svg viewBox="0 0 760 230" role="img" aria-label="标记成像传感器测量链路示意图">
        <defs><marker id="diagram-arrow-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#637c71" /></marker></defs>
        <line x1="95" y1="112" x2="663" y2="112" className="diagram-beam" markerEnd="url(#diagram-arrow-a)" />
        <rect x="34" y="78" width="76" height="68" rx="12" className="diagram-box diagram-source" />
        <circle cx="72" cy="112" r="13" className="source-core" />
        <text x="72" y="166" className="diagram-label" textAnchor="middle">照明</text>
        <rect x="174" y="83" width="82" height="58" rx="8" className="diagram-box" />
        <path d="M188 126 L201 96 L214 126 L227 96 L241 126" className="target-mark" />
        <text x="215" y="166" className="diagram-label" textAnchor="middle">标记 / 目标</text>
        <path d="M351 54 Q321 112 351 170 M368 54 Q398 112 368 170" className="diagram-lens" />
        <text x="360" y="194" className="diagram-label" textAnchor="middle">成像光路</text>
        <rect x="328" y="62" width="63" height="10" rx="3" className="diagram-stop" />
        <text x="360" y="42" className="diagram-small" textAnchor="middle">光阑 / 入瞳</text>
        <rect x="493" y="72" width="14" height="80" rx="3" className="diagram-sensor" />
        <line x1="500" y1="80" x2="500" y2="145" className="pixel-lines" />
        <text x="500" y="174" className="diagram-label" textAnchor="middle">探测器</text>
        <rect x="603" y="80" width="108" height="64" rx="11" className="diagram-box diagram-algorithm" />
        <path d="M625 121 L642 105 L654 114 L680 93" className="algorithm-curve" />
        <text x="657" y="166" className="diagram-label" textAnchor="middle">估计算法</text>
        <text x="379" y="222" className="diagram-caption" textAnchor="middle">光学像差在成像光路；采样 / 噪声在探测；ROI / 拟合在算法</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 760 230" role="img" aria-label="光刻投影物镜与像差测量传感器之间的概念关系图">
      <defs><marker id="diagram-arrow-b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#637c71" /></marker></defs>
      <line x1="112" y1="108" x2="648" y2="108" className="diagram-beam" markerEnd="url(#diagram-arrow-b)" />
      <rect x="45" y="75" width="93" height="67" rx="10" className="diagram-box" />
      <path d="M62 120 L72 94 L82 120 L92 94 L103 120 L117 94" className="target-mark" />
      <text x="91" y="164" className="diagram-label" textAnchor="middle">物 / 掩模端</text>
      <path d="M248 50 Q219 108 248 166 M267 50 Q296 108 267 166" className="diagram-lens projector-lens" />
      <path d="M282 50 Q311 108 282 166 M301 50 Q330 108 301 166" className="diagram-lens projector-lens" />
      <text x="275" y="191" className="diagram-label" textAnchor="middle">被测投影物镜</text>
      <rect x="430" y="73" width="114" height="70" rx="10" className="diagram-box diagram-sensorbox" />
      <circle cx="458" cy="106" r="9" className="sensor-wave" /><circle cx="486" cy="106" r="9" className="sensor-wave" /><circle cx="514" cy="106" r="9" className="sensor-wave" />
      <text x="487" y="164" className="diagram-label" textAnchor="middle">像差测量传感器</text>
      <rect x="603" y="76" width="112" height="64" rx="10" className="diagram-box diagram-algorithm" />
      <path d="M620 119 Q637 92 653 119 T687 105" className="algorithm-curve" />
      <text x="659" y="164" className="diagram-label" textAnchor="middle">波前 / 信号估计</text>
      <text x="380" y="220" className="diagram-caption" textAnchor="middle">概念关系示意；不同设备的传感器结构与内部光路需查其公开资料</text>
    </svg>
  )
}

function QuizSection() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const correctCount = quiz.reduce((count, item, index) => count + (answers[index] === item.answer ? 1 : 0), 0)
  const answeredCount = Object.keys(answers).length
  return (
    <section className="quiz-section" id="quiz">
      <div className="quiz-header">
        <div><p className="eyebrow">自测 · 即时反馈</p><h2>先预测，再看解释</h2><p>共 {quiz.length} 题。选项提交后立即显示解析；分数只在本页计算，不会上传或保存。</p></div>
        <div className="score-card"><span>当前得分</span><strong>{correctCount}<small> / {quiz.length}</small></strong><em>{answeredCount === quiz.length ? '已完成' : `已答 ${answeredCount} 题`}</em></div>
      </div>
      <div className="quiz-list">
        {quiz.map((item, index) => {
          const selected = answers[index]
          return <article className="question-card" key={item.question}>
            <div className="question-index">Q{String(index + 1).padStart(2, '0')}</div>
            <div className="question-body"><h3>{item.question}</h3>
              <div className="answer-options">
                {item.options.map((option, optionIndex) => {
                  const isChosen = selected === optionIndex
                  const answerClass = selected === undefined ? '' : optionIndex === item.answer ? ' correct' : isChosen ? ' incorrect' : ''
                  return <button key={option} type="button" className={`answer-option${isChosen ? ' selected' : ''}${answerClass}`} onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} aria-pressed={isChosen}>
                    <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected !== undefined && optionIndex === item.answer && <span className="answer-mark">正确</span>}
                  </button>
                })}
              </div>
              {selected !== undefined && <p className={`answer-explanation ${selected === item.answer ? 'is-correct' : 'is-incorrect'}`}><b>{selected === item.answer ? '答对了。' : '这题再看一遍。'}</b> {item.explanation}</p>}
            </div>
          </article>
        })}
      </div>
      {answeredCount > 0 && <button className="text-button" type="button" onClick={() => setAnswers({})}>重新开始自测 <span aria-hidden="true">↗</span></button>}
    </section>
  )
}

function App() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="光学测量学习首页"><span className="brand-mark"><i /><i /><i /></span><span>光学测量学习<small>OPTICAL METROLOGY · WEEK 01</small></span></a>
        <nav aria-label="主导航">{navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
        <a className="topbar-cta" href="#lesson">打开课程正文 <span>↗</span></a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" />第 1 周 · 传感成像光路与像差概念</p>
            <h1>把一个光点，<br /><em>看成一条测量链。</em></h1>
            <p className="hero-lede">从目标、光路到探测器，拆开理想像为什么会变成真实的斑。用参数可调的演示建立直觉，再用公式和对照检查结论。</p>
            <div className="hero-actions"><a className="button-primary" href="#lesson">开始课程学习 <span>↓</span></a><a className="button-quiet" href="#labs">再做参数仿真 <span>↗</span></a></div>
            <div className="hero-meta"><span><b>12 小时</b> 本周必做时间</span><span><b>08 节</b> 课程正文</span><span><b>01 / 12</b> 学习进度</span></div>
          </div>
          <div className="hero-art" aria-label="光束通过光阑并在传感器面形成光斑的示意">
            <div className="art-topline"><span>OPTICAL PATH / 01</span><span>SCHEMATIC</span></div>
            <svg viewBox="0 0 550 390" role="img" aria-label="平行光通过有限孔径后会聚到焦面">
              <defs>
                <linearGradient id="beam-fill" x1="0" x2="1"><stop offset="0" stopColor="#d6754d" stopOpacity="0.03" /><stop offset="0.68" stopColor="#d6754d" stopOpacity="0.22" /><stop offset="1" stopColor="#f2b88f" stopOpacity="0.07" /></linearGradient>
                <radialGradient id="spot-glow"><stop offset="0" stopColor="#ffe2c8" /><stop offset="0.3" stopColor="#d6754d" stopOpacity="0.7" /><stop offset="1" stopColor="#d6754d" stopOpacity="0" /></radialGradient>
              </defs>
              <path d="M28 122 L394 178 L394 212 L28 268 Z" fill="url(#beam-fill)" />
              {[122,151,180,209,238,267].map((y) => <line key={y} x1="28" x2="394" y1={y} y2="195" className="hero-ray" />)}
              <line x1="28" x2="490" y1="195" y2="195" className="hero-axis" />
              <path d="M296 74 Q267 195 296 316 M312 74 Q341 195 312 316" className="hero-lens" />
              <path d="M284 85 L324 85 M284 305 L324 305" className="hero-stop" />
              <line x1="404" x2="404" y1="68" y2="322" className="hero-sensor" />
              <circle cx="404" cy="195" r="37" fill="url(#spot-glow)" />
              <circle cx="404" cy="195" r="5" className="hero-spot" />
              <text x="80" y="102" className="art-label">入射光</text>
              <text x="304" y="350" className="art-label" textAnchor="middle">有限孔径</text>
              <text x="404" y="350" className="art-label" textAnchor="middle">探测面</text>
              <text x="480" y="178" className="art-note" textAnchor="end">PSF</text>
              <circle cx="82" cy="195" r="2" className="art-star" /><circle cx="112" cy="195" r="2" className="art-star" /><circle cx="142" cy="195" r="2" className="art-star" />
            </svg>
            <div className="art-caption"><span>理想点像也有有限尺寸</span><span>01 — 03</span></div>
          </div>
          <div className="hero-bottomline"><span>本周问题</span><p>像差与“没对准焦点”分别改变什么？哪些观测又可能来自探测器或算法？</p><span className="scroll-cue">向下探索 ↓</span></div>
        </section>

        <section className="week-map" aria-label="十二周学习进度">
          <div className="week-map-head"><span>12 周学习路线</span><span>当前归档 <b>01 / 12</b></span></div>
          <div className="week-progress"><span /></div>
          <div className="week-labels"><span>第 1 周 · 本周已整理</span><span>下一步：第 2 周 波前与衍射点像</span><span>12 周 · 144–180 小时</span></div>
          <div className="roadmap-grid">{weekRoadmap.map((week, index) => <div className={`roadmap-item${index === 0 ? ' active' : ''}`} key={week}><span>W{String(index + 1).padStart(2, '0')}</span><p>{week}</p>{index === 0 && <i>已归档</i>}</div>)}</div>
          <p className="roadmap-note">路线依据《12 周光刻机光学原理与问题定位基础学习计划》（2026-10-20）。这份交付只整理第 1 周；第 2 周及之后不在本归档内展开。<a href="https://github.com/6shanyuan/optics-lab/blob/main/optical-metrology/roadmap/12%E5%91%A8%E5%85%89%E5%AD%A6%E5%8E%9F%E7%90%86%E4%B8%8E%E9%97%AE%E9%A2%98%E5%AE%9A%E4%BD%8D%E5%AD%A6%E4%B9%A0%E8%AE%A1%E5%88%92.md" target="_blank" rel="noreferrer">查看完整学习计划 ↗</a></p>
        </section>

        <section className="learning-frame">
          <div className="frame-label"><span>THE LEARNING FRAME</span><span>01 / 03</span></div>
          <div className="frame-grid">
            <div className="frame-lead"><p className="eyebrow">先建立边界</p><h2>同一个“斑”，<br />可能来自不同环节。</h2><p>定位异常前，先标出信号经过的每一层。改变一层时固定其他条件，才能知道观察到的变化由什么带来。</p></div>
            <div className="layer-list">
              <div className="layer-row"><span className="layer-index">01</span><div><b>光学光路</b><p>离焦、球差、彗差、像散会改变波前或点像。</p></div><span className="layer-tag">成像前</span></div>
              <div className="layer-row"><span className="layer-index">02</span><div><b>光电探测</b><p>像元积分、欠采样、噪声和饱和会改变记录下来的数据。</p></div><span className="layer-tag">采样时</span></div>
              <div className="layer-row"><span className="layer-index">03</span><div><b>估计算法</b><p>ROI、阈值、背景处理和拟合会改变最终位置或参数。</p></div><span className="layer-tag">处理后</span></div>
              <div className="frame-rule"><span>判断顺序</span><b>先描述现象 → 再比较模型 → 最后讨论根因</b></div>
            </div>
          </div>
        </section>

        <WeekOneLesson />

        <section className="labs-section" id="labs">
          <SectionHeading eyebrow="交互仿真 · 参数即时响应" title="让公式变成可观察的变化" description="以下小模型用于建立直觉。它们各自写明近似条件，图形示意不等于真实设备仿真。" />
          <div className="labs-stack"><SingleSlitLab /><ApertureLab /><AbcdLab /></div>
        </section>

        <section className="diagrams-section" id="diagrams">
          <SectionHeading eyebrow="测量链路 · 两种系统边界" title="传感器光路不等于被测投影物镜" description="先说明哪段光路产生观测，再说测量结果支持什么判断。第二张图只表达功能关系，不复现具体设备内部结构。" />
          <div className="diagram-grid">
            <article className="diagram-card"><div className="diagram-heading"><span className="diagram-index">A</span><div><h3>标记成像传感器</h3><p>光从照明到算法，逐层形成可分析的信号。</p></div><span className="model-badge model-diagram">教学示意</span></div><div className="diagram-stage"><PathDiagram kind="sensor" /></div><div className="diagram-legend"><span><i className="legend-dot optical-dot" />成像光路</span><span><i className="legend-dot sensor-dot" />探测器采样</span><span><i className="legend-dot algo-dot" />估计处理</span><a className="diagram-download" href={`${import.meta.env.BASE_URL}figures/sensor-imaging-chain.svg`} download>下载 SVG ↗</a></div></article>
            <article className="diagram-card"><div className="diagram-heading"><span className="diagram-index">B</span><div><h3>投影像差测量关系</h3><p>被测物镜与像差测量传感器是两个角色。</p></div><span className="model-badge model-diagram">概念示意</span></div><div className="diagram-stage"><PathDiagram kind="projector" /></div><div className="diagram-legend"><span><i className="legend-dot optical-dot" />被测光学系统</span><span><i className="legend-dot sensor-dot" />测量观测端</span><span><i className="legend-dot algo-dot" />参数估计</span><a className="diagram-download" href={`${import.meta.env.BASE_URL}figures/projector-aberration-sensing.svg`} download>下载 SVG ↗</a></div></article>
          </div>
          <aside className="boundary-callout"><span className="callout-icon">↗</span><p><b>不要把示意当成设备结构。</b>不同光刻传感器可能是成像、干涉、衍射或其他结构；本图不声称复现特定机台。</p><a href="#notes">查看模型边界 <span>↗</span></a></aside>
        </section>

        <section className="diagnostics-section" id="diagnostics">
          <div className="diagnostic-top"><div><p className="eyebrow">五类常见观测 · 首轮排查</p><h2>描述异常，再列出候选。</h2><p>每项检查都尽量让不同候选给出不同预测。仅凭外观不直接下机械根因结论。</p></div><div className="diagnostic-stamp"><span>OBSERVE</span><b>≠</b><span>ROOT CAUSE</span></div></div>
          <div className="diagnostic-table-wrap"><table className="diagnostic-table"><thead><tr><th>观察到的现象</th><th>先保留的候选原因</th><th>优先追加的对照</th><th>判断边界</th></tr></thead><tbody>{diagnostics.map((row, index) => <tr key={row.symptom}><td><span className="table-index">0{index + 1}</span><b>{row.symptom}</b></td><td>{row.candidates}</td><td>{row.check}</td><td className="caution-cell">{row.caution}</td></tr>)}</tbody></table></div>
          <p className="table-footnote">本表是软件学习用的诊断起点。真实设备操作需遵守对应设备的授权与操作规程。</p>
        </section>

        <section className="notes-section" id="notes">
          <SectionHeading eyebrow="学习档案 · 可持续补充" title="把本周的判断依据留下来" description="保存公式、变量单位和证据边界，让后续复盘能还原当时的条件。" />
          <div className="notes-grid">
            <article className="notes-card main-notes"><div className="notes-card-head"><span className="card-symbol">01</span><span className="notes-type">学习笔记 · 第 1 周</span><span className="notes-date">基础版</span></div><h3>理想点为什么会变成斑？</h3><p>成像系统把物点映射到像面，但有限孔径带来衍射。离焦会让几何光线不在像面相交；高阶像差则是波前或成像偏离选定理想参考模型。探测器噪声、欠采样和算法处理也会改变观测结果，它们不应统称为像差。</p><div className="note-equations"><div><span>薄透镜成像</span><code>1/f = 1/u + 1/v</code><small>u、v、f 使用同一长度单位；这里按实物距、实像距取正值。</small></div><div><span>横向放大率</span><code>m = y′/y = −v/u</code><small>负号表示实像相对物体倒置。</small></div><div><span>单缝第一暗纹</span><code>a sin θ = λ　⇒　x₁ ≈ λL/a</code><small>最后一步使用小角度近似；数值曲线用精确屏幕几何。</small></div></div><div className="notes-conclusion"><span>本周结论</span><b>近轴模型检查一阶几何关系；它不能预测彗差等高阶像差。</b></div></article>
            <article className="notes-card notebook-card"><div className="notes-card-head"><span className="card-symbol notebook-symbol">⌘</span><span className="notes-type">Jupyter Notebook</span><span className="notes-date">可运行</span></div><h3>从公式到数值检查</h3><p>Notebook 包含单缝曲线、薄透镜 ABCD 矩阵、孔径衍射尺度与离焦弥散圈公式，可在本地复算本页默认参数。</p><div className="notebook-preview"><span>week1_abcd_optics.ipynb</span><code>λ = 550 nm　a = 50 μm　L = 1.2 m<br />v = 75 mm　m = −0.5<br />Airy radius ≈ 3.36 μm</code></div><a className="download-link" href={`${import.meta.env.BASE_URL}notebooks/week1_abcd_optics.ipynb`} download>下载 Notebook <span>↓</span></a><small className="download-help">需要 Python、NumPy、Matplotlib 和 Jupyter。</small></article>
          </div>
          <div className="glossary-block"><div className="glossary-heading"><div><p className="eyebrow">术语表 · 中英对照</p><h3>先统一变量和概念</h3></div><span>15 TERMS</span></div><div className="glossary-list">{glossary.map((term) => <details className="glossary-item" key={term.en}><summary><span className="term-en">{term.en}</span><b>{term.zh}</b><span className="expand-mark">+</span></summary><p>{term.desc}</p></details>)}</div></div>
          <div className="reflection-card"><div className="reflection-index">REFLECTION<br />01 / 01</div><div><p className="eyebrow">反思题</p><h3>目标上下移动时，图像中心也发生移动。下一步检查什么？</h3><p>先检查远心性、主光线角度或光轴倾斜等几何因素，再看焦点变化和点像形状。仅凭位置变化不能直接判定彗差。</p></div><span className="reflection-mark">?</span></div>
        </section>

        <QuizSection />

        <section className="references-section">
          <div><p className="eyebrow">模型核对 · 参考资料</p><h2>从课程讲义核对公式</h2><p>页面的演示数字是可复现的教学示例，不是设备指标。</p></div>
          <ul>
            <li><a href="https://ocw.mit.edu/courses/2-71-optics-spring-2014/pages/lecture-notes/" target="_blank" rel="noreferrer">MIT OCW · 2.71 Optics，几何成像与近轴光学 <span>↗</span></a></li>
            <li><a href="https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_%28OpenStax%29/University_Physics_III_-_Optics_and_Modern_Physics_%28OpenStax%29/04%253A_Diffraction/4.03%253A_Intensity_in_Single-Slit_Diffraction" target="_blank" rel="noreferrer">OpenStax · 单缝衍射强度与暗纹条件 <span>↗</span></a></li>
            <li><a href="https://vite.dev/guide/static-deploy" target="_blank" rel="noreferrer">Vite · GitHub Pages 静态部署说明 <span>↗</span></a></li>
            <li><a href="https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages" target="_blank" rel="noreferrer">GitHub Docs · 使用 Actions 发布 Pages <span>↗</span></a></li>
          </ul>
          <p className="verification-note">默认参数复核：f = 50 mm、u = 150 mm → v = 75 mm、m = −0.5；λ = 550 nm、a = 50 μm、L = 1.2 m → 第一暗纹精确几何值约 13.201 mm；λ = 550 nm、f = 50 mm、D = 10 mm → Airy 首暗环半径约 3.355 μm。</p>
        </section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><i /><i /><i /></span><span>光学测量学习<small>ARCHIVE / WEEK 01</small></span></a><p>软件教学模型 · 2026</p><a href="#top">回到顶部 ↑</a></footer>
    </div>
  )
}

export default App
