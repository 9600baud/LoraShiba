import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import sizeOf from 'image-size';

const app = express();
const PORT = process.env.PORT || 3001;
const HOST_HOME = process.env.HOST_HOME || '/host-home';
// Get the user's home directory from the host machine (passed via docker-compose)
const USER_HOME = process.env.USER_HOME || process.env.HOME || process.env.USERPROFILE || '';

app.use(cors());
app.use(express.json());

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

interface ImageFile {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  tags: string[];
  textFilePath: string;
  width?: number;
  height?: number;
  directory?: string;
}

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.post('/api/list-directory', async (req: Request, res: Response) => {
  try {
    const { directoryPath } = req.body;

    if (!directoryPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    const dockerPath = convertToDockerPath(directoryPath);

    if (!(await fs.pathExists(dockerPath))) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const stat = await fs.stat(dockerPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const items = await fs.readdir(dockerPath);
    const directories: Array<{ name: string; path: string }> = [];

    for (const item of items) {
      if (item.startsWith('.')) continue;

      const itemDockerPath = path.join(dockerPath, item);
      const itemUserPath = path.join(directoryPath, item);

      try {
        const itemStat = await fs.stat(itemDockerPath);
        if (itemStat.isDirectory()) {
          directories.push({ name: item, path: itemUserPath });
        }
      } catch (err) {
        // Skip items we can't read
        continue;
      }
    }

    // Sort directories alphabetically
    directories.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ directories, currentPath: directoryPath });
  } catch (error) {
    console.error('Error listing directory:', error);
    res.status(500).json({ error: 'Failed to list directory' });
  }
});

app.post('/api/scan-directory', async (req: Request, res: Response) => {
  try {
    const { directoryPath, includeSubfolders } = req.body;

    console.log('=== SCAN REQUEST ===');
    console.log('Directory Path:', directoryPath);
    console.log('Include Subfolders:', includeSubfolders);

    if (!directoryPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    const dockerPath = convertToDockerPath(directoryPath);
    console.log('Docker Path:', dockerPath);

    if (!(await fs.pathExists(dockerPath))) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const stat = await fs.stat(dockerPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const images = await scanForImages(dockerPath, directoryPath, includeSubfolders);
    console.log(`Found ${images.length} images (includeSubfolders: ${includeSubfolders})`);
    res.json({ images });
  } catch (error) {
    console.error('Error scanning directory:', error);
    res.status(500).json({ error: 'Failed to scan directory' });
  }
});

app.get('/api/image/:encodedPath(*)', async (req: Request, res: Response) => {
  try {
    const imagePath = decodeURIComponent(req.params.encodedPath);
    const dockerPath = convertToDockerPath(imagePath);

    if (!(await fs.pathExists(dockerPath))) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(dockerPath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

app.post('/api/update-tags', async (req: Request, res: Response) => {
  try {
    const { textFilePath, tags } = req.body;

    if (!textFilePath) {
      return res.status(400).json({ error: 'Text file path is required' });
    }

    const dockerPath = convertToDockerPath(textFilePath);
    const tagsContent = tags.join(', ');

    await fs.writeFile(dockerPath, tagsContent, 'utf-8');
    res.json({ success: true, message: 'Tags updated successfully' });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ error: 'Failed to update tags' });
  }
});

function convertToDockerPath(userPath: string): string {
  // If USER_HOME is set and the path starts with it, convert to docker path
  if (USER_HOME && userPath.startsWith(USER_HOME)) {
    return path.join(HOST_HOME, userPath.replace(USER_HOME, ''));
  }
  return userPath;
}

function convertToUserPath(dockerPath: string): string {
  // Convert docker path back to user path
  if (dockerPath.startsWith(HOST_HOME) && USER_HOME) {
    return path.join(USER_HOME, dockerPath.replace(HOST_HOME, ''));
  }
  return dockerPath;
}

async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number } | null> {
  try {
    const buffer = await fs.readFile(imagePath);
    const dimensions = sizeOf(buffer);
    if (dimensions && dimensions.width && dimensions.height) {
      return { width: dimensions.width, height: dimensions.height };
    }
  } catch (error) {
    console.error('Error reading image dimensions:', error);
  }
  return null;
}

async function scanForImages(
  dockerPath: string,
  userPath: string,
  includeSubfolders: boolean
): Promise<ImageFile[]> {
  const images: ImageFile[] = [];

  async function scan(currentDockerPath: string, currentUserPath: string, depth: number = 0) {
    try {
      const indent = '  '.repeat(depth);
      console.log(`${indent}📁 Scanning: ${currentUserPath}`);

      const items = await fs.readdir(currentDockerPath);
      let imagesInThisDir = 0;

      for (const item of items) {
        if (item.startsWith('.')) continue;

        const itemDockerPath = path.join(currentDockerPath, item);
        const itemUserPath = path.join(currentUserPath, item);

        try {
          const stat = await fs.stat(itemDockerPath);

          if (stat.isDirectory() && includeSubfolders) {
            await scan(itemDockerPath, itemUserPath, depth + 1);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
              const baseName = path.basename(item, ext);
              const textFileName = baseName + '.txt';
              const textFileDockerPath = path.join(path.dirname(itemDockerPath), textFileName);
              const textFileUserPath = path.join(path.dirname(itemUserPath), textFileName);

              if (!(await fs.pathExists(textFileDockerPath))) {
                await fs.writeFile(textFileDockerPath, '', 'utf-8');
              }

              const tagsContent = await fs.readFile(textFileDockerPath, 'utf-8');
              const tags = tagsContent
                .split(',')
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0);

              // Get image dimensions
              const dimensions = await getImageDimensions(itemDockerPath);

              // Extract directory name for grouping
              const directory = path.dirname(itemUserPath);

              images.push({
                id: itemUserPath,
                name: item,
                path: itemUserPath,
                relativePath: itemUserPath,
                tags: tags,
                textFilePath: textFileUserPath,
                width: dimensions?.width,
                height: dimensions?.height,
                directory: directory,
              });
              imagesInThisDir++;
            }
          }
        } catch (err) {
          console.error(`Error processing item ${itemDockerPath}:`, err);
          continue;
        }
      }

      if (imagesInThisDir > 0) {
        console.log(`${indent}   Found ${imagesInThisDir} images in this directory`);
      }
    } catch (err) {
      console.error(`Error scanning directory ${currentDockerPath}:`, err);
      throw err;
    }
  }

  await scan(dockerPath, userPath);
  return images;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Host home mounted at: ${HOST_HOME}`);
});
