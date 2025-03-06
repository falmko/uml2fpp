import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

export function NewPaperScroller(paper, paperContainerEl) {
    const paperScroller = new ui.PaperScroller({
        paper: paper,
        scrollWhileDragging: true,
        autoResizePaper: true,
    });
    paperContainerEl.appendChild(paperScroller.render().el);
    paper.on('paper:pinch', (_evt, ox, oy, scale) => {
        const zoom = paperScroller.zoom();
        paperScroller.zoom(zoom * scale, { min: 0.2, max: 5, ox, oy, absolute: true });
    });
    return paperScroller;
}