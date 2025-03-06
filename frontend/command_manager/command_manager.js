import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

export function NewCommandManager(graph){
    return new dia.CommandManager({
        graph: graph,
    });
}