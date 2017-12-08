/*
 * @Author: Alan.zheng 
 * @Date: 2017-12-08 16:35:27 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2017-12-08 16:45:56
 */
window.addEventListener('DOMContentLoaded', function () {
  var cropper;
  var uploadedImageURL;
  var uploadedImageType = 'image/jpeg';
  var URL = window.URL || window.webkitURL;
  // 上传图片
  var $image = $('#cropImage');
  if (URL) {
    $("#inputImage").on('change', function () {
      //选择图片
      var files = $(this)[0].files;
      var file;
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
            viewMode: 3, // 全覆盖显示
            aspectRatio: 3 / 2 // 设置图片比例
          });
          $('#inputImage').val(''); // 清空file
          $("#cropModal").show();
        } else {
          window.alert('请选择图片');
        }
      }
    });
  } else {
    $('#inputImage').addClass('disabled').attr('disabled', true); // 禁用上传
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
      console.log($base64);
    }
    cropper.destroy(); // 清除实例
    $("#cropModal").hide();
  });
});
