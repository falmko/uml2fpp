// 获取画布中所有元素
// 如果是主组件，获取其子组件 subElements[component.id]
// 画出主组件、端口（有的话）及其子组件
// 如果是架构组件，将其放在一类
// 如果是组件库中的组件，将其放在另一类
// 如果是连接线，不考虑

// MenuTreeManager 类定义
class MenuTreeManager {
    constructor(initialData, menuTreeContainer) {
        this._data = initialData || {};
        this._listeners = new Set();
        this._expandedNodes = new Map();
        this._treeContainer = menuTreeContainer;
    }

    get data() {
        return this._data;
    }

    set data(newData) {
        this._data = newData;
        this._notifyListeners();
    }

    // 添加监听器
    addListener(callback) {
        this._listeners.add(callback);
    }

    // 移除监听器
    removeListener(callback) {
        this._listeners.delete(callback);
    }

    // 更新数据
    updateData(path, value) {
        const parts = path.split('.');
        let current = this._data;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        this._notifyListeners();
    }

    // 删除数据
    deleteData(path) {
        const parts = path.split('.');

        // 如果路径为空，直接返回
        if (parts.length === 0) return;

        // 特殊处理根级别的删除
        if (parts.length === 1) {
            delete this._data[parts[0]];
            this._notifyListeners();
            return;
        }

        // 找到目标的父级路径和对象
        //  获取路径中除最后一个部分外的所有部分，这就是要删除项的父路径
        const parentPath = parts.slice(0, -1);
        let parent = this._data;

        // 从根数据对象 this._data 开始遍历
        for (const key of parentPath) {
            if (!(key in parent)) {
                return; // 路径不存在，直接返回
            }
            parent = parent[key];
        }

        // 获取要删除项的键名
        const lastKey = parts[parts.length - 1];

        // 如果是数组元素，使用splice删除
        if (Array.isArray(parent)) {
            // 将键名转换为数字索引
            const index = parseInt(lastKey);
            if (!isNaN(index) && index >= 0 && index < parent.length) {
                parent.splice(index, 1);
            }
        } else if (parent && typeof parent === 'object') {
            // 否则直接删除属性
            delete parent[lastKey];
        }

        // 从底向上清理空对象/数组
        this._cleanupEmptyObjects(parts.slice(0, -1));

        this._notifyListeners();
    }

    // 从指定路径开始，清理空对象和数组
    _cleanupEmptyObjects(pathParts) {
        if (pathParts.length === 0) return;

        let current = this._data;
        let parent = null;
        let lastKey = '';

        // 遍历到指定路径
        for (let i = 0; i < pathParts.length; i++) {
            if (i === pathParts.length - 1) {
                parent = current;
                lastKey = pathParts[i];
            }

            if (!(pathParts[i] in current)) {
                return;
            }

            current = current[pathParts[i]];
        }

        // 检查当前对象是否为空
        const isEmpty = this._isObjectEmpty(current);

        if (isEmpty && parent && lastKey) {
            delete parent[lastKey];
            // 递归清理上一级
            this._cleanupEmptyObjects(pathParts.slice(0, -1));
        }
    }

    // 检查对象是否为空（考虑数组和普通对象的情况）
    _isObjectEmpty(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        if (Array.isArray(obj)) {
            return obj.length === 0;
        }

        // 对于普通对象，首先检查是否有任何属性
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return true;
        }

        // 如果对象有name或id属性，不视为空
        if (obj.name !== undefined || obj.id !== undefined) {
            return false;
        }

