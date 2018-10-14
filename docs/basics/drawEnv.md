# Canvas绘制环境2d

## 前言

&emsp;&emsp;canvas元素仅仅是为了充当绘图环境对象的容器而存在的。该环境对象提供了全部的绘制功能。

## CanvasRenderingContext2D属性

| 属性 | 简介 |
| :------: | :------: |
| canvas | 指向改绘图环境所属的canvas对象，改属性最常见的用途就是通过它来获取canvas的贩毒及高度，分别调用context.canvas.width,context.canvas.height |
| fillstyle | 指定该绘图环境在否需的图形填充操作中所使用的颜色，渐变色或图案。 |
| filter | [请参考](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter) |
| font | 设定在调用绘图环境对象的fillText() 或 strokeText() 方法时，所使用的字型。 |
| globalAlpha | 全局透明度设定，它可以取0（完全透明）~ 1.0（完全不透明）之间的值。浏览器会将每个像素的alpha值与该值相乘。在绘制图像时也是如此。 |
| globalCompsiteOperation | 该值决定了浏览器将某个物体绘制在其他物体之上时，所采用的绘制方式。 |
| lineCap | 该值告诉浏览器如何绘制线段的端点。取值(取其一)： "butt", "round"及"square"， 默认值是butt。 |
| lineWidth | 该值决定了在canvas之中绘制线段的屏幕像素宽度。它必须是个非负，非无穷的double值。默认值是1.0. |
| lineJoin | 该值告诉浏览器在两条线相交时如何绘制焦点。可取的值是：bevel, round, miter。默认值是miter。 |
| miterLimit | 该值告诉浏览器如何绘制miter形式的线段焦点。 |
| shadowBlur | 该值决定了浏览器该如何延伸阴影效果，值越高，阴影效果延伸得就越远。该值不是指定阴影的像素长度，而是代表高斯模糊方程式中的参考值。它必须是一个非负且非无穷量的double值，默认值是0。 |
| shadowColor | 该值告诉浏览器使用何种颜色来绘制阴影，通常采用半透明色作为该属性的值，以便让后面的背景能显示出来。 |
| shadowOffsetX | 以像素为单位，指定了阴影效果的水平方向偏移量。 |
| shadowOffsetY | 以像素为单位，指定了阴影效果的垂直方向偏移量。 |
| strokeStyle | 指定了对路径进行扫描时所用的绘制风格。该值可被设定为某个颜色，渐变色或图案。 |
| textAlign | 决定了以fillText() 或 strokeStyle() 方法进行绘制时。所画文本的水平对齐方式。 |
| textBaseline | 决定了以fillText() 或 strokeStyle() 方法进行绘制时。所画文本的垂直对齐方式。 |
