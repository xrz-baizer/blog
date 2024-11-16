import {PageData} from 'vitepress'

type Item = {
    text: string; // 文件名
    link?: string; // html文件路径
    items?: Item[];
    collapsed?: boolean;
};

export interface Article extends PageData,Item {
    lastUpdatedFormat: string;
    formePart: string;
}

export function getRecentArticles(items: Item[],num: number): Article[] {
    let result: Article[] = [];
    // 获取侧边栏所有路径
    let paths: any[] = extractLinks(items);

    // 转换pageData
    paths.forEach(item => {
        let page = getPageDataByPath(item.link);
        if (page?.lastUpdated) {
            result.push({
                ...page,
                ...item,
                // formePart: , //提取文件内存
                lastUpdatedFormat: formatTimestamp(page.lastUpdated) //日期重新格式化
            });
        }
    })

    // 排序：根据 lastUpdated 时间戳降序排列
    result.sort((a, b) => b.lastUpdated - a.lastUpdated);

    // 提取前14条
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
export function getPageDataByPath(path: string) : Article {
    // 动态加载所有 Markdown 文件
    let pages = import.meta.glob('/**/*.md', { eager: true });

    // 将路径中的 .html 替换为 .md
    let mdPath = path.replace(/\.html$/, '.md');

    // 查找匹配的 Markdown 文件
    return pages[mdPath].__pageData;
}

export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}