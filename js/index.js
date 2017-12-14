/*
 * @Author: Alan.zheng 
 * @Date: 2017-12-08 16:35:27 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2017-12-14 09:45:10
 */
;(function ($, window, document, undefined) {
  $.fn.fileCropper = function (options, callback) {
    var defaults = {
      'dir': 'demo/', // 上传图片路径
      'isView': true, // 是否生成预览图
      'isBase64': true // 是否生成base64格式
    };
    var settings = $.extend({}, defaults, options);
    var file;
    var cropper;
    var uploadedImageURL;
    var uploadedImageType = 'image/jpeg';
    var URL = window.URL || window.webkitURL;
    var $inputFile = this; // 上传file
    if (URL) {
      $inputFile.on('change', function () {
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
            layer.open({
              type: 1,
              title: '裁剪所需要的区域，操作滚轮进行缩放',
              skin: 'layui-layer-rim', //加上边框
              area: ['800px', '450px'], //宽高
              btn: ['裁剪并上传'],
              content: '<img id="cropImage" src="' + uploadedImageURL + '">',
              success: function () {
                cropper = new Cropper($('#cropImage')[0], {
                  // 调用cropper裁剪
                  viewMode: 2, // 全覆盖显示
                  aspectRatio: 3 / 2 // 设置图片比例
                });
                $inputFile.val(''); // 清空file 
              },
              yes: function (index) {
                // 确定裁剪
                var $result = cropper.getCroppedCanvas({
                  // 生成一个400宽的canvas预览图
                  width: 400
                });
                var $base64 = $result.toDataURL(uploadedImageType); // 生成base64
                if (settings.isView) {
                  if ($('.crop-view').length > 0) {
                    $('.crop-view').remove();
                  }
                  var $cropView = $('<div class="crop-view"></div>').html($result);
                  $inputFile.parent().after($cropView);
                }
                if (settings.isBase64) {
                  $('<input type="hidden" name="base64" id="base64">').val($base64).appendTo('.crop-view');
                }
                $result.toBlob(function (blob) {
                  // 生成blob ,file对象
                  uploadCropper.start(file, blob); // 调用上传
                });
                cropper.destroy(); // 清除实例
                layer.close(index);
              },
              cancel: function () {
                cropper.destroy(); // 清除实例
              }
            });
          } else {
            layer.msg('您选择的图片格式不支持');
          }
        }
      });
    } else {
      $inputFile.addClass('disabled').attr('disabled', true); // 禁用上传
      layer.alert('您的浏览器版本过低');
    }

    /******************************以下是上传到阿里云************************************/

    var d = new Date();
    var str = d.getFullYear() + '' + (d.getMonth() + 1) + d.getDate(); //获取当日
    var expire = 0; //时间戳
    var apiObj = {};
    var uploadCropper = {
      send_request: function () {
        //这是从后台获取认证策略等信息。
        var htmlobj = $.ajax({
          url: "http://api.imrobotic.com/store/upload/image?dir=" + settings.dir + str + '/',
          async: false
        });
        return htmlobj.responseText;
      },
      get_signature: function () {
        //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
        now = timestamp = Date.parse(new Date()) / 1000;
        if (expire < now + 3) {
          body = this.send_request();
          apiObj = eval("(" + body + ")");
          expire = parseInt(apiObj['expire'])
          return true;
        }
        return false;
      },
      start: function (file, blob) {
        this.get_signature(); //请求认证信息
        //组装发送数据
        var request = new FormData();
        request.append("OSSAccessKeyId", apiObj.accessid); //Bucket 拥有者的Access Key Id。
        request.append("policy", apiObj.policy); //policy规定了请求的表单域的合法性
        request.append("Signature", apiObj.signature); //根据Access Key Secret和policy计算的签名信息，OSS验证该签名信息从而验证该Post请求的合法性
        //---以上都是阿里的认证策略
        request.append("key", apiObj.dir + expire + file.name); //文件名字，可设置路径
        request.append("success_action_status", '200'); // 让服务端返回200,不然，默认会返回204
        request.append('file', blob); //需要上传的文件 file
        $.ajax({
          url: apiObj.host, //上传阿里地址
          data: request,
          processData: false, //默认true，设置为 false，不需要进行序列化处理
          cache: false, //设置为false将不会从浏览器缓存中加载请求信息
          async: false, //发送同步请求
          contentType: false, //避免服务器不能正常解析文件
          type: 'POST',
          success: function (request) {
            layer.msg('上传成功');
            callback(apiObj.dir + expire + file.name);
          },
          error: function () {
            layer.msg('上传失败');
          }
        });
      }
    };
  };
})(jQuery, window, document);


$(function () {
  $('#inputImage').fileCropper({
    'dir': 'demo/demo/', // 上传图片路径
    'isView': true, // 是否生成预览图
    'isBase64': true // 是否生成base64格式
  },function (data) {
    alert(data);
  });
});