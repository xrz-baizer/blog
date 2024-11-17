# select for update

MySQL版本：5.7.29

#### for update确保操作的唯一性（行锁）

> - where条件必须使用索引，最好是唯一索引，如果没有索引可能会升级为表锁。
> - 注意死锁的问题：如果两个或多个事务以不同的顺序获取锁，可能会导致死锁。例如，事务 A 锁定了行 X 并尝试获取行 Y 的锁，而事务 B 锁定了行 Y 并尝试获取行 X 的锁，导致死锁，进而引发事务回滚。


### 测试表

```sql
CREATE TABLE `test_xrz` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `price` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
```

### 测试用例

（console_3） 开启事务A，执行以下SQL，不提交事务

```sql
select * from test_xrz where id = 2 for update;

update test_xrz set price = 18 where id = 2;

select * from test_xrz; # id=2,price=18
```

（console）开启事务B，执行以下SQL，不提交事务

```sql
select * from test_xrz; # id=2,price=17

select * from test_xrz where id = 2; #id=2,price=17

select * from test_xrz where id = 2 for update ; # waiting...

update test_xrz set price = 14 where id = 2; # waiting...
```

**事物B`for update`和 `update`语句会一直等待**

![](https://img2022.cnblogs.com/blog/1473551/202208/1473551-20220831093604181-738389175.png)


**提交事务A**

![](https://img2022.cnblogs.com/blog/1473551/202208/1473551-20220831093620684-125945015.png)


**事务A提交后事务B`for update`和 `update`语句才会执行**

### lock in share mode

`for update`是排他锁（不允许其它事务增加任何锁）

`lock in share mode` 是共享锁（只允许其它事务增加共享锁）
