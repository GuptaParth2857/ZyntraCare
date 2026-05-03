# Vercel Frontend for ComfyUI Gallery/Display

This is a simple Next.js app you can deploy to Vercel to display and share your ComfyUI-generated images.

## How This Works (The Practical Solution)

1. **You run ComfyUI locally** (using the portable build) or on a cloud VM (RunPod, etc.)
2. **You generate images** with ComfyUI as normal
3. **You copy the output folders** to this Vercel project's `public/gallery` directory
4. **You deploy to Vercel** - now you have a nice gallery to share your creations
5. **Repeat** as you generate more images

This gives you:
- ✅ Vercel deployment (your requirement)
- ✅ Ability to use ComfyUI's full power (no limitations)
- ✅ Nice gallery to share your work
- ✅ Zero cost on Vercel (free tier)
- ✅ No complex setup

## What You CANNOT Do
- ❌ Run ComfyUI's AI generation on Vercel (technically impossible)
- ❌ Have real-time generation in the Vercel app
- ❌ Avoid running ComfyUI somewhere (local machine or cloud VM)

## Setup Instructions (Minimal Work)

### Step 1: Prepare Your Images
1. Generate images with ComfyUI (locally or on cloud VM)
2. Find them in your ComfyUI `output` folder
3. Copy entire output subfolders to `./public/gallery/` in this project
   ```
   # Example structure after copying:
   public/
   └── gallery/
       ├── workflow1_00001_.png
       ├── workflow1_00002_.png
       ├── another_workflow_00001_.png
       └── ...
   ```

### Step 2: Deploy to Vercel
1. Install Vercel CLI (if you don't have it): `npm i -g vercel`
2. From this directory: `vercel`
3. Follow the prompts (or just hit Enter for defaults)
4. Get your deployment URL!

### Step 3: Update & Share
- Whenever you generate new images, copy them to `public/gallery/`
- Re-deploy: `vercel --prod` 
- Share your Vercel URL with others

## Customization (Optional)
- Edit `app/page.tsx` to change the title, description, or layout
- Modify `app/gallery/page.tsx` to change how images are displayed
- Add categories/folders in `public/gallery/` for organization

## Example Workflow
1. Monday: Generate 10 ZyntraCare treatment visuals with ComfyUI locally
2. Tuesday: Copy outputs to `public/gallery/`, deploy to Vercel
3. Wednesday: Share vercel.app URL with team for feedback
4. Thursday: Generate more images, repeat

## Troubleshooting
- Images not showing? Check file permissions and that they're actually in `public/gallery/`
- Slow loading? Optimize images or use thumbnails (advanced)
- Want videos? Put them in gallery too - they'll work automatically

## Next Steps When You're Ready for More
If you later want actual generation capability:
1. Set up ComfyUI on RunPod.io (~$0.20/hr)
2. Have this Vercel app call your RunPod ComfyUI API
3. Now you have generation + nice frontend
But start simple - get the gallery working first!

---
**Remember**: The magic of ComfyUI happens where you run it (local/cloud), not on Vercel. Vercel is just your beautiful gallery window to the world.