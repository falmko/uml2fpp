import { dia } from '@joint/plus';

/**
 * 创建并返回一个新的CommandManager实例
 * @param {dia.Graph} graph - JointJS图表实例
 * @returns {dia.CommandManager} 新的CommandManager实例
 */
export function NewCommandManager(graph){
    return new dia.CommandManager({
        graph: graph,
    });
}
