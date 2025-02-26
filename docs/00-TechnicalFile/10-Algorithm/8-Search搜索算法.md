# Search 搜索算法

## Binary Search 二分查找

二分查找：在有序数组中查找指定元素。

- 首先将数组分为两个区间，再和中间值比较，比它小则查询左半区，比它大则查询右半区。
- 循环往复，直至查询到指定元素。

### 视频动画演示

https://www.douyin.com/user/self?from_tab_name=main&modal_id=7369006541392940329

### 代码实现

```java
public boolean binarySearchFromLeft(int[] arr,int num) {
    int left   = 0;
    int right  = arr.length - 1;
    int middle = 0;

    while(left <= right){

        // 默认查询中间
        // (left + right) 是为了保证每次循环变更left或right的时候，middle都是中间值
        middle = (left + right) / 2;

        if(arr[middle] == num){
            return true;

        } else if(arr[middle] > num){

            // 中间值比num大，则调整右边界，查询左半部分。
            right = middle - 1;

        } else { // if(arr[middle] < num)

            // 中间值比num小，则调整左边界，查询右半部分。
            left = middle + 1;
        }

    }
    return false;
}
```

### 取中间值优化

上述代码中，获取数组中间值下标是通过下列公式获取：`middle = (left + right) / 2`

这个公式有一个问题，如果在超大数组的极端情况下， 例如：如果`left=15`亿，`right=16`亿，它们相加`=31`亿，则会出现`int`溢出异常。

- `int`溢出：`int`上限为`2的31次方-1`，约`=21`亿

#### 防溢出写法

**`middle = left + ((right - left) / 2);`**

- `((right - left) / 2`：先取他们之间差值的一半，再加到`left`上，解决溢出
- 15亿 + （16亿 - 15亿）/ 2 
- 15亿 + 1亿 / 2
- 15亿 + 5000万

#### 位运算优化

而`/ 2` 等于 `>> 1`右位移 1 位，即最终写法可优化为：**`middle = left + ((right - left) >> 1)`**



