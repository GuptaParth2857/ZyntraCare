#!/usr/bin/env pwsh
$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri "https://github.com/comfyanonymous/ComfyUI/releases/latest/download/ComfyUI_windows_portable_nvidia_or_cpu.7z" -OutFile "ComfyUI_windows_portable_nvidia_or_cpu.7z"
7z x ComfyUI_windows_portable_nvidia_or_cpu.7z
Set-Location ComfyUI
.\run_cpu.bat
