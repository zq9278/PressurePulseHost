#!/bin/bash

echo "=========================================="
echo "RK3576 Electron Kiosk 部署脚本"
echo "=========================================="

# 配置变量（根据实际情况修改）
USERNAME="orin-nano"
APP_PATH="/home/${USERNAME}/PressurePulseHostController_electron"
START_COMMAND="npm start"

echo "用户名: ${USERNAME}"
echo "应用路径: ${APP_PATH}"
echo "启动命令: ${START_COMMAND}"
echo ""

# 1. 创建X会话启动脚本
echo "步骤1: 创建.xsession文件..."
cat > /home/${USERNAME}/.xsession << EOF
#!/bin/bash

# 重定向日志（用于调试）
exec >> /tmp/xsession.log 2>&1
echo "=== X Session Starting \$(date) ==="

# 立即设置黑色背景（减少白屏）
xsetroot -solid black &

# 禁用屏幕保护和电源管理
xset s off &
xset -dpms &
xset s noblank &

# 隐藏鼠标光标
unclutter -idle 0.1 -root &

# 启动轻量级窗口管理器（后台运行）
openbox &

# 减少等待时间，快速启动Electron
# sleep 0.5

# 切换到应用目录并启动
cd ${APP_PATH}
echo "Starting Electron at \$(date)..."

# 启动Electron应用
${START_COMMAND}
echo "App exited with code: \$?"
EOF

chmod +x /home/${USERNAME}/.xsession
chown ${USERNAME}:${USERNAME} /home/${USERNAME}/.xsession

# 2. 创建kiosk会话配置
echo "步骤2: 创建kiosk会话文件..."
cat > /usr/share/xsessions/kiosk.desktop << "EOF"
[Desktop Entry]
Name=Kiosk
Comment=Minimal kiosk session for Electron
Exec=/home/orin-nano/.xsession
Type=Application
DesktopNames=Kiosk
EOF

# 3. 配置lightdm自动登录
echo "步骤3: 配置lightdm自动登录..."
cat > /etc/lightdm/lightdm.conf.d/50-autologin.conf << EOF
[Seat:*]
autologin-user=${USERNAME}
autologin-user-timeout=0
autologin-session=kiosk
EOF

# 4. 安装必要软件
echo "步骤4: 安装必要软件..."
apt update
apt install -y openbox unclutter

# 5. 清理旧配置
echo "步骤5: 清理旧配置..."
systemctl disable electron-dev.service 2>/dev/null
systemctl disable electron-kiosk.service 2>/dev/null
systemctl stop electron-dev.service 2>/dev/null
systemctl stop electron-kiosk.service 2>/dev/null
rm -f /home/${USERNAME}/.xinitrc-kiosk 2>/dev/null
rm -f /home/${USERNAME}/.config/autostart/electron-app.desktop 2>/dev/null
rm -f /home/${USERNAME}/start-electron.sh 2>/dev/null

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "配置文件位置："
echo "  - X会话脚本: /home/${USERNAME}/.xsession"
echo "  - 会话配置: /usr/share/xsessions/kiosk.desktop"
echo "  - Lightdm配置: /etc/lightdm/lightdm.conf.d/50-autologin.conf"
echo ""
echo "日志文件："
echo "  - X会话日志: /tmp/xsession.log"
echo "  - X错误日志: /home/${USERNAME}/.xsession-errors"
echo ""
echo "调试命令："
echo "  - 查看会话日志: cat /tmp/xsession.log"
echo "  - 查看错误日志: cat /home/${USERNAME}/.xsession-errors"
echo "  - 查看进程: ps aux | grep -E 'electron|npm|openbox'"
echo "  - 重启lightdm: systemctl restart lightdm"
echo ""
echo "重启系统生效: reboot"
echo "=========================================="
