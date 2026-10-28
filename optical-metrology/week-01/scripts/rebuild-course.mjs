import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// 原稿只读；修改整理规则后，运行本脚本同步网站与可下载讲义。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(resolve(root, 'archive/第一周教学逐字稿.md'))
const sourceSha256 = createHash('sha256').update(source).digest('hex')
const lines = source.toString('utf8').split(/\r?\n/)
if (lines.slice(0, 152).join('\n') !== lines.slice(152, 304).join('\n')) {
  throw new Error('原稿开头重复段发生变化，请重新核对分章行号。')
}

const repairedMath = new Map([
  [736, String.raw`P(\rho,\theta)=\begin{cases}1,&\rho\leq1\\0,&\rho>1\end{cases}`],
  [778, String.raw`\begin{bmatrix}y\\\theta\end{bmatrix}`],
  [793, String.raw`\begin{bmatrix}y_2\\\theta_2\end{bmatrix}=\underbrace{\begin{bmatrix}1&L\\0&1\end{bmatrix}}_{\text{自由传播矩阵}}\begin{bmatrix}y_1\\\theta_1\end{bmatrix}`],
  [797, String.raw`\begin{bmatrix}y_2\\\theta_2\end{bmatrix}=\underbrace{\begin{bmatrix}1&0\\-1/f&1\end{bmatrix}}_{\text{薄透镜矩阵}}\begin{bmatrix}y_1\\\theta_1\end{bmatrix}`],
  [811, String.raw`M=\begin{bmatrix}1&v\\0&1\end{bmatrix}\begin{bmatrix}1&0\\-1/f&1\end{bmatrix}\begin{bmatrix}1&u\\0&1\end{bmatrix}`],
  [815, String.raw`M=\begin{bmatrix}1-v/f&u+v-uv/f\\-1/f&1-u/f\end{bmatrix}`],
  [888, String.raw`\boxed{\begin{aligned}y_2&=y_1+L\theta_1\\\theta_2&=\theta_1\end{aligned}}`],
  [923, String.raw`M=\begin{bmatrix}A&B\\C&D\end{bmatrix}`],
  [933, String.raw`M=\begin{bmatrix}1-v/f&u+v-uv/f\\-1/f&1-u/f\end{bmatrix}`],
  [937, String.raw`\underbrace{\begin{bmatrix}A&B\\C&D\end{bmatrix}}_{\text{通用形式}}=\underbrace{\begin{bmatrix}1-v/f&u+v-uv/f\\-1/f&1-u/f\end{bmatrix}}_{\text{实际计算结果}}`],
  [947, String.raw`\begin{bmatrix}y_2\\\theta_2\end{bmatrix}=\begin{bmatrix}A&B\\C&D\end{bmatrix}\begin{bmatrix}y_1\\\theta_1\end{bmatrix}`],
  [1028, String.raw`M=\begin{bmatrix}-0.5&0\\-0.02&-2\end{bmatrix}`],
])

const python = `import numpy as np
import matplotlib.pyplot as plt

# 单位：mm；角度：rad
f, u, v = 50.0, 150.0, 75.0

def free_space(distance):
    return np.array([[1.0, distance], [0.0, 1.0]])

def thin_lens(focal_length):
    return np.array([[1.0, 0.0], [-1.0 / focal_length, 1.0]])

M = free_space(v) @ thin_lens(f) @ free_space(u)
print("系统矩阵：", M, sep="\\n")
print("B =", M[0, 1])
for theta in np.linspace(-0.02, 0.02, 5):
    ray_out = M @ np.array([0.0, theta])
    print(f"入射角={theta:.3f} rad, 像面高度={ray_out[0]:.6f} mm")
`

