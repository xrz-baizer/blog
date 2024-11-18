# What is Spring Cloud Alibaba

Spring Cloud Alibaba is dedicated to providing a one-stop solution for micro-service development. This project contains the components necessary to develop distributed application services, making it easy for developers to use these components to develop distributed application services through the Spring Cloud programming model.

Relying on Spring Cloud Alibaba, you only need to add some annotations and a little configuration, you can connect Spring Cloud applications to Ali distributed application solutions, and quickly build distributed application systems through Ali middleware.

In addition, Ali Cloud also provides Spring Cloud Alibaba enterprise version micro-service solutions micro-service solutions, including non-intrusive service governance (full link gray scale, lossless up and down line, outlier instance removal, etc.), enterprise Nacos registration and configuration center, enterprise cloud native gateway and many other products.

Spring Cloud Alibaba 致力于提供微服务开发的一站式解决方案。此项目包含开发分布式应用服务的必需组件，方便开发者通过 Spring Cloud 编程模型轻松使用这些组件来开发分布式应用服务。

依托 Spring Cloud Alibaba，您只需要添加一些注解和少量配置，就可以将 Spring Cloud 应用接入阿里分布式应用解决方案，通过阿里中间件来迅速搭建分布式应用系统。

此外，Spring Cloud Alibaba 企业版，包括无侵入服务治理(全链路灰度，无损上下线，离群实例摘除等)，企业级 Nacos 注册配置中心和企业级云原生网关等众多产品。

## Spring Cloud microservice system

Spring Cloud is a one-stop solution for distributed microservices architecture, providing an easy-to-use programming model that makes it easy to build microservices on top of Spring Boot. Spring Cloud provides standards for building distributed systems with microservices at the core.

Spring Cloud itself is not an out-of-the-box framework; it is a set of microservices specifications with two generations of implementations.

- Spring Cloud Netflix is the first generation implementation of Spring Cloud and consists of Eureka, Ribbon, Feign, Hystrix and other components.
- Spring Cloud Alibaba is the second generation implementation of Spring Cloud, mainly composed of Nacos, Sentinel, Seata and other components.

Spring Cloud 是分布式微服务架构的一站式解决方案，它提供了一套简单易用的编程模型，使我们能在 Spring Boot 的基础上轻松地实现微服务系统的构建。 Spring Cloud 提供以微服务为核心的分布式系统构建标准。

Spring Cloud 本身并不是一个开箱即用的框架，它是一套微服务规范，共有两代实现。

- Spring Cloud Netflix 是 Spring Cloud 的第一代实现，主要由 Eureka、Ribbon、Feign、Hystrix 等组件组成。

- Spring Cloud Alibaba 是 Spring Cloud 的第二代实现，主要由 Nacos、Sentinel、Seata 等组件组成。

## Spring Cloud Alibaba positioning

Spring Cloud Alibaba is a one-stop solution for micro-service development launched by Alibaba in combination with its own rich micro-service practice, and is a major part of the second generation of Spring Cloud implementation. It has absorbed the core architecture ideas of Spring Cloud Netflix microservice framework and improved its performance. Since Spring Cloud Netflix entered the outage maintenance, Spring Cloud Alibaba gradually replaced it as the mainstream microservice framework.

Spring Cloud Alibaba is also the first open source project to enter the Spring community in China. In July 2018, Spring Cloud Alibaba was officially open source and incubated in the Spring Cloud incubator. In July 2019, Spring Cloud officially announced the graduation of Spring Cloud Alibaba and moved the warehouse to Alibaba Github OSS.

Spring Cloud Alibaba 是阿里巴巴结合自身丰富的微服务实践而推出的微服务开发的一站式解决方案，是 Spring Cloud 第二代实现的主要组成部分。吸收了 Spring Cloud Netflix 微服务框架的核心架构思想，并进行了高性能改进。自 Spring Cloud Netflix 进入停更维护后，Spring Cloud Alibaba 逐渐代替它成为主流的微服务框架。

同时 Spring Cloud Alibaba 也是国内首个进入 Spring 社区的开源项目。2018 年 7 月，Spring Cloud Alibaba 正式开源，并进入 Spring Cloud 孵化器中孵化；2019 年 7 月，Spring Cloud 官方宣布 Spring Cloud Alibaba 毕业，并将仓库迁移到 Alibaba Github OSS 下。


# Static compilation

## Introduction to Static Compilation Capability

The biggest change brought by Spring Boot 3.0 this time is the support of GraalVM's native image, which is also the part that they spend more time and energy on as emphasized in the official document. As an alternative to JRE, GraalVM technology pre-compiles Java applications through technologies such as Ahead Of Time (AOT), allowing Spring to learn more about the application when it runs the application, making the entire application start faster. In addition, the final application can be smaller and occupy less memory by eliminating some unnecessary content during the compilation process through the compilation tool. It is very friendly to some scenarios that require very high startup speed, such as Serverless and FaaS scenarios! This time, Spring Boot 3.0 directly migrated it from Spring Native to Spring Boot, which also indicates that the technology has gradually matured, and the Spring ecosystem has entered the GraalVM stage!

Spring Boot 3.0 本次带来最大的改动就是 GraalVM 原生镜像的支持，也是官方文档中强调的他们花费时间精力比较多的部分。 GraalVM 技术作为 JRE 的替代方案，其通过预先编译（Ahead Of Time，AOT）等技术对 Java 应用进行预先编译，让 Spring 在运行应用时掌握更多应用有关的信息，让整个应用启动速度更快。另外，通过编译工具在编译过程中通过消除一些不必要的内容可以让最终的应用更小，占用内存更低。对于一些对启动速度要求非常高的场景，比如 Serverless、FaaS 场景非常友好！ 本次 Spring Boot 3.0 直接将其正式从 Spring Native 迁入到 Spring Boot 中来，也预示着该项技术开始逐渐走向成熟，Spring 生态开始迈入 GraalVM 阶段！

Compared with the JVM compilation and deployment method, GraalVM has the following characteristics:

- Static analysis of the application starts from the main entry point during the application construction phase.
- When creating a native image, through code analysis, the inaccessible code will be deleted and will not become part of the executable file, so that the package size can be compressed to a certain extent.
- GraalVM cannot directly perceive the dynamic elements of the code. Therefore, for applications with reflection, serialization, and dynamic proxies, you need to provide relevant hint configuration files in advance to help parse the application. For related operations, refer to official documents.
- The application classpath is fixed at build time and cannot be changed.
- No lazy class loading, everything in the executable will be loaded into memory at startup.
- The supported Java applications have some restrictions in some aspects, so there is currently no guarantee that all previous Java applications can be directly built using GraalVM technology, and there may be incompatibility exceptions with a certain probability.

跟 JVM 编译部署方式相比，GraalVM 具有以下特点：

- 在应用构建阶段，从主入口点就开始进行应用程序的静态分析。
- 创建本机镜像时，通过代码分析，会将无法访问的代码删除，并且不会成为可执行文件的一部分，从而可在一定程度上压缩程序包大小。
- GraalVM 无法直接感知代码的动态元素，因此对于存在反射、序列化和动态代理的应用程序，需要提前提供相关 hint 配置文件，帮助解析应用程序，相关操作过程可参考官方文档。
- 应用程序类路径在构建时是固定的，不能更改。
- 没有惰性类加载，可执行文件中的所有内容都将在启动时加载到内存中。
- 支持的 Java 应用程序在某些方面存在一些限制，因此目前并不能保证之前的 Java 应用都可直接使用 GraalVM 技术进行应用构建，有一定概率会存在不兼容的异常情况。

## background

The following is the community’s tests related to the startup speed and runtime occupancy of the sample applications of the currently supported service registration and discovery modules after the upgrade to Spring Boot 3.0, using GraalVM to build native application images (the test process was measured on macOS 11.4, 2.6 GHz 6-Core Intel Core i7 processor, 16G memory environment and simulated 3 times to take the average value)

以下是社区对目前所支持的服务注册与发现模块相关示例应用在升级为 Spring Boot 3.0 以后，使用 GraalVM 构建原生应用镜像做的在启动速度和运行时占用内容相关的测试（测试过程在 macOS 11.4，2.6 GHz 6-Core Intel Core i7 处理器，16G 内存环境下分别模拟 3 次取平均值测得）

From the above comparison, it can be found that the latest Spring Cloud Alibaba application that supports Spring Boot 3.0 and is based on GraalVM will be greatly reduced in terms of startup speed, runtime memory usage, and application package size. This brings significant advantages to applications hosted on the cloud in the cloud-native era, allowing them to perform elastic expansion and contraction faster and reduce the overall cost of using the cloud for enterprises!

从上述对比可发现，最新支持 Spring Boot 3.0 基于 GraalVM 的 Spring Cloud Alibaba 应用会在启动速度、运行时内存占用和应用包大小方面得到大幅度降低，例如，其中服务注册消费应用启动速度提升了近 10 倍，运行时内存占用比原来降低了近乎 2/3，效果非常明显。这给云原生时代，托管在云上的应用带来了显著优势，让其可以更快地进行弹性扩缩容以及降低企业整体用云成本！

# Release Notes
## Graduation version dependencies (recommended)

Due to the large changes between Spring Boot 3.0, Spring Boot 2.7~2.4 and versions below 2.4, the Spring Boot version related to old projects of enterprise customers is still below Spring Boot 2.4. In order to meet the different needs of existing users and new users at the same time, the community With Spring Boot 3.0 and 2.4 as the dividing line, three branch iterations of 2022.x, 2021.x, and 2.2.x are maintained at the same time. If you don't want to upgrade across branches, if you want to use new features, please upgrade to the new version of the corresponding branch. In order to avoid dependency conflicts in the related construction process, we suggest that you can create projects through Cloud Native Application Initializer.

毕业版本依赖关系(推荐使用)

由于 Spring Boot 3.0，Spring Boot 2.7~2.4 和 2.4 以下版本之间变化较大，目前企业级客户老项目相关 Spring Boot 版本仍停留在 Spring Boot 2.4 以下，为了同时满足存量用户和新用户不同需求，社区以 Spring Boot 3.0 和 2.4 分别为分界线，同时维护 2022.x、2021.x、2.2.x 三个分支迭代。如果不想跨分支升级，如需使用新特性，请升级为对应分支的新版本。 为了规避相关构建过程中的依赖冲突问题，我们建议可以通过 云原生应用脚手架 进行项目创建。

