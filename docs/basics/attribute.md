# Canvas属性

## 前言

&emsp;&emsp;Canvas元素对象包含两个属性及三个对象。

## 两个属性

| 属性 | 类型 | 取值范围 | 默认值 |
| :------: | :------: | :------: | :------: |
| width | 非负整数 | 略 | 300 |
| height | 非负整数 | 略 | 150 |

## 三个方法

| 方法 | 参数 | 返回值 | 描述 |
| :------: | :------: | :------: | :------: |
| getContext(type) | 2d/3d(必填)。 "d"必须小写 | context对象 | 返回与该canvas元素相关的绘图环境对象。每个canvas元素均有一个这样的环境对象，而且每个环境对象均与一个canvas元素相关联 |
| toDataURL(type, quality) | 第一个参数指定了图像的类型，例如image/jpeg，如果不指定第一个参数，这默认使用image/png。第二个参数必须是0 ~ 1.0之间的double值，他表示JPEG图像的显示质量。 | base64(image) | 返回一个数据地址（data URL），你可以将它设为img元素的src属性值。 |
| toBlob(callback, type, args...) | 第一个参数是一个回调函数(必填)，浏览器会以一个指定blob的应用为参数。第二个参数指定图像类型, default: image/png。 第三个参数指定图像质量，范围在：0 ~ 1.0之间的double值。 | void | 创建一个用于表示此canvas元素图像文件的Blob。 |
