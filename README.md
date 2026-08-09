# 个人小宇宙 · Personal Portal

一个基于 **GitHub Pages** 的静态页面集合入口。`index.html` 是唯一的入口，可以进入以下三个相互独立的页面。

## 页面结构

```
.
├── index.html                        # 入口页（本仓库首页）
├── super-nmu/
│   └── super-nmu.html                # 页面 01 · 超级南京医科大学（脑洞学科评估）
├── tech-scRNAanalysis/
│   ├── tech-scRNAanalysis.html       # 页面 02 · scRNA-seq 生信教学
│   └── pictures/                     # 教程插图（13 张，页面内以相对路径引用）
└── 约会邀请函/
    └── 约会邀请函.html               # 页面 03 · 约会邀请函
```

| 入口 | 目标 | 说明 |
| --- | --- | --- |
| `/` | `index.html` | 唯一入口，列出全部页面 |
| `/super-nmu/` | 超级南京医科大学 | 虚构脑洞，纯属娱乐 |
| `/tech-scRNAanalysis/` | scRNA-seq 教学 | 科研教程，复现公开文献 |
| `/约会邀请函/` | 约会邀请函 | 私人页面 |

## 设计约定

- **单向入口**：`index.html` 能进入各子页面；各子页面**不提供**返回首页的链接，相互独立。
- 子页面的资源（图片等）均使用**相对路径**，便于在任何子目录下部署。
  - 例：`tech-scRNAanalysis.html` 内的图片统一写作 `pictures/xxx.png`。

## 本地预览

仓库根目录下启动任意静态服务器即可：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```

浏览器打开 `http://localhost:8000` 即可预览。由于各页面用相对路径互相引用，本地预览效果与线上一致。

## 部署到 GitHub Pages

1. 将本目录内容推送到一个 **public** 仓库（例如 `my-pages`）。
2. 进入仓库 **Settings → Pages**。
3. 在 *Build and deployment* 中：
   - Source 选择 **Deploy from a branch**
   - Branch 选择 `main`
   - 目录选择 `/ (root)`
4. 点击 **Save**，等待 1~2 分钟。
5. 访问：`https://<你的用户名>.github.io/<仓库名>/`

> 注意：仓库目录下不要混入不必要的文件；若以后使用自定义域名，请在 **Settings → Pages** 中填写并配置对应的 CNAME 解析。

## 更新页面

- 修改某个子页面后，直接覆盖同名文件并 `git push`，GitHub Pages 会自动重新部署。
- 新增页面时，在 `index.html` 的 `.cards` 中加入一张新卡片，并将对应 html 放入同名子目录即可。

## 免责声明

「超级南京医科大学」为 AI 生成的虚构创作，所有数据与设定纯属娱乐，不代表真实学科评估结果。
