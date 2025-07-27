import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const srcDir = path.join(projectRoot, 'src')
const publicDir = path.join(projectRoot, 'public')

console.log('🔧 Running post-build script...')

// 1. 复制 manifest.json
const manifestSrc = path.join(srcDir, 'manifest.json')
const manifestDest = path.join(distDir, 'manifest.json')

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest)
  console.log('✅ Copied manifest.json')
} else {
  console.error('❌ manifest.json not found in src/')
}

// 2. 复制 public 目录下的文件
if (fs.existsSync(publicDir)) {
  copyRecursiveSync(publicDir, distDir)
  console.log('✅ Copied public assets')
}

// 3. 创建简单的图标（如果不存在）
const iconsDir = path.join(distDir, 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 创建简单的PNG图标占位符（仅供开发使用）
const iconSizes = [16, 32, 48, 128]
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}.png`)
  if (!fs.existsSync(iconPath)) {
    // 创建一个简单的SVG文件作为图标占位符
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="4" fill="#007AFF"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="${Math.floor(size/3)}" 
            fill="white" text-anchor="middle" dominant-baseline="middle">⚡</text>
    </svg>`
    
    // 保存为PNG名称但实际是SVG内容（Chrome扩展可以处理）
    fs.writeFileSync(iconPath, svgContent)
  }
})

console.log('✅ Created icon placeholders')

// 4. 移动HTML文件到根目录
const htmlFiles = ['popup.html', 'options.html']
htmlFiles.forEach(htmlFile => {
  const srcPath = path.join(distDir, 'src', htmlFile.includes('popup') ? 'popup' : 'options', htmlFile)
  const destPath = path.join(distDir, htmlFile)
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath)
    console.log(`✅ Moved ${htmlFile} to root`)
  }
})

// 5. 验证生成的文件
const requiredFiles = ['manifest.json', 'popup.html', 'options.html', 'background.js', 'content-script.js']
let allFilesExist = true

requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.error(`❌ ${file} is missing`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('🎉 Build completed successfully!')
  console.log(`📦 Extension files are ready in: ${distDir}`)
  console.log('🚀 You can now load the extension in Chrome:')
  console.log('   1. Open chrome://extensions/')
  console.log('   2. Enable "Developer mode"')
  console.log('   3. Click "Load unpacked" and select the dist folder')
} else {
  console.error('❌ Build incomplete - some files are missing')
  process.exit(1)
}

// 工具函数：递归复制目录
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}