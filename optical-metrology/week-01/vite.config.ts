import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const [owner, repository] = (process.env.GITHUB_REPOSITORY ?? '').split('/')
const pagesBase = process.env.GITHUB_ACTIONS && repository && repository !== `${owner}.github.io`
  ? `/${repository}/`
  : '/'

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
})
