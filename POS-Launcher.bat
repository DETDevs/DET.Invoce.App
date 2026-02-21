@echo off
title DET Invoice POS - Modo Kiosko
echo ========================================
echo   DET Invoice POS - Impresion Silenciosa
echo ========================================
echo.
echo Abriendo Chrome con impresion directa...
echo Impresora predeterminada: MUNBYN_USB
echo.

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=http://localhost:5173

echo Chrome abierto en modo POS.
echo La impresion ira directo a la impresora predeterminada.
echo.
echo Para cambiar la impresora, ve a:
echo   Configuracion de Windows ^> Impresoras ^> Impresora predeterminada
echo.
pause