## 2022.x branch

The Spring Cloud Alibaba versions adapted to Spring Boot 3.0, Spring Cloud 2022.x and above are arranged in the following table from newest to old (the latest version is marked with *): (Note that the naming method of this branch Spring Cloud Alibaba version has been adjusted. In the future, it will correspond to the Spring Cloud version. The first three digits are the Spring Cloud version, and the last digit is the extended version. For example, the first version of Spring Cloud Alibaba corresponding to the Spring Cloud 2022.0.0 version is: 2022.0.0.0, and the second version for: 2022.0.0.1 and so on)*


适配 Spring Boot 3.0，Spring Cloud 2022.x 版本及以上的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）： (注意，该分支 Spring Cloud Alibaba 版本命名方式进行了调整，未来将对应 Spring Cloud 版本，前三位为 Spring Cloud 版本，最后一位为扩展版本，比如适配 Spring Cloud 2022.0.0 版本对应的 Spring Cloud Alibaba 第一个版本为：2022.0.0.0，第个二版本为：2022.0.0.1，依此类推)

## FAQ

### Spring Cloud Alibaba maintains several branches, what are the corresponding differences? 

Spring Cloud Alibaba currently has three branchs actively maintained, namely 2.2.x, 2021.x, 2022.x

The version features are as follows:

- 2.2.x: Integrates functional modules related to service governance, such as off-site multi-active, label routing, Istio permission verification function.

- 2021.x: It is adapted to the Spring Cloud 2021.x series version and integrates various functional components of Spring Cloud Alibaba.

- 2022.x: Integrates Spring Cloud Alibaba's support for static compilation of GraalVM.

Spring Cloud Alibaba 目前有三个分支在积极维护，分别是 2.2.x，2021.x，2022.x
版本特性如下：

- 2.2.x：集成了服务治理相关的功能模块，比如异地多活, 标签路由，Istio 权限验证功能。

- 2021.x：适配了 Spring Cloud 2021.x 系列的版本，集成了 Spring Cloud Alibaba 各个功能组件。

- 2022.x：集成了 Spring Cloud Alibaba 对于 GraalVM 静态编译的支持。

### What is the difference between Spring Cloud Alibaba, Spring Cloud, and Spring Cloud Netflix? 

- Spring Cloud: A set of common patterns for distributed application development officially provided by Spring can also be understood as a unified abstract programming model for microservice development.

- Spring Cloud Netflix: A microservice framework implemented based on the Spring Cloud programming model, which is the earliest microservice framework. In recent years, Netflix has announced that most components are down for maintenance.
- Spring Cloud Alibaba: Alibaba provides a microservice framework based on the Spring Cloud programming model. Most of its components use components provided by Ali, which is more suitable for Chinese programmers.

- Spring Cloud：Spring 官方提供的分布式应用开发的一套共用模式，也可以理解成一套微服务开发的统一的抽象编程模型。
- Spring Cloud Netflix：基于 Spring Cloud 编程模型实现的微服务框架，是最早期的微服务框架。近年来，Netflix 宣布大多数组件停止维护。
- Spring Cloud Alibaba：Alibaba 提供的基于 Spring Cloud 编程模型实现的微服务框架，其所有组件都来自于阿里巴巴微服务技术，无论是解决方案完整性、技术成熟度、社区还是文档资料等都对国内开发者非常友好。

# Registration Configuration Center Overview

## Service registration and discovery

The biggest difference between microservices and traditional monolithic application architectures is the emphasis on the splitting of software modules. Under the monolithic architecture, multiple functional modules of an application system are organized and deployed and run in the same application process. Therefore, the response to a request can be completed directly through method calls between modules. However, in a microservice system, an application system needs to be split according to its functional characteristics and then deployed separately at a certain granularity, in order to achieve high cohesion within the module, low coupling between modules, and high reliability of the entire microservice system. Scalability:

微服务与传统单体式应用架构最大区别就是强调软件模块的拆分。在单体架构下，一个应用系统的多个功能模块由于组织在一起在同一个应用进程内部署与运行，因此，模块之间直接通过方法调用即可完成对一次请求的响应。但在微服务系统中，需要对一个应用系统根据其功能特点，按照一定粒度进行拆分后单独部署，以便实现模块内的高内聚，模块间的低耦合，实现整个微服务系统的高可扩展性：

It turns out that the request processing that can be completed in one application at a time will lead to cross-process and cross-host service calls. How to make these services discover each other and provide unified external service call capabilities like a single application is the microservice framework level One of the core issues that needs to be addressed. In the Spring Cloud ecosystem, the following service registration and discovery model is adopted to realize mutual discovery and invocation between microservices.

原来一次在一个应用内即可完成的请求处理，会出现跨进程跨主机的服务调用，如何让这个服务之间能互相发现像单体式应用一样提供统一对外的服务调用能力是微服务框架层面需要重点解决的核心问题之一。 在 Spring Cloud 生态中，采用了如下服务注册与发现模型，来实现微服务之间的互相发现与调用。

As shown in the figure above, a component called registry is introduced into the microservice system as a coordinator. The most simplified process is that all microservice applications will send information including service name, host IP address and port number to the registration center during the startup process, and then the upstream microservice will process the request according to the service Name to the registry to find all the instance IP addresses and port numbers of the corresponding service to call the service. The whole process is shown by the dotted line in the figure. In this way, the scattered microservice systems can provide request processing capabilities to the outside world as a whole.

如上图所示，通过在微服务系统中引入一个叫做注册中心的组件，来作为协调者。其最简化的过程是，所有的微服务应用在启动过程中会将自身包含服务名称、主机 IP 地址和端口号等信息发送到注册中心中，然后上游的微服务在处理请求过程中，根据服务名称到注册中心中查找对应服务的所有实例 IP 地址和端口号来进行服务调用，整个过程如图中虚线所示。从而让分散的微服务系统之间能像一个整体一样对外提供请求处理能力。

## Configuration management

Before formally introducing the content of distributed configuration, let’s briefly introduce the concept of configuration. The configuration in the software system refers to various settings and parameters required during the running of the software, including system configuration, application configuration, and user configuration. System configuration includes the setting of basic environmental parameters such as operating system, hardware, and network; application configuration includes the setting of various parameters and options of the application program, such as database connection strings, log levels, etc.; user configuration refers to user-defined Various options and parameters, such as shortcut keys, interface layout, language, etc. Configuration in the software system is an important supplement to the software source code, through which the execution behavior of the software system can be easily adjusted to make the software system more flexible. In addition to monolithic applications, in distributed systems, configuration information is widely used, and different functions can be realized through configuration. These configuration information include database connection information, log level, business configuration and so on. In traditional development methods, these configuration information are usually hard-coded into the code of the application, packaged and deployed together with the program code. However, this method has many disadvantages, such as configuration information is not easy to maintain, as long as the configuration is modified, it has to be rebuilt and deployed.

在正式介绍分布式配置内容之前，还是先简单介绍一下配置的概念。软件系统中的配置是指在软件运行过程中所需要的各种设定和参数，包括系统配置、应用配置和用户配置等。系统配置包括操作系统、硬件和网络等基本环境参数的设定；应用配置包括应用程序的各种参数和选项的设定，如数据库连接字符串、日志级别等；用户配置则是指用户自定义的各种选项和参数，如快捷键、界面布局、语言等。配置在软件系统中是对软件源代码的一种重要补充，通过其可以便捷的调整软件系统的执行行为，让软件系统更加灵活。 除了单体式应用，在分布式系统中，配置信息应用非常广泛，可以通过配置来实现不同的功能。这些配置信息如数据库连接信息、日志级别、业务配置等等。在传统的开发方式中，这些配置信息通常硬编码到应用程序的代码中，与程序代码一起打包和部署。然而，这种方式有很多缺点，比如配置信息不易维护，只要修改配置就得重新构建和部署等。

The software architecture using the distributed configuration center is shown in the figure above, which can help solve the following problems in distributed scenarios:

1. Manage application configurations: When there are a large number of applications to manage, manually maintaining configuration files can become very difficult. The distributed configuration center provides a solution for centrally managing and distributing configuration information.
2. Environment isolation: In different environments such as development, testing, and production, the configuration information of the application is often not used. Using the distributed configuration center, you can easily manage and distribute configuration information in different environments.
3. Improve program security: Storing configuration information in the code base or application files can lead to security risks because the information can be accidentally leaked or exploited by malicious attackers. Using distributed configuration, configuration information can be encrypted and protected, and access rights can be controlled.
4. Dynamically update configuration: When the application is running, it may be necessary to dynamically update the configuration information so that the application can respond to changes in a timely manner. Using a distributed configuration center, configuration information can be dynamically updated at runtime without restarting the application.

采用分布式配置中心的软件架构如上图所示，其可以在分布式场景中帮助解决以下问题：

1. 管理应用程序配置：当有大量应用程序需要管理时，手动维护配置文件会变得非常困难。分布式配置中心提供了一个集中管理和分发配置信息的解决方案。
2. 环境隔离：在开发、测试和生产等不同环境中，应用程序的配置信息往往都会有不用。使用分布式配置中心，可以轻松地管理和分发不同环境下的配置信息。
3. 提高程序安全性：将配置信息存储在代码库或应用程序文件中可能会导致安全风险，因为这些信息可能会被意外地泄漏或被恶意攻击者利用。使用分布式配置，可以将配置信息加密和保护，并且可以进行访问权限控制。
4. 动态更新配置：在应用程序运行时，可能需要动态地更新配置信息，以便应用程序可以及时响应变化。使用分布式配置中心，可以在运行时动态更新配置信息，而无需重新启动应用程序。

## Nacos overview

Nacos /nɑ:kəʊs/ is the acronym for Dynamic Naming and Configuration Service, a dynamic service discovery, configuration management and service management that is easier to build cloud-native applications platform.

Nacos is dedicated to helping you discover, configure and manage microservices. Nacos provides a set of easy-to-use feature sets to help you quickly realize dynamic service discovery, service configuration, service metadata, and traffic management.

