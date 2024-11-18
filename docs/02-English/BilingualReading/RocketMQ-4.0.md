# RocketMQ-4.0

### Why RocketMQ

During Ali's nascent days of RocketMQ, we used it for asynchronous communications, search, social networking activity flows, data pipelines, and trade processes. As our trade business throughput rose, the pressure originating from our messaging cluster became urgent.

在阿里孕育 RocketMQ 的雏形时期，我们将其用于异步通信、搜索、社交网络活动流、数据管道，贸易流程中。随着我们的贸易业务吞吐量的上升，源自我们的消息传递集群的压力也变得紧迫。

According to our research, the ActiveMQ IO module reached a bottleneck as queue and virtual topic usage increased. We tried our best to solve this problem by throttling, circuit breaker or downgrading, but the results were not satisfactory. So we tried the popular messaging solution Kafka. unfortunately, Kafka could not meet our requirements, especially in terms of low latency and high reliability, as detailed here. In this case, we decided to invent a new messaging engine to handle a wider range of messaging use cases, covering from traditional pub/sub scenarios to high-volume, real-time, zero-error transaction systems.

根据我们的研究，随着队列和虚拟主题使用的增加，ActiveMQ IO模块达到了一个瓶颈。我们尽力通过节流、断路器或降级来解决这个问题，但效果并不理想。于是我们尝试了流行的消息传递解决方案Kafka。不幸的是，Kafka不能满足我们的要求，其尤其表现在低延迟和高可靠性方面，详见这里。在这种情况下，我们决定发明一个新的消息传递引擎来处理更广泛的消息用例，覆盖从传统的pub/sub场景到高容量的实时零误差的交易系统。

Since its inception, Apache RocketMQ has been widely adopted by many enterprise developers and cloud vendors for its simple architecture, rich business functionality, and extreme scalability. After more than ten years of large-scale scenario polishing, RocketMQ has become the industry consensus as the preferred solution for financial-grade reliable business messages, and is widely used in business scenarios in Internet, big data, mobile Internet, IoT and other fields.

Apache RocketMQ 自诞生以来，因其架构简单、业务功能丰富、具备极强可扩展性等特点被众多企业开发者以及云厂商广泛采用。历经十余年的大规模场景打磨，RocketMQ 已经成为业内共识的金融级可靠业务消息首选方案，被广泛应用于互联网、大数据、移动互联网、物联网等领域的业务场景。

### Message Model

In a topic-based system, messages are published on topics or channels. Consumers will receive all messages on the topics they subscribe to, and producers are responsible for defining the message categories that subscribers subscribe to. This is a basic conceptual model, and in practical applications, the structure will be more complex. For example, in order to support high concurrency and horizontal scaling, the topics need to be partitioned. The same topic will have multiple producers, the same information will have multiple consumers, and load balancing should be performed between consumers.

在基于主题的系统中，消息被发布到主题或命名通道上。消费者将收到其订阅主题上的所有消息，生产者负责定义订阅者所订阅的消息类别。这是一个基础的概念模型，而在实际的应用中，结构会更复杂。例如为了支持高并发和水平扩展，中间的消息主题需要进行分区，同一个Topic会有多个生产者，同一个信息会有多个消费者，消费者之间要进行负载均衡等。

### NameServer

NameServer is a simple Topic routing registry that supports dynamic registration and discovery of Topic and Broker.

NameServer是一个简单的 Topic 路由注册中心，支持 Topic、Broker 的动态注册与发现。

Mainly includes two functions：

主要包括两个功能：

- Broker management:The NameServer accepts the registration information of the Broker cluster and saves it as the basic data of the routing information. And it provides a heartbeat detection mechanism to check whether the Broker is still alive.

  Broker管理：NameServer接受Broker集群的注册信息并且保存下来作为路由信息的基本数据。然后提供心跳检测机制，检查Broker是否还存活；

- Routing Information Management:Each NameServer will hold the entire routing information about the Broker cluster and queue information for client queries. The Producer and Consumer can know the routing information of the entire Broker cluster through the NameServer, so as to produce and consume messages.

  路由信息管理：每个NameServer将保存关于 Broker 集群的整个路由信息和用于客户端查询的队列信息。Producer和Consumer通过NameServer就可以知道整个Broker集群的路由信息，从而进行消息的投递和消费。



NameServer usually has multiple instances deployed, and each instance does not communicate with each other. Broker registers its own routing information with each NameServer, so each NameServer instance saves a complete routing information. The client can still obtain routing information from other NameServers, When a NameServer goes offline for some reason.

NameServer通常会有多个实例部署，各实例间相互不进行信息通讯。Broker是向每一台NameServer注册自己的路由信息，所以每一个NameServer实例上面都保存一份完整的路由信息。当某个NameServer因某种原因下线了，客户端仍然可以向其它NameServer获取路由信息。

### When to use Topic/Tag

It can be determined from the following aspects:

可以从以下几个方面进行判断：

- Whether the message types are consistent: Such as simple messages, transaction messages, timed (delayed) messages, and ordered messages. Different message types use different Topics, which cannot be distinguished by Tags.

  消息类型是否一致：如普通消息、事务消息、定时（延时）消息、顺序消息，不同的消息类型使用不同的 Topic，无法通过 Tag 进行区分。

- Whether the business is related: The messages that are not directly related, such as Taobao messages and JD Logistics messages, are distinguished by different Topics. In contrast, the messages belonging to Tmall transaction, including electrical order, women's clothing order, cosmetics order messages could be distinguished by Tags.

  业务是否相关联：没有直接关联的消息，如淘宝交易消息，京东物流消息使用不同的 Topic 进行区分；而同样是天猫交易消息，电器类订单、女装类订单、化妆品类订单的消息可以用 Tag 进行区分。

- Whether the message priority is identical：For example, as logistics message, Hema must be delivered within an hour, Tmall supermarket must be delivered within 24 hours, and Taobao logistics is relatively slower. Messages with different priorities could be distinguished by different topics.

  消息优先级是否一致：如同样是物流消息，盒马必须小时内送达，天猫超市 24 小时内送达，淘宝物流则相对会慢一些，不同优先级的消息用不同的 Topic 进行区分。

- Whether the message volume is equivalent: Some business messages are small in volume but require high real-time performance. If they stay under the same Topic with trillion-level messages, it may be "starve" due to the long waiting time. Therefore, it is necessary to split messages of different volumes into different Topics.

  消息量级是否相当：有些业务消息虽然量小但是实时性要求高，如果跟某些万亿量级的消息使用同一个 Topic，则有可能会因为过长的等待时间而“饿死”，此时需要将不同量级的消息进行拆分，使用不同的 Topic。



In general, you can choose to create multiple Topics, or create multiple Tags under a single Topic for message classification. There is no necessary connection between messages under different Topics, and Tags are used to distinguish interrelated messages under the same topic, such as the complete sets and subsets, or the sequence of processes.

总的来说，针对消息分类，您可以选择创建多个 Topic，或者在同一个 Topic 下创建多个 Tag。但通常情况下，不同的 Topic 之间的消息没有必然的联系，而 Tag 则用来区分同一个 Topic 下相互关联的消息，例如全集和子集的关系、流程先后的关系。

### Keys

Each message of Apache RocketMQ can place a unique identification —— Keys field at the business level, which is convenient for locating the problem of message loss in the future. The broker side will create an index (hash index) for each message so that the client can query the content of the message through Topic and Key, as well as who consumes the message. Since it is a hash index, please make sure that the key is as unique as possible to avoid potential hash collisions.

Apache RocketMQ 每个消息可以在业务层面的设置唯一标识码 keys 字段，方便将来定位消息丢失问题。 Broker 端会为每个消息创建索引（哈希索引），应用可以通过 topic、key 来查询这条消息内容，以及消息被谁消费。由于是哈希索引，请务必保证 key 尽可能唯一，这样可以避免潜在的哈希冲突。

### Message Queue

To support high concurrency and horizontal expansion, Topic needs to be partitioned, which is called Message Queue in RocketMQ. A Topic may have multiple queues and may be distributed on different Brokers.

为了支持高并发和水平扩展，需要对 Topic 进行分区，在 RocketMQ 中这被称为队列，一个 Topic 可能有多个队列，并且可能分布在不同的 Broker 上。

In general, a message will only exist in one of the queues under a Topic if it is not sent repeatedly (e.g., a client resents messages since the server does not respond). The message will be stored in a queue according to the principle of FIFO (First In, First Out). Each message will have its own position, and each queue will calculate the total number of the messages, which is called MaxOffset; the position corresponding to the starting point of the queue is called MinOffset. Message Queue can improve the concurrency of message production and consumption.

一般来说一条消息，如果没有重复发送（比如因为服务端没有响应而进行重试），则只会存在在 Topic 的其中一个队列中，消息在队列中按照先进先出的原则存储，每条消息会有自己的位点，每个队列会统计当前消息的总条数，这个称为最大位点 MaxOffset；队列的起始位置对应的位置叫做起始位点 MinOffset。队列可以提升消息发送和消费的并发度。

### Producer

The Producer is the sender of the message. Apache RocketMQ owns rich message types and is able to support various scenarios.

生产者（Producer）就是消息的发送者，Apache RocketMQ 拥有丰富的消息类型，可以支持不同的应用场景。

- For instance, an order will be closed due to the payment timeout in an e-commerce transaction, so a delayed message should be sent when the order is created. This message will be delivered to the Consumer after 30 minutes. After receiving the message, the Consumer needs to determine whether the corresponding order has been paid. If the payment is not completed, the order will be closed. If the payment has been completed, then ignore it.

  比如在电商交易中超时未支付关闭订单的场景，在订单创建时会发送一条延时消息。这条消息将会在 30 分钟以后投递给消费者，消费者收到此消息后需要判断对应的订单是否已完成支付。如支付未完成，则关闭订单。如已完成支付则忽略。
