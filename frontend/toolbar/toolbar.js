import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';
import { commandKindOptions } from '../shapes/commands';

let toolbat = null;
export function getToolbar() {
    return toolbar;
}
export function NewToolbar(paperScroller, commandManager, toolbarContainerEl) {
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

    //     // 获取画布中的所有元素
    //     const graph = paperScroller.options.paper.model;
    //     const allCells = graph.getCells();

    //     // 获取所有组件类
    //     const componentBaseCells = allCells.filter(cell => cell.attributes.classType === 'Component');

    //     // 对每个组件生成单独的XML文件
    //     // 对每个组件的端口生成单独的XML文件
    //     componentBaseCells.forEach(cell => {
    //         console.log(cell);

    //         const { name: componentName, namespace: componentNamespace, kind: componentKind, modeler: componentModeler, comment: componentComment } = cell.getProperties();

    //         // 创建组件XML文件
    //         const xmlDoc = document.implementation.createDocument(null, null, null);
    //         const processingInstruction = xmlDoc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
    //         xmlDoc.appendChild(processingInstruction);
    //         // 创建根元素
    //         const rootElement = xmlDoc.createElement('component');
    //         rootElement.setAttribute('name', componentName);
    //         rootElement.setAttribute('kind', componentKind.toLowerCase());
    //         rootElement.setAttribute('namespace', componentNamespace);
    //         rootElement.setAttribute('modeler', componentModeler);
    //         xmlDoc.appendChild(rootElement);

    //         // 创建注释
    //         if (componentComment !== undefined && componentComment !== "") {
    //             const commentElement = xmlDoc.createElement('comment');
    //             commentElement.textContent = componentComment;
    //             rootElement.appendChild(commentElement);
    //         }

    //         // 创建端口元素
    //         const portsElement = xmlDoc.createElement('ports');
    //         rootElement.appendChild(portsElement);
    //         // Add port type imports
    //         const portTypeImports = [
    //             'Fw/Cmd/CmdPortAi.xml',
    //             'Fw/Cmd/CmdRegPortAi.xml',
    //             'Fw/Cmd/CmdResponsePortAi.xml',
    //             'Fw/Log/LogPortAi.xml',
    //             'Fw/Log/LogTextPortAi.xml',
    //             'Fw/Time/TimePortAi.xml',
    //             'Fw/Tlm/TlmPortAi.xml',
    //             'Fw/Prm/PrmGetPortAi.xml',
    //             'Fw/Prm/PrmSetPortAi.xml'
    //         ];
    //         // Add import elements to the root element
    //         portTypeImports.forEach(importPath => {
    //             const importElement = xmlDoc.createElement('import_port_type');
    //             importElement.textContent = importPath;
    //             rootElement.appendChild(importElement);
    //         });
    //         // Define basic ports
    //         const basicPorts = [
    //             { name: "CmdDisp", kind: "input", data_type: "Fw::Cmd", max_number: "1", role: "Cmd" },
    //             { name: "CmdReg", kind: "output", data_type: "Fw::CmdReg", max_number: "1", role: "CmdRegistration" },
    //             { name: "CmdStatus", kind: "output", data_type: "Fw::CmdResponse", max_number: "1", role: "CmdResponse" },
    //             { name: "Time", kind: "output", data_type: "Fw::Time", max_number: "1", role: "TimeGet" },
    //             { name: "Log", kind: "output", data_type: "Fw::Log", max_number: "1", role: "LogEvent" },
    //             { name: "LogText", kind: "output", data_type: "Fw::LogText", max_number: "1", role: "LogTextEvent" },
    //             { name: "Tlm", kind: "output", data_type: "Fw::Tlm", max_number: "1", role: "Telemetry" },
    //             { name: "ParamGet", kind: "output", data_type: "Fw::PrmGet", max_number: "1", role: "ParamGet" },
    //             { name: "ParamSet", kind: "output", data_type: "Fw::PrmSet", max_number: "1", role: "ParamSet" }
    //         ];
    //         // Add each basic port to the ports element
    //         basicPorts.forEach(port => {
    //             const portElement = xmlDoc.createElement('port');
    //             portElement.setAttribute('name', port.name);
    //             portElement.setAttribute('kind', port.kind);
    //             portElement.setAttribute('data_type', port.data_type);
    //             portElement.setAttribute('max_number', port.max_number);
    //             portElement.setAttribute('role', port.role);
    //             portsElement.appendChild(portElement);
    //         });
    //         // 获取自定义端口
    //         cell.attributes.ports.items.map(port => {
    //             const { args, comment, full, kind, max_number, name, namespace, priority, role, return: returnValue } = port.properties;
    //             console.log(port);

    //             const importElement = xmlDoc.createElement('import_port_type');
    //             importElement.textContent = `${namespace}_${name}PortAi.xml`;
    //             rootElement.appendChild(importElement);

    //             const portElement = xmlDoc.createElement('port');
    //             portElement.setAttribute('name', name);
    //             portElement.setAttribute('kind', kind.toLowerCase());
    //             portElement.setAttribute('data_type', namespace+ "::" + name);
    //             portElement.setAttribute('priority', priority);
    //             portElement.setAttribute('full', full);
    //             portElement.setAttribute('max_number', max_number);
    //             portElement.setAttribute('role', role);
    //             if (comment !== undefined && comment !== "") {
    //                 const commentElement = xmlDoc.createElement('comment');
    //                 commentElement.textContent = comment;
    //                 portElement.appendChild(commentElement);
    //             }
    //             portsElement.appendChild(portElement);

    //             // Create a separate XML file for each port
    //             if (args && args.length > 0) {
    //                 // Create port XML document
    //                 const portXmlDoc = document.implementation.createDocument(null, null, null);
    //                 const portProcessingInstruction = portXmlDoc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
    //                 portXmlDoc.appendChild(portProcessingInstruction);
                    
    //                 // Create interface root element
    //                 const interfaceElement = portXmlDoc.createElement('interface');
    //                 interfaceElement.setAttribute('name', name);
    //                 interfaceElement.setAttribute('namespace', namespace);
    //                 portXmlDoc.appendChild(interfaceElement);
                    
    //                 // Create args element
    //                 const argsElement = portXmlDoc.createElement('args');
    //                 interfaceElement.appendChild(argsElement);
                    
    //                 // Add each argument
    //                 args.forEach(arg => {
    //                     const argElement = portXmlDoc.createElement('arg');
    //                     argElement.setAttribute('name', arg.name);
    //                     argElement.setAttribute('type', arg.type);
                        
    //                     // Add comment if exists
    //                     if (arg.comment) {
    //                         const commentElement = portXmlDoc.createElement('comment');
    //                         commentElement.textContent = arg.comment;
    //                         argElement.appendChild(commentElement);
    //                     }
                        
    //                     // If the argument is an enum type, add enum definition
    //                     if (arg.type === 'ENUM' && arg.enum) {
    //                         const enumElement = portXmlDoc.createElement('enum');
    //                         enumElement.setAttribute('name', arg.enum.name);
                            
    //                         // Add enum items
    //                         arg.enum.items.forEach(item => {
    //                             const itemElement = portXmlDoc.createElement('item');
    //                             itemElement.setAttribute('name', item.name);
    //                             if (item.value !== undefined) {
    //                                 itemElement.setAttribute('value', item.value);
    //                             }
    //                             if (item.comment) {
    //                                 itemElement.setAttribute('comment', item.comment);
    //                             }
    //                             enumElement.appendChild(itemElement);
    //                         });
                            
    //                         argElement.appendChild(enumElement);
    //                     }
                        
    //                     argsElement.appendChild(argElement);
    //                 });
                    
    //                 // Serialize XML
    //                 const portSerializer = new XMLSerializer();
    //                 const portXmlString = portSerializer.serializeToString(portXmlDoc);
                    
    //                 // Download XML file
    //                 const portBlob = new Blob([portXmlString], { type: "application/xml" });
    //                 const portUrl = URL.createObjectURL(portBlob);
                    
    //                 const portLink = document.createElement("a");
    //                 portLink.href = portUrl;
    //                 portLink.download = `${namespace}_${name}PortAi.xml`;
    //                 document.body.appendChild(portLink);
    //                 portLink.click();
                    
    //                 setTimeout(() => {
    //                     document.body.removeChild(portLink);
    //                     URL.revokeObjectURL(portUrl);
    //                 }, 100);
    //             }
    //         });

    //         // 获取与该组件相连的所有链接
    //         const connectedLinks = graph.getConnectedLinks(cell);
    //         console.log(connectedLinks);

    //         connectedLinks.forEach(link => {
    //             const targetCell = link.getTargetCell();
    //             console.log(targetCell);
    //             console.log(targetCell.getProperties());

    //             // Commands 
    //             if (targetCell.attributes.classType === 'Commands') {
    //                 const { opcode_base, commands } = targetCell.getProperties();
    //                 const commandsElement = xmlDoc.createElement('commands');
    //                 if (opcode_base !== undefined) {
    //                     commandsElement.setAttribute('opcode_base', opcode_base);
    //                 }
    //                 rootElement.appendChild(commandsElement);

    //                 commands.forEach(command => {
    //                     const { mnemonic, opcode, kind, priority, full, args } = command;
    //                     const commandElement = xmlDoc.createElement('command');

    //                     commandElement.setAttribute('mnemonic', mnemonic);
    //                     commandElement.setAttribute('opcode', opcode);
    //                     commandElement.setAttribute('kind', kind.toLowerCase());

    //                     // 如果是异步命令，添加优先级和队列满处理策略
    //                     if (kind === commandKindOptions.ASYNC) {
    //                         commandElement.setAttribute('priority', priority);
    //                         commandElement.setAttribute('full', full);
    //                     }

    //                     commandsElement.appendChild(commandElement);

    //                     // 添加参数
    //                     if (args && args.length > 0) {
    //                         const argsElement = xmlDoc.createElement('args');
    //                         commandElement.appendChild(argsElement);
    //                         args.forEach(arg => {
    //                             const argElement = xmlDoc.createElement('arg');
    //                             argElement.setAttribute('name', arg.name);
    //                             argElement.setAttribute('type', arg.type);
    //                             if (arg.type === "string") {
    //                                 argElement.setAttribute('size', arg.size);
    //                             }
    //                             argsElement.appendChild(argElement);
    //                         });
    //                     }
    //                 });
    //             } else if (targetCell.attributes.classType === 'Telemetry') {
    //                 const { telemetry_base, channels } = targetCell.getProperties();

    //                 if (channels && channels.length > 0) {
    //                     const channelsElement = xmlDoc.createElement('telemetry');
    //                     if (telemetry_base !== undefined) {
    //                         channelsElement.setAttribute('telemetry_base', telemetry_base);
    //                     }
    //                     rootElement.appendChild(channelsElement);

    //                     channels.forEach(channel => {
    //                         const channelElement = xmlDoc.createElement('channel');
    //                         console.log(channel);
    //                         channelElement.setAttribute('id', channel.channel_id);
    //                         channelElement.setAttribute('name', channel.name);
    //                         channelElement.setAttribute('update', channel.update_type.toLowerCase());
    //                         channelElement.setAttribute('data_type', channel.data_type);
    //                         channelElement.setAttribute('abbrev', channel.abbrev);
    //                         if (channel.data_type === 'string') {
    //                             channelElement.setAttribute('size', channel.size);
    //                         }
    //                         if (channel.comment !== undefined && channel.comment !== "") {
    //                             const commentElement = xmlDoc.createElement('comment');
    //                             commentElement.textContent = channel.comment;
    //                             channelElement.appendChild(commentElement);
    //                         }
    //                         channelsElement.appendChild(channelElement);
    //                     });
    //                 }

    //             } else if (targetCell.attributes.classType === 'Parameters') {
    //                 const { parameter_base, opcode_base, parameters } = targetCell.getProperties();
    //                 // console.log(targetCell.getProperties());
    //                 if (parameters && parameters.length > 0) {
    //                     const parametersElement = xmlDoc.createElement('parameters');
    //                     if (opcode_base !== undefined && opcode_base !== "") {
    //                         parametersElement.setAttribute('opcode_base', opcode_base);
    //                     }
    //                     if (parameter_base !== undefined && parameter_base !== "") {
    //                         parametersElement.setAttribute('parameter_base', parameter_base);
    //                     }
    //                     rootElement.appendChild(parametersElement);
    //                     parameters.forEach(parameter => {
    //                         const parameterElement = xmlDoc.createElement('parameter');
    //                         parameterElement.setAttribute('id', parameter.parameter_id);
    //                         parameterElement.setAttribute('name', parameter.name);
    //                         parameterElement.setAttribute('data_type', parameter.data_type);
    //                         parameterElement.setAttribute('default', parameter.default);
    //                         parameterElement.setAttribute('set_opcode', parameter.set_opcode);
    //                         parameterElement.setAttribute('save_opcode', parameter.save_opcode);
    //                         if (parameter.data_type === 'string') {
    //                             parameterElement.setAttribute('size', parameter.size);
    //                         }
    //                         if (parameter.comment !== undefined && parameter.comment !== "") {
    //                             const commentElement = xmlDoc.createElement('comment');
    //                             commentElement.textContent = parameter.comment;
    //                             parameterElement.appendChild(commentElement);
    //                         }
    //                         parametersElement.appendChild(parameterElement);
    //                     });
    //                 }

    //             } else if (targetCell.attributes.classType === 'Events') {
    //                 const { events } = targetCell.getProperties();
    //                 if (events && events.length > 0) {
    //                     const eventsElement = xmlDoc.createElement('events');
    //                     rootElement.appendChild(eventsElement);
    //                     events.forEach(event => {
    //                         const eventElement = xmlDoc.createElement('event');
    //                         eventElement.setAttribute('name', event.name);
    //                         eventElement.setAttribute('id', event.event_id);
    //                         eventElement.setAttribute('severity', event.severity);
    //                         eventElement.setAttribute('format_string', event.format_string);
    //                         eventsElement.appendChild(eventElement);

    //                         if (event.args && event.args.length > 0) {
    //                             const argsElement = xmlDoc.createElement('args');
    //                             eventElement.appendChild(argsElement);
    //                             event.args.forEach(arg => {
    //                                 const argElement = xmlDoc.createElement('arg');
    //                                 argElement.setAttribute('name', arg.name);
    //                                 argElement.setAttribute('type', arg.type);
    //                                 argsElement.appendChild(argElement);
    //                             });
    //                         }
    //                     });
    //                 }
    //             }
    //         });

    //         // 序列化XML
    //         const serializer = new XMLSerializer();
    //         const xmlString = serializer.serializeToString(xmlDoc);

    //         // 下载XML文件
    //         const blob = new Blob([xmlString], { type: "application/xml" });
    //         const url = URL.createObjectURL(blob);

    //         const a = document.createElement("a");
    //         a.href = url;
    //         a.download = `${componentName.replace(/\s+/g, '_')}.xml`;
    //         document.body.appendChild(a);
    //         a.click();

    //         setTimeout(() => {
    //             document.body.removeChild(a);
    //             URL.revokeObjectURL(url);
    //         }, 100);
    //     });
    });
}
