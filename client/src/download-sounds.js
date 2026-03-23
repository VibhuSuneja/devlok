import https from 'https';
import fs from 'fs';
import path from 'path';

const sounds = [
  { url: 'https://cdn.pixabay.com/audio/2024/12/16/audio_0ddbf1ce42.mp3', name: 'temple_bell.mp3' },
  { url: 'https://cdn.pixabay.com/audio/2025/03/10/audio_7864ee8e0a.mp3', name: 'om_chant.mp3' },
  { url: 'https://cdn.pixabay.com/audio/2025/04/15/audio_3495260fc4.mp3', name: 'shankh_ritual.mp3' }
];

const targetDir = 'd:/mythology/devlok/client/public/sounds';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

sounds.forEach(sound => {
  const filePath = path.join(targetDir, sound.name);
  const file = fs.createWriteStream(filePath);
  https.get(sound.url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded: ${sound.name}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${sound.name}:`, err.message);
  });
});
