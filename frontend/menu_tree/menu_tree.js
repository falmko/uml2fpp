// 获取画布中所有元素
// 如果是主组件，获取其子组件 subElements[component.id]
// 画出主组件、端口（有的话）及其子组件
// 如果是架构组件，将其放在一类
// 如果是组件库中的组件，将其放在另一类
// 如果是连接线，不考虑
export var menu_tree = {
    "Component": [
        {
            "name": "Component1",
            "id": "Component111",
            "ports": {
                "InputPort": [
                    {
                        "name": "InputPort1",
                        "id": "InputPort1111"
                    },
                    {
                        "name": "InputPort2",
                        "id": "InputPort1112"
                    }
                ],
                "OutputPort": [
                    {
                        "name": "OutputPort1",
                        "id": "OutputPort1111"
                    },
                    {
                        "name": "OutputPort2",
                        "id": "OutputPort1112"
                    }
                ]
            },
            "Commands": {
                "name": "Commands1",
                "id": "Commands111"
            },
            "Parameters": {
                "name": "Parameters1",
                "id": "Parameters111"
            }
        }
    ],
    "Architecture": {
        "Fprime": [
            {
                "name": "Fprime1",
                "id": "Fprime111"
            },
            {
                "name": "Fprime2",
                "id": "Fprime112"
            }
        ],
    },
    "Library": {
        "Library1": [
            {
                "name": "Fprime1",
                "id": "Fprime111"
            },
            {
                "name": "Fprime2",
                "id": "Fprime112"
            }
        ],
    },
    "Connection": [
        
    ],
    "Custom":{
        "Custom1": [
        ]
    }
};

// 存储每个节点的展开/折叠状态
const expandedNodes = new Map();


const treeContainer = document.getElementById('component-tree');
export function renderMenuTree() {
    // 在重新渲染前保存当前的展开状态
    saveExpandedState();

    // 清除现有内容
    treeContainer.innerHTML = '';

    const treeList = document.createElement('ul');
    treeList.className = 'tree-view';

    // 处理顶层类别
    for (const [category, value] of Object.entries(menu_tree)) {
        const item = document.createElement('li');
        item.className = 'tree-item';

        // 创建节点路径用于标识
        const nodePath = category;
        item.dataset.path = nodePath;

        // 创建标签容器
        const labelDiv = document.createElement('div');
        labelDiv.className = 'tree-label';

        // 添加展开/折叠图标
        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = '▶';
        labelDiv.appendChild(toggle);

        // 添加类别名称 - 如果有name属性则使用它
        const text = document.createElement('span');
        text.className = 'tree-text';
        text.textContent = value.name || category;
        labelDiv.appendChild(text);

        item.appendChild(labelDiv);

        // 创建子列表
        const childList = document.createElement('ul');
        childList.className = 'tree-children';
        childList.style.display = 'none';

        // 递归处理子节点
        buildChildNodes(childList, value, nodePath);

        if (childList.childNodes.length > 0) {
            item.appendChild(childList);

            // 添加点击展开/折叠功能
            labelDiv.addEventListener('click', function () {
                const isOpen = childList.style.display !== 'none';
                childList.style.display = isOpen ? 'none' : 'block';
                toggle.textContent = isOpen ? '▶' : '▼';

                // 更新展开状态
                if (isOpen) {
                    expandedNodes.delete(nodePath);
                } else {
                    expandedNodes.set(nodePath, true);
                }
            });

            // 恢复展开状态
            if (expandedNodes.has(nodePath)) {
                childList.style.display = 'block';
                toggle.textContent = '▼';
            }
        }

        treeList.appendChild(item);
    }

    treeContainer.appendChild(treeList);
    console.log('menu_tree', menu_tree);
}

function saveExpandedState() {
    // 只有在treeContainer存在时才执行
    if (!treeContainer) return;

    // 查找所有当前展开的节点
    const expandedElements = treeContainer.querySelectorAll('.tree-children[style="display: block"]');
    expandedElements.forEach(el => {
        const parentItem = el.closest('.tree-item');
        if (parentItem && parentItem.dataset.path) {
            expandedNodes.set(parentItem.dataset.path, true);
        }
    });
}

function buildChildNodes(parentList, data, parentPath) {
    if (Array.isArray(data)) {
        // 处理数组类型的数据
        data.forEach((item, index) => {
            if (item && typeof item === 'object') {
                const nodePath = `${parentPath}.${index}`;
                const node = createTreeItem(item, null, nodePath);
                parentList.appendChild(node);
            }
        });
    } else if (data && typeof data === 'object') {
        // 处理对象类型的数据
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'name' && key !== 'id') {
                const nodePath = `${parentPath}.${key}`;
                // 对于对象类型，检查是否是数组
                if (Array.isArray(value)) {
                    // 数组类型直接使用键名作为显示名称
                    const node = createTreeItem({ name: key }, value, nodePath);
                    parentList.appendChild(node);
                } else if (value && typeof value === 'object') {
                    // 对象类型，使用其name属性或键名
                    const displayName = value.name || key;
                    const node = createTreeItem({ name: displayName }, value, nodePath);
                    parentList.appendChild(node);
                }
            }
        }
    }
}

function createTreeItem(item, childData = null, nodePath = '') {
    const listItem = document.createElement('li');
    listItem.className = 'tree-item';
    listItem.dataset.path = nodePath;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'tree-label';

    // 判断是否有子节点
    const value = childData || item;
    const hasChildren = value && typeof value === 'object' &&
        (Array.isArray(value) ||
            (Object.keys(value).length > 0 &&
                Object.keys(value).some(k => k !== 'name' && k !== 'id')));

    // 添加展开/折叠图标（如果有子节点）
    let toggle;
    if (hasChildren) {
        toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = '▶';
        labelDiv.appendChild(toggle);
    }

    // 添加节点名称
    const text = document.createElement('span');
    text.className = 'tree-text';
    text.textContent = item.name || 'Item';
    labelDiv.appendChild(text);

    listItem.appendChild(labelDiv);

    // 处理子节点
    if (hasChildren) {
        const childList = document.createElement('ul');
        childList.className = 'tree-children';
        childList.style.display = 'none';

        buildChildNodes(childList, value, nodePath);

        if (childList.childNodes.length > 0) {
            listItem.appendChild(childList);

            // 添加点击展开/折叠功能
            labelDiv.addEventListener('click', function () {
                const isOpen = childList.style.display !== 'none';
                childList.style.display = isOpen ? 'none' : 'block';
                toggle.textContent = isOpen ? '▶' : '▼';

                // 更新展开状态
                if (isOpen) {
                    expandedNodes.delete(nodePath);
                } else {
                    expandedNodes.set(nodePath, true);
                }
            });

            // 恢复展开状态
            if (expandedNodes.has(nodePath)) {
                childList.style.display = 'block';
                toggle.textContent = '▼';
            }
        }
    }

    return listItem;
}