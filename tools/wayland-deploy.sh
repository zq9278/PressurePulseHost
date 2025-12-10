#!/bin/bash

echo "=========================================="
echo "Wayland Kiosk模式部署 - 启用GPU加速"
echo "=========================================="

# 配置变量
USERNAME="orin-nano"
APP_PATH="/home/${USERNAME}/PressurePulseHostController_electron"

echo "用户名: ${USERNAME}"
echo "应用路径: ${APP_PATH}"
echo ""

# 1. 安装Wayland组件
echo "步骤1: 安装Wayland和Weston..."
apt update
apt install -y weston wayland-protocols libwayland-dev

# 2. 创建Weston配置文件
echo "步骤2: 配置Weston（Wayland合成器）..."
mkdir -p /home/${USERNAME}/.config
cat > /home/${USERNAME}/.config/weston.ini << EOF
[core]
# 使用DRM后端（直接访问GPU）
backend=drm-backend.so
require-input=false

[shell]
# Kiosk模式
locking=false
panel-position=none

[output]
name=all
mode=preferred
# 黑色背景
background-color=0xFF000000

[keyboard]
keymap_layout=us

[libinput]
enable-tap=false
EOF

chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.config

# 3. 创建Wayland会话启动脚本
echo "步骤3: 创建Wayland会话脚本..."
cat > /home/${USERNAME}/.wayland-session << EOF
#!/bin/bash

# 日志记录
exec >> /tmp/wayland-session.log 2>&1
echo "=== Wayland Session Starting \$(date) ==="

# 设置Wayland环境变量
export XDG_RUNTIME_DIR=/run/user/\$(id -u)
export XDG_SESSION_TYPE=wayland
export WAYLAND_DISPLAY=wayland-0

# 启动Weston合成器（后台运行）
echo "Starting Weston..."
weston --backend=drm-backend.so &
WESTON_PID=\$!
echo "Weston PID: \$WESTON_PID"

# 等待Weston启动
sleep 2

# 启动Electron应用（启用GPU加速）
cd ${APP_PATH}
echo "Starting Electron with GPU acceleration..."

# Wayland下的Electron启动参数
export ELECTRON_OZONE_PLATFORM_HINT=wayland
npm start -- \
  --enable-features=UseOzonePlatform \
  --ozone-platform=wayland \
  --enable-gpu-rasterization \
  --enable-zero-copy

echo "App exited with code: \$?"
EOF

chmod +x /home/${USERNAME}/.wayland-session
chown ${USERNAME}:${USERNAME} /home/${USERNAME}/.wayland-session

# 4. 创建Wayland会话定义
echo "步骤4: 创建Wayland会话定义..."
cat > /usr/share/wayland-sessions/kiosk-wayland.desktop << EOF
[Desktop Entry]
Name=Kiosk Wayland
Comment=Wayland kiosk session with GPU acceleration
Exec=/home/${USERNAME}/.wayland-session
Type=Application
DesktopNames=Kiosk-Wayland
EOF

# 5. 配置lightdm使用Wayland会话
echo "步骤5: 配置lightdm..."
cat > /etc/lightdm/lightdm.conf.d/50-autologin.conf << EOF
[Seat:*]
autologin-user=${USERNAME}
autologin-user-timeout=0
# 使用Wayland会话
user-session=kiosk-wayland
EOF

# 6. 清理旧配置
echo "步骤6: 清理旧配置..."
systemctl disable electron-dev.service 2>/dev/null
systemctl disable electron-kiosk.service 2>/dev/null
systemctl stop electron-dev.service 2>/dev/null
systemctl stop electron-kiosk.service 2>/dev/null

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "Wayland优势："
echo "  ✓ 原生GPU加速支持"
echo "  ✓ 更好的图形性能"
echo "  ✓ 更低的延迟"
echo "  ✓ 适合嵌入式设备"
echo ""
echo "配置文件："
echo "  - Weston配置: /home/${USERNAME}/.config/weston.ini"
echo "  - 会话脚本: /home/${USERNAME}/.wayland-session"
echo "  - 会话定义: /usr/share/wayland-sessions/kiosk-wayland.desktop"
echo ""
echo "日志文件："
echo "  - 会话日志: /tmp/wayland-session.log"
echo ""
echo "调试命令："
echo "  - 查看日志: cat /tmp/wayland-session.log"
echo "  - 查看进程: ps aux | grep -E 'weston|electron'"
echo "  - 检查GPU: cat /sys/kernel/debug/dri/0/name"
echo ""
echo "重启系统生效: reboot"
echo ""
echo "注意："
echo "  - Wayland需要直接访问GPU设备"
echo "  - 确保用户在video组: usermod -a -G video ${USERNAME}"
echo "  - RK3576的Mali GPU应该能被正确识别"
echo "=========================================="

# 7. 确保用户在video组
echo "步骤7: 添加用户到video组..."
usermod -a -G video ${USERNAME}

echo ""
echo "部署完成！请重启系统测试。"