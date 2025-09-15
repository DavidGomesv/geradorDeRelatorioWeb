@echo off
REM Script para testar a aplicação localmente no Windows

echo 🚀 Iniciando servidor local para teste...
echo 📱 Acesse no celular: http://SEU_IP:8000
echo 💻 Ou no computador: http://localhost:8000
echo.
echo 🔌 Para testar offline: após carregar, desconecte da internet
echo 📱 Para testar PWA: use Chrome e adicione à tela inicial
echo.
echo ⚠️  Para parar o servidor: Ctrl+C
echo.

REM Tentar Python 3 primeiro, depois Python 2
python -m http.server 8000 2>nul || python -m SimpleHTTPServer 8000 2>nul || (
    echo ❌ Python não encontrado. Instale Python ou use outro servidor web.
    pause
)