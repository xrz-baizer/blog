# 阿里云OSS图片上传（Java实现示例）

## Maven
```xml
        <!-- 阿里云OSS对象储存 -->
        <dependency>
            <groupId>com.aliyun.oss</groupId>
            <artifactId>aliyun-sdk-oss</artifactId>
            <version>2.8.3</version>
        </dependency>
```
## 代码
```java
package cn.tmsc.commons.upload;

import com.aliyun.oss.OSSClient;
import com.aliyun.oss.model.PutObjectRequest;
import org.apache.commons.io.FilenameUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.Date;
import java.util.UUID;

/**
 * @author XRZ
 * @date 2019-05-10
 * @Description : 阿里云OSS对象存储工具类
 */
public class OSSUtil {

    private static String endpoint = "oss-cn-shenzhen.aliyuncs.com";             //EndPoint（地域节点）
    private static String accessKeyId = "**********";                      //阿里云主账号AccessKey
    private static String accessKeySecret = "*****************";    //对应的accessKeySecret
    private static String bucketName = "*****";                               //Bucket 名称


    /**
     * 上传文件
     *
     * @param suffix 文件后缀
     * @param file 文件对象
     * @return URL 绝对路径
     */
    public static String uploadFileToOss(String suffix, MultipartFile file) throws IOException {
        // 创建OSSClient实例。
        OSSClient ossClient = new OSSClient(endpoint, accessKeyId, accessKeySecret);
        try {
            //获取UUID 用于文件名 以确保文件名的唯一
            String uuid = UUID.randomUUID().toString().replaceAll("-", "");
            //文件名 = UUID + 后缀
            String fileName = uuid + "." +suffix;
            //上传至OSS    PutObjectRequest(Bucket名称,文件名,MultipartFile类型的文件)
            ossClient.putObject(new PutObjectRequest(bucketName,fileName,new ByteArrayInputStream(file.getBytes())));
            // 设置URL过期时间为100年，默认这里是int型，转换为long型即可
            Date expiration = new Date(new Date().getTime() + 3600l * 1000 * 24 * 365 * 100);
            // 生成URL
            URL url = ossClient.generatePresignedUrl(bucketName, fileName, expiration);
            return url.toString().split("[?]")[0]; //返回文件的绝对路径
        } finally {
            ossClient.shutdown();  //关闭OSSClient。
        }
    }


    /**
     * 删除文件
     * @param URL 绝对路径
     * @return boolean
     */
    public static boolean deleteImg(String url) {
        //提取文件名
        String[] urls =  url.split("[/]");
        String fileName = urls[urls.length-1];
        // 创建OSSClient实例。
        OSSClient ossClient = new OSSClient(endpoint, accessKeyId, accessKeySecret);
        try{
            if(fileName.equals("user.jpg")){ //保留默认文件
                return true;
            }
            //判断文件是否存在
            if(ossClient.doesObjectExist(bucketName, fileName)){
                //删除文件
                ossClient.deleteObject(bucketName, fileName);
            }
        }finally {
            ossClient.shutdown(); //关闭OSSClient。
        }
        return true;
    }


    /**
     * 获取文件后缀
     * @param fileupload
     * @return
     */
    public static String getSuffix(MultipartFile fileupload){
        String originalFilename = fileupload.getOriginalFilename(); //获取文件名
        return FilenameUtils.getExtension(originalFilename);//获取文件名后缀
    }


}

```