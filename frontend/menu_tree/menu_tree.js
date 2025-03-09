/**
 * MenuTreeManager 类
 * 负责管理树形菜单的数据结构、渲染和交互
 */
import { highlighters } from "@joint/plus";
import { createHalo,HALO_CONFIGS } from "../halo/halo";
import { getCurrentInspectors, createInspector } from "../inspectors/inspectors";
export class MenuTreeManager {
    /**
     * 构造函数
     * @param {Object} initialData - 初始树形数据
     * @param {HTMLElement} menuTreeContainer - 菜单容器DOM元素
     */
    constructor(graph, paper, paperScroller, initialData, menuTreeContainer) {
        this._data = initialData || {};
        this._listeners = new Set();
        this._expandedNodes = new Map();
        this._treeContainer = menuTreeContainer;

        this._graph = graph;
        this._paper = paper;
        this._paperScroller = paperScroller;

        // 添加当前高亮状态跟踪
        this._currentHighlightedCell = null;

        // 添加全局点击事件监听，用于取消高亮
        document.addEventListener('click', this._handleDocumentClick.bind(this));
    }

    // ===== 数据操作方法 =====

    /**
     * 获取当前树数据
     * @return {Object} 树数据
     */
    get data() {
        return this._data;
    }

    /**
     * 设置树数据并触发更新
     * @param {Object} newData - 新的树数据
     */
    set data(newData) {
        this._data = newData;
        this._notifyListeners();
    }

    /**
     * 更新指定路径的数据
     * @param {string} path - 点分隔的路径，如 "Component.0.ports"
     * @param {*} value - 要设置的值
     */
    updateData(path, value) {
        const parts = path.split('.');
        let current = this._data;

        // 确保路径上的所有对象都存在
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        // 设置值
        current[parts[parts.length - 1]] = value;
        this._notifyListeners();
    }

    /**
     * 删除指定路径的数据
     * @param {string} path - 点分隔的路径
     */
    deleteData(path) {
        const parts = path.split('.');

        // 处理边缘情况
        if (parts.length === 0) return;

        // 根级别删除的简化处理
        if (parts.length === 1) {
            delete this._data[parts[0]];
            this._notifyListeners();
            return;
        }

        // 找到目标的父对象
        const parentPath = parts.slice(0, -1);
        let parent = this._getObjectAtPath(parentPath);
        if (!parent) return;

        // 获取要删除的键
        const lastKey = parts[parts.length - 1];

        // 根据父对象类型执行删除操作
        this._deleteFromParent(parent, lastKey);

        // 清理删除后产生的空对象
        this._cleanupEmptyObjects(parentPath);

        this._notifyListeners();
    }

    /**
     * 获取指定路径的对象
     * @param {Array<string>} pathParts - 路径部分数组
     * @return {Object|null} 找到的对象或null
     * @private
     */
    _getObjectAtPath(pathParts) {
        let current = this._data;

        for (const key of pathParts) {
            if (!(key in current)) {
                return null;
            }
            current = current[key];
        }

        return current;
    }

    /**
     * 根据父对象类型删除子元素
     * @param {Object|Array} parent - 父对象
     * @param {string|number} key - 要删除的键或索引
     * @private
     */
    _deleteFromParent(parent, key) {
        if (Array.isArray(parent)) {
            // 数组元素删除
            const index = parseInt(key, 10);
            if (!isNaN(index) && index >= 0 && index < parent.length) {
                parent.splice(index, 1);
            }
        } else if (parent && typeof parent === 'object') {
            // 对象属性删除
            delete parent[key];
        }
    }

    /**
     * 从指定路径开始，清理空对象和数组
     * @param {Array<string>} pathParts - 路径部分数组
     * @private
     */
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