- In the e-commerce scenario, the business requires the messages of the same order to be kept in strict sequence, the ordered messages could therefore be applied.

  电商场景中，业务上要求同一订单的消息保持严格顺序，此时就要用到顺序消息。在日志处理场景中，可以接受的比较大的发送延迟，但对吞吐量的要求很高，希望每秒能处理百万条日志，此时可以使用批量消息。
- In the log processing scenario, a relatively large sending delay is acceptable, but it has a high throughput requirement. It is expected that millions of logs need to be processed within a second. In this case, the batch messages could be sent.

  在日志处理场景中，可以接受的比较大的发送延迟，但对吞吐量的要求很高，希望每秒能处理百万条日志，此时可以使用批量消息。
- In the bank deduction scenarios, in order to keep the upstream deduction operation consistent with the downstream SMS notification, transaction messages could be utilized.

  在银行扣款的场景中，要保持上游的扣款操作和下游的短信通知保持一致，此时就要使用事务消息。

The next section will introduce the sending of various types of messages.

下一节将会介绍各种类型消息的发送。

### Synchronous Sending

Apache RocketMQ sends messages in three ways: synchronous, asynchronous, and one-way. The first two message types are reliable since the response will be returned from the server regardless of whether their messages are successfully sent or not.

Apache RocketMQ可用于以三种方式发送消息：同步、异步和单向传输。前两种消息类型是可靠的，因为无论它们是否成功发送都有响应。

Synchronous Sending is a communication method in which the message sender sends a message and will send the next message only after receiving a synchronous response from the server. Reliable synchronous transmission is widely used in various scenarios, such as important notification messages, short message notifications, etc.

同步发送是最常用的方式，是指消息发送方发出一条消息后，会在收到服务端同步响应之后才发下一条消息的通讯方式，可靠的同步传输被广泛应用于各种场景，如重要的通知消息、短消息通知等。

The entire code for synchronous sending is as follows: 

同步发送的整个代码流程如下：

- Create a Producer. Create a DefaultMQProducer in advance. The Producer should contain the name of the Producer group, which is a collection of Producer, they would send the same type of messages with identical logic.

  首先会创建一个producer。普通消息可以创建 DefaultMQProducer，创建时需要填写生产组的名称，生产者组是指同一类Producer的集合，这类Producer发送同一类消息且发送逻辑一致。
- Set the address of NameServer. Apache RocketMQ is able to set the address of the NameServer (described in the client configuration) in many ways. The following example is set by calling the producer's setNamesrvAddr() method in the code, separated by a semicolon if there is more than one NameServer, such as "127.0.0.2:9876;127.0.0.3:9876".

  设置 NameServer 的地址。Apache RocketMQ很多方式设置NameServer地址(客户端配置中有介绍)，这里是在代码中调用producer的API setNamesrvAddr进行设置，如果有多个NameServer，中间以分号隔开，比如"127.0.0.2:9876;127.0.0.3:9876"。
- Build the message. Set the topic, tag, body, and so on. The tag can be understood as a label to categorize the message, and RocketMQ can filter the tag on the Consumer side.

  第三步是构建消息。指定topic、tag、body等信息，tag可以理解成标签，对消息进行再归类，RocketMQ可以在消费端对tag进行过滤。
- Call the send() method to send the message. Ultimately, the send() method will return a SendResult. The SendResut contains the actual send status including SEND_OK (send success), FLUSH_DISK_TIMEOUT (disk flush timeout), FLUSH_SLAVE_TIMEOUT (sync to slave timeout), SLAVE_NOT_AVAILABLE (slave can not be used), and an exception is thrown if it fails.

  最后调用send接口将消息发送出去。同步发送等待结果最后返回SendResult，SendResut包含实际发送状态还包括SEND_OK（发送成功）, FLUSH_DISK_TIMEOUT（刷盘超时）, FLUSH_SLAVE_TIMEOUT（同步到备超时）, SLAVE_NOT_AVAILABLE（备不可用），如果发送失败会抛出异常。

### Asynchronous Sending

Asynchronous sending is a sending method in which the sender sends messages continuously without waiting for the server to return a response.

异步发送是指发送方发出一条消息后，不等服务端返回响应，接着发送下一条消息的通讯方式。

 Asynchronous sending requires the implementation of the Asynchronous Send Callback Interface (SendCallback).

异步发送需要实现异步发送回调接口（SendCallback）。

After sending a message, the sender does not need to wait for a response from the server to send the next message. The sender receives the response from the server through the callback interface and handles the result. Asynchronous sending is generally used in time-consuming and response time sensitive business scenarios. For example, the video upload notifies the start of transcoding service, and notifies the push of transcoding result after transcoding is completed.

消息发送方在发送了一条消息后，不需要等待服务端响应即可发送第二条消息，发送方通过回调接口接收服务端响应，并处理响应结果。异步发送一般用于链路耗时较长，对响应时间较为敏感的业务场景。例如，视频上传后通知启动转码服务，转码完成后通知推送转码结果等。

The only difference between asynchronous and synchronous sending methods is the parameters for calling the sending interface. Asynchronous sending does not wait for the return of send() method, instead, it will carry the SendCallback implementation. The SendCallback interface has two methods (onSuccess and onException), indicating that the message is sent successfully or failed.

异步发送与同步发送代码唯一区别在于调用send接口的参数不同，异步发送不会等待发送返回，取而代之的是send方法需要传入 SendCallback 的实现，SendCallback 接口主要有onSuccess 和 onException 两个方法，表示消息发送成功和消息发送失败。

### One-Way Sending

The sender is only responsible for sending the message and does not wait for the server to return a response and no callback function is triggered, in other words, it only sends the request and does not wait for the answer. The process of sending messages in this way is very short, usually in the microsecond level. It is suitable for some scenarios where the time consumption is very short, but the reliability requirement is not high, such as log collection.

发送方只负责发送消息，不等待服务端返回响应且没有回调函数触发，即只发送请求不等待应答。此方式发送消息的过程耗时非常短，一般在微秒级别。适用于某些耗时非常短，但对可靠性要求并不高的场景，例如日志收集。

### Transactional Message Sending

In some scenarios where there is a strong need for data consistency, Apache RocketMQ transactional messages can be used to ensure consistency of upstream and downstream data.

在一些对数据一致性有强需求的场景，可以用 Apache RocketMQ 事务消息来解决，从而保证上下游数据的一致性。

Transactional messages are send in two phases. At first, a half message will be delivered, which refers to a message is successfully sent to the MQ server, but the server did not receive the second acknowledgement of the message from the Producer, then the message will be marked as “temporarily undeliverable” state.

事务消息发送分为两个阶段。第一阶段会发送一个半事务消息，半事务消息是指暂不能投递的消息，生产者已经成功地将消息发送到了 Broker，但是Broker 未收到生产者对该消息的二次确认，此时该消息被标记成“暂不能投递”状态。

The local transaction will be executed if the message is sent successfully, and a half message status (commit or rollback) will be delivered to the Broker depending on the local transaction results.

如果发送成功则执行本地事务，并根据本地事务执行成功与否，向 Broker 半事务消息状态（commit或者rollback），半事务消息只有 commit 状态才会真正向下游投递。

If the second acknowledgement of a transactional message is lost due to network flashback, Producer restart, etc., the Broker will find the message which is in "half message" state for a long time, and take the initiative to check the transaction status of the message (Commit or Rollback) from the Producer. Therefore, the downstream will receive the message if the local transaction is executed successfully, otherwise it will not. This ultimately ensures the consistency of the upstream and downstream data.

如果由于网络闪断、生产者应用重启等原因，导致某条事务消息的二次确认丢失，Broker 端会通过扫描发现某条消息长期处于“半事务消息”时，需要主动向消息生产者询问该消息的最终状态（Commit或是Rollback）。这样最终保证了本地事务执行成功，下游就能收到消息，本地事务执行失败，下游就收不到消息。总而保证了上下游数据的一致性。

### Transactional Message Sending Procedure

1. The Producer sends the half message to the RocketMQ Broker.

   生产者将半事务消息发送至 RocketMQ Broker。

2. After the RocketMQ Broker persists the message successfully, it returns an Ack to the Producer confirming that the message was sent successfully and it is a half message.

   RocketMQ Broker 将消息持久化成功之后，向生产者返回 Ack 确认消息已经发送成功，此时消息暂不能投递，为半事务消息。

3. The Producer starts executing the local transaction.

   生产者开始执行本地事务逻辑。

4. The Producer submits a second acknowledgement (Commit or Rollback) to the server based on the result of the local transaction, and the server receives the acknowledgment and processes the logic as follows.

   生产者根据本地事务执行结果向服务端提交二次确认结果（Commit或是Rollback），服务端收到确认结果后处理逻辑如下：

   - If the second acknowledgement result is Commit: the server marks the half message as deliverable and delivers it to the Consumer.

     二次确认结果为Commit：服务端将半事务消息标记为可投递，并投递给消费者。

   - If the second acknowledgement result is Rollback: the server will rollback the transaction and will not deliver the half message to the Consumer.

     二次确认结果为Rollback：服务端将回滚事务，不会将半事务消息投递给消费者。

5. In the special case of network disconnection or the Producer restarts, if the server does not receive the second acknowledgment result from the Producer, or the second acknowledgment result received by the server is Unknown, the server will initiate a rollback message to a Producer after a fixed time.

   在断网或者是生产者应用重启的特殊情况下，若服务端未收到发送者提交的二次确认结果，或服务端收到的二次确认结果为Unknown未知状态，经过固定时间后，服务端将对消息生产者即生产者集群中任一生产者实例发起消息回查。

The procedure of the transaction status check are as follows.

事务消息回查步骤如下

1. After receiving the transaction status check request, the Producer needs to verify the final result of the local transaction of the corresponding message.

   生产者收到消息回查后，需要检查对应消息的本地事务执行的最终结果。

2. The producer submits the second acknowledgment again based on the final result of the local transaction, and the server side will still processes the half message according to step 4.

   生产者根据检查得到的本地事务的最终状态再次提交二次确认，服务端仍按照步骤4对半事务消息进行处理。

### Core Concept

