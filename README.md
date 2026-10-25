# optics-lab

光学学习资料与交互式练习的长期归档仓库。内容按主题收纳；每个主题下再按学习周数归档，方便后续持续补充。

## 光学测量学习

- [光学测量学习主题索引](optical-metrology/README.md)
- [12 周学习计划原文与路线图](optical-metrology/roadmap/12周光学原理与问题定位学习计划.md)
- [第 1 周：传感成像光路与像差概念](optical-metrology/week-01/README.md)

后续周次放在 `optical-metrology/week-02/`、`week-03/` 等目录。新增主题时，在仓库根目录创建独立主题文件夹。

## GitHub Pages

GitHub Actions 会从 `optical-metrology/week-01/` 构建当前交互式学习网站，并将网站发布到仓库 Pages 根地址。推送到 `main` 后自动部署，也可以在 **Actions** 中手动运行部署工作流。首次发布前，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

当前网站构建和归档文件都位于 `optical-metrology/week-01/`；工作流在仓库根目录的 `.github/workflows/deploy.yml`。其他学习资料可以继续按周添加，不需要把新的周次内容混进第 1 周目录。
