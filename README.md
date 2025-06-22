# mikucatswitch - Interactive Video Experience

A beautiful, interactive video viewer built by _mikucat_ for Patreon content. This application allows users to select folders containing video collections and provides an immersive viewing experience with seamless video switching.

## ✨ Features

- **📁 Folder Selection**: Choose folders containing video collections
- **🎬 Interactive Video Player**: Seamless video switching with preserved playback state
- **⚡ Lightning Fast**: Instant video transitions and smooth performance
- **💖 Beautiful Interface**: Friendly design with red/pink color scheme
- **🔍 Smart Search**: Find videos quickly with built-in search functionality
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🌙 Dark/Light Theme**: Toggle between themes for comfortable viewing
- **⚙️ Advanced Controls**: Playback speed, volume, fullscreen, and more

## 🚀 Quick Start

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Build for Production (Static Export)
\`\`\`bash
npm run compile
\`\`\`

This will create a `dist` folder with all static files (HTML, CSS, JS) that can be served from any web server.

### Preview Static Build
\`\`\`bash
npm run preview
\`\`\`

## 📁 Folder Structure

Your video folders should be organized like this:

\`\`\`
📁 Your Content Folder/
├── 📁 Video Collection 1/
│   ├── 📄 config.json
│   ├── 🖼️ thumbnail.jpg (or .png, .webp)
│   ├── 🎬 video1.mp4
│   ├── 🎬 video2.mp4
│   └── 🎬 video3.webm
├── 📁 Video Collection 2/
│   ├── 📄 config.json
│   ├── 🖼️ thumbnail.png
│   └── 🎬 videos...
\`\`\`

### config.json Format

\`\`\`json
{
  "version": 1,
  "title": "Optional Collection Title",
  "videos": [
    {"filename": "video1.mp4", "name": "Ropa normal + Arriba"},
    {"filename": "video2.mp4", "name": "Ropa normal + Abajo"},
    {"filename": "video3.webm", "name": "Bikini + Frente"}
  ]
}
\`\`\`

## 🎯 Supported Formats

- **Videos**: MP4, WebM
- **Images**: PNG, JPG, JPEG, WebP
- **Browsers**: Chrome, Edge, Safari, Firefox (File System Access API required)

## 🛠️ Technical Details

- **Framework**: Next.js 14 with static export
- **Styling**: Tailwind CSS with custom red/pink theme
- **Components**: Radix UI + shadcn/ui
- **Fonts**: Comfortaa, Nunito, Poppins, Inter
- **Storage**: Client-side localStorage for folder persistence
- **File Access**: File System Access API for folder selection

## 📦 Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run compile` | Build static files to `dist/` |
| `npm run preview` | Preview static build locally |
| `npm run lint` | Run ESLint |

## 🌐 Deployment

After running `npm run compile`, the `dist` folder contains all static files:

- Upload the entire `dist` folder to your web server
- No server-side rendering required
- Works with any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## 🔗 Connect with _mikucat_

- **🐦 Twitter**: [@_mikucat_](https://x.com/_mikucat_)
- **🎨 Patreon**: [_mikucat_](https://www.patreon.com/c/_mikucat_)
- **🎬 Iwara**: [_mikucat_](https://www.iwara.tv/profile/_mikucat_)

## 📄 License

This project is created for _mikucat_'s Patreon content. Please respect the creator's work and content.

---

Made with ❤️ by _mikucat_
