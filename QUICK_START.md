# 🚀 Quick Start Guide

## Your LORA Tagger is Ready!

The application is currently running at: **http://localhost:5173**

## How to Use

### 1. Open the App
Simply open your browser to: http://localhost:5173

### 2. Select Your Image Directory
- **Type the full path** to your image folder in the text box
  - Example: `/Users/leefu/Pictures/my-images`
  - Example: `/Users/leefu/Desktop/training-data`
  
- **Or use Quick Access buttons:**
  - Desktop
  - Documents  
  - Pictures
  - Downloads

### 3. Configure Options
- ✅ Check "Include subfolders" if you want to scan nested directories
- Leave unchecked to only scan the main directory

### 4. Load Images
- Click the **"Load Images"** button
- The app will:
  - Find all images (jpg, jpeg, png, gif, bmp, webp)
  - Create `.txt` files next to each image (if they don't exist)
  - Display images with their tags

### 5. Tag Your Images
- Each image shows its tags as colorful "pills"
- **Remove a tag**: Click the ✕ on any tag pill
- **Add a tag**: Click "+ Add Tag" and type the new tag
- **Changes save instantly!** No save button needed

### 6. Search Images
- Use the search box to filter by filename or tags
- See how many images match your search

## Tips

💡 **Tags are saved in `.txt` files** next to your images  
💡 **Tags are comma-separated** (e.g., "portrait, female, outdoor")  
💡 **No need to move files** - tag images where they are!  
💡 **Changes are instant** - every edit saves immediately  

## Commands

### Stop the App
```bash
cd /Users/leefu/Documents/LoraShiba
docker-compose down
```

### Start the App Again
```bash
cd /Users/leefu/Documents/LoraShiba
docker-compose up -d
```

### View Logs (if something goes wrong)
```bash
cd /Users/leefu/Documents/LoraShiba
docker-compose logs -f
```

### Rebuild After Code Changes
```bash
cd /Users/leefu/Documents/LoraShiba
docker-compose down
docker-compose up --build -d
```

## What's Running?

- **Frontend**: http://localhost:5173 (React app)
- **Backend**: http://localhost:3001 (API server)
- **Docker**: 2 containers running in the background

## Example Directory Paths

✅ `/Users/leefu/Pictures/lora-training`  
✅ `/Users/leefu/Desktop/images`  
✅ `/Users/leefu/Documents/dataset/photos`  
✅ `/Users/leefu/Downloads/image-batch`  

❌ `/mnt/external-drive` (not mounted)  
❌ `/tmp/images` (not in home directory)  

## Need Help?

Check the full README.md for detailed information and troubleshooting.

---

**Happy Tagging! 🎨**