        // 其他情况，检查对象是否有有效内容
        return keys.length === 0;
    }

    // data更改后，通知所有监听器
    _notifyListeners() {
        this._listeners.forEach(callback => callback(this._data));
    }

    // 保存展开状态
    _saveExpandedState() {
        if (!this._treeContainer) return;

        const expandedElements = this._treeContainer.querySelectorAll('.tree-children[style="display: block"]');
        expandedElements.forEach(el => {
            const parentItem = el.closest('.tree-item');
            if (parentItem && parentItem.dataset.path) {
                this._expandedNodes.set(parentItem.dataset.path, true);
            }
        });
    }

    // 渲染树结构
    render() {
        this._saveExpandedState();
        if (!this._treeContainer) return;

        this._treeContainer.innerHTML = '';
        const treeList = document.createElement('ul');
        treeList.className = 'tree-view';

        // 处理顶层类别
        for (const [category, value] of Object.entries(this._data)) {
            const item = this._createTreeItem(category, value, category);
            treeList.appendChild(item);
        }

        this._treeContainer.appendChild(treeList);
    }

    // 创建树节点
    _createTreeItem(name, data, nodePath) {
        const listItem = document.createElement('li');
        listItem.className = 'tree-item';
        listItem.dataset.path = nodePath;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'tree-label';

        const hasChildren = this._hasChildren(data);

        if (hasChildren) {
            const toggle = document.createElement('span');
            toggle.className = 'tree-toggle';
            toggle.textContent = '▶';
            labelDiv.appendChild(toggle);
        }

        const text = document.createElement('span');
        text.className = 'tree-text';
        text.textContent = data.name || name;
        labelDiv.appendChild(text);

        listItem.appendChild(labelDiv);

        if (hasChildren) {
            const childList = document.createElement('ul');
            childList.className = 'tree-children';
            childList.style.display = 'none';

            this._buildChildNodes(childList, data, nodePath);

            if (childList.childNodes.length > 0) {
                listItem.appendChild(childList);
                this._addToggleListener(labelDiv, childList, nodePath);

                if (this._expandedNodes.has(nodePath)) {
                    childList.style.display = 'block';
                    labelDiv.querySelector('.tree-toggle').textContent = '▼';
                }
            }
        }

        return listItem;
    }

    // 检查是否有子节点
    _hasChildren(data) {
        return data && typeof data === 'object' &&
            (Array.isArray(data) ||
                (Object.keys(data).length > 0 &&
                    Object.keys(data).some(k => k !== 'name' && k !== 'id')));
    }

    // 构建子节点
    _buildChildNodes(parentList, data, parentPath) {
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    const nodePath = `${parentPath}.${index}`;
                    const node = this._createTreeItem(item.name || `Item ${index}`, item, nodePath);
                    parentList.appendChild(node);
                }
            });
        } else if (data && typeof data === 'object') {
            for (const [key, value] of Object.entries(data)) {
                if (key !== 'name' && key !== 'id') {
                    const nodePath = `${parentPath}.${key}`;
                    const node = this._createTreeItem(key, value, nodePath);
                    parentList.appendChild(node);
                }
            }
        }
    }

    // 添加展开/折叠监听器
    _addToggleListener(labelDiv, childList, nodePath) {
        const toggle = labelDiv.querySelector('.tree-toggle');
        labelDiv.addEventListener('click', () => {
            const isOpen = childList.style.display !== 'none';
            childList.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '▶' : '▼';

            if (isOpen) {
                this._expandedNodes.delete(nodePath);
            } else {
                this._expandedNodes.set(nodePath, true);
            }
        });
    }
}

const menuTreeContainer = document.getElementById('component-tree');
export const menuTreeManager = new MenuTreeManager({}, menuTreeContainer);
menuTreeManager.render();
menuTreeManager.addListener(() => {
    menuTreeManager.render();
});

// initialData 示例
// const initialData = {
//     "Component": [
//         {
//             "name": "Component1",
//             "id": "Component111",
//             "ports": {
//                 "InputPort": [
//                     {
//                         "name": "InputPort1",
//                         "id": "InputPort1111"
//                     },
//                     {
//                         "name": "InputPort2",
//                         "id": "InputPort1112"
//                     }
//                 ],
//                 "OutputPort": [
//                     {
//                         "name": "OutputPort1",
//                         "id": "OutputPort1111"
//                     },
//                     {
//                         "name": "OutputPort2",
//                         "id": "OutputPort1112"
//                     }
//                 ]
//             },
//             "Commands": {
//                 "name": "Commands1",
//                 "id": "Commands111"
//             },
//             "Parameters": {
//                 "name": "Parameters1",
//                 "id": "Parameters111"
//             }
//         }
//     ],
//     "Architecture": {
//         "Fprime": [
//             {
//                 "name": "Fprime1",
//                 "id": "Fprime111"
//             },
//             {
//                 "name": "Fprime2",
//                 "id": "Fprime112"
//             }
//         ]
//     },
//     "Library": {
//         "Library1": [
//             {
//                 "name": "Fprime1",
//                 "id": "Fprime111"
//             },
//             {
//                 "name": "Fprime2",
//                 "id": "Fprime112"
//             }
//         ]
//     },
//     "Connection": [],
//     "Custom": {
//         "Custom1": []
//     }
// };