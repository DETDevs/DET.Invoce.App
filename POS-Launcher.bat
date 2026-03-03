@echo off
title DET Invoice POS - Modo Kiosko
echo ========================================
echo   DET Invoice POS - Impresion Silenciosa
echo ========================================
echo.
echo Cerrando instancias de Chrome existentes...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Abriendo Chrome con impresion directa...
echo Impresora predeterminada: MUNBYN_USB
echo.

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=http://localhost:5174

echo Chrome abierto en modo POS.
echo La impresion ira directo a la impresora predeterminada.
echo.
echo Para cambiar la impresora, ve a:
echo   Configuracion de Windows ^> Impresoras ^> Impresora predeterminada
echo.
pause
