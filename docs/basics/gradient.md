# 渐变色与图案

## 线性渐变

&emsp;&emsp;线性渐变：createLinearGradient(double startX, double startY, double endX, double endY)。

## 放射渐变

&emsp;&emsp;线性渐变：createRadialGradient(double startCenterX, double startCenterY, double startRadius, double endCenterX, double endCenterY, double endRadius)。

## 图案

&emsp;&emsp;图案：canvas允许使用图案来对图形和文本进行描述与填充。这里的图案可以是三种之一：image元素，canvas位图或video元素。 createPattern(图案本身，repeat);

## 总结

| 名称 | 方法 | 描述 |
| :------: | :------: | :------: |
| 线性渐变 | createLinearGradient(double startX, double startY, double endX, double endY) | 创建线性渐变。传入该方法的参数表示渐变线的两个端点。该方法返回一个CanvasGradient实例，可以通过CanvasGradient.addColorStop(double [0-1], 'DomString color')方法来向该渐变色增加颜色停止点 |
| 放射渐变 | createRadialGradient(double startCenterX, double startCenterY, double startRadius, double endCenterX, double endCenterY, double endRadius) | 创建放射渐变。该方法代表位于圆锥形渐变区域两端的圆形。与createLinearGradient方法一样，该方法也返回一个CanvasGradient实例 |
| 图案 | createPattern(el, repeatString) | 略 |