RocketMQ's messages will be sent to a Topic by a Producer, and a corresponding Consumer should be created to subscribe to the Topic and consume the messages within it. Before introducing the usage of Consumers, we will first clarify the concepts of Consumer Group, Consumer Offset, Push and Pull mode, etc.

消息通过生产者发送到某一个Topic，如果需要订阅该Topic并消费里面的消息的话，就要创建对应的消费者进行消费。在介绍消费者的使用方法之前，我们先介绍消费组、消费位点、推和拉等概念。


### Consumer and Consumer Group

One of the essential roles of the messaging system is to shave peaks and fill valleys. However, take the e-commerce scenario as an example, if the downstream Consumers do not have enough ability to consume messages, a large amount of transient traffic entering will pile the messages up on the server side. At this point, the end-to-end delay of the message (the time from a message being sent until being consumed) will increase. In addition, for the server side, continuing consuming historical data might generate cold reads. Therefore, the consumption ability needs to be improved to solve this problem, besides optimizing the time of message consumption, the simplest way is to expand the capacity of the Consumer.

消息系统的重要作用之一是削峰填谷，但比如在电商大促的场景中，如果下游的消费者消费能力不足的话，大量的瞬时流量进入会后堆积在服务端。此时，消息的端到端延迟（从发送到被消费的时间）就会增加，对服务端而言，一直消费历史数据也会产生冷读。因此需要增加消费能力来解决这个问题，除了去优化消息消费的时间，最简单的方式就是扩容消费者。

However, is it possible to increase the consumption ability by adding a random number of Consumers? First of all, the Consumer Group plays an essential role on the Consumer side. Multiple Consumers will be regarded as being in the same Consumer Group if they have the same Consumer Group set up.

但是否随意增加消费者就能提升消费能力？ 首先需要了解消费组的概念。在消费者中消费组的有非常重要的作用，如果多个消费者设置了相同的Consumer Group，我们认为这些消费者在同一个消费组内。

There are two consumption modes in Apache RocketMQ, which are:

在 Apache RocketMQ 有两种消费模式，分别是：

- Clustering: While applying the Clustering mode, each message requires to be processed by one consumer within the Consumer Group.

  集群消费模式：当使用集群消费模式时，RocketMQ 认为任意一条消息只需要被消费组内的任意一个消费者处理即可。

- Broadcasting: While applying the Broadcasting mode, RocketMQ broadcasts each message to all Consumers within the Consumer Group, ensuring that the message is consumed at least once by each consumer.

  广播消费模式：当使用广播消费模式时，RocketMQ 会将每条消息推送给消费组所有的消费者，保证消息至少被每个消费者消费一次。

The Clustering mode is suitable for scenarios where each message only needs to be processed once, which means the entire Consumer Group will receive the full amount of messages from Topic, and the Consumers within the Consumer Group share the consumption of these messages. Thus, the consumption ability can be increased or decreased by expanding or shrinking the number of consumers, as shown in the following figure, which is the most common consumption method.

集群消费模式适用于每条消息只需要被处理一次的场景，也就是说整个消费组会Topic收到全量的消息，而消费组内的消费分担消费这些消息，因此可以通过扩缩消费者数量，来提升或降低消费能力，具体示例如下图所示，是最常见的消费方式。

The Broadcasting mode is suitable for scenarios where each message needs to be processed by every consumer in the Consumer Group, which means that each consumer in the Consumer Group receives the full amount of messages from the subscribed Topic. Thus, even if the number of consumers is expanded, the consumption ability cannot be enhanced or reduced, as shown in the following example.

广播消费模式适用于每条消息需要被消费组的每个消费者处理的场景，也就是说消费组内的每个消费者都会收到订阅Topic的全量消息，因此即使扩缩消费者数量也无法提升或降低消费能力，具体示例如下图所示。

### Load Balancing

What is the allocation strategy under the Clustering mode where Consumers within the same Consumer Group share the full volume of messages received? Does it necessarily improve consumption ability if the number of consumers expands?

集群模式下，同一个消费组内的消费者会分担收到的全量消息，这里的分配策略是怎样的？如果扩容消费者是否一定能提升消费能力？

Apache RocketMQ provides various allocation policies in the Clustering mode, including average allocation strategy, machine room priority allocation strategy, consistent hash allocation strategy, etc. You can set the corresponding load balancing strategy by the following code:

Apache RocketMQ 提供了多种集群模式下的分配策略，包括平均分配策略、机房优先分配策略、一致性hash分配策略等，可以通过如下代码进行设置相应负载均衡策略。

The default allocation policy is the average allocation strategy, which is the most common strategy. Consumers within a Consumer Group under the average allocation strategy will consume equally according to a paging-like strategy.

默认的分配策略是平均分配，这也是最常见的策略。平均分配策略下消费组内的消费者会按照类似分页的策略均摊消费。

With the average allocation strategy, the parallelism of consumption can be increased by expanding the number of consumers.

在平均分配的算法下，可以通过增加消费者的数量来提高消费的并行度。比如下图中，通过增加消费者来提高消费能力。

However, it may not possible to increase the consumption ability by simply expanding the number of Consumers. For example, in the figure below, if the total queue number of Topic is less than the number of Consumers, the extra Consumers will not be assigned to the queue, and it will not be able to improve the consumption capacity even if there are more Consumers.

但也不是一味地增加消费者就能提升消费能力的，比如下图中Topic的总队列数小于消费者的数量时，消费者将分配不到队列，即使消费者再多也无法提升消费能力。

### Consumer Offset

As shown in the figure above, each queue in Apache RocketMQ records its own minimum and maximum offset. For Consumer Groups, there is also the concept of Consumer offsets. In Clustering mode, Consumer offsets are committed by the client and saved by the server. In contrast, Consumer offsets are saved by the client itself in Broadcasting mode. Normally the Consumer offsets are updated without message duplication, but if a Consumer crashes or a new Consumer joins the cluster, the load rebalancing will be triggered. After the rebalance is completed, each consumer may be assigned to a new queue instead of the previously processed queue. In order to be able to continue the previous work, the consumer needs to read the last submitted Consumer offset of each queue and then continue pulling messages from it. However, during the actual process, since the Consumer offsets submitted by the client to the server are not real-time, load rebalancing may result in a small number of duplicate messages.

如上图所示，在Apache RocketMQ中每个队列都会记录自己的最小位点、最大位点。针对于消费组，还有消费位点的概念，在集群模式下，消费位点是由客户端提给交服务端保存的，在广播模式下，消费位点是由客户端自己保存的。一般情况下消费位点正常更新，不会出现消息重复，但如果消费者发生崩溃或有新的消费者加入群组，就会触发重平衡，重平衡完成后，每个消费者可能会分配到新的队列，而不是之前处理的队列。为了能继续之前的工作，消费者需要读取每个队列最后一次的提交的消费位点，然后从消费位点处继续拉取消息。但在实际执行过程中，由于客户端提交给服务端的消费位点并不是实时的，所以重平衡就可能会导致消息少量重复。

### Push, Pull, and Long Polling

The consumption mode of Message Queue can be roughly divided into two kinds, which are Push and Pull.

MQ的消费模式可以大致分为两种，一种是推Push，一种是拉Pull。

Push mode is the server actively pushing messages to the client. The advantage is that the efficiency is better, but if the client does not run good flow control, once the server pushes a large number of messages to the client, it will cause the client messages to pile up or even crash.

Push是服务端主动推送消息给客户端，优点是及时性较好，但如果客户端没有做好流控，一旦服务端推送大量消息到客户端时，就会导致客户端消息堆积甚至崩溃。

Pull mode is the client needs to take the initiative to fetch data from the server. The advantage is that the client can consume according to its own consumption ability, but the frequency of pulling messages also needs to be controlled by the user. The frequent pull is possible to put pressure on the server and the client, and a long pull interval is easy to cause untimely consumption.

Pull是客户端需要主动到服务端取数据，优点是客户端可以依据自己的消费能力进行消费，但拉取的频率也需要用户自己控制，拉取频繁容易造成服务端和客户端的压力，拉取间隔长又容易造成消费不及时。

Apache RocketMQ provides both Push mode and Pull mode.

Apache RocketMQ既提供了Push模式也提供了Pull模式。

### Message Retry

If the Consumer fails to consume a message, RocketMQ will re-pitch the message to the Consumer after the retry interval, and if the message is not successfully consumed after the maximum number of retries, the message will be pitched to the dead message queue.

若Consumer消费某条消息失败，则RocketMQ会在重试间隔时间后，将消息重新投递给Consumer消费，若达到最大重试次数后消息还没有成功被消费，则消息将被投递至死信队列

Message retry is only effective for cluster mode; broadcast mode does not provide the message retry feature. In the broadcast mode, after a failed consumption, the failed message will not be retry and continue to consume new messages.

消息重试只针对集群消费模式生效；广播消费模式不提供失败重试特性，即消费失败后，失败消息不再重试，继续消费新的消息

- Maximum number of retries: the maximum number of times a message can be repeatedly delivered after a failed consumption.

  最大重试次数：消息消费失败后，可被重复投递的最大次数。

- Retry interval: the interval after the message consumption fails to be cast to the Consumer again for consumption, which only works in sequential consumption.

  重试间隔：消息消费失败后再次被投递给Consumer消费的间隔时间，只在顺序消费中起作用。

The retry mechanism of order consumption and concurrent consumption is not the same. After the order consumption fails to consume, it will first retry locally on the client side until the maximum number of retries, so as to avoid the failed messages being skipped and consuming the next message and disrupting the order of order consumption, while the concurrent consumption will re-cast the failed messages back to the server after the failed consumption, and then wait for the server to re-cast them back, during which it will normally consume the messages behind the queue.

顺序消费和并发消费的重试机制并不相同，顺序消费消费失败后会先在客户端本地重试直到最大重试次数，这样可以避免消费失败的消息被跳过，消费下一条消息而打乱顺序消费的顺序，而并发消费消费失败后会将消费失败的消息重新投递回服务端，再等待服务端重新投递回来，在这期间会正常消费队列后面的消息。

