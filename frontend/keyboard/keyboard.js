import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';
import { getSelection } from '../selection/selection';
let clipboard = null;
let keyboard = null;

export function NewKeyboard(paper) {
    clipboard = new ui.Clipboard({ useLocalStorage: false });
    keyboard = new ui.Keyboard;
    // 
    keyboard.on('ctrl+c', () => clipboard.copyElements(getSelection().collection, paper.model));
    keyboard.on('ctrl+x', () => clipboard.cutElements(getSelection().collection, paper.model));
    keyboard.on('ctrl+v', () => clipboard.pasteCells(paper.model));
    keyboard.on('ctrl+a', (evt) => {
        // 阻止浏览器默认的全选行为
        evt.preventDefault();
        // 获取图上所有元素
        const elements = graph.getElements();
        // 将所有元素添加到选择集合中
        const selection = getSelection();
        selection.collection.reset(elements);
    });
    keyboard.on('delete', () => {
        const selection = getSelection();
        // 获取当前选中的所有元素并转换为数组
        const cells = selection.collection.toArray();
        // 删除所有选中的元素
        cells.forEach(cell => cell.remove());
        // 清空选择集合  
        selection.collection.reset();
    });
}