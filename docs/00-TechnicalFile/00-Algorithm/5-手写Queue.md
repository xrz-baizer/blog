# Queue 队列

## Queue 队列

> **Queue 队列**：双端操作，队尾入，队头出。先进先出，简称FIFO（First In First Out）

**队列的实现**：可以基于动态数组 或者 双向链表实现

- 优先使用双向链表，因为队列主要是往头尾操作元素。双向链表头尾操作都是 O(1)，动态数组头尾操作可能是 O(n)
- 官方 java.util.Queue 是基于 LinkedList 实现（双向链表）

![image-20241219122337301](../../Image/image-20241219122337301.png)

:::  details 代码实现 XQueue（基于 LinkedList 实现）

```java
package datastructure.queue;

import datastructure.linkedlist.XLinkedList;

import java.util.List;

/**
 * @author XRZ
 */
public class XQueue<E> {

    private List<E> list = new XLinkedList<>();

    /**
     * 入队
     * @param e
     * @return
     */
    public boolean add(E e){
        return list.add(e); //链表末尾新增
    }

    /**
     * 出队
     * @return
     */
    public E poll(){
        return list.remove(0);
    }

    /**
     * 获取队头
     * @return
     */
    public E peek(){
        return list.get(0);
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

## Deque 双端队列

>**双端队列 Deque（duble ended queue）**：队尾、队头都支持出队和入队。
>
>- 官方 java.util.Deque 是基于 LinkedList 实现（双向链表）

![image-20241219122432797](../../Image/image-20241219122432797.png)

:::  details 代码实现 XDeque（基于 LinkedList 实现）

:::