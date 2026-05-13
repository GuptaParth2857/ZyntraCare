# Simple ComfyUI Setup Guide

## The Easiest Way to Use ComfyUI (Local First)

1. **Download Portable Build**
   Go to: https://github.com/comfyanonymous/ComfyUI/releases/latest
   Download: `ComfyUI_windows_portable_nvidia_or_cpu.7z`

2. **Extract**
   - Right-click the .7z file → 7-Zip → Extract to 'ComfyUI_Portable'
   - (Install 7-Zip from https://www.7-zip.org/ if needed)

3. **Run It**
   - Open the 'ComfyUI_Portable' folder
   - Double-click `run_cpu.bat`
   - Wait for it to start (first time takes 2-5 minutes)
   - A browser window will open automatically at http://127.0.0.1:8188

4. **Use It**
   - Drag & drop workflow JSON files onto the canvas
   - Click 'Queue Prompt' to generate images
   - Find outputs in the 'output' folder

## If You Still Want Vercel Deployment...

You CAN deploy a simple frontend to Vercel that:
- Shows your generated images (from local ComfyUI)
- Lets you download/share results
- But the actual AI generation still happens on your local machine

For true serverless AI generation on Vercel:
- Use APIs like Replicate or Hugging Face instead of ComfyUI