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

// 记录接口
app.post('/record', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const decodedUrl = decodeURIComponent(url); // 解码 URL
    let data = {};

    if (fs.existsSync(JSON_FILE)) {
        try {
            data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
        } catch (error) {
            console.error('Error reading JSON file:', error);
            data = {};
        }
    }

    // 更新浏览量
    data[decodedUrl] = (data[decodedUrl] || 0) + 1;

    // 写回文件
    try {
        fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to JSON file:', error);
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
    let data = {};

    if (fs.existsSync(JSON_FILE)) {
        try {
            data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
        } catch (error) {
            console.error('Error reading JSON file:', error);
        }
    }

    res.status(200).json({ url: decodedUrl, views: data[decodedUrl] || 0 });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`View counter service is running on port ${PORT}`);
});
