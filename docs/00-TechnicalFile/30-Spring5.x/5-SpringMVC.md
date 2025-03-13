# SpringMVC（draft）

## 前言

介绍 SpringMVC 的基础信息，记录 SpringMVC 的工作流程。

## 核心概念

### 什么是SpringMVC

MVC的英文是Model View Controller，是模型(model)－视图(view)－控制器(controller)的缩写，一种软件设计规范。本质上也是一种解耦。

- **Model**（模型）是应用程序中用于处理应用程序数据逻辑的部分。通常模型对象负责在数据库中存取数据。
- **View**（视图）是应用程序中处理数据显示的部分。通常视图是依据模型数据创建的。
- **Controller**（控制器）是应用程序中处理用户交互的部分。通常控制器负责从视图读取数据，控制用户输入，并向模型发送数据。

而Spring MVC是Spring在Spring Container Core和AOP等技术基础上，遵循上述Web MVC的规范推出的web开发框架，目的是为了简化Java栈的web开发。

### Spring MVC的九大内置组件

Spring MVC 作为 Spring 框架的 Web 组件，内部提供了 九大核心组件（也称“九大策略”），用于处理 HTTP 请求并将其转换为合适的响应。

1. **HandlerMapping（处理器映射器）**：找到处理请求的 Controller。
2. **HandlerAdapter（处理器适配器）**：调用 Controller 处理请求。
3. **HandlerExceptionResolver（异常解析器）**：处理 Controller 抛出的异常。
4. **ViewResolver（视图解析器）**：解析 Controller 返回的视图名称。
5. **View（视图）**：渲染最终的页面或数据。
6. **LocaleResolver（本地化解析器）**：确定请求的语言环境（国际化）。
7. **ThemeResolver（主题解析器）**：确定 Web 应用的 UI 主题。
8. **MultipartResolver（文件上传解析器）**：处理文件上传请求。
9. **FlashMapManager（Flash属性管理器）**：支持请求间临时数据传递。

### HandlerMapping（处理器映射器）

- 根据请求 URL 查找 **Handler（处理器）** 。由 Handler 来负责实际的请求处理。
  - **Handler**：具体的表现形式可以是类，也可以是方法。
  - 比如，标注了`@RequestMapping` 的每个 method 都可以看成是一个Handler

- 常见实现：
  - RequestMappingHandlerMapping（基于 `@RequestMapping` 解析）
  - SimpleUrlHandlerMapping（基于 XML 配置的 URL 解析）

### HandlerAdapter（处理器适配器）

- 执行 HandlerMapping 返回的处理器（Controller），并支持不同类型的处理器。
- 常见实现：
  - RequestMappingHandlerAdapter（处理 `@RequestMapping` 标注的方法）
  - SimpleControllerHandlerAdapter（处理 `Controller` 接口实现类）

### HandlerExceptionResolver（异常解析器）

- 拦截处理器方法抛出的异常，并返回合适的响应。
- 常见实现：
  - DefaultHandlerExceptionResolver（处理 Spring 内置异常）
  - ResponseStatusExceptionResolver（处理 `@ResponseStatus` 注解的异常）
  - ExceptionHandlerExceptionResolver（处理 `@ExceptionHandler` 注解）

### ViewResolver（视图解析器）

- 将 Controller 方法返回的 **逻辑视图名** 解析为 **具体的 View 视图对象**。
- 常见实现：
  - InternalResourceViewResolver（解析 JSP）
  - ThymeleafViewResolver（解析 Thymeleaf）
  - FreeMarkerViewResolver（解析 FreeMarker）

### View（视图）

- 将数据渲染为最终的 HTML、JSON、XML 等格式返回给客户端。
- 常见实现：
  - JstlView（基于 JSP）
  - ThymeleafView（基于 Thymeleaf）
  - MappingJackson2JsonView（返回 JSON）

### LocaleResolver（本地化解析器）

- 解析客户端语言信息，并选择合适的语言环境（国际化）。
- 常见实现：
  - AcceptHeaderLocaleResolver（默认使用 Accept-Language 头）
  - SessionLocaleResolver（基于 Session 存储的区域信息）
  - CookieLocaleResolver（基于 Cookie 存储的区域信息）

### ThemeResolver（主题解析器）

- 用于解析 Web 应用的 UI 主题，以提供不同的样式或皮肤。
- 常见实现：
  - FixedThemeResolver（固定主题）
  - SessionThemeResolver（基于 Session 解析主题）
  - CookieThemeResolver（基于 Cookie 解析主题）

### MultipartResolver（文件上传解析器）

- 解析 `multipart/form-data` 格式的请求，实现文件上传功能。
- 常见实现：
  - StandardServletMultipartResolver（基于 Servlet 3.0 的标准实现）
  - CommonsMultipartResolver（基于 Apache Commons FileUpload）

### FlashMapManager（Flash 属性管理器）

- 作用：用于在 **重定向前后** 传递临时数据（Flash Attributes）。
- 常见实现：
  - SessionFlashMapManager（基于 Session 存储 Flash 数据）

## 执行流程

### 一、初始化阶段

1. **首先，当我们启动SpringBoot应用程序的时候，我们会创建SpringApplication对象并执行对应的`run`方法**
2. **在`run`方法中创建上下文ApplicationContext、打印Banner、准备上下文prepareContext、刷新上下文`refreshContext`等**
   - 默认创建AnnotationConfigServletWebServerApplicationContext（Web 应用）
3. **而在`refreshContext`方法中，其实就是执行SpringIOC流程的`refresh`方法，在后面的`finishRefresh`方法中会去初始化一个`WebServer`，默认实现是`TomcatWebServer`**
   - finishRefresh -> LifecycleProcessor#onRefresh