        // 检查当前对象是否为空并清理
        if (this._isObjectEmpty(current) && parent && lastKey) {
            delete parent[lastKey];
            // 递归清理上一级
            this._cleanupEmptyObjects(pathParts.slice(0, -1));
        }
    }

    /**
     * 检查对象是否为空
     * @param {*} obj - 要检查的对象
     * @return {boolean} 是否为空
     * @private
     */
    _isObjectEmpty(obj) {
        // 非对象类型不视为空
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        // 空数组视为空
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }

        // 无属性的对象视为空
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return true;
        }

        // 有name或id属性的对象不视为空
        if (obj.name !== undefined || obj.id !== undefined) {
            return false;
        }

        // 其他情况视为空
        return keys.length === 0;
    }

    // ===== 事件处理方法 =====

    /**
     * 添加数据变更监听器
     * @param {Function} callback - 回调函数，接收data作为参数
     */
    addListener(callback) {
        this._listeners.add(callback);
    }

    /**
     * 移除数据变更监听器
     * @param {Function} callback - 要移除的回调函数
     */
    removeListener(callback) {
        this._listeners.delete(callback);
    }

    /**
     * 通知所有监听器数据已更新
     * @private
     */
    _notifyListeners() {
        this._listeners.forEach(callback => callback(this._data));
    }

    // ===== 树渲染方法 =====

    /**
     * 渲染完整树结构
     */
    render() {
        this._saveExpandedState();
        if (!this._treeContainer) return;

        this._treeContainer.innerHTML = '';
        const treeList = document.createElement('ul');
        treeList.className = 'tree-view';

        // 处理顶层类别
        Object.entries(this._data).forEach(([category, value]) => {
            const item = this._createTreeItem(category, value, category);
            treeList.appendChild(item);
        });

        this._treeContainer.appendChild(treeList);
    }

    // 处理文档点击事件，用于取消高亮
    _handleDocumentClick(event) {
        // 如果点击的不是树节点，则清除高亮
        if (!event.target.closest('.tree-text')) {
            this._removeHighlight();
        }
    }

    // 移除当前高亮
    _removeHighlight() {
        if (this._currentHighlightedCell) {
            try {
                const cellView = this._currentHighlightedCell.findView(this._paper);
                if (cellView) {
                    highlighters.mask.remove(cellView, 'my-element-highlight');
                }
            } catch (e) {
                console.log('移除高亮失败:', e);
            }
            this._currentHighlightedCell = null;
        }
    }

    /**
     * 创建单个树节点
     * @param {string} name - 节点名称
     * @param {*} data - 节点数据
     * @param {string} nodePath - 节点路径
     * @return {HTMLElement} 创建的节点元素
     * @private
     */
    _createTreeItem(name, data, nodePath) {
        const listItem = document.createElement('li');
        listItem.className = 'tree-item';
        listItem.dataset.path = nodePath;

        // 创建标签容器
        const labelDiv = this._createLabelDiv(name, data, nodePath);
        listItem.appendChild(labelDiv);

        // 处理有子节点的情况
        if (this._hasChildren(data)) {
            const childList = this._createChildList(data, nodePath);

            if (childList.childNodes.length > 0) {
                listItem.appendChild(childList);

                // 添加展开/折叠功能
                const toggle = labelDiv.querySelector('.tree-toggle');
                this._setupToggleListener(toggle, labelDiv, childList, nodePath);

                // 如果节点之前是展开的，恢复展开状态
                if (this._expandedNodes.has(nodePath)) {
                    childList.style.display = 'block';
                    toggle.textContent = '▼';
                }
            }
        }

        return listItem;
    }

    /**
     * 创建节点的标签部分
     * @param {string} name - 节点名称
     * @param {*} data - 节点数据
     * @return {HTMLElement} 标签div元素
     * @private
     */
    _createLabelDiv(name, data, nodePath) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'tree-label';

        // 添加展开/折叠图标（如果有子节点）
        if (this._hasChildren(data)) {
            const toggle = document.createElement('span');
            toggle.className = 'tree-toggle';
            toggle.textContent = '▶';
            labelDiv.appendChild(toggle);
        }

        // 添加文本内容
        const text = document.createElement('span');
        text.className = 'tree-text';
        text.textContent = data.name || name;
        labelDiv.appendChild(text);

        // 添加点击事件处理，高亮对应图元
        text.addEventListener('click', (event) => {
            event.stopPropagation(); // 防止触发折叠事件
            const idPath = data.id || nodePath;

            // 先移除现有高亮
            this._removeHighlight();

            if (!idPath.includes('.')) {
                return;
            }

            // 尝试从路径中提取UUID格式的ID
            const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
            const uuidMatches = idPath.match(uuidPattern);

            if (uuidMatches && uuidMatches.length > 0) {
                const elementId = uuidMatches[0];
                const cell = this._graph.getCell(elementId);

                if (cell) {
                    const cellView = cell.findView(this._paper);
                    if (cellView) {
                        // 添加高亮并保存当前高亮的单元格
                        highlighters.mask.add(cellView, { selector: 'body' }, 'my-element-highlight', {
                            deep: true,
                            attrs: {
                                'stroke': '#FF4365',
                                'stroke-width': 3
                            }
                        });
                        this._currentHighlightedCell = cell;

                        // 滚动到元素位置
                        this._paperScroller.centerElement(cell);
                        // 打开Halo面板
                        createHalo(cellView, HALO_CONFIGS.basic);
                        // 打开属性面板
                        const inspectorContainer = document.getElementById('inspector');
                        if (getCurrentInspectors()){
                            inspectorContainer.style.display = 'none';
                        }
                        createInspector(cellView.model, inspectorContainer);
                    }
                }
            }
        });

        return labelDiv;
    }

    /**
     * 创建子节点列表
     * @param {*} data - 父节点数据
     * @param {string} parentPath - 父节点路径
     * @return {HTMLElement} 子节点ul元素
     * @private
     */
    _createChildList(data, parentPath) {
        const childList = document.createElement('ul');
        childList.className = 'tree-children';
        childList.style.display = 'none';

        this._buildChildNodes(childList, data, parentPath);

        return childList;
    }

    /**
     * 设置展开/折叠监听器
     * @param {HTMLElement} toggle - 展开/折叠图标
     * @param {HTMLElement} labelDiv - 标签容器
     * @param {HTMLElement} childList - 子列表元素
     * @param {string} nodePath - 节点路径
     * @private
     */
    _setupToggleListener(toggle, labelDiv, childList, nodePath) {
        labelDiv.addEventListener('click', () => {
            const isOpen = childList.style.display !== 'none';
            childList.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '▶' : '▼';

            // 更新展开状态
            if (isOpen) {
                this._expandedNodes.delete(nodePath);
            } else {
                this._expandedNodes.set(nodePath, true);
            }
        });
    }

    /**
     * 检查节点是否有子节点
     * @param {*} data - 节点数据
     * @return {boolean} 是否有子节点
     * @private
     */
    _hasChildren(data) {
        return data && typeof data === 'object' && (
            Array.isArray(data) ||
            (Object.keys(data).length > 0 &&
                Object.keys(data).some(k => k !== 'name' && k !== 'id'))
        );
    }

    /**
     * 构建子节点
     * @param {HTMLElement} parentList - 父列表元素
     * @param {*} data - 父节点数据
     * @param {string} parentPath - 父节点路径
     * @private
     */
    _buildChildNodes(parentList, data, parentPath) {
        if (Array.isArray(data)) {
            // 处理数组类型的子节点
            data.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    const nodePath = `${parentPath}.${index}`;
                    const node = this._createTreeItem(item.name || `Item ${index}`, item, nodePath);
                    parentList.appendChild(node);
                }
            });
        } else if (data && typeof data === 'object') {
            // 处理对象类型的子节点
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'name' && key !== 'id') {
                    const nodePath = `${parentPath}.${key}`;
                    const node = this._createTreeItem(key, value, nodePath);
                    parentList.appendChild(node);
                }
            });
        }
    }

    /**
     * 保存当前节点的展开状态
     * @private
     */
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
}

export var menuTreeManager = null;

// 初始化菜单树管理器
export function NewMenuTreeManager(graph, paper, paperScroller, initialData, menuTreeContainer) {
    menuTreeManager = new MenuTreeManager(graph, paper, paperScroller, initialData, menuTreeContainer);
    menuTreeManager.render();
    menuTreeManager.addListener(() => {
        menuTreeManager.render();
    });
}




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