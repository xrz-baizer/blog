# No plugin found for prefix 'docker' in the current project and in the plugin groups


使用maven插件 `docker-maven-plugin` 执行 `docker:build` 报错的问题

No plugin found for prefix 'docker' in the current project and in the plugin groups
[org.apache.maven.plugins, org.codehaus.mojo]
available from the repositories [local (/root/.m2/repository),
central (https://repo.maven.apache.org/maven2)] -> [Help 1]


处理方式：settings里面增加配置项

```xml
    <pluginGroups>
        <pluginGroup>com.spotify</pluginGroup>
    </pluginGroups>
```

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220115165612286-37990170.png)
