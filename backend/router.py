from flask import Flask, request, jsonify
from flask_cors import CORS  # 导入 CORS 扩展
import json
import os

# 创建Flask应用实例
app = Flask(__name__)
# 添加 CORS 支持 - 允许跨域请求
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# 根路由
@app.route('/')
def home():
    return "欢迎使用 UML2FPP !"

# 获取所有组件名称
@app.route('/component_lib', methods=['GET'])
def get_components():
    try:
        # 读取索引文件
        with open('component_lib/index.json', 'r', encoding='utf-8') as file:
            index_data = json.load(file)
        
        # 提取所有组件名称
        component_names = [component['name'] for component in index_data.get('Components', [])]
        
        return jsonify({
            'status': 'success',
            'components': component_names
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 获取特定组件详情
@app.route('/component_lib/<component_name>', methods=['GET'])
def get_component_detail(component_name):
    try:
        # 读取索引文件
        with open('component_lib/index.json', 'r', encoding='utf-8') as file:
            index_data = json.load(file)
        
        # 查找对应组件
        component = next((c for c in index_data.get('Components', []) if c['name'] == component_name), None)
        
        if not component:
            return jsonify({
                'status': 'error',
                'message': f'组件 {component_name} 不存在'
            }), 404
        
        # 读取组件文件
        component_path = os.path.join('component_lib', component['path'])
        with open(component_path, 'r', encoding='utf-8') as file:
            component_data = json.load(file)
        
        return jsonify({
            'status': 'success',
            'data': component_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 启动应用
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)