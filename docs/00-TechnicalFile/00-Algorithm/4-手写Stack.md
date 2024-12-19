# Stack 栈

## Stack 栈

> 单端操作，后进先出，简称LIFO（Last In First Out）

**栈的实现**：可以基于动态数组 或者 双向链表实现

-  官方 java.util.Stack 是基于 Vector 实现（一种线程安全的数组）

**栈的应用**：浏览器地址的前进和后退、软件相关操作的撤销和恢复

![image-20241219121411691](../../Image/image-20241219121411691.png)

:::  details 代码实现 XStack（基于动态数组实现）
```java
package datastructure;

import java.util.ArrayList;
import java.util.List;

/**
 * @author XRZ
 */
public class XStack<E> {

    private List<E> list = new XArrayList<>();

    /**
     * 入栈
     * @param element
     */
    public void push(E element){
        list.add(element);
    }

    /**
     * 出栈
     * @return
     */
    public E pop(){
        return list.remove(this.size() - 1);
    }

    /**
     * 获取栈顶元素
     * @return
     */
    public E peek(){
        return list.get(this.size() - 1);
    }


    public void clear(){
        list.clear();
    }

    public int size(){
        return list.size();
    }

    public boolean isEmpty(){
        return list.isEmpty();
    }

}

```
:::