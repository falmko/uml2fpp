import { dia, shapes } from '@joint/plus';
import { NewInspector } from '../inspectors/inspectors';
import { NewSubHalo } from '../halo/halo';
import { NewSubToolbar } from '../toolbar/toolbar';
import { NewCommandManager } from '../command_manager/command_manager';
import { NewPaperScroller } from '../paper_scroller/paper_scroller';
import { CustomLink, customRouter, CustomValidateConnection } from '../link/link';

export var subElements = new Map();

// 子画布 弹出窗口中使用
export const subGraph = new dia.Graph({}, { cellNamespace: shapes });
const subPaperContainerEl = document.getElementById("modal-body");
const subToolbarContainerEl = document.getElementById("sub-toolbar");
const subInspectorContainer = document.getElementById('sub-inspector');

// Paper
// -----
export const subPaper = new dia.Paper({
    model: subGraph,
    cellViewNamespace: shapes,
    width: 1600,
    height: 1200,
    gridSize: 20,
    drawGrid: { name: "mesh" },
    async: true,
    sorting: dia.Paper.sorting.APPROX,
    background: { color: "#F3F7F6" },
    defaultLink: CustomLink,
    defaultRouter: customRouter,
    defaultConnector: { name: 'rounded', args: { cornerType: 'line' } },
    defaultConnectionPoint: { name: "boundary" },
    clickThreshold: 10,
    magnetThreshold: "onleave",
    linkPinning: false,
    validateConnection: CustomValidateConnection,
    snapLinks: { radius: 10 }
});
const subPaperScroller = NewPaperScroller(subPaper, subPaperContainerEl);
const subCommandManager = NewCommandManager(subGraph);

NewSubHalo(subPaper);
NewSubToolbar(subPaperScroller, subCommandManager, subToolbarContainerEl);
NewInspector(subPaper, subInspectorContainer);

// listen delete event and remove the element from subElements
subGraph.on('remove', function (cell) {
    console.log("delete sub element", cell);
    if (cell.attributes.type == "Composition") {
        const sourceId = cell.attributes.source.id;
        const targetId = cell.attributes.target.id;
        const cid = cell.cid;
        console.log("sourceId", sourceId);
        console.log("targetId", targetId);
        console.log("cid", cid);
        
        if (subElements.has(sourceId)) {
            let targetObj = subElements.get(sourceId);
            console.log("targetObj", targetObj);
            
            // 1. 从links数组中删除对应的链接 - 使用cid查找
            if (targetObj.links && Array.isArray(targetObj.links)) {
                const linkIndex = targetObj.links.findIndex(link => link.cid === cid);
                
                if (linkIndex !== -1) {
                    targetObj.links.splice(linkIndex, 1);
                    console.log("删除链接:", cid);
                }
            }
            
            // 2. 找到并删除对应的组件
            for (const componentType of ['events', 'telemetry', 'parameters', 'commands']) {
                if (targetObj[componentType] && targetObj[componentType].id === targetId) {
                    delete targetObj[componentType];
                    console.log(`删除组件: ${componentType}`);
                    break;
                }
            }
            
            subElements.set(sourceId, targetObj);
            console.log("subElements已更新", subElements);
        }
    }
});