When concurrent consumption fails, it is not cast back to the original Topic, but to a special Topic named %RETRY%ConsumerGroupName, and each ConsumerGroup in cluster mode will correspond to a special Topic and will subscribe to that Topic.

并发消费失败后并不是投递回原Topic，而是投递到一个特殊Topic，其命名为%RETRY%ConsumerGroupName，集群模式下并发消费每一个ConsumerGroup会对应一个特殊Topic，并会订阅该Topic。

### Dead-Letter Queue

When a message fails to be consumed for the first time, RocketMQ will automatically retry the message. After reaching the maximum number of retries, if the consumption still fails, it means that the consumer cannot consume the message correctly under normal circumstances. At this point, the message is not immediately discarded, but sent to a special queue corresponding to that consumer, which is called a Dead-Letter Message, and the special queue storing the dead message is called a Dead-Letter Queue, which is a separate queue with a unique number of partitions under the Dead-Letter Topic. If a Dead-Letter Message is generated, the corresponding ConsumerGroup's Dead-Letter Topic name is %DLQ%ConsumerGroupName, and the messages in the Dead-Letter Queue will not be consumed again. You can use RocketMQ Admin tool or RocketMQ Dashboard to find out the information of the corresponding dead message.

当一条消息初次消费失败，RocketMQ会自动进行消息重试，达到最大重试次数后，若消费依然失败，则表明消费者在正常情况下无法正确地消费该消息。此时，该消息不会立刻被丢弃，而是将其发送到该消费者对应的特殊队列中，这类消息称为死信消息（Dead-Letter Message），存储死信消息的特殊队列称为死信队列（Dead-Letter Queue），死信队列是死信Topic下分区数唯一的单独队列。如果产生了死信消息，那对应的ConsumerGroup的死信Topic名称为%DLQ%ConsumerGroupName，死信队列的消息将不会再被消费。可以利用RocketMQ Admin工具或者RocketMQ Dashboard上查询到对应死信消息的信息。

### Single Master mode

This mode carries a higher risk, as a restart or failure of the Broker will result in the entire service being unavailable. It is not recommended in online environments, but can be used for local testing.

这种方式风险较大，因为 Broker 只有一个节点，一旦Broker重启或者宕机时，会导致整个服务不可用。不建议线上环境使用, 可以用于本地测试。

### Multiple master mode

The advantages and disadvantages of a cluster which is full of masters without slaves (e.g. 2 or 3 masters) is as follows:

一个集群内全部部署 Master 角色，不部署Slave 副本，例如2个Master或者3个Master，这种模式的优缺点如下：

Advantages: simple configuration, no impact on the application when a single master is restarted or down, when the disk is configured as RAID10, even if the machine is down and cannot be recovered, due to the reliability of RAID10 disks, messages will not be lost (asynchronous flush loses a small number of messages, synchronous flush does not lose a single message), and the performance is the highest;

优点：配置简单，单个Master宕机或重启维护对应用无影响，在磁盘配置为RAID10时，即使机器宕机不可恢复情况下，由于RAID10磁盘非常可靠，消息也不会丢（异步刷盘丢失少量消息，同步刷盘一条不丢），性能最高；

Disadvantages: During the downtime of a single machine, the messages that have not been consumed on this machine are not available for subscription before the machine is recovered, and the real-time nature of the messages will be affected.

缺点：单台机器宕机期间，这台机器上未被消费的消息在机器恢复之前不可订阅，消息实时性会受到影响。

### Multiple Master-Multiple Slave mode-asynchronous replication

Each Master is configured with one Slave, resulting in multiple Master-Slave pairs. In this High Availability (HA) setup, there is a brief message delay (in the milliseconds range) due to asynchronous replication. The advantages and disadvantages of this mode are as follows:

每个Master配置一个Slave，有多组 Master-Slave，HA采用异步复制方式，主备有短暂消息延迟（毫秒级），这种模式的优缺点如下：

Advantages: In the event of disk damage, the number of lost messages is minimal and the real-time nature of messages is not affected. Additionally, even if the Master goes down, consumers can still consume from the Slave, and this process is transparent to the application and does not require manual intervention, with performance being almost the same as the Multiple Master mode.

优点：即使磁盘损坏，消息丢失的非常少，且消息实时性不会受影响，同时Master宕机后，消费者仍然可以从Slave消费，而且此过程对应用透明，不需要人工干预，性能同多Master模式几乎一样；

Disadvantages: In the event of a Master outage or disk damage, a small number of messages may be lost.

缺点：Master宕机，磁盘损坏情况下会丢失少量消息。

### Multiple Master-Multiple Slave mode-synchronous dual writes

Each Master is configured with one Slave, resulting in multiple Master-Slave pairs. In this High Availability (HA) setup, synchronous dual writes are used, meaning that success is only returned to the application if both the Master and the Slave write successfully. The advantages and disadvantages of this mode are as follows:

每个Master配置一个Slave，有多对Master-Slave，HA采用同步双写方式，即只有主备都写成功，才向应用返回成功，这种模式的优缺点如下：

Advantages: There are no single points of failure for either data or service, and in the event of a Master outage, there is no message delay and both service availability and data availability are very high.

优点：数据与服务都无单点故障，Master宕机情况下，消息无延迟，服务可用性与数据可用性都非常高；

Disadvantages: Performance is slightly lower than the asynchronous replication mode (about 10% lower), the round-trip time for sending a single message is slightly higher, and in the current version, the standby cannot automatically switch to the primary after the primary node goes down.

缺点：性能比异步复制模式略低（大约低10%左右），发送单个消息的RT会略高，且目前版本在主节点宕机后，备机不能自动切换为主机。

### Precautions for sending messages

#### The use of Tags

An application can use a Topic, and message subtypes can be identified as tags. tags can be set freely by the application. Only when the producer sets tags when sending messages, the consumer can use tags to filter messages through the broker when subscribing to messages：message.setTags("TagA").

一个应用尽可能用一个Topic，而消息子类型则可以用tags来标识。tags可以由应用自由设置，只有生产者在发送消息设置了tags，消费方在订阅消息时才可以利用tags通过broker做消息过滤：message.setTags("TagA")。

#### The use of Keys

The unique identifier of each message at the service level must be set to the keys field to locate message loss problems in the future. The server creates an index (hash index) for each message, and the application can query the content of the message by topic and key, and by whom the message was consumed. Since it is a hash index, make sure that the key is as unique as possible to avoid potential hash collisions.

每个消息在业务层面的唯一标识码要设置到keys字段，方便将来定位消息丢失问题。服务器会为每个消息创建索引（哈希索引），应用可以通过topic、key来查询这条消息内容，以及消息被谁消费。由于是哈希索引，请务必保证key尽可能唯一，这样可以避免潜在的哈希冲突。

#### Printing Logs

The SendResult and key fields must be printed to print the message log if the message is sent successfully or failed. send Indicates that the message is sent successfully as long as no exception is thrown. There are multiple states for a successful send, defined in sendResult. Each state is described as follows: 

消息发送成功或者失败要打印消息日志，务必要打印SendResult和key字段。send消息方法只要不抛异常，就代表发送成功。发送成功会有多个状态，在sendResult里定义。以下对每个状态进行说明：

- **SEND_OK**

The message was sent successfully. Procedure Note that successful message delivery does not mean it is reliable. To ensure that no messages are lost, you should also enable the sync Master server or sync flush, which is SYNC_MASTER or SYNC_FLUSH.

消息发送成功。要注意的是消息发送成功也不意味着它是可靠的。要确保不会丢失任何消息，还应启用同步Master服务器或同步刷盘，即SYNC_MASTER或SYNC_FLUSH。

- **FLUSH_DISK_TIMEOUT**

The message is sent successfully but disk flushing times out. At this point, the message has entered the server queue (memory), only the server downtime, the message will be lost. In the message storage configuration parameters, you can set the disk flushing mode and the synchronization flush time. If the Broker server is set to FlushDiskType=SYNC_FLUSH (asynchronous flush by default), if the Broker server does not flush disks during the synchronous flush time (5s by default), The state, flush timeout, will be returned.

消息发送成功但是服务器刷盘超时。此时消息已经进入服务器队列（内存），只有服务器宕机，消息才会丢失。消息存储配置参数中可以设置刷盘方式和同步刷盘时间长度，如果Broker服务器设置了刷盘方式为同步刷盘，即FlushDiskType=SYNC_FLUSH（默认为异步刷盘方式），当Broker服务器未在同步刷盘时间内（默认为5s）完成刷盘，则将返回该状态——刷盘超时。

- **FLUSH_SLAVE_TIMEOUT**

The message was sent successfully, but the server timed out when synchronizing the message to the Slave. At this point, the message has entered the server queue, only the server downtime, the message will be lost. If the role of the Broker server is SYNC_MASTER (ASYNC_MASTER by default) and the secondary Broker server does not complete synchronization with the primary server within the synchronization flush time (default: 5 seconds), This state is returned -- data synchronization to the Slave server has timed out.

消息发送成功，但是服务器同步到Slave时超时。此时消息已经进入服务器队列，只有服务器宕机，消息才会丢失。如果Broker服务器的角色是同步Master，即SYNC_MASTER（默认是异步Master即ASYNC_MASTER），并且从Broker服务器未在同步刷盘时间（默认为5秒）内完成与主服务器的同步，则将返回该状态——数据同步到Slave服务器超时。

- **SLAVE_NOT_AVAILABLE**

The message was successfully sent, but the Slave was unavailable. Procedure At this point, the message has entered the Master server queue, only the Master server downtime, the message will be lost. If the role of the Broker server is SYNC_MASTER (ASYNC_MASTER by default) but no slave Broker server is configured, the broker returns the status that no Slave server is available.

消息发送成功，但是此时Slave不可用。此时消息已经进入Master服务器队列，只有Master服务器宕机，消息才会丢失。如果Broker服务器的角色是同步Master，即SYNC_MASTER（默认是异步Master服务器即ASYNC_MASTER），但没有配置slave Broker服务器，则将返回该状态——无Slave服务器可用。

