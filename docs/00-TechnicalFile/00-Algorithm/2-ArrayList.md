# ArrayList

##  ArrayList（动态数组）

> 继承AbstractList，实现一些通用的方法
> - 动态数组：通过扩容实现动态数组：grow(int minCapacity)
> - 添加功能：通过部分元素右移实现添加：add(int index, E element)
> - 删除功能：通过部分元素左移实现删除：remove(int index)

![image-20241216122745739](../../Image/image-20241216122745739.png)

### 扩容

新增时，需要对现有数组扩容，大致流程：创建一个新数组，将旧数组移到新数组中

```java
private void ensureCapacity(int minCapacity) {
    int oldCapacity = elements.length;
    if(minCapacity <= oldCapacity) return; //空闲容量还很充裕

    //新容量 = 旧容量1.5倍（`>> 1` = 除以2）
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    Object[] newElements = new Object[newCapacity];

    //旧数组移到新数组中
    for (int i = 0; i < size; i++){
      newElements[i] = elements[i];
    }
    elements = newElements;
}
```

### 缩容

删除数据时，避免空闲容量过多，考虑缩容。

```java
private void trim() {
    int oldCapacity = elements.length;
    int newCapacity = oldCapacity >> 1; //缩小0.5倍

    if(oldCapacity <= DEFAULT_CAPACITY || //容量太小，没必要缩容
       size >= newCapacity){ // 实际使用量超过总容量的一半，也没必要缩容
      return;
    }
    // 当实际使用量 小于 总容量的一半，触发缩容
    // 新建数组迁移
    Object[] newElements =  new Object[newCapacity];
    for (int i = 0 ; i < size ; i++){
      newElements[i] = elements[i];
    }
    elements = newElements;
}
```

**注意缩容时机的问题：**

例如：当扩容数量为*2，新增数据，触发扩容，容量20 -> 40，size=21。如果这时候删除了2个元素，size回退到19，触发缩容，如果又新增了2个元素， 又触发了扩容，容易反复横跳，造成复杂度震荡。

解决：调整缩容的时机，例如当只有实际使用量小于总容量的四分之一时才出发缩容。

## 完整代码实现

```java
package datastructure;

import java.util.AbstractList;
import java.util.ArrayList;
import java.util.List;

/**
 *  手写ArrayList（动态数组）
 *
 *    继承AbstractList，实现一些通用的方法
 *    动态数组：通过扩容实现动态数组：grow(int minCapacity)
 *    添加功能：通过部分元素右移实现插入：add(int index, E element)
 *    删除功能：通过部分元素左移实现删除：remove(int index)
 *
 * @author XRZ
 */
public class XArrayList<E> extends AbstractList<E> {

    private Object[] elements; // 使用数组实现List（动态数组）
    private int size;          // 记录实际使用量（element.lenth是总容量）
    private static int DEFAULT_CAPACITY = 10;


    public XArrayList(){
        elements = new Object[DEFAULT_CAPACITY];
    }

    @Override
    public int size() {
        return size;
    }

    @Override
    public E get(int index) {
        this.rangeCheck(index);
        return (E) elements[index];
    }

    public void add(int index, E element) {
        this.rangeCheckForAdd(index);
        // 扩容
        this.ensureCapacity(size + 1);

        //通过部分元素右移实现插入
        // [1,2,3,4,x,x,x] size = 4, i = 3（1起始）
        // [1,2,2,3,4,x,x] 假设 index = 1 位置插入（0起始）
        for (int i = size - 1; i > index; i--){
            // 右移覆盖
            elements[i + 1] = elements[i];
        }
        elements[index] = element; //指定位置插入
        size++; //记录使用量
    }

    public E remove(int index) {
        this.rangeCheck(index);
        Object oldElment = elements[index];

        //通过部分元素左移实现删除
        // [1,2,3,4,x,x,x]
        // [2,3,4,x,x,x,x] 假设 index = 0, size = 4
        for (int i = index; i < size; i++){
            // 左移覆盖
            elements[i] = elements[i + 1];
        }
        elements[size - 1] = null; //尾部元素置空
        size--;

        // 缩容（可选）
        this.trim();

        return (E) oldElment;
    }

    public void clear() {
        for (int i = 0; i < size; i++){
            elements[i] = null;
        }
        size = 0;

        //缩容2
        if(elements.length > DEFAULT_CAPACITY){
            elements = new Object[DEFAULT_CAPACITY];
        }
    }

    public E set(int index, E element) {
        this.rangeCheck(index);

        Object oldElement = elements[index];
        //指定下标位置覆盖
        elements[index] = element;

        return (E) oldElement;
    }



    private void rangeCheck(int index){
        if(index < 0 || index >= size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    private void rangeCheckForAdd(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index:" + index + ", Size:" + size);
    }

    /**
     * 扩容
     * @param minCapacity
     */
    private void ensureCapacity(int minCapacity) {
        int oldCapacity = elements.length;
        if(minCapacity <= oldCapacity) return; //空闲容量还很充裕

        //新容量 = 旧容量1.5倍（`>> 1` = 除以2）
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        Object[] newElements = new Object[newCapacity];

        //旧数组移到新数组中
        for (int i = 0; i < size; i++){
            newElements[i] = elements[i];
        }
        elements = newElements;
    }

    /**
     * 缩容：删除数据时，避免空闲容量过多，考虑缩容。
     */
    private void trim() {
        int oldCapacity = elements.length;
        int newCapacity = oldCapacity >> 1; //缩小0.5倍

        if(oldCapacity <= DEFAULT_CAPACITY || //容量太小，没必要缩容
                size >= newCapacity){ // 实际使用量超过总容量的一半，也没必要缩容
            return;
        }
        // 当实际使用量 小于 总容量的一半，触发缩容
        // 新建数组迁移
        Object[] newElements =  new Object[newCapacity];
        for (int i = 0 ; i < size ; i++){
            newElements[i] = elements[i];
        }
        elements = newElements;
    }


    public static void main(String[] args) {
        List<Integer> xList =
                new XArrayList<>();
//                new ArrayList<>();

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

