# 微信APP授权登录（Java实现示例）

## Maven

```xml
   <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-io</artifactId>
            <version>1.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.4</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.38</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
```

## 代码

```java
package com.xrz.weixin.service;

import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

/**
 * @author XRZ
 * @date 2019/8/6
 * @Description : 微信服务
 *
 *  1.app端进行请求微信授权登录，若用户同意，将获取得到授权的code
 *
 *  2.app端将code传给服务器端。
 *
 *  3.Java根据APP传过来的code，appId和secret获取得到accessToken和openId（用户唯一标识）
 *
 *  4.用accessToken和openId查询用户信息
 *
 *  5.判断是新用户/老用户登录
 */
@Slf4j
@Service
public class WeiXinService {

    /**
     * 获取access_token的URL
     */
    private static final String WX_AUTH_LOGIN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";

    /**
     * 获取用户信息的URL
     */
    private static final String WX_USERINFO_URL = "https://api.weixin.qq.com/sns/userinfo";

    /**
     * 商户ID
     */
    @Value("${weixinConfig.appId}")
    private String appId;

    /**
     * 对应私钥
     */
    @Value("${weixinConfig.appSecret}")
    private String appSecret;


    /**
     * 根据code 获取 accessToken和openId
     * @param code
     */
    public Object getToken(String code){
        if(StringUtils.isEmpty(code)){
            throw new RuntimeException("code不能为空");
        }
        //获取授权 token和openId
        StringBuffer loginUrl = new StringBuffer();
        loginUrl.append(WX_AUTH_LOGIN_URL).append("?appid=").append(appId).append("&secret=")
                .append(appSecret).append("&code=").append(code).append("&grant_type=authorization_code");

        String res = this.httpRequest(loginUrl.toString(),"GET",null);
        Map map = JSONObject.parseObject(res, Map.class);

        //获取错误码
        String errcode = map.get("errcode").toString();
        if (StringUtils.isNotEmpty(errcode)){
            throw new RuntimeException("微信服务器返回异常！错误码："+errcode);
        }
        String openId = map.get("openId").toString();
        String accessToken = map.get("access_token").toString();

        //获取用户信息
        StringBuffer userUrl = new StringBuffer();
        userUrl.append(WX_USERINFO_URL).append("?access_token=").append(accessToken).append("&openid=").append(openId);

        String userRet = this.httpRequest(userUrl.toString(),"GET",null);

        Map userMap = JSONObject.parseObject(userRet, Map.class);

        System.out.println(JSONObject.toJSON(userMap));
        //根据openId查询用户信息null--添加(没绑定手机号)
//        User userInfo = userDao.selectByWechatAndSource(openId,UserSourceEnum.APP.getCode());
        //新WX用户
//        if(userInfo==null) {
//            //添加信息，设置未绑定手机号
//            userInfo = new User();
//            String id = UUIDUtil.getUUID();
//            userInfo.setId(id);
//            userInfo.setSex(sex);
//            userInfo.setWechat(openId);
//            userInfo.setIsBindmobile(YesOrNoEnum.NO.getCode());
//            userInfo.setSource(UserSourceEnum.APP.getCode());
//            userInfo.setName(nickname);
//            userInfo.setPhoto(userImg);
//            userInfo.setCreateId(id);
//            userInfo.setCreateTime(new Date());
//            userInfo.setStatus(StatusEnum.ENABLE.getCode());
//            userDao.insertSelective(userInfo);
//            //缓存设备号
//            redisService.set(id+"deviceToken", deviceToken);

//        }
        //老WX用户
//        if(userInfo!=null ) {
//        }
        return userMap;
    }






    /**
     *  处理HTTP请求
     * @param requestUrl        请求地址
     * @param requestMethod     请求方式
     * @param outputStr         请求的参数
     * @return
     */
    public  String httpRequest(String requestUrl,String requestMethod,String outputStr){
        StringBuffer buffer=null;
        try{
            URL url=new URL(requestUrl);
            HttpURLConnection conn=(HttpURLConnection)url.openConnection();
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.setRequestMethod(requestMethod);
            conn.connect();
            //往服务器端写内容 也就是发起http请求需要带的参数
            if(null!=outputStr){
                OutputStream os=conn.getOutputStream();
                os.write(outputStr.getBytes("utf-8"));
                os.close();
            }
            //读取服务器端返回的内容
            InputStream is=conn.getInputStream();
            InputStreamReader isr=new InputStreamReader(is,"utf-8");
            BufferedReader br=new BufferedReader(isr);
            buffer=new StringBuffer();
            String line=null;
            while((line=br.readLine())!=null){
                buffer.append(line);
            }
            log.info("请求的URL：{}，返回值：{}", url, buffer.toString());
        }catch(Exception e){
            e.printStackTrace();
        }
        return buffer.toString();
    }


}

```