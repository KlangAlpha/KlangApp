# KlangApp
Klang 桌面版本
```
git clone  https://github.com/KlangAlpha/KlangApp
cd KlangApp
git submodule init
git submodule update
```

### 一、Windows 系统需要安装nodejs
https://nodejs.org/en/download/

### 二、 安装库
```
cd KlangApp
npm install
```

### 三、 编译Klang
```
cd src/Klang
pip3  install -r requirements.txt
pip3 install pyinstaller
pyinstaller kws_manager.spec
pyinstaller kws_server.spec
pyinstaller download.spec
cd ../../
```

### 四、 启动

确保你在 KlangApp目录

Mac Linux
```
npm run gulp
npm run start
```
Windows系统
```
npm run gulp
npm run start:win
```

* python 和Klang依赖的安装在 App里已经实现

### 五、制作可执行程序和安装包
```
npm run make
```

注意这个需要依赖 wix set tools 工具，需要自己安装

Linux 下只保留了deb，如果需要生成rpm，把package.json里面deb改成 rpm
```

        {
          "name": "@electron-forge/maker-rpm",
          "config": {}
        }
```