### Handling method for message sending failure

The send method of Producer itself supports internal retry. The retry logic is as follows:

Producer的send方法本身支持内部重试，重试逻辑如下：

- Retry a maximum of two times (2 times for synchronous and 0 times for asynchronous).

  至多重试2次（同步发送为2次，异步发送为0次）。

- If the delivery fails, it is routed to the next Broker. The total time for this method should not exceed the value set by sendMsgTimeout, which defaults to 10s.

  如果发送失败，则轮转到下一个Broker。这个方法的总耗时时间不超过sendMsgTimeout设置的值，默认10s。

- If it sends a message to the broker that generates a timeout exception, it will not be retried.

  如果本身向broker发送消息产生超时异常，就不会再重试。

The above strategies also guarantee the success of message sending to a certain extent. If the service has high requirements on message reliability, you are advised to add retry logic. For example, if the send method fails to be invoked, the system tries to store the message to the db and retry periodically by the background thread to ensure that the message reaches the Broker.

以上策略也是在一定程度上保证了消息可以发送成功。如果业务对消息可靠性要求比较高，建议应用增加相应的重试逻辑：比如调用send同步方法发送失败时，则尝试将消息存储到db，然后由后台线程定时重试，确保消息一定到达Broker。

The reason why the above db retry method is not integrated into the MQ client, but requires the application to complete by itself, is mainly based on the following considerations: First, the MQ client is designed as a stateless mode, convenient for arbitrary horizontal expansion, and the consumption of machine resources is only cpu, memory, network. Secondly, if the MQ client is internally integrated with a KV storage module, the data can only be reliable if the synchronous disk fall, and the synchronous disk fall itself has a large performance overhead, so it usually uses asynchronous disk fall, and because the application closure process is not controlled by MQ operation and maintenance personnel, it may often happen kill -9 such violent closure. Resulting in data not timely drop disk and loss. Third, the machine where the Producer resides has low reliability and is generally virtual machines, which are not suitable for storing important data. In summary, it is recommended that the retry process be controlled by the application.

上述db重试方式为什么没有集成到MQ客户端内部做，而是要求应用自己去完成，主要基于以下几点考虑：首先，MQ的客户端设计为无状态模式，方便任意的水平扩展，且对机器资源的消耗仅仅是cpu、内存、网络。其次，如果MQ客户端内部集成一个KV存储模块，那么数据只有同步落盘才能较可靠，而同步落盘本身性能开销较大，所以通常会采用异步落盘，又由于应用关闭过程不受MQ运维人员控制，可能经常会发生 kill -9 这样暴力方式关闭，造成数据没有及时落盘而丢失。第三，Producer所在机器的可靠性较低，一般为虚拟机，不适合存储重要数据。综上，建议重试过程交由应用来控制。

### Select oneway to send

In general, a message is sent as follows:

通常消息的发送是这样一个过程：

- The client sends a request to the server

  客户端发送请求到服务器

- The server handles the request

  服务器处理请求

- The server returns a reply to the client

  服务器向客户端返回应答

Therefore, the time taken to send a message is the sum of the above three steps. However, some scenarios require a very short time, but do not have high reliability requirements. For example, log collection applications can be invoked in oneway mode. On the client side, sending a request is only the cost of a system call of the operating system, that is, writing data to the socket buffer of the client, which usually takes microseconds.

所以，一次消息发送的耗时时间是上述三个步骤的总和，而某些场景要求耗时非常短，但是对可靠性要求并不高，例如日志收集类应用，此类应用可以采用oneway形式调用，oneway形式只发送请求不等待应答，而发送请求在客户端实现层面仅仅是一个操作系统系统调用的开销，即将数据写入客户端的socket缓冲区，此过程耗时通常在微秒级。

### Client Configuration

In contrast to RocketMQ's cluster of brokers, both producers and consumers are clients. This section describes the behavior configuration common to producers and consumers.

相对于RocketMQ的Broker集群，生产者和消费者都是客户端。本小节主要描述生产者和消费者公共的行为配置。

### Client addressing mode

RocketMQ enables clients to find NameServer and then NameServer to find Broker. As shown in the following figure, the configuration mode ranges from high to low. The higher priority overrides the lower priority.

RocketMQ可以令客户端找到Name Server, 然后通过Name Server再找到Broker。如下所示有多种配置方式，优先级由高到低，高优先级会覆盖低优先级。

- The NameServer address is specified in the code, and multiple NameServer addresses are separated by semicolons 
  ```java
  producer.setNamesrvAddr("192.168.0.1:9876;192.168.0.2:9876");  
  
  consumer.setNamesrvAddr("192.168.0.1:9876;192.168.0.2:9876");
  ```

- The NameServer address is specified in the Java startup parameter

  ```text
  -Drocketmq.namesrv.addr=192.168.0.1:9876;192.168.0.2:9876  
  ```

- The environment variable specifies the NameServer address

  ```text
  export   NAMESRV_ADDR=192.168.0.1:9876;192.168.0.2:9876   
  ```

- HTTP static server addressing (default)

After the client is started, it periodically accesses a static HTTP server with the following address:http://jmenv.tbsite.net:8080/rocketmq/nsaddr，The URL returns something like this: `192.168.0.1:9876;192.168.0.2:9876`   

客户端启动后，会定时访问一个静态HTTP服务器，地址如下：http://jmenv.tbsite.net:8080/rocketmq/nsaddr，这个URL的返回内容如下：

By default, the client accesses the HTTP server every 2 minutes and updates the local NameServer address. The URL is hardcoded in the code. You can change the server to be accessed by modifying the /etc/hosts file, for example, adding the following configuration to /etc/hosts:`10.232.22.67    jmenv.taobao.net`   

客户端默认每隔2分钟访问一次这个HTTP服务器，并更新本地的Name Server地址。URL已经在代码中硬编码，可通过修改/etc/hosts文件来改变要访问的服务器，例如在/etc/hosts增加如下配置：

Static HTTP server addressing is recommended. It is easy to deploy clients and the NameServer cluster can be hot upgraded.

推荐使用HTTP静态服务器寻址方式，好处是客户端部署简单，且Name Server集群可以热升级。

### The consumption process is idempotent

RocketMQ cannot avoid message duplications (Exactly Once), so if the business is very sensitive to consumption duplications, it is important to de-process at the business level. This can be done with the help of relational databases. You first need to determine a unique key for the message, either an msgId or a unique identifying field in the message content, such as an order id. Determine if the unique key exists in the relational database before consumption. If not, insert and consume, otherwise skip. (The actual process should consider the atomicity problem, determine whether there is a primary key conflict, then the insertion failed, directly skip)

RocketMQ无法避免消息重复（Exactly-Once），所以如果业务对消费重复非常敏感，务必要在业务层面进行去重处理。可以借助关系数据库进行去重。首先需要确定消息的唯一键，可以是msgId，也可以是消息内容中的唯一标识字段，例如订单Id等。在消费之前判断唯一键是否在关系数据库中存在。如果不存在则插入，并消费，否则跳过。（实际过程要考虑原子性问题，判断是否存在可以尝试插入，如果报主键冲突，则插入失败，直接跳过）

MsgId must be a globally unique identifier, but in practice, there may be cases where the same message has two different msgIds (consumer active retransmission, duplication due to client reinvestment mechanism, etc.), which necessitates repeated consumption of business fields.

msgId一定是全局唯一标识符，但是实际使用中，可能会存在相同的消息有两个不同msgId的情况（消费者主动重发、因客户端重投机制导致的重复等），这种情况就需要使业务字段进行重复消费。

### Slow consumption processing methods

#### Increase consumption parallelism

The vast majority of message consumption is IO intensive, that is, it may be operating on a database or calling an RPC, and the rate of consumption for this type of consumption depends on the throughput of the back-end database or external system. By increasing consumption parallelism, the total consumption throughput can be improved, but when the parallelism increases to a certain degree, it will decrease. Therefore, the application must set a reasonable degree of parallelism. There are several ways to modify consumption parallelism:

绝大部分消息消费行为都属于 IO 密集型，即可能是操作数据库，或者调用 RPC，这类消费行为的消费速度在于后端数据库或者外系统的吞吐量，通过增加消费并行度，可以提高总的消费吞吐量，但是并行度增加到一定程度，反而会下降。所以，应用必须要设置合理的并行度。 如下有几种修改消费并行度的方法：

- In the same ConsumerGroup, we increase the number of Consumer instances to improve parallelism (note that Consumer instances exceeding the subscription queue are invalid). You can add a machine, or start multiple processes on an existing machine.

  同一个 ConsumerGroup 下，通过增加 Consumer 实例数量来提高并行度（需要注意的是超过订阅队列数的 Consumer 实例无效）。可以通过加机器，或者在已有机器启动多个进程的方式。

- Improve the consumption parallel thread of a single Consumer by modifying parameters consumeThreadMin and consumeThreadMax.

  提高单个 Consumer 的消费并行线程，通过修改参数 consumeThreadMin、consumeThreadMax实现。

#### Consumption in bulk

If some business processes support batch consumption, the consumption throughput can be greatly improved. For example, the application of order deduction takes 1 s to process one order at a time, and only 2 s to process 10 orders at a time. In this way, the consumption throughput can be greatly improved. By setting the consumer consumeMessageBatchMaxSize return a parameter, the default is 1, namely consumption one message, for example, is set to N, so the number of messages every time consumption less than or equal to N.

某些业务流程如果支持批量方式消费，则可以很大程度上提高消费吞吐量，例如订单扣款类应用，一次处理一个订单耗时 1 s，一次处理 10 个订单可能也只耗时 2 s，这样即可大幅度提高消费的吞吐量，通过设置 consumer的 consumeMessageBatchMaxSize 返个参数，默认是 1，即一次只消费一条消息，例如设置为 N，那么每次消费的消息数小于等于 N。

#### Skip non-important messages

