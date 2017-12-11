/*
 * @Author: Alan.zheng 
 * @Date: 2017-12-08 16:35:27 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2017-12-11 16:53:37
 */
$(function () {
  var cropper;
  var uploadedImageURL;
  var uploadedImageType = 'image/jpeg';
  var URL = window.URL || window.webkitURL;
  // 上传图片
  var $image = $('#cropImage'); 
  var $file = $("#inputImage"); // 上传file
  var $cropModalBox = $('#cropModal'); //弹出框
  var file;  
  if (URL) {
    $file.on('change', function () {
      //选择图片
      var files = $(this)[0].files;
      file = files[0];
      if (files && files.length) {
        if (/^image\/\w+/.test(file.type)) {
          // 是否为图片
          uploadedImageType = file.type;
          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
          }
          uploadedImageURL = URL.createObjectURL(file);
          $image.attr('src', uploadedImageURL); // 替换图片路径
          cropper = new Cropper($image[0], {
            // 调用cropper裁剪
            viewMode: 2, // 全覆盖显示
            aspectRatio: 3 / 2, // 设置图片比例
            preview: '.img-preview'
          });
          $file.val(''); // 清空file
          $cropModalBox.show();
        } else {
          window.alert('请选择图片');
        }
      }
    });
  } else {
    $file.addClass('disabled').attr('disabled', true); // 禁用上传
    window.alert('您的浏览器版本过低');
  }

  $('.crop-modal-close').on('click', function () {
    // 关闭弹出窗
    if ($(this).hasClass('crop-modal-btn')) {
      // 确定裁剪
      var $result = cropper.getCroppedCanvas({
        width: 400
      }); // 生成一个400宽的canvas预览图
      var $base64 = $result.toDataURL(uploadedImageType); // 生成base64
      $('.crop-view').html($result).next("#base64").val($base64);
      $result.toBlob(function (blob) {
        // 生成blob ,file对象
        uploadCrop(blob); // 调用上传
      }); 
    }
    cropper.destroy(); // 清除实例
    $cropModalBox.hide();
  });

/******************************以下是上传到阿里云************************************/

  var d = new Date();
  var str = d.getFullYear() + (d.getMonth() + 1) + d.getDate() + ''; //获取当日
  var expire = 0; //时间戳
  var dir = 'zp-customer/ur/' + str +'/'; // 上传的路径
  var apiObj = {};

  send_request = function () {
    //这是从后台获取认证策略等信息。
    var htmlobj = $.ajax({ url: "http://api.imrobotic.com/store/upload/image?dir=" + dir, async: false });
    return htmlobj.responseText;
  };

  function get_signature()//读取获得的参数
  {
    //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
    now = timestamp = Date.parse(new Date()) / 1000;
    if (expire < now + 3) {
      body = send_request();
      apiObj = eval("(" + body + ")");
      expire = parseInt(apiObj['expire'])
      return true;
    }
    return false;
  }
  function uploadCrop(blob){
    get_signature(); //请求认证信息
    //组装发送数据
    var request = new FormData();
    request.append("OSSAccessKeyId", apiObj.accessid);//Bucket 拥有者的Access Key Id。
    request.append("policy", apiObj.policy);//policy规定了请求的表单域的合法性
    request.append("Signature", apiObj.signature);//根据Access Key Secret和policy计算的签名信息，OSS验证该签名信息从而验证该Post请求的合法性
    //---以上都是阿里的认证策略 
    request.append("key", apiObj.dir + file.name);//文件名字，可设置路径
    request.append("success_action_status", '200');// 让服务端返回200,不然，默认会返回204
    request.append('file', blob); //需要上传的文件 file
    $.ajax({
      url: apiObj.host,  //上传阿里地址
      data: request,
      processData: false,//默认true，设置为 false，不需要进行序列化处理
      cache: false,//设置为false将不会从浏览器缓存中加载请求信息
      async: false,//发送同步请求
      contentType: false,//避免服务器不能正常解析文件
      dataType: 'JSON',//不涉及跨域  写json即可
      type: 'POST',
      success: function (callbackHost, request) {
        console.log(callbackHost, request)
      }
    });
  }  
});