Nacos helps you build, deliver and manage microservice platforms more agilely and easily. Nacos is a service infrastructure for building a "service"-centric modern application architecture (such as microservice paradigm, cloud native paradigm).

Nacos /nɑ:kəʊs/ 是 Dynamic Naming and Configuration Service 的首字母简称，一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。

Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。

Nacos 帮助您更敏捷和容易地构建、交付和管理微服务平台。Nacos 是构建以“服务”为中心的现代应用架构 (例如微服务范式、云原生范式) 的服务基础设施。


## User-defined namespace configurations
Inside Nacos there is the concept of Namespace:

For tenant granularity configuration isolation. The same Group or Data ID can be configured in different namespaces. A common scenario of Namespace is to separate and isolate configurations of different environments. For example, isolation of resources (such as configurations and services) between the development and test environments and production environments. without explicitly specify ${spring.cloud.nacos.config.namespace} configuration, the default is used on Public nacos this namespace. If you want to use a custom defined namespace, you can use the following configuration:spring.cloud.nacos.config.namespace=YOUR_NAMESPACE_ID

Nacos 内部有 Namespace 的概念:

用于进行租户粒度的配置隔离。不同的命名空间下，可以存在相同的 Group 或 Data ID 的配置。Namespace 的常用场景之一是不同环境的配置的区分隔离， 例如开发测试环境和生产环境的资源（如配置、服务）隔离等。 在没有明确指定 ${spring.cloud.nacos.config.namespace} 配置的情况下， 默认使用的是 Nacos 中 public 命名空间即默认的命名空间。如果需要使用自定义的命名空间，可以通过以下配置来实现：spring.cloud.nacos.config.namespace=YOUR_NAMESPACE_ID

This configuration must be placed in the bootstrap.properties file. Besides spring.cloud.nacos.config.namespace. The value of the namespace is namespace corresponding id, id value can be > nacos console access. Do not select any other namespae when adding the configuration. Otherwise, the correct configuration will not be read.

该配置必须放在 bootstrap.properties 文件中。此外 spring.cloud.nacos.config.namespace 的值是 namespace 对应的 id，id 值可以在 Nacos 的控制台获取。并且在添加配置时注意不要选择其他的 namespace，否则将会导致读取不到正确的配置。

## IPv4 to IPv6 address migration scheme
Dual registration of IPv4 and IPv6 addresses

After Spring Cloud Loadbalancer is configured as a load balancing policy, IPv4 and IPv6 addresses of micro-services are registered with the registry by default after the application starts. IPv4 addresses are stored under the IP field in the Nacos service list. IPv6 address In the metadata field of Nacos, the corresponding Key is IPv6. When a service consumer invokes a service provider, it selects the appropriate IP address type to initiate the service invocation based on its own IP address stack support.

IPv4 和 IPv6 地址双注册

在配置完成 Spring Cloud Loadbalancer 作为负载均衡策略后，应用启动后会默认将微服务的 IPv4 地址和 IPv6 地址注册到注册中心中，其中 IPv4 地址会存放在 Nacos 服务列表中的 IP 字段下， IPv6 地址在 Nacos 的 metadata 字段中，其对应的 Key 为 IPv6 。当服务消费者调用服务提供者时，会根据自身的 IP 地址栈支持情况，选择合适的 IP 地址类型发起服务调用。

Specific rules:

If the service consumer supports dual IPv4 and IPv6 address stacks or only supports IPv6 address stacks, the service consumer will use the IPv6 address provided by the service to initiate service invocation. If the IPv6 address invocation fails, the service consumer cannot switch to IPv4 address stacks and initiate retry invocation.
If the service consumer supports only IPv4 single-address stack, the service consumer invokes the service using the IPv4 address provided by the service.

具体规则：

服务消费者本身支持 IPv4 和 IPv6 双地址栈或仅支持 IPv6 地址栈的情况下，服务消费者会使用服务提供的 IPv6 地址发起服务调用，IPv6 地址调用失败且服务本身同时支持 IPv4 地址栈时，暂不支持切换到 IPv4 地址发起重试调用；
服务消费者本身仅支持 IPv4 单地址栈的情况下，服务消费者会使用服务提供的 IPv4 地址发起服务调用。

- Only IPv4 is registered
  - If you only want to register using IPv4 addresses, you can use the following configuration in application.properties:spring.cloud.nacos.discovery.ip-type=IPv4
- Only IPv6 is registered
  - If you only want to use IPv6 addresses, you can use the following configuration in application.properties:spring.cloud.nacos.discovery.ip-type=IPv6

# Distributed transaction Overview

Seata is an open source distributed transaction solution, dedicated to providing high-performance and easy-to-use distributed transaction services under the microservice architecture. Before Seata was open-sourced, its internal version had been playing the role of middleware for data consistency at the application architecture layer within the Ali system, helping the economy to survive the 11.11 events over the years and providing strong technical support for upper-level businesses. After years of precipitation and accumulation, its commercial products have been sold on Alibaba Cloud and Financial Cloud successively. In January 2019, in order to create a more complete technical ecology and inclusive technical achievements, Seata officially announced that it would be open source. In the future, Seata will help users quickly implement distributed transaction solutions in the form of community co-construction.

## How to verify the success of a distributed transaction?

Whether the Xid information is transmitted successfully

In the controllers of the three services account-server, order-service and storage-service, the first logic to execute is to output the Xid information in the RootContext, and if you see it, the correct Xid information is output , that is, it changes every time, and the Xids of all services in the same call are consistent. It indicates that the transmission and restoration of Seata's Xid is normal.

Xid 信息是否成功传递

在 account-server、order-service 和 storage-service 三个 服务的 Controller 中，第一个执行的逻辑都是输出 RootContext 中的 Xid 信息，如果看到都输出了正确的 Xid 信息，即每次都发生变化，且同一次调用中所有服务的 Xid 都一致。则表明 Seata 的 Xid 的传递和还原是正常的。

Consistency of data in the database

In this example, we simulate a scenario where a user purchases goods. StorageService is responsible for deducting the inventory quantity, OrderService is responsible for saving the order, BusinessService is responsible for deducting the balance of the user account, and AccountService is responsible for updating the balance of the account and serves as the global transaction control entry. To demonstrate the example, we used Random in OrderService and AccountService. NextBoolean() randomly throws exceptions, simulating the scenario where exceptions occur randomly when calling services.

数据库中数据是否一致

在本示例中，我们模拟了一个用户购买货物的场景，StorageService 负责扣减库存数量，OrderService 负责保存订单，AccountService 负责扣减用户账户余额。为了演示样例，我们在 OrderService 和 AccountService 中 使用 Random.nextBoolean() 的方式来随机抛出异常,模拟了在服务调用时随机发生异常的场景。

If distributed transactions are efficient, then the following equation should be true:

- User's original amount (1000) = user's existing amount + product unit price (2) order quantity product quantity per order (2)
- Initial Item Quantity (100) = Existing Item Quantity + Order Quantity * Item Quantity per Order (2)

如果分布式事务生效的话， 那么以下等式应该成立:

- 用户原始金额(1000) = 用户现存的金额 + 货物单价 (2) *订单数量* 每单的货物数量(2)
- 货物的初始数量(100) = 货物的现存数量 + 订单数量 * 每单的货物数量(2)

## Spring Cloud support points

- A service provider that provides services through Spring MVC can automatically restore the Seata context when it receives an HTTP request that contains Seata information in the header.
- Support for automatic passing of Seata context when service caller calls via RestTemplate.
- Support for automatically passing the Seata context when the service caller calls via FeignClient.
- Support the scenario of using SeataClient and Hystrix at the same time.
- Supports scenarios used by SeataClient and Sentinel.

- 通过 Spring MVC 提供服务的服务提供者，在收到 header 中含有 Seata 信息的 HTTP 请求时，可以自动还原 Seata 上下文。
- 支持服务调用者通过 RestTemplate 调用时，自动传递 Seata 上下文。
- 支持服务调用者通过 FeignClient 调用时，自动传递 Seata 上下文。
- 支持 SeataClient 和 Hystrix 同时使用的场景。
- 支持 SeataClient 和 Sentinel 同时使用的场景。

# Current limit downgrade Overview

## Current limit downgrade

In a microservice system, an external business function may involve a long service call link. When one of the services is abnormal, if there is no service call protection The mechanism may cause a large number of servers directly or indirectly called by related services on the service call link to continue to initiate requests, which will eventually lead to the exhaustion of all related service resources and an avalanche effect. As two important means in flow control and service protection, flow limiting and downgrading can effectively deal with such problems.

在微服务系统中，一个对外的业务功能可能会涉及很长的服务调用链路。当其中某个服务出现异常，如果没有服务调用保护 机制可能会造成该服务调用链路上大量相关服务直接或间接调用的服务器仍然持续不断发起请求，最终导致相关的所有服务资源耗尽产生异常发生雪崩效应。限流和降级分别作为在流量控制和服务保护方面的两个重要手段，可以有效地应对此类问题。

### Limiting

Current limiting refers to limiting the access volume of a certain interface of a service in the microservice system, so as to avoid excessive traffic from knocking down the service instance. Generally, by setting the traffic threshold for the service, when the threshold of the limit is reached, some strategies can be adopted to deal with it, such as queuing, returning error messages, etc. to respond to the request to protect the service instance. In a microservice system, current limiting is mainly for service providers.

限流是指对微服务系统中某个服务的某个接口的访问量进行限制，以避免过大的流量将服务实例击垮。其一般是通过为服务设置流量阈值，当达到限制的阈值时，可以采取一些策略进行处理，比如排队、返回错误信息等来对请求进行响应以实现对服务实例的保护。在微服务系统中，限流主要是针对服务提供者而言的。

### downgrade

Downgrading refers to downgrading the invocation of a service when an exception occurs in a service or the flow is limited, such as returning a default value, returning a bottom-up data, and so on. In a microservice system, Downgrading is mainly for service consumers.

降级是指当某个服务出现异常或者被限流时，对该服务的调用进行降级处理，比如返回一个默认值，返回一个兜底数据等。在微服务系统中，降级主要是针对服务消费者而言的。

## Sentinel overview

The out-of-the-box current limiting and downgrading solution integrated by Spring Cloud Alibaba comes from Sentinel, which takes traffic as the entry point, from flow control, fuse downgrading, system load protection, etc. This dimension protects the stability of the service.