In case of message pile-up, if the consumption rate cannot keep up with the delivery rate, and if the business is not demanding enough data, you can choose to discard unimportant messages. For example, when a queue accumulates more than 100,000 messages, try to discard some or all of them so that you can quickly catch up with sending messages.

发生消息堆积时，如果消费速度一直追不上发送速度，如果业务对数据要求不高的话，可以选择丢弃不重要的消息。例如，当某个队列的消息数堆积到100000条以上，则尝试丢弃部分或全部消息，这样就可以快速追上发送消息的速度

#### Optimize the per-message consumption process
For example, the consumption process of a message is as follows:

- Query [data 1] from DB according to message
- Query [data 2] from DB according to message
- Complex business calculations
- Insert [data 3] into DB
- Insert [data 4] into DB

举例如下，某条消息的消费过程如下：

- 根据消息从 DB 查询【数据 1】
- 根据消息从 DB 查询【数据 2】
- 复杂的业务计算
- 向 DB 插入【数据 3】
- 向 DB 插入【数据 4】

There are four interactions with DB during the consumption of this message. If we calculate each interaction as 5ms, the total time is 20ms. Assuming that the service computation takes 5ms, the total time is 25ms. Therefore, if the four DB interactions can be optimized to two, the total time can be optimized to 15ms, which means that the overall performance is improved by 40%. Therefore, if the application is sensitive to delay, the DB can be deployed on SSD disks. Compared with SCSI disks, the RT of the former is much smaller.

这条消息的消费过程中有4次与 DB的 交互，如果按照每次 5ms 计算，那么总共耗时 20ms，假设业务计算耗时 5ms，那么总过耗时 25ms，所以如果能把 4 次 DB 交互优化为 2 次，那么总耗时就可以优化到 15ms，即总体性能提高了 40%。所以应用如果对时延敏感的话，可以把DB部署在SSD硬盘，相比于SCSI磁盘，前者的RT会小很多。

#### Consumption print log

If the number of messages is small, you are advised to print messages in the consumption entry method, which takes a long time to consume.

如果消息量较少，建议在消费入口方法打印消息，消费耗时等，方便后续排查问题。

If you can print each message consuming time, it will be more convenient to troubleshoot online problems such as slow consumption.

如果能打印每条消息消费耗时，那么在排查消费慢等线上问题时，会更方便。

### Other Consumption Tips

#### About consumers and subscriptions

The first thing to note is that different consumer groups can consume several topics independently, and each consumer group has its own consumption offset. Make sure that the subscription information of each consumer within the same group is consistent.

第一件需要注意的事情是，不同的消费者组可以独立的消费一些 topic，并且每个消费者组都有自己的消费偏移量，请确保同一组内的每个消费者订阅信息保持一致。

#### About Ordered Messages

Consumers will lock each message queue to ensure that they are consumed one by one, which causes performance degradation, but is useful when you are concerned about message order. We do not recommend throwing an exception, you can return ConsumeOrderlyStatus. SUSPEND_CURRENT_QUEUE_A_MOMENT instead.

消费者将锁定每个消息队列，以确保他们被逐个消费，虽然这将会导致性能下降，但是当你关心消息顺序的时候会很有用。我们不建议抛出异常，你可以返回 ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT 作为替代。

#### About Concurrent consumption
As the name suggests, the consumer will concurrent consumption of these messages, it is recommended that you use it to get good performance, we do not recommend throwing an exception, you can return ConsumeConcurrentlyStatus.RECONSUME_LATER instead.

顾名思义，消费者将并发消费这些消息，建议你使用它来获得良好性能，我们不建议抛出异常，你可以返回 ConsumeConcurrentlyStatus.RECONSUME_LATER 作为替代。

#### Consume Status is about consumption status

For concurrent consumption listeners, you can return RECONSUME_LATER to notify the consumer that the message cannot be consumed now and that it is expected to be consumed again later. You can then continue consuming other messages. For an ordered message listener, you can't skip the message because you care about its order, but you can go back to SUSPEND_CURRENT_QUEUE_A_MOMENT and tell the consumer to wait.

对于并发的消费监听器，你可以返回 RECONSUME_LATER 来通知消费者现在不能消费这条消息，并且希望可以稍后重新消费它。然后，你可以继续消费其他消息。对于有序的消息监听器，因为你关心它的顺序，所以不能跳过消息，但是你可以返回SUSPEND_CURRENT_QUEUE_A_MOMENT 告诉消费者等待片刻。

#### About Blocking

Blocking listeners is not recommended because it blocks the thread pool and may eventually terminate the consuming process

不建议阻塞监听器，因为它会阻塞线程池，并最终可能会终止消费进程

#### About thread count Settings

Consumers use ThreadPoolExecutor to consume messages internally, so you can change it by setting setConsumeThreadMin or setConsumeThreadMax.

消费者使用 ThreadPoolExecutor 在内部对消息进行消费，所以你可以通过设置 setConsumeThreadMin 或 setConsumeThreadMax 来改变它。

#### About the consumption position

When creating a new consumer group, you need to decide whether you want to consume the history messages already in the Broker. CONSUME_FROM_LAST_OFFSET will ignore the history messages and consume any messages generated later. CONSUME_FROM_FIRST_OFFSET will consume every information that exists in the Broker. You can also use CONSUME_FROM_TIMESTAMP to consume messages generated after a specified timestamp.

当建立一个新的消费者组时，需要决定是否需要消费已经存在于 Broker 中的历史消息CONSUME_FROM_LAST_OFFSET 将会忽略历史消息，并消费之后生成的任何消息。CONSUME_FROM_FIRST_OFFSET 将会消费每个存在于 Broker 中的信息。你也可以使用 CONSUME_FROM_TIMESTAMP 来消费在指定时间戳后产生的消息。

### Broker Role

Broker roles are classified into ASYNC_MASTER, SYNC_MASTER, and SLAVE. If you have strict requirements on message reliability, deploy SYNC_MASTER plus SLAVE. If message reliability is not required, deploy ASYNC_MASTER plus SLAVE. If testing is only convenient, you can select ASYNC_MASTER only or SYNC_MASTER only deployment.

Broker 角色分为 ASYNC_MASTER（异步主机）、SYNC_MASTER（同步主机）以及SLAVE（从机）。如果对消息的可靠性要求比较严格，可以采用 SYNC_MASTER加SLAVE的部署方式。如果对消息可靠性要求不高，可以采用ASYNC_MASTER加SLAVE的部署方式。如果只是测试方便，则可以选择仅ASYNC_MASTER或仅SYNC_MASTER的部署方式。

### FlushDiskType

Compared with ASYNC_FLUSH, SYNC_FLUSH suffers from performance loss but is more reliable. Therefore, the trade-off must be made based on the actual service scenario.

SYNC_FLUSH（同步刷新）相比于ASYNC_FLUSH（异步处理）会损失很多性能，但是也更可靠，所以需要根据实际的业务场景做好权衡。

### RocketMQ EventBridge Core Concept

Understanding the core concepts in EventBridge can help us better analyze and use EventBridge. This article focuses on introducing the terms included in EventBridge:

- EventSource: the source of the event. Used to manage events sent to EventBridge, all events sent to EventBridge must be marked with the source name information, corresponding to the source field in the CloudEvent event body.
- EventBus: the event bus. Used to store events sent to EventBridge.
- EventRule: event rule. When a consumer needs to subscribe to events, they can configure filtering and transformation information through rules to push events to the designated target endpoint.
- FilterPattern: event filtering pattern, used to configure filtering of target endpoints in rules.
- Transform: event transformation, converting the event format to the data format required by the target endpoint.
- EventTarget: the target endpoint of the event, which is the actual event consumer.

Next, we will expand on these concepts in more detail.

理解EventBridge中的核心概念，能帮助我们更好的分析和使用EventBridge。本文重点介绍下EventBridge中包含的术语：

- EventSource：事件源。用于管理发送到EventBridge的事件，所有发送到EventBridge中的事件都必须标注事件源名称信息，对应CloudEvent事件体中的source字段。
- EventBus：事件总线。用于存储发送到EventBridge的事件。
- EventRule：事件规则。当消费者需要订阅事件时，可以通过规则配置过滤和转换信息，将事件推送到指定的目标端。
- FilterPattern：事件过滤模式，用于在规则中配置过滤出目标端需要的事件。
- Transform：事件转换，将事件格式转换成目标端需要的数据格式。
- EventTarget：事件目标端，即我们真正的事件消费者。

下面，我们具体展开：

### EventSource

Event source represents the origin of the event and is used to describe a category of events, generally corresponding one-to-one with microservice systems. For example: transaction event source, attendance event source, etc. Event source is a large classification for events, and a single event source often contains multiple event types (type), such as a transaction event source may contain: order events, payment events, refund events, etc.

Additionally, it is worth noting that event source is not used to describe the entity that caused the event. Instead, in CloudEvent, we generally use subject to represent the entity resource that caused the event. The event source is similar to the large category divisions in a market economy department store, such as fresh food area, daily necessities area, household appliances area, etc. In the event center "department store", we can quickly find the event we need through the event source.

事件源，代表事件发生的源头，用来描述一类事件，一般与微服务系统一一对应。比如：交易事件源、考勤事件源等等。事件源，是对事件一个大的分类，一个事件源下面，往往会包含多种事件类型(type)，比如交易事件源下面，可能包含：下单事件、支付事件、退货事件等等。

另外，需要值得注意的是，事件源并不用来描述发生事件的实体，取而代之的是，在CloudEvent中，我们一般选用subject来表示产生这个事件的实体资源。事件源有点像市场经济大卖场中的大类分区，例如：生鲜区、日化日用区、家用电器区等等。在事件中心这个"大卖场"，我们可以通过事件源快速的找到我们需要的事件。

### EventBus

The event bus is where events are stored, and it can have multiple implementations including Local, RocketMQ, Kafka, etc.

When the event producer sends an event, they must specify the event bus. The event bus is a first-class citizen in EventBridge, and all other resources form logical isolation around the event bus, that is: event sources and event rules must belong to a specific event bus. Event sources and event rules under different event buses can have the same name, but event sources and rules under the same event bus must have unique names.

