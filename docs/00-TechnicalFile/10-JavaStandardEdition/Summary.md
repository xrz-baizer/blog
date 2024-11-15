- 内存

  - Java服务内存：https://doc.weixin.qq.com/doc/w3_AIwAsQarAA4K1aSUktQSBW9QaIMdK?scode=APEAlweLAA431EW7ocAIwAsQarAA4

  - 一次偏向锁导致的接口缓慢问题排查记录
    https://doc.weixin.qq.com/doc/w3_ALMA0QZQAA85IDAVJ0ORAGDnvi1dg?scode=APEAlweLAA4YfI0tFoALMA0QZQAA8

  - 浅谈JVM的 Safepointhttps://doc.weixin.qq.com/doc/w3_AIwAsQarAA4D1tUYBs3TDSsD0KMBe?scode=APEAlweLAA4g49B0J7AIwAsQarAA4

## Java基础

### Java参数是值传递还是引用传递

参数是基本类型时：按值传递（在方法内部修改值不会影响外部）

参数是引用类型时：按引用传递（在方法内部修改对象值可以影响外部）

- 正常来说引用传递的值在方法中都可以修改，但是某些特殊的类型是不会被修改的，例如包装类，String

正常引用传递：

```java
@Test
public void testUser(){
  User user = new User(1,"id","name");
  changeUser(user);
  System.out.println(user.getId()); // 输出2
}

public void changeUser(User user){
  user.setId(2);
  user = new User(3,"id","name"); // 这种只会修改局部变量的引用，不会影响外部user的引用
}
```

特殊的类型的引用传递：

```java
    @Test
    public void testString(){
        String a = "a";
        changeString(a);
        System.out.println(a); // 输出a
    }

    public void changeString(String a){
        a = "b";
    }

```

```java
    @Test
    public void testInteger(){
        Integer a = 1;
        changeInteger(a);
        System.out.println(a); // 输出1
    }

    public void changeInteger(Integer a){
        a = 2;
    }
```

因为他们存储的值实际都是用final修饰的，都是不可变的，引用地址都不会被修改