Spring Cloud Alibaba 集成的开箱即用限流降级方案来自 Sentinel，其以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。

Sentinel has the following characteristics:

- *Rich application scenarios*: Sentinel has undertaken the core scenarios of Alibaba’s Double Eleven traffic promotion in the past 10 years, such as seckill (that is, burst traffic is controlled within the range that the system capacity can bear), message peak shaving, Real-time fusing of downstream unavailable applications, etc.
- *Complete real-time monitoring*: Sentinel also provides real-time monitoring functions. In the console, you can see the second-level data of a single machine connected to the application, or even the aggregated running status of a cluster with a scale of less than 500.
- *Extensive open source ecosystem*: Sentinel provides out-of-the-box integration modules with other open source frameworks/libraries, such as integration with Spring Cloud, Dubbo, and gRPC. You only need to introduce the corresponding dependencies and perform simple configurations to quickly access Sentinel.
- *Complete SPI extension point*: Sentinel provides an easy-to-use and complete SPI extension point. You can quickly customize logic by implementing extension points. For example, customizing rule management, adapting data sources, etc.

Sentinel 具有以下特征:

- *丰富的应用场景*： Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、实时熔断下游不可用应用等。
- *完备的实时监控*： Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况。
- *广泛的开源生态*： Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Dubbo、gRPC 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel。
- *完善的 SPI 扩展点*： Sentinel 提供简单易用、完善的 SPI 扩展点。您可以通过实现扩展点，快速的定制逻辑。例如定制规则管理、适配数据源等。

# Distributed Message Overview

## Introduction to RocketMQ

RocketMQ is an open source distributed message system, based on highly available distributed cluster technology, providing low-latency, highly reliable message publishing and subscription services. At the same time, it is widely used in many fields, including asynchronous communication decoupling, enterprise solutions, financial payment, telecommunications, e-commerce, express logistics, advertising marketing, social networking, instant messaging, mobile applications, mobile games, video, Internet of Things, car networking etc.

RocketMQ 是一款开源的分布式消息系统，基于高可用分布式集群技术，提供低延时的、高可靠的消息发布与订阅服务。同时，广泛应用于多个领域，包括异步通信解耦、企业解决方案、金融支付、电信、电子商务、快递物流、广告营销、社交、即时通信、移动应用、手游、视频、物联网、车联网等。

Has the following characteristics:

- Can guarantee strict message order;
- Provide a rich message pull mode;
- Efficient subscriber horizontal expansion capability;
- Real-time message subscription mechanism;
- Billion-level message accumulation capability.

Before introducing spring-cloud-starter-stream-rocketmq, let's take a look at Spring Cloud Stream.

具有以下特点：

- 能够保证严格的消息顺序；
- 提供丰富的消息拉取模式；
- 高效的订阅者水平扩展能力；
- 实时的消息订阅机制；
- 亿级消息堆积能力。

在介绍 spring-cloud-starter-stream-rocketmq 之前，先了解一下 Spring Cloud Stream。

## Introduction to Spring Cloud Stream

Spring Cloud Stream is a framework for building message-based microservice applications. It is based on Spring Boot to create a production-level stand-alone Spring application, and uses Spring Integration to connect with Broker.

Spring Cloud Stream provides a unified abstraction of message middleware configuration, and introduces the unified concepts of publish-subscribe, consumer groups, and partition.

Spring Cloud Stream 是一个用于构建基于消息的微服务应用框架。它基于 Spring Boot 来创建具有生产级别的单机 Spring 应用，并且使用 Spring Integration 与 Broker 进行连接。

Spring Cloud Stream 提供了消息中间件配置的统一抽象，推出了 publish-subscribe、consumer groups、partition 这些统一的概念。

There are two concepts inside Spring Cloud Stream: Binder and Binding.

- Binder: A component integrated with external message middleware, used to create Binding, each message middleware has its own Binder implementation.
  - For example, Kafka implements KafkaMessageChannelBinder, RabbitMQ implements RabbitMessageChannelBinder, and RocketMQ implements RocketMQMessageChannelBinder.
- Binding: Including Input Binding and Output Binding.

Binding provides a bridge between the message middleware and the Provider and Consumer provided by the application, so that developers only need to use the Provider or Consumer of the application to produce or consume data, shielding the developer from the underlying message middleware touch.

Spring Cloud Stream 内部有两个概念：Binder 和 Binding。

- Binder： 跟外部消息中间件集成的组件，用来创建 Binding，各消息中间件都有自己的 Binder 实现。
  - 比如 Kafka 的实现 KafkaMessageChannelBinde，RabbitMQ 的实现 RabbitMessageChannelBinder 以及 RocketMQ 的实现 RocketMQMessageChannelBinder。
- Binding： 包括 Input Binding 和 Output Binding。

Binding 在消息中间件与应用程序提供的 Provider 和 Consumer 之间提供了一个桥梁，实现了开发者只需使用应用程序的 Provider 或 Consumer 生产或消费数据即可，屏蔽了开发者与底层消息中间件的接触。

# Why JDK 17?

Many people will be very surprised to hear that the minimum version of JDK required by Spring Boot 3.0 is 17 by default! Spring's official choice must be unwise for many JDK 8 users. is it really like this? For this problem, we think it is mainly based on two reasons: Oracle's official support policy for JDK and its advanced nature. Oracle currently divides all released JDK versions into Long-Term-Support (LTS) releases and relative non-TLS releases. The TLS version of JDK is officially supported by Oracle for a long time. It will continue to maintain and update this version for a long time in the future. The non-TLS version of JDK is only a transitional version. As long as the next LTS version appears, the official will not maintain it, so it is not suitable for long-term production and use by external users. 

很多人，听到 Spring Boot 3.0 默认所需的 JDK 最低版本为 17 会感到非常诧异！对很多 JDK 8 用户来说 Spring 官方的选择一定是不明智的。真的是这样的吗？对于这个问题，我们认为主要基于 2 个原因：Oracle 官方对 JDK 支持政策和先进性。 Oracle 当前对所有发布的 JDK 版本分为 Long-Term-Support (LTS) releases 和相对 non-TLS releases，TLS 版本的 JDK 作为 Oracle 官方长期支持的版本，会在未来的很长一段时间内，官方都会对该版本进行持续的维护和更新。而 non-TLS 版本的 JDK 仅仅是作为过度版本，只要下一个 LTS 版本出现以后，官方就不会对其进行维护了，因此也是不适合作为外部用户生产长期使用的。

 Therefore, when Spring Boot 3.0 was released in the first Milestone version at the beginning of this year, the optional JDK versions were only JDK 7, 8, 11 and 17 from the above figure. Why 17 and not its predecessors? This should be understood in conjunction with Oracle's official JDK support policy. Oracle officially divides the released JDK follow-up support strategies into the following three types:

 因此在 Spring Boot 3.0 于今年年初的第一个 Milestone 版本发布之时，可选的 JDK 版本从上图来看，就只有 JDK 7、8、11 和 17。为什么是 17 而不是其之前的版本呢？这个就要结合 Oracle 官方的 JDK 支持政策来理解了。Oracle 官方一般将所发布的 JDK 后续的支持策略分为以下 3 种：

- Premier Support: It can be understood as the standard support type provided by Oracle. The support period under its latest policy is 5 years. Within 5 years, Oracle will officially provide continuous free update and upgrade services for this version of JDK.
- Extended Support: As an extended support type after standard support, the support time period under its latest policy is 3 years. Within 3 years, Oracle users can purchase the update support service provided by Oracle for this version of JDK by paying a certain support service fee.
- Sustaining Support: It is an official support service provided by Oracle after continuing the support type. Of course, it is also charged, and there is no clear deadline for it yet.
- Premier Support: 其可以理解为 Oracle 提供的标准支持类型，其最新政策下的支持时间周期为 5 年，5 年内 Oracle 官方会对该版本 JDK 提供持续免费的更新与升级服务。
- Extended Support: 作为标准支持后的延续支持类型，其最新政策下的支持时间周期为 3 年，3 年内 Oracle 的用户可以通过支付一定的支持服务费用购买 Oracle 对该版本 JDK 所提供的更新支持服务。
- Sustaining Support: 其是 Oracle 官方在延续支持类型后的一种支持服务，当然其也是要收费的，其目前暂时还没有明确的截止时间。

According to the official support service provided by Oracle for the current JDK and the advanced nature of the JDK version itself, the Premier Support support service for JDK 7 and 8 has ended, and the Premier Support related to 11 is about to expire. As the latest LTS version, JDK 17 has been optimized in terms of syntax and performance compared to the previous version, and it has a relatively large advantage. Therefore, it is logical to choose JDK 17 as the default JDK version of the latest Spring Boot 3.0!

根据上述 Oracle 官方对当前 JDK 所提供的支持服务形式以及 JDK 版本本身的先进性来看，JDK 7，8 已经截止了 Premier Support 支持服务，11 相关的 Premier Support 也快到期了。JDK 17 作为目前最新的 LTS 版本，本身无论是在语法还是运行性能方面都在之前版本上做了一定优化，本身具有比较大的优势。因此，选择 JDK 17 作为最新的 Spring Boot 3.0 的默认 JDK 版本也就顺理成章了！

# How to smoothly migrate Spring Cloud Alibaba applications to IPv6?

## Summary
As a next-generation Internet protocol, migration to IPv6 is the general trend in the future. However, due to the large-scale application of the IPv4 protocol in the current Internet, there is no way for users to specify a time and date. From that moment on, all devices on the Internet will use IPv6, which is unrealistic. One-time migration is not only unfeasible at the infrastructure level, but for enterprise users, even if the infrastructure can be prepared, it is unacceptable for enterprise users to shut down at least hundreds or even thousands of application instances for a period of time for protocol stack migration, no matter in terms of risk or cost! Since it cannot be done in one step, gradual IP address migration has become the current mainstream choice. This article will introduce some mainstream gradual IP address migration methods.