事件总线是存储事件的地方，其下可以有多种实现，包括Local、RocketMQ、Kafka等。

事件生产者发送事件的时候，必须指定事件总线。事件总线是EventBridge的一等公民，其他所有资源都围绕事件总线形成逻辑上的隔离，即：事件源、事件规则必须都隶属于某一个事件总线下。不同事件总线下的事件源和事件规则可以重名，但是同一个事件总线下的事件源和规则必须不重名。

### EventRule

When a consumer needs to subscribe to events, they can configure filtering and transformation information through event rules, and push events to the designated target endpoint. Therefore, event rules include three parts: event filtering + event transformation + event target.

当消费者需要订阅事件时，可以通过事件规则配置过滤和转换信息，将事件推送到指定的目标端。所以，事件规则包含三部分：事件过滤+事件转换+事件目标。

### FilterPattern

By using event filtering patterns, we can filter events on the event bus and only push the events that the target endpoint needs, thus reducing unnecessary opening and relieving the pressure on the consumer's target endpoint. Currently, EventBridge supports the following event filtering capabilities:

- Specified value matching
- Prefix matching
- Suffix matching
- Exclusion matching
- Numeric matching
- Array matching
- And complex combination logic matching

(Details will be covered in other articles)

通过事件过滤模式，我们可以对事件总线上的事件进行过滤，只将目标端需要的事件推送过去，以减少不必要的开通，同时减轻消费者 Target端的压力。目前EventBridge支持的事件过滤能力包括：

- 指定值匹配
- 前缀匹配
- 后缀匹配
- 除外匹配
- 数值匹配
- 数组匹配
- 以及复杂的组合逻辑匹配

（详细介绍待见其他文章）

### Transform

Event producers' events may be subscribed to by multiple consumers, but the data format needed by different consumers is often different. In this case, it is necessary to convert the event produced by the producer into the event format that the consumer target end needs. Currently, EventBridge supports the following event conversion capabilities:

- Complete events: No conversion, directly delivering the original CloudEvents;
- Partial events: Extracting the content that needs to be delivered to the event target through JsonPath syntax from CloudEvents;
- Constants: The event only serves as a trigger, and the delivered content is a constant;
- Template converter: Flexibly rendering the delivered event format through the definition of a template.

(Details to be seen in other articles)

生产者的事件可能会同时被多个消费者订阅，但不同消费者需要的数据格式往往不同。这个时候，需要我们将生产者的事件，转换成消费者 Target端需要的事件格式。目前EventBridge支持的事件转换能力包括：

- 完整事件：不做转换，直接投递原生 CloudEvents；
- 部分事件：通过 JsonPath 语法从 CloudEvents 中提取出需要投递到事件目标的内容；
- 常量：事件只起到触发器的作用，投递内容为常量；
- 模板转换器：通过定义模板，灵活地渲染投递出去的事件格式；

（详细介绍待见其他文章）

### EventTarget

The event target is the event consumer in the EventBridge architecture. In this architecture, consumers only need to design their own business models and provide a common API (this API can be used to receive events and also for front-end management operations). EventBridge will then safely and reliably push events to the target consumer according to the data format defined by the API.

事件目标端，也即我们的事件消费者。在EventBridge架构中，消费者只需要按照自己的业务领域模型设计，提供一个公共的API（这个API既可用来接收事件，同时也用来前台管控面操作），EventBridge就会按照API定义需要的数据格式，将事件安全、可靠的推送给 Target消费者。

### RocketMQ EventBridge Overview

RocketMQ EventBridge is dedicated to helping users build high-reliability, low-coupling, and high-performance event-driven architectures. In event-driven architecture, microservices do not need to actively subscribe to external messages, but can instead centralize all entries that trigger changes in the microservice system to the API, and only need to focus on the current microservice's own business domain model definition and design of the API, without having to adapt and parse external service messages through a lot of glue code. EventBridge is responsible for safely and reliably adapting and delivering external service-generated events to the API designed by the current microservice.

When do we use RocketMQ messages and when do we use EventBridge events? What is the meaning of events, and what is the difference with messages?

RocketMQ EventBridge 致力于帮助用户构建高可靠、低耦合、高性能的事件驱动架构。在事件驱动架构中，微服务不需要主动订阅外部消息，而是可以把所有触发微服务系统发生改变的入口统一到API，并只需要关注当前微服务自己的业务领域模型定义和设计API，无需通过大量的胶水代码去适配解析外部服务的消息。EventBridge 则会负责将外部服务产生的事件安全的、可靠的适配并投递到当前微服务设计的API。

那什么时候我们使用RocketMQ消息，什么时候使用EventBridge事件？ 事件的含义是什么，和消息有什么区别？

### Message & Event

We have defined events as follows:

- Events refer to things that have already happened, especially important things.

The relationship between events and messages is as follows：

Messages include Command messages and Event messages. Command messages are operation commands sent by external systems to this system (as shown in the left part of the figure); Event messages are events that occur after the system receives a Command operation request and internal changes (as shown in the right part of the figure);

我们给事件做了如下定义：

- 事件是指过去已经发生的事，尤其是比较重要的事。

事件与消息的关系如下：

消息包含Command消息和Event消息。Command消息是外部系统发送给本系统的一条操作命令（如上图左半部分）；Event消息则是本系统收到Command操作请求，系统内部发生改变之后而产生了事件（如上图右半部分）；

### Four characteristics of an event

#### 1. Happened

Events are always "already happened". "Already happened" also means they are immutable. This feature is very important, when we process events and analyze events, it means that we can absolutely trust these events, as long as we receive the events, they must be true behaviors of the system.

Command represents an operation request, whether it truly happens or not cannot be known. For example:

- Turning on the kitchen lights

- Someone pressed the doorbell

- Account A received 100,000.

An event is a clear occurrence that has already happened, such as:

- The kitchen light being turned on
- Someone pressing the doorbell
- Account A receiving 100,000

事件，一定是“已发生”的。 “已发生”同时意味着是不可变的。这个特性非常重要，在我们处理事件、分析事件的时候，这就意味着，我们绝对可以相信这些事件，只要是收到的事件，一定是系统真实发生过的行为。

Command，则代表一种操作请求，是否真的发生不可得知，比如：

* 把厨房的灯打开
* 去按下门铃
* 转给A账户10w

Event，则是明确已经发生的事情。比如

* 厨房灯被打开了
* 有人按了门铃
* A账户收到了10w

#### 2. No expectation
An event is an objective description of a change in the state or attribute value of a thing, but it does not make any expectations about how to handle the event itself. In contrast, both Command and Query have expectations, they hope the system will make changes or return results, but the Event is just an objective description of a change in the system.

事件是客观的描述一个事物的状态或属性值的变化，但对于如何处理事件本身并没有做任何期望。 相比之下，Command和Query则都是有期望的，他们希望系统做出改变或则返回结果，但是Event只是客观描述系统的一个变化。

For example: the traffic signal, from green to yellow, just describes an objective fact, and there is no objective expectation in itself. In different countries and regions, different expectations are given to this event. For example, in Japan, yellow is equivalent to red, while in Russia, running a yellow light is tolerated.

举个例子： 交通信号灯，从绿灯变成黄灯，只是描述了一个客观事实，本身并没有客观期望。在不同国家地区，对这个事件赋予了不同的期望。 比如，在日本黄灯等于红灯，而在俄罗斯闯黄灯是被默许的。

Compared to Command messages：

- Events: are a bit like "market economy", goods are produced and placed in the large window of the shopping mall, consumers buy them back if they feel good, if no one buys them, the goods may expire and be wasted.
- Command message: is a bit like "planned economy", production is based on demand, designated distribution objects, and there is little waste.

与Command消息对比：

- 事件：有点像"市场经济"，商品被生产出来，摆放在商场的大橱窗里，消费者谁看着觉得好就买回去，如果一直没人买，商品可能就过期浪费了。
- Command消息：则有点像"计划经济"，按需生产，指定分配对象，也很少产生浪费。

#### 3. Naturally ordered and unique

The same entity cannot have both A and B occur at the same time, there must be a temporal relationship; if so, these two events must belong to different event types.

For example: for the same traffic light, it can't turn green and red at the same time, it can only turn into one state at a given moment. If we see two events with the same content, then it must have occurred twice and one happened before the other. This is valuable for processing data consistency and system behavior analysis (such as ABA scenarios): we not only see the final result of the system, but also the intermediate process that led to that result.

同一个实体，不能同时发生A又发生B，必有先后关系；如果是，则这两个事件必属于不同的事件类型。

比如：针对同一个交通信号灯，不能既变成绿灯，又变成红灯，同一时刻，只能变成一种状态。 如果我们看到了两个内容一样的事件，那么一定是发生了两次，而且一次在前，一次在后。这对于我们处理数据最终一致性、以及系统行为分析（比如ABA场景）都很有价值：我们看到的，不光光是系统的一个最终结果，而是看到变成这个结果之前的，一系列中间过程。

#### 4. Materialize

Events try to record the "crime scene" as completely as possible, because events do not know how consumers will use them, so they will be as detailed as possible. Including:

- When did the event occur?

- Who generated it?

- What type of event is it?

- What is the content of the event? What is the structure of the content?

Compared to common messages we see, as the upstream and downstream are generally determined, often in order to improve performance and transmission efficiency, messages will be as concise as possible, as long as it meets the consumer's needs specified by the "planned economy".

事件会尽可能的把“案发现场”完整的记录下来，因为事件不知道消费者会如何使用它，所以会做到尽量的详尽。包括：

- 什么时候发生的事件？

- 谁产生的？

- 是什么类型的事件？

- 事件的内容是什么？内容的结构是什么？

对比我们常见的消息，因为上下游一般是确定的，常常为了性能和传输效率，则会做到尽可能的精简，只要满足“计划经济”指定安排的消费者需求即可。

### RocketMQ EventBridge's typical application scenarios

#### Scenario 1: Event Notification

In microservices, we often encounter situations where messages produced in one microservice need to be notified to other consumers. Here we compare three ways:

