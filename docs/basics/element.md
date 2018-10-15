# Canvas元素

## 前言

&emsp;&emsp;Canvas 是由canvas标签及javascript组合实现的图片。

## 后备内容

&emsp;&emsp;后备内容即浏览器不支持情况下展示的内容。如以下试例：

```html
<canvas>
    Canvas not supported // 此处为后备内容
</canvas>
```

## 注意事项

* 在默认情况下，浏览器创建的canvas元素大小为: *300 x 150* 像素值（px）, canvas元素大小值最好是*非负整数* 。
* 通过css修改画布大小时候，可能产生意外情况，css修改的是Canvas元素本身大小，并没有改变Canvas元素绘图表面大小。建议：

```html
    // 方法一：[推荐]
    <canvas width="$width" height="$height"></canvas>
    // 方法二：(js)
    oCanvas.width=$width;
    oCanvas.height=$height
```

* 在canvas对象上调用getContext('2d')方法，获取绘制环境变量。"2d"中的"d"必须小写