作为下一代互联网协议，向 IPv6 迁移是未来的大势所趋。但由于当前互联网中 IPv4 协议的应用规模非常大，对于用户来说，没办法通过规定一个时间日期，从那一刻开始，所有互联网上的设备全部使用 IPv6，这是不现实的。一次性迁移不仅在基础设施层面不可行，对企业用户来说，就算基础设施都能准备完毕，让其将少则上百，多则成千上万的应用实例在一段时间内一次性停机进行协议栈迁移，无论是在风险上，还是成本上，对企业用户来说都是难以接受的！既然无法一步到位，渐进式的 IP 地址迁移成为当前的主流选择。本文将介绍一些主流渐进式的 IP 地址迁移方法。

## background
The IPv4 protocol (hereinafter referred to as IPv4) has made important contributions to the development and popularization of the Internet, but in recent years, with the explosive growth of applications, data and IT services. The IPv4 address used to describe the 32-bit binary number format used in the protocol design process has been exhausted in 2011 [1], and since then, the whole world has been in a situation where no new addresses are available.

IPv4 协议（后文简称 IPv4）为互联网的发展与普及做出了重要贡献，但近年来，随着应用程序、数据和 IT 服务的爆炸式增长。当初协议设计过程中用来描述 IP 地址所采用的 32 位二进制数格式的 IPv4 地址已经于 2011 年[1]被申请耗尽，从那时起，全世界都已经处于无新地址可用的局面。

The IPv6 protocol (hereafter referred to as IPv6) is the next-generation Internet protocol adopted after IPv4. Compared with the IPv4 protocol, which uses 32 bits to represent IP addresses, the number of address representation bits has been expanded to 128 bits, and the number of addresses is 2 to the 96th power that IPv4 can provide. Simply looking at the numbers may seem unintuitive. Instead, it is more intuitive and classic to describe the number of IPv6 addresses: "IPv6, which uses 128 bits to represent addresses, can assign an IP address to every grain of sand on the earth"! In addition, the IPv6 protocol can not only solve the address shortage problem in the IPv4 protocol, but also provide more efficient and secure network communication for the Internet. The IPv6 protocol provides many new functions and advantages in network communication. For example, in terms of data transmission and routing, its new design improves efficiency and reliability, reducing network congestion and packet loss. In addition, in the field of security, its built-in support for IPSec can better protect the security of data transmission in the network and prevent hackers from attacking and stealing data. As a next-generation Internet protocol, migration to IPv6 is the general trend in the future. In my country, since 2014, relevant agencies have gradually stopped allocating IPv4 addresses to new users and applications, and started to fully commercialize the IPv6 protocol (Computer Network (Seventh Edition) Xie Xiren). According to government guidance, in recent years, a series of related guidance documents have been issued successively, such as: Action Plan for Promoting Internet Protocol Version 6 (IPv6) Scale Deployment” issued by the State Council in 2017, and “IPv6 Traffic Improvement Three-Year Special Action Plan (2021-2023) issued by the Ministry of Industry and Information Technology in 2021, the Guiding Opinions on Promoting IPv6 Scale Deployment issued by the Cyberspace Administration of China 4 protocol migration to IPv6 protocol. However, due to the large-scale application of the IPv4 protocol in the current Internet, there is no way for users to specify a time and date. From that moment on, all devices on the Internet will use IPv6, which is unrealistic. One-time migration is not only unfeasible at the infrastructure level, but for enterprise users, even if the infrastructure can be prepared, it is unacceptable for enterprise users to shut down at least hundreds or even thousands of application instances for a period of time for protocol stack migration, no matter in terms of risk or cost! Since it cannot be done in one step, gradual IP address migration has become the current mainstream choice. Next, this article will introduce some mainstream gradual IP address migration methods.

IPv6 协议（后文简称 IPv6）作为 IPv4 之后被采用的下一代互联网协议，相比 IPv4 协议中采用 32 位来表示 IP 地址，其地址表示位数扩充到了 128 位，地址数量是 IPv4 所能提供的 2 的 96 次方倍。简单看数字可能显得不太直观，换成一句描述 IPv6 地址之多更直观和经典的话：“采用 128 位表示地址的 IPv6 可以为地球上的每一粒沙子都分配一个 IP 地址”！此外，IPv6 协议其不仅可以解决 IPv4 协议中的地址短缺问题，同时也能为互联网提供更高效、更安全的网络通信。IPv6 协议在网络通信中提供了许多新的功能和优势。例如，在数据传输和路由方面，其通过新的设计提高了效率和可靠性，减少了网络拥堵和数据包丢失的情况。此外，在安全领域，其内置对 IPSec 的支持，可以更好地保护网络中的数据传输安全，防止黑客攻击和窃取数据。 作为下一代互联网协议，向 IPv6 迁移是未来的大势所趋。在我国，从 2014 年开始相关机构已经逐步停止向新用户和应用分配 IPv4 地址，开始全面商用 IPv6 协议(计算机网络（第七版）谢希仁)。在政府引导测，近年来，陆续也出台了一系列相关指导文件例如：2017 年国务院发布的《推进互联网协议第六版（IPv6）规模部署行动计划》、2021 年工业与信息化部发布的《IPv6 流量提升三年专项行动计划（2021-2023 年）》、2021 年网信办发布的《关于推动 IPv6 规模部署的指导意见》等不断地在引导企业从 IPv4 协议向 IPv6 协议迁移。 但由于当前互联网中 IPv4 协议的应用规模非常大，对于用户来说，没办法通过规定一个时间日期，从那一刻开始，所有互联网上的设备全部使用 IPv6，这是不现实的。一次性迁移不仅在基础设施层面不可行，对企业用户来说，就算基础设施都能准备完毕，让其将少则上百，多则成千上万的应用实例在一段时间内一次性停机进行协议栈迁移，无论是在风险上，还是成本上，对企业用户来说都是难以接受的！既然无法一步到位，渐进式的 IP 地址迁移成为当前的主流选择。接下来本文将介绍一些主流渐进式的 IP 地址迁移方法。

## Migration scheme
Although the IPv6 protocol has many advantages, its promotion and application still face many challenges. The popularization of IPv6 requires supporting infrastructure measures and support on a global scale, including updating of network equipment, personnel training, promotion of policies and regulations, and so on. At the same time, the compatibility between IPv6 and IPv4 is also an important issue, which needs to be solved through technical means and transition mechanism. Common IP protocol gradual migration coexistence solutions mainly include dual stack (Dual Stack), tunneling (Tunneling) and other technologies. Among them, dual-stack technology is a widely used IPv4/IPv6 coexistence technology in the industry. Its purpose is to install IPv4 and IPv6 dual protocol stacks for devices before the Internet completely transitions to IPv6. A dual-stack device can communicate with a single-IPv4, single-IPv6, or dual-stack device. By allowing various protocol stacks to coexist, the migration of the IP protocol stack is carried out gradually. For example, Kubernetes has already supported dual-stack function very early. Tunneling technology is a method of encapsulating IPv6 addresses into IPv4 datagrams. After the data is sent from the IPv6 single protocol stack, in the process of passing through the IPv4 single stack network environment, the IPv6 address is encapsulated into the IPv4 datagram as the content of the IPv4 datagram, and then transmitted through the IPv4 protocol stack. After passing through the IPv4 single-stack environment, when coming to the IPv6 single-stack environment, the content of the IPv6 data segment in the datagram is parsed out, and a new IPv6 datagram is constructed for transmission in the IPv6 protocol stack environment.

虽然 IPv6 协议具有许多优势，但是其推广和应用仍然面临许多挑战。IPv6 的普及需要全球范围内的配套基础措施和支持，包括网络设备的更新、人员培训和政策法规的推进等等。同时，IPv6 与 IPv4 之间的兼容性也是一个重要的问题，需要通过技术手段和过渡机制来解决。 常见的 IP 协议渐进式迁移共存方案，主要有双栈（Dual Stack）、隧道（Tunneling）等技术。其中，双栈技术是目前业界应用较为广泛的一种 IPv4/IPv6 共存的一种技术，其目的是在互联网完全过度到 IPv6 之前，通过为设备安装 IPv4 和 IPv6 双协议栈。具有双栈的设备可以实现与单 IPv4、单 IPv6 或者双栈的设备进行通信。通过让各种协议栈能共存，渐进式地进行 IP 协议栈的迁移。像 Kubernetes 很早也已经对双栈功能进行了支持。 隧道技术是一种把 IPv6 地址封装到 IPv4 数据报中的方法，当数据从 IPv6 单协议栈发出后，在经过 IPv4 单栈网络环境的过程中，将 IPv6 地址封装到 IPv4 数据报作为 IPv4 数据报内容后，通过 IPv4 协议栈进行传输。在经过 IPv4 单栈环境后，来到 IPv6 单栈环境时，再将数据报中的 IPv6 数据段内容解析出来，构造新的 IPv6 数据报在 IPv6 协议栈环境中进行传输。
## Microservice dual-stack migration solution
The solutions presented above are more of a generalized methodology. But specifically in the microservice system, how does the remote call process realize the coexistence of multiple protocol stacks so as to help enterprise users smoothly migrate the protocol stacks?

上文介绍的方案更多的是一般化的方法论。但具体到微服务系统中，远程调用过程如何实现多协议栈共存以便帮助企业用户平滑进行协议栈的迁移呢？

The above figure is the remote call process architecture diagram commonly used between services in the current microservice system in the industry. Next, this article introduces how to implement the common method of smooth migration of the protocol stack of the microservice application based on the dual-stack technology.

上图是当前业界微服务系统中服务之间普遍采用的远程调用过程架构图，本文接下来介绍如何基于双栈技术实现微服务应用的协议栈平滑迁移的常用方式。

### Double registration and double subscription to achieve smooth migration of the protocol stack
In the microservice system, compared with the single-stack environment, there is only one IP address, and the registration and discovery process of the microservice is based on the address to complete the service remote call. In an environment where multiple protocol stacks coexist, the essence is to solve the problem of how to use IP addresses during service registration and discovery. After sorting out the problem, it is not difficult to find that the method based on double registration and double subscription can better solve the problem of coexistence of multiple protocol stacks in the microservice system, so as to realize the smooth migration of the protocol stack of the microservice system. The service registration and subscription process of this solution can be described as shown in the following figure:

在微服务系统中，相比于单栈环境下，只有一个 IP 地址，微服务的注册与发现过程都基于该地址完成服务远程调用。在多协议栈共存的环境中，其本质就是要解决服务注册和发现过程怎么使用 IP 地址的问题。 梳理清楚了问题，就不难发现基于双注册双订阅的方法可以较好地解决微服务系统中多协议栈共存的问题，以便实现微服务系统协议栈的平滑迁移。该方案的服务注册和订阅过程可以被描述为下图所示：

The process of using double registration and double subscription to realize the smooth IP protocol stack migration of the microservice system can be roughly described as the following steps:

采用双注册双订阅实现微服务系统平滑进行 IP 协议栈迁移的过程可以被大致描述为以下步骤：

- Before the new application is upgraded or released, upgrade the IP address protocol stack of the host machine where the relevant microservice application is located, so that it supports both IPv4 and IPv6 dual protocol stacks.
- For the microservice application transformed in step 1, at the microservice framework level, a dual-stack address extraction module extracts valid IPv4 and IPv6 addresses in the application host, and registers both dual-stack addresses to the registration center through the service registration module.
- The consumer subscribes to the IPv4 and IPv6 dual-stack addresses of a service in the registration center, and compares the protocol stack type supported by the host through the dual-stack address resolution module at the application service framework level. If the host only supports IPv4 protocol, use the provider’s IPv4 address to initiate a service call; if it only supports IPv6 or supports both dual stacks, use the provider’s IPv6 address to initiate a service call;
- After all the microservices in the system support the IPv6 protocol stack, gradually close the IPv4 protocol stack for all application hosts, so as to smoothly complete the migration of the large-scale microservice system from the IPv4 protocol stack to the IPv6 protocol stack.

1. 在新的应用升级或者发版之前，对相关微服务应用所在宿主机进行 IP 地址协议栈升级改造，让其同时支持 IPv4 和 IPv6 双协议栈。
2. 经过步骤 1 改造的微服务应用，在微服务框架层面，通过一个双栈地址提取模块提取应用宿主机中有效的 IPv4 和 IPv6 地址，并通过服务注册模块，将双栈地址都注册到注册中心。
3. 消费者订阅注册中心中的某个服务的 IPv4 和 IPv6 双栈地址，通过应用服务框架层面的双栈地址解析模块，比对宿主机所支持的协议栈类型，如果宿主机仅支持 IPv4 协议，则使用提供者的 IPv4 地址发起服务调用；如果仅支持 IPv6 或同时支持双栈，则用提供者的 IPv6 地址发起服务调用；
4. 当系统中的所有微服务都完成支持 IPv6 协议栈的支持后，逐步对所有应用宿主机关闭 IPv4 协议栈，从而平滑完成大规模微服务系统从 IPv4 协议栈到 IPv6 协议栈的迁移。

### Realize smooth migration of protocol stack based on DNS technology

Although the method of dual registration and dual subscription is natural and clear, it will reduce the service capacity of the registration center because an additional record corresponding to the IP address will be registered for the application in the dual-stack environment during the service registration process. Therefore, it is also possible to realize the coexistence of multiple protocol stacks based on DNS technology, and to solve the method of protocol stack migration in the microservice system. Its essence is to change the original process of registering the service instance address into the registration service instance domain name (the domain name here is more of an instance identification function), which can realize the coexistence of multiple protocol stacks through the additional DNS domain name system to store the dual-stack IP address corresponding to the service domain name under the condition that the number of registered service instance records in the registry remains unchanged. The service registration and subscription process using this scheme is shown in the following figure:

双注册双订阅的方法虽然很自然和清晰，但是其由于服务注册过程中针对双栈环境中的应用会多注册一条 IP 地址对应的记录，会降低注册中心的服务承载量。 因此，也可以基于 DNS 技术实现多协议栈共存，解决微服务系统协议栈迁移的方法。其本质是将原来的注册服务实例地址过程变成注册服务实例域名（这里域名更多是实例标识作用），可实现在注册中心所注册服务实例记录数量不变的情况下，通过额外的 DNS 域名系统存储服务域名所对应的双栈 IP 地址，从而实现多协议栈的共存。采用该方案的服务注册和订阅过程如下图所示：

The process of implementing smooth IP address migration in a microservice system based on DNS technology can be roughly described as the following steps:

基于 DNS 技术实现微服务系统平滑进行 IP 地址迁移的过程可以被大致描述为以下步骤：

- Before the new application is upgraded or released, the IP address protocol stack of the relevant micro-service application is transformed so that it supports both IPv4 and IPv6 dual protocol stacks. The modified application needs to register the dual-stack IP address information of the machine and the domain name characteristic of this application instance to the DNS service of the system.
- After completing the domain name registration, the application instance registers the local domain name to the registration center.
- The consumer subscribes to the domain name of all instances of a certain service in the registration center, and initiates a request based on domain name resolution to the DNS service in the system through the domain name resolution module at the application framework level. After obtaining the IP address corresponding to the example domain name through DNS, compare the protocol stack type supported by the host machine. If the host machine only supports IPv4, use the IPv4 address to initiate the service call; if the host machine only supports IPv6 or supports both stacks at the same time, use the IPv6 address to initiate the service call;
- After all the microservices in the system support the IPv6 protocol stack, gradually close the IPv4 protocol stack for all application hosts, so as to smoothly complete the migration of the large-scale microservice system from the IPv4 protocol stack to the IPv6 protocol stack. 

1. 在新的应用升级或者发版之前，对相关微服务应用进行 IP 地址协议栈改造，让其同时支持 IPv4 和 IPv6 双协议栈。改造后的应用需要将本机的双栈 IP 地址信息和本应用实例特点的域名注册到系统的 DNS 服务上。
2. 完成域名注册后，应用实例将本地域名注册到注册中心。
3. 消费者订阅注册中心中的某个服务所有实例的域名，通过应用框架层面的域名解析模块，向系统中的 DNS 服务发起基于域名解析请求，在通过 DNS 获取到示例域名对应的 IP 地址后，比对宿主机所支持的协议栈类型，如果宿主机仅支持 IPv4，则使用 IPv4 地址发起服务调用；如果仅支持 IPv6 或同时支持双栈，则优先使用 IPv6 地址发起服务调用；
4. 当系统中的所有微服务都完成支持 IPv6 协议栈的支持后，逐步对所有应用宿主机关闭 IPv4 协议栈，从而平滑完成大规模微服务系统从 IPv4 协议栈到 IPv6 协议栈的迁移。

Compared with the double registration and double subscription method, the DNS-based method can better solve the redundant pressure on the registration center during the double registration and double subscription process, but the high availability of DNS is also a point that enterprise users need to pay special attention to.

相比于双注册双订阅方式，基于 DNS 的方法可以较好地解决双注册双订阅过程中带给注册中心的多余压力，但 DNS 的高可用也是企业用户需要特别注意的点。

## practice

As a widely used microservice framework, Spring Cloud Alibaba has provided a solution for interoperability and coexistence of different protocol stack applications in microservice scenarios in version 2021.0.5.0, so as to help enterprise users realize the protocol stack migration capability of large-scale microservice systems. The community solution is based on the implementation of dual registration and dual subscription. After the application is started, the IPv4 address and IPv6 address of the microservice will be registered in the registration center by default. The IPv4 address will be stored under the IP field in the Nacos service list, and the IPv6 address will be in the metadata field of Nacos. When a service consumer calls a service provider, it will select an appropriate IP address type to initiate a service call according to its own IP protocol stack support. Specific rules:

Spring Cloud Alibaba 作为应用广泛的微服务框架，目前在 2021.0.5.0 版本中已经提供了微服务场景下的不同协议栈应用互通共存方案，以便帮助企业用户实现大规模微服务系统的协议栈迁移能力。社区方案基于双注册双订阅实现，应用启动后会默认将微服务的 IPv4 地址和 IPv6 地址注册到注册中心中，其中 IPv4 地址会存放在 Nacos 服务列表中的 IP 字段下，IPv6 地址在 Nacos 的 metadata 字段中，其对应的 Key 为 IPv6（可以解决普通双注册双订阅过程中的同一个服务实例有两条记录，对注册中心造成压力的问题）。当服务消费者调用服务提供者时，会根据自身的 IP 协议栈支持情况，选择合适的 IP 地址类型发起服务调用。具体规则：

- If the service consumer itself supports IPv4 and IPv6 dual protocol stacks or only supports the IPv6 protocol stack, the service consumer will use the IPv6 address provided by the service to initiate a service call;
- If the service consumer itself only supports IPv4 single protocol stack, the service consumer will use the IPv4 address provided by the service to initiate a service call.

1. 服务消费者本身支持 IPv4 和 IPv6 双协议栈或仅支持 IPv6 协议栈的情况下，服务消费者会使用服务提供的 IPv6 地址发起服务调用；
2. 服务消费者本身仅支持 IPv4 单协议栈的情况下，服务消费者会使用服务提供的 IPv4 地址发起服务调用。

## Application configuration
Compared with the general use of Spring Cloud Alibaba to build microservices, the following configuration needs to be added to the application to use the protocol stack coexistence migration function:

相比于一般使用 Spring Cloud Alibaba 构建微服务，要使用协议栈共存迁移功能需要对应用增加如下配置：

### Service Registration
At present, after using the Spring Cloud Alibaba version that supports the protocol stack coexistence and migration function, the service provider does not need to do any configuration during the service registration process, and will check the protocol stack supported by the current application by default. If the default is a single IPv6 or IPv4 protocol stack, only the corresponding address will be registered. If the application supports dual-stack, it will automatically obtain the IPv6 address of the application, and then register the IPv6 address in the registration center as the service instance metadata of the application instance.

目前，使用支持协议栈共存迁移功能的 Spring Cloud Alibaba 版本以后，服务提供者在进行服务注册过中，不需要做任何配置，会默认检查当前应用所支持的协议栈情况，如果默认是单 IPv6 或 IPv4 协议栈，则仅注册相应的地址。如果应用支持双栈，则会自动获取应用的 IPv6 地址，然后，将 IPv6 地址作为应用实例的服务示例元数据注册到注册中心上。

### Service Consumption
If the application uses the Spring Cloud Alibaba 2021.0.5.0 version, the Spring Cloud LoadBalancer load balancing strategy is used by default, and the following configuration needs to be added to the consumer application application.properties configuration file to enable the protocol stack coexistence migration function:

