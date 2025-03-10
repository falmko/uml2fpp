import { ui, dia } from '@joint/plus';
import { portColors } from '../shapes/port';
import { InspectorConfigs } from './inspector_configs';

/**
 * InspectorManager - 属性检查器管理类
 * 负责创建和管理所有Inspector实例
 */
class InspectorManager {
    /**
     * 构造函数
     * @param {Object} paper - JointJS paper对象
     * @param {HTMLElement} container - Inspector容器元素 
     */
    constructor(paper, container) {
        this.paper = paper;
        this.container = container;
        this.currentInspector = null;

        // 初始化事件监听器
        this._setupEventListeners();
    }

    /**
     * 设置Inspector相关的所有事件监听器
     * @private
     */
    _setupEventListeners() {
        // 点击元素时创建inspector
        this.paper.on('element:pointerclick', (elementView, evt) => {
            if (this.currentInspector) {
                this.container.style.display = 'none';
            }
            this.createInspector(elementView.model);
        });

        // 点击空白处隐藏inspector
        this.paper.on('blank:pointerclick', () => {
            this.hideInspector();
        });

        // Tab切换事件监听
        this.container.addEventListener('click', (evt) => {
            if (evt.target.classList.contains('inspector-tab-button')) {
                this.openTab(evt.target.dataset.inspector);
            }
        });
    }

    /**
     * 清空并隐藏Inspector
     */
    hideInspector() {
        this.container.style.display = 'none';
        this.container.innerHTML = '';
        this.currentInspector = null;
    }

    /**
     * 根据元素类型创建适当的Inspector
     * @param {Object} cell - JointJS cell对象
     * @returns {Object|null} 创建的Inspector对象或null
     */
    createInspector(cell) {
        if (!cell) return null;

        const classType = cell.get('classType') || cell.get('type');
        const config = InspectorConfigs[classType];
        if (!config) return null;

        // 清空容器
        this.container.innerHTML = '';

        // 创建UI组件
        this._createTabButtons(config.tabs);
        const inspectors = this._createTabContents(config, cell);

        // 显示Inspector并激活第一个标签
        this.container.style.display = 'block';
        this.openTab(`inspector-${config.tabs[0]}`);

        this.currentInspector = inspectors;
        return inspectors;
    }

    /**
     * 创建标签页按钮
     * @param {Array} tabs - 标签页名称数组
     * @private
     */
    _createTabButtons(tabs) {
        const tabButtons = document.createElement('div');
        tabButtons.className = 'inspector-tabs';

        tabs.forEach(tabName => {
            const button = document.createElement('button');
            button.className = 'inspector-tab-button';
            button.dataset.inspector = `inspector-${tabName}`;
            button.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
            tabButtons.appendChild(button);
        });

        this.container.appendChild(tabButtons);
    }

    /**
     * 创建标签页内容
     * @param {Object} config - Inspector配置
     * @param {Object} cell - JointJS cell对象
     * @returns {Object} 创建的Inspector对象集合
     * @private
     */
    _createTabContents(config, cell) {
        const inspectors = {};

        config.tabs.forEach(tabName => {
            const tabContent = document.createElement('div');
            tabContent.id = `inspector-${tabName}`;
            tabContent.className = 'inspector-tab';
            this.container.appendChild(tabContent);

            const inspector = new ui.Inspector({
                cell: cell,
                inputs: config.inputs[tabName],
                groups: {
                    basic: { label: '基本属性', index: 1 },
                    advanced: { label: '高级属性', index: 2 }
                },
                operators: this._getCustomOperators()
            });

            inspector.render();
            tabContent.appendChild(inspector.el);
            inspectors[tabName] = inspector;
        });

        return inspectors;
    }

    /**
     * 获取自定义操作符
     * @returns {Object} 操作符对象
     * @private
     */
    _getCustomOperators() {
        return {
            kindequal: function (cell, value, prop, _valuePath) {
                const kindValue = cell.prop(_valuePath);
                return kindValue === prop;
            },
            notnull: function (cell, value, prop, _valuePath) {
                return value !== undefined && value !== null;
            }
        };
    }

    /**
     * 切换标签页
     * @param {string} tabName - 要显示的标签页ID
     */
    openTab(tabName) {
        // 切换标签页内容显示
        const tabs = document.getElementsByClassName('inspector-tab');
        Array.from(tabs).forEach(tab => {
            tab.style.display = tab.id === tabName ? 'block' : 'none';
        });

        // 切换按钮样式
        const buttons = document.getElementsByClassName('inspector-tab-button');
        Array.from(buttons).forEach(button => {
            button.classList.toggle('active', button.dataset.inspector === tabName);
        });
    }

    /**
     * 显示端口的Inspector
     * @param {Object} element - 包含端口的元素
     * @param {string} portId - 端口ID
     */
    showPortInspector(element, portId) {
        if (!element || !portId) return;

        const port = element.getPort(portId);
        if (!port) return;

        // 创建临时模型供Inspector使用
        const tempModel = this._createPortTempModel(port);
        if (!tempModel) return;

        // 准备Inspector容器
        this._preparePortInspectorContainer(port);

        // 创建Inspector
        this.createInspector(tempModel);

        // 监听属性变更
        this._setupPortChangeListener(tempModel, element, portId);

        // 显示Inspector
        this.container.style.display = 'block';
    }