4. **在`TomcatWebServer`中会去初始化一个`Servlet`，而对应的实现类是`DispatcherServlet`，在init方法（父类实现）中执行`initStrategies`完成九大组件的初始化。**
   1. DispatcherServlet称为前端控制器，是SpringMVC整个流程控制的核心。负责接收请求，进行请求分发，处理响应结果。
   2. DispatcherServlet的注册：在SpringBoot中通过DispatcherServletAutoConfiguration自动注册。
   3. TomcatWebServer调用StandardWrapper#initServlet执行初始化
   4. HttpServletBean#init -> FrameworkServlet#initServletBean -> FrameworkServlet#initWebApplicationContext
   5. 在FrameworkServlet#initWebApplicationContext方法中执行对应子类DispatcherServlet的onRefresh方法
   
5. **在`initStrategies`方法中，把对应的`HandlerMapping`处理映射器、`HandlerAdapter`处理适配器、`ViewResolvers`视图解析器全部注入到IOC容器中。**
6. **而初始化`Url`和`Controller`的关联关系是由`HandlerMapping`的子类AbstractDetectingUrlHandlerMapping实现，在对应的`initApplicationContext`方法中会遍历所有bean，把`Controller`上的`Url`和`BeanName`保存到一个`Map`中，供后续`HandlerMapping`使用。**
   - 在AbstractUrlHandlerMapping#registerHandler方法存放`Map<urls,beanName> handlerMap = new LinkedHashMap<>();`

> 注意：默认项目启动的时候是不会加载去 Servlet 的，只有在第一次响应Web请求的时候才会去初始化。可以通过配置`spring.mvc.servlet.load-on-startup=1`，让 **DispatcherServlet** 在容器启动时就执行 init 方法。

### 二、调用阶段

1. **当程序接受到`Request`请求时，会统一拦截调用到`DispatcherServlet#doService`方法处理。**
   - “统一拦截”是在Servlet容器层面完成的：当一个 HTTP 请求到来时，Web 服务器（例如 Tomcat）会根据配置的 Servlet 映射规则（如在 web.xml 中或通过 Servlet 3.0 的编程方式注册 DispatcherServlet）判断该请求是否应该由 DispatcherServlet 处理。如果匹配上（通常配置为“/”或其它 URL 模式），则请求会被 Servlet 容器拦截并转发给 DispatcherServlet 的 `service()` 方法，从而进入 Spring MVC 的处理流程。
2. **在内部的`doDispatch()`方法中首先通过`getHandler()`方法获取`HandlerMapping`，再通过`Request`请求的`Url`来匹配对应的`Controller`**
3. **`DispatcherServlet`找到`Controller`之后再通过`HandlerAdapter`去匹配具体的执行方法**
   1. 对应Adapter实现类是RequestMappingHandlerAdapter，通过handleInternal方法执行核心逻辑
4. **匹配逻辑就是把当前`Controller上声明的Url`和`方法上声明的Url`拼接起来，跟当前`Request请求的Url`循环匹配。**
5. **匹配成功之后得到具体的执行方法，再通过`HandlerAdapter#handle`方法执行调用，处理完成后返回一个`ModelAndView`对象。**
   - 具体的实现方法RequestMappingHandlerAdapter#invokeHandlerMethod -> invokeAndHandle
   - invokeAndHandle()最终要实现的目的就是：**完成 Request 中的参数和方法参数上数据的绑定。**
     - 通过getMethodArgumentValues()方法从Request中获取注入的参数（`@RequestParam`、 `@PathVariable`）
     - Spring MVC 中提供两种 Request 参数到方法中参数的绑定方式：
       - 通过注解进行绑定，@RequestParam。
       - 通过参数名称进行绑定。
     - 使用注解进行绑定，我们只要在方法参数前面声明@RequestParam(“name”)，就可以将 request 中参数 name 的值绑定到方法的该参数上。使用参数名称进行绑定的前提是必须要获取方法中参数的名称，Java 反射只提供了获取方法的参数的类型，并没有提供获取参数名称的方法。
       - SpringMVC 解决这个问题的方法是用 asm 框架读取字节码文件，来获取方法的参数名称。
       - asm 框架是一个字节码操作框架，如果使用注解来完成参数绑定，可以省去 asm 框架的读取字节码的操作。
6. **`DispatcherServlet`接收到`ModelAndView`后，会使用 `ViewResolver` 来解析视图`View`，再把`View`渲染为HTML页面，最终再返回结果。**

#### ==Restful风格的MVC流程==

1. **在目前项目都是前后端分离的情况下，通常都是直接返回一个JSON数据，而不是`ModelAndView`**
   - 通过`@ResponseBody`注解声明响应的数据格式为JSON
2. **`HandlerAdapter`在执行`handler`时，会通过`RequestResponseBodyMethodProcessor`处理返回值，在`handleReturnValue`方法中创建`ServletServerHttpResponse`，将返回值通过序列化写入这个`Response`的`Body`。**
3. **最后，返回一个null空的`ModealAndView`。**

<img src="../../Image/image-20241108073157265.png" alt="image-20241108073157265"  />

## 参考资料

- 一步一步手绘Spring MVC运行时序图（Spring MVC原理） https://blog.csdn.net/weixin_38024782/article/details/109108162

- SpringMVC流程图 https://www.processon.com/view/link/63dc99aba7d181715d1f4569

- https://javabetter.cn/sidebar/sanfene/spring.html#_28-spring-mvc-%E7%9A%84%E6%A0%B8%E5%BF%83%E7%BB%84%E4%BB%B6

  

