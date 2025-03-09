import { dia } from '@joint/plus';

export function NewCommandManager(graph){
    return new dia.CommandManager({
        graph: graph,
    });
}