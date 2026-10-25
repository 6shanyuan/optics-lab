# 光学测量学习 · 第 1 周归档

一份可交互、可复算的第 1 周学习档案。目标是把传感成像链路、近轴成像和主要观测边界留在一个可下载、可扩展、可部署到 GitHub Pages 的项目里。

## 从哪里开始

1. 先读[第 1 周完整讲义](lessons/第1周完整讲义.md)：本周概念、推导、数值例题、仿真操作、异常诊断、自测答案和模型边界都在其中。
2. 打开[交互式课程网站](https://6shanyuan.github.io/optics-lab/)的“课程正文”，按章节阅读；然后在“模拟器”中先预测、再调整参数。
3. 用[学习笔记](docs/学习笔记.md)复盘判断依据，查阅[术语表](docs/术语表.md)和[五类异常诊断表](docs/异常诊断表.md)。
4. 运行[本周 Jupyter Notebook](notebooks/week1_abcd_optics.ipynb)，复算单缝曲线、ABCD 矩阵、Airy 半径和离焦圈。
5. 最后完成网站里的自动判题和讲义练习，记录仍无法区分的候选原因。

## 本项目包含

- Vite + React + TypeScript 中文交互网站，适配桌面与手机。
- 八节结构化课程正文，包含概念讲解、公式条件、推导、例题、操作步骤、诊断思路和自测解析。
- 可调单缝 Fraunhofer 衍射强度曲线。
- 圆孔焦面 Airy 半径与几何离焦弥散圈对照。
- 带参数滑块的 ABCD 近轴薄透镜光线追迹。
- 两张 SVG 光路图：标记成像测量链路、投影物镜与像差测量传感器概念关系。
- 八道自动判题题目，逐题显示答案解释。
- 第 1 周学习笔记、中英术语表、五类异常诊断表。
- 可运行的 [Jupyter Notebook](notebooks/week1_abcd_optics.ipynb)，复算曲线和示例数值。
- [12 周原始学习计划](../roadmap/12周光学原理与问题定位学习计划.md)保存在主题目录；本周之外的内容只作为路线，没有提前展开。
- GitHub Pages Actions 工作流。

## 学习范围

本项目整理 12 周学习计划的第 1 周“传感成像光路与像差概念”。它保留了本周的近轴成像、光阑 / 视场区分、衍射点像和诊断思路；路线栏只列出后续主题，不提前展开第 2 周内容。

教学示意图与严格物理计算分开说明：

1. **单缝曲线**使用均匀单缝、单色标量波的 Fraunhofer 公式 `I/I₀ = (sin β/β)²`，`β = πa sinθ/λ`。角度由屏幕坐标精确换算为 `θ = atan(x/L)`。它不模拟近场传播、像差、部分相干或像元积分。
2. **圆孔与离焦**分别报告焦面 Airy 首暗环半径 `r ≈ 1.22 λf/D` 和近轴几何离焦圈直径 `d ≈ D|Δz|/f`。页面没有把这两个量当作合成后的精确离焦 PSF。
3. **ABCD 光线追迹**使用近轴光线向量 `[y, θ]`、传播矩阵 `T(d)` 和理想薄透镜矩阵 `L(f)`。它用于验证一阶成像、光线高度和放大率，不包含球差、彗差等高阶像差。
4. **光路图**只表达学习中的功能关系，不复现某一真实设备的内部光学结构。

项目不包含完整镜头处方追迹、高 NA 矢量传播、干涉 / 部分相干成像、真实设备校准或机械根因判定。

## 本机运行网站

需要 Node.js 22+，并使用 pnpm。项目将 pnpm 版本记录在 `package.json`。从仓库根目录运行：

```bash
cd optical-metrology/week-01
corepack enable
pnpm install
pnpm dev
```

浏览器打开终端显示的本地地址。生产构建：

```bash
pnpm build
pnpm preview
```

## 运行 Notebook

需要 Python 3.9+。在本目录执行：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
jupyter notebook notebooks/week1_abcd_optics.ipynb
```

Notebook 只依赖 NumPy、Matplotlib 和 Jupyter。浏览器里的滑块是 React 实现；Notebook 负责复算公式与默认值。

## 数值自检

- `f = 50 mm`、`u = 150 mm`：`v = 75 mm`、`m = −0.5`，ABCD 系统矩阵的 `B ≈ 0`。
- `λ = 550 nm`、`a = 50 μm`、`L = 1.2 m`：第一暗纹小角度值 `13.200 mm`，使用精确屏幕几何约 `13.201 mm`。
- `λ = 550 nm`、`f = 50 mm`、`D = 10 mm`：Airy 首暗环半径 `3.355 μm`。
- 再取 `Δz = 1.2 mm`，几何离焦圈直径约 `240 μm`。

这些示例是可复现的理想模型结果，不是工业设备规格或精度指标。公式参考 MIT 光学课程及 OpenStax 单缝衍射章节，链接见网站“模型核对”部分。

## 发布到 GitHub Pages

本周网站由仓库根目录的 `.github/workflows/deploy.yml` 构建。工作流从 `optical-metrology/week-01/` 安装依赖并生成网站，再发布到仓库的 Pages 根地址。Vite 会根据 `GITHUB_REPOSITORY` 自动设置仓库子路径。首次发布前，在仓库 **Settings → Pages** 将 **Build and deployment → Source** 设为 **GitHub Actions**；之后推送到 `main` 会自动部署。

## 项目结构

```text
optical-metrology/week-01/src/        React 页面、交互内容与公式
optical-metrology/week-01/docs/       Markdown 笔记、术语表、诊断表、图示说明
optical-metrology/week-01/notebooks/  可运行的 Jupyter Notebook
optical-metrology/week-01/public/     SVG 光路图与可下载 Notebook
.github/workflows/deploy.yml          GitHub Pages 部署
```

## 参考资料

- [MIT OpenCourseWare · 2.71 Optics](https://ocw.mit.edu/courses/2-71-optics-spring-2014/pages/lecture-notes/)
- [OpenStax / Physics LibreTexts · Intensity in Single-Slit Diffraction](https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_%28OpenStax%29/University_Physics_III_-_Optics_and_Modern_Physics_%28OpenStax%29/04%253A_Diffraction/4.03%253A_Intensity_in_Single-Slit_Diffraction)
- [Vite · Deploying a Static Site](https://vite.dev/guide/static-deploy)
- [GitHub Docs · Custom workflows for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
