import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import course from './course.generated.json'
import { quiz } from './content'

const chapterQuestions: Record<string, number[]> = {
  point: [0], aperture: [1, 2], diffraction: [6, 7], 'stop-grating': [8],
  pupil: [9], abcd: [3], questions: [4, 10], python: [11], 'b-lab': [12], diagnosis: [5, 13],
}

function CourseMarkdown({ text }: { text: string }) {
  return <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}
    components={{
      img: ({ src, alt }) => <img src={src?.startsWith('figures/') ? import.meta.env.BASE_URL + src : src} alt={alt} loading="lazy" />,
      table: ({ children }) => <div className="course-table-wrap"><table>{children}</table></div>,
    }}>{text}</Markdown>
}

function ChapterCheck({ index }: { index: number }) {
  const question = quiz[index]
  const [selected, setSelected] = useState<number>()
  return <div className="chapter-check">
    <span className="eyebrow">{question.source} · 理解检查</span>
    <h4>{question.question}</h4>
    <div className="chapter-options">{question.options.map((option, i) => <button type="button" key={option}
      aria-pressed={selected === i}
      className={selected === undefined ? '' : i === question.answer ? 'is-correct' : selected === i ? 'is-incorrect' : ''}
      onClick={() => setSelected(i)}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>
    {selected !== undefined && <p role="status"><b>{selected === question.answer ? '答对了。' : '再看一下推理。'}</b> {question.explanation}</p>}
  </div>
}

export default function WeekOneLesson() {
  return <section id="lesson" className="course-section">
    <div className="section-heading"><p className="eyebrow">按教学逐字稿重建 · 10 章完整课程</p>
      <h2>把课堂里的每一步，接回学习过程</h2>
      <p className="section-description">从“为什么会有光斑”读到“怎样安排对照实验”。课堂追问、数学推导、代码、参数和案例一并保留。</p>
    </div>
    <div className="course-provenance"><b>内容来源与整理方式</b><p>{course.provenance}</p>
      <div className="course-download-row">
        <a href={`${import.meta.env.BASE_URL}course/第一周教学逐字稿.md`} download>下载完整原稿 ↓</a>
        <a href={`${import.meta.env.BASE_URL}course/第1周完整讲义.md`} download>下载整理讲义 ↓</a>
        <a href={`${import.meta.env.BASE_URL}course/逐字稿整理与核对记录.md`} download>查看整理与核对记录 ↓</a>
      </div>
    </div>
    <div className="course-reader-layout">
      <aside className="course-toc" aria-label="课程章节目录"><b>本周阅读目录</b>
        <a href="#course-roadmap">学习路线 · 12 小时</a>
        {course.chapters.map((chapter, i) => <a href={`#chapter-${chapter.id}`} key={chapter.id}><span>{String(i + 1).padStart(2, '0')}</span>{chapter.title}</a>)}
        <a href="#labs">参数实验 ↓</a><a href="#quiz">整周自测 ↓</a>
      </aside>
      <div className="course-reader">
        <article id="course-roadmap" className="transcript-chapter"><header><span className="eyebrow">原稿 1–44 行</span><h3>第 1 周学习路线</h3></header>
          <div className="course-markdown"><CourseMarkdown text={course.intro} /></div>
          <p className="course-editor-note">整理补充：12 小时为原学习计划的建议投入。归档状态与个人学习完成状态分别记录。</p>
        </article>
        {course.chapters.map((chapter, i) => <article id={`chapter-${chapter.id}`} className="transcript-chapter" key={chapter.id}>
          <header><span className="eyebrow">第 {String(i + 1).padStart(2, '0')} 章 · 原稿 {chapter.start}–{chapter.end} 行</span>
            <h3>{chapter.title}</h3><p className="chapter-objective">{chapter.objective}</p></header>
          <div className="course-markdown"><CourseMarkdown text={chapter.markdown} /></div>
          <div className="course-editor-note"><b>整理补充 · 条件与核对</b><p>{chapter.note}</p></div>
          {'lab' in chapter && <div className="chapter-lab"><b>把本章结论带到实验</b><p>{chapter.lab}</p><a href="#labs">打开参数实验 ↓</a></div>}
          {chapterQuestions[chapter.id]?.map(index => <ChapterCheck key={index} index={index} />)}
          <a className="chapter-back" href="#lesson">返回阅读目录 ↑</a>
        </article>)}
      </div>
    </div>
    <div className="course-boundaries"><b>本周模型边界</b><p>光线示意、几何包络和异常形状用于教学。单缝曲线采用标量 Fraunhofer 解析模型；Airy 半径是焦面圆孔衍射近似；ABCD 是一阶近轴模型。瞳函数和 Zernike 在本稿中用于概念衔接，本周没有完成含像差的波动 PSF 仿真。</p></div>
  </section>
}
