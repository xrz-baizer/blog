# 使用SpringFeign时无法正确映射属性



前置：使用@FeignClient声明的接口，正常响应

问题：想通过`@JSONField`声明把FeignClient返回`aName`字段映射到`bName`属性中，发现映射失败了。

```java
import com.alibaba.fastjson.annotation.JSONField;

public class Response{
  
    @JSONField(name = "aName")
    private String bName;
}
```

原因：在项目中没有指定Feign的序列化工具时，==Feign默认使用的是Jackson==，而`@JSONField`是**FastJSON**的注解

解决：使用Jackson的注解声明映射

```java
import com.fasterxml.jackson.annotation.JsonProperty;

public class Response{

	  @JsonProperty("aName")
    private String bName;
}
```

