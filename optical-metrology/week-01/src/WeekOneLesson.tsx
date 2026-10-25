const fullLessonUrl = 'https://github.com/6shanyuan/optics-lab/blob/main/optical-metrology/week-01/lessons/%E7%AC%AC1%E5%91%A8%E5%AE%8C%E6%95%B4%E8%AE%B2%E4%B9%89.md'

const aberrations = [
  ['离焦', '像面偏离所选焦面；前后扫焦，观察点像尺度和清晰度。'],
  ['球差', '不同孔径高度的光线焦点不重合；改变孔径并比较最佳焦点。'],
  ['彗差', '离轴点像可能呈非对称拖尾；先排除目标形状、照明和 ROI 裁剪。'],
  ['像散', '正交方向的焦点位置不同；比较不同焦面上的 x / y 截面。'],
  ['场曲、畸变', '最佳焦面或像点位置随视场变化；必须测多个视场。'],
  ['色差', '图像随波长改变；做多波长对照并固定其他条件。'],
]

const checks = [
  ['整体模糊', '像面偏焦、球差、采样不足', '扫焦；比较连续光学图和像元采样图。'],
  ['方向性模糊', '像散、照明偏心、运动 / 读出方向效应', '比较焦前焦后图；旋转目标或改变照明。'],
  ['拖尾与偏移', '彗差、目标不对称、瞳遮挡、ROI 截断', '扩大 ROI、反转目标，并分别改变光学与算法条件。'],
  ['位置随焦点变', '非对称成像、标记响应、几何耦合', '换对称目标和定位算法，再观察点像形状。'],
  ['中心清晰、边缘差', '场曲、像面倾斜、视场像散或渐晕', '在多个视场记录最佳焦面和局部点像。'],
]

