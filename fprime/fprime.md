## F' 框架的完整介绍

### F' 的起源

F' 是一个专为嵌入式系统设计的框架，旨在提供一套可靠的组件和基础设施，以支持小型嵌入式任务（如 CubeSats、small-sats 和 deployables）的开发。该框架最初由美国宇航局（NASA）喷气推进实验室（JPL）创建，用于加速飞行软件的开发，同时减少成本。尽管 F' 诞生于航天领域，但它的应用范围并不局限于此，适用于任何需要高效处理资源受限环境中的嵌入式系统的项目。

### 设计目标

F' 的设计着眼于以下关键目标：

- **促进可重用性**：将项目的可重用部分集成到框架中。
- **简化组件管理**：使得共享系统组件的分离与重新组装更加简便。
- **便于测试**：通过隔离组件来简化测试过程。
- **适应性强**：能够轻松地调整到新环境中，并移植到不同的架构和平台。
- **用户友好**：确保易于使用和扩展，以便配置满足新的应用场景。
- **优化性能**：在资源有限的条件下也能表现出色。

### 空间系统的简要概述

F' 最初是为模拟空间嵌入式系统而设计的，特别是那些执行特定科学任务的小型太空飞行器。这些系统通常包括完整的控制和操作机制，以确保航天器能顺利完成其预定任务。F' 作为此类系统的核心软件，它将整个项目分解成离散的组件，每个组件负责系统的一部分功能。例如，无线电组件可以管理通信硬件，而各个组件则通过端口相互连接，形成所谓的“拓扑”，即整个系统的网络图。

### F' 构建的基本元素

F' 项目主要由三个核心元素构成：组件（Components）、端口（Ports）和拓扑（Topologies）。虽然框架并不强制要求使用命令、事件和通道来控制系统，但这确实是常见的实践方式。理解这些建构块对于掌握 F' 的强大功能至关重要。

#### 组件

组件是实现系统模块化的基础单元。例如，Command Dispatcher 是一个负责接收并调度来自地面站指令的组件。它会发出事件来记录调度动作的发生以及完成情况，并且拥有用于统计已调度命令数量的状态通道。

#### 端口

端口定义了组件之间通信的方式，使不同组件能够交互并协同工作。

#### 拓扑

拓扑描述了所有组件间的连接关系，构成了整个系统的逻辑结构。

### 线程、多核架构和 F'

F' 主要是为运行操作系统并在单一内核上执行的平台设计的，但也可以部署在裸机或多个内核上。在这种情况下，必须特别注意执行上下文的设计。

### 结论

F' 框架以开源的形式发布，并已成功移植到多种平台，包括 Linux、macOS、Windows（WSL）、VxWorks、ARINC 653、无操作系统环境、PPC、Leon3、x86、ARM（A15/A7）和 MSP430。此外，F' 还包含了一套成熟的 C&DH 组件，这些组件经过了代码审查、静态分析和全面覆盖的单元测试，确保了其在飞行任务中的可靠性。


## 项目和部署

在F'框架中，工作自然地被组织成**项目**和**部署**。一个**项目**是使用F'来解决特定嵌入式系统问题的集合，它可以包含一个或多个**部署**。每个**部署**通常与代码的不同版本关联，并用于驱动单个设备或节点。

### 拓扑

拓扑是一组互连组件的具体实例，它描绘了某个部署的设计蓝图。本指南将详细解释项目、部署及其间的区别。

### 项目

项目可以包含一个或多个相关的部署。每个部署代表了F'软件的一个具体实例。项目用来组织紧密联系的F'代码，至少定义了一个部署，但也可以定义多个。组件设计和源代码可以在这些相关部署间共享。

- **多平台支持**：如果一个项目涉及多个航天器、电子平台、CPU或系统，F'能为这类复杂系统中的各个节点提供支持。
- **测试部署**：项目还可以拥有专门用于测试的部署，如模拟部署或其他允许特定测试环境的配置。

例如，Mars Helicopter项目（图1）就展示了如何用F'实现飞行软件。这个项目包含了两个部署：一个针对直升机本身，另一个针对基站。