如果应用是采用 Spring Cloud Alibaba 2021.0.5.0 版本，默认使用 Spring Cloud LoadBalancer 负载均衡策略，需要在消费者应用 application.properties 配置文件中增加如下配置开启协议栈共存迁移功能：

- spring.cloud.loadbalancer.ribbon.enabled=false

- spring.cloud.loadbalancer.nacos.enabled=true

# Exploration of Spring Cloud Alibaba on Proxyless Mesh

## Summary
After several years of development, Service Mesh is an emerging concept, which has attracted the attention and pursuit of mainstream technology companies from all over the world since its launch. The full name of Proxyless Mesh is Proxyless Service Mesh, which is a new software architecture developed on the basis of Service Mesh in recent years. The ideal of Service Mesh is full, but the reality is very skinny! Although there is no intrusion to the application through a layer of proxy, the increased network proxy overhead poses many challenges to the implementation of many Internet services with high performance requirements. Therefore, Proxyless Mesh, as a compromise between the traditional intrusive microservice framework and Service Mesh, provides an effective solution for a large number of non-Service Mesh applications in the cloud-native era, embracing cloud-native infrastructure, and solving pain points such as traffic management. This article will introduce Spring Cloud Alibaba's exploration on Proxyless Mesh.

经过过去几年的发展，Service Mesh 已再是一个新兴的概念，其从一经推出就受到来自全世界的主流技术公司关注和追捧。Proxyless Mesh 全称是 Proxyless Service Mesh，其是近几年在 Service Mesh 基础上发展而来的一种新型软件架构。Service Mesh 理想很丰满，但现实很骨感！通过一层代理虽然做到了对应用无侵入，但增加的网络代理开销对很多性能要求很高的互联网业务落地存在不少挑战。因此 Proxyless Mesh 作为一种在传统侵入式微服务框架与 Service Mesh 之间的折中方案，通过取众家之所长，为大量的非 Service Mesh 应用在云原生时代，拥抱云原生基础设施，解决流量治理等痛点提供了一种有效的解决方案。本文将介绍 Spring Cloud Alibaba 在 Proxyless Mesh 上的探索。

## Service Mesh

Standing today in 2023, Service Mesh is no longer an emerging concept. Looking back on the development history of the past 6 years, Service Mesh has been concerned and sought after by mainstream technology companies from all over the world since its launch.

站在 2023 年的今天，Service Mesh 早已不是一个新兴的概念， 回顾过去 6 年多的发展历程，Service Mesh 从一经推出就受到来自全世界的主流技术公司关注和追捧。

- In 2016, the first year of Service Mesh, Buoyant CEO William Morgan first released Linkerd[1], which became the first Service Mesh project in the industry. In the same year, Lyft released Envoy[2], which became the second Service Mesh project.
- In 2017, Google, IBM, and Lyft jointly released Istio[3]. Compared with Linkerd / Envoy and other projects, it added the concept of control plane to everyone for the first time and provided powerful traffic control capabilities. After years of development, Istio has gradually become the de facto standard for the control plane in the service mesh field.
- In July 2018, Istio 1.0 was released[4], marking that it has entered the era of production and availability. Gradually, more and more enterprises have begun to consider and try to apply service mesh to production.

- 2016 年作为 Service Mesh 的元年，Buoyant 公司 CEO William Morgan 率先发布 Linkerd[1] ，成为业界首个 Service Mesh 项目，同年 Lyft 发布 Envoy[2] ，成为第二个 Service Mesh 项目。
- 2017 年，Google、IBM、Lyft 联手发布了 Istio[3]，它与 Linkerd / Envoy 等项目相比，它首次给大家增加了控制平面的概念，提供了强大的流量控制能力。经过多年的发展 Istio，已经逐步成为服务网格领域控制平面的事实标准。
- 2018 年 7 月，Istio 1.0 版本发布[4]，标志着其进入了可以生产可用的时代，逐渐也有越来越多的企业开始考虑和尝试将服务网格应用于生产中。

As the most popular open source service mesh technology, Istio consists of two parts: the control plane and the data plane.

Istio 作为当前最流行的开源服务网格技术，它由控制平面和数据平面两部分构成。

In the Istio Mesh architecture, its control plane is a process called Istiod, and the network proxy is Envoy. As a unified component of the control plane, Istiod is responsible for docking service registration discovery, routing rule management, certificate management and other capabilities. Envoy is used as a data plane to proxy business traffic through Sidecar. Istio and Envoy complete the transfer of data such as service discovery and routing rules through the xDS protocol interface. Istiod obtains service information by monitoring K8s resources such as Service and Endpoint, and sends these resources to the network agent on the data plane through the xDS protocol. Envoy is a process independent of the application. It runs with the business application Pod in the form of a sidecar (usually in the form of a container). It shares the same host network with the application process, and hijacks the network traffic of the business application by modifying the routing table to provide applications with non-intrusive capabilities such as service authentication and label routing.

在 Istio Mesh 架构中，其控制平面是一个名为 Istiod 的进程，网络代理是 Envoy 。Istiod 作为控制面的统一组件，负责对接服务注册发现、路由规则管理、证书管理等能力，Envoy 则是作为数据面通过 Sidecar 方式代理业务流量，Istio 和 Envoy 之间通过 xDS 协议接口完成服务发现、路由规则等数据的传递。Istiod 通过监听 K8s 资源例如 Service、Endpoint 等，获取服务信息，并将这些资源统一通过 xDS 协议下发给位于数据平面的网络代理。Envoy 则是独立于应用之外的一个进程，以 Sidecar 的方式（一般是以 Container 方式）伴随业务应用 Pod 运行，它与应用进程共用同一个主机网络，通过修改路由表的方式劫持业务应用的网络流量从而达到为应用无侵入地提供如服务鉴权、标签路由等能力。

## Proxyless Mesh
The full name of Proxyless Mesh is Proxyless Service Mesh, which is a new software architecture developed on the basis of Service Mesh in recent years. The ideal of Service Mesh is full, but the reality is very skinny! Although there is no intrusion to the application through a layer of proxy, the increased network proxy overhead poses many challenges to the implementation of many Internet services with high performance requirements. Therefore, Proxyless Mesh, as a compromise between the traditional intrusive microservice framework and Service Mesh, provides an effective solution for a large number of non-Service Mesh applications in the cloud-native era, embracing cloud-native infrastructure, and solving pain points such as traffic management. The difference between Service Mesh and Proxyless Mesh architecture is shown in the following figure:

Proxyless Mesh 全称是 Proxyless Service Mesh，其是近几年在 Service Mesh 基础上发展而来的一种新型软件架构。Service Mesh 理想很丰满，但现实很骨感！通过一层代理虽然做到了对应用无侵入，但增加的网络代理开销对很多性能要求很高的互联网业务落地存在不少挑战。因此 Proxyless Mesh 作为一种在传统侵入式微服务框架与 Service Mesh 之间的折中方案，通过取众家之所长，为大量的非 Service Mesh 应用在云原生时代，拥抱云原生基础设施，解决流量治理等痛点提供了一种有效的解决方案。 Service Mesh 和 Proxyless Mesh 架构区别如下图所示：

In the past few years, well-known software open source communities at home and abroad have also conducted a lot of exploration in related fields. For example, in October 2021, the gRPC community provided users with the following architecture [5], which provides traffic management capabilities for gRPC applications by connecting to the Istio control plane and following the VirtualService & DestinationRule CRD specification.

过去几年，国内外的知名软件开源社区也都在相关领域进行了大量探索，例如在 2021 年 10 月，gRPC 社区为用户提供如下架构形式[5]，通过对接Istio控制平面，遵循 VirtualService & DestinationRule CRD 规范为 gRPC 应用提供流量治理能力。

## Spring Cloud Alibaba Mesh Solution
As an intrusive microservice solution, Spring Cloud Alibaba provides users with one-stop microservice solutions in the process of building microservice applications, such as service registration and discovery, current limiting and degradation, distributed transactions and distributed messages, based on Spring Cloud microservice standards. In the past few years, it has been adopted by a large number of small and medium-sized enterprises in China, helping a large number of enterprises to embrace microservices more conveniently. However, with the continuous deepening of microservices in enterprise applications, microservices bring many advantages such as system decoupling and high scalability to applications, and at the same time make applications more complex. How to manage microservices well? It has become a new issue that many enterprises gradually begin to pay attention to and pay attention to. The Spring Cloud Alibaba community has also noticed that many users have demands for microservice governance, so they have started exploring in this area since the beginning of 2022. The community believes that compared to Service Mesh, Proxyless Mesh is a more suitable technical solution for small and medium-sized enterprises. Not only will it not have a large performance loss caused by additional Sidecar agents, but more importantly, for enterprises, its implementation cost is very low! To solve the microservice governance needs through the Mesh solution, a control plane that can dynamically issue rules to applications is indispensable. The community adheres to the principle of not reinventing the wheel and embracing mainstream solutions in the industry. By supporting the xDS protocol, users can not only provide users with service governance for Spring Cloud Alibaba applications through the mainstream Istio control plane, but also users can use the differentiated governance capabilities provided by Alibaba's open source OpenSergo microservice governance control plane for application governance. The relevant Mesh technology solution community provides it in the recently released 2.2.10-RC version [6]. The first version that provides microservice governance capabilities has been made. The community is now partially compatible with the label routing and service authentication capabilities of Istio VirtualService & DestinationRule. Users can issue relevant rules to applications through the Istio control plane to manage traffic for applications.

