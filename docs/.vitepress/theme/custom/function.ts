
type Item = {
    text: string;
    link?: string;
    items?: Item[];
    collapsed?: boolean;
};

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