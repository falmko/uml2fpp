import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

let toolbat = null;
export function getToolbar(){
    return toolbar;
}
export function NewToolbar(paperScroller, commandManager, toolbarContainerEl){
    toolbar = new ui.Toolbar({
        autoToggle: true,
        theme: 'modern',
        tools: [
            'zoomIn',
            'zoomOut',
            'zoomToFit',
            'zoomSlider',
            'separator',
            'undo',
            'redo',
            'fullscreen',
            'separator',
            {
                type: 'button',
                name: 'xml',
                text: 'Export XML',
            }
        ],
        references: {
            paperScroller: paperScroller,
            commandManager: commandManager,
        }
    });
    toolbarContainerEl.appendChild(toolbar.render().el);
    toolbar.on('xml:pointerclick', () => {
        // TODO Export UML diagram to XML
        console.Events('Export XML clicked');
    });
}
