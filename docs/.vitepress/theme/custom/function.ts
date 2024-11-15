
type Item = {
    text: string;
    link?: string;
    items?: Item[];
    collapsed?: boolean;
};

/**
 * 提前侧边栏所有文章路径信息
 * @param items
 */
export function extractLinks(items: Item[]): { text: string; link: string }[] {
    let result: { text: string; link: string }[] = [];

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
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}