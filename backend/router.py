from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # 导入 CORS 扩展
import json
import os

# 创建Flask应用实例
app = Flask(__name__)

# 添加 CORS 支持 - 允许跨域请求
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# 根路由
@app.route("/")
def home():
    return "欢迎使用 UML2FPP !"


# 获取所有组件名称
@app.route("/component_lib", methods=["GET"])
def get_components():
    try:
        # 读取索引文件
        with open("component_lib/index.json", "r", encoding="utf-8") as file:
            index_data = json.load(file)

        # 提取所有组件名称
        component_names = [
            component["name"] for component in index_data.get("Components", [])
        ]

        return jsonify({"status": "success", "components": component_names})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 添加新组件
@app.route("/component_lib", methods=["POST"])
def add_component():
    try:
        # 获取用户提交的组件数据
        component_data = request.json

        # 验证必要字段
        if not component_data or "name" not in component_data:
            return jsonify({"status": "error", "message": "缺少必要的组件信息"}), 400

        component_name = component_data["name"]

        # 读取现有的索引文件
        with open("component_lib/index.json", "r", encoding="utf-8") as file:
            index_data = json.load(file)

        # 检查组件名称是否已存在
        if any(
            component["name"] == component_name
            for component in index_data.get("Components", [])
        ):
            return (
                jsonify(
                    {"status": "error", "message": f"组件名称 {component_name} 已存在"}
                ),
                409,
            )

        # 为新组件生成文件名和路径
        component_filename = f"{component_name.lower().replace(' ', '_')}.json"
        relative_path = f"components/{component_filename}"
        full_path = os.path.join("component_lib", relative_path)

        # 确保目标目录存在
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        # 将组件数据保存到文件
        with open(full_path, "w", encoding="utf-8") as file:
            json.dump(component_data, file, ensure_ascii=False, indent=4)

        # 更新索引文件
        new_component_entry = {"name": component_name, "path": relative_path}
        index_data.setdefault("Components", []).append(new_component_entry)

        with open("component_lib/index.json", "w", encoding="utf-8") as file:
            json.dump(index_data, file, ensure_ascii=False, indent=4)

        return jsonify(
            {
                "status": "success",
                "message": f"组件 {component_name} 已成功添加",
                "component": new_component_entry,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 获取特定组件详情
@app.route("/component_lib/<component_name>", methods=["GET"])
def get_component_detail(component_name):
    try:
        # 读取索引文件
        with open("component_lib/index.json", "r", encoding="utf-8") as file:
            index_data = json.load(file)

        # 查找对应组件
        component = next(
            (
                c
                for c in index_data.get("Components", [])
                if c["name"] == component_name
            ),
            None,
        )

        if not component:
            return (
                jsonify(
                    {"status": "error", "message": f"组件 {component_name} 不存在"}
                ),
                404,
            )

        # 读取组件文件
        component_path = os.path.join("component_lib", component["path"])
        with open(component_path, "r", encoding="utf-8") as file:
            component_data = json.load(file)

        return jsonify({"status": "success", "data": component_data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 获取图片
@app.route("/image/<path:image_name>", methods=["GET"])
def get_image(image_name):
    try:
        # 假设图片存储在 images 目录下，根据需要调整路径
        images_directory = "image"

        # 检查图片是否存在
        image_path = os.path.join(images_directory, image_name)
        if not os.path.isfile(image_path):
            return (
                jsonify({"status": "error", "message": f"图片 {image_name} 不存在"}),
                404,
            )

        # 返回图片文件
        return send_from_directory(images_directory, image_name)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 启动应用
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
