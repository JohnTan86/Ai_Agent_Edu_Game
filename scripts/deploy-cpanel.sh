#!/usr/bin/env bash
set -e

# ==============================================================================
# RoboFlow cPanel 一键 SSH / SCP 自动部署脚本
# 用法:
#   ./scripts/deploy-cpanel.sh <cPanel用户名@服务器地址> <子域名目录路径> [SSH端口]
# 示例:
#   ./scripts/deploy-cpanel.sh myuser@yourdomain.com ~/agent.yourdomain.com 22
# ==============================================================================

REMOTE_HOST="$1"
REMOTE_DIR="$2"
SSH_PORT="${3:-22}"

if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_DIR" ]; then
  echo "用法: ./scripts/deploy-cpanel.sh <cPanel用户名@服务器IP或域名> <子域名远程目录> [SSH端口(默认22)]"
  echo "示例: ./scripts/deploy-cpanel.sh user@example.com ~/agent.example.com 22"
  exit 1
fi

echo "📦 正在检查 cPanel 构建产物..."
if [ ! -f "roboflow-cpanel.zip" ]; then
  node scripts/build-cpanel.mjs
fi

echo "🚀 正在通过 SCP 上传 roboflow-cpanel.zip 到 ${REMOTE_HOST}:${REMOTE_DIR} (端口 ${SSH_PORT})..."
ssh -p "$SSH_PORT" "$REMOTE_HOST" "mkdir -p ${REMOTE_DIR}"
scp -P "$SSH_PORT" roboflow-cpanel.zip "${REMOTE_HOST}:${REMOTE_DIR}/roboflow-cpanel.zip"

echo "📂 正在远程解压并激活站点..."
ssh -p "$SSH_PORT" "$REMOTE_HOST" "cd ${REMOTE_DIR} && unzip -o roboflow-cpanel.zip && rm -f roboflow-cpanel.zip"

echo "✅ 部署完成！你的学生现在可以直接访问你的 Subdomain 开始上课了！"
