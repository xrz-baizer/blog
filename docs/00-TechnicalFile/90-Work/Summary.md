# Summary

- **腾讯文档汇总**：https://doc.weixin.qq.com/home/recent?tab=collect

- **中台化上线方案**：https://xf12607haf.feishu.cn/wiki/J6gLw0EJniEYHMkRRi4cnKFenBc

- **Java服务内存**：https://doc.weixin.qq.com/doc/w3_AIwAsQarAA4K1aSUktQSBW9QaIMdK?scode=APEAlweLAA431EW7ocAIwAsQarAA4
- **基于连接池的性能优化思路**：https://doc.weixin.qq.com/doc/w3_AIwAsQarAA4HkqqiTR7RnOf2OOSux?scode=APEAlweLAA4ONTpa1jAIwAsQarAA4

- **数据库连接池配置的相关问题**：https://doc.weixin.qq.com/doc/w3_ALMA0QZQAA87v6PGy3uTniQSPJ2cF?scode=APEAlweLAA4WbgY1e4ALMA0QZQAA8

### 网关工作流程整理

- https://doc.weixin.qq.com/doc/w3_AEYAAgY_ACUNwTT176hTXGFGnucvA?scode=APEAlweLAA4IDFAyfnAEYAAgY_ACU&isEnterEdit=1
- https://doc.weixin.qq.com/doc/w3_AEYAAgY_ACUUShQcGyvS7mopVkxs7?scode=APEAlweLAA4zTbAGumAEYAAgY_ACU&version=4.1.10.6013&platform=win



### 遇到的难事（偏技术性）

- Eureka做注册中心时服务地址没有及时更新的问题
- Dubbo采用Zk做注册中心时服务没有及时更新的问题
- 多云调度的问题
- OpenFeign Client注入导致循环依赖的问题——@FeignClient是代理类导致
- MQ回调时，调用事务嵌套方法失效的问题
  - RocketMQ会通过  事务状态 确认该消息是否消费成功
  - 但是在A事务嵌套B事务的场景下
    - B事务的传播隔离机制设置为嵌套事务，即支持B方法执行报错不影响A方法
    - 但是在MQ消费方法中执行A方法时，B事务的异常会导致A事务的回滚，即B事务的嵌套传播机制失效了。
