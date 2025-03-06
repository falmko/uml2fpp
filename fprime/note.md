## 修改用户权限

```bash
sudo chown -R $USER:$USER /workspace
```

## 下载
```bash
mkdir Fprime
cd Fprime
pip install fprime-bootstrap
fprime-bootstrap project
```
## Hello World
Hello World Tutorial `https://fprime-community.github.io/fprime-tutorial-hello-world/`
## 构建新的 F' 项目
```bash
cd $your_project
# in MyProject/ 激活虚拟环境
. fprime-venv/bin/activate
# 退出虚拟环境
deactivate

# 第一次需要更新Python包
pip install --upgrade setuptools
# 为项目/部署设置构建环境
fprime-util generate
fprime-util build
```
### 创建组件
```bash
# In: MyProject
cd Components
ls
# HelloWorld.fpp：组件的设计模型
# HelloWorld.hpp 和 HelloWorld.cpp：C++组件的实现文件，当前为空。
# CMakeList.txt：构建组件的定义。
# docs 文件夹来放置组件文档
# In: MyProject/Components
fprime-util new --component
#  generate a basic implementation 
fprime-util impl
# HelloWorld.template.hpp HelloWorld.hpp
# HelloWorld.template.cpp HelloWorld.cpp
mv HelloWorld.template.hpp HelloWorld.hpp
mv HelloWorld.template.cpp HelloWorld.cpp
```
### 创建新部署
```bash
fprime-util new --deployment
# In: MyProject/HelloWorldDeployment
fprime-util build -j6 # 定义好fpp文件并impl后可运行该命令验证是否有问题再进行下一步
```
#### 使用 fprime-gds 运行
```bash
fprime-gds
fprime-gds  --ip-client 
```
#### 单元测试
```CMakeLists.txt
set(UT_SOURCE_FILES
    "${CMAKE_CURRENT_LIST_DIR}/Led.fpp"
)
set(UT_AUTO_HELPERS ON) # Additional Unit-Test autocoding
register_fprime_ut()
```
```bash
#生成测试模板
#In led-blinker/Components/Led
fprime-util generate --ut
```

### 实现步骤
1. 定义组件
    在fpp中声明组件的命令、事件、端口、参数等
2. 实现组件