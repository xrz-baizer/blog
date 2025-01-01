const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JSON_FILE = path.resolve('/data/views.json');

app.use(express.json());

// 初始化文件
if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, JSON.stringify({}), 'utf8');
}

// 读取文件内容
const readFileContent = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return {};
    }
};

// 写入文件内容
const writeFileContent = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to JSON file:', error);
        throw error;
    }
};

// 记录接口
app.post('/record', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const decodedUrl = decodeURIComponent(url); // 解码 URL
    let data = readFileContent(JSON_FILE);

    // 更新浏览量
    data[decodedUrl] = (data[decodedUrl] || 0) + 1;

    // 按浏览量降序排序
    const sortedData = Object.fromEntries(
        Object.entries(data).sort(([, viewsA], [, viewsB]) => viewsB - viewsA)
    );
    try {
        writeFileContent(JSON_FILE, sortedData); // 写回文件
    } catch (error) {
        return res.status(500).json({ error: 'Failed to record view' });
    }

    res.status(200).json({ message: 'View recorded', url: decodedUrl, views: data[decodedUrl] });
});

// 获取接口
app.get('/views', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const decodedUrl = decodeURIComponent(url); // 解码 URL
    const data = readFileContent(JSON_FILE);

    res.status(200).json({ url: decodedUrl, views: data[decodedUrl] || 0 });
});

// 获取所有浏览量接口
app.get('/views/summary', (req, res) => {

    const data = readFileContent(JSON_FILE);
    // 计算总浏览量
    let totalViews = Object.values(data).reduce((sum, views) => sum + views, 0);

    res.status(200).json({ totalViews });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`View counter service is running on port ${PORT}`);
});
