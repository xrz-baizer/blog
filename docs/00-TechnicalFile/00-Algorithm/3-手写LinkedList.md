# LinkedList

## 单向链表

注意新增、删除 first 头节点时特殊处理

![image-20241216122808752](../../Image/image-20241216122808752.png)

::: details 代码实现 SinglyLinkedList（重点关注 **add**、**remove** 方法）

```java

```

:::

## 单向链表（循环）

单向链表的末尾节点next指向null，而循环链表的末尾节点next指向first节点，形成一个环。

![image-20241216122900765](../../Image/image-20241216122900765.png)

除了新增、删除 first 头节点时需要特殊处理，单节点时的情况也要考虑

- 首次新增：没有尾节点，自己指向自己
- 删除最后一个节点：first 直接置空即可

![image-20241216122910649](../../Image/image-20241216122910649.png)

::: details 代码实现 SinglyLinkedCircularList（重点关注 **add**、**remove** 方法）

```java

```

:::

## 双向链表（java.util.LinkedList）

每个数据节点中都有两个指针，分别指向前节点和后节点。头节点的前节点和尾节点的后节点都为null。

> 优化单向链表的查询效率：（空间换时间） 
>
> - 把链表一分为二 
> - 当判断index节点在左边时，就从头节点的next往后查询
> - 当判断index节点在右边时，就从尾节点的prev往前查询

![image-20241216122829860](../../Image/image-20241216122829860.png)

### 二分遍历节点

```java
private Node<E> node(int index){

      int median = size >> 1; //采用二分思想

      // 当判断index节点在左边时，就从头节点的next往后查询
      if(index < median){
        Node<E> node = first;
        for (int i = 0; i < median; i++){ // 从左往右，到中间
          node = node.next;
        }
        return node;
      }
      // 当判断index节点在右边时，就从尾节点的prev往前查询
      else{
        Node<E> node = last;
        for (int i = size - 1; i >= median; i--){ // 从右往左，到中间
          node = node.prev;
        }
        return node;
      }
}
```



::: details 代码实现 XLinkedList（重点关注 **add**、**remove** 方法）

```java

```

:::

## 双向链表（循环）

在双向链表的基础上，头节点的前节点指向尾节点，尾节点的后节点指向头节点。

![image-20241216122927027](../../Image/image-20241216122927027.png)

![image-20241216122938303](../../Image/image-20241216122938303.png)

::: details 代码实现 XLinkedCircularList（重点关注 **add**、**remove** 方法）

```java

```

:::
