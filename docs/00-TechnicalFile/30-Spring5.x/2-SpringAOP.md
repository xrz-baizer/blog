# SpringAOP

>AOP，也就是 Aspect-oriented Programming，译为面向切面编程，是 Spring 中最重要的核心概念之一。是IOC的一个扩展功能。
>
>常见的使用场景有事务管理、日志记录、权限校验等。

## 核心概念

- **切面**（Aspect）：类是对物体特征的抽象，切面就是对横切关注点的抽象（就是处理额外逻辑的类）
- **连接点**（JoinPoint）：被拦截到的点，因为 Spring 只支持方法类型的连接点，所以在 Spring 中，连接点指的是被拦截到的方法，实际上连接点还可以是字段或者构造方法
- **切点**（Pointcut）：对连接点进行拦截的定位。通过表达式来匹配对应的连接点，Spring默认使用AspectJ的切点表达式。
  - Pointcut：切入点接口。有两个方法， ClassFilter用于匹配类，MethodMatcher用于匹配方法。
- **通知**（Advice）：指拦截到连接点之后要执行的代码，也可以称作**增强**
  - BeforeAdvice（方法执行之前增强）
  - AfterReturningAdvice（方法正常执行之后增强）
  - AfterThrowingAdvice（方法抛出异常之后增强）
  - AfterAdvice（方法执行之后增强，无论是否抛出异常）
  - AroundAdvice（环绕增强，在方法执行前后增强）
- **目标对象** （Target）：代理的目标对象
- **引介**（introduction）：一种特殊的增强，可以动态地为类添加一些属性和方法（类级别的切点）
- **织入**（Weaving）：织入是将增强添加到目标类的具体连接点上的过程。织入能发生在编译时 (使用AspectJ编译器)、加载时、运行时。Spring AOP默认使用运行时织入。

## AOP代理的时机

> 准备工作：在创建所有Bean之前，Spring会把AOP需要的相关对象（Advisor、Creator）提前准备好

1. **先加载相关的BeanDefinition：Pointcut、Advisor、AbstractAutoProxyCreator**
   - 调用链：refresh -> obtainFreshBeanFactory -> loadBeanDefinitions
   - Pointcut、Advisor：我们声明的切入点、增强器等
   - AbstractAutoProxyCreator：该类没有显式声明为Bean，但是我们启用AOP时需要声明一个注解@EnableAspectJAutoProxy，Spring会读取这个注解中声明的@Import注解，从而导入AspectJAutoProxyRegistrar，进而将AbstractAutoProxyCreator的子类类AnnotationAwareAspectJAutoProxyCreator注册为BeanBeanDefinition
2. **注册BeanPostProcessor：AbstractAutoProxyCreator是一个实现了BeanPostProcessor接口的抽象类，所以此处需要注册。**
   - 调用链：refresh -> registerBeanPostProcessors
3. **初始化所有Advisor：Advisor是包含一个Pointcut和一个Advice的组合，具体的实现是AspectJPointcutAdvisor。**
   - 调用链：refresh -> finishBeanFactoryInitialization -> preInstantiateSingletons -> getBean -> doGetBean -> getSingleton -> createBean -> resolveBeforeInstantiation
   - 创建普通Bean时，当执行到createBean方法中resolveBeforeInstantiation方法时，会触发上面注册的AbstractAutoProxyCreator#postProcessBeforeInstantiation，在该方法中执行shouldSkip时（是调用具体子类的Advisor：AnnotationAwareAspectJAutoProxyCreator#shouldSkip），会通过findCandidateAdvisors先去初始化所有的Advisor，初始化完之后才回来创建普通Bean。
     - AbstractAutoProxyCreator#postProcessBefore==Instantiation==：该方法主要执行两个逻辑
       1. 初始化Advisor：为了判断是否需要跳过动态代理，会在shouldSkip中先初始化所有Advisor。
       2. 该方法支持用户创建自定义的动态代理对象
     - AspectJPointcutAdvisor的构造函数是有参的，如果对应参数还是Bean，将会去循环嵌套创建。
4. **创建代理对象的节点**
   - 在resolveBeforeInstantiation中执行AbstractAutoProxyCreator#postProcessBeforeInstantiation，初始化所有的Advisor。
   - 在initializeBean中执行AbstractAutoProxyCreator#postProcessAfterInitialization，创建AOP代理对象。
     - AbstractAutoProxyCreator#postProcessAfter==Initialization==：该方法与上面的Instantiation执行类似，上面是Spring给用户一个创建自定义代理对象的机会，这里是Spring创建标准流程的代理对象。
       - 初始化Advisor：会在shouldSkip中先初始化所有Advisor，如果上面Instantiation执行过了会直接取值缓存，然后跳过
       - 获取Advisors，通过Pointcut循环匹配，ClassFilter匹配类，MethodMatcher匹配方法。
         - 在此会排序Advisors：wrapIfNecessary -> getAdvicesAndAdvisorsForBean -> findEligibleAdvisors -> sortAdvisors
       - 匹配成功，则创建标准流程的AOP代理对象（createProxy）
   -  正常的代理对象是在Bean初始化后创建，但如果是循环依赖的代理对象，则会在属性注入时，通过三级缓存的getEarlyBeanReference提前生成代理对象。
     - AbstractAutowireCapableBeanFactory#getEarlyBeanReference：该方法内部会遍历BeanPostProcessor，触发AbstractAutoProxyCreator#getEarlyBeanReference方法的调用，通过wrapIfNecessary提前生成代理对象

## 代理对象的创建

> Spring AOP主要使用**动态代理**来实现：DefaultAopProxyFactory#createAopProxy

- 如果目标对象实现了接口 或者是Proxy类，则使用JDK动态代理。
  - JdkDynamicAopProxy：JDK动态代理，通过继承接口方式实现代理，在运行期间为接口生成代理对象

- 如果目标对象没有实现接口，则使用CGLIB代理。
  - CglibAopProxy：CGLB动态代理，在运行期间动态构建字节码的class文件，为类生成子类，因此被代理类不需要继承自任何接口。


## Advice增强方法的执行

> DynamicAdvisedInterceptor#intercept：当代理对象中的代理方法被执行时，通过该拦截器触发Advisors

- 先获取Advisor调用链，它们的顺序在初始化时就已经排序好了
- ReflectiveMethodInvocation#proceed：递归调用Advisor调用链
- Advice的执行顺序（@Around就是@Before+@After，实际使用时通常不会同时出现，如果同时出现，它们执行的顺序不会固定，即@Before可能在@Around前置之前或者之后执行，但是它们一定都是在代理方法之前执行）
  1. @Around前置
  2. @Before
  3. 代理方法执行
  4. @Around后置
  5. @After
  6. @AfterReturning或者@AfterThrowing