微服务中，我们常常会遇到需要把一个微服务中生产的消息，通知给其他消费者。这里我们对比三种方式：

**A: Strong dependency method**

The producer actively calls the consumer's microservice and adapts the consumer's API. This design is undoubtedly very bad, the producer is strongly dependent on the consumer, deeply coupled. If a call to a consumer has an exception and no effective isolation is done, it is very likely to cause the entire microservice to hang. It is very poor when new consumers come in.

生产者主动调用消费者的微服务，并适配消费者的API。这种设计无疑是非常糟糕的，生产者强依赖消费者，深度耦合。万一调用某个消费者出现异常且未做有效隔离，极容易导致整个微服务Hang起。有新的消费者进来，扩展性也极差。

**B: Semi-decoupling method**

The producer sends the message to the message service, and the consumer subscribes to the message service to get the message and converts the message into the data format required by its own business domain model. This method achieved decoupling on the call chain, greatly reducing system risks, but for consumers, they still need to understand and parse the producer's business semantics and convert the message into the format needed for their own business domain. Under this method, when the consumer needs to subscribe to data from multiple producers, a large amount of glue code is needed to adapt to each message produced by the producer. In addition, when the upstream producer's message format changes, there is also a risk and operational cost.

生产者将消息发送到消息服务，消费者订阅消息服务获取消息，并将消息解析成自己业务领域模型中需要的数据格式。这种方式做到了调用链路上的解耦，极大的降低了系统风险，但是对于消费者来说，依旧需要去理解和解析生产者的业务语义，将消息转换成自己业务领域内需要的格式。这种方式下，当消费者需要订阅多个生产者的数据的时候，需要用大量的胶水代码，为每一个生产者产生的消息做适配。另外，当上游生产者的消息格式发生变化时，也会存在风险和运维成本。

**C: Complete decoupling method**

Under this method, consumers do not need to introduce SDK to subscribe to Broker, they only need to design API according to their own business domain model, and the message service will filter and convert upstream

这种方式下，消费者不需要引入SDK订阅Broker，只需要按照自己的业务领域模型设计API，消息服务会将上游的事件，过滤并转换成API需要的事件格式。既没有调用链路上的依赖，也没有业务上的依赖。当上游生产者的事件数据格式发生变化时，消息服务会做兼容性校验，可以拒绝生产者发送事件或则进行告警。

#### Scenario 2: Inter-system integration

Scenario 1 mainly focuses on the event communication between microservices within a single product. Scenario 2 mainly focuses on event communication between multiple products. In an enterprise, we often use multiple products, and many of these products may not be developed by ourselves, but are purchased as external SaaS services. In this case, it is difficult to make events flow between different external SaaS products, because these external SaaS products are not developed by ourselves and it is not easy to modify their code. The event center capability provided by EventBridge can help collect events generated by various products and organize and manage them well, just like the goods in a department store window, carefully arranged and equipped with instructions, for consumers to choose from, and also providing home delivery service.

场景1主要面向一个产品内部，各个微服务之间的事件通信。场景2则是主要面向多个产品之间的事件通信。在一个企业中，我们常常会用到多款产品，而且很多产品可能并不是我们自己开发的，而是购买的外部SaaS服务。这个时候，如果我们希望事件在不同外部SaaS产品之间流转是比较困难的，因为这些外部SaaS产品不是我们自己开发的，无法轻易的修改其中的代码。EventBridge提供的事件中心能力，能够帮助收集各个产品产生的事件，并很好的组织管理起来，就像大卖场橱窗里的商品，精心摆放准备好，配备介绍说明书，供消费者挑选，同时提供送货上门服务。

### How RocketMQ EventBridge works?

In order to address the problems mentioned in the above two scenarios, EventBridge approaches from five aspects:

为了解决上述两个应用场景中提到的问题，EventBridge从5个方便入手：

**1. Determine event standards:**

Because events are not for oneself, but for everyone. It has no clear consumer, and all are potential consumers. Therefore, we need to standardize the definition of events, so that everyone can understand, and be easy to understand. Currently, CloudEvent under CNCF has gradually become a widely recognized factual standard, so we choose CloudEvent as our EventBridge event standard.

因为事件不是给自己看的，而是给所有人看的。它没有明确的消费者，所有都是潜在的消费者。所以，我们需要规范化事件的定义，让所有人都能看得懂，一目了然。目前CNCF旗下的CloudEvent,以逐渐成为广泛的事实标准，因此，我们选取了CloudEvent 作为我们的EventBridge的事件标准。

**2. Establish event center:**

The event center contains all the events registered by various systems. This is like the market economy department store we mentioned above, which has a variety of events classified and arranged, and everyone can come in to see which events may be needed, and then buy them back.

事件中心里面有所有系统，注册上来的各种事件，这个就像我们上面说的市场经济大卖场，里面玲琅满目分类摆放了各种各样的事件，所有人即使不买，也都可以进来瞧一瞧，看一看，有哪些事件可能是我需要的，那就可以买回去。

**3. Define event format:**

Event format is used to describe the specific contents of events. This is equivalent to a sales contract in a market economy. The event format sent by the producer must be determined and cannot always change; the format in which the consumer receives events must also be determined, otherwise the entire market will be in chaos.

事件格式用来描述事件的具体内容。这相当于市场经济的一个买卖契约。生产者发送的事件格式是什么，得确定下来，不能总是变；消费者以什么格式接收事件也得确定下来，不然整个市场就乱套了。

**4. Subscription "rules":**

We need to give consumers the ability to deliver events to the target end, and filter and transform events before delivery so that it can adapt to the format of the target end API receiving parameters. We call this process creating a subscription rule.

 我们得给消费者一个，把投递事件到目标端的能力，并且投递前可以对事件进行过滤和转换，让它可以适配目标端API接收参数的格式，我们把这个过程叫做创建订阅规则。

**5. Event Bus:** 

Finally, we also need a place to store events, that is the event bus in the middle of the diagram.

最后我们还得有一个存储事件的地方，就是最图中最中间的事件总线。

### RocketMQ EventBridge Quick Start

RocketMQ EventBridge requires a message service to store events and a runtime to subscribe and push events. In this case, we choose Apache RocketMQ as our message service and Apache RocketMQ Connect as our runtime for subscribing and pushing events. Of course, you can also choose other message services instead, EventBridge does not impose any restrictions on this. In the future, EventBridge also plans to implement its own runtime based on OpenMessaging Connect API in order to better provide event-driven services.

RocketMQ EventBridge 需要一个消息服务来存储事件，另外需要一个Runtime来订阅并推送事件。这里我们选择 Apache RocketMQ 作为我们的消息服务，选择 Apache RocketMQ Connect 作为我们的Runtime来订阅和推送事件。当然，您也可以选择其他消息服务代替，EventBridge并不对此做限制。未来EventBridge也计划基于OpenMessaging Connect API 实现自己的Runtime，以便更好的提供事件驱动服务。

### RocketMQ MQTT Overview

The traditional message queue MQ is mainly used for message communication between services (ends), such as transaction messages, payment messages, logistics messages, etc. in the e-commerce field. However, under the general category of messages, there is another very important and common message field, that is, IoT terminal device messages. In recent years, we have seen the explosive growth of IoT device-oriented news arising from smart home and industrial interconnection, and the news on the mobile APP side of the mobile Internet, which has been developed for more than ten years, is still orders of magnitude huge. The order of magnitude of messages for terminal devices is many orders of magnitude larger than that of traditional servers and is still growing rapidly.

传统的消息队列MQ主要应用于服务（端）之间的消息通信，比如电商领域的交易消息、支付消息、物流消息等等。然而在消息这个大类下，还有一个非常重要且常见的消息领域，即IoT类终端设备消息。近些年，我们看到随着智能家居、工业互联而兴起的面向IoT设备类的消息正在呈爆炸式增长，而且已经发展十余年的移动互联网的手机APP端消息仍然是数量级庞大。面向终端设备的消息数量级比传统服务端的消息要大很多量级并仍然在快速增长。

If there is a unified message system (product) to provide multi-scenario computing (such as stream, event) and multi-scenario (IoT, APP) access, it is actually very valuable, because messages are also important data. There is only one system, which can minimize storage costs and effectively avoid the consistency problems and challenges caused by data synchronization between different systems.

如果可以有一个统一的消息系统（产品）来提供多场景计算（如stream、event）、多场景（IoT、APP）接入，其实是非常有价值的，因为消息也是一种重要数据，数据如果只存在一个系统内，可以最大地降低存储成本，同时可以有效地避免数据因在不同系统间同步带来的一致性难题和挑战。

Based on this, we introduced the RocketMQ-MQTT extension project to realize RocketMQ's unified access to the messages of IoT devices and servers, and provide integrated message storage and intercommunication capabilities.

基于此，我们引入了RocketMQ-MQTT这个扩展项目来实现RocketMQ统一接入IoT设备和服务端的消息，提供一体化消息存储和互通能力。

### MQTT Protocol

In the IoT terminal scenario, the MQTT protocol is widely used in the industry at present, which is a standard open protocol defined by the OASIS Alliance that originated from the IoT scenario of the Internet of Things. Because there are many types of IoT devices and different operating environments, a standard access protocol is particularly critical.

在IoT终端场景，目前业界广泛使用的是MQTT协议，是起源于物联网IoT场景，OASIS联盟定义的标准的开放式协议。因为IoT设备种类繁多，运行环境各异，一个标准的接入协议尤为关键。

The MQTT protocol defines a Pub/Sub communication model, which is similar to RocketMQ, but it is more flexible in the way of subscription, and can support multi-level Topic subscriptions (such as "/t/t1/t2"), and can even support Wildcard subscription (such as "/t/t1/+").

MQTT协议定义的是一个Pub/Sub的通信模型，这个与RocketMQ是类似的，不过其在订阅方式上比较灵活，可以支持多级Topic订阅（如 “/t/t1/t2”），甚至可以支持通配符订阅（如 “/t/t1/+”）。 