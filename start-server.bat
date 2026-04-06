@echo off
echo.
echo =========================================
echo   CASS BEAUTY — Servidor Local
echo =========================================
echo.
echo Iniciando servidor en el puerto 8080...
echo.

:: Obtener IP local para el iPad
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169.254"') do (
  set IP=%%a
  goto :found
)
:found
set IP=%IP: =%

echo Servidor corriendo en:
echo.
echo   http://localhost:8080        (esta PC)
echo   http://%IP%:8080     (iPad en la misma red WiFi)
echo.
echo Abre la URL del iPad en Safari para usar los formularios.
echo.
echo Presiona CTRL+C para detener el servidor.
echo.

cd /d "%~dp0"
python -m http.server 8080

pause
