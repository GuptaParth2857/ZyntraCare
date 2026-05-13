# ComfyUI Setup Instructions for Windows

Due to environment restrictions, the automated setup encountered issues. Please follow these manual steps:

## Option 1: Portable Build (Recommended)
1. Download the latest portable build from:
   https://github.com/comfyanonymous/ComfyUI/releases/latest
2. Choose one of:
   - `ComfyUI_windows_portable_nvidia_or_cpu.7z` (works on CPU or NVIDIA GPU)
   - `ComfyUI_windows_portable_nvidia.7z` (NVIDIA GPU only)
   - `ComfyUI_windows_portable_amd.7z` (AMD GPU)
3. Extract the 7z file using 7-Zip (https://www.7-zip.org/) or Windows Explorer
4. Navigate to the extracted folder
5. Double-click:
   - `run_cpu.bat` for CPU-only mode
   - `run_nvidia_gpu.bat` for NVIDIA GPU mode

## Option 2: Manual Setup (If you prefer)
1. Install Visual C++ Redistributable for Visual Studio 2015-2022:
   https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Create a fresh virtual environment:
   ```powershell
   python -m venv comfyui_venv
   .\comfyui_venv\Scripts\Activate.ps1
   ```
3. Install PyTorch CPU version:
   ```powershell
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   ```
4. Clone ComfyUI (if you haven't already):
   ```powershell
   git clone https://github.com/comfyanonymous/ComfyUI
   cd ComfyUI
   ```
5. Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```
6. Run ComfyUI in CPU mode:
   ```powershell
   python main.py --cpu
   ```

## Troubleshooting
- If you get DLL errors, reinstall the VC++ redistributable
- Ensure you have Windows 10 or later with updates
- For GPU usage, ensure drivers are up to date
- The portable builds include everything needed and are tested

## Notes
- The portable build is ~1.5-2GB when extracted
- First run may take several minutes to initialize
- Models are stored in the `models` subdirectory
- Outputs go to the `output` subdirectory