    /**
     * 为端口创建临时模型
     * @param {Object} port - 端口对象
     * @returns {Object} 临时JointJS模型
     * @private
     */
    _createPortTempModel(port) {
        const classType = port.properties.classType;
        if (classType !== 'InputPort' && classType !== 'OutputPort') return null;

        return new dia.Cell({
            id: `port-${port.id}`,
            type: classType,
            classType: classType,
            ...JSON.parse(JSON.stringify(port.properties))
        });
    }

    /**
     * 准备端口Inspector容器
     * @param {Object} port - 端口对象
     * @private
     */
    _preparePortInspectorContainer(port) {
        // 清空容器
        this.container.innerHTML = '';

        // 添加标题
        const titleElem = document.createElement('div');
        titleElem.className = 'inspector-title';
        titleElem.textContent = `编辑端口: ${port.properties.name}`;
        this.container.appendChild(titleElem);
    }

    /**
     * 设置端口属性变更监听器
     * @param {Object} tempModel - 临时模型
     * @param {Object} element - 包含端口的元素
     * @param {string} portId - 端口ID
     * @private
     */
    _setupPortChangeListener(tempModel, element, portId) {
        tempModel.on('change', (model, opt) => {
            // 确保有有效的变更信息
            if (!opt || !opt.propertyPath || opt.propertyValue === undefined) return;

            // 更新端口属性
            element.portProp(portId, `properties/${opt.propertyPath}`, opt.propertyValue);

            // 处理特殊属性更新
            this._handleSpecialPortPropertyChange(element, portId, opt);
        });
    }

    /**
     * 处理端口特殊属性变更
     * @param {Object} element - 包含端口的元素
     * @param {string} portId - 端口ID
     * @param {Object} opt - 变更选项
     * @private
     */
    _handleSpecialPortPropertyChange(element, portId, opt) {
        const propertyPath = opt.propertyPath;
        const propertyValue = opt.propertyValue;

        if (propertyPath === 'name') {
            // 更新显示的标签
            element.portProp(portId, 'attrs/portLabel/text', propertyValue);
        } else if (propertyPath === 'kind') {
            // 更新端口颜色
            element.portProp(
                portId,
                'attrs/portBody/fill',
                portColors[propertyValue] || '#ff9580'
            );
        }
    }

    /**
     * 获取当前活动的Inspector实例
     * @returns {Object|null} 当前Inspector实例
     */
    getCurrentInspector() {
        return this.currentInspector;
    }

    /**
     * 设置当前活动的Inspector实例
     * @param {Object|null} inspectors - Inspector实例
     */
    setCurrentInspector(inspector) {
        this.currentInspector = inspector;
    }
}

// 存储所有创建的inspector管理器
const inspectorManagers = new Map();

/**
 * 获取指定paper的Inspector管理器实例
 * @param {Object} paper - JointJS paper对象
 * @returns {InspectorManager|null} Inspector管理器实例
 */
function getInspectorManager(paper) {
    if (!paper) {
        return inspectorManagers.size > 0 ? inspectorManagers.values().next().value : null;
    }
    return inspectorManagers.get(paper.cid || 'default');
}

/**
 * 初始化Inspector管理器
 * @param {Object} paper - JointJS paper对象
 * @param {HTMLElement} container - Inspector容器元素
 * @returns {InspectorManager} Inspector管理器实例
 */
export function newInspector(paper, container) {
    if (!paper || !container) {
        console.error('初始化Inspector失败: paper和container参数不能为空');
        return null;
    }
    const inspectorId = paper.cid || 'default';
    const manager = new InspectorManager(paper, container);
    inspectorManagers.set(inspectorId, manager);
    return manager;
}

/**
 * 根据元素类型创建适当的Inspector
 * @param {Object} cell - JointJS cell对象
 * @param {HTMLElement} container - 包含Inspector的DOM元素
 * @param {Object} paper - JointJS paper对象
 * @returns {Object|null} 创建的Inspector对象或null
 */
export function createInspector(cell, paper) {
    if (!cell || !paper) {
        console.error('创建Inspector失败: cell和paper参数不能为空');
        return null;
    }
    const manager = getInspectorManager(paper);
    return manager ? manager.createInspector(cell) : null;
}

/**
 *  隐藏Inspector
 *  @param {Object} paper - JointJS paper对象
 */
export function hideInspector(paper) {
    const manager = getInspectorManager(paper);
    if (manager) {
        manager.hideInspector();
    }
}

/**
 * 显示端口的Inspector
 * @param {Object} element - 包含端口的元素
 * @param {string} portId - 端口ID
 * @param {Object} paper - JointJS paper对象
 */
export function showPortInspector(element, portId, paper) {
    if (!element || !portId || !paper) {
        console.error('显示端口Inspector失败: 缺少必要参数');
        return;
    }
    const manager = getInspectorManager(paper);
    if (manager) {
        manager.showPortInspector(element, portId);
    }
}

/**
 * 销毁Inspector管理器实例
 * @param {Object} paper - JointJS paper对象
 * @returns {boolean} 是否成功销毁
 */
export function destroyInspector(paper) {
    if (!paper) return false;

    const inspectorId = paper.cid || 'default';
    return inspectorManagers.delete(inspectorId);
}