function normalize(start, end) {
  return lines.slice(start - 1, end).map((line, index) => {
    const number = start + index
    const readouts = new Map([
      [111, [125, '| 课堂界面参数 | 记录值 |\n| --- | --- |\n| 探测器位置 v | 110 mm |\n| 入射光束半径（示意） | 14 单位 |\n| 相对理想像面偏移 | +10 mm |\n| 几何光斑直径（示意） | 2.80 单位 |']],
      [352, [366, '| 课堂界面参数 | 记录值 |\n| --- | --- |\n| 孔径直径 D | 5.0 mm |\n| 离焦量 Δz | 0.00 mm |\n| 衍射斑半径 | 6.71 μm |\n| 几何离焦半径 | 0.00 μm |']],
      [568, [580, '| 课堂界面参数 | 记录值 |\n| --- | --- |\n| 狭缝宽度 a | 10 μm |\n| 波长 λ | 550 nm |\n| 首暗纹 sinθ | 0.0550 |\n| 对应角度 | 约 3.15° |']],
      [1053, [1067, '| 课堂界面参数 | 记录值 |\n| --- | --- |\n| 探测器像距 v | 75 mm |\n| 透镜处通光孔径 D | 8 mm |\n| 矩阵元素 B | 0.0 mm |\n| 几何光斑直径 | 0.0 μm |']],
    ])
    for (const [first, [last, table]] of readouts) {
      if (number === first) return table
      if (number > first && number <= last) return ''
    }
    if (repairedMath.has(number)) return '\n$$\n' + repairedMath.get(number) + '\n$$\n'
    // 聊天内的临时图片代理仅保存在原稿，课程使用仓库中的概念图。
    if (/^\[.*\]\(https?:/.test(line)) return ''
    if (/^#+ [+-]?\d+(?:\.\d+)?(?: (?:µm|mm))?$/.test(line)) return line.replace(/^#+ /, '**') + '**'
    if (/^(提交答案|检查答案|查看解析|检查计算结果|恢复理想对焦|学习进度0\/5)$/.test(line)) return ''
    if (number === 1023) return python.trimEnd()
    if (line.startsWith(String.raw`\\[`)) {
      return '\n$$\n' + line.slice(3, -3).trim().replaceAll(String.raw`\_`, '_') + '\n$$\n'
    }
    return line.replaceAll(String.raw`\\(`, '$').replaceAll(String.raw`\\)`, '$')
      .replaceAll(String.raw`\*`, '*').replaceAll(String.raw`\&`, '&')
      .replace(/^(#+)/, (hashes) => '#'.repeat(Math.min(hashes.length + 1, 4)))
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const chapters = [
  { id: 'point', title: '一个理想的点，为什么会变成光斑？', start: 45, end: 152,
    objective: '区分衍射、像面离焦和高阶像差，复算 50 mm 透镜的成像位置。',
    note: '课堂的“14 单位、2.80”是示意坐标。若把孔径半径定义为 14 个同一横向单位，则 2×14×10/100=2.80；这些数字不能当作设备光斑的微米实测值。物距 100 mm 时像距为 100 mm，有限共轭的离焦圈用像距 v 作分母。',
    lab: '在 ABCD 模拟器设置 f=50 mm、u=100 mm、探测器偏移 +10 mm；比较准确对焦与离焦。' },
  { id: 'aperture', title: '光阑、入瞳与视场', start: 305, end: 448,
    objective: '分清一个物点的光锥与多个物点的视场，观察孔径与离焦的相反趋势。',
    note: '原文 r≈1.22λf/D 对应近轴后焦面、均匀无像差圆瞳。有限物距时应由像方 NA 或出瞳几何确定尺度，不能把任意机械孔径直接代入。原稿提到的“合成半径”属于旧教学示意；当前页面独立报告 Airy 半径与几何离焦直径。',
    lab: '孔径实验设置 f=50 mm、λ=550 nm、D=5 mm、Δz=0，再改为 Δz=0.1 mm 并增大 D。' },
  { id: 'diffraction', title: '衍射的物理本质：次级波、相位与单缝', start: 449, end: 617,
    objective: '从相干电场叠加理解明暗条纹，计算单缝第一暗纹和 Airy 半径。',
    note: '干涉式中的 I₀ 指每一束光单独存在时的平均强度；单缝式 I(0) 则是中央最大值，二者不要混用。小角度近似 θ≈λ/a 的 θ 必须以 rad 表示。屏幕位置的精确几何换算不改变 Fraunhofer 模型本身的近似性质。',
    lab: '在单缝实验依次设置 a=20、10、2 μm，固定 λ=550 nm；查看 sinθ 横轴，观察角宽变化。' },
  { id: 'stop-grating', title: '光阑是光栅吗？', start: 618, end: 678,
    objective: '区分有限通光边界和周期结构，理解“产生衍射”不等于“它是光栅”。',
    note: '光栅式采用相同介质中的有符号角度约定；不同教材可能使用加号形式。m 为整数，且传播级次须满足 |sinθₘ|≤1。本周只建立概念，不展开真实对准标记的电磁响应。' },
  { id: 'pupil', title: '入瞳、出瞳与瞳函数', start: 679, end: 767,
    objective: '从等效孔径走到振幅与相位，为波前、PSF 和测量信号建立联系。',
    note: 'P=Aeⁱφ 中 A 是振幅透过率。若 W 为长度单位的光程差，则 φ=2πW/λ；若 W 用“波数”表示，则 φ=2πW。原文 Zernike 写法采用单位圆实基的归一化形式，c_d、c_c 与 W 同单位；θ 是瞳面方位角，不是 ABCD 光线倾角。本周保留概念引入，尚未实现波前传播或 Zernike 反演。' },
  { id: 'abcd', title: '近轴光线追迹与 ABCD 矩阵', start: 768, end: 849,
    objective: '写出自由传播与薄透镜矩阵，推导薄透镜公式及放大率。',
    note: '约定光由左向右，u、v 为本课实物实像的正距离，y 和 θ 为有符号坐标。按列向量 [y,θ] 追迹，最先发生的传播写在乘积最右侧。A、D 无量纲，B 单位 mm，C 单位 mm⁻¹。' },
  { id: 'questions', title: '课堂追问：θ 为什么不变，B 在哪里？', start: 850, end: 985,
    objective: '补齐从光线位置和方向到“B=0 成像”的每一步理由。',
    note: '5°=0.087266 rad；传播 100 mm 时，近轴高度增量为 8.72665 mm，精确直线几何为 100tan5°≈8.74887 mm。方向不变是均匀介质中的直线传播性质，位置式 y₂=y₁+Lθ₁ 则另外使用了小角度近似。' },
  { id: 'python', title: '让公式运行：Python 矩阵实验', start: 986, end: 1046,
    objective: '运行修复后的课堂代码，复算 v=75、80 mm 与 u=100 mm 的对照。',
    note: '原稿 Python 代码在导出时连成一行；这里恢复为可运行代码，算法保持原意。u=150、f=50、v=80 时 B=−10 mm；u=100 时正确像距是 100 mm。下载的 Notebook 已补入相同的课堂参数与结果。' },
  { id: 'b-lab', title: '把像距、孔径与 B 对到同一张光线图', start: 1047, end: 1085,
    objective: '用交互对照观察 B 偏离零后，同一物点的光线如何分散。',
    note: '固定 f=50、u=150 mm、轴上物点，v=90 mm 时 B=−30 mm。若透镜处 D=8 mm，则几何光斑直径 D|1−v/75|=1.6 mm=1600 μm。这里分母是理想像距 75 mm；平行入射焦面实验的分母才是 f。',
    lab: 'ABCD 实验按“课堂：准确对焦”和“课堂：v=90 mm”切换，再增加 D；读出 B 和几何光斑直径。' },
  { id: 'diagnosis', title: '从图像异常反推光学问题', start: 1086, end: 1243,
    objective: '学习五类异常、五种对照实验，以及观测、模型解释、物理根因的证据层次。',
    note: '原文末尾“尚未形成独立 Notebook”描述课堂当时的状态。本归档现已提供可运行 Notebook；归档完成不能证明学习者已经独立完成实验或通过验收。案例的优先假设是各视场最佳焦面不一致，还应区分场曲、像面倾斜及其他场依赖效应。' },
]

const intro = normalize(1, 44)
for (const chapter of chapters) {
  chapter.markdown = normalize(chapter.start, chapter.end)
  if (chapter.id === 'point') {
    chapter.markdown = chapter.markdown.replace('先看一个简化的成像系统：', '先看一个简化的成像系统：\n\n![教学标记成像链路](figures/sensor-imaging-chain.svg)')
      .replace('理想衍射斑\n\n离焦光斑\n\n彗差光斑', '![光斑形状直觉：教学示意，非定量 PSF](figures/point-spread-shapes.svg)')
  }
  if (chapter.id === 'diffraction') {
    chapter.markdown = chapter.markdown.replace('惠更斯原理提供了一种理解方法：', '惠更斯原理提供了一种理解方法：\n\n![次级波概念图：非传播数值解](figures/wavelets.svg)')
  }
  if (chapter.id === 'aperture') {
    chapter.markdown = chapter.markdown.replace('在一个简化的光刻标记成像传感器中，我们可以把光路分为：',
      '在一个简化的光刻标记成像传感器中，我们可以把光路分为：\n\n![教学标记成像链路](figures/sensor-imaging-chain.svg)')
  }
  if (chapter.id === 'python') chapter.markdown = chapter.markdown.replace('```\n', '```python\n')
}

const provenance = '课程依据用户提供的《第一周教学逐字稿.md》重建。正文沿用原文讲解，删除完全重复的第一课，修复公式转义、矩阵换行与 Python 排版。课堂界面上的参数读数以历史示例保留；整理补充另行标注。原稿没有学生作答记录，因此不能推断个人答题结果。'
writeFileSync(resolve(root, 'src/course.generated.json'), JSON.stringify({ sourceSha256, provenance, intro, chapters }, null, 2) + '\n')
const lesson = '# 第 1 周完整讲义 · 按教学逐字稿重建\n\n' + provenance + '\n\n' +
  '[原始逐字稿](../archive/第一周教学逐字稿.md) · [整理与核对记录](../docs/逐字稿整理与核对记录.md)\n\n' + intro + '\n\n' +
  chapters.map((c, i) => `## ${String(i + 1).padStart(2, '0')} · ${c.title}\n\n目标：${c.objective}\n\n原稿行号：${c.start}–${c.end}\n\n${c.markdown}\n\n> 整理补充：${c.note}\n\n${c.lab ? '> 操作任务：' + c.lab + '\n\n' : ''}`).join('\n')
writeFileSync(resolve(root, 'lessons/第1周完整讲义.md'), lesson.replaceAll('](figures/', '](../public/figures/'))
writeFileSync(resolve(root, 'notebooks/week1_transcript_abcd.py'), python)
console.log(`已重建 ${chapters.length} 章；原稿 SHA-256 ${sourceSha256}`)
