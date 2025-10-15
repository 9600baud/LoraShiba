# 🏷️ LORA Tagger

A professional Dockerized LORA image tagging application for AI model training. Built with Node.js, Express, React, and TypeScript.

## 🎯 What It Does

LORA Tagger helps you efficiently tag images for machine learning model training by:
- Browsing any directory on your computer (no need to move files!)
- Scanning directories for images (with optional subfolder scanning)
- Automatically creating `.txt` files for each image (if they don't exist)
- Parsing and displaying comma-delimited tags as interactive pills
- Allowing easy tag addition/removal with immediate auto-save to text files
- Providing a clean, modern interface for managing hundreds of images

## 🚀 Quick Start

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running. If not:
```bash
open -a Docker
```

Wait for Docker to fully start (you'll see the Docker icon in your menu bar).

### Step 2: Start the Application

```bash
cd /Users/leefu/Documents/LoraShiba
docker-compose up --build
```

Wait for both services to start (you'll see "Server is running" and "VITE ready" messages).

### Step 3: Access the Application

Open your browser to:
```
http://localhost:5173
```

### Step 4: Tag Your Images

1. **Enter Directory Path**: Type or paste the full path to your image directory
   - Example: `/Users/leefu/Pictures/my-training-images`
   - Or use the quick access buttons (Desktop, Documents, Pictures, Downloads)
2. **Include Subfolders**: Check the box if you want to scan subdirectories
3. **Load Images**: Click the "Load Images" button
4. **Tag Management**:
   - Click the **X** on any tag pill to remove it
   - Click **+ Add Tag** to add new tags
   - Changes save automatically to the `.txt` files in your image directory
5. **Search**: Use the search bar to filter images by filename or tags

## ✨ Key Features

✅ **Access Any Directory**: Browse images wherever they are on your computer
✅ **No File Moving**: Images stay in their original location
✅ **Quick Access Buttons**: Jump to common folders instantly
✅ **Professional UI**: Modern, gradient design with smooth animations
✅ **Real-time Updates**: Tags save automatically on every change
✅ **Smart Search**: Filter by filename or tags instantly
✅ **Image Statistics**: Track total images and filtered counts
✅ **Responsive Design**: Works on desktop and tablet screens
✅ **Tag Pills**: Beautiful, interactive tag display with removal buttons
✅ **Error Handling**: Clear error messages and loading states
✅ **Hot Reload**: Both frontend and backend support live reloading during development

## 📝 Tag File Format

Each image gets a companion `.txt` file with the same name in the same directory:

```
/Users/leefu/Pictures/
  ├── image1.jpg       →  image1.txt
  ├── photo.png        →  photo.txt
  └── training/
      └── cat.jpg      →  cat.txt
```

Tags are stored as comma-separated values:

```
portrait, female, outdoor, smiling, professional
```

## 🛠️ How It Works

The application uses Docker to run in an isolated environment while accessing your files:

1. **Docker Container**: Runs the backend (Node.js) and frontend (React)
2. **Volume Mount**: Your home directory (`/Users/leefu`) is mounted into the container
3. **File Access**: The app can read/write files anywhere in your home directory
4. **Security**: Only files in `/Users/leefu` are accessible to the container

Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`

## 🔧 Development

### Stop the Application

Press `Ctrl+C` in the terminal, or:

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Changes

```bash
docker-compose down
docker-compose up --build
```

## 🐛 Troubleshooting

### Docker Not Running

If you see "Cannot connect to Docker daemon":
```bash
open -a Docker
# Wait for Docker to start, then try again
docker-compose up --build
```

### Port Already in Use

Edit `/Users/leefu/Documents/LoraShiba/docker-compose.yml` and change the port mappings:

```yaml
ports:
  - "3002:3001"  # Backend
  - "5174:5173"  # Frontend
```

Then access the app at `http://localhost:5174`

### Directory Not Found

1. Verify the path is correct and exists
2. Make sure it's under `/Users/leefu` (the mounted directory)
3. Check file permissions - Docker needs read/write access

### Images Not Loading

1. Check the browser console for errors (F12)
2. View backend logs: `docker-compose logs -f backend`
3. Verify image files have proper extensions

### Tags Not Saving

1. Check write permissions on the directory
2. View backend logs for errors
3. Verify the `.txt` files exist and are writable

### Container Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## 🎯 Tips for Efficient Tagging

1. **Organize First**: Keep similar images in subdirectories
2. **Use Consistent Tags**: Keep a list of standard tags you use
3. **Search Feature**: Use search to find and verify tags across images
4. **Batch Similar Images**: Process similar images together for faster tagging
5. **Quick Access**: Save frequently used paths by bookmarking them in your browser

## 🔐 Security Notes

- The application can only access files within `/Users/leefu`
- All file operations are performed by the Docker container
- No files outside your home directory can be accessed
- The container runs with your user permissions

## 📁 Project Structure

```
.
├── backend/                # Node.js + Express + TypeScript backend
│   ├── src/
│   │   └── server.ts      # API server with file operations
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── DirectorySelector.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   └── ImageCard.tsx
│   │   └── *.css
│   ├── Dockerfile
│   └── vite.config.ts
└── docker-compose.yml      # Orchestrates both services
```

## 🛠️ API Endpoints

### Backend (Port 3001)

- `GET /api/health` - Health check
- `POST /api/scan-directory` - Scan directory for images
  ```json
  {
    "directoryPath": "/Users/leefu/Pictures/images",
    "includeSubfolders": false
  }
  ```
- `POST /api/update-tags` - Update tags for an image
  ```json
  {
    "textFilePath": "/Users/leefu/Pictures/image1.txt",
    "tags": ["tag1", "tag2", "tag3"]
  }
  ```
- `GET /api/image/{encodedPath}` - Serve images from any path

## 💡 Tech Stack

- **Backend**: Node.js 20, Express, TypeScript, fs-extra
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Custom CSS with modern gradients and animations
- **Container**: Docker, Docker Compose
- **File System**: Direct file I/O for `.txt` tag files

## 📄 License

This is a development tool. Use freely for your LORA training projects!

---

**Happy Tagging! 🎨✨**