![Mars Helicopter 飞行软件组件](https://nasa.github.io/fprime/UsersGuide/media/proj_dep1.png)

*图 1. Mars Helicopter 飞行软件组件*

### 部署

部署总是与内部版本关联；每次构建代码时都会创建一个新的部署。尽管部署可以在项目内共享组件和端口，但它们的拓扑结构和构建通常是独一无二的。

部署可以定义仅在其内部使用的自定义组件和端口，同时也能继承其他组件，比如由F'框架提供的组件。每个部署都有一组独特的组件和端口集，并且具有单一的拓扑结构，该结构描述了部署的行为。

部署还包含了必要的构建系统工件，用于将F'框架、组件、端口以及拓扑构建成可在嵌入式硬件上运行的可执行文件，甚至可以直接在用户的计算机上执行。

以Mars Helicopter为例，由于其非齐次系统的特性，需要为每个系统单独构建唯一的可执行文件来进行控制。

### 拓扑

拓扑定义了一组特定的互连组件，用于表示一个系统的设计。它不仅包含了各组件的实例化信息，还列出了组件间端口的连接方式。

### 结论

综上所述，项目是解决特定问题的相关部署的容器，而部署则是拓扑和构建配置的容器，旨在为项目中所用的具体设备创建可执行文件。通过这种结构，F'能够有效地管理和组织复杂的嵌入式系统开发工作。




## 核心结构：端口、组件和拓扑

F' 系统由端口、组件和拓扑三个主要部分构成，它们是构建模块化嵌入式系统的基石。本文档将详细介绍这些元素，确保读者理解如何利用 F' 实现高效且灵活的系统设计。

### 端口：F' 通信

**概述**

在 F' 中，端口是用户首先要了解的概念之一。每个 Component 的端口集定义了它与外界交互的方式，即它的外部接口。因此，正确理解和设计这些端口对于系统的成功至关重要。

**特性**

- **互连点**：端口作为组件之间的连接点，封装了类型化的接口。
- **数据传输**：端口支持参数传递，允许数据在组件之间流动，某些情况下还能返回数据。
- **同步/异步**：端口可以被配置为同步或异步模式，影响调用行为。
- **方向性**：端口可以表示输入或输出，这取决于组件间的调用方向而非实际的数据流。
- **受保护端口**：这些端口通过互斥锁限制一次只能有一个调用，以保证线程安全。

![图 1.端口连接](https://nasa.github.io/fprime/UsersGuide/media/core1.png)
*图 1.端口连接*

**端口实例化**

端口的设计与其实例化是分开的。设计时指定通用属性，而实例化则具体到组件中使用的端口种类。

**快速浏览组件用法中定义的端口类型**

| 端口类型 | 方向 | 同步/异步 | 守卫 | 可能返回数据 |
|---------|------|-----------|------|--------------|
| 输出    | 外   |           |      |              |
| sync_input | 内 | 同步     | 否   | 是           |
| async_input | 内 | 异步     | 否   | 否           |
| guarded_input | 内 | 同步     | 是   | 是           |

注意：端口的类型（data_type）由其设计和使用情况决定。

**Port Instance Kinds**
![图 2.组件上使用的端口类型](https://nasa.github.io/fprime/UsersGuide/media/core2.png)
*图 2.组件上使用的端口类型*

**端口调用序列化**

端口上的序列化功能将参数转换成数据缓冲区，便于跨组件传输。框架支持原始类型和自定义类型的序列化，同时提供了对序列化端口的支持，使得不同类型的端口能够互相连接。

![图 3.序列化端口](https://nasa.github.io/fprime/UsersGuide/media/core3.png)
*图 3.序列化端口*

### 组件：F' 模块

F' 架构的核心是将系统分解为多个称为“组件”的模块，每个组件负责处理特定的任务。组件通过端口进行交互，确保系统的模块性和可维护性。

**组件架构**
![图 10.F′ 组件架构模式示例](https://nasa.github.io/fprime/UsersGuide/media/core10.png)
*图 10.F′ 组件架构模式示例*

**组件类型**

- **被动组件**：无独立线程，不支持异步操作。
- **主动组件**：具有自己的执行线程和队列。
- **周期组件**：有队列但无独立线程，需至少实现一个同步端口来处理消息。

**组件实施划分**
![图 12.组件类层次结构示例](https://nasa.github.io/fprime/UsersGuide/media/core12.png)
*图 12.组件类层次结构示例*

### 拓扑：F' 应用程序

组件通过端口相互连接形成系统运行时的拓扑结构。这种结构允许组件在没有代码依赖的情况下交换信息，使得系统更加灵活和易于维护。

![图 13.拓扑示例](https://nasa.github.io/fprime/UsersGuide/media/core13.png)
*图 13.拓扑示例*

### 结论

F' 系统将各个离散的组件组合起来，通过端口调用来实现组件间的互动。这种设计使得组件可以在不影响其他部分的情况下被替换或更新，从而提高了系统的适应性和扩展性。


## 数据结构：命令、事件、通道和参数

在航天器软件中，控制主要通过命令实现，而监控则依赖于一组事件和遥测通道。F' 框架直接支持这些关键数据结构，并提供了内置的自动编码器支持。此外，F' 的 Svc 组件负责处理这些类型，使得命令、事件和遥测通道的定义与控制变得简单。

**注意：** 事件有时称为 EVR（Event and Variable Records），遥测通道有时称为 EHA（Engineering Health and Analysis）。

本指南将详细介绍以下几种类型：

1. **命令**
2. **命令调度**
3. **命令排序**
4. **事件**
5. **事件日志记录**
6. **遥测通道**
7. **遥测数据库**
8. **参数**
9. **关于序列化端口的说明**

---

### 命令

每个组件定义了一组用于操作的命令。这些命令专为用户与组件交互设计，不同于用于组件间通信的端口。命令是通过一系列属性来定义的，允许用户向 F' 系统发送指令，这些指令再由 `Svc::CmdDispatcher` 分发给相应的处理组件以执行特定行为。

命令属性包括：

- **Opcode**: 唯一标识命令的数值。
- **Mnemonic**: 唯一表示命令的文本值。
- **Arguments**: 提供给命令处理程序的一系列原始和 F' 数据类型。
- **Synchronization "kind"**: 控制命令在哪个上下文中运行（同步、异步或受保护）。

组件基类中的代码调用函数来触发用户定义的命令处理程序。这涉及到命令注册、命令调度和命令响应端口的连接。

### 命令调度

当定义了组件的命令后，autocoder 自动添加用于注册和接收命令的端口，并报告执行状态。命令调度程序管理命令的接收和分发，确保它们被正确地路由到处理组件。

![图 4.命令调度程序](https://nasa.github.io/fprime/UsersGuide/media/data_model1.png)

*图 4.命令调度程序*

### 命令排序

为了按顺序执行命令，框架提供了一个名为 `Svc::CmdSequencer` 的工具。它读取预定义的命令序列文件，并依次将命令发送给命令调度程序，等待每个命令的响应。

![图 5.命令序列](https://nasa.github.io/fprime/UsersGuide/media/data_model2.png)

*图 5.命令序列*

### 事件

事件是对系统活动的日志记录，类似于程序执行日志，有助于跟踪系统的运行状况。事件通常用于捕获组件的操作，并且都应被捕获以供地面站分析。

事件属性包括：

- **ID**: 唯一数字 ID。
- **Name**: 文本标识符。
- **Severity**: 事件严重性的标识。
- **Parameters**: 与事件相关的变量数据。
- **Format String**: 用于生成事件文本表示的格式字符串。

### 事件日志记录

事件首先获取时间戳，然后被发送至 `Svc::ActiveLogger` 组件进行处理和传输。

![图 6.事件日志](https://nasa.github.io/fprime/UsersGuide/media/data_model3.png)

*图 6.事件日志*

### 遥测通道

遥测通道代表系统状态的当前读数，可以设定频率采样并发送到地面。遥测通道具有唯一 ID、时间戳和值三元组。

### 遥测数据库

遥测数据库作为遥测值的双缓冲存储，确保组件可以随时更新通道值，并以固定速率发送到地面。

![图 7.遥测数据库](https://nasa.github.io/fprime/UsersGuide/media/data_model4.png)

*图 7.遥测数据库*

### 参数

参数用于在嵌入式系统中存储非易失性状态。F' 提供了代码生成功能来管理和持久化这些参数。

### 参数管理器

参数管理器从文件系统加载参数，并在初始化期间设置组件参数。它可以保存参数更新到文件系统中。

![图 8.参数管理器](https://nasa.github.io/fprime/UsersGuide/media/data_model5.png)

*图 8.参数管理器*

### 关于序列化端口的说明

`Svc` 组件使用序列化端口来通用处理不同类型的端口数据，支持上行链路和下行链路通信。




## 推荐的 F' 开发流程

### 高级设计

开发过程的第一步是为项目建立高级设计。这涉及指定系统级需求和代表关键系统功能的框图。完成后，项目应将此功能分解为代表系统的离散功能单元。此外，还应定义这些单元之间的接口。功能单元是 Components，接口通过该接口进一步细分为离散的调用或操作。这些是 F' 端口。组件和端口系统的完整设计是 Topology。请参见：端口组件和拓扑。

接下来，项目应该审查 F' 框架提供的组件，看看哪些功能可以免费继承。这通常包括基本的命令和数据处理组件、Os 层、驱动程序和其他 Svc 组件。在可能的情况下，这些组件应按原样使用，以支持项目，以最大程度地减少额外的工作，但如果这些组件不符合项目要求，则可以克隆和拥有这些组件。

现在，该项目有一个列表，其中列出了它们必须提供哪些组件，以及它们将继承哪些组件。

### 设置部署

大多数项目的下一步是准备开发。这意味着要获得足够的部署设置，以便可以为开发人员分配组件和端口，以便在工作部署中实现和测试。

创建部署有两个选项：

- **树内部署**：您可以在 F' git 存储库中创建部署。这很方便，并且需要最少的设置，但是如果项目想要利用将来的错误修复和功能，将代码放在 F' 源代码树中可能会使将来更新 F' 变得更加困难。要创建树内部署，可以复制 Ref 应用程序并将其用作起点。
  
- **独立部署**：您可以创建一个由自身设置并指向 F' 安装的部署。这需要更多的前期设置工作，但提供了将任务代码与 F' 框架代码分离的好处。

独立存储库的 git 存储库的布局可能如下所示：

```
mission
├── mission_deployment_1
├── fprime (git submodule to fprime repository)
├── ...
└── library (git submodule to an external library)
```

创建项目布局后，还可以通过复制 Ref 应用程序来创建外部部署。

复制 Ref 应用程序后，树内部署和独立部署都需要在部署的根目录中创建和修改 `settings.ini` 文件，以设置部署工具链、库位置，对于独立部署，还需要设置 F' 框架的位置。

有关配置 `settings.ini` 文件的详细信息，请参阅用户指南页面。

### 开发端口和组件

接下来，通常会为每个开发人员分配一组要开发的组件。此开发从定义为组件使用的端口开始，然后是组件本身。以下各节将介绍此开发。

#### 设计和需求

使用高级要求，开发人员应定义单个组件的要求。这些要求应定义组件的行为，以及与其他组件的接口。

#### 创建端口

定义组件之间的接口后，应创建端口以实现这些接口。这可以手动完成，也可以使用 `fprime-util new --port`.

建议将 ports 保存在自己的目录中，与组件分开。

要创建新端口：

- 如有必要，请创建新的端口目录
- 创建一个新的端口 *Ai.xml 文件，可能通过从现有端口复制。
- 将新的端口 xml 文件添加到 CMakeLists.txt 文件中的 `SOURCE_FILES` 中
- 如有必要，请使用 `add_fprime_subdirectory` 将端口目录添加到部署的 cmake 文件中.

或者，您可以使用 `fprime-tools` 包中的 `fprime-util new --port`。这将引导用户完成一些关于他们想要创建的端口的提示。然后，将自动完成以下操作：

- 如果端口的指定目录不存在，则会创建该
- 将生成 *Ai.xml 文件，其中填充了信息和参数
- 该端口将添加到 CMakeLists.txt 的源文件中。如果没有 CMakeLists.txt 文件，将自动生成并填写一个
- 如有必要，端口目录将添加到 Deployment 的 cmake 文件中，并带有 `add_fprime_subdirectory`

#### 创建组件定义

创建组件的第一步是创建组件 XML 定义，该定义定义它实现的接口、支持的命令、提供的遥测以及生成的事件。这可以手动完成，也可以使用 `fprime-util new --component` 完成.

要手动创建新的组件定义：

- 创建新的组件目录
- 创建一个新的零部件 *Ai.xml 文件，可能通过从现有零部件复制来实现。
- （可选）为 GDS 命令创建命令 XML 文件，并将其包含在组件 XML 文件中。
- （可选）创建一个事件 XML 文件并将其包含在组件 XML 文件中。
- 可选，为 telemetry 通道创建 telemetry XML 并将其包含在组件 XML 文件中。
- 创建组件 CMakeLists.txt 测试文件，并将组件 XML 文件添加到文件中 `SOURCE_FILES` 变量。
- 使用 `add_fprime_subdirectory` 将组件目录添加到部署的 cmake 文件中.

或者，您可以使用 `fprime-tools` 包中的 `fprime-util new --component`。这将引导用户完成一些关于他们正在创建的组件的提示。然后，将自动完成以下操作：

- 将创建一个新的组件目录
- 将生成 *Ai.xml 文件并填写用户提供的所有信息
- 命令、遥测、事件和参数将根据用户通过提示选择的内容添加到 XML 文件中
- 命令、遥测、事件和参数所需的端口将自动添加到 *Ai.xml 文件中，具体取决于用户选择包含的元素
- 将生成一个组件 CMakeLists.txt 文件，并将组件 XML 添加到源文件中。
- 组件目录将添加到 deployments cmake 文件中，其中包含 `add_fprime-subdirectory`
- 用户可以选择生成实现 *.cpp 和 *.hpp 文件
- 用户可以选择生成一个单元测试目录，其中包含必要的单元测试文件。
- 生成一个 SDD 文件，其中包含有关端口、命令、事件、遥测、参数和创建时间已填写

![alt text](image.png)

`fprime-util new --component` 默认使用内置的 cookiecutter 模板，但用户可以使用 `settings.ini` 文件的 `component_cookiecutter` 字段替换自己的组件模板。要了解更多信息，请参阅创建和使用 Cookiecutter 模板.

#### 组件实现

接下来，开发人员通常运行 `fprime-util impl` 来生成手动编码的 .cpp 和 .hpp 文件的 -template 文件。但是，如果您的组件是使用 `fprime-util new --component` 创建的，并且您在询问如何生成实施文件时选择了 yes，则此操作会自动完成。这些可以用作实现的基础，所有存根都已就位，供开发人员实现设计。然后，开发人员使用支持 design 功能的 implementation 填充这些文件和存根。

然后，可以在开发过程中构建该组件以查找错误。端口是完全自动生成的，不需要实现。

#### 组件单元测试

除了实现之外，还可以对单元测试进行模板化和实施，以根据组件的要求进行测试。应该经常开发和运行这些组件，以确保实现的组件正常工作。

注意：如果使用 `fprime-util new --cookiecutter` 创建组件，并且用户选择了生成单元测试，则应跳过步骤 1-3，因为这些步骤是自动完成的。

要向组件添加单元测试，请执行以下操作：

- 在组件中创建一个 test 目录（通常称为 test).
- 运行 `fprime-util impl --ut` 生成单元测试代码框架
- 将单元测试源添加到 `UT_SOURCE_FILES` 并在组件 CMakeLists.txt 中使用 `register_fprime_ut()` 注册单元测试.
- 在组件目录下执行 `fprime-util check` 进行单元测试。

### 组装拓扑

组件完成后，将它们添加到拓扑中会很有帮助。随着更多组件的完成，拓扑会随着时间的推移而慢慢建立起来。这可以在项目的早期启用集成测试。应在此阶段构建完整部署，以确保没有错误。

要将组件添加到拓扑中：

- 在拓扑 *Ai.xml 文件中
    - 导入组件 *Ai.xml XML 文件。
    - 根据需要多次实例化组件。
    - 将组件输出端口与相应的输入端口连接，反之亦然。
- 在拓扑 Components.hpp 文件中，声明与拓扑 XML 文件同名的组件。
- 在拓扑 Topology.cpp 文件中：
    - 实例化组件。
    - 调用组件的 init 函数。
    - 如果需要其他设置，请调用用户定义的设置函数。
    - 如果使用命令，请注册组件的命令。
    - 如果使用运行状况检查，请将组件添加到 ping 条目中。
    - 如果使用活动组件，请使用 start 函数启动组件，并在退出时调用 exit。
  
![alt text](image-1.png)

### 集成测试

随着拓扑的整合，为整个部署的子系统编写系统级测试会很有帮助。这可确保作为一个系统满足顶级要求。

F' 提供了一个 Python API，可用于编写支持发送命令、检查事件和获取遥测通道读数的集成测试用例。要开始编写集成测试，请查看 GDS 集成测试指南.

---

**结论**

本指南概述了大多数 F' 开发人员从项目开始到完成的工作流程。这些工作流程可以应用于任何 F' 项目，并有望提供最流畅的开发体验。

## F' XML规范
F' XML 规范

注意：有关构建拓扑的动手实践演练，请参阅：教程。这是一个高级规范，动手教程可能更适合新用户。

可序列化类型、数组、端口和组件在 XML 文件中定义。这些文件由代码生成器解析，并创建包含 C++ 类声明的文件。本节将介绍 XML 文件的语法。

本指南介绍了以下各项的 XML 格式：
- 可序列化
- 端口
- 组件
- 拓扑

### 序列化
可序列化对象是在架构中的组件之间传递的类型，用于地面数据服务，例如命令、遥测、事件和参数（请参阅第 6.6.3 节中的组件描述以了解这些内容）。

可序列化类型是一种复杂类型或基本类型，可以转换为包含该类型实例的值的数据缓冲区。此数据缓冲区可以以通用方式在系统周围传递（并传递到地面软件），并根据需要重构为原始类型。

体系结构中自动支持基本的 C/C++ 类型（如 int 和 float），但也允许用户定义可序列化的任意复杂类型。这是通过以下两种方式之一完成的：手动编码类或允许代码生成器生成类。然后，这些类型可以在 ports 和 components 的 XML 规范中使用。

### XML 指定的可序列化
在大多数情况下，复杂类型可表示为简单类型的集合。这类似于具有数据成员的 C 结构。用于序列化和反序列化结构的代码非常简单，因此提供了一个代码生成器，它将为可序列化结构创建类。

用户在 XML 中指定成员，并生成 C++ 类。成员的类型可以是基本类型或其他可序列化类型，可以是 XML 或手动编码。

为了使生成系统检测到文件包含可序列化类型的 XML，该文件必须遵循命名约定 <SomeName>SerializableAi.xml。这方面的一个示例可以在 Autocoders/templates/ExampleSerializableAi.xml 中找到。

表 16 描述了用于 serializable 的 XML 标记和属性。

**表 16. 可序列化 XML 规范**
| Tag | Attribute | Description |
|-----|-----------|-------------|
| serializable |  | The outermost tag that indicates a serializable is being defined. |
| serializable | namespace | The C++ namespace for the serializable class (optional). |
| serializable | name | The class name for the serializable. |
| serializable | typeid | An integer uniquely identifying the type. Optional; generated from hash otherwise. Should be unique across the application. |
| comment |  | Used for a comment describing the type. Is placed as a Doxygen - compatible tag in the class declaration. |
| members |  | Starts the region of the declaration where type members are specified. |
| member |  | Defines a member of the type. |
| member | name | Defines the member name. |
| member | type | The type of the member. Should be a built - in type, ENUM, string, an XML - specified type, or a user - written serializable type. |
| member | size | Required when type is string; otherwise not allowed. Specifies the string size. |
| member | array_size | Specifies that the member is an array of the type with the specified size. |
| member | format | Specifies a format specifier when displaying the member. |
| default |  | Specifies the default value of the member (optional). |
| enum |  | Specifies an enumeration when the member type = ENUM. |
| enum | name | Enumeration type name. |
| item |  | Specifies a member of the enumeration. |
| item | name | Specifies the name of the enumeration member. |
| item | value | Assigns a value to the enumeration member. Member values in the enumeration follow C enumeration rules if not specified. |
| item | comment | A comment about the member. Becomes a Doxygen tag. |
| import_serializable_type |  | Imports an XML definition of another serializable type for use in the definition. |
| import_enum_type |  | Imports an XML definition of an enumeration type. |
| import_array_type |  | Imports an XML definition of an array type. |
| include_header |  | Includes a C/C++ user - written header for member types. |

### 约束 - 接地接口
用于定义地面系统接口的可序列化对象必须在 XML 文件中完全指定。可序列化对象的成员不能是手动编码的类型，因为地面系统会分析 XML 以确定用于显示和存档数据的类型。（有关组件接地接口规格，请参阅第 6.6.3 节）。

### XML 指定的枚举
#### 赋予动机
如上一节所述，在指定 Serializable 类型的成员的类型时，可以定义枚举。例如，您可以创建包含此规范的文件 SwitchSerializableAi.xml：
```xml
<serializable name="Switch">
  <members>
    <member name="state" type="ENUM">
      <enum name="SwitchState">
        <item name="OFF" value="0"/>
        <item name="ON" value="1"/>
      </enum>
      <default>OFF</default>
    </member>
  </members>
</serializable>
```
此文件定义具有一个成员 state 的 Serializable 类型 Switch。它的类型是 SwitchState，它是一个枚举常量 OFF 和 ON。使用默认子元素时，默认值将为 OFF。

或者，可以将枚举 E 指定为单独的 XML 类型。然后，您可以执行以下操作：
- 生成 E 的 C++ 表示形式，您可以将其包含在 C++ 文件中并单独使用。
- 在 Serializable XML types、Array XML types、port arguments、telemetry channels 和 event arguments 中使用 E 的 XML 表示形式。

例如，您可以创建一个文件 SwitchStateEnumAi.xml，该文件指定一个 XML 枚举类型 SwitchState，其中枚举常量为 OFF 和 ON，并默认设置为 OFF，如下所示：
```xml
<enum name="SwitchState" default="OFF">
  <item name="OFF" value="0"/>
  <item name="ON" value="1"/>
</enum>
```
通过在此文件上运行代码生成器，您可以生成 C++ 文件 SwitchStateEnumAc.hpp 和 SwitchStateEnumAc.cpp，用于定义该类型的 C++ 表示形式。在 C++ 代码中包含 SwitchStateEnumAc.hpp 的任何位置，都可以使用枚举常量 SwitchState::OFF 和 SwitchState::ON。如果将 SwitchStateEnumAi.xml 导入到另一个 XML 定义中，则可以在此处使用 SwitchState 类型。

要在另一个 XML 定义 D 中使用 XML 枚举类型 E，请将定义 E 的文件的名称括在 XML 标记 import_enum_type 中。例如，您可以修改上面显示的 Switch Serializable 定义。您可以使用 SwitchState XML 枚举类型，而不是将 SwitchState 定义为内联枚举，如下所示：
```xml
<serializable name="Switch">
  <import_enum_type>SwitchStateEnumAi.xml</import_enum_type>
  <members>
    <member name="state" type="SwitchState"/>
  </members>
</serializable>
```
请注意，修订后的版本：
1. 从文件 SwitchStateEnumAi.xml 中导入枚举类型定义。
2. 使用命名类型 SwitchState 作为成员 state 的类型。

再举一个例子，如果将文件 SwitchStateEnumAi.xml 导入到组件 C 的定义中，则可以在 C 的遥测字典中使用 SwitchState 类型。当 SwitchState 类型的值作为遥测数据发出时，GDS 会以符号方式将其显示为 OFF 或 ON。

#### 规范
- **文件名**：必须在名为 EEnumAi.xml 的文件中定义 XML 枚举类型 E。例如，必须在名为 SwitchStateEnumAi.xml 的文件中定义 XML 枚举类型 SwitchState。
- **顶层结构**：XML 枚举类型是名为 enum 的 XML 节点，其属性为 enum_attributes 和 children enum_children。
```xml
<enum enum_attributes > enum_children </enum>
```
- **Enum attributes**：enum_attributes 由以下内容组成：
  - 一个属性 name，提供枚举类型的名称。
  - 一个可选的属性 namespace，提供枚举类型的封闭命名空间。命名空间由一个或多个标识符组成，这些标识符以::分隔。
  - 一个可选属性 default，给出枚举的默认值。此值必须与枚举中某个项定义的名称属性匹配（请参阅下文）。
  - 一个可选属性 serialize_type，在序列化时提供枚举的数值类型。

如果缺少属性 namespace，则将类型放置在全局命名空间中。

如果缺少属性 default，则枚举的值将设置为 0。

如果缺少属性 serialize_type，则序列化类型将设置为 FwEnumStoreType。

**例子**：
- 下面是全局命名空间中的 XML 枚举 E：
```xml
<enum name="E"> ...</enum>
```
- 这是命名空间 A::B 中的 XML 枚举 E:
```xml
<enum name="E" namespace="A::B"> ...</enum>
```
- 以下是全局命名空间中具有默认值 Item2 的 XML 枚举 E（假定 Item2 是枚举中某个项定义的名称属性）：
```xml
<enum name="E" default="Item2"> ...</enum>
```
- 下面是全局命名空间中序列化类型 U64 的 XML 枚举 E：
```xml
<enum name="E" serialize_type="U64"> ...</enum>
```
- **Enum children**：enum_children 由以下内容组成，顺序不限：
  - 包含注释文本的可选节点 comment。
```xml
<comment> comment_text </comment>
```
注释文本将成为生成的 C++ 代码中的注释。它附加到定义枚举的 C++ 类。
  - item_definition 的一个或多个实例，如下所述。
- **项定义**：item_definition 定义枚举常量。它是一个名为 item 的 XML 节点，具有以下属性：
  - 一个属性 name，提供枚举常量的名称。
  - 一个可选的属性 value，用于为枚举常量分配一个整数值。如果缺少 value 属性，则以常规方式为 C 和 C++ 枚举分配值（即，第一个常量为零，否则比分配给前一个常量的值多 1）。
  - 提供注释文本的可选属性 comment。文本将成为生成的 C++ 代码中的注释。它附加到枚举的常量定义。

**例子**：
- 下面是一个仅具有名称的枚举常量：
```xml
<item name="ON"/>
```
- 下面是一个带有 name、value 和 comment 的枚举常量：
```xml
<item name="OFF" value="0" comment="The off state"/>
```

### XML 指定的数组类型
#### 赋予动机
如上所述，Serializable 类型的成员可以是某种其他类型的元素数组。例如，您可以创建包含此规范的文件 ACSTelemetrySerializable.xml：
```xml
<serializable name="ACSTelemetry">
  <members>
    <member name="attitudeError" type="F32"/>
    <member name="wheelSpeeds" type="U32" size="3"/>
  </members>
</serializable>
```
此文件定义具有以下成员的 Serializable 类型 ACSTelemetry：
- F32 类型的成员 attitudeError。
- 一个成员 wheelSpeeds，其类型是包含三个值的数组，每个值的类型为 U32。

或者，您可以在单独的 XML 文件中指定命名数组类型 A。然后，您可以执行以下操作：
- 生成 A 的 C++ 表示形式，您可以将其包含在 C++ 文件中并单独使用。
- 在 Serializable XML 类型、其他 Array XML 类型、端口参数、遥测通道和事件参数中使用 A 的 XML 表示形式。

例如，您可以创建一个文件 WheelSpeedsArrayAi.xml，用于指定包含三个 U32 值的数组，如下所示：
```xml
<array name="WheelSpeeds">
  <type>U32</type>
  <size>3</size>
  <format>%u</format>
  <default>
    <value>0</value>
    <value>0</value>
    <value>0</value>
  </default>
</array>
```
通过在此文件上运行代码生成器，您可以生成 C++ 文件 WheelSpeedsAc.hpp 和 WheelSpeedsAc.cpp，这些文件定义了表示此类型的 C++ 类 WheelSpeeds。在 C++ 代码中包含 WheelSpeedsEnumAc.hpp 的任何位置，都可以使用 WheelSpeeds 类。如果将 WheelSpeedsArrayAi.xml 导入到另一个 XML 定义中，则可以在此处使用 WheelSpeeds 类型。

要在另一个 XML 定义 D 中使用 XML 数组类型 A，请将定义 A 的文件的名称括在 XML 标记 import_array_type 中。例如，您可以修改 Serializable 类型 ACSTelemetry 的定义，如下所示：
```xml
<serializable name="ACSTelemetry">
  <import_array_type>WheelSpeedsArrayAi.xml</import_array_type>
  <members>
    <member name="attitudeError" type="F32"/>
    <member name="wheelSpeeds" type="WheelSpeeds"/>
  </members>
</serializable>
```
此规范定义了一个具有两个成员的 XML Serializable 类型：
- F32 类型的 Member attitudeError。
- WheelSpeeds 类型的成员 wheelSpeeds。

请注意，在将 wheelSpeeds 直接声明为包含三个 U32 值的数组之前，这里它被赋予了类型 WheelSpeeds，该类型在单独的 XML 规范中定义为包含三个 U32 值的数组。

再举一个例子，如果将文件 WheelSpeedsArrayAi.xml 导入到组件 C 的定义中，则可以在 C 的遥测字典中使用 WheelSpeeds 类型。当 WheelSpeeds 类型的值作为遥测数据发出时，GDS 会将其显示为包含三个值的数组。

#### 规范
- **文件名**：必须在名为 AArrayAi.xml 的文件中定义 XML 数组类型 A。例如，必须在名为 WheelSpeedsArrayAi.xml 的文件中定义 XML 数组类型 WheelSpeeds。
- **顶层结构**：XML 数组类型是名为 array 的 XML 节点，其属性为 array_attributes 和 children array_children。
```xml
<array array_attributes > array_children </array>
```
- **数组属性**：array_attributes 由以下部分组成：
  - 一个属性 name，提供数组类型的名称。
  - 一个可选的属性 namespace，给出数组类型的封闭命名空间。命名空间由一个或多个标识符组成，这些标识符以::分隔。

如果缺少属性 namespace，则将类型放置在全局命名空间中。

**例子**：
- 下面是全局命名空间中的 XML 数组 A：
```xml
<array name="A"> ...</array>
```
- 这是命名空间 B::C 中的 XML 数组 A:
```xml
<array name="A" namespace="B::C"> ...</array>
```
- **数组 children**：array_children 由以下各项组成，顺序不限：
  - 包含注释文本的可选节点 comment。
```xml
<comment> comment_text </comment>
```
注释文本将成为生成的 C++ 代码中的注释。它附加到定义数组的 C++ 类。
  - 以下任何节点的零个或多个：
```xml
<include_header> header_file </include_header> 
```
将 C++ 头文件包含在生成的 C++ 中。
```xml
<import_serializable_type> serializable_xml_file </import_serializable_type> 
```
用于导入 XML 指定的可序列化类型。
```xml
<import_enum_type> enum_xml_file </import_enum_type> 
```
用于导入 XML 指定的枚举类型。
```xml
<import_array_type> array_xml_file </import_array_type> 
```
用于导入 XML 指定的数组类型。
  - 一种节点 format，提供要应用于每个数组元素的单个格式字符串。
```xml
<format> format_string </format>
```
format_string 必须包含一个以 % 开头的转换说明符。考虑到数组元素类型，转换说明符对于 C 和 C++ printf 以及 Python 都必须合法。例如，如果数组元素类型为 U32，则 `<format>%u</format>` 是有效的格式说明符。`<format>%u seconds</format>` 也是如此。`<format>%s</format>` 不是合法的格式说明符，因为字符串格式 %s 对类型 U32 无效。
  - 由属性 type_attributes 和 text type 组成的节点 type。
```xml
<type size_attribute_opt > type </type>
```
size_attribute_opt 是一个可选的属性 size，用于指定十进制整数大小。仅当元素类型为 string 时，size 属性才有效，在这种情况下，该属性是必需的。它指定字符串表示的大小。

type 是指定每个数组元素类型的文本。它必须是 F Prime 内置类型（如 U32）或命名类型。命名类型是 （1） XML 指定类型（Serializable、Enum 或 Array）的名称，或 （2） include_header 附带的 C++ 类的名称。

**例子**：
```xml
<type>U32</type> 
```
指定内置类型 U32。
```xml
<type>T</type> 
```
指定命名类型 T。T 必须 （1） 通过 include_header 包含在内，或 （2） 通过 import_serializable_type、import_enum_type 或 import_array_type 导入。
```xml
<type size="40">string</type> 
```
指定大小为 40 的字符串类型。
  - 一个节点 size，将数组的大小指定为十进制整数。
```xml
<size> 整数 </size>
```
  - 具有一个或多个子节点 value 节点 default。
```xml
<default> 值 ...</default>
```
值的格式如下所述。数组的每个元素都必须有一个值。

**值**：节点 value 指定数组元素的默认值。该值必须是文本，当插入到生成的 C++ 代码中时，该文本表示正确类型的默认值。

**例子**：
- 如果数组元素类型为 U32，则 0 是正确的默认值。
- 假设数组元素类型是包含三个 U32 值的数组 A。在生成的 C++ 代码中，A 是具有三个参数构造函数的类，每个参数初始化一个数组元素。因此 A(1, 2, 3) 是正确的默认值。

### 手工编码可序列化
如果类型不容易表示为基本类型的集合，或者用户正在使用已定义类型的外部库，则手动编码的可序列化非常有用。用户可能还希望将特殊的处理函数附加到类。

编写 C++ 可序列化类的模式是声明一个从框架基类 `Fw::Serializable` 派生的类。该类型可以在 `Fw/Types/Serializable.hpp` 中找到。可以在 `Autocoders/templates/ExampleType.hpp` 中找到一个示例。方法如下：
1. **定义类**：它应该从 `Fw::Serializable` 派生。
2. **声明两个基类纯虚函数**：`serialize()` 和 `deserialize()`。这些函数提供缓冲区作为类型中数据的序列化形式的目标。
3. **实现函数**：作为这些函数的参数的缓冲区基类提供了许多帮助程序函数，用于序列化和反序列化上表中的基本类型。这些函数在同一头文件的 `SerializeBufferBase` 类类型中指定。对于开发人员希望保存的每个成员，请调用序列化函数。成员可以按任意顺序进行序列化。在最坏的情况下，如果序列化单个成员不可行，则提供原始缓冲区版本仅用于执行数据的大容量复制。反序列化函数应按照序列化的顺序反序列化数据。
4. **添加具有名为 `SERIALIZED_SIZE` 的单个成员的枚举**：该成员的值应是所有成员的大小之和。这可以通过所有 C/C++ 编译器可用的 `sizeof()` 函数来完成。（可选）可以添加类型标识符，以便在反序列化数据时进行健全性检查。该类型应该被序列化，然后在反序列化时根据枚举进行检查。
5. **实现复制构造函数和等于运算符**：如果类型是按值传递的，则开发人员应在默认值不足时编写这些函数。
6. **实现任何自定义功能**。

类完成后，可以将其包含在端口定义中。

### 约束 - 接地接口
对于将发送到地面系统和从地面系统发送的类型，不能在 XML 定义中使用手动编码的用户类型，因为地面系统要求所有类型定义都采用 XML。如果开发人员想要使用在 ground interface 中具有特殊函数的类型，则只能使用 XML 中的成员定义该类型，并由代码生成器生成。然后，开发人员可以使用该行为定义派生类。

### Ports
端口是组件之间的接口。组件通过调用其输出端口上的方法而不是直接调用组件来调用其他组件中的功能。输入端口调用由组件定义并在运行时注册的方法。

端口在 XML 文件中完全指定。没有开发人员编写的代码，但 XML 规范可以包含用户定义的参数类型，只要它们是可序列化的，如 Section 6.6.1.2 中所述。

定义端口的过程是在 XML 文件中指定方法的参数。为了使生成系统检测到文件包含端口类型的 XML，该文件必须遵循命名约定 <SomeName>PortAi.xml。这方面的一个示例可以在 Autocoders/templates/ExamplePortAi.xml 中找到。表 17 描述了 XML 标记和属性。

**表 17. 端口 XML 规范**
| **Tag** | **Attribute** | **Description** |
| --- | --- | --- |
| interface |  | The outermost tag that indicates a port is being defined. |
| interface | namespace | The C++ namespace for the port class (optional). |
| interface | name | The class name for the port. |
| comment |  | Used for a comment describing the port. Is placed as a Doxygen - compatible tag in the class declaration. |
| args |  | Optional. Starts the region of the declaration where port arguments are specified. |
| arg |  | Defines an argument to the port method. |
| arg | type | The type of the argument. Should be a built - in type, ENUM, string, an XML - specified type, or a user - written serializable type. A string type should be used if a text string is the argument. If the type is serial, the port is an untyped serial port that can be connected to any typed port for the purpose of serializing the call. See the Hub pattern in the architectural description document for usage. |
| arg | name | Defines the argument name. |
| arg | size | Specifies the size of the argument if it is of type string. |
| arg | pass_by | Optional. Specifies how the argument should be passed to a handler function. Values can be pointer or reference. For a synchronous port handler, the default behavior (with no pass_by attribute) is to pass by value for primitive values, otherwise by const reference. pass_by="pointer" causes a pointer to the data to be passed. pass_by="reference" causes a mutable reference to be passed. For an asynchronous port handler, pass_by="pointer" causes a pointer to the data to be passed. Otherwise, the data itself is serialized, copied into and out of the queue, and deserialized. The use of pointers and references carries the usual responsibility for understanding the scope and lifetime of the memory behind the pointer, as the pointer or reference may be held by another component past the duration of the port call. |
| enum |  | Specifies an enumeration when the argument type = ENUM. |
| enum | name | Enumeration type name. |
| item |  | Specifies a member of the enumeration. |
| item | name | Specifies the name of the enumeration member. |
| item | value | Assigns a value to the enumeration member. Member values in the enumeration follow C enumeration rules if not specified. |
| item | comment | A comment about the member. Becomes a Doxygen tag. |
| return |  | Optional. Specifies that the method will return a value. |
| return | type | Specifies the type of the return. Can be a built - in type. |
| return | pass_by | Specifies whether the argument should be passed by value or by reference or pointer. |
| import_serializable_type |  | Imports an XML definition of another serializable type for use in the definition. |
| import_enum_type |  | Imports an XML definition of an enumeration type. |
| import_array_type |  | Imports an XML definition of an array type. |
| include_header |  | Includes a C/C++ user - written header for argument types. |

#### 约束
以下约束针对端口 XML 定义。

##### 序列化
端口调用因各种原因按组件进行序列化，例如复制数据以放入消息队列。如果端口调用包含返回值，则无法序列化端口调用，因为序列化的参数仅传递给连接的端口或组件，并且不提供返回数据。

### 组件
组件是架构中所有行为所在的位置。传入端口调用提供要操作的数据和操作，输出端口用于调用组件外部的函数。此外，这些组件还定义了用于与地面软件通信的接口。

组件可用于多种用途，例如硬件驱动程序、状态机、设备管理器和数据管理。定义组件的过程是在 XML 中指定端口和地面数据接口。然后，开发人员实现一个继承自基类的派生类，并将接口实现为类中的方法（请参见第 6.7 节）。

为了使生成系统检测到文件包含组件类型的 XML，该文件必须遵循命名约定 <SomeName>ComponentAi.xml。这方面的一个例子可以在 Autocoders/templates/ExampleComponentAi.xml 中找到。表 18 描述了 XML 标记和属性。

**表 18. 组件 XML 规范**
| **Tag** | **Attribute** | **Description** |
| --- | --- | --- |
| component |  | The outermost tag that indicates a component is being defined. |
| component | namespace | The C++ namespace for the component class (optional). |
| component | name | The class name for the component. |
| component | kind | The type of component. Can be passive, queued, or active. A passive component has no thread or queue. A queued component has a message queue, but no thread. A component on another thread must invoke a synchronous input interface (see below) to get messages from the queue. An active component has a thread and unloads its message queue as the thread is scheduled and as port invocation messages arrive. |
| component | modeler | When the attribute is “true,” the autocoder does not automatically create ports for commands, telemetry, events, and parameters. If it is “true,” those ports must be declared in the port section with the “role” attribute. See the description below. |
| import_dictionary |  | Imports a ground dictionary defined outside the component XML that conforms to the command, telemetry, event, and parameter entries below. This allows external tools written by projects to generate dictionaries. |
| import_port_type |  | Imports an XML definition of a port type used by the component. |
| import_serializable_type |  | Imports an XML definition of a serializable type for use in the component interfaces. |
| import_enum_type |  | Imports an XML definition of an enumeration type. |
| import_array_type |  | Imports an XML definition of an array type. |
| comment |  | Used for a comment describing the component. Is placed as a Doxygen - compatible tag in the class declaration. |
| ports |  | Defines the section of the component definition where ports are defined. |
| port |  | Starts the description of a port. |
| port | name | Defines the name of the port. |
| port | data_type | Defines the type of the port. The XML file containing the type of the port must be provided via the import_port_type tag. |
| port | kind | Defines the synchronicity and direction of the port. The port can be of the following kinds: <br> Kind: <br> - sync_input: Invokes the derived class methods directly. <br> - guarded_input: Invokes the derived class methods after locking a mutex shared by all guarded ports and commands. <br> - async_input: Creates a message with the serialized arguments of the port call. When the message is dequeued, the arguments are deserialized and the derived class method is called. <br> - output: Port is an output port that is invoked from the logic in the derived class. |
| port | priority | The priority of the invocation. Only used for asynchronous ports, and specifies the priority of the message in the underlying message queue if priorities are supported by the target OS. Range is OS - dependent. |
| port | max_number | Specifies the number of ports of this type. This allows multiple callers to the same type of port if knowing the source is necessary. Can be specified as an Fw/Cfg/AcConstants.ini file $VARIABLE value. |
| port | full | Specifies the behavior for async ports when the message queue is full. One of drop, block, or assert, where assert is the default. |
| port | role | Specifies the role of the port when the modeler = true. |
| commands |  | Optional. Starts the section where software commands are defined. |
| commands | opcode_base | Defines the base value for the opcodes in the commands. If this is specified, all opcodes will be added to this value. If it is missing, opcodes will be absolute. This tag can also have a variable of the form $VARIABLE referring to values in Fw/Cfg/AcConstants.ini. |
| command |  | Starts the definition for a particular command. |
| command | mnemonic | Defines a text label for the command. Can be alphanumeric with “_” separators, but no spaces. |
| command | opcode | Defines an integer that represents the opcode used to decode the command. Should be a C - compilable constant. |
| command | kind | Defines the synchronicity of the command. The command can be of the following kinds: <br> Kind: <br> - sync: Invokes the derived class methods directly. <br> - guarded: Invokes the derived class methods after locking a mutex shared by all guarded ports and commands. <br> - async: Creates a message with the serialized arguments of the port call. When the message is dequeued, the arguments are deserialized and the derived class method is called. |
| command | priority | Sets command message priority if message is asynchronous, ignored otherwise. |
| command | full | Specifies the behavior for async commands when the message queue is full. One of drop, block, or assert, where assert is the default. |
| args |  | Optional. Starts the region of the declaration where command arguments are specified. |
| arg |  | Defines an argument in the command. |
| arg | type | The type of the argument. Should be a built - in type. A string type should be used if a text string is the argument. |
| arg | name | Defines the argument name. |
| arg | size | Specifies the size of the argument if it is of type string. |
| enum |  | Specifies an enumeration when the argument type = ENUM. |
| enum | name | Enumeration type name. |
| item |  | Specifies a member of the enumeration. |
| item | name | Specifies the name of the enumeration member. |
| item | value | Assigns a value to the enumeration member. Member values in the enumeration follow C enumeration rules if not specified. |
| item | comment | A comment about the member. Becomes a Doxygen tag. |
| telemetry |  | Optional. Specifies the section that defines the channelized telemetry. |
| telemetry | telemetry_base | Defines the base value for the channel IDs. If this is specified, all channel IDs will be added to this value. If it is missing, channel IDs will be absolute. This tag can also have a variable of the form $VARIABLE referring to values in Fw/Cfg/AcConstants.ini. |
| channel |  | Starts the definition for a telemetry channel. |
| channel | id | Specifies a numerical value identifying the channel. |
| channel | name | A text string with the channel name. Cannot contain spaces. |
| channel | data_type | Specifies the type of the channel. Should be a built - in type, ENUM, string, or an XML - specified serializable. A string type should be used if a text string is the argument. |
| channel | size | If the channel type is string, specifies the size of the string. |
| channel | abbrev | An abbreviation for the channel. Needed for the AMMOS Mission Data Processing and Control System (AMPCS), a ground data system to display telemetry and events from spacecraft. |
| channel | update | If the channel should be always updated, or only on change. Values are ALWAYS or ON_CHANGE. |
| channel | format_string | A format string specifier for displaying the channel value. |
| comment |  | A comment describing the channel. |
| enum |  | Specifies an enumeration when the channel type = ENUM. |
| enum | name | Enumeration type name. |
| item |  | Specifies a member of the enumeration. |
| item | name | Specifies the name of the enumeration member. |
| item | value | Assigns a value to the enumeration member. Member values in the enumeration follow C enumeration rules if not specified. |
| item | comment | A comment about the member. Becomes a Doxygen tag. |
| parameters |  | Optional. Specifies the section that defines parameters for the component. |
| parameters | parameter_base | Defines the base value for the parameter IDs. If this is specified, all parameter IDs will be added to this value. If it is missing, parameter IDs will be absolute. This tag can also have a variable of the form $VARIABLE referring to values in Fw/Cfg/AcConstants.ini. |
| parameters | opcode_base | Defines the base value for the opcodes in the parameter set and saves commands. If this is specified, all opcodes will be added to this value. If it is missing, opcodes will be absolute. This tag can also have a variable of the form $VARIABLE referring to values in Fw/Cfg/AcConstants.ini. |
| parameter |  | Starts the definition for a parameter. |
| parameter | id | Specifies a numeric value that represents the parameter. |
| parameter | name | Specifies the name of the parameter. |
| parameter | data_type | Specifies the type of the parameter. Should be a built - in type, ENUM, string, or an XML - specified serializable. A string type should be used if a text string is the argument. |
| parameter | size | Specifies the size of the parameter if it is of type string. |
| parameter | default | Specifies a default value for the parameter if the parameter is unable to be retrieved from non - volatile storage. Only for built - in types. |
| parameter | comment | A comment describing the parameter. |
| parameter | set_opcode | Command opcode used to set parameter. |
| parameter | save_opcode | Command opcode used to save parameter. |
| enum |  | Specifies an enumeration when the parameter type = ENUM. |
| enum | name | Enumeration type name. |
| item |  | Specifies a member of the enumeration. |
| item | name | Specifies the name of the enumeration member. |
| item | value | Assigns a value to the enumeration member. Member values in the enumeration follow C enumeration rules if not specified. |
| item | comment | A comment about the member. Becomes a Doxygen tag. |
| events |  | Optional. Specifies the section that defines events for the component. |
| events | event_base | Defines the base value for the event IDs. If this is specified, all event IDs will be added to this value. If it is missing, event IDs will be absolute. This tag can also have a variable of the form $VARIABLE referring to values in Fw/Cfg/AcConstants.ini. |
| event |  | Starts the definition for an event. |
| event | id | Specifies a numeric value that represents the event. |
| event | name | Specifies the name of the event. |
| event | severity | Specifies the severity of the event. The values can be: <br> Value: <br> - DIAGNOSTIC: Software debugging information. Meant for development. <br> - ACTIVITY_LO: Low - priority events related to software execution. <br> - ACTIVITY_HI: Higher priority events related to software execution. <br> - COMMAND: Events related to command execution. Should be reserved for the command dispatcher and sequencer. <br> - WARNING_LO: Error conditions that are of low importance. <br> - WARNING_HI: Error conditions that are of critical importance. <br> - FATAL: An error condition was encountered that the software cannot recover from. |
| event | format_string | A C - style format string to print a message corresponding to the event. Used for displaying the event in the command/data handling software as well as the optional text logging in the software. (See Section 9.12.) |
| event | throttle | Maximum number of events that will be issued before more are prevented. Once the limit has been reached, the throttle must be cleared before more can be issued. Non - negative integer. |
| comment |  | A comment describing the event. |
| args |  | Starts the region of the declaration where event arguments are specified. |
| arg |  | Defines an argument in the event. |
| arg | type | The type of the argument. Should be a built - in type, ENUM, string, or an XML - specified serializable. A string type should be used if a text string is the argument. |
| arg | name | Defines the argument name. |
| arg | size | Specifies the size of the argument if it is of type string. |
| internal_interfaces |  | Optional. Specifies an internal interface for the component. Internal interfaces are functions that can be called internally from implementation code. These functions will dispatch a message in the same fashion that asynchronous ports and commands do. The developer implements a handler in the same way, and that handler is called on the thread of an active or queued component. Internal interfaces cannot be specified for a passive component since there is no message queue. A typical use for an internal interface would be for an interrupt service routine. |
| internal_interface |  | Specifies an internal interface call. |
| internal_interface | priority | Sets internal interface message priority if the message is asynchronous, ignored otherwise. |
| internal_interface | full | Specifies the behavior for internal interfaces when the message queue is full. One of drop, block, or assert, where assert is the default. |
| internal_interface | comment | A comment describing the interface. |
| --- | --- | --- |
| internal_interface | args | Starts the region of the declaration where interface arguments are specified. |
| internal_interface | arg | Defines an argument in the interface. |
| internal_interface | type | The type of the argument. Should be a built - in type, ENUM, string, or an XML - specified serializable. A string type should be used if a text string is the argument. |
| internal_interface | name | Defines the argument name. |
| internal_interface | size | Specifies the size of the argument if it is of type string. |

注意：下表介绍了分层 XML 结构。重复的行可在多个不同的父级下以相同的格式使用。例如，命令可以定义内部枚举元素，事件可以定义枚举，通道可以定义枚举。因此，会重复一些行以表明这是可能的。

#### 约束
以下约束是针对组件的。

##### 被动组件
被动组件不能具有异步输入端口或命令，因为没有消息传递队列。

##### 周期组件
- 周期组件必须至少有一个同步或受保护的输入端口或同步命令，以便调用线程可以使用该端口从消息队列中检索端口调用消息。
- 周期组件必须至少有一个异步 input 端口、命令或内部接口，否则使组件排队就没有意义。

##### 主动组件
主动组件必须至少有一个异步输入端口、命令或内部接口，否则使组件处于活动状态或具有消息队列将毫无意义。

##### 命令和遥测接口
组件 XML 由命令和遥测系统解析，以构建数据存储和显示应用程序。因此，只能使用内置类型或 XML 中表示的类型。

##### 命令/遥测端口
在为组件声明命令、遥测、事件和参数时，代码生成器会自动为这些接口创建正确的端口集。这些端口基于端口的常规 XML 定义，因此这些端口类型可以用作其他组件中的常规端口。

例如，如果一个组件需要实现命令，XML 将声明这些命令，如表 1 所示。另一个组件需要充当命令调度程序来向该组件发送命令，因此调度程序组件将添加命令类型的输出端口。调度程序将命令作为通用端口调用来处理，而不是像在声明命令的组件中生成的代码那样反序列化命令参数。这允许编写组件以一般方式处理命令和 Telemetry，而不必将 command 和 telemetry 端口视为特殊情况。端口定义 XML 文件可以像其他端口一样包含在组件 XML 定义中。表 19 提供了用于命令和遥测端口的端口的类型、文件名和描述的列表。

**表 19. 端口类型**
| **Port Type** | **XML File** | **Description** |
| --- | --- | --- |
| Commands |  |  |
| Command | Fw/Cmd/CmdPortAi.xml | A port that passes a serialized command to a component. |
| Command Response | Fw/Cmd/CmdResponsePortAi.xml | A port that passes the completion status of a command. |
| Command Registration | Fw/Cmd/CmdRegPortAi.xml | A port used to request registration of a command. Used during initialization to tell a command dispatcher where to send specific opcodes. |
| Telemetry |  |  |
| Telemetry | Fw/Tlm/TlmPortAi.xml | A port that passes a serialized telemetry value. |
| Time | Fw/Time/TimePortAi.xml | A port that returns a time value for time stamping the telemetry. |
| Events |  |  |
| Log | Fw/Log/LogPortAi.xml | A port that passes a serialized event. |
| LogText | Fw/Log/LogTextPortAi.xml | A port that passes the text form of an event. Can be disabled via configuration of the architecture. |
| Time | Fw/Time/TimePortAi.xml | A port that returns a time value for time stamping the telemetry. |
| Parameters |  |  |
| Parameter | Fw/Prm/PrmPortAi.xml | A port that returns a serialize parameter value |

### 拓扑
组件的拓扑（或互连）可以通过手动互连它们来实现（参见 Section 6.8） 或通过拓扑 XML 文件指定它们。这方面的一个例子可以在 Ref/Top/RefTopologyAppAi.xml 中看到。如果文件具有结束 AppAi.xml，则自动编码器将处理该文件。表 20 提供了拓扑的 XML 规范。

**表 20. 拓扑 XML 规范**
| **Tag** | **Attribute** | **Description** |
| --- | --- | --- |
| deployment |  | The outermost tag that indicates a topology is being defined. |
| assembly |  | Alternate declaration for deployment. |
| deployment | name | The name of the deployment. |
| import_component_type |  | Imports the XML file that defines a component used in the topology. |
| instance |  | Defines a component instance. |
| instance | name | Name of the component instance. This instance name must match a component object declared in the C++ code. |
| instance | namespace | C++ namespace of component implementation type. |
| instance | type | C++ type of implementation class |
| instance | base_id | The starting ID value for commands, events, and telemetry for this instance of the component. Used to construct dictionary for ground system. |
| instance | base_id_window | A bookkeeping attribute that the modeler uses to space out the base_id values. It can be omitted if the base_ids are spaced enough to cover the id range in the component. |
| connection |  | Defines a connection between two component ports. |
| connection | name | Name of connection. |
| source |  | Defines the source of the connection. |
| source | component | Defines source component. Must match an instance in instance section above. |
| source | port | Defines the source port on the component. |
| source | type | Source port type. |
| source | num | Source port number if multiple port instances. |
| target | component | Defines target component. Must match an instance in instance section above. |
| target | port | Defines the target port on the component. |
| target | type | Target port type. |
| target | num | Target port number if multiple port instances. |

自动编码器将按照约定 <Deployment Name>AppAc.cpp 和 .hpp 输出源文件和头文件。头文件包含名为 construct<architecture>Architecture 的函数。此函数将调用所有连接方法来连接组件。该文件需要在定义 XML 的目录中有一个头 Components.hpp，该头包含连接中实现类实例的声明。

#### 约束
组件的 XML 规范需要组件实例的静态声明，该声明可以通过其对象名称引用。如果组件以其他方式（如堆）实例化，则可以使用手动方法。


## F' 实现类

### 注意
有关构建拓扑的动手实践演练，请参阅：教程

---

#### 代码生成器采用上一节中的 XML 定义并生成 C++ 基类。

开发人员编写从这些基类派生的类，并实现特定于项目的逻辑。对于输入端口和命令，基类声明要实现的派生类的纯虚方法。如果开发人员忘记实现这些功能，则代码的编译将失败。对于输出端口、遥测通道、事件和参数，基类提供基类要调用的方法。

根据组件的种类，将在组件本身的线程或调用同步或保护端口的组件的线程上进行虚拟调用。

本指南介绍如何将自动编码的设置用于：

- 端口 (ports)
- 命令 (commands)
- 通道/遥测 (channels/telemetry)
- 事件 (events)
- 参数 (parameters)

高级主题包括：
- 内部接口
- 消息 Pre-Hooks
- 初始化代码

---

### 输入端口调用

用于实现 port 调用的纯虚函数派生自组件 XML 中 port 声明的名称。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
<port name>_handler(NATIVE_INT_TYPE portNum, <argument list>) = 0;
```

- `<port name>` = 在 XML 的 port 部分中的 `name=` 标签给定的端口名称。
- `portNum` = 如果 XML 编写者定义了多个端口，这允许开发者知道哪个端口被调用。值是索引为零的端口实例。如果未指定 “max_number” 属性（即单个输入端口），此值为零。
- `<argument list>` = 在端口定义 XML 的 args 部分指定的参数列表。

---

### 输出端口调用

用于传出端口调用的基类函数派生自组件 XML 中端口声明的名称和类型。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
<port name>_out(NATIVE_INT_TYPE portNum, <argument list>);
```

- `<port name>` = 在 XML 的 port 部分中的 `name=` 标签给定的端口名称。
- `portNum` = 如果 XML 编写者定义了多个端口，这允许开发者指定调用哪个端口。值是索引为零的端口实例。如果未指定 “max_number” 属性（即单个输出端口），此值应设为零。
- `<argument list>` = 在端口定义 XML 的 args 部分指定的参数列表。

该调用将调用在所考虑的组件与之互连的任何组件上定义的 port 方法。如果这些端口定义为 synchronous 或 guarded，则其他组件的 logic 将在调用的线程上执行。

如果端口未连接并被调用，则代码将断言。如果设计需要可选连接的端口，则可以在通过此函数调用之前检查连接状态：
```
isConnected_<port name>_OutputPort(NATIVE_INT_TYPE portNum);
```

---

### 端口号调用

可以调用基类中的方法来获取可用的端口数。该方法具有以下命名方案：
```
NATIVE_INT_TYPE getNum_<port name>_<direction>Ports();
```

- `<port name>` = 在 XML 的 port 部分中的 `name=` 标签给定的端口名称。
- `<direction>` = 端口的方向，Input 或 Output。

开发人员可以使用此功能自动将代码缩放到 XML 中指定的端口数。如果调用端口输出函数时 `portNum` 值大于端口数减 1，则代码将断言。

---

### 命令

实现命令的纯虚函数源自组件 XML 中命令声明中的助记词。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
<mnemonic>_cmdHandler(FwOpcodeType opcode, U32 cmdSeq, <argument list>) = 0;
```

- `<mnemonic>` = 在 XML 的 command 部分中的 `mnemonic=` 标签给定的命令助记符。
- `<argument list>` = 在命令定义 XML 的 args 部分指定的参数列表。

命令完成后，必须在基类中调用命令响应方法，以通知调度程序命令已完成。该函数调用如下所示：
```
void cmdResponse_out(FwOpcodeType opCode, U32 cmdSeq, Fw::CommandResponse response);
```

函数传递的 opcode 和 cmdSeq 值应传递给命令响应函数，以及指示命令成功或失败的状态。操作码在 XML 中指定，cmdSeq 将由命令调度程序设置，以跟踪命令在命令序列中的位置。如果需要有关失败的更多信息，则应指定一个事件并使用其他信息调用（请参见Section 6.7.4）。如果命令需要多个步骤，并且对命令调度函数的调用没有完成命令，则应存储操作码和命令序列，以便以后调用命令响应函数。

---

### 遥测

遥测通道旨在用于定期测量的数据。它是时间快照，所有值可能不会永久记录并发送到命令和数据处理软件。代码生成器为 XML 中定义的每个遥测通道生成一个基类函数。开发人员调用此函数以写入正在存储的遥测数据的新值。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
tlmWrite_<channel name>(<type>& arg);
```

- `<channel name>` = 在 XML 的 channel 部分中的 `name=` 标签给定的端口名称。
- `<type>` = 在 XML 的 `data_type=` 标签中指定的非命名空间限定类型的通道。

该参数始终通过引用传递以避免复制。该调用在内部向该值添加时间戳。如果开发人员希望将时间值用于其他目的，则基类中有一个方法 getTime()。

---

### 事件

事件是间歇性的，并且都被记录下来，以在事后重建一系列操作或事件。代码生成器为 XML 中定义的每个事件生成一个基类函数。每当需要记录的事件发生时，开发者都会调用 call。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
log_<severity>_<event name>(<event arguments>);
```

- `<severity>` = XML 中事件的 severity 属性的值。
- `<event name>` = XML 中 `name` 属性给出的事件名称。
- `<event arguments>` = 事件的参数列表。

该调用在内部向事件添加时间戳。如果开发人员希望将时间值用于其他目的，则基类中有一个方法 getTime()。

---

### 参数

参数是以非易失性方式存储的值，是无需软件更新即可影响软件行为的方法。在初始化期间，将检索参数并将其存储在组件基类中，以供开发人员以后用作派生类。如果由于某种原因无法检索参数，则返回 XML 中指定的默认值。该函数在类的 protected 部分中声明，并具有以下命名方案：
```
<parameter type> paramGet_<parameter name>(Fw::ParamValid& valid);
```

- `<parameter type>` = XML 中 `data_type` 标签指定的参数类型。
- `<parameter name>` = XML 中 `name` 属性给出的参数名称。

参数值通过引用返回，以避免复制数据。调用后应检查有效值，以查看参数值的状态。表 21 提供了 status 的可能值及其含义。

表 21. 参数检索状态值。

| Value         | Meaning                                                                 |
|---------------|-------------------------------------------------------------------------|
| Fw::PARAM_UNINIT | 从未尝试过检索值。这可能是忘记了在软件初始化期间调用组件的 loadParameters() 公共函数。 |
| Fw::PARAM_VALID  | 参数已成功检索。                                                      |
| Fw::PARAM_INVALID| 参数未能成功检索，且未指定默认值。                                     |
| Fw::PARAM_DEFAULT| 参数未能成功检索，但提供了默认值。                                      |

在基类中定义了一个虚拟方法：
```
void parameterUpdated(FwPrmIdType id);
```

默认情况下，此方法不执行任何操作，但如果实现需要更新参数值的通知，开发人员可以覆盖该方法。每次更新参数时都会调用它。

---

### 内部接口

在组件 XML 中指定内部接口时，将生成一个函数，实现代码可以调用该函数来为消息循环分派消息。该函数具有以下名称：
```
<internal interface name>_internalInterfaceInvoke(<arguments>);
```

还为调度内部接口消息时将调用的函数定义了处理程序函数定义。该函数具有以下名称：
```
<internal interface name>_internalInterfaceHandler(<arguments>);
```

该函数被定义为纯虚拟，以确保它已实现。

---

### 消息预钩 (Pre-Hooks)

指定异步端口或命令时，代码生成器将定义可在调度消息之前调用的函数。这提供了一种轻量级机制，用于在调度消息之前执行一些工作。该函数被定义为默认实现为空的虚 （非纯） 函数。实现者可以使用备用版本覆盖该函数。

端口的函数名称如下：
```
void <port name>_preMsgHook(NATIVE_INT_TYPE portNum, <port arguments>);
```

port 参数的值将传递给函数。

命令的函数名称如下：
```
void <command mnemonic>_preMsgHook(FswOpcodeType opcode, U32 cmdSeq);
```

它不提供命令的参数，因为在处理命令消息之前不会提取这些参数。

---

### 初始化代码

#### 构造函数

组件框架可以选择存储组件名称，以便进行组件互连测试和跟踪。这是通过 Section 9.2 中讨论的 class naming configuration 来启用或禁用的。指示是否启用命名的宏是 .开发人员应定义并实现两个备用构造函数，一个采用 name 参数，另一个不采用 name 参数。如示例中所示，两个构造函数实现之间的唯一区别是需要向基类构造函数传递 name 参数。用户也可以添加任何自定义构造函数代码，但在此阶段，组件基类尚未初始化，因此不应进行端口调用。

#### 初始化

每个组件基类都有一个 init() 函数，必须在互连组件之前调用该函数。如果组件已排队或处于活动状态，则必须提供 queue depth 参数。此外，如果组件要多次实例化，则还有一个可选的 instance 参数。可以从派生类中的并行 init() 函数调用此函数。

#### 任务序言/终结器

活动组件为代码提供前导码原型，该原型可在线程阻塞等待端口调用之前运行一次，并为在组件退出消息循环时运行的代码提供终结器原型。这两个函数在活动组件的线程上调用。它们在 C++ 中声明为虚函数，因此不是必需的。preamble 函数名为 preamble(void)，终结器名为 finalizer(void)。它们可用于执行一次性活动，例如数据结构初始化和清理。

## 构造 F' 拓扑

注意：有关构建拓扑的动手演练，请参阅教程。

### 软件组件概述

执行软件由一组互连的组件组成，这些组件在活动组件的线程上执行或由系统中的其他事件驱动，例如硬件中断或计时源。本节将介绍启动和运行软件所需的步骤。

#### 步骤概览：

- 实例化组件
- 初始化组件
- 互连组件
- 注册命令
- 加载参数
- 启动活动组件

---

### 实例化组件

组件基类的构造函数被设计为支持多种内存模型实例化组件，包括静态创建、堆上创建或栈上创建。根据 Section 6.7.8.1 的说明，构造函数可能包含名称参数或完全不包含。派生类构造函数可以拥有特定于应用程序的额外参数。对于静态声明的类，开发者需要注意执行顺序的不确定性。

### 初始化组件

每个组件需要调用其组件基类的 `init()` 方法来完成初始化（Section 6.8.2）。此调用应在实例化之后进行。对于排队和活动组件，传递队列大小是必要的，且应基于任务优先级和组件间消息流量的理解来调整队列大小。

### 组件互连

通过连接组件端口，可以实现软件中组件的互连。这涉及到传递指向输入端口的指针给相应的输出端口。组件基类提供了方法来获取输入端口指针并将其提供给输出端口。下面的部分描述了不同端口类型的连接方式。

#### 接口端口

接口端口用于将组件连接在一起。对于每个端口类型和名称，都有对应的方法命名规则来获取和设置端口指针。

**获取输入端口指针：**

```cpp
<PortType>* get_<port name>_InputPort(NATIVE_INT_TYPE portNum);
```

**设置输出端口指针：**

```cpp
void set_<port name>_OutputPort(NATIVE_INT_TYPE portNum, <PortType>* port);
```

如果只有一个端口实例，则 `portNum` 参数应设为零。当处理序列化端口时，存在一个额外的重载版本。

#### 命令端口

代码生成器会为定义了命令的组件创建适当的命令相关端口集（Section 6.6.4），并且有标准的函数名用于获取或设置这些端口的指针。

**获取命令输入端口：**

```cpp
Fw::InputFwCmdPort* get_CmdDisp_InputPort();
```

**设置命令状态端口：**

```cpp
void set_CmdStatus_OutputPort(Fw::InputCmdResponse_Port* port);
```

**设置命令注册端口：**

```cpp
void set_CmdReg_OutputPort(Fw::InputCmdRegPort* port);
```

#### 遥测端口

遥测的标准端口访问函数如下：

**设置遥测输出端口：**

```cpp
void set_Tlm_OutputPort(Fw::InputTlmPort* port);
```

**设置时间输出端口：**

```cpp
void set_Time_OutputPort(Fw::InputTimePort* port);
```

#### 事件日志记录端口

用于事件日志记录的标准端口访问函数如下：

**设置日志输出端口：**

```cpp
void set_Log_OutputPort(Fw::InputLogPort* port);
void set_TextLog_OutputPort(Fw::InputFwLogTextPort* port);
```

请注意，`set_Time_OutputPort()` 可以同时服务于遥测端口和事件日志端口。

#### 参数端口

参数的标准端口访问函数如下：

```cpp
void set_ParamGet_OutputPort(Fw::InputFwPrmGetPort* port);
void set_ParamSet_OutputPort(Fw::InputFwPrmSetPort* port);
```

### 注册命令

命令调度模式要求用户实现的命令调度组件将输出命令端口连接到每个服务命令的组件的输入命令端口。为了辅助这个过程，代码生成器会在为组件指定命令时创建命令注册函数，该函数接收与组件命令端口相连的调度程序组件上的端口号作为参数。然后可以在组件中调用 `regCommands()` 方法，它将调用每个操作码的注册端口。

### 加载参数

Section 6.8.3.5 解释了如何将参数输出端口连接到提供参数存储的组件。连接完成后，可以通过调用基类方法 `loadParameters()` 来请求所有参数的值。尽管参数通常只在初始化期间读取一次，但在参数存储更新后也可以再次调用此方法来重新加载参数。

### 启动活动组件

构建拓扑的最后一步是启动任何活动组件的任务。`start()` 方法位于 `Fw/Comp/FwActiveComponentBase.hpp` 的 `ActiveComponentBase` 基类中。表 22 列出了参数及其含义。

#### 表 22. 活动组件 `start()` 参数

| 参数       | 含义                                                                 |
|------------|----------------------------------------------------------------------|
| identifier | 线程无关的值，用于标识线程活动。在系统中应该是唯一的。               |
| priority   | 任务执行的优先级：0 = 最低优先级，255 = 最高优先级。                 |
| stackSize  | 分配给任务的堆栈大小。                                               |

如 Section 6.7.8.3 所述，`preamble()` 和 `finalizer()` 函数将在循环前和等待端口调用后各运行一次。