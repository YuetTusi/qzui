
/**
 * 矩形块
 */
class Rect {

    /**
     * CanvasContext
     */
    private context: CanvasRenderingContext2D

    /**
     * X坐标
     */
    x: number;
    /**
     * Y坐标
     */
    y: number;
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
    /**
     * 颜色
     */
    color: string;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color = '#658cc2') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.context = ctx;
    }
    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
    update(color: string) {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Rect;