export default function WeekOneLesson() {
  return (
    <section className="course-section" id="lesson">
      <div className="course-heading">
        <div>
          <p className="eyebrow">课程正文 · 第 1 周</p>
          <h2>从一个光点，读懂整条测量链。</h2>
          <p>先厘清光学、探测与算法各自的作用，再用近轴模型、衍射公式和诊断对照解释图像。每个结论都附有适用范围。</p>
        </div>
        <a className="course-download" href={fullLessonUrl} target="_blank" rel="noreferrer">打开完整讲义 ↗</a>
      </div>

      <div className="course-objectives">
        <div><span>01</span><b>看清链路</b><p>目标 → 照明 → 成像光路 → 探测器 → 估计算法</p></div>
        <div><span>02</span><b>核对模型</b><p>薄透镜、ABCD、一阶衍射与离焦尺度</p></div>
        <div><span>03</span><b>设计对照</b><p>对异常保留候选，用下一项观测区分原因</p></div>
      </div>

      <article className="course-chapter">
        <div className="course-chapter-index">01</div>
        <div className="course-chapter-body">
          <h3>先把“像差”放回测量链</h3>
          <p>一个测量结果经过三层：光学系统改变波前与点像；光电探测器做像元积分并引入采样、噪声或饱和；估计算法通过 ROI、背景处理和拟合计算位置或参数。噪声和算法误差会改变观测，但不等于光学像差。</p>
          <div className="course-layer-grid">
            <div><span>光学系统</span><p>离焦、球差、彗差、像散会改变波前或成像。</p></div>
            <div><span>光电探测</span><p>像元积分、欠采样、噪声和饱和会改变记录信号。</p></div>
            <div><span>估计算法</span><p>ROI、阈值和模型失配会改变最终位置或拟合值。</p></div>
          </div>
          <p className="course-callout">“图像像彗差”是观测；“模型更支持彗差项”是估计；“某元件偏心”是机械根因假设。它们需要不同证据。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">02</div>
        <div className="course-chapter-body">
          <h3>近轴薄透镜：先算出理想成像</h3>
          <p>本周用实物、实像的正距离约定，物距 u、像距 v 和焦距 f 使用相同单位：</p>
          <div className="course-equation-row">
            <div><span>薄透镜</span><strong>1/f = 1/u + 1/v</strong></div>
            <div><span>横向放大率</span><strong>m = y′/y = −v/u</strong></div>
          </div>
          <p>例：f = 50 mm、u = 150 mm，得到 v = 75 mm、m = −0.5。负号表示实像倒置；物高 4 mm 对应像高 −2 mm。</p>
          <div className="course-matrix">
            <span>传播 T(d) = [[1, d], [0, 1]]</span>
            <span>薄透镜 L(f) = [[1, 0], [−1/f, 1]]</span>
            <span>系统 M = T(v)L(f)T(u)；B = u + v − uv/f</span>
          </div>
          <p>当 B = 0 时，输出像高 y′ = Ay + Bθ 不再依赖该物点发出的近轴光线初始角度，一阶成像条件成立。ABCD 追迹适合检查共轭、放大率和光线高度；它本身不包含球差、彗差等高阶模型。</p>
          <div className="course-callout">光阑限制光束口径；视场描述目标点离轴范围。孔径角是光锥张角，视场角是物点位置，两者不能互换。</div>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">03</div>
        <div className="course-chapter-body">
          <h3>有限孔径让理想点也有衍射斑</h3>
          <p>几何光学把点成像到点，但有限孔径限制波场，理想无像差系统也会产生有限大小的 PSF。单缝远场模型给出：</p>
          <div className="course-equation-row">
            <div><span>归一化强度</span><strong>I/I₀ = (sin β / β)²</strong></div>
            <div><span>相位参数</span><strong>β = πa sinθ / λ</strong></div>
          </div>
          <p>第一暗纹满足 a sinθ₁ = λ。屏幕坐标 x 与角度满足 θ = atan(x/L)，所以精确屏幕位置为 x₁ = L tan(asin(λ/a))；小角度下 x₁ ≈ λL/a。</p>
          <div className="course-example">
            <span>数值例题 · λ = 550 nm，a = 50 μm，L = 1.2 m</span>
            <strong>小角度：13.200 mm　·　精确几何：约 13.201 mm</strong>
            <p>缝宽减半，主峰宽度约扩大一倍；增大波长或屏距也会让图样变宽。</p>
          </div>
          <p className="course-limit">这是均匀照明、单色、理想单缝的 Fraunhofer 标量解析模型。它不是圆孔 PSF，也没有计算近场、像差、部分相干、像元积分或噪声。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">04</div>
        <div className="course-chapter-body">
          <h3>把 Airy 尺度和离焦弥散分开</h3>
          <p>焦面上的理想圆孔 Airy 首暗环半径近似为 r ≈ 1.22λf/D；离开焦面 Δz 后，几何光锥在传感面形成直径 d ≈ D|Δz|/f 的弥散圈。</p>
          <div className="course-example split-example">
            <div><span>衍射 · λ = 550 nm，f = 50 mm，D = 10 mm</span><strong>Airy 半径 ≈ 3.355 μm</strong></div>
            <div><span>离焦 · 再取 Δz = 1.2 mm</span><strong>几何圈直径 ≈ 240 μm</strong></div>
          </div>
          <p>增大 D 会缩小 Airy 半径，却增大同一离焦下的几何圈；两项趋势不同。当前模拟器把两者分别报告，没有把它们合成为“精确离焦 PSF”。实际波动离焦图样需要从瞳函数和相位传播计算。</p>
          <p className="course-callout">术语上，像面位置偏移与残余像差可分层排查；但在波前表达中，离焦也常作为低阶像差项。因此二者相关，不能说物理上完全互斥。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">05</div>
        <div className="course-chapter-body">
          <h3>先认识像差的可观察线索</h3>
          <div className="course-aberration-grid">{aberrations.map(([name, explanation]) => <div key={name}><b>{name}</b><p>{explanation}</p></div>)}</div>
          <p>这些形状只是候选线索。一个不对称斑也可能由不对称目标、照明、瞳遮挡、运动、欠采样或 ROI 裁切造成。要从图形走向判断，至少比较一个焦面序列或一个能够区分候选的条件。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">06</div>
        <div className="course-chapter-body">
          <h3>把仿真当作可检验的预测</h3>
          <div className="course-operation-grid">
            <div><span>单缝曲线</span><p>从默认参数出发，一次只改变缝宽、波长或屏距；先用 λL/a 预测第一暗纹移动，再观察精确几何曲线。</p></div>
            <div><span>孔径与离焦</span><p>独立观察 Airy 半径和几何圈；增大孔径时看两项结果向相反方向变化。</p></div>
            <div><span>ABCD 光线追迹</span><p>用 f = 50 mm、u = 150 mm 得到 v = 75 mm；将传感器移离像面，观察光线交点和矩阵 B 变化。</p></div>
          </div>
          <p>每次记录：改变的参数、固定条件、事前预测、观测结果、公式是否吻合，以及该模型没有包含的效应。页面中的光线图用于直觉，坐标不全按真实设备比例绘制。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">07</div>
        <div className="course-chapter-body">
          <h3>看到异常后，安排下一项区分检查</h3>
          <p>先写现象与候选，再选让候选预测不同的检查；不要从一张图直接跳到机械部件根因。</p>
          <div className="course-table-wrap"><table className="course-table"><thead><tr><th>观察</th><th>候选原因</th><th>优先对照</th></tr></thead><tbody>{checks.map(([symptom, causes, next]) => <tr key={symptom}><td>{symptom}</td><td>{causes}</td><td>{next}</td></tr>)}</tbody></table></div>
          <p>完整字段、判断边界与注意事项见页面“诊断”区和项目中的异常诊断表。</p>
        </div>
      </article>

      <article className="course-chapter">
        <div className="course-chapter-index">08</div>
        <div className="course-chapter-body">
          <h3>本周自测：答案要带理由</h3>
          <details className="course-question"><summary>理想、有限孔径的镜头成像一个理想点，为什么仍有光斑？</summary><p>有限孔径引起衍射，产生 PSF；光斑存在本身不能证明像差。</p></details>
          <details className="course-question"><summary>像元读出噪声算不算像差？ABCD 模型能否直接预测彗差？</summary><p>噪声属于探测器层。ABCD 是一阶近轴模型，不包含彗差等高阶像差。</p></details>
          <details className="course-question"><summary>目标上下移动时，图像中心也移动。下一步先检查什么？</summary><p>先检查远心性、主光线角度、光轴倾斜、放大率或几何耦合；再设计焦点与点像对照，不能仅凭位置变化判定彗差。</p></details>
          <div className="course-download-row">
            <a href={import.meta.env.BASE_URL + 'notebooks/week1_abcd_optics.ipynb'} download>下载本周 Notebook ↓</a>
            <a href="https://github.com/6shanyuan/optics-lab/tree/main/optical-metrology/week-01/docs" target="_blank" rel="noreferrer">笔记、术语与诊断表 ↗</a>
          </div>
        </div>
      </article>

      <div className="course-boundaries">
        <b>本周模型边界</b>
        <p>单缝公式是标量 Fraunhofer 远场模型；Airy 首暗环是圆孔衍射近似；离焦圈是近轴几何估算；ABCD 是理想薄透镜的一阶模型。它们都不是完整镜头处方、高 NA 矢量仿真、真实设备校准或机械故障判定。</p>
      </div>
    </section>
  )
}
