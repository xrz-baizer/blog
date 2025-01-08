import {PageData} from 'vitepress'
// 动态加载所有 Markdown 文件
const pages = import.meta.glob('/**/*.md', { eager: true });

type Item = {
    text: string; // 文件名
    link?: string; // html文件路径
    items?: Item[];
    collapsed?: boolean;
};

export interface Article extends PageData,Item {
    lastUpdatedFormat: string;
    summary: string;
    pinned: boolean;
    view: number;
}

/**
 * 读取侧边栏数据，`0-` 开头的文件置顶，再根据更新时间排序
 * @param items
 * @param num
 */
export function getRecentArticles(items: Item[],num: number): Article[] {
    let result: Article[] = [];
    // 获取侧边栏所有路径
    let paths: any[] = extractLinks(items);
    // 置顶标识符，文件名0-开头的
    let topIdentifier = `0-`

    // 转换pageData
    paths.forEach(item => {
        // 将路径中的 .html 替换为 .md
        let mdPath = item.link.replace(/\.html$/, '.md');
        if(pages[mdPath]){
            // 查找匹配的 Markdown 文件
            let page = pages[mdPath].__pageData;
            if (page?.lastUpdated) {
                result.push({
                    ...page,
                    ...item,
                    pinned: item.text.startsWith(topIdentifier) ?  true : false,
                    text: item.text,
                    lastUpdatedFormat: formatTimestamp(page.lastUpdated) //日期重新格式化
                });
            }
        }
    })

    // // 排序：根据 lastUpdated 时间戳降序排列
    // result.sort((a, b) => b.lastUpdated - a.lastUpdated);

    // 排序逻辑：数字 `0-` 开头的文件名优先，然后按更新时间降序排列
    result.sort((a, b) => {
        const isASticky = a.text.startsWith(topIdentifier) ? 1 : 0;
        const isBSticky = b.text.startsWith(topIdentifier) ? 1 : 0;

        // 如果两个文件都不是置顶，按更新时间排序
        if (isASticky === isBSticky) {
            return b.lastUpdated - a.lastUpdated;
        }
        // 如果某个文件是置顶文件，将其放到前面
        return isBSticky - isASticky;
    });

    //移除文件名 `0-`
    result.forEach(item => { item.text = item.text.replace(topIdentifier, '')})
    //移除其它数字标识前缀
    result.forEach(item => { item.text = item.text.replace(/^[0-9]+-/, '')})


    if(num == -1) return result;

    // 提取前num条
    return result.slice(0, num);
}
export function extractLinks(items: Item[]): Item[] {
    let result: Item[] = [];

    items.forEach(item => {
        if (item.link) {
            // 如果当前项有链接，提取并添加到结果
            result.push({ text: item.text, link: item.link });
        }

        // 如果当前项有子项，递归提取子项
        if (item.items && item.items.length > 0) {
            result = result.concat(extractLinks(item.items));
        }
    });

    return result;
}



export function formatTimestamp(timestamp: number): string {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatTimestampY(timestamp: number): string {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需加1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


/**
 * 记录浏览量 (入参为路径 /01-Essay/xxxx.html )
 */
export const recordView = async (path: string) => {
    try {
        await fetch('https://baizer.info/proxy/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: path }),
        });
    } catch (error) {
        console.error('Failed to record view:', error);
    }
};

/**
 * 获取浏览量 (入参为路径 /01-Essay/xxxx.html )
 */
export const fetchViews = async (path: string): Promise<number> => {
    try {
        // 请求浏览量数据
        const response = await fetch(`https://baizer.info/proxy/views?url=${encodeURIComponent(path)}`);

        // 检查 HTTP 状态码
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // 安全解析数据，确保 views 存在
        return data?.views ?? 0;
    } catch (error) {
        console.error('Failed to fetch views:', error);
        return 999;
    }
};