Spring Cloud Alibaba 作为一种侵入式的微服务解决方案，通过基于 Spring Cloud 微服务标准为用户提供了微服务应用构建过程中的如服务注册与发现、限流降级、分布式事务与分布式消息等在内的一站式微服务解决方案。过去几年被国内大量中小企业所采用，帮助大量企业更加方便地拥抱微服务。 但随着企业应用微服化的不断深入，微服务给应用带来系统解耦、高可扩展性等诸多优势的同时，也让应用变得更加复杂。如何管理好微服务？成为了很多企业逐渐开始关注和重视的一个新的问题。Spring Cloud Alibaba 社区也注意到很多用户有微服务治理方面的诉求，于是从 2022 年初，就开始了在该方面的探索，社区觉得相比于 Service Mesh，Proxyless Mesh 是一种对广大中小企业更合适的技术方案，其不仅不会有额外 Sidecar 代理所带来的较大性能损耗，而且更重要的是对企业来说，其落地成本很低！ 要通过 Mesh 化方案解决微服务治理需求，一个能给应用动态下发规则的控制面不可或缺，社区本着不重复造轮子，拥抱业界主流解决方案的原则，通过支持 xDS 协议不仅为用户提供通过主流的 Istio 控制面来对 Spring Cloud Alibaba 应用进行服务治理以外，用户也可以使用阿里巴巴开源的 OpenSergo 微服务治理控制面所提供的差异化治理能力进行应用治理。相关提供 Mesh 技术方案社区在最近发布的 2.2.10-RC 版本[6]中进行了提供。做了提供微服治理能力的第一个版本，社区当前已经部分兼容了Istio VirtualService & DestinationRule 的标签路由和服务鉴权能力，用户可以通过 Istio 控制面给应用下发相关规则，对应用进行流量治理。

## Preparation
The Proxyless Mesh solution first needs to prepare a control plane that can dynamically deliver rules to applications. This Spring Cloud Alibaba version 2.2.10-RC1 supports two mainstream control planes currently on the market to better meet various user demands:

Proxyless Mesh 的方案首先需要准备好一个能给应用动态下发规则的控制面，本次 Spring Cloud Alibaba 2.2.10-RC1 版本支持了 2 种当前市面上的主流控制面来更好的满足各类用户诉求：

### Istio control plane
In order to use the Istio control plane to issue governance rules, you first need to install the Istio control plane in the K8s environment. You can use the Istio environment for testing provided by the Spring Cloud Alibaba community, or you can try to install an Istio control plane yourself. The process of installing the Istio control plane is as follows:

- To install the K8s environment, please refer to the Installation Tools section of K8s
- Install and enable Istio on K8s, please refer to the Installation section of the Istio official document

为了使用 Istio 控制面下发治理规则，首先需要在 K8s 环境中安装 Istio 控制面，您可以使用 Spring Cloud Alibaba 社区提供的测试用的 Istio 环境，也可以选择自己尝试安装一套 Istio 控制面，安装 Istio 控制面的流程如下：

### OpenSergo control plane

OpenSergo is an open and general-purpose microservice governance project covering microservices and upstream and downstream related components. From the perspective of microservices, OpenSergo covers key governance areas such as traffic governance, service fault tolerance, service meta-information governance, and security governance. It provides a series of governance capabilities and standards, ecological adaptation, and best practices, and supports Java, Go, Rust, and other multi-language ecosystems. As the unified control component of OpenSergo CRD, the OpenSergo control plane (Control Plane) carries the responsibility of service governance configuration conversion and distribution.

- To install the K8s environment, please refer to the Installation Tools section of K8s
- To install and enable OpenSergo Control Plane on K8s, please refer to OpenSergo Control Plane Installation Documentation officially provided by OpenSergo

OpenSergo 是开放通用的，覆盖微服务及上下游关联组件的微服务治理项目。OpenSergo 从微服务的角度出发，涵盖流量治理、服务容错、服务元信息治理、安全治理等关键治理领域，提供一系列的治理能力与标准、生态适配与最佳实践，支持 Java, Go, Rust 等多语言生态。 OpenSergo 控制平面 (Control Plane) 作为 OpenSergo CRD 的统一管控组件，承载服务治理配置转换与下发的职责。

### Label Routing

#### App Background
In the current micro-service architecture, the number of services is very large. In order to better manage these micro-service applications, it may be necessary to label these applications and divide one or more service providers into the same group, so as to restrict traffic to only flow in designated groups and achieve the purpose of traffic isolation. Label routing can be used as the capability basis for scenarios such as blue-green release and grayscale release. It can be applied in the following scenarios:

在现在的微服务架构中，服务的数量十分庞大，为了更好的管理这些微服务应用，可能需要给这些应用打上标签，并且将一个或多个服务的提供者划分到同一个分组，从而约束流量只在指定分组中流转，实现流量隔离的目的。标签路由可以作为蓝绿发布、灰度发布等场景的能力基础，它可以被应用在以下场景中

#### Multi-Version Development Test
When multiple versions are developed in parallel, a development environment needs to be prepared for each version. If there are many versions, the cost of the development environment will be very high. The traffic isolation solution can greatly reduce resource costs during multi-version development and testing. Using the full-link traffic isolation mechanism based on label routing, specific traffic can be routed to a designated development environment. For example, if only application B and application D are modified in development environment 1, Tag1 is created for the versions of these two applications in development environment 1, and corresponding routing rules are configured. When the ingress application A calls B, it will determine whether the traffic meets the routing rules. If it is satisfied, route to the V1.1 version of application B in the development environment 1; if not, route to the V1 version of application B in the baseline environment. When application C calls D, it also decides to route to version V1 or version V1.1 of D according to the traffic.

多个版本并行开发时，需要为每个版本准备一套开发环境。如果版本较多，开发环境成本会非常大。流量隔离方案可以在多版本开发测试时大幅度降低资源成本。使用基于标签路由的全链路流量隔离机制，可以将特定的流量路由到指定的开发环境。例如在开发环境 1 中只修改应用 B 和应用 D，则为这两个应用在开发环境 1 中的版本创建 Tag1 标签，并配置对应的路由规则。入口应用 A 调用 B 时，会判断流量是否满足路由规则。如果满足，路由到开发环境 1 中应用 B 的 V1.1 版本；如果不满足，路由到基线环境中的应用 B 的 V1 版本。应用 C 调用 D 的时候同样根据流量决定路由到 D 的 V1 版本或 V1.1 版本。

#### Application Traffic Isolation
If multiple versions of an application run simultaneously online and are deployed in different environments, such as a daily environment and a special environment, you can use label routing to isolate the traffic of different versions in different environments, route the flash sale order traffic or order traffic from different channels to the special environment, and route normal traffic to the daily environment. Even if the special environment is abnormal, the traffic that should have entered the special environment will not enter the daily environment, and will not affect the use of the daily environment.

如果一个应用有多个版本在线上同时运行，部署在不同环境中，如日常环境和特殊环境，则可以使用标签路由对不同环境中的不同版本进行流量隔离，将秒杀订单流量或不同渠道订单流量路由到特殊环境，将正常的流量路由到日常环境。即使特殊环境异常，本应进入特殊环境的流量也不会进入日常环境，不影响日常环境的使用。

#### A/B Testing
There are multiple application versions running online at the same time, and it is expected to perform A/B testing on different versions of the application. You can use the full-link traffic control of label routing to route the customer traffic in region A (such as Hangzhou) to version V1, and route the customer traffic in region B (such as Shanghai) to version V1.1 to verify different versions, thereby reducing the risk of releasing new products or new features, and providing guarantee for product innovation.

线上有多个应用版本同时运行，期望对不同版本的应用进行 A/B Testing，则可以使用标签路由的全链路流量控制将地域 A（如杭州）的客户流量路由到 V1 版本，地域 B（如上海）的客户流量路由到 V1.1 版本，对不同版本进行验证，从而降低新产品或新特性的发布风险，为产品创新提供保障。

Currently, the tag routing capability provided by Spring Cloud Alibaba Mesh supports tag routing for requests based on request meta-information such as request path, request header, and HTTP request parameters, so that requests sent by applications are sent to upstream services of a specified version according to the rules issued by the Istio control plane.

目前，Spring Cloud Alibaba Mesh 提供的标签路由能力支持根据请求路径、请求头和 HTTP 请求参数等请求元信息对请求做标签路由，让应用发出的请求根据 Istio 控制面下发的规则发送至指定版本的上游服务。

## Service Authentication
In normal production scenarios, microservice applications have security requirements, and any service cannot be called directly. Therefore, service authentication needs to be performed on the upstream application that calls the application to ensure the security of the application itself. Service authentication not configured Consumer 1, 2, 3 and Provider are in the same namespace, and Consumer 1, 2, 3 can call all Paths (Path 1, 2, and 3) of Provider by default. 

正常生产场景，微服务应用都具有安全要求，不会让任意的服务都可直接调用。因此需要对调用该应用的上游应用进行服务鉴权，保证应用自身的安全。 未配置服务鉴权 Consumer 1、2、3 和 Provider 在同一个命名空间内，Consumer 1、2、3 默认可以调用 Provider 的所有 Path（Path 1、2 和 3）。

Setting the authentication of all Paths can set the authentication rules for all the Paths of the Provider. For example, if the authentication rules of all the Paths of the Provider are set to reject calls from Consumer 1 (blacklist), then calls from Consumers 2 and 3 are allowed (whitelist). Set the authentication of the specified Path. On the basis of setting the authentication of all the Paths, you can also set the authentication rules of the Consumer-specified Path. For example, according to the authentication method of all the Paths, Consumer 2 and 3 can access all the Paths of the Provider, but the Path2 of the Provider involves some core business or data, and you do not want Consumer 2 to call it. Path 1 and Path 3. Currently, Spring Cloud Alibaba Mesh supports most of Istio's authentication rules, supports authentication rules other than mTLS support, and supports all Istio's string matching modes and logical operations of rules.

设置所有 Path 的鉴权可以对 Provider 的所有 Path 设置鉴权规则，例如 Provider 所有 Path 的鉴权规则设置为拒绝 Consumer 1 调用（黑名单），则允许 Consumer 2、3 调用（白名单）。 设置指定 Path 的鉴权在设置所有 Path 的鉴权基础上，还可以设置 Consumer 指定 Path 的鉴权规则，例如按所有 Path 的鉴权方式，Consumer 2、3 可以访问 Provider 的所有 Path，但 Provider 的 Path2 涉及一些核心业务或数据，不希望 Consumer 2 调用，可以将 Path 2 对 Consumer 2 的鉴权方式设置为黑名单（拒绝调用），则 Consumer 2 只能访问 Provider 的 Path 1 和 Path 3。 目前，Spring Cloud Alibaba Mesh 支持了 Istio 的大部分鉴权规则，支持了除了需要 mTLS 支持以外的鉴权规则，支持了 Istio 的所有字符串匹配模式以及规则的逻辑运算。