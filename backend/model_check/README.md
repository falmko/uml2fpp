# Converting F´ XML to Spin/Promela for Model Checking

您好！我理解您想将使用uml2fpp工具生成的F´ XML文件转换为可用于Spin模型检验的格式。这需要将F´组件模型转换为Promela语言，以便进行形式化验证。

## 转换方案

我可以为您提供一个Python脚本，用于将F´ XML文件转换为Promela代码：

```python name=xml2promela.py
#!/usr/bin/env python3
"""
XML to Promela Converter for F´ Component XML Files
This tool converts F´ XML component definitions to Promela models for Spin model checking.
"""

import argparse
import xml.etree.ElementTree as ET
import os
import re

def clean_name(name):
    """Clean component/port names to be valid in Promela"""
    return re.sub(r'[^a-zA-Z0-9_]', '_', name)

def generate_port_definitions(root):
    """Extract and generate port type definitions"""
    port_types = {}
    
    # Find all port definitions
    ports = root.findall(".//port")
    for port in ports:
        port_name = port.get("name")
        port_type = port.get("type", "DefaultType")
        port_direction = port.get("direction", "input")
        
        if port_type not in port_types:
            port_types[port_type] = {
                "name": port_type,
                "directions": set()
            }
        port_types[port_type]["directions"].add(port_direction)
    
    # Generate Promela channel types
    promela_types = []
    for type_name, type_info in port_types.items():
        promela_types.append(f"/* Message type for {type_name} */")
        promela_types.append(f"typedef {clean_name(type_name)} {{")
        promela_types.append("    byte msg_id;")
        promela_types.append("    byte data;")
        promela_types.append("}")
        promela_types.append("")
    
    return "\n".join(promela_types)

def generate_component_process(component):
    """Generate Promela process for a component"""
    comp_name = clean_name(component.get("name", "Component"))
    comp_type = clean_name(component.get("type", "GenericComponent"))
    
    ports = component.findall("./port")
    
    promela_proc = []
    promela_proc.append(f"/* Process for component {comp_name} */")
    promela_proc.append(f"proctype {comp_name}(chan in_ch, out_ch) {{")
    promela_proc.append("    byte state = 0;")
    
    # Generate state machine based on component type
    promela_proc.append("    do")
    promela_proc.append("    :: state == 0 ->")
    
    # Handle receiving messages on input ports
    input_ports = [p for p in ports if p.get("direction", "input") == "input"]
    if input_ports:
        for i, port in enumerate(input_ports):
            port_name = clean_name(port.get("name"))
            port_type = clean_name(port.get("type", "DefaultType"))
            
            if i == 0:
                promela_proc.append(f"        if")
            else:
                promela_proc.append(f"        :: else if")
                
            promela_proc.append(f"        :: in_ch?{port_name}(msg_id, data) ->")
            promela_proc.append("            /* Handle received message */")
            promela_proc.append("            atomic {")
            promela_proc.append("                /* Process message */")
            promela_proc.append("                state = 1;")
            promela_proc.append("            }")
        
        promela_proc.append("        fi;")
    
    # Handle sending messages on output ports
    output_ports = [p for p in ports if p.get("direction", "output") == "output"]
    if output_ports:
        promela_proc.append("    :: state == 1 ->")
        for i, port in enumerate(output_ports):
            port_name = clean_name(port.get("name"))
            port_type = clean_name(port.get("type", "DefaultType"))
            
            if i == 0:
                promela_proc.append(f"        if")
            else:
                promela_proc.append(f"        :: else if")
                
            promela_proc.append(f"        :: out_ch!{port_name}(1, 0) ->")
            promela_proc.append("            state = 0;")
        
        promela_proc.append("        fi;")
    
    promela_proc.append("    od;")
    promela_proc.append("}")
    promela_proc.append("")
    
    return "\n".join(promela_proc)

def generate_connection_init(root):
    """Generate initialization code for component connections"""
    components = root.findall(".//component")
    connections = root.findall(".//connection")
    
    promela_init = []
    promela_init.append("init {")
    
    # Declare channels for connections
    for connection in connections:
        conn_name = clean_name(connection.get("name", f"conn_{len(promela_init)}"))
        promela_init.append(f"    chan {conn_name} = [10] of {{byte, byte}};")
    
    # Start component processes
    promela_init.append("")
    promela_init.append("    /* Start component processes */")
    
    for component in components:
        comp_name = clean_name(component.get("name", "comp"))
        promela_init.append(f"    run {comp_name}({comp_name}_in, {comp_name}_out);")
    
    promela_init.append("}")
    
    return "\n".join(promela_init)

def generate_ltl_properties():
    """Generate sample LTL properties for verification"""
    properties = []
    properties.append("/* LTL Properties for verification */")
    properties.append("ltl safety { [](!deadlock) }")
    properties.append("ltl liveness { []<>(state == 0) }")
    properties.append("")
    
    return "\n".join(properties)

def convert_xml_to_promela(xml_file):
    """Convert F´ XML file to Promela model"""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    promela_output = []
    
    # Add header comments
    promela_output.append("/* Promela model generated from F´ XML */")
    promela_output.append(f"/* Source: {os.path.basename(xml_file)} */")
    promela_output.append("/* Generated for Spin model checking */")
    promela_output.append("")
    
    # Add port type definitions
    promela_output.append(generate_port_definitions(root))
    
    # Add component processes
    components = root.findall(".//component")
    for component in components:
        promela_output.append(generate_component_process(component))
    
    # Add initialization and connections
    promela_output.append(generate_connection_init(root))
    
    # Add LTL properties
    promela_output.append(generate_ltl_properties())
    
    return "\n".join(promela_output)

def main():
    parser = argparse.ArgumentParser(description="Convert F´ XML to Promela for Spin model checking")
    parser.add_argument("input", help="Input F´ XML file")
    parser.add_argument("-o", "--output", help="Output Promela file", default=None)
    
    args = parser.parse_args()
    
    if not os.path.isfile(args.input):
        print(f"Error: Input file '{args.input}' not found")
        return 1
    
    output_file = args.output
    if not output_file:
        base_name = os.path.splitext(os.path.basename(args.input))[0]
        output_file = f"{base_name}.pml"
    
    promela_code = convert_xml_to_promela(args.input)
    
    with open(output_file, "w") as f:
        f.write(promela_code)
    
    print(f"Successfully converted {args.input} to {output_file}")
    return 0

if __name__ == "__main__":
    exit(main())
```

