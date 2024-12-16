# LinkedList

## 单向链表

注意新增、删除 first 头节点时特殊处理

![image-20241216122808752](../../Image/image-20241216122808752.png)

::: details 代码实现 SinglyLinkedList

```java
package datastructure;

import java.util.AbstractList;
import java.util.List;

/**
 * 单向链表（通过指针引用关联节点）
 *
 * @author XRZ
 */
public class SinglyLinkedList<E> extends AbstractList<E> {

    private Node<E> first; //头节点
    private int size;      //记录节点长度

    public SinglyLinkedList(){
    }

    @Override
    public E get(int index) {
        this.rangeCheck(index);
        // 遍历节点取值
        return this.node(index).item;
    }

    @Override
    public int size() {
        return size;
    }

    public void add(int index, E element) {
        this.rangeCheckForAdd(index);
        // 特殊处理
        if(index == 0){
            // 首次新增时，first = null
            // 插入头节点时，first节点往后移，并且置为新节点的next节点。
            first = new Node<>(element,first);
        }else{
            Node<E> prev = this.node(index - 1); //获取前节点

            // 新节点的next为当前index的节点，等于当前节点后移
            Node<E> newNode = new Node<>(element, prev.next);
            // 修改前节点的引用为新节点
            prev.next = newNode;
        }
        size++;
    }

    public E set(int index, E element) {
        this.rangeCheck(index);
        Node<E> node = this.node(index);
        E oldVal = node.item;
        node.item = element; // 覆盖值
        return oldVal;
    }

    public E remove(int index) {
        this.rangeCheck(index);
        E oldItem;
        // 删除0号位时，特殊处理
        if(index == 0) {
            oldItem = first.item;
            first = first.next;   //覆盖引用
        }else{
            Node<E> prev = this.node(index - 1); //获取前节点
            oldItem = prev.next.item;
            //前节点直接指向当前节点的next（prev.next = 当前节点）
            prev.next = prev.next.next;
        }
        size--;
        return oldItem;
    }

    public void clear() {
        size = 0;
        first = null;
    }

    /**
     * 遍历节点
     * @param index 遍历到指定下标
     * @return
     */
    private Node<E> node(int index){
        Node<E> node = first;
        for (int i = 0; i < index; i++){
            node = node.next;
        }
        return node;
    }

    public static class Node<E>{
        E item;
        Node<E> next;

        public Node(E item, Node next){
            this.item = item;
            this.next = next;
        }
    }


    private void rangeCheck(int index){
        if(index < 0 || index >= size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    private void rangeCheckForAdd(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    public static void main(String[] args) {
        List<Integer> xList = new SinglyLinkedList<>();

        xList.add(1);
        xList.add(2);
        xList.add(3);
        xList.add(4);
        xList.set(2,4);
        xList.set(0,2);
        xList.remove(3);
        System.out.println(xList);
    }
}

```

:::

## 单向链表（循环）

单向链表的末尾节点next指向null，而循环链表的末尾节点next指向first节点，形成一个环。

![image-20241216122900765](../../Image/image-20241216122900765.png)

除了新增、删除 first 头节点时需要特殊处理，单节点时的情况也要考虑

- 首次新增：没有尾节点，自己指向自己
- 删除最后一个节点：first 直接置空即可

![image-20241216122910649](../../Image/image-20241216122910649.png)

::: details 代码实现 SinglyLinkedCircularList

```java
package datastructure;

import java.util.AbstractList;
import java.util.List;

/**
 * 单向链表（循环）
 *
 *  单向链表的末尾节点next指向null，而循环链表的末尾节点next指向first节点
 *
 * @author XRZ
 */
public class SinglyLinkedCircularList<E> extends AbstractList<E> {

    private Node<E> first; //头节点
    private int size;      //记录节点长度

    public SinglyLinkedCircularList(){

    }

    @Override
    public E get(int index) {
        this.rangeCheck(index);
        // 遍历节点取值
        return this.node(index).item;
    }

    @Override
    public int size() {
        return size;
    }

    public void add(int index, E element) {
        this.rangeCheckForAdd(index);
        if(index == 0){ // 特殊处理
            Node<E> newFirst = new Node<>(element,first);

            // 首次新增时
            if(size == 0){
                newFirst.next = newFirst; //没有尾节点，自己指向自己
            }
            // 插入头节点时
            else{
                Node<E> lastNode = this.node(size - 1); // 获取尾节点
                lastNode.next = newFirst; //尾节点指向新first
            }
            first = newFirst; //更新头节点

        }else{
            Node<E> prev = this.node(index - 1); //获取前节点
            // 新节点的next为当前index的节点，等于当前节点后移
            Node<E> newNode = new Node<>(element, prev.next); //此处的prev在末尾时，next是first节点
            // 修改前节点的引用为新节点
            prev.next = newNode;
        }
        size++;
    }

    public E set(int index, E element) {
        this.rangeCheck(index);
        Node<E> node = this.node(index);
        E oldVal = node.item;
        node.item = element; // 覆盖值
        return oldVal;
    }

    public E remove(int index) {
        this.rangeCheck(index);
        E oldItem;
        if(index == 0) { // 特殊处理
            oldItem = first.item;

            //当只有一个节点时
            if(size == 1){
                first = null;
            }
            // 删除0号位时
            else{
                Node<E> lastNode = this.node(size - 1);
                lastNode.next = first; //更新尾节点引用
                first = first.next;    // 覆盖头节点
            }

        }else{
            Node<E> prev = this.node(index - 1); //获取前节点
            oldItem = prev.next.item;
            //前节点直接指向当前节点的next（prev.next = 当前节点）
            prev.next = prev.next.next;
        }
        size--;
        return oldItem;
    }

    public void clear() {
        size = 0;
        first = null;
    }

    /**
     * 遍历节点
     * @param index 遍历到指定下标
     * @return
     */
    private Node<E> node(int index){
        Node<E> node = first;
        for (int i = 0; i < index; i++){
            node = node.next;
        }
        return node;
    }

    public static class Node<E>{
        E item;
        Node<E> next;

        public Node(E item, Node next){
            this.item = item;
            this.next = next;
        }
    }

    private void rangeCheck(int index){
        if(index < 0 || index >= size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    private void rangeCheckForAdd(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    public static void main(String[] args) {
        List<Integer> xList = new SinglyLinkedList<>();

        xList.add(1);
        xList.add(2);
        xList.add(3);
        xList.add(4);
        xList.set(2,4);
        xList.set(0,2);
        xList.remove(3);
        System.out.println(xList);
    }
}

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

::: details 代码实现 XLinkedList

:::

## 双向链表（循环）

在双向链表的基础上，头节点的前节点指向尾节点，尾节点的后节点指向头节点。

![image-20241216122927027](../../Image/image-20241216122927027.png)

![image-20241216122938303](../../Image/image-20241216122938303.png)

::: details 代码实现 XLinkedCircularList

:::
