import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

export function NewHalo(paper){
    paper.on('cell:pointerup', (cellView) => {
        openHalo(cellView);
    });
}

export function openHalo(cellView) {
    new ui.Halo({
        cellView: cellView,
    }).removeHandle('clone').removeHandle('fork').render();
}

export function NewSubHalo(paper){
    paper.on('cell:pointerup', (cellView) => {
        openSubHalo(cellView);
    });
}

export function openSubHalo(cellView) {
    new ui.Halo({
        cellView: cellView,
    }).removeHandle('clone').removeHandle('fork').removeHandle('unlink').removeHandle('rotate').removeHandle('link').render();
}