## 使用说明

使用上述脚本将F´ XML文件转换为Promela代码：

```bash
# 安装依赖
pip install argparse

# 使用脚本进行转换
python xml2promela.py your_component.xml -o your_model.pml
```

## 如何扩展转换

该脚本提供了一个基本框架，您可能需要根据您的具体需求进行扩展：

````markdown name=README.md
# F´ XML到Promela转换器

这个工具将F´框架的XML组件和部署定义转换为可用于Spin模型检验的Promela代码。

## 功能

- 解析F´ XML文件中的组件和端口定义
- 生成对应的Promela进程和通道
- 创建初始化代码来设置组件间的连接
- 添加基本的LTL属性以进行验证

## 使用方法

```bash
python xml2promela.py input.xml -o output.pml
```

## 如何运行Spin验证

1. 安装Spin模型检验器：http://spinroot.com/
2. 将F´ XML转换为Promela：
   ```
   python xml2promela.py your_component.xml
   ```
3. 运行Spin验证：
   ```
   spin -a your_component.pml
   gcc -o pan pan.c
   ./pan
   ```

## 定制转换

要根据您的特定需求定制转换过程，可以修改以下函数：

- `generate_port_definitions()`: 端口类型定义
- `generate_component_process()`: 组件进程行为
- `generate_connection_init()`: 组件连接初始化
- `generate_ltl_properties()`: 验证属性

## 高级用法

### 添加特定组件行为

对于特定类型的组件，您可能需要添加更详细的状态机描述。例如：

```python
if comp_type == "CommandDispatcher":
    # 添加命令调度器特有的行为
    promela_proc.append("    /* Command dispatcher specific behavior */")
    promela_proc.append("    :: state == 2 -> /* Command processing */ state = 0;")
```

### 添加自定义验证属性

您可以根据系统需求添加特定的LTL属性：

```python
def generate_ltl_properties():
    properties = []
    properties.append("/* Safety: 系统不会进入死锁状态 */")
    properties.append("ltl safety { [](!deadlock) }")
    
    properties.append("/* 活性: 组件最终会处理所有消息 */") 
    properties.append("ltl liveness { []<>(message_queue_empty) }")
    
    properties.append("/* 特定属性: 命令响应总是在命令之后 */")
    properties.append("ltl cmd_resp { [](cmd_sent -> <>cmd_response) }")
    
    return "\n".join(properties)
```
````

## Promela模型与验证的最佳实践

