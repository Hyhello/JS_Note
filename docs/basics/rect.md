# 矩形

&emsp;Canvas提供了如下三个方法，分别用于矩形的清除，描边及填充：

| 方法 | 描述 |
| :------: | :------: |
| clearRect(double x, double y, double width, double height) | 将指定矩形与当前剪辑区域范围内的所有像素清除 |
| storkeRect(double x, double y, double width, double height) | 使用如下属性，进行描边：1. storkeStyle。 2. lineWidth。 3. lineJoin。 4. miterLimit【两线交接处的最大斜接长度。】。如果width/height 有其一为0,则绘制直线，如果都为0，则不进行绘制 |
| fillRect(double x, double y, double width, double height) | 如果width/height 有其一为0，则不进行绘制 |
---
