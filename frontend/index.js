import { dia, shapes } from '@joint/plus';

import './joint-plus.css';
import './styles.css';
import { UMLClass } from './shapes/shapes'
import { Telemetry } from './shapes/telemetry';
import { Events } from './shapes/events';
import { Composition } from './shapes/link';
import { ComponentBase } from './shapes/compoent_base';
import { Parameters } from './shapes/parameters';
import { Commands } from './shapes/commands';
import { NewInspector } from './inspectors/inspectors';
import { InputPort, OutputPort } from './shapes/port';
import { NewStencil } from './stencil/stencil';
import { NewSelection } from './selection/selection';
import { NewHalo } from './halo/halo';
import { NewKeyboard } from './keyboard/keyboard';
import { NewToolbar } from './toolbar/toolbar';
import { NewPortMoveTool } from './port_move_tool/port_move_tool';
import { NewCommandManager } from './command_manager/command_manager';
import { NewPaperScroller } from './paper_scroller/paper_scroller';
import { CustomLink, customRouter, CustomValidateConnection } from './link/link';

shapes.UMLClass = UMLClass;
shapes.UMLClassView = shapes.standard.HeaderedRecordView;
shapes.Telemetry = Telemetry;
shapes.TelemetryView = shapes.standard.HeaderedRecordView;
shapes.Events = Events;
shapes.EventsView = shapes.standard.HeaderedRecordView;
shapes.Composition = Composition;
shapes.ComponentBase = ComponentBase;
shapes.ComponentBaseView = shapes.standard.HeaderedRecordView;
shapes.Parameters = Parameters;
shapes.ParametersView = shapes.standard.HeaderedRecordView;
shapes.Commands = Commands;
shapes.CommandsView = shapes.standard.HeaderedRecordView;
shapes.InputPort = InputPort;
shapes.OutputPort = OutputPort;

const graph = new dia.Graph({}, { cellNamespace: shapes });
const paperContainerEl = document.getElementById("paper");
const stencilContainerEl = document.getElementById("stencil");
const toolbarContainerEl = document.getElementById("toolbar");
const inspectorContainer = document.getElementById('inspector');

// Paper
// -----
const paper = new dia.Paper({
    model: graph,
    cellViewNamespace: shapes,
    width: 2000,
    height: 1440,
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
const paperScroller = NewPaperScroller(paper, paperContainerEl);
const commandManager = NewCommandManager(graph);

NewHalo(paper);
NewSelection(paper);
NewKeyboard(paper);
NewToolbar(paperScroller, commandManager, toolbarContainerEl);
NewStencil(graph, paper, shapes, stencilContainerEl, inspectorContainer);
NewPortMoveTool(paper, inspectorContainer);
NewInspector(paper, inspectorContainer);