```python name=fprime_spin_helper.py
#!/usr/bin/env python3
"""
F´ to Spin Model Checking Helper Functions
This module provides utility functions for working with Promela models derived from F´ components.
"""

import os
import subprocess
import argparse
import xml.etree.ElementTree as ET

def analyze_component_interaction(xml_file):
    """Analyze component interaction patterns to generate appropriate Promela models"""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    components = {}
    connections = []
    
    # Extract components
    for comp in root.findall(".//component"):
        comp_name = comp.get("name")
        comp_type = comp.get("type")
        components[comp_name] = {
            "type": comp_type,
            "ports": []
        }
        
        # Extract ports
        for port in comp.findall("./port"):
            port_name = port.get("name")
            port_type = port.get("type", "DefaultType")
            direction = port.get("direction", "input")
            components[comp_name]["ports"].append({
                "name": port_name,
                "type": port_type,
                "direction": direction
            })
    
    # Extract connections
    for conn in root.findall(".//connection"):
        src_comp = conn.get("source").split(".")[0] if "." in conn.get("source", "") else ""
        src_port = conn.get("source").split(".")[1] if "." in conn.get("source", "") else ""
        dst_comp = conn.get("destination").split(".")[0] if "." in conn.get("destination", "") else ""
        dst_port = conn.get("destination").split(".")[1] if "." in conn.get("destination", "") else ""
        
        connections.append({
            "source": {"component": src_comp, "port": src_port},
            "destination": {"component": dst_comp, "port": dst_port}
        })
    
    return components, connections

def run_spin_verification(pml_file):
    """Run Spin verification on the generated Promela model"""
    # Generate verifier
    subprocess.run(["spin", "-a", pml_file], check=True)
    
    # Compile with optimization
    subprocess.run(["gcc", "-O2", "-o", "pan", "pan.c"], check=True)
    
    # Run verification with progress reporting
    result = subprocess.run(["./pan", "-a", "-m10000"], 
                          capture_output=True, text=True)
    
    # Parse results
    if "errors: " in result.stdout:
        errors = result.stdout.split("errors: ")[1].split()[0]
        print(f"Verification completed with {errors} errors")
        
        if errors != "0":
            print("Running guided simulation to show error trace:")
            subprocess.run(["spin", "-t", "-p", pml_file], check=True)
    
    return result.stdout, result.stderr

def generate_property_patterns(components, connections):
    """Generate common verification property patterns based on the component model"""
    properties = []
    
    # Generate safety properties
    properties.append("/* Safety properties */")
    properties.append("ltl no_deadlock { []<>enabled(1) }")
    
    # Generate component-specific properties
    for comp_name, comp_info in components.items():
        # For command components, check that commands are always acknowledged
        if "Command" in comp_info["type"]:
            properties.append(f"/* {comp_name} command always acknowledged */")
            properties.append(f"ltl cmd_ack_{comp_name} {{ []({comp_name}_cmd_sent -> <>{comp_name}_cmd_ack) }}")
        
        # For telemetry components, check data is eventually processed
        if "Telemetry" in comp_info["type"]:
            properties.append(f"/* {comp_name} telemetry eventually processed */")
            properties.append(f"ltl telemetry_{comp_name} {{ []({comp_name}_data_received -> <>{comp_name}_data_processed) }}")
    
    return "\n".join(properties)

def main():
    parser = argparse.ArgumentParser(description="F´ to Spin Model Checking Helper")
    parser.add_argument("input", help="Input F´ XML file")
    parser.add_argument("--analyze", action="store_true", help="Analyze component interaction only")
    parser.add_argument("--verify", help="Run verification on Promela file", metavar="PML_FILE")
    
    args = parser.parse_args()
    
    if args.analyze:
        components, connections = analyze_component_interaction(args.input)
        print("Component Analysis:")
        for comp_name, comp_info in components.items():
            print(f"- {comp_name} ({comp_info['type']})")
            for port in comp_info['ports']:
                print(f"  * {port['name']} ({port['direction']}): {port['type']}")
        
        print("\nConnections:")
        for conn in connections:
            print(f"- {conn['source']['component']}.{conn['source']['port']} -> {conn['destination']['component']}.{conn['destination']['port']}")
            
        # Generate property patterns
        print("\nSuggested Verification Properties:")
        properties = generate_property_patterns(components, connections)
        print(properties)
    
    if args.verify:
        print(f"Running Spin verification on {args.verify}")
        stdout, stderr = run_spin_verification(args.verify)
        if stderr:
            print("Errors encountered during verification:")
            print(stderr)
    
    return 0

if __name__ == "__main__":
    exit(main())
```

## 验证方法

在进行模型检验时，您应关注以下几点：

1. **安全属性**：确保系统不会进入死锁状态，不会出现竞争条件
2. **活性属性**：确保系统中的消息最终会被处理
3. **特定任务属性**：根据系统要求，验证特定的功能正确性

例如，您可以验证命令组件的以下属性：

- 每个命令最终会得到响应
- 命令处理不会死锁
- 命令队列不会溢出

## 扩展建议

1. 增强xml2promela.py以支持更复杂的F´组件行为和状态
2. 添加更多特定于F´框架的验证属性
3. 开发可视化工具以分析Spin检验结果

希望这些工具能帮助您将F´框架的UML图模型转换为可验证的Promela代码！如果您需要更多针对特定F´组件类型的细节定制，请告诉我具体需求。