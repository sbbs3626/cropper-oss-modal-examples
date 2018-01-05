# cropper-oss-modal-examples

基于jquery+cropper.js裁剪插件，cropper裁剪后上传至阿里云OSS，根据官方文档制作成适合自己项目使用，选择图片后通过弹出窗裁剪图片，目前只实现了功能，后续再完善细节，因为项目本身使用了layer.js,所以用layer做了弹出框部分，可根据需要修改。

使用

```
$('#inputImage').fileCropper({
    'dir': 'demo/', // 上传图片路径 
    'isView': true, // 是否生成预览图 
    'isBase64': false, // 是否生成base64格式
    'aspectRatio': 3 / 2, // 设置图片比例
    'maxWidth': 400 // 缩略图大小
},function (data) { 
    alert(data);
}); 
          
```
          
cropper相关

```

new Cropper(image,{option});

```

生成canvas

```

cropper.getCroppedCanvas() 

```

canvas转base64 

```

cropper.getCroppedCanvas().toDataURL

```


转blob使用ajax提交

```

// Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`
cropper.getCroppedCanvas().toBlob(function (blob) {
  var formData = new FormData();

  formData.append('croppedImage', blob);

  // Use `jQuery.ajax` method
  $.ajax('/path/to/upload', {
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function () {
      console.log('Upload success');
    },
    error: function () {
      console.log('Upload error');
    }
  });
});

```
