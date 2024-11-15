# Spring事务管理

>Spring 事务管理（Spring Transaction Management）是 Spring 框架中的一个核心功能，旨在通过声明性或编程方式为应用提供统一的事务管理支持。它简化了在不同持久层技术中的事务管理操作，如 JDBC、Hibernate、JPA 等（事务的实现依赖各数据库自己的事务机制）。
>
>Spring事务管理主要分为两大类：
>
>- 声明式事务管理（SpringAOP的具体应用）
>- 编程式事务管理

##  核心概念

### 事务（Transaction）

事务是一个不可分割的工作单元，在事务中的操作要么全部成功，要么全部失败并回滚。事务管理的核心原则是保障数据的一致性和完整性，通常用以下四个特性来定义：

- **原子性（Atomicity）**：事务中的所有操作要么全部成功，要么全部失败，并回滚。
- **一致性（Consistency）**：事务开始前和结束后，数据保持一致的状态。
- **隔离性（Isolation）**：一个事务的操作在未提交前对其他事务是不可见的。
- **持久性（Durability）**：事务提交后，其结果是永久保留的。

### 编程式事务管理

- 在代码中显式调用事务管理的 API 来管理事物（通过 Spring 提供的 TransactionTemplate 或直接使用 PlatformTransactionManage）
- 事务管理的粒度：代码块级别

### 声明式事务管理

- 声明式事务是SpringAOP的具体应用，通过对方法前后进行拦截，将事务处理的功能编织到拦截的方法中，也就是在目标方法开始之前启动一个事务，在目标方法执行完之后根据执行情况提交或者回滚事务
- 通过 @Transactional 注解的方式来实现
- 事务管理的粒度：方法级别

### @Transactional注解的属性

- **propagation**：事务传播行为，控制当前方法在调用其他事务方法时如何处理已有的事务。
- **isolation**：事务隔离级别，控制事务之间的隔离性。
- **timeout**：事务的超时时间，事务必须在指定时间内完成，否则将回滚。
- **readOnly**：标志事务是否只读。只读事务不会引发写操作，通常用于查询操作。
- **rollbackFor** 和 **noRollbackFor**：指定哪些异常会触发事务回滚，哪些异常不会触发回滚。

### 事务的传播行为（Propagation）

Spring 事务管理的一个重要概念是传播行为（Propagation），它决定了一个事务方法在嵌套调用其他事务方法时如何处理现有的事务。

七种传播机制：

- **REQUIRED**（默认）：如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。
- **SUPPORTS**：如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务方式执行。
- **MANDATORY**：如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
- **REQUIRES_NEW**：总是启动一个新的事务，如果当前存在事务，则将当前事务挂起。
- **NOT_SUPPORTED**：总是以非事务方式执行，如果当前存在事务，则将当前事务挂起。
- **NESTED**：如果当前存在事务，则在嵌套事务内执行。如果当前事务不存在，则行为与 REQUIRED 一样。嵌套事务是一个子事务，它依赖于父事务。父事务失败时，会回滚子事务所做的所有操作。但子事务异常不一定会导致父事务的回滚。

### Spring事务隔离级别（Isolation）

事务隔离级别控制并发事务之间的隔离程度，防止常见的并发问题，例如脏读、不可重复读和幻读。

- 脏读：A事物读取到了B事物未提交数据
- 不可重复读：A事物读取到了B事物已提交的修改（update）数据，导致A事物内部多次查询结果不一致
- 幻读：A事物读取到了B事物新已提交的新增（insert）数据，导致A事物内部多次查询结果不一致

TransactionDefinition接口定义隔离级别：

- **ISOLATION_DEFAULT**：使用数据库默认的隔离级别，MySQL 默认的是可重复读，Oracle 默认的读已提交。

- **ISOLATION_READ_UNCOMMITTED**：读未提交，最低的隔离级别，允许读到未提交的数据，可能会导致脏读。

- **ISOLATION_READ_COMMITTED**：读已提交，能读取到已经提交的数据，防止脏读（大部分数据库的默认级别）。

- **ISOLATION_REPEATABLE_READ**：可重复读，保证同一个事务中多次读取的数据是一样的，防止不可重复读（MySQL的默认级别）。

- **ISOLATION_SERIALIZABLE**：串行化，最高隔离级别，事务完全串行化执行，防止脏读、不可重复读和幻读，但性能开销较大。

### 事务管理器（Transaction Manager）

Spring 通过 PlatformTransactionManager 接口统一处理不同类型的事务管理（如 JDBC、JPA、Hibernate 等）。根据具体的持久层技术，Spring 提供了不同的事务管理器实现：

- **DataSourceTransactionManager**：用于 JDBC 的事务管理。
- **JpaTransactionManager**：用于 JPA 的事务管理。
- **HibernateTransactionManager**：用于 Hibernate 的事务管理。

## 声明式事务的实现





## Spring事务传播行为的实现

