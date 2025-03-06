import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

export var selection = null;
let region = null;

export function getSelection(){
    return selection;
}
export function getRegion(){
    return region;
}

export function NewSelection(paper){
    selection = new ui.Selection({
        paper: paper,
    });
    // Initiate selecting when the user grabs the blank area of the paper.
    paper.on('blank:pointerdown', selection.startSelecting);
    // Select an element if CTRL/Meta key is pressed while the element is clicked.
    paper.on('element:pointerup', (cellView, evt) => {
        if (evt.ctrlKey || evt.metaKey) {
            // 如果按住 CTRL/Meta 键，添加到现有选择
            selection.collection.add(cellView.model);
        } else {
            // 如果没有按住 CTRL/Meta 键，清除现有选择并选中当前元素
            selection.collection.reset([cellView.model]);
        }
    });
    // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
    selection.on('selection-box:pointerdown', (elementView, evt) => {
        if (evt.ctrlKey || evt.metaKey) {
            this.selection.collection.remove(elementView.model);
        }
    });
    // Region Selection
    region = new ui.RectangularSelectionRegion({ paper });
    paper.on('blank:pointerdown', async () => {
        const area = await region.getUserSelectionAsync();
        if (!area) return;
    });
}

