import fs from 'fs';
import path from 'path';

/**
 * 在构建时调用，读取所有MD文件生成文章概述js文件。在分类页面（Category.vue）引入该js文件，通过文章path读取对应文章概述
 */
export function generateArticlesSummaryJSON(){
    // Markdown 文件所在目录
    const articlesDir = path.resolve(__dirname, '../../../../docs');
    // 输出 JSON 文件路径
    const outputPath = path.resolve(__dirname, '../../../../docs/public/articles.js');

    const markdownFiles = getMarkdownFiles(articlesDir);
    const articlesMap = {};

    markdownFiles.forEach(filePath => {
        // 读取 Markdown 文件
        const content = fs.readFileSync(filePath, 'utf-8');
        // 清理无用内容
        const cleanText = cleanContent(content);
        // 提取前 200 个字符作为摘要
        const summary = cleanText.slice(0, 200).replace(/[\r\n]/g, ' ');
        // 使用相对路径作为key
        const relativePath = path.relative(articlesDir, filePath);
        // 记录
        articlesMap[relativePath] = summary;
    });

    // 将数据导出为 JavaScript 模块
    const fileContent = `export const articlesMap = ${JSON.stringify(articlesMap, null, 2)}`;

    fs.writeFileSync(outputPath, fileContent);
}


function cleanContent(content) {
    // 跳过 YAML Front Matter
    content = content.replace(/^---[\s\S]*?---/, '').trim();
    // 移除标题（例如 # 一级标题）
    content = content.replace(/^#\s*[^#\n]*\n/gm, '');
    // 替换 <img> 标签
    content = content.replace(/<img[^>]*>/gi, '');
    // 移除 Markdown 图片引用 ![](url)
    content = content.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
    // 处理 http:// 和 https:// 开头的 URL，保留前 15 个字符并在后面加上省略号
    content = content.replace(/(https?:\/\/[^\s]+)(?=\s|$)/gi, (match) => match.slice(0, 15) + '...');
    // 移除 ** 标识符
    content = content.replace(/\*\*(.*?)\*\*/g, '$1');
    // 移除 == 标识符
    content = content.replace(/==(.*?)==/g, '$1');

    // 移除 Markdown 表格样式，只保留文本
    content = content.replace(/\| *(.*?) *(\| +.*? *)*\| */g, '$1\n');
    content = content.replace(/-{3,}/g, '');
    return content;
}

function getMarkdownFiles(dir) {
    const results = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // 递归扫描子文件夹
            results.push(...getMarkdownFiles(filePath));
        } else if (stats.isFile() && file.endsWith('.md')) {
            results.push(filePath);
        }
    });
    return results;
}