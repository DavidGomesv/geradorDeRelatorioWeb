#!/bin/bash
# Script para testar a aplicação localmente

echo "🚀 Iniciando servidor local para teste..."
echo "📱 Acesse no celular: http://SEU_IP:8000"
echo "💻 Ou no computador: http://localhost:8000"
echo ""
echo "🔌 Para testar offline: após carregar, desconecte da internet"
echo "📱 Para testar PWA: use Chrome e adicione à tela inicial"
echo ""
echo "⚠️  Para parar o servidor: Ctrl+C"
echo ""

# Iniciar servidor Python simples
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Python não encontrado. Instale Python ou use outro servidor web."
fi