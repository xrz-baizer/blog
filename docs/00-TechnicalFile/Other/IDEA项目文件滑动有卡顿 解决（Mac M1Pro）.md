# IDEA项目文件滑动有卡顿 解决（Mac M1Pro）

Help -> Edit Custom Vm Options

```
-Dsun.java2d.opengl=true
-Dsun.java2d.opengl.fbobject=false
```
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/6b844b51c9d5dc320dcd3f721884f7a1.png#pic_center)

重启即可

DataGrip同